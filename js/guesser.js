// ============================================
// Game Guessr MODE — Pick the right game from two covers
// ============================================
// Overlay mode like Endless/Blitz. Player hears a song and picks
// which game it belongs to between two cover art choices (A/B).
// 3 lives, floating feedback, recap screen with share text.

const GUESSER_MAX_LIVES = 3;
const GUESSER_SONG_TIME = 15;        // 15 seconds per song
const GUESSER_BASE_POINTS = 50;      // Minimum points for correct answer
const GUESSER_TIME_MULTIPLIER = 30;  // Points per second remaining
// Max points per song: 50 + 15×30 = 500 (instant answer)
// Min points per song: 50 + 0×30 = 50 (answered at last second)

// State
let guesserActive = false;
let guesserGameOver = false;
let guesserLives = GUESSER_MAX_LIVES;
let guesserCorrect = 0;
let guesserScore = 0;              // Total points
let guesserTimeLeft = 0;           // Seconds left on current song
let guesserTimerInterval = null;   // setInterval ref
let displayedGuesserScore = 0;     // For animateGuesserScore tracking
let guesserScoreAnimFrame = null;  // For animation cancellation
let guesserCurrentSong = null;
let guesserAudio = null;
let guesserHistory = [];
let guesserChoiceA = null;   // { gameId, name, shortName, coverPath }
let guesserChoiceB = null;
let guesserCorrectSide = null; // 'A' or 'B'
let guesserBestStreak = 0;
let guesserCurrentStreak = 0;
let preloadedGuesserSong = null;
let preloadedGuesserAudio = null;
let guesserWaiting = false; // true while feedback delay is pending
let guesserUnlocked = false; // unlocked by typing secret code

// ============================================
// SECRET UNLOCK CODE
// ============================================

const GUESSER_SECRET_CODE = 'idiotexperimenteur';
let guesserSecretBuffer = '';

document.addEventListener('keydown', (e) => {
    if (guesserUnlocked) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key.length !== 1) return; // ignore modifier keys, arrows, etc.

    guesserSecretBuffer += e.key.toLowerCase();
    if (guesserSecretBuffer.length > GUESSER_SECRET_CODE.length) {
        guesserSecretBuffer = guesserSecretBuffer.slice(-GUESSER_SECRET_CODE.length);
    }

    if (guesserSecretBuffer === GUESSER_SECRET_CODE) {
        guesserUnlocked = true;
        guesserSecretBuffer = '';
        updateGuesserButtonVisibility();
    }
});

// ============================================
// GAME LIST FOR CURRENT MODE
// ============================================

/**
 * Get the list of game IDs for the current mode.
 * DLCs are treated as their own separate games.
 */
function getGuesserVisualGames() {
    return GAME_MODES[currentMode]?.games || [];
}

// ============================================
// WRONG GAME SELECTION
// ============================================

/**
 * Pick a random wrong game ID for the current mode.
 */
function pickWrongGame(correctGameId) {
    const candidates = getGuesserVisualGames().filter(id => id !== correctGameId);
    if (candidates.length === 0) return correctGameId; // fallback: shouldn't happen
    return candidates[Math.floor(Math.random() * candidates.length)];
}

// ============================================
// CHOICE SETUP
// ============================================

function setupGuesserChoices(song) {
    const correctId = song.game;
    const wrongId = pickWrongGame(correctId);

    const correctGame = GAMES[correctId];
    const wrongGame = GAMES[wrongId];

    const correctChoice = {
        gameId: correctId,
        name: correctGame ? correctGame.name : correctId,
        shortName: correctGame ? correctGame.shortName : correctId,
        coverPath: `images/${correctId}/cover.jpg`
    };

    const wrongChoice = {
        gameId: wrongId,
        name: wrongGame ? wrongGame.name : wrongId,
        shortName: wrongGame ? wrongGame.shortName : wrongId,
        coverPath: `images/${wrongId}/cover.jpg`
    };

    // Randomly assign to side A or B
    if (Math.random() < 0.5) {
        guesserChoiceA = correctChoice;
        guesserChoiceB = wrongChoice;
        guesserCorrectSide = 'A';
    } else {
        guesserChoiceA = wrongChoice;
        guesserChoiceB = correctChoice;
        guesserCorrectSide = 'B';
    }
}

// ============================================
// SONG POOL
// ============================================

function getGuesserSongPool() {
    return getSongsForMode(currentMode);
}

