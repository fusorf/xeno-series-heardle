// ============================================
// BLITZ MODE — 60-second rapid-fire challenge
// ============================================
// Toggle like Endless. Uses the main gameContainer.
// Songs play continuously until guess or skip.

const BLITZ_DURATION = 60;
const BLITZ_BASE_SCORE = 100;
const BLITZ_MAX_COMBO = 4;
const BLITZ_TIME_BONUS = 3;

// State
let blitzActive = false;
let blitzGameOver = false;
let blitzTimerInterval = null;
let blitzCountdownInterval = null;
let blitzTimeLeft = BLITZ_DURATION;
let blitzScore = 0;
let blitzCombo = 1;
let blitzBestCombo = 0;
let blitzSongsCorrect = 0;
let blitzSongsAttempted = 0;
let blitzCurrentSong = null;
let blitzAudio = null;
let blitzHistory = [];
let blitzSelectedSong = null;
let displayedBlitzScore = 0;
let scoreAnimFrame = null;
let preloadedBlitzSong = null;
let preloadedBlitzAudio = null;

/**
 * Animate a score element counting from `from` to `to` with a scale pulse.
 * @param {HTMLElement} el - The score element
 * @param {number} from - Starting value
 * @param {number} to - Target value
 * @param {number} duration - Duration in ms
 */
function animateScoreCount(el, from, to, duration) {
    if (scoreAnimFrame) {
        cancelAnimationFrame(scoreAnimFrame);
        scoreAnimFrame = null;
    }
    const startTime = performance.now();
    const diff = to - from;

    function tick(now) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.round(from + diff * eased);
        el.textContent = current;

        // Scale arc: 1 → peak → 1
        const scale = 1 + 0.18 * Math.sin(progress * Math.PI);
        el.style.transform = `scale(${scale})`;

        if (progress < 1) {
            scoreAnimFrame = requestAnimationFrame(tick);
        } else {
            el.textContent = to;
            el.style.transform = '';
            scoreAnimFrame = null;
        }
    }

    scoreAnimFrame = requestAnimationFrame(tick);
}

// ============================================
// THEME
// ============================================

function applyBlitzTheme() {
    if (currentMode === 'random' && endlessLockedGame) {
        // Single Game mode: use the locked game's theme + background
        currentGamemodeLink.setAttribute('href', '');
        currentGameLink.setAttribute('href', `themes/games/${endlessLockedGame}.css`);
        setBackground(getBackgroundUrl(endlessLockedGame));
    } else {
        // Standard mode: use gamemode theme + background
        currentGamemodeLink.setAttribute('href', `themes/gamemodes/${currentMode}.css`);
        currentGameLink.setAttribute('href', '');
        setBackground(getBackgroundUrl(currentMode));
    }
}

// ============================================
// SONG POOL
// ============================================

function getBlitzSongPool() {
    // In Single Game mode with a locked game, use only that game's songs
    if (currentMode === 'random' && endlessLockedGame) {
        return SONG_POOLS[endlessLockedGame] || [];
    }
    // Otherwise use the currently selected game mode's song pool
    return getSongsForMode(currentMode);
}

function pickBlitzSong() {
    const songs = getBlitzSongPool();
    const song = songs[Math.floor(Math.random() * songs.length)];
    const minRequired = 16;
    const maxStart = Math.max(0, song.duration - minRequired);
    const startTime = maxStart > 0 ? Math.floor(Math.random() * (maxStart + 1)) : 0;
    return { ...song, startTime };
}

// ============================================
// TOGGLE (like Endless)
// ============================================

function toggleBlitzMode() {
    if (blitzActive) {
        deactivateBlitz();
    } else {
        activateBlitz();
    }
}

function activateBlitz() {
    // Deactivate endless if active
    if (endlessMode) {
        endlessMode = false;
        const endBtn = document.getElementById('endlessButton');
        if (endBtn) endBtn.classList.remove('active');
        const endLabel = document.getElementById('endlessModeLabel');
        if (endLabel) endLabel.classList.remove('visible');
    }

    // Cleanup existing audio
    destroyPlayer();
    destroyResultPlayer();
    clearInterval(window.countdownInterval);

    blitzActive = true;

    // Button active state
    const btn = document.getElementById('blitzButton');
    if (btn) btn.classList.add('active');

    // Label
    const label = document.getElementById('blitzModeLabel');
    if (label) {
        label.textContent = locale.blitz?.name || 'BLITZ';
        label.classList.remove('hiding');
        label.classList.add('visible');
    }

    // In Single Game mode, auto-select a random game if none locked
    if (currentMode === 'random' && !endlessLockedGame) {
        const mode = GAME_MODES['random'];
        const randomIdx = Math.floor(Math.random() * mode.games.length);
        endlessLockedGame = mode.games[randomIdx];
    }

    // Apply theme for selected game/mode
    applyBlitzTheme();

    // Update daily game banner: show game selector in single game mode, hide otherwise
    updateBlitzBanner();

    startBlitzRound();
}

