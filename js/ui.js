// ============================================
// UI RENDERING & DOM MANIPULATION
// ============================================

// MAX_ATTEMPTS is defined in game.js

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderModeSelector(currentMode, locale = null) {
    const container = document.getElementById('modeSelector');
    let html = '';

    Object.values(GAME_MODES).forEach(mode => {
        const isActive = mode.id === currentMode ? 'active' : '';

        // Use localized names if available
        let modeName = mode.name;
        let modeDesc = mode.description;

        if (locale && locale.modes && locale.modes[mode.id]) {
            modeName = locale.modes[mode.id].name;
            modeDesc = locale.modes[mode.id].description;
        }

        // Only show description for random mode
        const showDesc = mode.id === 'random';

        html += `
            <div class="mode-tab ${isActive}" data-mode="${mode.id}" onclick="switchMode('${mode.id}')">
                <span class="mode-tab-name">${modeName}</span>
                ${showDesc ? `<span class="mode-tab-desc">${modeDesc}</span>` : ''}
            </div>
        `;
    });

    container.innerHTML = html;
}

function updateDailyGameBanner(currentMode, dailySong, locale = null) {
    const banner = document.getElementById('dailyGameBanner');
    const mode = GAME_MODES[currentMode];

    if (mode && mode.showDailyGame && dailySong && dailySong.dailyGame) {
        const todayGameText = locale ? locale.todayGame : "Today's Game";
        banner.style.display = 'block';
        banner.innerHTML = `
            <div class="daily-game-title">${todayGameText}</div>
            <div class="daily-game-name">${dailySong.dailyGame.name}</div>
        `;
    } else {
        banner.style.display = 'none';
    }
}

function renderGame(currentMode, dailySong, currentAttempt, guesses, locale) {
    const container = document.getElementById('gameContainer');

    // Remove results-screen class if it exists
    container.classList.remove('results-screen');

    let html = '';

    // 1. Audio player first
    html += `
        <div class="audio-player">
            <div class="play-button" id="playButton"></div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="time-labels">
                    <span id="currentTimeLabel">0s</span>
                    <span id="maxTimeLabel">${DURATIONS[currentAttempt]}s</span>
                </div>
            </div>
        </div>
    `;

    // 2. Search section with filters and input
    html += '<div class="search-section">';

    // Game filter chips (hidden in random mode since we know the daily game)
    const mode = GAME_MODES[currentMode];
    if (!mode.hideGameFilters) {
        const modeGames = mode.games;
        html += '<div class="game-filters" id="gameFilters">';
        modeGames.forEach(gameId => {
            const game = GAMES[gameId];
            if (game) {
                html += `<button class="game-filter-chip active" data-game="${gameId}" style="--chip-color: ${game.color}">${escapeHtml(game.shortName)}</button>`;
            }
        });
        html += '</div>';
    }

    html += `
        <div class="search-container">
            <span class="search-icon">🔍</span>
            <input type="text" class="search-input" id="searchInput" placeholder="${locale.search}" autocomplete="off">
            <div class="autocomplete-list" id="autocompleteList"></div>
        </div>
    `;

    if (currentAttempt >= MAX_ATTEMPTS - 1) {
        html += `
        <div class="button-container">
            <button class="give-up-button" id="giveUpButton">${locale.giveUp}</button>
            <button class="submit-button" id="submitButton" disabled>${locale.submit}</button>
        </div>
        `;
    } else {
        html += `
        <div class="button-container">
            <button class="skip-button" id="skipButton">${locale.skip} +${DURATIONS[Math.min(currentAttempt + 1, MAX_ATTEMPTS - 1)] - DURATIONS[currentAttempt]}s</button>
            <button class="submit-button" id="submitButton" disabled>${locale.submit}</button>
        </div>
        `;
    }

    html += '</div>'; // Close search-section

    // 3. Guess boxes last
    html += '<div class="guess-boxes">';

    if (checkSpecialDate()) {
        html += '<img src="images/patate.png" class="special-img" alt="Special" />';
    }

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        let className = 'guess-box';
        let content = '';

        if (guesses[i]) {
            if (guesses[i] === 'skip') {
                className += ' skipped';
                content = locale.skipped;
            } else if (guesses[i].toLowerCase() === dailySong.title.toLowerCase()) {
                className += ' correct';
                content = getDisplayTitle(dailySong);
            } else {
                className += ' wrong';
                // Find the guessed song to display its localized title
                const guessedSong = getSongsForMode(currentMode).find(s => s.title.toLowerCase() === guesses[i].toLowerCase());
                content = guessedSong ? getDisplayTitle(guessedSong) : guesses[i];
            }
        }

        html += `<div class="${className}">${content}</div>`;
    }
    html += '</div>';

    container.innerHTML = html;
}

