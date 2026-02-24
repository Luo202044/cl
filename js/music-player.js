const CONFIG = {
  api: {
    baseUrl: 'https://classinapi.pages.dev/',
    apiFile: 'api.txt',
    getApiUrl() {
      return `${this.baseUrl}${this.apiFile}`;
    },
    getMusicUrl(filename) {
      return `${this.baseUrl}music/${encodeURIComponent(filename.trim())}`;
    }
  }
};

const ERROR_RETRY_DELAY = 500;
const DEFAULT_VOLUME = 0.7;
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];

let playlist = [];
let currentSongIndex = -1;
let isPlaying = false;
let isLoading = false;
let currentTime = 0;
let duration = 0;
let volume = DEFAULT_VOLUME;
let isShuffle = false;

let audio = null;
let lastNonZeroVolume = DEFAULT_VOLUME;

function getFriendlyDisplayName(filename) {
  const filenameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const normalized = filenameWithoutExt
    .replace(/[_]/g, ' ')
    .replace(/\^\d+[\s.-]*/, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) return filenameWithoutExt;

  const dashedParts = normalized.split(' - ').map(part => part.trim()).filter(Boolean);
  if (dashedParts.length >= 2) return dashedParts[1] || normalized;
  return normalized;
}

function getArtistFromFilename(filename) {
  const filenameWithoutExt = filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ').trim();
  const dashedParts = filenameWithoutExt.split(' - ').map(part => part.trim()).filter(Boolean);
  return dashedParts.length >= 2 ? (dashedParts[0] || 'Online Music') : 'Online Music';
}

function isAudioFile(path) {
  const ext = path.split('.').pop()?.toLowerCase();
  return ext && AUDIO_EXTENSIONS.includes(ext);
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function initAudio() {
  if (audio) return audio;

  audio = new Audio();
  audio.volume = volume;

  audio.addEventListener('timeupdate', () => {
    currentTime = audio?.currentTime || 0;
    updateProgressUI();
  });

  audio.addEventListener('loadedmetadata', () => {
    duration = audio?.duration || 0;
    updateDurationUI();
  });

  audio.addEventListener('ended', () => {
    nextSong();
  });

  audio.addEventListener('error', () => {
    if (playlist.length > 1) {
      setTimeout(() => nextSong(), ERROR_RETRY_DELAY);
    }
  });

  return audio;
}

function updateProgressUI() {
  const progressFill = document.getElementById('progressFill');
  const currentTimeEl = document.getElementById('currentTime');
  
  if (progressFill) {
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    progressFill.style.width = `${progress}%`;
  }
  
  if (currentTimeEl) {
    currentTimeEl.textContent = formatTime(currentTime);
  }
}

function updateDurationUI() {
  const durationEl = document.getElementById('duration');
  if (durationEl) {
    durationEl.textContent = formatTime(duration);
  }
}

async function fetchOnlineSongs(startIndex) {
  try {
    const response = await fetch(CONFIG.api.getApiUrl(), { cache: 'no-cache' });
    if (!response.ok) return [];

    const content = await response.text();
    const filenames = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && isAudioFile(line));

    return filenames.map((filename, idx) => {
      return {
        title: getFriendlyDisplayName(filename),
        artist: getArtistFromFilename(filename),
        filename: filename,
        src: CONFIG.api.getMusicUrl(filename),
        index: startIndex + idx
      };
    });
  } catch (error) {
    console.error('Failed to fetch online playlist:', error);
    return [];
  }
}

async function fetchPlaylist() {
  isLoading = true;
  updateStatusText();

  try {
    const onlineSongs = await fetchOnlineSongs(0);
    
    onlineSongs.forEach((song, idx) => {
      song.index = idx;
    });
    
    playlist = onlineSongs;

    if (onlineSongs.length === 0) {
      currentSongIndex = -1;
      updateStatusText();
      return;
    }

    if (currentSongIndex < 0 || currentSongIndex >= onlineSongs.length) {
      currentSongIndex = 0;
    }

    loadSong(currentSongIndex);
    renderPlaylist();
  } finally {
    isLoading = false;
    updateStatusText();
  }
}