function deactivateBlitz() {
    blitzActive = false;
    blitzGameOver = false;
    stopBlitzAudio();
    cleanupPreload();
    if (blitzTimerInterval) {
        clearInterval(blitzTimerInterval);
        blitzTimerInterval = null;
    }
    if (blitzCountdownInterval) {
        clearInterval(blitzCountdownInterval);
        blitzCountdownInterval = null;
    }

    // Clean up document-level listener from game selector dropdown
    const banner = document.getElementById('dailyGameBanner');
    if (banner && banner._outsideClickHandler) {
        document.removeEventListener('click', banner._outsideClickHandler);
        banner._outsideClickHandler = null;
    }

    // Reset shared state so it doesn't leak into endless mode
    endlessLockedGame = null;

    // Remove blitz UI state classes from container
    const container = document.getElementById('gameContainer');
    if (container) {
        container.classList.remove('blitz-locked', 'results-screen');
    }

    // Button
    const btn = document.getElementById('blitzButton');
    if (btn) btn.classList.remove('active');

    // Label
    const label = document.getElementById('blitzModeLabel');
    if (label) {
        label.classList.remove('visible');
        label.classList.add('hiding');
        label.addEventListener('animationend', () => {
            label.classList.remove('hiding');
        }, { once: true });
    }

    // Return to normal game — refresh dailySong for the (possibly changed) mode
    dailySong = getDailySong(currentMode);
    renderModeSelector(currentMode, locale);
    updateDailyGameBanner(currentMode, dailySong, locale);
    loadAndDisplay();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// BANNER (game selector for Single Game mode)
// ============================================

function updateBlitzBanner() {
    const banner = document.getElementById('dailyGameBanner');
    if (!banner) return;

    if (currentMode === 'random') {
        // Show game selector like endless does
        const mode = GAME_MODES['random'];
        const bannerTitle = locale?.endless?.selectedGame || 'Selected Game';

        let itemsHtml = '';
        mode.games.forEach(gameId => {
            const game = GAMES[gameId];
            if (game) {
                itemsHtml += `<div class="autocomplete-item game-select-item" data-game="${gameId}">
                    ${escapeHtml(game.name)}
                </div>`;
            }
        });

        const currentGameName = GAMES[endlessLockedGame]?.name || 'Random';

        banner.style.display = 'block';
        banner.innerHTML = `
            <div class="daily-game-title">${bannerTitle}</div>
            <div class="daily-game-name">
                ${escapeHtml(currentGameName)}
                <span class="game-select-chevron-box"><svg class="game-select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
            </div>
            <div class="game-select-list" id="gameSelectList">
                ${itemsHtml}
            </div>
        `;

        // Toggle dropdown on banner click
        if (banner._toggleHandler) {
            banner.removeEventListener('click', banner._toggleHandler);
        }
        banner._toggleHandler = (e) => {
            if (e.target.closest('.game-select-item')) return;
            banner.classList.toggle('open');
        };
        banner.addEventListener('click', banner._toggleHandler);

        // Close on outside click
        if (banner._outsideClickHandler) {
            document.removeEventListener('click', banner._outsideClickHandler);
        }
        banner._outsideClickHandler = (e) => {
            if (!banner.contains(e.target)) {
                banner.classList.remove('open');
            }
        };
        document.addEventListener('click', banner._outsideClickHandler);

        // Item selection — lock game and restart blitz (use stored ref to avoid stacking)
        const gameList = document.getElementById('gameSelectList');
        if (banner._gameListHandler) {
            gameList.removeEventListener('click', banner._gameListHandler);
        }
        banner._gameListHandler = (e) => {
            const item = e.target.closest('.game-select-item');
            if (item) {
                banner.classList.remove('open');
                onBlitzGameSelect(item.dataset.game);
            }
        };
        gameList.addEventListener('click', banner._gameListHandler);
    } else {
        banner.style.display = 'none';
    }
}

function onBlitzGameSelect(gameId) {
    endlessLockedGame = gameId;

    // Apply theme for new game
    applyBlitzTheme();

    // Update banner display
    const banner = document.getElementById('dailyGameBanner');
    const nameEl = banner?.querySelector('.daily-game-name');
    if (nameEl) {
        const game = GAMES[gameId];
        nameEl.innerHTML = `
            ${escapeHtml(game ? game.name : gameId)}
            <span class="game-select-chevron-box"><svg class="game-select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
        `;
    }

    // Restart blitz with new pool
    startBlitzRound();
}

// ============================================
// ROUND START (countdown → game)
// ============================================

function startBlitzRound() {
    blitzTimeLeft = BLITZ_DURATION;
    blitzScore = 0;
    blitzCombo = 1;
    blitzBestCombo = 0;
    blitzSongsCorrect = 0;
    blitzSongsAttempted = 0;
    blitzHistory = [];
    blitzSelectedSong = null;
    blitzActive = true;
    blitzGameOver = false;
    prevBlitzCombo = 1;
    displayedBlitzScore = 0;
    if (scoreAnimFrame) {
        cancelAnimationFrame(scoreAnimFrame);
        scoreAnimFrame = null;
    }
    cleanupPreload();

    // In Single Game mode, auto-select a random game if none locked
    if (currentMode === 'random' && !endlessLockedGame) {
        const mode = GAME_MODES['random'];
        const randomIdx = Math.floor(Math.random() * mode.games.length);
        endlessLockedGame = mode.games[randomIdx];
        applyBlitzTheme();
        updateBlitzBanner();
    }

    if (blitzTimerInterval) {
        clearInterval(blitzTimerInterval);
        blitzTimerInterval = null;
    }
    if (blitzCountdownInterval) {
        clearInterval(blitzCountdownInterval);
        blitzCountdownInterval = null;
    }
    stopBlitzAudio();

    renderBlitzCountdown();
}

function renderBlitzCountdown() {
    // Render the full game UI immediately (locked)
    renderBlitzGame();
    const container = document.getElementById('gameContainer');
    container.classList.add('blitz-locked');

    // Add countdown overlay on top of the banner
    const banner = container.querySelector('.blitz-banner');
    if (banner) {
        const overlay = document.createElement('div');
        overlay.className = 'blitz-countdown-overlay';
        overlay.innerHTML = '<span class="blitz-countdown-num blitz-countdown-pop" id="blitzCountNum">3</span>';
        banner.appendChild(overlay);
    }

    let count = 3;
    const el = document.getElementById('blitzCountNum');

    blitzCountdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            el.textContent = count;
            el.classList.remove('blitz-countdown-pop');
            void el.offsetWidth;
            el.classList.add('blitz-countdown-pop');
        } else if (count === 0) {
            el.textContent = 'GO!';
            el.classList.remove('blitz-countdown-pop');
            void el.offsetWidth;
            el.classList.add('blitz-countdown-pop');
        } else {
            clearInterval(blitzCountdownInterval);
            blitzCountdownInterval = null;
            beginBlitzGame();
        }
    }, 700);
}

