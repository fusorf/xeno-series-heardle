// ============================================
// HTML5 AUDIO PLAYER
// Uses local audio files for testing, R2 storage for production
// ============================================

let audioElement = null;
let playerReady = false;
let isPlaying = false;
let currentTime = 0;
let animationFrame = null;
let playbackStartTime = 0; // Actual position where playback started

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
        audioElement.volume = 1.0;

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
        });

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
    const playButton = document.getElementById('playButton');
    if (playButton) {
        playButton.classList.add('playing');
    }

    // Support random start time for Random mode
    const startTime = dailySong.startTime || 0;

    try {
        if (startTime > 0) {
            // Seek to startTime and wait for it to actually complete
            audioElement.currentTime = startTime;
            await new Promise(resolve => {
                const onSeeked = () => {
                    audioElement.removeEventListener('seeked', onSeeked);
                    resolve();
                };
                audioElement.addEventListener('seeked', onSeeked);
                // Fallback: if seeked doesn't fire (data not buffered yet),
                // wait for enough data then retry the seek
                setTimeout(() => {
                    audioElement.removeEventListener('seeked', onSeeked);
                    // Retry seek after buffer has had time to fill
                    audioElement.currentTime = startTime;
                    // Give it another chance
                    const onSeeked2 = () => {
                        audioElement.removeEventListener('seeked', onSeeked2);
                        resolve();
                    };
                    audioElement.addEventListener('seeked', onSeeked2);
                    setTimeout(resolve, 500);
                }, 300);
            });
        }

        // Record the actual start position for progress tracking
        playbackStartTime = audioElement.currentTime;
        await audioElement.play();

        currentTime = 0;
        updateProgress(dailySong, currentAttempt);
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

    if (audioElement && playerReady) {
        audioElement.pause();
        audioElement.currentTime = playbackStartTime;
    }

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }

    // Reset progress display
    currentTime = 0;
    const fillEl = document.getElementById('progressFill');
    const labelEl = document.getElementById('currentTimeLabel');
    if (fillEl) {
        // Remove transition for instant reset
        fillEl.style.transition = 'none';
        fillEl.style.width = '0%';
        // Force reflow to ensure the change is applied
        void fillEl.offsetWidth;
        // Re-enable transition
        fillEl.style.transition = '';
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
    animationFrame = requestAnimationFrame(() => updateProgress(dailySong, currentAttempt));
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

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
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
}

// Export player state for use in other modules
function getPlayerState() {
    return { isPlaying, playerReady, currentTime };
}

// ============================================
// RESULT SCREEN AUDIO PLAYER (full song)
// ============================================

let resultAudioElement = null;
let resultIsPlaying = false;
let resultAnimationFrame = null;

function initResultAudioPlayer(dailySong) {
    const audioUrl = getAudioUrl(dailySong);
    if (!audioUrl) {
        console.error('No audio URL for result player');
        return;
    }

    resultAudioElement = new Audio(audioUrl);
    resultAudioElement.preload = 'auto';
    resultAudioElement.volume = 1.0;

    // Update progress bar
    resultAudioElement.addEventListener('timeupdate', updateResultProgress);
    resultAudioElement.addEventListener('ended', () => {
        resultIsPlaying = false;
        const playBtn = document.getElementById('resultPlayButton');
        if (playBtn) playBtn.classList.remove('playing');
        if (resultAnimationFrame) {
            cancelAnimationFrame(resultAnimationFrame);
            resultAnimationFrame = null;
        }
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
        if (resultAnimationFrame) {
            cancelAnimationFrame(resultAnimationFrame);
            resultAnimationFrame = null;
        }
    } else {
        resultAudioElement.play();
        resultIsPlaying = true;
        const playBtn = document.getElementById('resultPlayButton');
        if (playBtn) playBtn.classList.add('playing');
        updateResultProgress();
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

    if (resultIsPlaying) {
        resultAnimationFrame = requestAnimationFrame(updateResultProgress);
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
