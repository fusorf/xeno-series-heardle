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

        const logoStyle = mode.logo ? `style="--mode-logo: url('${mode.logo}')"` : '';

        html += `
            <div class="mode-tab ${isActive}" data-mode="${mode.id}" onclick="switchMode('${mode.id}')" ${logoStyle}>
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

        // In Random + Endless mode: game name with click dropdown list + start mode toggle
        if (currentMode === 'random' && endlessMode) {
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

            const normalActive = !endlessRandomStart ? ' active' : '';
            const randomActive = endlessRandomStart ? ' active' : '';
            const startNormalText = locale?.endless?.startNormal || 'Classic';
            const startRandomText = locale?.endless?.startRandom || 'Random Start';

            banner.innerHTML = `
                <div class="daily-game-title">${bannerTitle}</div>
                <div class="daily-game-name">
                    ${escapeHtml(dailySong.dailyGame.name)}
                    <span class="game-select-chevron-box"><svg class="game-select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>
                </div>
                <div class="game-select-list" id="gameSelectList">
                    ${itemsHtml}
                </div>
                <div class="share-scope-toggle start-mode-toggle">
                    <button class="scope-btn${normalActive}" onclick="event.stopPropagation(); setEndlessStart(false)">${startNormalText}</button>
                    <button class="scope-btn${randomActive}" onclick="event.stopPropagation(); setEndlessStart(true)">${startRandomText}</button>
                </div>
            `;

            // Toggle dropdown on banner click (clean up previous listener)
            if (banner._toggleHandler) {
                banner.removeEventListener('click', banner._toggleHandler);
            }
            banner._toggleHandler = (e) => {
                if (e.target.closest('.game-select-item')) return;
                banner.classList.toggle('open');
            };
            banner.addEventListener('click', banner._toggleHandler);

            // Close on outside click (clean up previous listener)
            if (banner._outsideClickHandler) {
                document.removeEventListener('click', banner._outsideClickHandler);
            }
            banner._outsideClickHandler = (e) => {
                if (!banner.contains(e.target)) {
                    banner.classList.remove('open');
                }
            };
            document.addEventListener('click', banner._outsideClickHandler);

            // Item selection — close list then switch game
            document.getElementById('gameSelectList').addEventListener('click', (e) => {
                const item = e.target.closest('.game-select-item');
                if (item) {
                    banner.classList.remove('open');
                    onEndlessGameSelect(item.dataset.game);
                }
            });
        } else {
            // Daily mode: static text — clean up dropdown listeners
            cleanupBannerListeners(banner);
            banner.innerHTML = `
                <div class="daily-game-title">${todayGameText}</div>
                <div class="daily-game-name">${dailySong.dailyGame.name}</div>
            `;
        }
    } else {
        cleanupBannerListeners(banner);
        banner.style.display = 'none';
    }
}

function cleanupBannerListeners(banner) {
    if (banner._toggleHandler) {
        banner.removeEventListener('click', banner._toggleHandler);
        banner._toggleHandler = null;
    }
    if (banner._outsideClickHandler) {
        document.removeEventListener('click', banner._outsideClickHandler);
        banner._outsideClickHandler = null;
    }
    banner.classList.remove('open');
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
                const isActive = activeGameFilters.size === 0 || activeGameFilters.has(gameId);
                html += `<button class="game-filter-chip${isActive ? ' active' : ''}" data-game="${gameId}" style="--chip-color: ${game.color}">${escapeHtml(game.shortName)}</button>`;
            }
        });
        html += '</div>';
    }

    html += `
        <div class="search-container">
            <span class="search-icon">🔍</span>
            <input type="text" class="search-input" id="searchInput" placeholder="${locale.search}" autocomplete="off">
            <button type="button" class="search-clear-btn" id="searchClearBtn" aria-label="Clear">✕</button>
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
let statsGameFilter = null;

function showHistoryModal() {
    // Default tab based on current mode
    currentStatsTab = blitzActive ? 'blitz' : (endlessMode ? 'endless' : 'daily');
    statsGameFilter = null;

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
    statsGameFilter = null; // Reset game filter on tab switch
    const modal = document.getElementById('historyModal');
    if (modal) renderStatsContent(modal);
}