function beginBlitzGame() {
    // Remove countdown overlay and unlock UI
    const container = document.getElementById('gameContainer');
    container.classList.remove('blitz-locked');
    const overlay = container.querySelector('.blitz-countdown-overlay');
    if (overlay) overlay.remove();

    nextBlitzSong();

    if (blitzTimerInterval) {
        clearInterval(blitzTimerInterval);
    }
    blitzTimerInterval = setInterval(() => {
        blitzTimeLeft--;
        updateBlitzTimer();
        if (blitzTimeLeft <= 0) {
            endBlitz();
        }
    }, 1000);

    updateBlitzTimer();
}

// ============================================
// RENDER: GAME (into gameContainer)
// ============================================

function renderBlitzGame() {
    const container = document.getElementById('gameContainer');
    container.classList.remove('results-screen');

    const l = locale.blitz || {};

    let html = '';

    // Blitz banner (styled like daily-game-banner)
    html += '<div class="blitz-banner">';
    html += `<div class="blitz-top-row">`;
    html += `<div class="blitz-combo-box" id="blitzComboBox"><div class="blitz-combo-fire"></div><span class="blitz-combo" id="blitzComboDisplay">×${blitzCombo}</span></div>`;
    html += `<div class="blitz-score-area"><span class="blitz-score" id="blitzScoreDisplay">${blitzScore}</span><span class="blitz-score-pts">pts</span></div>`;
    html += `<div class="blitz-meta"><span class="blitz-song-counter" id="blitzSongCounter">#${blitzSongsAttempted}</span><span class="blitz-timer-text" id="blitzTimerText">${blitzTimeLeft}s</span></div>`;
    html += `</div>`;
    html += `<div class="blitz-timer-bar"><div class="blitz-timer-fill" id="blitzTimerFill"></div></div>`;

    // Song history (scrollable list inside banner)
    html += `<div class="blitz-history" id="blitzHistory"></div>`;
    html += '</div>';

    // Search section (reusing existing classes)
    html += '<div class="search-section">';
    html += `<div class="search-container">`;
    html += `<span class="search-icon">🔍</span>`;
    html += `<input type="text" class="search-input" id="blitzSearchInput" placeholder="${l.searchPlaceholder || locale.search}" autocomplete="off">`;
    html += `<div class="autocomplete-list" id="blitzAutocomplete"></div>`;
    html += `</div>`;
    html += `<div class="button-container">`;
    html += `<button class="skip-button" id="blitzSkipBtn">${l.skip || locale.skip} ⏭</button>`;
    html += `<button class="submit-button" id="blitzSubmitBtn" disabled>${l.submit || locale.submit}</button>`;
    html += `</div>`;
    html += '</div>';

    container.innerHTML = html;
    setupBlitzListeners();
}

