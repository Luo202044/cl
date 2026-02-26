<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useMusicPlayer } from '../composables/useMusicPlayer'
import { musicPlayerConstants } from '../config'

const {
  playlist,
  currentSong,
  currentSongIndex,
  isPlaying,
  isLoading,
  currentTime,
  duration,
  progress,
  volume,
  lyrics,
  currentLyricIndex,
  isShuffle,
  fetchPlaylist,
  togglePlayPause,
  prevSong,
  nextSong,
  seekToPercent,
  initAudio,
  loadSong,
  playSong,
  toggleMute,
  toggleShuffle,
  setVolume
} = useMusicPlayer()

const isExpanded = ref(false)
const showPlaylist = ref(false)
const showLyrics = ref(false)
const lyricsContainer = ref<HTMLElement | null>(null)
const previewLyricsContainer = ref<HTMLElement | null>(null)
const coverImageError = ref(false)

const isPanelExpanded = computed(() => isExpanded.value || showPlaylist.value || showLyrics.value)

function formatTime(seconds: number): string {
  if (!seconds || Number.isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
  if (!isExpanded.value) {
    showPlaylist.value = false
    showLyrics.value = false
  }
}

function openPlaylist() {
  showPlaylist.value = true
  showLyrics.value = false
  isExpanded.value = true
}

function openLyrics() {
  showLyrics.value = true
  showPlaylist.value = false
  isExpanded.value = true
}

function goBack() {
  showPlaylist.value = false
  showLyrics.value = false
  isExpanded.value = true
}

function handleProgressClick(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  seekToPercent(percent)
}

function playFromPlaylist(index: number) {
  loadSong(index)
  playSong()
}

function handleCoverError() {
  coverImageError.value = true
}

const volumeIcon = computed(() => {
  if (volume.value === 0) return 'fa-volume-mute'
  if (volume.value > 0.5) return 'fa-volume-up'
  return 'fa-volume-down'
})

const statusText = computed(() => {
  if (isLoading.value) return '加载中...'
  if (playlist.value.length === 0) return '暂无音乐'
  if (isPlaying.value && isShuffle.value) return '播放中 · 随机'
  if (isPlaying.value) return '播放中'
  return `${playlist.value.length} 首歌曲`
})

const showCoverImage = computed(() => currentSong.value?.cover && !coverImageError.value)

function scrollLyricsPanelToActive() {
  nextTick(() => {
    if (!lyricsContainer.value) return
    const activeEl = lyricsContainer.value.querySelector('.lyrics-item.active') as HTMLElement | null
    if (!activeEl) return

    const container = lyricsContainer.value
    const containerHeight = container.clientHeight
    const elementTop = activeEl.offsetTop
    const elementHeight = activeEl.clientHeight
    const target = elementTop - containerHeight / 2 + elementHeight / 2
    container.scrollTo({ top: Math.max(target, 0), behavior: 'smooth' })
  })
}

function scrollPreviewToActive() {
  nextTick(() => {
    if (!previewLyricsContainer.value) return
    const container = previewLyricsContainer.value
    const activeEl = container.querySelector('.preview-line.active') as HTMLElement | null

    if (!activeEl) {
      container.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const containerHeight = container.clientHeight
    const elementTop = activeEl.offsetTop
    const elementHeight = activeEl.clientHeight
    const target = elementTop - containerHeight / 2 + elementHeight / 2
    container.scrollTo({ top: Math.max(target, 0), behavior: 'smooth' })
  })
}

watch(currentLyricIndex, () => {
  scrollPreviewToActive()
  if (showLyrics.value) {
    scrollLyricsPanelToActive()
  }
})

watch(lyrics, () => {
  scrollPreviewToActive()
  if (showLyrics.value) {
    scrollLyricsPanelToActive()
  }
})

watch(showLyrics, (value) => {
  if (value) {
    window.setTimeout(scrollLyricsPanelToActive, musicPlayerConstants.scrollDelay)
  }
})

watch(currentSong, () => {
  coverImageError.value = false
})

onMounted(() => {
  initAudio()
  fetchPlaylist()
})
</script>

<template>
  <div :class="['music-player', { expanded: isPanelExpanded }]">
    <div class="player-handle" @click="toggleExpanded">
      <i :class="['fas', isPanelExpanded ? 'fa-chevron-right' : 'fa-chevron-left']"></i>
    </div>

    <div class="player-content">
      <div v-if="!showPlaylist && !showLyrics" class="main-player">
        <div class="avatar-section">
          <div class="avatar-wrapper" :class="{ spinning: isPlaying }">
            <img
              v-if="showCoverImage"
              :src="currentSong!.cover!"
              :alt="currentSong!.title"
              class="avatar-image"
              @error="handleCoverError"
            />
            <div v-else class="avatar-placeholder">
              <i class="fas fa-user-circle"></i>
            </div>
          </div>
        </div>

        <div class="song-info">
          <div class="song-title">{{ currentSong?.title || '等待加载歌曲...' }}</div>
          <div class="song-artist">{{ currentSong?.artist || '音乐库' }}</div>
        </div>

        <div class="lyrics-preview">
          <div v-if="lyrics.length > 0" ref="previewLyricsContainer" class="lyrics-preview-scroll">
            <div class="lyrics-preview-track">
              <div
                v-for="(line, index) in lyrics"
                :key="`${index}-${line.time}`"
                :class="['lyric-line', 'preview-line', { active: index === currentLyricIndex }]"
              >
                {{ line.text }}
              </div>
            </div>
          </div>
          <div v-else class="no-lyrics-text">暂无歌词</div>
        </div>

        <div class="progress-section">
          <div class="progress-bar" @click="handleProgressClick">
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>
          <div class="time-display">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>

        <div class="controls-section">
          <button class="control-btn" @click="openPlaylist" title="歌曲列表">
            <i class="fas fa-list"></i>
          </button>
          <button class="control-btn" @click="prevSong" title="上一首">
            <i class="fas fa-step-backward"></i>
          </button>
          <button class="control-btn play-btn" @click="togglePlayPause" :title="isPlaying ? '暂停' : '播放'">
            <i :class="['fas', isPlaying ? 'fa-pause' : 'fa-play']"></i>
          </button>
          <button class="control-btn" @click="nextSong" title="下一首">
            <i class="fas fa-step-forward"></i>
          </button>
          <div class="volume-control">
            <button class="control-btn" @click="toggleMute" :title="volume === 0 ? '恢复音量' : '静音'">
              <i :class="['fas', volumeIcon]"></i>
            </button>
            <div class="volume-slider-container">
              <input
                type="range"
                class="volume-slider"
                min="0"
                max="1"
                step="0.01"
                :value="volume"
                @input="(e) => setVolume(Number((e.target as HTMLInputElement).value))"
              />
            </div>
          </div>
        </div>

        <div class="bottom-section">
          <button class="lyrics-btn" @click="openLyrics">
            <i class="fas fa-align-left"></i>
            <span>歌词列表</span>
          </button>
          <div class="status-text" :class="{ playing: isPlaying }">{{ statusText }}</div>
        </div>
      </div>

      <div v-if="showPlaylist" class="panel">
        <div class="panel-header">
          <button class="back-btn" @click="goBack">
            <i class="fas fa-arrow-left"></i>
            <span>返回</span>
          </button>

          <div class="panel-head-meta">
            <span class="panel-title">歌曲列表</span>
            <span class="panel-count">{{ playlist.length }} 首</span>
          </div>

          <button class="shuffle-btn" :class="{ active: isShuffle }" @click="toggleShuffle" title="随机播放">
            <i class="fas fa-random"></i>
            <span>{{ isShuffle ? '随机开' : '随机' }}</span>
          </button>
        </div>

        <div class="panel-content">
          <div
            v-for="(song, index) in playlist"
            :key="`${song.name || song.title}-${index}`"
            :class="['playlist-item', { active: index === currentSongIndex }]"
            @click="playFromPlaylist(index)"
          >
            <div class="item-number">
              <i v-if="index === currentSongIndex && isPlaying" class="fas fa-volume-up playing-icon"></i>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="item-info">
              <div class="item-title">{{ song.title }}</div>
              <div class="item-artist">{{ song.artist }}</div>
            </div>
            <div v-if="index === currentSongIndex && isPlaying" class="playing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>

          <div v-if="playlist.length === 0" class="empty-state">
            <i class="fas fa-music"></i>
            <span>暂无歌曲</span>
          </div>
        </div>
      </div>

      <div v-if="showLyrics" class="panel">
        <div class="panel-header">
          <button class="back-btn" @click="goBack">
            <i class="fas fa-arrow-left"></i>
            <span>返回</span>
          </button>

          <div class="panel-head-meta">
            <span class="panel-title">歌词</span>
            <span class="panel-count song-label">{{ currentSong?.title || '当前歌曲' }}</span>
          </div>

          <div class="panel-header-spacer"></div>
        </div>

        <div ref="lyricsContainer" class="lyrics-scroll">
          <div v-if="lyrics.length > 0" class="lyrics-list">
            <div
              v-for="(line, index) in lyrics"
              :key="`${line.time}-${index}`"
              :class="['lyrics-item', { active: index === currentLyricIndex }]"
            >
              {{ line.text }}
            </div>
          </div>

          <div v-else class="empty-state">
            <i class="fas fa-file-alt"></i>
            <span>暂无歌词</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.music-player {
  position: fixed;
  top: 50%;
  right: -290px;
  transform: translateY(-50%);
  z-index: 10000;
  display: flex;
  transition: right 0.3s ease;
}

.music-player.expanded {
  right: 0;
}

.player-handle {
  width: 22px;
  min-height: 160px;
  background: linear-gradient(180deg, #ff7a59, #ff4f9a);
  border-radius: 10px 0 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: -3px 0 10px rgba(255, 79, 154, 0.35);
  transition: all 0.2s ease;
}

.player-handle:hover {
  width: 26px;
  background: linear-gradient(180deg, #ff6c4a, #ff3f8d);
}

.player-handle i {
  color: #ffffff;
  font-size: 14px;
}

.player-content {
  width: 290px;
  height: 500px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border-radius: 16px 0 0 16px;
  box-shadow: -6px 0 26px rgba(0, 0, 0, 0.18);
  border-left: 2px solid var(--primary);
  overflow: hidden;
}

.main-player {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.avatar-section {
  display: flex;
  justify-content: center;
  padding-top: 4px;
}

.avatar-wrapper {
  width: 124px;
  height: 124px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 8px 24px rgba(255, 79, 154, 0.3);
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.5), rgba(255, 79, 154, 0.35));
}

.avatar-wrapper.spinning {
  animation: slow-spin 20s linear infinite;
}

@keyframes slow-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 52px;
}

.song-info {
  text-align: center;
  margin-top: 12px;
}

.song-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-sub);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-main);
  opacity: 0.72;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lyrics-preview {
  margin-top: 12px;
  height: 126px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.lyrics-preview-scroll {
  height: 108px;
  width: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
}

.lyrics-preview-scroll::-webkit-scrollbar {
  display: none;
}

.lyrics-preview-track {
  padding: 40px 0;
}

.lyric-line {
  min-height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  text-align: center;
  font-size: 13px;
  line-height: 1.4;
  color: var(--text-main);
  opacity: 0.35;
  transition: all 0.25s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lyric-line.active {
  opacity: 1;
  color: var(--primary);
  font-weight: 700;
  font-size: 15px;
}

.no-lyrics-text {
  font-size: 12px;
  color: var(--text-main);
  opacity: 0.45;
}

.progress-section {
  padding-top: 8px;
}

.progress-bar {
  height: 6px;
  background: var(--secondary);
  border-radius: 3px;
  cursor: pointer;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: 3px;
  transition: width 0.1s linear;
}

.time-display {
  margin-top: 6px;
  font-size: 11px;
  color: var(--text-sub);
  display: flex;
  justify-content: space-between;
}

.controls-section {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.control-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: var(--secondary);
  color: var(--text-sub);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: var(--primary-light);
  color: var(--primary);
}

.control-btn.play-btn {
  width: 50px;
  height: 50px;
  background: var(--gradient-primary);
  color: #ffffff;
  font-size: 18px;
}

.control-btn.play-btn:hover {
  transform: scale(1.04);
  box-shadow: 0 6px 18px var(--primary-glow);
}

.volume-control {
  position: relative;
  display: flex;
  align-items: center;
}

.volume-slider-container {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-4px);
  padding: 8px 6px;
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  z-index: 100;
}

.volume-control:hover .volume-slider-container {
  opacity: 1;
  visibility: visible;
}

.volume-slider {
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--secondary);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 2px 8px var(--primary-glow);
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.bottom-section {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 10px;
}

.lyrics-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 20px;
  border: none;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lyrics-btn:hover {
  background: var(--primary);
  color: #ffffff;
}

.status-text {
  font-size: 11px;
  color: var(--text-main);
  opacity: 0.65;
}

.status-text.playing {
  color: var(--primary);
  opacity: 1;
  animation: pulse 1.6s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 12px;
  border-bottom: 1px solid var(--glass-border);
}

.back-btn {
  height: 32px;
  border: none;
  border-radius: 16px;
  padding: 0 10px;
  background: var(--primary-light);
  color: var(--primary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--primary);
  color: #ffffff;
}

.panel-head-meta {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.panel-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-sub);
}

