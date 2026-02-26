import { computed, ref } from 'vue'
import { config, musicPlayerConstants } from '../config'

interface LyricLine {
  time: number
  text: string
}

interface Song {
  id: number
  title: string
  artist: string
  name: string
  src: string
  index: number
  lrc?: string
  cover?: string | null
  fallbackCover?: string
}

const DEFAULT_VOLUME = musicPlayerConstants.defaultVolume

function parseLRC(lrcContent: string): LyricLine[] {
  const lines: LyricLine[] = []
  const lrcLines = lrcContent.split('\n')

  for (const line of lrcLines) {
    if (line.startsWith('{') || line.trim() === '') continue

    const match = line.match(/\[(\d{2}):(\d{2})[.:](\d{2,3})\](.*)/)
    if (!match) continue

    const minutes = Number.parseInt(match[1] ?? '0', 10)
    const seconds = Number.parseInt(match[2] ?? '0', 10)
    const ms = Number.parseInt((match[3] ?? '0').padEnd(3, '0'), 10)
    const text = (match[4] ?? '').trim()

    if (!text) continue
    lines.push({ time: minutes * 60 + seconds + ms / 1000, text })
  }

  return lines.sort((a, b) => a.time - b.time)
}



function byteAt(bytes: Uint8Array, index: number): number {
  return bytes[index] ?? 0
}

function toSynchsafeInteger(bytes: Uint8Array, offset: number): number {
  return (
    ((byteAt(bytes, offset) & 0x7f) << 21)
    | ((byteAt(bytes, offset + 1) & 0x7f) << 14)
    | ((byteAt(bytes, offset + 2) & 0x7f) << 7)
    | (byteAt(bytes, offset + 3) & 0x7f)
  )
}

function toBigEndianInteger(bytes: Uint8Array, offset: number): number {
  return (
    (byteAt(bytes, offset) << 24)
    | (byteAt(bytes, offset + 1) << 16)
    | (byteAt(bytes, offset + 2) << 8)
    | byteAt(bytes, offset + 3)
  ) >>> 0
}

function findTextTerminator(data: Uint8Array, start: number, isUtf16: boolean): number {
  if (!isUtf16) {
    for (let i = start; i < data.length; i += 1) {
      if (data[i] === 0x00) return i
    }
    return data.length
  }

  for (let i = start; i + 1 < data.length; i += 2) {
    if (data[i] === 0x00 && data[i + 1] === 0x00) return i
  }
  return data.length
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return btoa(binary)
}

function parseApicFrame(frameData: Uint8Array): string | null {
  if (frameData.length < 8) return null

  const textEncoding = frameData[0]
  const isUtf16 = textEncoding === 1 || textEncoding === 2
  let cursor = 1

  const mimeEnd = frameData.indexOf(0x00, cursor)
  if (mimeEnd <= cursor) return null

  let mime = String.fromCharCode(...frameData.subarray(cursor, mimeEnd)).trim().toLowerCase()
  cursor = mimeEnd + 1

  if (cursor >= frameData.length) return null
  cursor += 1

  const descriptionEnd = findTextTerminator(frameData, cursor, isUtf16)
  if (descriptionEnd < frameData.length) {
    cursor = descriptionEnd + (isUtf16 ? 2 : 1)
  } else {
    cursor = descriptionEnd
  }

  if (cursor >= frameData.length) return null

  if (mime === 'image/jpg') mime = 'image/jpeg'
  if (!mime.startsWith('image/')) mime = 'image/jpeg'

  const pictureData = frameData.subarray(cursor)
  if (pictureData.length === 0) return null

  return `data:${mime};base64,${bytesToBase64(pictureData)}`
}