function setupBlitzListeners() {
    const searchInput = document.getElementById('blitzSearchInput');
    const submitBtn = document.getElementById('blitzSubmitBtn');
    const skipBtn = document.getElementById('blitzSkipBtn');
    const autocomplete = document.getElementById('blitzAutocomplete');

    if (searchInput) {
        searchInput.addEventListener('input', handleBlitzSearch);
        searchInput.addEventListener('keydown', handleBlitzKeydown);
    }
    if (submitBtn) submitBtn.addEventListener('click', submitBlitzGuess);
    if (skipBtn) skipBtn.addEventListener('click', skipBlitzSong);
    if (autocomplete) {
        autocomplete.addEventListener('click', (e) => {
            const item = e.target.closest('.blitz-ac-item');
            if (item) selectBlitzSongFromList(item.dataset.title);
        });
    }
}

// ============================================
// SONG CYCLING
// ============================================

function nextBlitzSong() {
    if (blitzGameOver) return;
    blitzSelectedSong = null;
    blitzSongsAttempted++;

    // Use preloaded song if available, otherwise pick fresh
    if (preloadedBlitzSong && preloadedBlitzAudio) {
        blitzCurrentSong = preloadedBlitzSong;
        const audio = preloadedBlitzAudio;
        preloadedBlitzSong = null;
        preloadedBlitzAudio = null;
        playBlitzSong(audio);
    } else {
        blitzCurrentSong = pickBlitzSong();
        playBlitzSong(null);
    }

    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') console.log('[BLITZ] Answer:', blitzCurrentSong.title);
    updateBlitzSongCounter();

    // Preload the next song in parallel
    preloadNextBlitzSong();

    const input = document.getElementById('blitzSearchInput');
    if (input) {
        input.value = '';
        input.focus();
    }

    const submitBtn = document.getElementById('blitzSubmitBtn');
    if (submitBtn) submitBtn.disabled = true;

    const autocomplete = document.getElementById('blitzAutocomplete');
    if (autocomplete) autocomplete.classList.remove('active');
}

// ============================================
// AUDIO — plays continuously until guess/skip
// ============================================

