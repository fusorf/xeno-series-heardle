// ============================================
// THEME SYSTEM - CSS Stylesheet Swapping
// ============================================

// Track currently loaded theme stylesheets
let currentGamemodeLink = null;
let currentGameLink = null;

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
    } else {
        // Standard mode: load the gamemode theme
        currentGamemodeLink.setAttribute('href', `themes/gamemodes/${modeId}.css`);
        // Clear game theme (will be set when results show)
        currentGameLink.setAttribute('href', '');
    }
}

/**
 * Switch to the results screen theme: the song's game/DLC theme.
 * The game theme <link> loads AFTER the gamemode <link>,
 * so its :root overrides win by source order.
 */
function applyResultsTheme(gameId) {
    currentGameLink.setAttribute('href', `themes/games/${gameId}.css`);
}

/**
 * Clear the game theme (when going back from results to gameplay).
 */
function clearGameTheme() {
    currentGameLink.setAttribute('href', '');
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
