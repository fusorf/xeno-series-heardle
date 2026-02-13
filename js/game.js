// ============================================
// XENO SERIES HEARDLE - MAIN GAME LOGIC
// ============================================
// This is the orchestrator that ties all modules together

// Game state
let locale = {};
let currentLanguage = 'en';
let currentMode = DEFAULT_MODE;
let currentAttempt = 0;
let guesses = [];
let gameOver = false;
let dailySong = null;
let selectedSong = null;
let activeGameFilters = new Set(); // empty = all games (no filter)

// ============================================
// INITIALIZATION
// ============================================

function detectLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.toLowerCase().startsWith('fr')) return 'fr';
    if (browserLang.toLowerCase().startsWith('ja')) return 'ja';
    return 'en';
}

async function loadLocale(forceLang = null) {
    // Check for saved language preference
    const savedLang = getCookie('xenoHeardleLanguage');

    if (forceLang) {
        currentLanguage = forceLang;
    } else if (savedLang && savedLang !== 'auto') {
        currentLanguage = savedLang;
    } else {
        currentLanguage = detectLanguage();
    }

    try {
        const response = await fetch(`locales/${currentLanguage}.json`);
        locale = await response.json();
    } catch (error) {
        console.error('Failed to load locale, falling back to English');
        const response = await fetch('locales/en.json');
        locale = await response.json();
    }

    updatePageTitle(currentMode);
    updateLanguageSelector();
    updateCredits();
}

async function initGame() {
    await loadLocale();

    // Load saved mode preference
    const savedMode = getCookie('xenoHeardleMode');
    if (savedMode && GAME_MODES[savedMode]) {
        currentMode = savedMode;
    }

    // Render mode selector
    renderModeSelector(currentMode, locale);

    // Get daily song for current mode
    dailySong = getDailySong(currentMode);

    // Apply theme
    applyTheme(currentMode, dailySong);

    // Show daily game banner for Random mode
    updateDailyGameBanner(currentMode, dailySong, locale);

    // Check for special date effects
    if (checkSpecialDate()) {
        addVisualEffect();
    }

    // Load saved game state
    const savedState = loadGameState(currentMode, dailySong);
    if (savedState) {
        currentAttempt = savedState.currentAttempt;
        guesses = savedState.guesses;
        gameOver = savedState.gameOver;

        if (gameOver) {
            showResults(dailySong, guesses, locale, savedState.won);
            updateCountdown(locale);
            window.countdownInterval = setInterval(() => updateCountdown(locale), 1000);
        } else {
            renderGame(currentMode, dailySong, currentAttempt, guesses, locale);
            initializeGameFilters();
            setupEventListeners();
        }
    } else {
        renderGame(currentMode, dailySong, currentAttempt, guesses, locale);
        initializeGameFilters();
        setupEventListeners();
    }
}

// ============================================
// MODE SWITCHING
// ============================================

function switchMode(modeId) {
    if (modeId === currentMode) return;

    // Save mode preference and reset game state
    currentMode = modeId;
    setCookie('xenoHeardleMode', modeId, 365);

    // Cleanup current players
    if (typeof destroyPlayer === 'function') {
        destroyPlayer();
    }
    // Stop result audio player if playing
    if (typeof resultAudioElement !== 'undefined' && resultAudioElement) {
        resultAudioElement.pause();
        resultAudioElement = null;
    }

    // Get new daily song for the new mode
    dailySong = getDailySong(currentMode);

    // Apply new theme
    applyTheme(currentMode, dailySong);

    // Update mode selector UI
    renderModeSelector(currentMode, locale);

    // Update daily game banner
    updateDailyGameBanner(currentMode, dailySong, locale);

    // Load saved game state for this mode
    const savedState = loadGameState(currentMode, dailySong);
    if (savedState) {
        currentAttempt = savedState.currentAttempt;
        guesses = savedState.guesses;
        gameOver = savedState.gameOver;

        if (gameOver) {
            showResults(dailySong, guesses, locale, savedState.won);
            updateCountdown(locale);
            // Clear any existing countdown interval
            if (window.countdownInterval) clearInterval(window.countdownInterval);
            window.countdownInterval = setInterval(() => updateCountdown(locale), 1000);
        } else {
            renderGame(currentMode, dailySong, currentAttempt, guesses, locale);
            initializeGameFilters();
            setupEventListeners();
        }
    } else {
        // New game for this mode
        currentAttempt = 0;
        guesses = [];
        gameOver = false;
        renderGame(currentMode, dailySong, currentAttempt, guesses, locale);
        initializeGameFilters();
        setupEventListeners();
    }
}

