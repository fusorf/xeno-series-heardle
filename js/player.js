// ============================================
// HTML5 AUDIO PLAYER
// Uses local audio files for testing, R2 storage for production
// ============================================

let audioElement = null;
let playerReady = false;
let isPlaying = false;
let currentTime = 0;
let playerAnimationFrame = null;
let playerClipTimeout = null; // Safety timeout for short clips
let playbackStartTime = 0; // Actual position where playback started
let currentDailySong = null; // Reference to current song for visibility pause

// DURATIONS is defined in constants.js

function initPlayer(dailySong) {
    return new Promise((resolve) => {
        if (audioElement) {
            resolve();
            return;
        }

        // Get audio URL using the helper function from songs.js
        const audioUrl = getAudioUrl(dailySong);

        if (!audioUrl) {
            console.error('No audio URL found for song');
            resolve();
            return;
        }

        // Create HTML5 audio element
        audioElement = new Audio(audioUrl);
        audioElement.preload = 'auto';
        audioElement.volume = globalVolume;

        // Wait for audio to be ready
        audioElement.addEventListener('canplaythrough', () => {
            playerReady = true;
            resolve();
        }, { once: true });

        audioElement.addEventListener('error', (e) => {
            console.error('Audio loading error:', e);
            console.error('Attempted to load:', audioUrl);
            playerReady = false;
            resolve();
        }, { once: true });

        // Block hardware media keys (keyboard play/pause button)
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => {});
            navigator.mediaSession.setActionHandler('pause', () => {});
            navigator.mediaSession.setActionHandler('seekforward', () => {});
            navigator.mediaSession.setActionHandler('seekbackward', () => {});
            navigator.mediaSession.setActionHandler('previoustrack', () => {});
            navigator.mediaSession.setActionHandler('nexttrack', () => {});
        }

        // Start loading
        audioElement.load();
    });
}

function togglePlay(dailySong, currentAttempt) {
    if (isPlaying) {
        pauseAudio(dailySong);
    } else {
        playAudio(dailySong, currentAttempt);
    }
}

async function playAudio(dailySong, currentAttempt) {
    if (!playerReady) {
        await initPlayer(dailySong);
    }

    // Check if player initialization failed
    if (!audioElement) {
        console.warn('Cannot play audio: Audio element not initialized');
        alert('Audio playback not available. Check console for details.');
        return;
    }

    if (isPlaying) {
        pauseAudio(dailySong);
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    isPlaying = true;
    currentDailySong = dailySong;
    const playButton = document.getElementById('playButton');
    if (playButton) {
        playButton.classList.add('playing');
    }

    // Support random start time for Random mode
    const startTime = dailySong.startTime || 0;

    try {
        if (startTime > 0) {
            // Wait for audio to have enough data before seeking
            if (audioElement.readyState < 2) {
                await new Promise(resolve => {
                    audioElement.addEventListener('canplay', resolve, { once: true });
                });
            }

            // Seek to startTime once
            audioElement.currentTime = startTime;

            // Wait for seek to complete
            await new Promise(resolve => {
                const onSeeked = () => {
                    audioElement.removeEventListener('seeked', onSeeked);
                    resolve();
                };
                audioElement.addEventListener('seeked', onSeeked, { once: true });
                // Fallback timeout in case seeked never fires
                setTimeout(resolve, 500);
            });
        }

        // Record the actual start position for progress tracking
        playbackStartTime = audioElement.currentTime;

        currentTime = 0;

        await audioElement.play();

        // Use requestAnimationFrame for smooth progress bar (~60fps)
        const animateProgress = () => {
            updateProgress(dailySong, currentAttempt);
            if (isPlaying) playerAnimationFrame = requestAnimationFrame(animateProgress);
        };
        playerAnimationFrame = requestAnimationFrame(animateProgress);

        // Safety timeout: guarantee clip stops even if timeupdate fires too late
        const clipMs = DURATIONS[currentAttempt] * 1000 + 50;
        playerClipTimeout = setTimeout(() => {
            if (isPlaying) pauseAudio(dailySong);
        }, clipMs);
    } catch (error) {
        console.error('Playback error:', error);
        isPlaying = false;
        if (playButton) {
            playButton.classList.remove('playing');
        }
    }
}

function pauseAudio(dailySong) {
    if (!isPlaying) return;

    isPlaying = false;
    const playButton = document.getElementById('playButton');
    if (playButton) {
        playButton.classList.remove('playing');
    }

    if (playerClipTimeout) {
        clearTimeout(playerClipTimeout);
        playerClipTimeout = null;
    }

    if (playerAnimationFrame) {
        cancelAnimationFrame(playerAnimationFrame);
        playerAnimationFrame = null;
    }

    if (audioElement && playerReady) {
        audioElement.pause();
        audioElement.currentTime = playbackStartTime;
    }

    // Reset progress display
    currentTime = 0;
    const fillEl = document.getElementById('progressFill');
    const labelEl = document.getElementById('currentTimeLabel');
    if (fillEl) {
        fillEl.style.width = '0%';
    }
    if (labelEl) labelEl.textContent = '0s';
}

function updateProgress(dailySong, currentAttempt) {
    if (!isPlaying) return;

    if (audioElement && playerReady) {
        // Use the actual playback start position to calculate elapsed time
        currentTime = Math.max(0, audioElement.currentTime - playbackStartTime);

        // Check if audio has ended (reached the end of the file)
        if (audioElement.ended || audioElement.currentTime >= dailySong.duration) {
            pauseAudio(dailySong);
            return;
        }

        // Check if we've exceeded the allowed duration
        if (currentTime >= DURATIONS[currentAttempt]) {
            pauseAudio(dailySong);
            return;
        }
    }

    updateProgressBar(currentAttempt);
}

function updateProgressBar(currentAttempt) {
    const maxDuration = DURATIONS[currentAttempt] || 1; // Prevent division by zero
    const percentage = Math.min(100, (currentTime / maxDuration) * 100);
    const fillEl = document.getElementById('progressFill');
    const labelEl = document.getElementById('currentTimeLabel');
    if (fillEl) fillEl.style.width = percentage + '%';
    if (labelEl) labelEl.textContent = Math.floor(currentTime) + 's';
}

function destroyPlayer() {
    // Stop playback first
    isPlaying = false;

    if (playerClipTimeout) {
        clearTimeout(playerClipTimeout);
        playerClipTimeout = null;
    }

    if (playerAnimationFrame) {
        cancelAnimationFrame(playerAnimationFrame);
        playerAnimationFrame = null;
    }

    if (audioElement) {
        audioElement.pause();
        audioElement.removeAttribute('src');
        audioElement.load(); // Reset the element
        audioElement = null;
    }

    playerReady = false;
    currentTime = 0;
    playbackStartTime = 0;
    currentDailySong = null;
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (isPlaying && currentDailySong) {
            pauseAudio(currentDailySong);
        }
    }
});