function pickGuesserSong() {
    const songs = getGuesserSongPool();
    const song = songs[Math.floor(Math.random() * songs.length)];
    const minRequired = 16;
    const maxStart = Math.max(0, song.duration - minRequired);
    const startTime = maxStart > 0 ? Math.floor(Math.random() * (maxStart + 1)) : 0;
    return { ...song, startTime };
}

// ============================================
// THEME
// ============================================

function applyGuesserTheme() {
    currentGamemodeLink.setAttribute('href', `themes/gamemodes/${currentMode}.css`);
    currentGameLink.setAttribute('href', '');
    setBackground(getBackgroundUrl(currentMode));
}

// ============================================
// SCORE ANIMATION
// ============================================

/**
 * Animate guesser score counting from `from` to `to` with a scale pulse.
 * Uses its own animation frame ref to avoid conflicting with blitz.
 */
function animateGuesserScore(el, from, to, duration) {
    if (guesserScoreAnimFrame) {
        cancelAnimationFrame(guesserScoreAnimFrame);
        guesserScoreAnimFrame = null;
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
            guesserScoreAnimFrame = requestAnimationFrame(tick);
        } else {
            el.textContent = to;
            el.style.transform = '';
            guesserScoreAnimFrame = null;
        }
    }

    guesserScoreAnimFrame = requestAnimationFrame(tick);
}

// ============================================
// TIMER
// ============================================

function startGuesserTimer() {
    stopGuesserTimer();
    guesserTimeLeft = GUESSER_SONG_TIME;
    updateGuesserTimerDisplay();
    guesserTimerInterval = setInterval(() => {
        guesserTimeLeft--;
        updateGuesserTimerDisplay();
        if (guesserTimeLeft <= 0) {
            // Time's up — treat as wrong answer
            stopGuesserTimer();
            guesserLives--;
            guesserCurrentStreak = 0;

            const correctGameId = guesserCorrectSide === 'A' ? guesserChoiceA.gameId : guesserChoiceB.gameId;
            guesserHistory.push({
                song: guesserCurrentSong,
                correct: false,
                correctGameId: correctGameId,
                points: 0
            });

            showGuesserFeedback(false, null); // null = timeout, highlight correct only
            updateGuesserLives();
            updateGuesserScore();
            updateGuesserHistoryDisplay();

            guesserWaiting = true;
            setTimeout(() => {
                guesserWaiting = false;
                if (guesserLives <= 0) {
                    endGuesser();
                } else {
                    nextGuesserSong();
                }
            }, 1000);
        }
    }, 1000);
}

function stopGuesserTimer() {
    if (guesserTimerInterval) {
        clearInterval(guesserTimerInterval);
        guesserTimerInterval = null;
    }
}

function updateGuesserTimerDisplay() {
    const fill = document.getElementById('guesserTimerFill');
    const text = document.getElementById('guesserTimerText');

    if (fill) {
        const pct = guesserTimeLeft / GUESSER_SONG_TIME;
        fill.style.transform = `scaleX(${pct})`;

        fill.classList.remove('warning', 'critical');
        if (guesserTimeLeft <= 3) {
            fill.classList.add('critical');
        } else if (guesserTimeLeft <= 5) {
            fill.classList.add('warning');
        }
    }
    if (text) text.textContent = guesserTimeLeft + 's';
}

// ============================================
// TOGGLE (like Endless/Blitz)
// ============================================

function updateGuesserButtonVisibility() {
    const btn = document.getElementById('guesserButton');
    if (!btn) return;
    // Hidden until secret code typed, and not available on Single Game mode
    if (!guesserUnlocked || currentMode === 'random') {
        btn.style.display = 'none';
    } else {
        btn.style.display = '';
    }
}

function toggleGuesserMode() {
    if (!guesserUnlocked || currentMode === 'random') return;
    if (guesserActive) {
        deactivateGuesser();
    } else {
        activateGuesser();
    }
}

function activateGuesser() {
    // Deactivate endless if active
    if (endlessMode) {
        endlessMode = false;
        const endBtn = document.getElementById('endlessButton');
        if (endBtn) endBtn.classList.remove('active');
        const endLabel = document.getElementById('endlessModeLabel');
        if (endLabel) endLabel.classList.remove('visible');
    }

    // Deactivate blitz if active
    if (typeof blitzActive !== 'undefined' && blitzActive) {
        deactivateBlitz();
    }

    // Cleanup existing audio
    destroyPlayer();
    destroyResultPlayer();
    clearInterval(window.countdownInterval);

    guesserActive = true;

    // Button active state
    const btn = document.getElementById('guesserButton');
    if (btn) btn.classList.add('active');

    // Label
    const label = document.getElementById('guesserModeLabel');
    if (label) {
        label.textContent = locale.guesser?.name || 'Game Guessr';
        label.classList.remove('hiding');
        label.classList.add('visible');
    }

    applyGuesserTheme();
    startGuesserRound();
}