function loadSong(index) {
  const aud = initAudio();
  if (playlist.length === 0) return;

  if (index !== undefined) {
    currentSongIndex = index;
  }

  if (currentSongIndex < 0 || currentSongIndex >= playlist.length) return;

  const song = playlist[currentSongIndex];
  if (!song) return;
  
  aud.src = song.src;
  currentTime = 0;
  duration = 0;
  updateProgressUI();
  updateDurationUI();

  updateSongInfo(song);
}

function updateSongInfo(song) {
  const titleEl = document.getElementById('songTitle');
  const artistEl = document.getElementById('songArtist');
  
  if (titleEl) titleEl.textContent = song?.title || '等待加载歌曲...';
  if (artistEl) artistEl.textContent = song?.artist || '音乐库';
}

function playSong() {
  const aud = initAudio();
  if (!aud.src && playlist.length > 0) {
    loadSong(currentSongIndex >= 0 ? currentSongIndex : 0);
  }

  aud.play()
    .then(() => {
      isPlaying = true;
      updatePlayButton();
      updateStatusText();
    })
    .catch((error) => {
      console.error('Failed to play song:', error);
    });
}

function pauseSong() {
  const aud = initAudio();
  aud.pause();
  isPlaying = false;
  updatePlayButton();
  updateStatusText();
}

function togglePlayPause() {
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
}

function updatePlayButton() {
  const playBtn = document.getElementById('playBtn');
  if (playBtn) {
    const icon = playBtn.querySelector('i');
    if (icon) {
      icon.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }
    playBtn.title = isPlaying ? '暂停' : '播放';
  }
}

function updateStatusText() {
  const statusEl = document.getElementById('statusText');
  if (!statusEl) return;
  
  let text = '';
  if (isLoading) {
    text = '加载中...';
  } else if (playlist.length === 0) {
    text = '暂无音乐';
  } else if (isPlaying && isShuffle) {
    text = '播放中 · 随机';
  } else if (isPlaying) {
    text = '播放中';
  } else {
    text = `${playlist.length} 首歌曲`;
  }
  
  statusEl.textContent = text;
  statusEl.classList.toggle('playing', isPlaying);
}

function getRandomIndex() {
  if (playlist.length <= 1) return currentSongIndex;

  let index = currentSongIndex;
  while (index === currentSongIndex) {
    index = Math.floor(Math.random() * playlist.length);
  }
  return index;
}

function prevSong() {
  if (playlist.length === 0) return;

  currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
  loadSong();
  if (isPlaying) playSong();
  renderPlaylist();
}

function nextSong() {
  if (playlist.length === 0) return;

  if (isShuffle) {
    currentSongIndex = getRandomIndex();
  } else {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
  }

  loadSong();
  if (isPlaying) playSong();
  renderPlaylist();
}

function seekToPercent(percent) {
  const aud = initAudio();
  if (!isFinite(aud.duration)) return;
  const normalizedPercent = Math.max(0, Math.min(percent, 1));
  aud.currentTime = aud.duration * normalizedPercent;
}

function setVolume(val) {
  const normalized = Math.max(0, Math.min(val, 1));
  volume = normalized;
  if (normalized > 0) {
    lastNonZeroVolume = normalized;
  }
  if (audio) {
    audio.volume = normalized;
  }
  updateVolumeIcon();
}

function toggleMute() {
  if (volume === 0) {
    setVolume(lastNonZeroVolume || DEFAULT_VOLUME);
  } else {
    setVolume(0);
  }
}

function updateVolumeIcon() {
  const volumeBtn = document.getElementById('volumeBtn');
  if (!volumeBtn) return;
  
  const icon = volumeBtn.querySelector('i');
  if (!icon) return;
  
  let iconClass = 'fa-volume-up';
  if (volume === 0) iconClass = 'fa-volume-mute';
  else if (volume <= 0.5) iconClass = 'fa-volume-down';
  
  icon.className = `fas ${iconClass}`;
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  updateShuffleButton();
  updateStatusText();
}

function updateShuffleButton() {
  const shuffleBtn = document.getElementById('shuffleBtn');
  if (shuffleBtn) {
    shuffleBtn.classList.toggle('active', isShuffle);
    const span = shuffleBtn.querySelector('span');
    if (span) {
      span.textContent = isShuffle ? '随机开' : '随机';
    }
  }
}