function playBlitzSong(preloadedAudio) {
    stopBlitzAudio();

    const url = getAudioUrl(blitzCurrentSong);
    if (!url) {
        if (preloadedAudio) {
            preloadedAudio.removeAttribute('src');
            preloadedAudio.load();
        }
        return;
    }

    const startPos = blitzCurrentSong.startTime || 0;

    if (preloadedAudio) {
        blitzAudio = preloadedAudio;
    } else {
        blitzAudio = new Audio(url);
        blitzAudio.volume = globalVolume;
        blitzAudio.preload = 'auto';
    }

    // Capture local ref so stale callbacks don't act on a newer audio object
    const audioRef = blitzAudio;

    const onReady = () => {
        if (!blitzActive || audioRef !== blitzAudio) return;
        audioRef.currentTime = startPos;
        audioRef.play().catch(() => {});
    };

    // If already loaded (preloaded case), start immediately
    if (audioRef.readyState >= 3) {
        onReady();
    } else {
        audioRef.addEventListener('canplaythrough', onReady, { once: true });
    }

    // If song ends, loop from start position
    audioRef.addEventListener('ended', () => {
        if (!blitzActive || audioRef !== blitzAudio) return;
        audioRef.currentTime = startPos;
        audioRef.play().catch(() => {});
    });

    // Fallback if canplaythrough is slow
    setTimeout(() => {
        if (audioRef === blitzAudio && blitzActive && audioRef.paused) {
            audioRef.currentTime = startPos;
            audioRef.play().catch(() => {});
        }
    }, 3000);

    if (!preloadedAudio) blitzAudio.load();
}

function stopBlitzAudio() {
    if (blitzAudio) {
        blitzAudio.pause();
        blitzAudio.removeAttribute('src');
        blitzAudio.load();
        blitzAudio = null;
    }
}

function preloadNextBlitzSong() {
    cleanupPreload();
    preloadedBlitzSong = pickBlitzSong();
    const url = getAudioUrl(preloadedBlitzSong);
    if (!url) {
        preloadedBlitzSong = null;
        return;
    }
    preloadedBlitzAudio = new Audio(url);
    preloadedBlitzAudio.preload = 'auto';
    preloadedBlitzAudio.volume = globalVolume;
    preloadedBlitzAudio.load();
}

function cleanupPreload() {
    if (preloadedBlitzAudio) {
        preloadedBlitzAudio.removeAttribute('src');
        preloadedBlitzAudio.load();
        preloadedBlitzAudio = null;
    }
    preloadedBlitzSong = null;
}

// ============================================
// SEARCH & GUESSING
// ============================================

let blitzAcIndex = 0; // Currently highlighted autocomplete index
let prevBlitzCombo = 1; // Track previous combo for slide animation direction

function handleBlitzSearch(e) {
    const query = e.target.value.toLowerCase();
    const autocomplete = document.getElementById('blitzAutocomplete');
    const submitBtn = document.getElementById('blitzSubmitBtn');

    if (query.length < 1) {
        autocomplete.classList.remove('active');
        submitBtn.disabled = true;
        blitzSelectedSong = null;
        return;
    }

    const allSongs = getBlitzSongPool();
    const words = query.split(/\s+/).filter(Boolean);
    const matches = allSongs.filter(song => {
        const game = GAMES[song.game];
        const haystack = [
            song.title.toLowerCase(),
            song.localizedTitle.toLowerCase(),
            song.japaneseTitle ? song.japaneseTitle.toLowerCase() : '',
            game ? game.name.toLowerCase() : '',
            game ? game.shortName.toLowerCase() : ''
        ].join(' ');
        const aliasWords = getGameSearchAliases(song.game).split(/\s+/).filter(Boolean);
        return words.every(w => haystack.includes(w) || aliasWords.includes(w));
    });

    if (matches.length > 0) {
        autocomplete.innerHTML = matches.map((song, i) => {
            const game = GAMES[song.game];
            const badge = game ? `<span class="autocomplete-game-badge" style="--badge-color: ${game.color}">${escapeHtml(game.shortName)}</span>` : '';
            const displayTitle = getDisplayTitle(song);
            const hl = i === 0 ? ' ac-highlighted' : '';
            return `<div class="autocomplete-item blitz-ac-item${hl}" data-title="${escapeHtml(song.title)}">${escapeHtml(displayTitle)}${badge}</div>`;
        }).join('');
        autocomplete.classList.add('active');
        blitzAcIndex = 0;

        // Auto-select first match
        blitzSelectedSong = matches[0].title;
        submitBtn.disabled = false;

        const rect = autocomplete.getBoundingClientRect();
        const maxAvailable = window.innerHeight - rect.top - 10;
        autocomplete.style.maxHeight = Math.max(120, Math.min(300, maxAvailable)) + 'px';
    } else {
        autocomplete.classList.remove('active');
        blitzSelectedSong = null;
        submitBtn.disabled = true;
    }
}