function extractCoverFromId3Tag(buffer: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buffer)
  if (bytes.length < 10) return null
  if (String.fromCharCode(...bytes.subarray(0, 3)) !== 'ID3') return null

  const version = bytes[3] ?? 0
  const flags = bytes[5] ?? 0
  const tagSize = toSynchsafeInteger(bytes, 6)
  const tagEnd = Math.min(bytes.length, 10 + tagSize)

  let offset = 10

  if (flags & 0x40) {
    if (version === 4) {
      const extHeaderSize = toSynchsafeInteger(bytes, offset)
      offset += extHeaderSize
    } else if (version === 3) {
      const extHeaderSize = toBigEndianInteger(bytes, offset)
      offset += 4 + extHeaderSize
    }
  }

  if (version >= 3) {
    while (offset + 10 <= tagEnd) {
      const frameId = String.fromCharCode(...bytes.subarray(offset, offset + 4))
      const frameSize = version === 4
        ? toSynchsafeInteger(bytes, offset + 4)
        : toBigEndianInteger(bytes, offset + 4)

      if (!frameId.trim() || frameSize <= 0) break

      const frameStart = offset + 10
      const frameEnd = frameStart + frameSize
      if (frameEnd > tagEnd) break

      if (frameId === 'APIC') {
        return parseApicFrame(bytes.subarray(frameStart, frameEnd))
      }

      offset = frameEnd
    }
  }

  return null
}

const playlist = ref<Song[]>([])
const currentSongIndex = ref(-1)
const isPlaying = ref(false)
const isLoading = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(DEFAULT_VOLUME)
const lyrics = ref<LyricLine[]>([])
const currentLyricIndex = ref(-1)
const isShuffle = ref(false)

const coverCache = new Map<string, string | null>()

let audio: HTMLAudioElement | null = null
let lyricRequestId = 0
let lastNonZeroVolume = DEFAULT_VOLUME

function initAudio() {
  if (audio) return audio

  audio = new Audio()
  audio.volume = volume.value

  audio.addEventListener('timeupdate', () => {
    currentTime.value = audio?.currentTime || 0
    updateCurrentLyric()
  })

  audio.addEventListener('loadedmetadata', () => {
    duration.value = audio?.duration || 0
  })

  audio.addEventListener('ended', () => {
    nextSong()
  })

  audio.addEventListener('error', () => {
    if (playlist.value.length > 1) {
      window.setTimeout(() => nextSong(), musicPlayerConstants.errorRetryDelay)
    }
  })

  return audio
}

function updateCurrentLyric() {
  if (lyrics.value.length === 0) {
    currentLyricIndex.value = -1
    return
  }

  const time = currentTime.value
  let index = -1
  for (let i = 0; i < lyrics.value.length; i += 1) {
    const lyricLine = lyrics.value[i]
    if (!lyricLine) continue

    if (lyricLine.time <= time) {
      index = i
    } else {
      break
    }
  }

  currentLyricIndex.value = index
}

async function loadLyrics(lrcPath?: string) {
  const requestId = ++lyricRequestId
  lyrics.value = []
  currentLyricIndex.value = -1

  if (!lrcPath) return

  try {
    const response = await fetch(lrcPath, { cache: 'force-cache' })
    if (!response.ok) return

    const text = await response.text()
    if (requestId !== lyricRequestId) return

    lyrics.value = parseLRC(text)
  } catch (error) {
    console.error('Failed to load lyrics:', error)
  }
}

async function extractEmbeddedCover(src: string): Promise<string | null> {
  if (coverCache.has(src)) return coverCache.get(src) ?? null

  try {
    const response = await fetch(src, { cache: 'force-cache' })
    if (!response.ok) {
      coverCache.set(src, null)
      return null
    }

    const buffer = await response.arrayBuffer()
    const cover = extractCoverFromId3Tag(buffer)
    coverCache.set(src, cover)
    return cover
  } catch (error) {
    console.error('Failed to read embedded cover:', error)
    coverCache.set(src, null)
    return null
  }
}

async function resolveSongCover(song: Song) {
  if (song.cover !== undefined) return

  const embeddedCover = await extractEmbeddedCover(song.src)
  song.cover = embeddedCover ?? song.fallbackCover ?? null
}

async function fetchOnlineSongs(startIndex: number): Promise<Song[]> {
  try {
    const response = await fetch(config.api.getApiUrl(), { cache: 'no-cache' })
    if (!response.ok) return []

    const data = await response.json()
    if (!data || !data.data || !data.data.list) return []

    return data.data.list.map((item: any, idx: number) => ({
      id: item.id,
      title: item.title,
      artist: item.artist,
      name: item.name,
      src: item.url,
      lrc: item.lrc,
      index: startIndex + idx,
      cover: undefined
    }))
  } catch (error) {
    console.error('Failed to fetch online playlist:', error)
    return []
  }
}