// ============================================
// LANGUAGE SWITCHING
// ============================================

async function switchLanguage(langCode) {
    const currentLang = getCookie('xenoHeardleLanguage') || 'auto';
    if (langCode === currentLang) return;

    // Save language preference ('auto', 'en', 'fr', 'ja')
    setCookie('xenoHeardleLanguage', langCode, 365);

    // Reload locale and update UI without full page reload
    await loadLocale(langCode === 'auto' ? null : langCode);

    // Update UI elements with new locale
    renderModeSelector(currentMode, locale);

    if (gameOver) {
        showResults(dailySong, guesses, locale, guesses[guesses.length - 1]?.toLowerCase() === dailySong.title.toLowerCase());
        updateCountdown(locale);
    } else {
        renderGame(currentMode, dailySong, currentAttempt, guesses, locale);
        initializeGameFilters();
        setupEventListeners();
    }

    updateDailyGameBanner(currentMode, dailySong, locale);
    updateLanguageSelector();
    updateCredits();
}

function updateLanguageSelector() {
    const savedLang = getCookie('xenoHeardleLanguage');
    const currentLang = savedLang || detectLanguage();

    const buttons = document.querySelectorAll('.lang-option');
    buttons.forEach(btn => {
        if (btn.dataset.lang === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function toggleLanguageMenu() {
    const menu = document.getElementById('langMenu');
    if (menu.style.display === 'none') {
        menu.style.display = 'flex';
    } else {
        menu.style.display = 'none';
    }
}

function selectLanguage(langCode) {
    // Hide menu
    document.getElementById('langMenu').style.display = 'none';

    // Switch language
    switchLanguage(langCode);
}

// Close language menu when clicking outside
document.addEventListener('click', function(event) {
    const langSelector = document.querySelector('.language-selector');
    const langMenu = document.getElementById('langMenu');

    if (langSelector && !langSelector.contains(event.target)) {
        if (langMenu) {
            langMenu.style.display = 'none';
        }
    }
});

// ============================================
// CREDITS
// ============================================

function updateCredits() {
    const creditsBox = document.getElementById('creditsBox');
    if (!creditsBox || !locale) return;

    const madeBy = locale.credits?.madeBy || 'Made by';
    const specialThanks = locale.credits?.specialThanks || 'Special thanks to';

    creditsBox.innerHTML = `
        <div class="credit-line">${madeBy} <a href="https://x.com/fusorf_" target="_blank" rel="noopener noreferrer">@fusorf_</a></div>
        <div class="credit-line">${specialThanks} <a href="https://x.com/XenoFrance" target="_blank" rel="noopener noreferrer">Xeno Series France</a></div>
    `;
}

// ============================================
// EVENT LISTENERS
// ============================================

// Store handler references to avoid duplicates
let playButtonHandler = null;
let skipButtonHandler = null;
let submitButtonHandler = null;
let searchInputHandler = null;
let searchKeydownHandler = null;
let giveUpButtonHandler = null;

function setupEventListeners() {
    const playButton = document.getElementById('playButton');
    const skipButton = document.getElementById('skipButton');
    const submitButton = document.getElementById('submitButton');
    const searchInput = document.getElementById('searchInput');
    const giveUpButton = document.getElementById('giveUpButton');

    // Remove old listeners if they exist
    if (playButtonHandler) playButton.removeEventListener('click', playButtonHandler);
    if (skipButtonHandler && skipButton) skipButton.removeEventListener('click', skipButtonHandler);
    if (submitButtonHandler) submitButton.removeEventListener('click', submitButtonHandler);
    if (searchInputHandler) searchInput.removeEventListener('input', searchInputHandler);
    if (searchKeydownHandler) searchInput.removeEventListener('keydown', searchKeydownHandler);
    if (giveUpButtonHandler && giveUpButton) giveUpButton.removeEventListener('click', giveUpButtonHandler);

    // Create new handlers
    playButtonHandler = () => togglePlay(dailySong, currentAttempt);
    skipButtonHandler = skipAttempt;
    submitButtonHandler = submitGuess;
    searchInputHandler = handleSearchInput;
    searchKeydownHandler = handleSearchKeydown;
    giveUpButtonHandler = giveUp;

    // Add new listeners
    playButton.addEventListener('click', playButtonHandler);
    if (skipButton) {
        skipButton.addEventListener('click', skipButtonHandler);
    }
    submitButton.addEventListener('click', submitButtonHandler);
    searchInput.addEventListener('input', searchInputHandler);
    searchInput.addEventListener('keydown', searchKeydownHandler);

    if (giveUpButton) {
        giveUpButton.addEventListener('click', giveUpButtonHandler);
    }

    // Game filter chips - use event delegation to avoid multiple listeners
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) {
        // Remove old delegation handler if exists
        if (gameContainer._filterHandler) {
            gameContainer.removeEventListener('click', gameContainer._filterHandler);
        }
        // Add new delegation handler
        gameContainer._filterHandler = (e) => {
            if (e.target.classList.contains('game-filter-chip')) {
                toggleGameFilter(e.target.dataset.game);
            }
        };
        gameContainer.addEventListener('click', gameContainer._filterHandler);
    }
}

// ============================================
// GAME FILTERS
// ============================================

function initializeGameFilters() {
    const mode = GAME_MODES[currentMode];

    // In Random mode with hidden filters, auto-filter to daily game only
    if (mode.hideGameFilters && dailySong && dailySong.game) {
        activeGameFilters.clear();
        activeGameFilters.add(dailySong.game);
    } else {
        // In other modes, start with all games (no filter)
        activeGameFilters.clear();
    }
}

function toggleGameFilter(gameId) {
    if (activeGameFilters.has(gameId)) {
        activeGameFilters.delete(gameId);
    } else {
        activeGameFilters.add(gameId);
    }

    // If all games are now filtered, clear the set (show all)
    const modeGames = GAME_MODES[currentMode].games;
    if (activeGameFilters.size === modeGames.length) {
        activeGameFilters.clear();
    }

    // Update chip visuals
    document.querySelectorAll('.game-filter-chip').forEach(chip => {
        const id = chip.dataset.game;
        if (activeGameFilters.size === 0) {
            chip.classList.add('active');
        } else {
            chip.classList.toggle('active', activeGameFilters.has(id));
        }
    });

    // Re-trigger search with current input
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.length > 0) {
        handleSearchInput({ target: searchInput });
    }
}

// ============================================
// SEARCH & AUTOCOMPLETE
// ============================================

function handleSearchInput(e) {
    const query = e.target.value.toLowerCase();
    const autocompleteList = document.getElementById('autocompleteList');
    const submitButton = document.getElementById('submitButton');

    if (query.length < 1) {
        autocompleteList.classList.remove('active');
        submitButton.disabled = true;
        selectedSong = null;
        return;
    }

    // Search in mode-specific songs, filtered by active game filters
    let modeSongs = getSongsForMode(currentMode);
    if (activeGameFilters.size > 0) {
        modeSongs = modeSongs.filter(song => activeGameFilters.has(song.game));
    }
    const matches = modeSongs.filter(song =>
        song.title.toLowerCase().includes(query) ||
        song.localizedTitle.toLowerCase().includes(query)
    ).slice(0, 10);

    if (matches.length > 0) {
        autocompleteList.innerHTML = matches.map(song => {
            const game = GAMES[song.game];
            const badge = game ? `<span class="autocomplete-game-badge" style="--badge-color: ${game.color}">${escapeHtml(game.shortName)}</span>` : '';
            return `<div class="autocomplete-item" data-title="${escapeHtml(song.title)}">${escapeHtml(song.title)}${badge}</div>`;
        }).join('');

        autocompleteList.classList.add('active');

        // Use event delegation instead of adding listeners to each item
        if (!autocompleteList._delegationSetup) {
            autocompleteList.addEventListener('click', (e) => {
                if (e.target.classList.contains('autocomplete-item')) {
                    selectSongFromList(e.target.dataset.title);
                }
            });
            autocompleteList._delegationSetup = true;
        }
    } else {
        autocompleteList.classList.remove('active');
    }

    const exactMatch = modeSongs.find(song =>
        song.title.toLowerCase() === query ||
        song.localizedTitle.toLowerCase() === query
    );

    if (exactMatch) {
        selectedSong = exactMatch.title;
        submitButton.disabled = false;
    } else {
        selectedSong = null;
        submitButton.disabled = true;
    }
}

function handleSearchKeydown(e) {
    const autocompleteList = document.getElementById('autocompleteList');
    const items = autocompleteList.querySelectorAll('.autocomplete-item');

    if (e.key === 'Enter' && items.length > 0) {
        items[0].click();
    }
}

function selectSongFromList(title) {
    document.getElementById('searchInput').value = title;
    document.getElementById('autocompleteList').classList.remove('active');
    selectedSong = title;
    document.getElementById('submitButton').disabled = false;
}

// ============================================
// GAME ACTIONS
// ============================================

function skipAttempt() {
    pauseAudio(dailySong);
    guesses.push('skip');
    currentAttempt++;

    destroyPlayer();

    if (currentAttempt >= MAX_ATTEMPTS) {
        endGame(false);
    } else {
        saveGameState(currentMode, {
            dayNumber: dailySong.dayNumber,
            currentAttempt,
            guesses,
            gameOver: false
        });
        renderGame(currentMode, dailySong, currentAttempt, guesses, locale);
        setupEventListeners();
    }
}

function submitGuess() {
    if (!selectedSong) return;

    pauseAudio(dailySong);
    guesses.push(selectedSong);

    const isCorrect = selectedSong.toLowerCase() === dailySong.title.toLowerCase();

    if (isCorrect) {
        endGame(true);
    } else {
        currentAttempt++;

        destroyPlayer();

        if (currentAttempt >= MAX_ATTEMPTS) {
            endGame(false);
        } else {
            saveGameState(currentMode, {
                dayNumber: dailySong.dayNumber,
                currentAttempt,
                guesses,
                gameOver: false
            });
            renderGame(currentMode, dailySong, currentAttempt, guesses, locale);
            setupEventListeners();
        }
    }
}

function giveUp() {
    pauseAudio(dailySong);
    while (guesses.length < MAX_ATTEMPTS) {
        guesses.push('skip');
    }
    endGame(false);
}

function endGame(won) {
    gameOver = true;

    const finalAttempt = won ? guesses.filter(g => g !== 'skip').length : MAX_ATTEMPTS;

    saveGameState(currentMode, {
        dayNumber: dailySong.dayNumber,
        currentAttempt,
        guesses,
        gameOver: true,
        won
    });

    // Save to history
    saveToHistory(currentMode, dailySong.dayNumber, won, finalAttempt, guesses);

    showResults(dailySong, guesses, locale, won);
    updateCountdown(locale);
    setInterval(() => updateCountdown(locale), 1000);
}

// ============================================
// RESULTS
// ============================================

function copyResults() {
    const results = [];
    const today = getDailySong(currentMode).dayNumber;

    // Check all game modes for completed games
    Object.values(GAME_MODES).forEach(mode => {
        const modeDailySong = getDailySong(mode.id);
        const savedState = loadGameState(mode.id, modeDailySong);

        // Only include modes that have been completed today
        if (savedState && savedState.gameOver && savedState.dayNumber === today) {
            const emoji = [];
            let foundCorrect = false;

            for (let i = 0; i < MAX_ATTEMPTS; i++) {
                if (foundCorrect) {
                    emoji.push('⬛');
                } else if (savedState.guesses[i]) {
                    if (savedState.guesses[i] === 'skip') {
                        emoji.push('⬜');
                    } else if (savedState.guesses[i].toLowerCase() === modeDailySong.title.toLowerCase()) {
                        emoji.push('🟩');
                        foundCorrect = true;
                    } else {
                        emoji.push('🟥');
                    }
                } else {
                    emoji.push('⬛');
                }
            }

            // Use localized mode name if available
            let modeName = mode.name;
            if (locale && locale.modes && locale.modes[mode.id]) {
                modeName = locale.modes[mode.id].name;
            }

            results.push(`${modeName}\n${emoji.join('')}`);
        }
    });

    // Always use header with day number
    let text;
    if (results.length >= 1) {
        text = `Xeno Series Heardle - Day #${today} 🎧\n\n${results.join('\n\n')}`;
    } else {
        // Fallback to current mode only (shouldn't happen on results screen)
        text = `${GAME_MODES[currentMode].name} #${dailySong.dayNumber} 🎧`;
    }

    navigator.clipboard.writeText(text).then(() => {
        const button = document.querySelector('.copy-button');
        const originalText = button.textContent;
        button.textContent = locale.copied;
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    });
}

// ============================================
// START GAME
// ============================================

window.addEventListener('load', initGame);