// ============================================
// RESULT SCREEN AUDIO PLAYER (full song)
// ============================================

let resultAudioElement = null;
let resultIsPlaying = false;

function destroyResultPlayer() {
    if (resultAudioElement) {
        resultAudioElement.pause();
        resultAudioElement.removeAttribute('src');
        resultAudioElement.load();
        resultAudioElement = null;
    }
    resultIsPlaying = false;
}

function initResultAudioPlayer(dailySong) {
    const audioUrl = getAudioUrl(dailySong);
    if (!audioUrl) {
        console.error('No audio URL for result player');
        return;
    }

    resultAudioElement = new Audio(audioUrl);
    resultAudioElement.preload = 'auto';
    resultAudioElement.volume = globalVolume;

    // Update progress bar
    resultAudioElement.addEventListener('timeupdate', updateResultProgress);
    resultAudioElement.addEventListener('ended', () => {
        resultIsPlaying = false;
        const playBtn = document.getElementById('resultPlayButton');
        if (playBtn) playBtn.classList.remove('playing');
    });

    // Update total time when metadata loads
    resultAudioElement.addEventListener('loadedmetadata', () => {
        const totalTimeEl = document.getElementById('resultTotalTime');
        if (totalTimeEl) {
            const minutes = Math.floor(resultAudioElement.duration / 60);
            const seconds = Math.floor(resultAudioElement.duration % 60);
            totalTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    });
}

function toggleResultAudio() {
    if (!resultAudioElement) return;

    if (resultIsPlaying) {
        resultAudioElement.pause();
        resultIsPlaying = false;
        const playBtn = document.getElementById('resultPlayButton');
        if (playBtn) playBtn.classList.remove('playing');
    } else {
        resultAudioElement.play();
        resultIsPlaying = true;
        const playBtn = document.getElementById('resultPlayButton');
        if (playBtn) playBtn.classList.add('playing');
    }
}

function updateResultProgress() {
    if (!resultAudioElement || !resultIsPlaying) return;

    const currentTime = resultAudioElement.currentTime;
    const duration = resultAudioElement.duration || 1;
    const percentage = (currentTime / duration) * 100;

    const progressBar = document.getElementById('resultProgressBar');
    const currentTimeEl = document.getElementById('resultCurrentTime');

    if (progressBar) {
        progressBar.style.width = percentage + '%';
    }

    if (currentTimeEl) {
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        currentTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

function seekResultAudio(event) {
    if (!resultAudioElement) return;

    const track = document.getElementById('resultProgressTrack');
    const rect = track.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * resultAudioElement.duration;

    resultAudioElement.currentTime = newTime;

    // Update UI immediately
    const progressBar = document.getElementById('resultProgressBar');
    const currentTimeEl = document.getElementById('resultCurrentTime');

    if (progressBar) {
        progressBar.style.width = (percentage * 100) + '%';
    }

    if (currentTimeEl) {
        const minutes = Math.floor(newTime / 60);
        const seconds = Math.floor(newTime % 60);
        currentTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}
