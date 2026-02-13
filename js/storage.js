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
// HISTORY MANAGEMENT
// ============================================

function getHistory(modeId) {
    const historyKey = `xenoHeardle_${modeId}_history`;
    const history = getCookie(historyKey);
    return history || [];
}

function saveToHistory(modeId, dayNumber, won, attempts, guesses) {
    const history = getHistory(modeId);

    // Check if this day is already in history
    const existingIndex = history.findIndex(h => h.day === dayNumber);

    const entry = {
        day: dayNumber,
        won: won,
        attempts: attempts,
        guesses: guesses,
        timestamp: new Date().toISOString()
    };

    if (existingIndex >= 0) {
        // Update existing entry
        history[existingIndex] = entry;
    } else {
        // Add new entry
        history.push(entry);
    }

    // Keep only last 100 days
    if (history.length > 100) {
        history.sort((a, b) => b.day - a.day);
        history.splice(100);
    }

    const historyKey = `xenoHeardle_${modeId}_history`;
    setCookie(historyKey, history, 365);
}

function getStats(modeId) {
    const history = getHistory(modeId);

    if (history.length === 0) {
        return {
            totalPlayed: 0,
            totalWon: 0,
            winRate: 0,
            currentStreak: 0,
            maxStreak: 0,
            guessDistribution: [0, 0, 0, 0, 0],
            oneShots: 0,
            oneShotStreak: 0,
            maxOneShotStreak: 0
        };
    }

    const totalPlayed = history.length;
    const totalWon = history.filter(h => h.won).length;
    const winRate = Math.round((totalWon / totalPlayed) * 100);

    // Calculate guess distribution
    const guessDistribution = [0, 0, 0, 0, 0];
    history.forEach(h => {
        if (h.won && h.attempts > 0 && h.attempts <= 5) {
            guessDistribution[h.attempts - 1]++;
        }
    });

    // Calculate streaks
    const sortedHistory = [...history].sort((a, b) => a.day - b.day);
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedHistory.length; i++) {
        if (sortedHistory[i].won) {
            tempStreak++;
            if (tempStreak > maxStreak) maxStreak = tempStreak;
            // Check if this is the most recent day
            if (i === sortedHistory.length - 1) {
                currentStreak = tempStreak;
            }
        } else {
            if (i === sortedHistory.length - 1) {
                currentStreak = 0;
            }
            tempStreak = 0;
        }
    }

    // Calculate one-shot stats
    const oneShots = history.filter(h => h.won && h.attempts === 1).length;
    let oneShotStreak = 0;
    let maxOneShotStreak = 0;
    let tempOneShotStreak = 0;

    for (let i = 0; i < sortedHistory.length; i++) {
        if (sortedHistory[i].won && sortedHistory[i].attempts === 1) {
            tempOneShotStreak++;
            if (tempOneShotStreak > maxOneShotStreak) maxOneShotStreak = tempOneShotStreak;
            if (i === sortedHistory.length - 1) {
                oneShotStreak = tempOneShotStreak;
            }
        } else {
            if (i === sortedHistory.length - 1 && !(sortedHistory[i].won && sortedHistory[i].attempts === 1)) {
                oneShotStreak = 0;
            }
            tempOneShotStreak = 0;
        }
    }

    return {
        totalPlayed,
        totalWon,
        winRate,
        currentStreak,
        maxStreak,
        guessDistribution,
        oneShots,
        oneShotStreak,
        maxOneShotStreak
    };
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

console.log('Debug commands:');
console.log('  clearAllCookies()    - Clear all saved games');
console.log('  clearModeCookies(mode) - Clear specific mode (e.g., clearModeCookies("xenosaga"))');
console.log('  showCookies()        - Show all saved states');