function showResults(dailySong, guesses, locale, won, isEndless = false) {
    const container = document.getElementById('gameContainer');

    // Hide daily game banner on results screen
    const banner = document.getElementById('dailyGameBanner');
    if (banner) banner.style.display = 'none';

    // Add class to disable grid layout on results screen
    container.classList.add('results-screen');

    const gameInfo = GAMES[dailySong.game];
    const coverPath = `images/${dailySong.game}/cover.jpg`;

    let html = '<div class="result-message">';

    // Cover + credits row
    html += '<div class="result-header">';
    html += `<div class="result-cover-wrapper">`;
    html += `<div class="result-cover" id="resultCover">`;
    html += `<div class="result-cover-glare"></div>`;
    html += `<img src="${coverPath}" alt="" draggable="false">`;
    html += `</div>`;
    html += `</div>`;

    html += '<div class="result-info">';
    html += `<h2>${getDisplayTitle(dailySong)}</h2>`;

    if (gameInfo) {
        html += `<p class="song-credit">${escapeHtml(gameInfo.name)}</p>`;
    }

    if (dailySong.composer && dailySong.artist && dailySong.artist !== dailySong.composer) {
        html += `<p class="song-credit">${escapeHtml(dailySong.composer)}, ${escapeHtml(dailySong.artist)}</p>`;
    } else if (dailySong.composer) {
        html += `<p class="song-credit">${escapeHtml(dailySong.composer)}</p>`;
    } else if (dailySong.artist) {
        html += `<p class="song-credit">${escapeHtml(dailySong.artist)}</p>`;
    }
    html += '</div>'; // .result-info
    html += '</div>'; // .result-header

    html += '<hr class="result-separator">';

    if (won) {
        const totalAttempts = guesses.length;
        const tryWord = totalAttempts === 1 ? locale.try : locale.tries;
        html += `<p class="result-outcome result-won">${locale.guessedIn} <span class="result-attempts">${totalAttempts} ${tryWord}</span> !</p>`;
    } else {
        html += `<p class="result-outcome result-lost">${locale.youLost}</p>`;
    }

    html += '</div>';

    // Add audio player for full song playback
    html += `
        <div class="result-audio-player">
            <div class="result-play-button" id="resultPlayButton" onclick="toggleResultAudio()"></div>
            <div class="result-progress-container">
                <div class="result-progress-bar-track" id="resultProgressTrack" onclick="seekResultAudio(event)">
                    <div class="result-progress-bar" id="resultProgressBar"></div>
                </div>
                <div class="result-time-labels">
                    <span id="resultCurrentTime">0:00</span>
                    <span id="resultTotalTime">--:--</span>
                </div>
            </div>
        </div>
    `;

    if (isEndless) {
        // Endless: show restart button
        html += `<button class="restart-button" onclick="startEndlessRound()">`;
        html += `<span class="restart-icon">∞</span> ${locale.endless.restart}`;
        html += `</button>`;
    } else {
        // Daily: show share section + countdown
        const today = dailySong.dayNumber;
        const allModesCount = Object.keys(GAME_MODES).length;
        let completedModesCount = 0;
        Object.values(GAME_MODES).forEach(mode => {
            const modeDailySong = getDailySong(mode.id);
            const savedState = loadGameState(mode.id, modeDailySong);
            if (savedState && savedState.gameOver && savedState.dayNumber === today) {
                completedModesCount++;
            }
        });
        const defaultScope = completedModesCount >= allModesCount ? 'all' : 'this';
        const thisActive = defaultScope === 'this' ? ' active' : '';
        const allActive = defaultScope === 'all' ? ' active' : '';

        html += `<div class="share-section">`;
        html += `<div class="share-scope-toggle">`;
        html += `<button class="scope-btn${thisActive}" data-scope="this" onclick="setShareScope('this')">${locale.scopeThis}</button>`;
        html += `<button class="scope-btn${allActive}" data-scope="all" onclick="setShareScope('all')">${locale.scopeAll}</button>`;
        html += `</div>`;
        html += `<div class="share-actions">`;
        html += `<button class="share-action-btn copy-btn" onclick="copyResults()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>${locale.copyResults}</span></button>`;
        html += `<button class="share-action-btn tweet-btn" onclick="tweetResults()"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg><span>Tweet</span></button>`;
        html += `</div>`;
        html += `</div>`;
        html += '<div class="countdown" id="countdown"></div>';
    }

    container.innerHTML = html;

    // Initialize result audio player
    initResultAudioPlayer(dailySong);

    // Initialize 3D cover hover effect
    initCover3D();
}

