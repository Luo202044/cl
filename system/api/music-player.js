// music-player.js - 音乐播放器核心功能
// 存储位置: https://classin.luoqing5203789.dpdns.org/system/api/music-player.js

document.addEventListener('DOMContentLoaded', function() {
    // 音乐播放器配置
    const musicConfig = {
        baseUrl: "https://luo202044.github.io/classinapi/",
        apiFile: "api.txt",
        getApiUrl() {
            return `${this.baseUrl}${this.apiFile}`;
        },
        getMusicUrl(filename) {
            const cleanFilename = filename.trim();
            return `${this.baseUrl}${cleanFilename}`;
        }
    };

    // 播放器状态
    const playerState = {
        playlist: [],
        currentSongIndex: -1,
        isPlaying: false,
        isLoading: false,
        volume: 0.7
    };

    // DOM元素
    const musicPlayerContainer = document.getElementById('music-player-container');
    const playerHandle = document.getElementById('player-handle');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const progress = document.getElementById('progress');
    const currentTimeDisplay = document.getElementById('current-time-display');
    const totalTimeDisplay = document.getElementById('total-time-display');
    const currentSongTitle = document.getElementById('current-song-title');
    const currentSongArtist = document.getElementById('current-song-artist');
    const playerStatus = document.getElementById('player-status');

    // 创建音频对象
    const audio = new Audio();
    audio.volume = playerState.volume;

    // 从文件名提取友好的显示名称
    function getFriendlyDisplayName(filename) {
        // 移除文件扩展名
        let name = filename.replace(/\.[^/.]+$/, "");
        
        // 常见分隔符替换为空格
        name = name.replace(/[_-]/g, ' ');
        
        // 移除数字前缀（如 "01 - " 或 "01."）
        name = name.replace(/^\d+[\s._-]*/, "");
        
        // 单词首字母大写
        name = name.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        
        // 如果处理后为空，返回原始名称
        return name.trim() || filename.replace(/\.[^/.]+$/, "");
    }

    // 初始化播放器
    function initPlayer() {
        console.log("🔄 初始化播放器...");
        
        // 设置初始状态
        updatePlayerUI();
        
        // 设置事件监听器
        initEventListeners();
        
        // 从GitHub获取音乐列表
        fetchPlaylistFromGitHub();
        
        console.log("✅ 播放器初始化完成");
    }

    // 从GitHub API获取播放列表
    async function fetchPlaylistFromGitHub() {
        playerStatus.textContent = '正在从GitHub加载音乐列表...';
        playerState.isLoading = true;
        
        try {
            const apiUrl = musicConfig.getApiUrl();
            console.log("🌐 请求音乐列表:", apiUrl);
            
            const response = await fetch(apiUrl, { cache: 'no-cache' });
            
            if (!response.ok) {
                throw new Error(`HTTP错误! 状态码: ${response.status}`);
            }
            
            const text = await response.text();
            console.log("📄 API文件内容:", text);
            
            // 解析文件列表，过滤空行和非音频文件
            const filenames = text.split('\n')
                .map(line => line.trim())
                .filter(line => {
                    // 只保留音频文件
                    if (line.length === 0) return false;
                    const ext = line.split('.').pop().toLowerCase();
                    return ['mp3', 'wav', 'ogg', 'm4a', 'aac'].includes(ext);
                });
            
            console.log("📝 解析到的音乐文件:", filenames);
            
            if (filenames.length === 0) {
                playerStatus.textContent = '未找到音频文件';
                currentSongTitle.textContent = '无可用音乐';
                currentSongArtist.textContent = '请检查音乐库';
                return;
            }
            
            // 更新播放列表
            playerState.playlist = filenames;
            playerStatus.textContent = `加载完成，共 ${filenames.length} 首音乐`;
            
            // 如果当前没有播放音乐，从第一首开始
            if (playerState.currentSongIndex === -1) {
                playerState.currentSongIndex = 0;
                loadSong();
            }
            
        } catch (error) {
            console.error("❌ 获取音乐列表失败:", error);
            playerStatus.textContent = `加载失败: ${error.message}`;
        } finally {
            playerState.isLoading = false;
        }
    }

    // 加载指定索引的歌曲
    function loadSong(index) {
        if (playerState.playlist.length === 0) {
            playerStatus.textContent = '播放列表为空';
            return;
        }
        
        // 如果提供了索引，更新当前歌曲索引
        if (index !== undefined) {
            playerState.currentSongIndex = index;
        }
        
        const filename = playerState.playlist[playerState.currentSongIndex];
        const musicUrl = musicConfig.getMusicUrl(filename);
        
        console.log("🎵 加载歌曲:", musicUrl);
        
        // 更新UI
        const displayName = getFriendlyDisplayName(filename);
        currentSongTitle.textContent = displayName;
        currentSongArtist.textContent = '音乐';
        playerStatus.textContent = `正在加载: ${displayName}`;
        
        // 设置音频源并播放
        audio.src = musicUrl;
        
        // 如果之前在播放，继续播放
        if (playerState.isPlaying) {
            audio.play().catch(error => {
                console.error("❌ 播放失败:", error);
                playerStatus.textContent = '播放被阻止';
            });
        }
    }

    // 播放音乐
    function playSong() {
        if (playerState.playlist.length === 0) {
            fetchPlaylistFromGitHub();
            return;
        }
        
        if (playerState.currentSongIndex === -1) {
            playerState.currentSongIndex = 0;
            loadSong();
        }
        
        audio.play()
            .then(() => {
                playerState.isPlaying = true;
                updatePlayerUI();
                playerStatus.textContent = '正在播放';
            })
            .catch(error => {
                console.error("❌ 播放失败:", error);
                playerStatus.textContent = '播放被阻止，请点击播放按钮';
            });
    }

    // 暂停音乐
    function pauseSong() {
        audio.pause();
        playerState.isPlaying = false;
        updatePlayerUI();
        playerStatus.textContent = '已暂停';
    }

    // 切换播放/暂停
    function togglePlayPause() {
        if (playerState.isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    }

    // 上一首
    function prevSong() {
        if (playerState.playlist.length === 0) return;
        
        playerState.currentSongIndex = (playerState.currentSongIndex - 1 + playerState.playlist.length) % playerState.playlist.length;
        loadSong();
        
        if (playerState.isPlaying) {
            playSong();
        }
    }

    // 下一首
    function nextSong() {
        if (playerState.playlist.length === 0) return;
        
        playerState.currentSongIndex = (playerState.currentSongIndex + 1) % playerState.playlist.length;
        loadSong();
        
        if (playerState.isPlaying) {
            playSong();
        }
    }

    // 更新播放进度
    function updateProgress() {
        if (audio.duration) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progress.style.width = `${percent}%`;
            currentTimeDisplay.textContent = formatTime(audio.currentTime);
        }
    }

    // 格式化时间显示
    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    // 跳转到指定时间
    function seekTo(time) {
        if (audio.duration) {
            audio.currentTime = audio.duration * time;
        }
    }

    // 更新播放器UI状态
    function updatePlayerUI() {
        // 更新播放/暂停按钮图标
        const playIcon = playBtn.querySelector('i');
        if (playerState.isPlaying) {
            playIcon.classList.remove('fa-play');
            playIcon.classList.add('fa-pause');
        } else {
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
        }
        
        // 更新按钮状态
        prevBtn.disabled = playerState.playlist.length === 0;
        nextBtn.disabled = playerState.playlist.length === 0;
    }

    // 切换播放器展开/收起
    function togglePlayer() {
        if (musicPlayerContainer.classList.contains('collapsed')) {
            musicPlayerContainer.classList.remove('collapsed');
            playerHandle.innerHTML = '<i class="fas fa-chevron-right"></i>';
            playerHandle.title = "收起播放器";
        } else {
            musicPlayerContainer.classList.add('collapsed');
            playerHandle.innerHTML = '<i class="fas fa-chevron-left"></i>';
            playerHandle.title = "展开播放器";
        }
    }

    // 初始化事件监听器
    function initEventListeners() {
        // 播放/暂停按钮
        playBtn.addEventListener('click', togglePlayPause);
        
        // 上一首按钮
        prevBtn.addEventListener('click', prevSong);
        
        // 下一首按钮
        nextBtn.addEventListener('click', nextSong);
        
        // 进度条点击
        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            seekTo(pos);
        });
        
        // 音频进度更新
        audio.addEventListener('timeupdate', updateProgress);
        
        // 音频加载完成事件
        audio.addEventListener('loadedmetadata', () => {
            totalTimeDisplay.textContent = formatTime(audio.duration);
        });
        
        // 音频错误事件
        audio.addEventListener('error', (e) => {
            console.error("音频加载错误:", e);
            playerStatus.textContent = '音频加载失败';
            
            // 自动尝试下一首
            if (playerState.playlist.length > 1) {
                setTimeout(() => nextSong(), 1000);
            }
        });
        
        // 音频结束事件
        audio.addEventListener('ended', () => {
            console.log("歌曲播放结束");
            if (playerState.playlist.length > 1) {
                nextSong();
            } else {
                pauseSong();
            }
        });
        
        // 箭头按钮点击事件
        playerHandle.addEventListener('click', togglePlayer);
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                togglePlayPause();
            }
            
            if (e.code === 'ArrowLeft' && e.ctrlKey) {
                prevSong();
            }
            if (e.code === 'ArrowRight' && e.ctrlKey) {
                nextSong();
            }
        });
        
        // 点击页面其他区域收起播放器
        document.addEventListener('click', (e) => {
            if (!musicPlayerContainer.classList.contains('collapsed') &&
                !musicPlayerContainer.contains(e.target) &&
                e.target !== playerHandle &&
                !playerHandle.contains(e.target)) {
                
                musicPlayerContainer.classList.add('collapsed');
                playerHandle.innerHTML = '<i class="fas fa-chevron-left"></i>';
                playerHandle.title = "展开播放器";
            }
        });
        
        console.log("✅ 所有事件监听器绑定完成");
    }

    // 初始化播放器
    initPlayer();
    
    // 全局导出
    window.musicPlayer = {
        play: playSong,
        pause: pauseSong,
        togglePlayPause: togglePlayPause,
        prevSong: prevSong,
        nextSong: nextSong,
        loadSong: loadSong,
        togglePlayer: togglePlayer,
        getState: () => ({ ...playerState }),
        getCurrentSong: () => playerState.playlist[playerState.currentSongIndex] || null,
        getPlaylist: () => [...playerState.playlist],
        fetchPlaylistFromGitHub: fetchPlaylistFromGitHub,
        musicConfig: musicConfig
    };
});