function deactivateGuesser() {
    guesserActive = false;
    guesserGameOver = false;
    stopGuesserTimer();
    stopGuesserAudio();
    cleanupGuesserPreload();

    // Remove guesser UI state classes
    const container = document.getElementById('gameContainer');
    if (container) {
        container.classList.remove('guesser-active', 'results-screen');
    }

    // Button
    const btn = document.getElementById('guesserButton');
    if (btn) btn.classList.remove('active');

    // Label
    const label = document.getElementById('guesserModeLabel');
    if (label) {
        label.classList.remove('visible');
        label.classList.add('hiding');
        label.addEventListener('animationend', () => {
            label.classList.remove('hiding');
        }, { once: true });
    }

    // Return to normal game
    dailySong = getDailySong(currentMode);
    renderModeSelector(currentMode, locale);
    updateDailyGameBanner(currentMode, dailySong, locale);
    loadAndDisplay();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// ROUND START
// ============================================

function startGuesserRound() {
    guesserLives = GUESSER_MAX_LIVES;
    guesserCorrect = 0;
    guesserScore = 0;
    displayedGuesserScore = 0;
    if (guesserScoreAnimFrame) {
        cancelAnimationFrame(guesserScoreAnimFrame);
        guesserScoreAnimFrame = null;
    }
    guesserHistory = [];
    guesserCurrentStreak = 0;
    guesserBestStreak = 0;
    guesserActive = true;
    guesserGameOver = false;
    guesserWaiting = false;
    cleanupGuesserPreload();

    // Hide the daily game banner
    const banner = document.getElementById('dailyGameBanner');
    if (banner) banner.style.display = 'none';

    stopGuesserAudio();
    nextGuesserSong();
}

// ============================================
// SONG CYCLING
// ============================================

function nextGuesserSong() {
    if (guesserGameOver) return;

    // Use preloaded song if available
    if (preloadedGuesserSong && preloadedGuesserAudio) {
        guesserCurrentSong = preloadedGuesserSong;
        const audio = preloadedGuesserAudio;
        preloadedGuesserSong = null;
        preloadedGuesserAudio = null;
        setupGuesserChoices(guesserCurrentSong);
        renderGuesserGame();
        playGuesserSong(audio);
    } else {
        guesserCurrentSong = pickGuesserSong();
        setupGuesserChoices(guesserCurrentSong);
        renderGuesserGame();
        playGuesserSong(null);
    }

    // Start countdown timer for this song
    startGuesserTimer();

    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        console.log('[GUESSER] Answer:', guesserCurrentSong.title, '→', guesserCurrentSong.game);
    }

    // Preload next song in parallel
    preloadNextGuesserSong();
}

// ============================================
// AUDIO — continuous playback
// ============================================

function playGuesserSong(preloadedAudio) {
    stopGuesserAudio();

    const url = getAudioUrl(guesserCurrentSong);
    if (!url) {
        if (preloadedAudio) {
            preloadedAudio.removeAttribute('src');
            preloadedAudio.load();
        }
        return;
    }

    const startPos = guesserCurrentSong.startTime || 0;

    if (preloadedAudio) {
        guesserAudio = preloadedAudio;
    } else {
        guesserAudio = new Audio(url);
        guesserAudio.volume = globalVolume;
        guesserAudio.preload = 'auto';
    }

    const audioRef = guesserAudio;

    const onReady = () => {
        if (!guesserActive || audioRef !== guesserAudio) return;
        audioRef.currentTime = startPos;
        audioRef.play().catch(() => {});
    };

    if (audioRef.readyState >= 3) {
        onReady();
    } else {
        audioRef.addEventListener('canplaythrough', onReady, { once: true });
    }

    // Loop on end
    audioRef.addEventListener('ended', () => {
        if (!guesserActive || audioRef !== guesserAudio) return;
        audioRef.currentTime = 0;
        audioRef.play().catch(() => {});
    });

    // Fallback
    setTimeout(() => {
        if (audioRef === guesserAudio && guesserActive && audioRef.paused) {
            audioRef.currentTime = startPos;
            audioRef.play().catch(() => {});
        }
    }, 3000);

    if (!preloadedAudio) guesserAudio.load();
}

