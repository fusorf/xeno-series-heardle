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
let endlessMode = false;
let endlessLockedGame = null; // null = random each round, gameId = locked to that game
let endlessRandomStart = true; // false = start at 0s, true = random start time

// Helper: get display title based on current language
function getDisplayTitle(song) {
    if (currentLanguage === 'ja' && song.japaneseTitle) {
        return song.japaneseTitle;
    }
    return song.title;
}

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
    const savedLang = storageGet('xenoHeardleLanguage');

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

    updateLanguageSelector();
    updateCredits();
}

async function initGame() {
    await loadLocale();

    // Load saved mode preference
    const savedMode = storageGet('xenoHeardleMode');
    if (savedMode && GAME_MODES[savedMode]) {
        currentMode = savedMode;
    }

    // Render mode selector
    renderModeSelector(currentMode, locale);

    // Get daily song for current mode
    dailySong = getDailySong(currentMode);

    // Initialize theme system
    initThemeSystem();

    // Show daily game banner for Random mode
    updateDailyGameBanner(currentMode, dailySong, locale);

    // Check for special date effects
    if (checkSpecialDate()) {
        addVisualEffect();
    }

    // Set button tooltips and endless label
    updateButtonTooltips();

    // Load and display game state
    loadAndDisplay();
}

// ============================================
// BUTTON TOOLTIPS & LABELS
// ============================================

function updateButtonTooltips() {
    const langBtn = document.getElementById('langToggle');
    const statsBtn = document.getElementById('historyButton');
    const endlessBtn = document.getElementById('endlessButton');
    const blitzBtn = document.getElementById('blitzButton');

    if (locale.tooltips) {
        if (langBtn) langBtn.setAttribute('data-tooltip', locale.tooltips.language);
        if (statsBtn) statsBtn.setAttribute('data-tooltip', locale.tooltips.stats);
        if (endlessBtn) endlessBtn.setAttribute('data-tooltip', locale.tooltips.endless);
        if (blitzBtn) blitzBtn.setAttribute('data-tooltip', locale.tooltips.blitz);
    }

    // Update endless label text if visible
    const endlessLabel = document.getElementById('endlessModeLabel');
    if (endlessLabel && endlessMode) {
        endlessLabel.textContent = locale.endless.name;
    }
}

// ============================================
// CORE DISPLAY LOGIC
// ============================================

/**
 * Load saved state for current mode and display the appropriate screen.
 * Single source of truth for "what to show" — used by init, switchMode, and switchLanguage.
 */
function loadAndDisplay() {
    const savedState = loadGameState(currentMode, dailySong);

    if (savedState) {
        currentAttempt = savedState.currentAttempt;
        guesses = savedState.guesses;
        gameOver = savedState.gameOver;

        if (gameOver) {
            initShareScope();
            applyTheme(currentMode, dailySong, true);
            showResults(dailySong, guesses, locale, savedState.won);
            updateCountdown(locale);
            clearInterval(window.countdownInterval);
            window.countdownInterval = setInterval(() => updateCountdown(locale), 1000);
            return;
        }
    } else {
        currentAttempt = 0;
        guesses = [];
        gameOver = false;
    }

    // Gameplay screen
    applyTheme(currentMode, dailySong, false);
    renderGame(currentMode, dailySong, currentAttempt, guesses, locale);
    initializeGameFilters();
    setupEventListeners();
}

// ============================================
// ENDLESS MODE
// ============================================

function toggleEndlessMode() {
    // Deactivate blitz if active
    if (typeof blitzActive !== 'undefined' && blitzActive) {
        deactivateBlitz();
    }

    endlessMode = !endlessMode;
    endlessLockedGame = null;
    endlessRandomStart = true;

    // Update button active state
    const btn = document.getElementById('endlessButton');
    if (btn) btn.classList.toggle('active', endlessMode);

    // Update endless mode label
    const label = document.getElementById('endlessModeLabel');
    if (label) {
        if (endlessMode) {
            label.textContent = locale.endless.name;
            label.classList.remove('hiding');
            label.classList.add('visible');
        } else {
            label.classList.remove('visible');
            label.classList.add('hiding');
            label.addEventListener('animationend', () => {
                label.classList.remove('hiding');
            }, { once: true });
        }
    }

    // Cleanup players
    destroyPlayer();
    destroyResultPlayer();

    if (endlessMode) {
        startEndlessRound();
    } else {
        // Return to daily game
        dailySong = getDailySong(currentMode);
        updateDailyGameBanner(currentMode, dailySong, locale);
        loadAndDisplay();
    }
}

