// ============================================
// THEME SYSTEM - CSS Stylesheet Swapping
// ============================================

// Track currently loaded theme stylesheets
let currentGamemodeLink = null;
let currentGameLink = null;

// Track current background URL
let currentBgUrl = null;
let bgTransitionTimer = null;

/**
 * Initialize theme system - create the <link> elements in <head>.
 * Called once at startup.
 */
function initThemeSystem() {
    // Gamemode theme (applied during gameplay)
    currentGamemodeLink = document.createElement('link');
    currentGamemodeLink.rel = 'stylesheet';
    currentGamemodeLink.id = 'theme-gamemode';
    document.head.appendChild(currentGamemodeLink);

    // Game theme (applied on results screen, or for Random mode)
    currentGameLink = document.createElement('link');
    currentGameLink.rel = 'stylesheet';
    currentGameLink.id = 'theme-game';
    document.head.appendChild(currentGameLink);
}

/**
 * Derive background image URL from a game or mode ID.
 * Convention: images/<id>/background.webp
 */
function getBackgroundUrl(id) {
    return `images/${id}/background.webp`;
}

/**
 * Single entry point for all theme changes.
 *
 * @param {string} modeId   - The gamemode id (e.g. 'xenoblade', 'random')
 * @param {object} song     - The daily song object
 * @param {boolean} isResults - true = results screen, false = gameplay screen
 */
function applyTheme(modeId, song, isResults = false) {
    const mode = GAME_MODES[modeId];
    if (!mode) return;

    if (mode.showDailyGame && song && song.dailyGame) {
        // Random mode: use the daily game's theme throughout
        currentGamemodeLink.setAttribute('href', '');
        currentGameLink.setAttribute('href', `themes/games/${song.game}.css`);
        setBackground(getBackgroundUrl(song.game));
    } else if (isResults) {
        // Results screen: load both gamemode CSS (variables) and game CSS (overrides)
        currentGamemodeLink.setAttribute('href', `themes/gamemodes/${modeId}.css`);
        currentGameLink.setAttribute('href', `themes/games/${song.game}.css`);
        setBackground(getBackgroundUrl(song.game));
    } else {
        // Gameplay screen: gamemode only
        currentGamemodeLink.setAttribute('href', `themes/gamemodes/${modeId}.css`);
        currentGameLink.setAttribute('href', '');
        setBackground(getBackgroundUrl(modeId));
    }
}

/**
 * Clear the game theme (when going back from results to gameplay).
 */
function clearGameTheme() {
    currentGameLink.setAttribute('href', '');
}

// ============================================
// BACKGROUND IMAGE MANAGEMENT
// ============================================

/**
 * Set the background image on a single layer.
 * First call (no current bg): apply directly with fade-in.
 * Subsequent calls: fade-out, swap image, fade-in.
 */
function setBackground(bgImageUrl) {
    const layer = document.getElementById('backgroundLayer');
    if (!layer) return;

    // Same image — nothing to do
    if (bgImageUrl === currentBgUrl) return;

    // Cancel any pending transition
    if (bgTransitionTimer) {
        clearTimeout(bgTransitionTimer);
        bgTransitionTimer = null;
    }

    if (!bgImageUrl) {
        layer.classList.remove('active');
        currentBgUrl = null;
        return;
    }

    // First load or no current background — apply directly
    if (!currentBgUrl) {
        layer.style.backgroundImage = `url('${bgImageUrl}')`;
        layer.classList.add('active');
        currentBgUrl = bgImageUrl;

        // Check 404
        const img = new Image();
        img.onerror = () => { layer.classList.remove('active'); currentBgUrl = null; };
        img.src = bgImageUrl;
        return;
    }

    // Fade out, swap, fade in
    layer.classList.remove('active');
    bgTransitionTimer = setTimeout(() => {
        layer.style.backgroundImage = `url('${bgImageUrl}')`;
        layer.classList.add('active');
        currentBgUrl = bgImageUrl;
        bgTransitionTimer = null;
    }, 100); // Match CSS transition duration

    // Check 404
    const img = new Image();
    img.onerror = () => { layer.classList.remove('active'); currentBgUrl = null; };
    img.src = bgImageUrl;
}