function handleBlitzKeydown(e) {
    handleAutocompleteKeydown(e, {
        listEl: document.getElementById('blitzAutocomplete'),
        itemSelector: '.blitz-ac-item',
        getIndex: () => blitzAcIndex,
        setIndex: (i) => { blitzAcIndex = i; },
        getSelection: () => blitzSelectedSong,
        setSelection: (t) => { blitzSelectedSong = t; },
        submitBtnId: 'blitzSubmitBtn',
        onSelect: selectBlitzSongFromList,
        onSubmit: submitBlitzGuess
    });
}

function selectBlitzSongFromList(title) {
    const song = getBlitzSongPool().find(s => s.title === title);
    const displayTitle = song ? getDisplayTitle(song) : title;
    document.getElementById('blitzSearchInput').value = displayTitle;
    document.getElementById('blitzAutocomplete').classList.remove('active');
    blitzSelectedSong = title;
    document.getElementById('blitzSubmitBtn').disabled = false;
}

function submitBlitzGuess() {
    if (!blitzActive || blitzGameOver || !blitzSelectedSong) return;

    const isCorrect = blitzSelectedSong.toLowerCase() === blitzCurrentSong.title.toLowerCase();

    if (isCorrect) {
        const points = BLITZ_BASE_SCORE * blitzCombo;
        blitzScore += points;
        blitzSongsCorrect++;
        blitzCombo = Math.min(blitzCombo + 1, BLITZ_MAX_COMBO);
        if (blitzCombo > blitzBestCombo) blitzBestCombo = blitzCombo;

        // Add time bonus
        blitzTimeLeft = Math.min(blitzTimeLeft + BLITZ_TIME_BONUS, BLITZ_DURATION);
        updateBlitzTimer();

        blitzHistory.push({ song: blitzCurrentSong, correct: true, points });
        showBlitzFeedback('correct', points);
        updateBlitzHistoryDisplay();
        updateBlitzScore();

        // Advance immediately — score animation runs in parallel
        if (blitzActive && !blitzGameOver) nextBlitzSong();
    } else {
        blitzCombo = 1;
        updateBlitzScore();
        showBlitzFeedback('wrong');
        // Clear input so user can try again quickly
        const input = document.getElementById('blitzSearchInput');
        if (input) input.value = '';
        blitzSelectedSong = null;
        const submitBtn = document.getElementById('blitzSubmitBtn');
        if (submitBtn) submitBtn.disabled = true;
        const autocomplete = document.getElementById('blitzAutocomplete');
        if (autocomplete) autocomplete.classList.remove('active');
    }
}

function skipBlitzSong() {
    if (!blitzActive || blitzGameOver) return;

    blitzCombo = 1;
    blitzHistory.push({ song: blitzCurrentSong, correct: false, points: 0 });
    showBlitzFeedback('skip');
    updateBlitzHistoryDisplay();
    updateBlitzScore();
    nextBlitzSong();
}

// ============================================
// END GAME
// ============================================

function endBlitz() {
    // Keep blitzActive = true so the toggle button returns to normal game
    blitzGameOver = true;
    stopBlitzAudio();
    cleanupPreload();

    if (blitzTimerInterval) {
        clearInterval(blitzTimerInterval);
        blitzTimerInterval = null;
    }

    const prevHigh = getBlitzHighScore();
    const isNewHigh = blitzScore > prevHigh;
    if (isNewHigh) saveBlitzHighScore(blitzScore);

    saveBlitzRun();
    renderBlitzResults(isNewHigh);
}

// ============================================
// STORAGE
// ============================================

function getBlitzHighScore() {
    return storageGet('xenoHeardle_blitz_highscore') || 0;
}

function saveBlitzHighScore(score) {
    storageSet('xenoHeardle_blitz_highscore', score);
}

function saveBlitzRun() {
    // Determine which game was played (for Single Game mode)
    const game = (currentMode === 'random' && endlessLockedGame) ? endlessLockedGame : null;
    saveToBlitzHistory(currentMode, blitzScore, blitzSongsCorrect, blitzHistory.length, blitzBestCombo, game);
}

// ============================================
// UI UPDATES
// ============================================

function updateBlitzTimer() {
    const fill = document.getElementById('blitzTimerFill');
    const text = document.getElementById('blitzTimerText');

    if (fill) {
        const pct = (blitzTimeLeft / BLITZ_DURATION) * 100;
        fill.style.width = pct + '%';

        fill.classList.remove('blitz-timer-warning', 'blitz-timer-critical');
        if (blitzTimeLeft <= 10) {
            fill.classList.add('blitz-timer-critical');
        } else if (blitzTimeLeft <= 20) {
            fill.classList.add('blitz-timer-warning');
        }
    }
    if (text) text.textContent = blitzTimeLeft + 's';
}