function startEndlessRound() {
    // Cleanup
    destroyPlayer();
    destroyResultPlayer();

    // Get a random song (filtered by locked game if set)
    const useRandomStart = currentMode === 'random' && endlessRandomStart;
    dailySong = getEndlessSong(currentMode, endlessLockedGame, useRandomStart);

    // Reset game state
    currentAttempt = 0;
    guesses = [];
    gameOver = false;
    selectedSong = null;

    // Update UI
    updateDailyGameBanner(currentMode, dailySong, locale);
    applyTheme(currentMode, dailySong, false);
    renderGame(currentMode, dailySong, currentAttempt, guesses, locale);
    initializeGameFilters();
    setupEventListeners();
}

function onEndlessGameSelect(gameId) {
    endlessLockedGame = gameId;
    startEndlessRound();
}

function setEndlessStart(randomStart) {
    endlessRandomStart = randomStart;
    updateDailyGameBanner(currentMode, dailySong, locale);
    startEndlessRound();
}

// ============================================
// MODE SWITCHING
// ============================================

function switchMode(modeId) {
    if (modeId === currentMode) return;

    // Save mode preference
    currentMode = modeId;
    storageSet('xenoHeardleMode', modeId);

    // Update UI chrome
    renderModeSelector(currentMode, locale);

    if (blitzActive) {
        endlessLockedGame = null;
        applyBlitzTheme();
        updateBlitzBanner();
        startBlitzRound();
        return;
    }

    // Cleanup current state (not needed during blitz)
    clearInterval(window.countdownInterval);
    destroyPlayer();
    destroyResultPlayer();

    if (endlessMode) {
        endlessLockedGame = null; // Reset game lock when switching modes
        startEndlessRound();
    } else {
        dailySong = getDailySong(currentMode);
        updateDailyGameBanner(currentMode, dailySong, locale);
        loadAndDisplay();
    }
}

// ============================================
// LANGUAGE SWITCHING
// ============================================

async function switchLanguage(langCode) {
    const currentLang = storageGet('xenoHeardleLanguage') || 'auto';
    if (langCode === currentLang) return;

    // Save language preference ('auto', 'en', 'fr', 'ja')
    storageSet('xenoHeardleLanguage', langCode);

    // Reload locale and update UI without full page reload
    await loadLocale(langCode === 'auto' ? null : langCode);

    // Update UI elements with new locale
    renderModeSelector(currentMode, locale);

    if (blitzActive) {
        // Re-render blitz UI with new locale
        const container = document.getElementById('gameContainer');
        const isResults = container.classList.contains('results-screen');
        const isInGame = !!container.querySelector('.blitz-banner:not(:has(.blitz-countdown-overlay))');
        if (isResults) {
            // Stay on results screen, just re-render with new locale
            const prevHigh = blitzScore >= (getBlitzHighScore() || 0);
            renderBlitzResults(prevHigh);
        } else if (isInGame) {
            renderBlitzGame();
            updateBlitzTimer();
            updateBlitzScore();
            updateBlitzSongCounter();
            updateBlitzHistoryDisplay();
        }
        // Don't re-render during countdown — leave it running
        updateBlitzBanner();
    } else if (gameOver) {
        showResults(dailySong, guesses, locale, guesses[guesses.length - 1]?.toLowerCase() === dailySong.title.toLowerCase());
        updateCountdown(locale);
    } else {
        renderGame(currentMode, dailySong, currentAttempt, guesses, locale);
        initializeGameFilters();
        setupEventListeners();
    }

    if (!blitzActive) {
        updateDailyGameBanner(currentMode, dailySong, locale);
    }
    updateLanguageSelector();
    updateButtonTooltips();
    updateCredits();
}