function filterStatsGame(gameId) {
    statsGameFilter = gameId || null;
    const modal = document.getElementById('historyModal');
    if (modal) {
        // Preserve scroll position of .history-content
        const content = modal.querySelector('.history-content');
        const scrollTop = content ? content.scrollTop : 0;
        renderStatsContent(modal);
        const newContent = modal.querySelector('.history-content');
        if (newContent) newContent.scrollTop = scrollTop;

        // Scroll active chip into view
        const activeChip = modal.querySelector('.stats-game-filters .game-filter-chip.active');
        if (activeChip) {
            activeChip.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
        }
    }
}

function renderStatsContent(modal) {
    const dailyActive = currentStatsTab === 'daily' ? ' active' : '';
    const endlessActive = currentStatsTab === 'endless' ? ' active' : '';
    const blitzTabActive = currentStatsTab === 'blitz' ? ' active' : '';

    let html = '<div class="history-content">';

    // Sticky header with title + toggle + close
    html += '<div class="stats-header">';
    html += '<button class="history-close" onclick="closeHistoryModal()">×</button>';
    html += `<h2 class="history-title">${locale.stats.title}</h2>`;
    html += '<div class="share-scope-toggle stats-toggle">';
    html += `<button class="scope-btn${dailyActive}" data-scope="daily" onclick="switchStatsTab('daily')">${locale.endless.daily}</button>`;
    html += `<button class="scope-btn${endlessActive}" data-scope="endless" onclick="switchStatsTab('endless')">${locale.endless.endless}</button>`;
    html += `<button class="scope-btn${blitzTabActive}" data-scope="blitz" onclick="switchStatsTab('blitz')">${locale.blitz?.name || 'Blitz'}</button>`;
    html += '</div>';

    // Global game filter chips — hidden for blitz (filters don't apply to blitz runs)
    if (currentStatsTab !== 'blitz') {
        const allGamesText = locale?.stats?.allGames || 'All Games';
        const allActive = statsGameFilter === null ? ' active' : '';
        const allGameIds = [...new Set(Object.values(GAME_MODES).flatMap(m => m.games))];

        html += '<div class="stats-game-filters">';
        html += `<button class="game-filter-chip${allActive}" style="--chip-color: var(--primary-blue)" onclick="filterStatsGame(null)">${allGamesText}</button>`;
        allGameIds.forEach(gameId => {
            const game = GAMES[gameId];
            if (game) {
                const active = statsGameFilter === gameId ? ' active' : '';
                html += `<button class="game-filter-chip${active}" style="--chip-color: ${game.color}" onclick="filterStatsGame('${gameId}')">${escapeHtml(game.shortName)}</button>`;
            }
        });
        html += '</div>';
    }

    html += '</div>';

    // Blitz tab: per-mode layout with global, same pattern as daily/endless
    if (currentStatsTab === 'blitz') {
        const l = locale.blitz || {};

        function renderBlitzStatsBlock(stats) {
            const accuracy = stats.totalAttempted > 0 ? Math.round((stats.totalCorrect / stats.totalAttempted) * 100) : 0;
            let s = '<div class="stats-grid blitz-stats-grid">';
            s += `<div class="stat-box"><div class="stat-value">${stats.gamesPlayed}</div><div class="stat-label">${locale.stats.played}</div></div>`;
            s += `<div class="stat-box"><div class="stat-value">${stats.bestScore}</div><div class="stat-label">${l.highScore || 'High Score'}</div></div>`;
            s += `<div class="stat-box"><div class="stat-value">${stats.avgScore}</div><div class="stat-label">${l.avgScore || 'Avg Score'}</div></div>`;
            s += `<div class="stat-box"><div class="stat-value">${stats.totalCorrect}</div><div class="stat-label">${l.songsGuessed || 'Songs'}</div></div>`;
            s += `<div class="stat-box"><div class="stat-value">${accuracy}%</div><div class="stat-label">${l.accuracy || 'Accuracy'}</div></div>`;
            s += `<div class="stat-box"><div class="stat-value">×${stats.bestCombo}</div><div class="stat-label">${l.bestCombo || 'Best Combo'}</div></div>`;
            s += '</div>';
            return s;
        }

        // Global blitz stats (no game filter — blitz runs span multiple songs/games)
        const globalStats = getGlobalBlitzStats();
        let hasStats = false;

        if (globalStats.gamesPlayed > 0) {
            hasStats = true;
            const globalLabel = locale?.stats?.global || 'Global';
            html += '<div class="mode-stats">';
            html += `<div class="mode-name">${escapeHtml(globalLabel)}</div>`;
            html += renderBlitzStatsBlock(globalStats);
            html += '</div>';
        }

        // Per-mode blitz stats
        Object.values(GAME_MODES).forEach(mode => {
            const stats = getBlitzStats(mode.id);
            if (stats.gamesPlayed === 0) return;
            hasStats = true;

            let modeName = mode.name;
            if (locale && locale.modes && locale.modes[mode.id]) {
                modeName = locale.modes[mode.id].name;
            }

            html += '<div class="mode-stats">';
            html += `<div class="mode-name">${escapeHtml(modeName)}</div>`;
            html += renderBlitzStatsBlock(stats);
            html += '</div>';
        });

        if (!hasStats) {
            html += `<div class="no-history">${locale.stats.noHistory}</div>`;
        }

        html += '</div>'; // .history-content
        modal.innerHTML = html;

        // Enable horizontal scroll with mouse wheel on game filter chips
        const filtersEl = modal.querySelector('.stats-game-filters');
        if (filtersEl) {
            filtersEl.addEventListener('wheel', (e) => {
                if (e.deltaY !== 0) {
                    e.preventDefault();
                    filtersEl.scrollLeft += e.deltaY;
                }
            }, { passive: false });
        }
        return;
    }

    // Helper: render stats block (grid + distribution) for a given stats object
    function renderStatsBlock(stats) {
        let s = '<div class="stats-grid">';
        s += `<div class="stat-box">
            <div class="stat-value">${stats.totalPlayed}</div>
            <div class="stat-label">${locale.stats.played}</div>
        </div>`;
        s += `<div class="stat-box">
            <div class="stat-value">${stats.winRate}%</div>
            <div class="stat-label">${locale.stats.winRate}</div>
        </div>`;
        s += `<div class="stat-box">
            <div class="stat-value">${stats.currentStreak}</div>
            <div class="stat-label">${locale.stats.currentStreak}</div>
        </div>`;
        s += `<div class="stat-box">
            <div class="stat-value">${stats.maxStreak}</div>
            <div class="stat-label">${locale.stats.maxStreak}</div>
        </div>`;
        s += `<div class="stat-box">
            <div class="stat-value">${stats.oneShots}</div>
            <div class="stat-label">${locale.stats.oneShots}</div>
        </div>`;
        s += `<div class="stat-box">
            <div class="stat-value">${stats.oneShotStreak}</div>
            <div class="stat-label">${locale.stats.oneShotStreak}</div>
        </div>`;
        s += `<div class="stat-box">
            <div class="stat-value">${stats.maxOneShotStreak}</div>
            <div class="stat-label">${locale.stats.maxOneShotStreak}</div>
        </div>`;
        s += `<div class="stat-box">
            <div class="stat-value">${stats.totalPlayed - stats.totalWon}</div>
            <div class="stat-label">${locale.stats.failed}</div>
        </div>`;
        s += '</div>';

        s += '<div class="guess-distribution">';
        s += `<div class="distribution-title">${locale.stats.guessDistribution}</div>`;
        const maxGuesses = Math.max(...stats.guessDistribution, 1);
        for (let i = 0; i < 5; i++) {
            const count = stats.guessDistribution[i];
            const percentage = count > 0 ? (count / maxGuesses) * 100 : 0;
            s += '<div class="distribution-bar">';
            s += `<div class="bar-label">${i + 1}</div>`;
            s += '<div class="bar-container">';
            s += `<div class="bar-fill" style="width: ${percentage}%">${count}</div>`;
            s += '</div>';
            s += '</div>';
        }
        s += '</div>';
        return s;
    }

    // Global stats (always shown if any games exist)
    const globalStats = currentStatsTab === 'daily'
        ? getGlobalStats(statsGameFilter)
        : getGlobalEndlessStats(statsGameFilter);
    const globalUnfiltered = statsGameFilter
        ? (currentStatsTab === 'daily' ? getGlobalStats() : getGlobalEndlessStats())
        : globalStats;

    let hasStats = false;
    if (globalUnfiltered.totalPlayed > 0) {
        hasStats = true;
        const globalLabel = locale?.stats?.global || 'Global';
        html += '<div class="mode-stats">';
        html += `<div class="mode-name">${escapeHtml(globalLabel)}</div>`;
        html += renderStatsBlock(globalStats);
        html += '</div>';
    }

    // Per-mode stats
    Object.values(GAME_MODES).forEach(mode => {
        // For random mode in endless tab: split into two sub-sections
        const isRandomEndless = currentStatsTab === 'endless' && mode.id === 'random';

        if (isRandomEndless) {
            const randomStats = getEndlessStats(mode.id, statsGameFilter, true);
            const normalStats = getEndlessStats(mode.id, statsGameFilter, false);

            if (randomStats.totalPlayed === 0 && normalStats.totalPlayed === 0) return;
            hasStats = true;

            let modeName = mode.name;
            if (locale && locale.modes && locale.modes[mode.id]) {
                modeName = locale.modes[mode.id].name;
            }

            const randomLabel = locale?.endless?.statsRandomStart || 'Random Excerpt';
            const normalLabel = locale?.endless?.statsNormalStart || 'From the Start';

            // Random start sub-section
            if (randomStats.totalPlayed > 0) {
                html += '<div class="mode-stats">';
                html += `<div class="mode-name">${escapeHtml(modeName)} — ${escapeHtml(randomLabel)}</div>`;
                html += renderStatsBlock(randomStats);
                html += '</div>';
            }

            // Normal start sub-section
            if (normalStats.totalPlayed > 0) {
                html += '<div class="mode-stats">';
                html += `<div class="mode-name">${escapeHtml(modeName)} — ${escapeHtml(normalLabel)}</div>`;
                html += renderStatsBlock(normalStats);
                html += '</div>';
            }
        } else {
            const stats = currentStatsTab === 'daily'
                ? getStats(mode.id, statsGameFilter)
                : getEndlessStats(mode.id, statsGameFilter);

            if (stats.totalPlayed === 0) return;
            hasStats = true;

            let modeName = mode.name;
            if (locale && locale.modes && locale.modes[mode.id]) {
                modeName = locale.modes[mode.id].name;
            }

            html += '<div class="mode-stats">';
            html += `<div class="mode-name">${escapeHtml(modeName)}</div>`;
            html += renderStatsBlock(stats);
            html += '</div>';
        }
    });

    if (!hasStats) {
        html += `<div class="no-history">${locale.stats.noHistory}</div>`;
    }

    html += '</div>'; // .history-content
    modal.innerHTML = html;

    // Enable horizontal scroll with mouse wheel on game filter chips
    const filtersEl = modal.querySelector('.stats-game-filters');
    if (filtersEl) {
        filtersEl.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                filtersEl.scrollLeft += e.deltaY;
            }
        }, { passive: false });
    }
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
    if (!credits) return;

    // On mobile, credits are in-flow (position: relative) — always visible
    if (window.innerWidth <= 900) {
        credits.style.opacity = '1';
        credits.style.pointerEvents = '';
        return;
    }

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

// Close autocomplete dropdowns on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        const lists = document.querySelectorAll('.autocomplete-list.active');
        lists.forEach(list => list.classList.remove('active'));
    }
});
// Also observe DOM changes that might affect page height
new MutationObserver(updateCreditsVisibility).observe(document.body, {
    childList: true, subtree: true, attributes: true
});

// ============================================
// MOBILE TOOLBAR SETUP
// ============================================

function setupMobileToolbar() {
    if (window.innerWidth > 900) return;
    const toolbar = document.getElementById('mobileToolbar');
    if (!toolbar) return;

    // Move buttons into mobile toolbar row
    const endless = document.getElementById('endlessButton');
    const blitz = document.getElementById('blitzButton');
    const guesser = document.getElementById('guesserButton');
    const stats = document.getElementById('historyButton');
    const lang = document.querySelector('.language-selector');

    [endless, blitz, guesser, stats, lang].forEach(el => {
        if (el) toolbar.appendChild(el);
    });

    // Hide original containers
    document.querySelector('.toolbar-left')?.classList.add('mobile-hidden');
    document.querySelector('.toolbar-right')?.classList.add('mobile-hidden');
}

document.addEventListener('DOMContentLoaded', setupMobileToolbar);

