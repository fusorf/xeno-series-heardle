// ============================================
// STORAGE & COOKIE MANAGEMENT
// ============================================

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + JSON.stringify(value) + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            try {
                return JSON.parse(c.substring(nameEQ.length, c.length));
            } catch (e) {
                return null;
            }
        }
    }
    return null;
}

function loadGameState(currentMode, dailySong) {
    const cookieName = `xenoHeardle_${currentMode}_state`;
    const savedState = getCookie(cookieName);
    if (savedState && savedState.dayNumber === dailySong.dayNumber) {
        return savedState;
    }
    return null;
}

function saveGameState(currentMode, state) {
    const cookieName = `xenoHeardle_${currentMode}_state`;
    setCookie(cookieName, state, 1);
}

// ============================================
// DEBUG CONSOLE COMMANDS
// ============================================

// Clear all cookies for all modes
function clearAllCookies() {
    const modes = ['xenoblade', 'full-xeno', 'xenosaga', 'random'];
    modes.forEach(mode => {
        const cookieName = `xenoHeardle_${mode}_state`;
        document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    });
    console.log('✅ All cookies cleared! Reload the page to start fresh.');
}

// Clear cookies for a specific mode
function clearModeCookies(mode) {
    const cookieName = `xenoHeardle_${mode}_state`;
    document.cookie = cookieName + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    console.log(`✅ Cookies cleared for mode: ${mode}. Reload the page to start fresh.`);
}

// Show all saved cookies
function showCookies() {
    const modes = ['xenoblade', 'full-xeno', 'xenosaga', 'random'];
    console.log('📊 Saved game states:');
    modes.forEach(mode => {
        const state = getCookie(`xenoHeardle_${mode}_state`);
        if (state) {
            console.log(`  ${mode}: Day ${state.dayNumber}, Attempt ${state.currentAttempt}, GameOver: ${state.gameOver}`);
        } else {
            console.log(`  ${mode}: No saved state`);
        }
    });
}

console.log('🎮 Debug commands available:');
console.log('  clearAllCookies()    - Clear all saved games');
console.log('  clearModeCookies(mode) - Clear specific mode (e.g., clearModeCookies("xenosaga"))');
console.log('  showCookies()        - Show all saved states');
