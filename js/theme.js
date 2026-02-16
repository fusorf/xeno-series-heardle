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
 * Apply the gamemode theme (used during gameplay / guessing screen).
 * For Random mode, applies the daily game's theme instead.
 * Legacy wrapper: called from game.js as applyTheme().
 */
function applyTheme(modeId, song = null) {
    const mode = GAME_MODES[modeId];
    if (!mode) return;

    if (mode.showDailyGame && song && song.dailyGame) {
        // Random mode: use the daily game's theme throughout
        currentGamemodeLink.setAttribute('href', '');
        currentGameLink.setAttribute('href', `themes/games/${song.game}.css`);
        // Set background from the daily game
        setBackground(getBackgroundUrl(song.game));
    } else {
        // Standard mode: load the gamemode theme
        currentGamemodeLink.setAttribute('href', `themes/gamemodes/${modeId}.css`);
        // Clear game theme (will be set when results show)
        currentGameLink.setAttribute('href', '');
        // Set background from gamemode (if it exists)
        setBackground(getBackgroundUrl(modeId));
    }
}

/**
 * Switch to the results screen theme: the song's game/DLC theme.
 * The game theme <link> loads AFTER the gamemode <link>,
 * so its :root overrides win by source order.
 */
function applyResultsTheme(gameId) {
    currentGameLink.setAttribute('href', `themes/games/${gameId}.css`);
    // Switch background to the game's artwork
    setBackground(getBackgroundUrl(gameId));
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

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