function initCover3D() {
    const cover = document.getElementById('resultCover');
    if (!cover) return;

    const glare = cover.querySelector('.result-cover-glare');

    cover.addEventListener('mousemove', (e) => {
        const rect = cover.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * 30;
        const rotateX = (0.5 - y) * 30;

        cover.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;

        if (glare) {
            glare.style.opacity = '1';
            glare.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.35) 0%, transparent 60%)`;
        }
    });

    cover.addEventListener('mouseleave', () => {
        cover.style.transform = '';
        if (glare) {
            glare.style.opacity = '0';
        }
    });
}

function updateCountdown(locale) {
    const now = new Date();
    // Next song change is at 23:00 UTC
    const nextChange = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 0, 0));

    // If we're already past 23:00 UTC today, the next change is tomorrow at 23:00 UTC
    if (now >= nextChange) {
        nextChange.setUTCDate(nextChange.getUTCDate() + 1);
    }

    const diff = nextChange - now;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const countdownElement = document.getElementById('countdown');
    if (countdownElement) {
        countdownElement.innerHTML = `${locale.comeBackIn} ${hours}h ${minutes}m ${seconds}s<br class="countdown-break"> ${locale.forNextOne}`;
    }
}

// ============================================
// SPECIAL EFFECTS
// ============================================

function checkSpecialDate() {
    // Use date override if set, otherwise use real date
    if (window.DATE_OVERRIDE) {
        const parts = window.DATE_OVERRIDE.split('-');
        const m = parseInt(parts[1], 10) - 1; // 0-indexed
        const d = parseInt(parts[2], 10);
        return m === 11 && d === 25;
    }
    const today = new Date();
    const m = today.getUTCMonth();
    const d = today.getUTCDate();
    return m === 11 && d === 25;
}

function addVisualEffect() {
    const container = document.createElement('div');
    container.className = 'snow-container';
    document.body.appendChild(container);

    for (let i = 0; i < 100; i++) {
        const element = document.createElement('div');
        element.className = 'snowflake';
        element.textContent = '❄';

        const left = Math.random() * 100;
        const duration = 5 + Math.random() * 10;
        const delay = Math.random() * 5;
        const size = 10 + Math.random() * 20;
        const opacity = 0.3 + Math.random() * 0.7;

        element.style.left = `${left}%`;
        element.style.animationDuration = `${duration}s`;
        element.style.animationDelay = `${delay}s`;
        element.style.fontSize = `${size}px`;
        element.style.opacity = opacity;

        container.appendChild(element);
    }
}

// ============================================
// HISTORY MODAL
// ============================================

let currentStatsTab = 'daily';

function showHistoryModal() {
    // Default tab based on current mode
    currentStatsTab = endlessMode ? 'endless' : 'daily';

    // Create modal if it doesn't exist
    let modal = document.getElementById('historyModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'historyModal';
        modal.className = 'history-modal';
        document.body.appendChild(modal);

        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeHistoryModal();
            }
        });
    }

    renderStatsContent(modal);
    modal.classList.add('active');
}

function switchStatsTab(tab) {
    currentStatsTab = tab;
    const modal = document.getElementById('historyModal');
    if (modal) renderStatsContent(modal);
}

function renderStatsContent(modal) {
    const dailyActive = currentStatsTab === 'daily' ? ' active' : '';
    const endlessActive = currentStatsTab === 'endless' ? ' active' : '';

    let html = '<div class="history-content">';
    html += '<button class="history-close" onclick="closeHistoryModal()">×</button>';

    // Header with title + toggle
    html += '<div class="stats-header">';
    html += `<h2 class="history-title">${locale.stats.title}</h2>`;
    html += '<div class="share-scope-toggle stats-toggle">';
    html += `<button class="scope-btn${dailyActive}" data-scope="daily" onclick="switchStatsTab('daily')">${locale.endless.daily}</button>`;
    html += `<button class="scope-btn${endlessActive}" data-scope="endless" onclick="switchStatsTab('endless')">${locale.endless.endless}</button>`;
    html += '</div>';
    html += '</div>';

    // Stats content
    let hasStats = false;
    Object.values(GAME_MODES).forEach(mode => {
        const stats = currentStatsTab === 'daily' ? getStats(mode.id) : getEndlessStats(mode.id);

        if (stats.totalPlayed === 0) return;
        hasStats = true;

        // Use localized mode name
        let modeName = mode.name;
        if (locale && locale.modes && locale.modes[mode.id]) {
            modeName = locale.modes[mode.id].name;
        }

        html += '<div class="mode-stats">';
        html += `<div class="mode-name">${escapeHtml(modeName)}</div>`;

        // Main stats grid
        html += '<div class="stats-grid">';
        html += `<div class="stat-box">
            <div class="stat-value">${stats.totalPlayed}</div>
            <div class="stat-label">${locale.stats.played}</div>
        </div>`;
        html += `<div class="stat-box">
            <div class="stat-value">${stats.winRate}%</div>
            <div class="stat-label">${locale.stats.winRate}</div>
        </div>`;
        html += `<div class="stat-box">
            <div class="stat-value">${stats.currentStreak}</div>
            <div class="stat-label">${locale.stats.currentStreak}</div>
        </div>`;
        html += `<div class="stat-box">
            <div class="stat-value">${stats.maxStreak}</div>
            <div class="stat-label">${locale.stats.maxStreak}</div>
        </div>`;
        html += `<div class="stat-box">
            <div class="stat-value">${stats.oneShots}</div>
            <div class="stat-label">${locale.stats.oneShots}</div>
        </div>`;
        html += `<div class="stat-box">
            <div class="stat-value">${stats.oneShotStreak}</div>
            <div class="stat-label">${locale.stats.oneShotStreak}</div>
        </div>`;
        html += `<div class="stat-box">
            <div class="stat-value">${stats.maxOneShotStreak}</div>
            <div class="stat-label">${locale.stats.maxOneShotStreak}</div>
        </div>`;
        html += `<div class="stat-box">
            <div class="stat-value">${stats.totalPlayed - stats.totalWon}</div>
            <div class="stat-label">${locale.stats.failed}</div>
        </div>`;
        html += '</div>';

        // Guess distribution
        html += '<div class="guess-distribution">';
        html += `<div class="distribution-title">${locale.stats.guessDistribution}</div>`;
        const maxGuesses = Math.max(...stats.guessDistribution, 1);
        for (let i = 0; i < 5; i++) {
            const count = stats.guessDistribution[i];
            const percentage = count > 0 ? (count / maxGuesses) * 100 : 0;
            html += '<div class="distribution-bar">';
            html += `<div class="bar-label">${i + 1}</div>`;
            html += '<div class="bar-container">';
            html += `<div class="bar-fill" style="width: ${percentage}%">${count}</div>`;
            html += '</div>';
            html += '</div>';
        }
        html += '</div>';

        html += '</div>';
    });

    if (!hasStats) {
        html += `<div class="no-history">${locale.stats.noHistory}</div>`;
    }

    html += '</div>';
    modal.innerHTML = html;
}

function closeHistoryModal() {
    const modal = document.getElementById('historyModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ============================================
// CREDITS VISIBILITY (desktop only)
// ============================================
// Hide credits when page has a scrollbar,
// fade them in only when scrolled near the bottom.

function updateCreditsVisibility() {
    const credits = document.getElementById('creditsBox');
    if (!credits || window.innerWidth <= 600) return;

    const hasScrollbar = document.body.scrollHeight > window.innerHeight + 10;

    if (!hasScrollbar) {
        credits.style.opacity = '1';
        credits.style.pointerEvents = '';
        return;
    }

    const scrollBottom = window.scrollY + window.innerHeight;
    const nearBottom = document.body.scrollHeight - scrollBottom < 20;

    credits.style.opacity = nearBottom ? '1' : '0';
    credits.style.pointerEvents = nearBottom ? '' : 'none';
}

window.addEventListener('scroll', updateCreditsVisibility, { passive: true });
window.addEventListener('resize', updateCreditsVisibility);
document.addEventListener('DOMContentLoaded', () => {
    updateCreditsVisibility();
    // Re-check after content loads (fonts, images, etc.)
    setTimeout(updateCreditsVisibility, 500);
});
// Also observe DOM changes that might affect page height
new MutationObserver(updateCreditsVisibility).observe(document.body, {
    childList: true, subtree: true, attributes: true
});