function updateLanguageSelector() {
    const savedLang = storageGet('xenoHeardleLanguage');
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

    // Version label
    const versionLabel = document.getElementById('versionLabel');
    if (versionLabel && typeof APP_VERSION !== 'undefined') {
        versionLabel.textContent = APP_VERSION;
    }
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

    // Remove old listeners if they exist (skipButton/giveUpButton are mutually exclusive)
    if (playButtonHandler) playButton.removeEventListener('click', playButtonHandler);
    if (submitButtonHandler) submitButton.removeEventListener('click', submitButtonHandler);
    if (searchInputHandler) searchInput.removeEventListener('input', searchInputHandler);
    if (searchKeydownHandler) searchInput.removeEventListener('keydown', searchKeydownHandler);
    if (skipButtonHandler && skipButton) skipButton.removeEventListener('click', skipButtonHandler);
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

    // Event delegation on gameContainer for filter chips + autocomplete
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) {
        if (gameContainer._delegationHandler) {
            gameContainer.removeEventListener('click', gameContainer._delegationHandler);
        }
        gameContainer._delegationHandler = (e) => {
            if (e.target.classList.contains('game-filter-chip')) {
                toggleGameFilter(e.target.dataset.game);
            } else if (e.target.classList.contains('autocomplete-item')) {
                selectSongFromList(e.target.dataset.title);
            }
        };
        gameContainer.addEventListener('click', gameContainer._delegationHandler);
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

function updateGameFilterChips() {
    document.querySelectorAll('.game-filter-chip').forEach(chip => {
        const id = chip.dataset.game;
        if (activeGameFilters.size === 0) {
            chip.classList.add('active');
        } else {
            chip.classList.toggle('active', activeGameFilters.has(id));
        }
    });
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

    updateGameFilterChips();

    // Re-trigger search with current input
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.length > 0) {
        handleSearchInput({ target: searchInput });
    }
}

// ============================================
// SEARCH & AUTOCOMPLETE
// ============================================

let acIndex = 0; // Currently highlighted autocomplete index

/**
 * Shared autocomplete keyboard navigation.
 * @param {KeyboardEvent} e
 * @param {object} opts - { listEl, itemSelector, getIndex, setIndex, setSelection, submitBtnId, onSelect, onSubmit }
 */
function handleAutocompleteKeydown(e, opts) {
    const isOpen = opts.listEl.classList.contains('active');

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!isOpen) return;
        e.preventDefault();
        const items = opts.listEl.querySelectorAll(opts.itemSelector);
        if (items.length === 0) return;

        const idx = opts.getIndex();
        items[idx]?.classList.remove('ac-highlighted');
        const newIdx = e.key === 'ArrowDown'
            ? (idx + 1) % items.length
            : (idx - 1 + items.length) % items.length;
        opts.setIndex(newIdx);
        items[newIdx].classList.add('ac-highlighted');
        items[newIdx].scrollIntoView({ block: 'nearest' });

        opts.setSelection(items[newIdx].dataset.title);
        document.getElementById(opts.submitBtnId).disabled = false;
        return;
    }

    if (e.key === 'Enter') {
        e.preventDefault();
        if (isOpen) {
            const items = opts.listEl.querySelectorAll(opts.itemSelector);
            const idx = opts.getIndex();
            if (items.length > 0 && items[idx]) {
                opts.onSelect(items[idx].dataset.title);
            }
        } else if (opts.getSelection()) {
            opts.onSubmit();
        }
    }
}

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
    const words = query.split(/\s+/).filter(Boolean);
    const matches = modeSongs.filter(song => {
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
        autocompleteList.innerHTML = matches.map((song, i) => {
            const game = GAMES[song.game];
            const badge = game ? `<span class="autocomplete-game-badge" style="--badge-color: ${game.color}">${escapeHtml(game.shortName)}</span>` : '';
            const displayTitle = getDisplayTitle(song);
            const hl = i === 0 ? ' ac-highlighted' : '';
            return `<div class="autocomplete-item${hl}" data-title="${escapeHtml(song.title)}">${escapeHtml(displayTitle)}${badge}</div>`;
        }).join('');

        autocompleteList.classList.add('active');
        acIndex = 0;

        // Auto-select first match
        selectedSong = matches[0].title;
        submitButton.disabled = false;

        // Cap dropdown height to not exceed the viewport bottom
        const listRect = autocompleteList.getBoundingClientRect();
        const maxAvailable = window.innerHeight - listRect.top - 10;
        autocompleteList.style.maxHeight = Math.max(120, Math.min(350, maxAvailable)) + 'px';

        // Autocomplete click delegation is set up in setupEventListeners()
    } else {
        autocompleteList.classList.remove('active');
        selectedSong = null;
        submitButton.disabled = true;
    }
}

function handleSearchKeydown(e) {
    handleAutocompleteKeydown(e, {
        listEl: document.getElementById('autocompleteList'),
        itemSelector: '.autocomplete-item',
        getIndex: () => acIndex,
        setIndex: (i) => { acIndex = i; },
        getSelection: () => selectedSong,
        setSelection: (t) => { selectedSong = t; },
        submitBtnId: 'submitButton',
        onSelect: selectSongFromList,
        onSubmit: submitGuess
    });
}