.panel-count {
  font-size: 11px;
  color: var(--text-main);
  opacity: 0.65;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-label {
  max-width: 120px;
}

.panel-header-spacer {
  width: 72px;
}

.shuffle-btn {
  height: 32px;
  border: none;
  border-radius: 16px;
  padding: 0 10px;
  background: var(--secondary);
  color: var(--text-sub);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.shuffle-btn.active {
  background: var(--primary);
  color: #ffffff;
}

.shuffle-btn:not(.active):hover {
  background: var(--primary-light);
  color: var(--primary);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.playlist-item:hover {
  background: var(--hover-bg);
}

.playlist-item.active {
  background: var(--primary-light);
}

.item-number {
  width: 24px;
  text-align: center;
  color: var(--text-main);
  opacity: 0.6;
  font-size: 12px;
}

.playlist-item.active .item-number {
  opacity: 1;
  color: var(--primary);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 13px;
  color: var(--text-sub);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-artist {
  margin-top: 2px;
  font-size: 11px;
  color: var(--text-main);
  opacity: 0.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-item.active .item-title {
  color: var(--primary);
}

.playing-icon {
  animation: pulse-icon 1s ease-in-out infinite;
}

@keyframes pulse-icon {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.65;
    transform: scale(0.88);
  }
}

.playing-indicator {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 14px;
}

.playing-indicator span {
  width: 3px;
  border-radius: 2px;
  background: var(--primary);
  animation: bounce 0.7s ease-in-out infinite;
}

.playing-indicator span:nth-child(1) {
  height: 40%;
  animation-delay: 0s;
}

.playing-indicator span:nth-child(2) {
  height: 70%;
  animation-delay: 0.15s;
}

.playing-indicator span:nth-child(3) {
  height: 50%;
  animation-delay: 0.3s;
}

@keyframes bounce {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.5);
  }
}

.lyrics-scroll {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
  padding: 14px;
}

.lyrics-list {
  padding: 130px 0;
}

.lyrics-item {
  min-height: 40px;
  padding: 8px;
  text-align: center;
  font-size: 14px;
  line-height: 1.45;
  color: var(--text-main);
  opacity: 0.38;
  transition: all 0.25s ease;
}

.lyrics-item.active {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
  opacity: 1;
}

.empty-state {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-main);
  opacity: 0.45;
}

.empty-state i {
  font-size: 36px;
}

.empty-state span {
  font-size: 13px;
}

.panel-content::-webkit-scrollbar,
.lyrics-scroll::-webkit-scrollbar {
  width: 4px;
}

.panel-content::-webkit-scrollbar-track,
.lyrics-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.panel-content::-webkit-scrollbar-thumb,
.lyrics-scroll::-webkit-scrollbar-thumb {
  border-radius: 2px;
  background: var(--primary);
}

@media (max-width: 768px) {
  .player-content {
    width: 268px;
    height: 470px;
  }

  .music-player {
    right: -268px;
  }

  .avatar-wrapper {
    width: 112px;
    height: 112px;
  }

  .controls-section {
    gap: 8px;
  }

  .control-btn {
    width: 36px;
    height: 36px;
  }

  .control-btn.play-btn {
    width: 46px;
    height: 46px;
  }

  .volume-control {
    position: relative;
  }

  .volume-slider-container {
    left: 50%;
    right: auto;
    transform: translateX(-50%) translateY(-4px);
  }
}

@media (max-width: 480px) {
  .player-content {
    width: 240px;
    height: 440px;
  }

  .music-player {
    right: -240px;
  }

  .player-handle {
    width: 18px;
    min-height: 120px;
  }

  .player-handle:hover {
    width: 22px;
  }

  .avatar-wrapper {
    width: 100px;
    height: 100px;
  }

  .song-title {
    font-size: 14px;
  }

  .song-artist {
    font-size: 11px;
  }

  .controls-section {
    gap: 6px;
  }

  .control-btn {
    width: 34px;
    height: 34px;
    font-size: 12px;
  }

  .control-btn.play-btn {
    width: 44px;
    height: 44px;
    font-size: 16px;
  }

  .volume-control {
    position: relative;
  }

  .volume-slider-container {
    left: 50%;
    right: auto;
    transform: translateX(-50%) translateY(-4px);
    padding: 6px 4px;
  }

  .volume-slider {
    width: 80px;
  }

  .lyrics-preview {
    height: 100px;
  }

  .lyrics-preview-scroll {
    height: 90px;
  }

  .bottom-section {
    padding-top: 8px;
  }

  .lyrics-btn {
    padding: 6px 14px;
    font-size: 11px;
  }

  .status-text {
    font-size: 10px;
  }
}
</style>
