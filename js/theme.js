// ============================================
// THEME SYSTEM
// ============================================

function applyTheme(modeId, song = null) {
    const mode = GAME_MODES[modeId];
    if (!mode) return;

    let themeColor;
    let bgImage;

    // For Random mode, use the daily game's theme
    if (mode.showDailyGame && song && song.dailyGame) {
        themeColor = song.dailyGame.color;
        bgImage = song.dailyGame.bgImage;
    } else {
        themeColor = mode.color;
        bgImage = mode.bgImage;
    }

    // Convert hex to RGB for glow effects
    const rgb = hexToRgb(themeColor);
    const glowColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` : 'rgba(57, 166, 164, 0.7)';

    // Apply CSS variables
    document.documentElement.style.setProperty('--theme-primary', themeColor);
    document.documentElement.style.setProperty('--theme-glow', glowColor);

    // TODO: Apply background image when available
    // if (bgImage) {
    //     document.body.style.backgroundImage = `url('${bgImage}')`;
    //     document.body.style.backgroundSize = 'cover';
    //     document.body.style.backgroundPosition = 'center';
    //     document.body.style.backgroundBlendMode = 'overlay';
    // }
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