function renderPlaylist() {
  const content = document.getElementById('playlistContent');
  const countEl = document.getElementById('playlistCount');
  
  if (countEl) {
    countEl.textContent = `${playlist.length} 首`;
  }
  
  if (!content) return;
  
  if (playlist.length === 0) {
    content.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-music"></i>
        <span>暂无歌曲</span>
      </div>
    `;
    return;
  }
  
  content.innerHTML = playlist.map((song, index) => `
    <div class="playlist-item ${index === currentSongIndex ? 'active' : ''}" data-index="${index}">
      <div class="item-number">
        ${index === currentSongIndex && isPlaying 
          ? '<i class="fas fa-volume-up playing-icon"></i>' 
          : `<span>${index + 1}</span>`}
      </div>
      <div class="item-info">
        <div class="item-title">${song.title}</div>
        <div class="item-artist">${song.artist}</div>
      </div>
      ${index === currentSongIndex && isPlaying ? `
        <div class="playing-indicator">
          <span></span><span></span><span></span>
        </div>
      ` : ''}
    </div>
  `).join('');
  
  content.querySelectorAll('.playlist-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = parseInt(item.dataset.index);
      if (!isNaN(index)) {
        loadSong(index);
        playSong();
      }
    });
  });
}

function toggleExpanded() {
  const player = document.getElementById('musicPlayer');
  if (player) {
    player.classList.toggle('expanded');
    updateHandleIcon();
  }
}

function updateHandleIcon() {
  const handle = document.getElementById('playerHandle');
  if (handle) {
    const icon = handle.querySelector('i');
    const player = document.getElementById('musicPlayer');
    if (icon && player) {
      icon.className = player.classList.contains('expanded') ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
    }
  }
}

function showMainPlayer() {
  const mainPlayer = document.getElementById('mainPlayer');
  const playlistPanel = document.getElementById('playlistPanel');
  
  if (mainPlayer) mainPlayer.style.display = 'flex';
  if (playlistPanel) playlistPanel.style.display = 'none';
}

function showPlaylist() {
  const mainPlayer = document.getElementById('mainPlayer');
  const playlistPanel = document.getElementById('playlistPanel');
  
  if (mainPlayer) mainPlayer.style.display = 'none';
  if (playlistPanel) playlistPanel.style.display = 'flex';
  
  const player = document.getElementById('musicPlayer');
  if (player) player.classList.add('expanded');
  updateHandleIcon();
}

function initEventListeners() {
  const playerHandle = document.getElementById('playerHandle');
  if (playerHandle) {
    playerHandle.addEventListener('click', toggleExpanded);
  }
  
  const playBtn = document.getElementById('playBtn');
  if (playBtn) {
    playBtn.addEventListener('click', togglePlayPause);
  }
  
  const prevBtn = document.getElementById('prevBtn');
  if (prevBtn) {
    prevBtn.addEventListener('click', prevSong);
  }
  
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', nextSong);
  }
  
  const progressBar = document.getElementById('progressBar');
  if (progressBar) {
    progressBar.addEventListener('click', (e) => {
      const rect = progressBar.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      seekToPercent(percent);
    });
  }
  
  const volumeSlider = document.getElementById('volumeSlider');
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      setVolume(parseFloat(e.target.value));
    });
  }
  
  const volumeBtn = document.getElementById('volumeBtn');
  if (volumeBtn) {
    volumeBtn.addEventListener('click', toggleMute);
  }
  
  const playlistBtn = document.getElementById('playlistBtn');
  if (playlistBtn) {
    playlistBtn.addEventListener('click', showPlaylist);
  }
  
  const playlistBackBtn = document.getElementById('playlistBackBtn');
  if (playlistBackBtn) {
    playlistBackBtn.addEventListener('click', showMainPlayer);
  }
  
  const shuffleBtn = document.getElementById('shuffleBtn');
  if (shuffleBtn) {
    shuffleBtn.addEventListener('click', toggleShuffle);
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    }
    
    if (e.ctrlKey && e.code === 'ArrowLeft') {
      e.preventDefault();
      prevSong();
    }
    
    if (e.ctrlKey && e.code === 'ArrowRight') {
      e.preventDefault();
      nextSong();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initAudio();
  initEventListeners();
  fetchPlaylist();
});