function selectSongFromList(title) {
    // Find the song to display the correct localized title in the input
    const song = getSongsForMode(currentMode).find(s => s.title === title);
    const displayTitle = song ? getDisplayTitle(song) : title;
    document.getElementById('searchInput').value = displayTitle;
    document.getElementById('autocompleteList').classList.remove('active');
    selectedSong = title; // Always store the EN title internally
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
        if (!endlessMode) {
            saveGameState(currentMode, {
                dayNumber: dailySong.dayNumber,
                currentAttempt,
                guesses,
                gameOver: false
            });
        }
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
            if (!endlessMode) {
                saveGameState(currentMode, {
                    dayNumber: dailySong.dayNumber,
                    currentAttempt,
                    guesses,
                    gameOver: false
                });
            }
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

    const finalAttempt = won ? guesses.length : MAX_ATTEMPTS;

    if (endlessMode) {
        // Endless: save to endless history only
        const wasRandomStart = currentMode === 'random' && endlessRandomStart;
        saveToEndlessHistory(currentMode, won, finalAttempt, guesses, dailySong.game, wasRandomStart);
        applyTheme(currentMode, dailySong, true);
        showResults(dailySong, guesses, locale, won, true);
    } else {
        // Daily: save state + history, show share + countdown
        saveGameState(currentMode, {
            dayNumber: dailySong.dayNumber,
            currentAttempt,
            guesses,
            gameOver: true,
            won
        });
        saveToHistory(currentMode, dailySong.dayNumber, won, finalAttempt, guesses, dailySong.game);
        initShareScope();
        applyTheme(currentMode, dailySong, true);
        showResults(dailySong, guesses, locale, won, false);
        updateCountdown(locale);
        if (window.countdownInterval) clearInterval(window.countdownInterval);
        window.countdownInterval = setInterval(() => updateCountdown(locale), 1000);
    }
}

// ============================================
// RESULTS / SHARE
// ============================================

const SITE_URL = 'fusorf.github.io/xeno-series-heardle/';

function buildModeResult(mode, modeDailySong, savedState) {
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

    return `${modeName}\n${emoji.join('')}`;
}

let shareScope = 'this';

function initShareScope() {
    const today = getDailySong(currentMode).dayNumber;
    const allModesCount = Object.keys(GAME_MODES).length;
    let completedCount = 0;
    Object.values(GAME_MODES).forEach(mode => {
        const modeDailySong = getDailySong(mode.id);
        const savedState = loadGameState(mode.id, modeDailySong);
        if (savedState && savedState.gameOver && savedState.dayNumber === today) {
            completedCount++;
        }
    });
    shareScope = completedCount >= allModesCount ? 'all' : 'this';
}

function setShareScope(scope) {
    shareScope = scope;
    document.querySelectorAll('.scope-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.scope === scope);
    });
}

function buildShareText() {
    const today = getDailySong(currentMode).dayNumber;
    let text;

    if (shareScope === 'this') {
        const mode = GAME_MODES[currentMode];
        const modeDailySong = getDailySong(currentMode);
        const savedState = loadGameState(currentMode, modeDailySong);

        if (savedState && savedState.gameOver && savedState.dayNumber === today) {
            const result = buildModeResult(mode, modeDailySong, savedState);
            text = `Xeno Series Heardle #${today} 🎧\n\n${result}`;
        } else {
            text = `${mode.name} #${today} 🎧`;
        }
    } else {
        const results = [];

        Object.values(GAME_MODES).forEach(mode => {
            const modeDailySong = getDailySong(mode.id);
            const savedState = loadGameState(mode.id, modeDailySong);

            if (savedState && savedState.gameOver && savedState.dayNumber === today) {
                results.push(buildModeResult(mode, modeDailySong, savedState));
            }
        });

        if (results.length >= 1) {
            text = `Xeno Series Heardle #${today} 🎧\n\n${results.join('\n\n')}`;
        } else {
            text = `${GAME_MODES[currentMode].name} #${today} 🎧`;
        }
    }

    return text;
}

function copyResults() {
    const text = buildShareText();

    navigator.clipboard.writeText(text).then(() => {
        const button = document.querySelector('.copy-btn');
        if (button) {
            const span = button.querySelector('span');
            const originalText = span.textContent;
            span.textContent = locale.copied;
            setTimeout(() => {
                span.textContent = originalText;
            }, 2000);
        }
    });
}

function tweetResults() {
    const text = buildShareText();
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(tweetUrl, '_blank');
}

// ============================================
// START GAME
// ============================================

window.addEventListener('load', initGame);