async function fetchPlaylist() {
  isLoading.value = true

  try {
    const onlineSongs = await fetchOnlineSongs(0)
    playlist.value = onlineSongs

    if (onlineSongs.length === 0) {
      currentSongIndex.value = -1
      return
    }

    if (currentSongIndex.value < 0 || currentSongIndex.value >= onlineSongs.length) {
      currentSongIndex.value = 0
    }

    loadSong(currentSongIndex.value)
  } finally {
    isLoading.value = false
  }
}

function loadSong(index?: number) {
  const aud = initAudio()
  if (playlist.value.length === 0) return

  if (index !== undefined) {
    currentSongIndex.value = index
  }

  if (currentSongIndex.value < 0 || currentSongIndex.value >= playlist.value.length) return

  const song = playlist.value[currentSongIndex.value]
  if (!song) return
  aud.src = song.src
  currentTime.value = 0
  duration.value = 0

  void loadLyrics(song.lrc)
  void resolveSongCover(song)
}

function playSong() {
  const aud = initAudio()
  if (!aud.src && playlist.value.length > 0) {
    loadSong(currentSongIndex.value >= 0 ? currentSongIndex.value : 0)
  }

  aud.play()
    .then(() => {
      isPlaying.value = true
    })
    .catch((error) => {
      console.error('Failed to play song:', error)
    })
}

function pauseSong() {
  const aud = initAudio()
  aud.pause()
  isPlaying.value = false
}

function togglePlayPause() {
  if (isPlaying.value) {
    pauseSong()
  } else {
    playSong()
  }
}

function getRandomIndex(): number {
  if (playlist.value.length <= 1) return currentSongIndex.value

  let index = currentSongIndex.value
  while (index === currentSongIndex.value) {
    index = Math.floor(Math.random() * playlist.value.length)
  }
  return index
}

function prevSong() {
  if (playlist.value.length === 0) return

  currentSongIndex.value = (currentSongIndex.value - 1 + playlist.value.length) % playlist.value.length
  loadSong()
  if (isPlaying.value) playSong()
}

function nextSong() {
  if (playlist.value.length === 0) return

  if (isShuffle.value) {
    currentSongIndex.value = getRandomIndex()
  } else {
    currentSongIndex.value = (currentSongIndex.value + 1) % playlist.value.length
  }

  loadSong()
  if (isPlaying.value) playSong()
}

function seekTo(time: number) {
  const aud = initAudio()
  if (!Number.isFinite(aud.duration)) return
  aud.currentTime = Math.max(0, Math.min(time, aud.duration))
}

function seekToPercent(percent: number) {
  const aud = initAudio()
  if (!Number.isFinite(aud.duration)) return
  const normalizedPercent = Math.max(0, Math.min(percent, 1))
  aud.currentTime = aud.duration * normalizedPercent
}

function setVolume(val: number) {
  const normalized = Math.max(0, Math.min(val, 1))
  volume.value = normalized
  if (normalized > 0) {
    lastNonZeroVolume = normalized
  }
  if (audio) {
    audio.volume = normalized
  }
}

function toggleMute() {
  if (volume.value === 0) {
    setVolume(lastNonZeroVolume || DEFAULT_VOLUME)
  } else {
    setVolume(0)
  }
}

function toggleShuffle() {
  isShuffle.value = !isShuffle.value
}

const currentSong = computed(() => {
  if (currentSongIndex.value < 0 || currentSongIndex.value >= playlist.value.length) {
    return null
  }
  return playlist.value[currentSongIndex.value]
})

const progress = computed(() => {
  if (duration.value <= 0) return 0
  return (currentTime.value / duration.value) * 100
})

const currentLyric = computed(() => {
  if (currentLyricIndex.value < 0 || currentLyricIndex.value >= lyrics.value.length) {
    return ''
  }
  return lyrics.value[currentLyricIndex.value]?.text ?? ''
})

export function useMusicPlayer() {
  return {
    playlist,
    currentSong,
    currentSongIndex,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    progress,
    lyrics,
    currentLyricIndex,
    currentLyric,
    isShuffle,
    fetchPlaylist,
    loadSong,
    playSong,
    pauseSong,
    togglePlayPause,
    prevSong,
    nextSong,
    seekTo,
    seekToPercent,
    setVolume,
    toggleMute,
    toggleShuffle,
    initAudio
  }
}
