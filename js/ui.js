// ============================================
// UI RENDERING & DOM MANIPULATION
// ============================================

// MAX_ATTEMPTS is defined in game.js

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updatePageTitle(currentMode) {
    // Always keep the main title as "XENO SERIES HEARDLE"
    document.getElementById('pageTitle').textContent = 'XENO SERIES HEARDLE';
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
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
            <div class="time-labels">
                <span id="currentTimeLabel">0s</span>
                <span id="maxTimeLabel">${DURATIONS[currentAttempt]}s</span>
            </div>
            <div class="play-button" id="playButton"></div>
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
                content = guesses[i];
            } else {
                className += ' wrong';
                content = guesses[i];
            }
        }

        html += `<div class="${className}">${content}</div>`;
    }
    html += '</div>';

    container.innerHTML = html;
}

function showResults(dailySong, guesses, locale, won) {
    const container = document.getElementById('gameContainer');

    // Add class to disable grid layout on results screen
    container.classList.add('results-screen');

    let html = '<div class="result-message">';
    html += `<h2>${locale.todaySong} ${dailySong.title}</h2>`;

    // Display game name
    const gameInfo = GAMES[dailySong.game];
    if (gameInfo) {
        html += `<p class="song-credit">${escapeHtml(gameInfo.name)}</p>`;
    }

    // Display composer and artist metadata right after title
    if (dailySong.composer) {
        html += `<p class="song-credit">${locale.composer}: ${escapeHtml(dailySong.composer)}</p>`;
    }
    // Only show artist if different from composer
    if (dailySong.artist && dailySong.artist !== dailySong.composer) {
        html += `<p class="song-credit">${locale.artist}: ${escapeHtml(dailySong.artist)}</p>`;
    }

    if (won) {
        const correctGuesses = guesses.filter(g => g !== 'skip').length;
        const tryWord = correctGuesses === 1 ? locale.try : locale.tries;
        html += `<p>${locale.guessedIn} ${correctGuesses} ${tryWord} !</p>`;
    } else {
        html += `<p>${locale.youLost}</p>`;
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

    html += `<button class="copy-button" onclick="copyResults()">${locale.copyResults}</button>`;
    html += '<div class="countdown" id="countdown"></div>';

    container.innerHTML = html;

    // Initialize result audio player
    initResultAudioPlayer(dailySong);
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
        countdownElement.textContent = `${locale.comeBackIn} ${hours}h ${minutes}m ${seconds}s ${locale.forNextOne}`;
    }
}

// ============================================
// SPECIAL EFFECTS
// ============================================

function checkSpecialDate() {
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