function updateBlitzScore() {
    const scoreEl = document.getElementById('blitzScoreDisplay');
    const comboEl = document.getElementById('blitzComboDisplay');
    const comboBox = document.getElementById('blitzComboBox');

    if (scoreEl && blitzScore !== displayedBlitzScore) {
        // Read current displayed number so overlapping animations chain smoothly
        const currentDisplayed = parseInt(scoreEl.textContent) || displayedBlitzScore;
        animateScoreCount(scoreEl, currentDisplayed, blitzScore, 400);
        displayedBlitzScore = blitzScore;
    }
    if (comboEl) {
        const newCombo = blitzCombo;
        if (newCombo !== prevBlitzCombo) {
            // Slide animation: up for increase, down for decrease/reset
            const direction = newCombo > prevBlitzCombo ? 'up' : 'down';
            comboEl.classList.remove('blitz-combo-slide-up', 'blitz-combo-slide-down');
            void comboEl.offsetWidth;
            comboEl.classList.add(`blitz-combo-slide-${direction}`);
            // Swap text mid-animation
            setTimeout(() => { comboEl.textContent = `×${newCombo}`; }, 150);

            // Shake on choke (combo decreased)
            if (comboBox && newCombo < prevBlitzCombo) {
                comboBox.classList.remove('blitz-combo-choke');
                void comboBox.offsetWidth;
                comboBox.classList.add('blitz-combo-choke');
            }

            prevBlitzCombo = newCombo;
        }

        // Update color classes
        comboEl.className = comboEl.className.replace(/\bblitz-combo-(mid|high|max)\b/g, '').trim();
        if (!comboEl.classList.contains('blitz-combo')) comboEl.classList.add('blitz-combo');
        if (newCombo >= 4) comboEl.classList.add('blitz-combo-max');
        else if (newCombo >= 3) comboEl.classList.add('blitz-combo-high');
        else if (newCombo >= 2) comboEl.classList.add('blitz-combo-mid');
    }

    // Fire visibility at max combo
    if (comboBox) {
        comboBox.classList.toggle('blitz-combo-fire-active', blitzCombo >= 4);
    }
}

function updateBlitzSongCounter() {
    const el = document.getElementById('blitzSongCounter');
    if (el) el.textContent = `#${blitzSongsAttempted}`;
}

/**
 * Build HTML rows for blitz song history.
 * @param {string} prefix - CSS class prefix ('blitz-history' or 'blitz-recap')
 */
function buildBlitzHistoryRows(prefix) {
    let html = '';
    blitzHistory.forEach(entry => {
        const game = GAMES[entry.song.game];
        const color = game ? game.color : '#888';
        const icon = entry.correct ? '✓' : '✗';
        const cls = entry.correct ? `${prefix}-correct` : `${prefix}-wrong`;
        const title = getDisplayTitle(entry.song);
        const pts = entry.correct ? `+${entry.points}` : '';
        html += `<div class="${prefix}-row ${cls}">
            <span class="${prefix}-icon">${icon}</span>
            <span class="${prefix}-title" style="border-left: 3px solid ${color}">${escapeHtml(title)}</span>
            <span class="${prefix}-pts">${pts}</span>
        </div>`;
    });
    return html;
}

function updateBlitzHistoryDisplay() {
    const container = document.getElementById('blitzHistory');
    if (!container) return;
    container.innerHTML = buildBlitzHistoryRows('blitz-history');
    container.scrollTop = container.scrollHeight;
}

function showBlitzFeedback(type, points = 0) {
    if (type === 'wrong') {
        const input = document.getElementById('blitzSearchInput');
        if (input) {
            input.classList.remove('blitz-shake');
            void input.offsetWidth;
            input.classList.add('blitz-shake');
        }
    }
    // correct/skip feedback is shown via the history list
}

// ============================================
// RENDER: RESULTS (in gameContainer)
// ============================================