function stopGuesserAudio() {
    if (guesserAudio) {
        guesserAudio.pause();
        guesserAudio.removeAttribute('src');
        guesserAudio.load();
        guesserAudio = null;
    }
}

function preloadNextGuesserSong() {
    cleanupGuesserPreload();
    preloadedGuesserSong = pickGuesserSong();
    const url = getAudioUrl(preloadedGuesserSong);
    if (!url) {
        preloadedGuesserSong = null;
        return;
    }
    preloadedGuesserAudio = new Audio(url);
    preloadedGuesserAudio.preload = 'auto';
    preloadedGuesserAudio.volume = globalVolume;
    preloadedGuesserAudio.load();
}

function cleanupGuesserPreload() {
    if (preloadedGuesserAudio) {
        preloadedGuesserAudio.removeAttribute('src');
        preloadedGuesserAudio.load();
        preloadedGuesserAudio = null;
    }
    preloadedGuesserSong = null;
}

// ============================================
// RENDER: GAME UI
// ============================================

function renderGuesserGame() {
    const container = document.getElementById('gameContainer');
    container.classList.remove('results-screen');
    container.classList.add('guesser-active');

    const l = locale.guesser || {};
    const isMobile = window.innerWidth <= 900;

    let html = '';

    // Choice cards (above the UI)
    html += '<div class="guesser-choices">';

    const nameA = isMobile ? guesserChoiceA.shortName : guesserChoiceA.name;
    const nameB = isMobile ? guesserChoiceB.shortName : guesserChoiceB.name;

    html += `<button class="guesser-choice" data-side="A" id="guesserChoiceA">
        <div class="guesser-cover-wrapper">
            <div class="guesser-cover" id="guesserCoverA">
                <div class="result-cover-glare"></div>
                <img src="${guesserChoiceA.coverPath}" alt="${escapeHtml(guesserChoiceA.name)}" draggable="false">
            </div>
        </div>
        <div class="guesser-game-name">${escapeHtml(nameA)}</div>
    </button>`;

    html += `<div class="guesser-or">${l.or || 'OR'}</div>`;

    html += `<button class="guesser-choice" data-side="B" id="guesserChoiceB">
        <div class="guesser-cover-wrapper">
            <div class="guesser-cover" id="guesserCoverB">
                <div class="result-cover-glare"></div>
                <img src="${guesserChoiceB.coverPath}" alt="${escapeHtml(guesserChoiceB.name)}" draggable="false">
            </div>
        </div>
        <div class="guesser-game-name">${escapeHtml(nameB)}</div>
    </button>`;

    html += '</div>'; // .guesser-choices

    // Guesser banner (below covers)
    html += '<div class="guesser-banner">';

    // Lives bar
    html += '<div class="guesser-lives" id="guesserLives">';
    for (let i = 0; i < GUESSER_MAX_LIVES; i++) {
        const empty = i >= guesserLives ? ' empty' : '';
        html += `<div class="guesser-life-bar${empty}"></div>`;
    }
    html += '</div>';

    // Timer bar (text outside bar so overflow:hidden doesn't clip it)
    html += `<div class="guesser-timer-wrapper"><div class="guesser-timer-bar"><div class="guesser-timer-fill" id="guesserTimerFill"></div></div><span class="guesser-timer-text" id="guesserTimerText">${GUESSER_SONG_TIME}s</span></div>`;

    // Score (animated points)
    const ptsLabel = l.pts || locale.blitz?.pts || 'pts';
    html += `<div class="guesser-score" id="guesserScore"><span class="guesser-points" id="guesserPoints">${displayedGuesserScore}</span><span class="guesser-pts-label">${ptsLabel}</span></div>`;

    // History rows (scrollable)
    html += '<div class="guesser-history" id="guesserHistory">';
    html += buildGuesserHistoryRows('guesser-history');
    html += '</div>';

    html += '</div>'; // .guesser-banner

    container.innerHTML = html;

    // Wire up choice click listeners
    const choiceA = document.getElementById('guesserChoiceA');
    const choiceB = document.getElementById('guesserChoiceB');
    if (choiceA) choiceA.addEventListener('click', () => submitGuesserChoice('A'));
    if (choiceB) choiceB.addEventListener('click', () => submitGuesserChoice('B'));

    // Init 3D hover on covers
    initGuesserCover3D('guesserCoverA');
    initGuesserCover3D('guesserCoverB');
}