function renderBlitzResults(isNewHigh) {
    const container = document.getElementById('gameContainer');
    container.classList.add('results-screen');

    // Hide game selector banner on results screen
    const banner = document.getElementById('dailyGameBanner');
    if (banner) banner.style.display = 'none';

    const l = locale.blitz || {};
    const accuracy = blitzHistory.length > 0
        ? Math.round((blitzSongsCorrect / blitzHistory.length) * 100)
        : 0;

    let html = '<div class="result-message">';

    // Header
    html += `<div class="blitz-results-header">`;
    if (isNewHigh) {
        html += `<p class="blitz-new-high-tag">${l.newHighScore || 'New High Score!'}</p>`;
    }
    html += `<div class="blitz-final-score">${blitzScore}<span class="blitz-final-pts">${l.pts || 'pts'}</span></div>`;
    html += `</div>`;

    // Stats — 3 key stats only
    html += '<div class="stats-grid blitz-stats-grid">';
    html += `<div class="stat-box"><div class="stat-value">${blitzSongsCorrect}/${blitzHistory.length}</div><div class="stat-label">${l.songsGuessed || 'Songs'}</div></div>`;
    html += `<div class="stat-box"><div class="stat-value">${accuracy}%</div><div class="stat-label">${l.accuracy || 'Accuracy'}</div></div>`;
    html += `<div class="stat-box"><div class="stat-value">×${blitzBestCombo}</div><div class="stat-label">${l.bestCombo || 'Best Combo'}</div></div>`;
    html += '</div>';

    // Song recap
    if (blitzHistory.length > 0) {
        html += '<div class="blitz-recap">';
        html += buildBlitzHistoryRows('blitz-recap');
        html += '</div>';
    }

    html += '</div>'; // .result-message

    // Share section (reusing existing styles)
    html += '<div class="share-section">';
    html += '<div class="share-actions">';
    html += `<button class="share-action-btn copy-btn" onclick="copyBlitzResults()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>${locale.copyResults || 'Copy'}</span></button>`;
    html += `<button class="share-action-btn tweet-btn" onclick="tweetBlitzResults()"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg><span>Tweet</span></button>`;
    html += '</div>';
    html += '</div>';

    // Action button (play again only, exit via blitz toggle button)
    html += '<div class="button-container blitz-result-actions">';
    html += `<button class="submit-button" onclick="startBlitzRound()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> ${l.playAgain || 'Play Again'}</button>`;
    html += '</div>';

    container.innerHTML = html;

    // Animate final score counting up from 0
    const finalScoreEl = container.querySelector('.blitz-final-score');
    if (finalScoreEl && blitzScore > 0) {
        // Store the pts span since animateScoreCount overwrites textContent
        const ptsSpan = finalScoreEl.querySelector('.blitz-final-pts');
        const ptsHtml = ptsSpan ? ptsSpan.outerHTML : '';
        // Use a dedicated counter span so we don't lose the pts span
        finalScoreEl.innerHTML = `<span class="blitz-final-num">0</span>${ptsHtml}`;
        const numEl = finalScoreEl.querySelector('.blitz-final-num');
        animateScoreCount(numEl, 0, blitzScore, 1500);
    }
}

// ============================================
// SHARE
// ============================================

function buildBlitzShareText() {
    const accuracy = blitzHistory.length > 0
        ? Math.round((blitzSongsCorrect / blitzHistory.length) * 100)
        : 0;

    // Mode name (localized)
    let modeName = GAME_MODES[currentMode]?.name || currentMode;
    if (locale?.modes?.[currentMode]?.name) {
        modeName = locale.modes[currentMode].name;
    }

    // Game name for Single Game mode
    let gameName = '';
    if (currentMode === 'random' && endlessLockedGame) {
        const game = GAMES[endlessLockedGame];
        if (game) gameName = ` — ${game.name}`;
    }

    let text = `Xeno Series Heardle ⚡ BLITZ\n`;
    text += `🎮 ${modeName}${gameName}\n`;
    text += `💯 ${blitzScore} pts | 🎯 ${blitzSongsCorrect}/${blitzHistory.length} | 🔥 ×${blitzBestCombo}`;
    return text;
}

function copyBlitzResults() {
    const text = buildBlitzShareText();
    navigator.clipboard.writeText(text).then(() => {
        const button = document.querySelector('.copy-btn');
        if (button) {
            const span = button.querySelector('span');
            const originalText = span.textContent;
            span.textContent = locale.copied || 'Copied!';
            setTimeout(() => {
                span.textContent = originalText;
            }, 2000);
        }
    });
}

function tweetBlitzResults() {
    const text = buildBlitzShareText();
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(tweetUrl, '_blank');
}