// ============================================
// COVER 3D EFFECT
// ============================================

function initGuesserCover3D(coverId) {
    const cover = document.getElementById(coverId);
    if (!cover) return;

    const wrapper = cover.parentElement; // .guesser-cover-wrapper — larger hit area
    if (!wrapper) return;

    const glare = cover.querySelector('.result-cover-glare');

    wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * 30;
        const rotateX = (0.5 - y) * 30;

        cover.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;

        if (glare) {
            glare.style.opacity = '1';
            const glareX = (e.clientX - cover.getBoundingClientRect().left) / cover.getBoundingClientRect().width * 100;
            const glareY = (e.clientY - cover.getBoundingClientRect().top) / cover.getBoundingClientRect().height * 100;
            glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.35) 0%, transparent 60%)`;
        }
    });

    wrapper.addEventListener('mouseleave', () => {
        cover.style.transform = '';
        if (glare) {
            glare.style.opacity = '0';
        }
    });
}

// ============================================
// GAME LOGIC
// ============================================

function submitGuesserChoice(side) {
    if (!guesserActive || guesserGameOver || guesserWaiting) return;
    guesserWaiting = true;
    stopGuesserTimer();

    // Prevent double-click during feedback
    const choiceA = document.getElementById('guesserChoiceA');
    const choiceB = document.getElementById('guesserChoiceB');
    if (choiceA) choiceA.style.pointerEvents = 'none';
    if (choiceB) choiceB.style.pointerEvents = 'none';

    const isCorrect = side === guesserCorrectSide;
    const correctGameId = guesserCorrectSide === 'A' ? guesserChoiceA.gameId : guesserChoiceB.gameId;

    // Calculate points
    const points = isCorrect ? GUESSER_BASE_POINTS + Math.floor(guesserTimeLeft * GUESSER_TIME_MULTIPLIER) : 0;

    if (isCorrect) {
        guesserCorrect++;
        guesserScore += points;
        guesserCurrentStreak++;
        if (guesserCurrentStreak > guesserBestStreak) {
            guesserBestStreak = guesserCurrentStreak;
        }
    } else {
        guesserLives--;
        guesserCurrentStreak = 0;
    }

    guesserHistory.push({
        song: guesserCurrentSong,
        correct: isCorrect,
        correctGameId: correctGameId,
        points: points
    });

    showGuesserFeedback(isCorrect, side, points);
    updateGuesserLives();
    updateGuesserScore();
    updateGuesserHistoryDisplay();

    // Delay before next song or end
    const delay = isCorrect ? 600 : 1000;
    setTimeout(() => {
        guesserWaiting = false;
        if (guesserLives <= 0) {
            endGuesser();
        } else {
            nextGuesserSong();
        }
    }, delay);
}

// ============================================
// FEEDBACK
// ============================================

function showGuesserFeedback(isCorrect, chosenSide, points = 0) {
    const correctSideEl = document.getElementById(guesserCorrectSide === 'A' ? 'guesserChoiceA' : 'guesserChoiceB');
    const chosenEl = chosenSide ? document.getElementById(chosenSide === 'A' ? 'guesserChoiceA' : 'guesserChoiceB') : null;

    if (isCorrect) {
        if (correctSideEl) correctSideEl.classList.add('correct-flash');
    } else {
        if (chosenEl) chosenEl.classList.add('wrong-flash');
        if (correctSideEl) correctSideEl.classList.add('correct-flash');
    }

    // Floating feedback on chosen card (or correct card if timeout)
    const feedbackEl = chosenEl || correctSideEl;
    if (feedbackEl) {
        const floater = document.createElement('div');
        floater.className = 'guesser-float-feedback';
        if (isCorrect) {
            floater.textContent = `+${points}`;
            floater.style.color = 'rgba(0, 255, 150, 0.9)';
        } else {
            floater.textContent = '✗';
            floater.style.color = 'rgba(255, 50, 50, 0.9)';
        }
        feedbackEl.appendChild(floater);
    }
}

// ============================================
// UI UPDATES
// ============================================

function updateGuesserLives() {
    const container = document.getElementById('guesserLives');
    if (!container) return;
    const bars = container.querySelectorAll('.guesser-life-bar');
    bars.forEach((bar, i) => {
        if (i >= guesserLives) {
            bar.classList.add('empty');
        } else {
            bar.classList.remove('empty');
        }
    });
}

function updateGuesserScore() {
    const el = document.getElementById('guesserPoints');
    if (el && guesserScore !== displayedGuesserScore) {
        const currentDisplayed = parseInt(el.textContent) || displayedGuesserScore;
        animateGuesserScore(el, currentDisplayed, guesserScore, 400);
        displayedGuesserScore = guesserScore;
    }
}

function buildGuesserHistoryRows(prefix) {
    let html = '';
    guesserHistory.forEach(entry => {
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

function updateGuesserHistoryDisplay() {
    const container = document.getElementById('guesserHistory');
    if (!container) return;
    container.innerHTML = buildGuesserHistoryRows('guesser-history');
    container.scrollTop = container.scrollHeight;
}

// ============================================
// END GAME
// ============================================

function endGuesser() {
    guesserGameOver = true;
    stopGuesserTimer();
    stopGuesserAudio();
    cleanupGuesserPreload();

    saveToGuesserHistory(currentMode, guesserCorrect, guesserHistory.length, guesserBestStreak, guesserScore, null);

    renderGuesserResults();
}

// ============================================
// RENDER: RESULTS
// ============================================

function renderGuesserResults() {
    const container = document.getElementById('gameContainer');
    container.classList.add('results-screen');
    container.classList.remove('guesser-active');

    // Hide game selector banner on results
    const banner = document.getElementById('dailyGameBanner');
    if (banner) banner.style.display = 'none';

    const l = locale.guesser || {};

    const ptsLabel = l.pts || locale.blitz?.pts || 'pts';

    let html = '<div class="result-message">';

    // Score header (animated total points)
    html += '<div class="guesser-results-header">';
    html += `<div class="guesser-final-score"><span class="guesser-final-num">0</span><span class="guesser-final-pts">${ptsLabel}</span></div>`;
    html += `<p class="guesser-final-subtitle">${guesserCorrect} ${l.songsFound || 'songs found'}</p>`;
    html += '</div>';

    // Stats grid
    const attempted = guesserHistory.length;
    const accuracy = attempted > 0 ? Math.round((guesserCorrect / attempted) * 100) : 0;
    html += '<div class="stats-grid guesser-stats-grid">';
    html += `<div class="stat-box"><div class="stat-value">${guesserCorrect}</div><div class="stat-label">${l.correct || 'Correct'}</div></div>`;
    html += `<div class="stat-box"><div class="stat-value">${accuracy}%</div><div class="stat-label">${l.accuracy || 'Accuracy'}</div></div>`;
    html += `<div class="stat-box"><div class="stat-value">${guesserBestStreak}</div><div class="stat-label">${l.bestStreak || 'Best Streak'}</div></div>`;
    html += '</div>';

    // Song recap
    if (guesserHistory.length > 0) {
        html += '<div class="guesser-recap">';
        html += buildGuesserHistoryRows('guesser-recap');
        html += '</div>';
    }

    html += '</div>'; // .result-message

    // Share section
    html += '<div class="share-section">';
    html += '<div class="share-actions">';
    html += `<button class="share-action-btn copy-btn" onclick="copyGuesserResults()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>${locale.copyResults || 'Copy'}</span></button>`;
    html += `<button class="share-action-btn tweet-btn" onclick="tweetGuesserResults()"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg><span>Tweet</span></button>`;
    html += '</div>';
    html += '</div>';

    // Play again
    html += '<div class="button-container guesser-result-actions">';
    html += `<button class="submit-button" onclick="startGuesserRound()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg> ${l.playAgain || 'Play Again'}</button>`;
    html += '</div>';

    container.innerHTML = html;

    // Animate final score counting up from 0
    if (guesserScore > 0) {
        const numEl = container.querySelector('.guesser-final-num');
        if (numEl) {
            animateGuesserScore(numEl, 0, guesserScore, 1500);
        }
    }
}

// ============================================
// SHARE
// ============================================

function buildGuesserShareText() {
    let modeName = GAME_MODES[currentMode]?.name || currentMode;
    if (locale?.modes?.[currentMode]?.name) {
        modeName = locale.modes[currentMode].name;
    }

    let text = `Xeno Series Heardle 🎯 Game Guessr\n`;
    text += `🎮 ${modeName}\n`;
    text += `💯 ${guesserScore} pts | ✅ ${guesserCorrect} ${locale.guesser?.songsFound || 'songs found'}`;
    return text;
}

function copyGuesserResults() {
    const text = buildGuesserShareText();
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

function tweetGuesserResults() {
    const text = buildGuesserShareText();
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(tweetUrl, '_blank');
}
