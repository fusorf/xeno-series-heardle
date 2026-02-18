// ============================================
// STORAGE MANAGEMENT (localStorage)
// ============================================

function storageSet(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('localStorage write failed:', e);
    }
}

function storageGet(key) {
    try {
        const raw = localStorage.getItem(key);
        if (raw === null) return null;
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function storageRemove(key) {
    localStorage.removeItem(key);
}

// ============================================
// TEMPORARY: Cookie → localStorage migration
// TODO: Remove after ~1 week (added 2025-02-18)
// ============================================

(function migrateCookies() {
    function readCookie(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(nameEQ) === 0) {
                try { return JSON.parse(c.substring(nameEQ.length)); }
                catch (e) { return null; }
            }
        }
        return null;
    }

    function deleteCookie(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    const keys = ['xenoHeardleMode', 'xenoHeardleLanguage'];
    const modes = ['xenoblade', 'full-xeno', 'xenosaga', 'random'];
    modes.forEach(mode => {
        keys.push(`xenoHeardle_${mode}_state`);
        keys.push(`xenoHeardle_${mode}_history`);
        keys.push(`xenoHeardle_${mode}_endless`);
    });

    let migrated = 0;
    keys.forEach(key => {
        const value = readCookie(key);
        if (value !== null) {
            // Only migrate if localStorage doesn't already have data for this key
            if (localStorage.getItem(key) === null) {
                try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
                migrated++;
            }
            deleteCookie(key);
        }
    });

    if (migrated > 0) {
        console.log(`🔄 Migrated ${migrated} cookie(s) to localStorage.`);
    }
})();

// ============================================

function loadGameState(currentMode, dailySong) {
    const key = `xenoHeardle_${currentMode}_state`;
    const savedState = storageGet(key);
    if (savedState && savedState.dayNumber === dailySong.dayNumber) {
        return savedState;
    }
    return null;
}

function saveGameState(currentMode, state) {
    const key = `xenoHeardle_${currentMode}_state`;
    storageSet(key, state);
}

// ============================================
// HISTORY MANAGEMENT
// ============================================

function getHistory(modeId) {
    const key = `xenoHeardle_${modeId}_history`;
    const history = storageGet(key);
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

    const key = `xenoHeardle_${modeId}_history`;
    storageSet(key, history);
}

// ============================================
// ENDLESS HISTORY MANAGEMENT
// ============================================

function getEndlessHistory(modeId) {
    const key = `xenoHeardle_${modeId}_endless`;
    const history = storageGet(key);
    return history || [];
}

function saveToEndlessHistory(modeId, won, attempts, guesses) {
    const history = getEndlessHistory(modeId);

    history.push({
        won,
        attempts,
        guesses,
        timestamp: new Date().toISOString()
    });

    // Keep last 200 entries
    if (history.length > 200) {
        history.splice(0, history.length - 200);
    }

    const key = `xenoHeardle_${modeId}_endless`;
    storageSet(key, history);
}

function getEndlessStats(modeId) {
    const history = getEndlessHistory(modeId);
    return computeStats(history);
}

// ============================================
// STATS COMPUTATION
// ============================================

/**
 * Compute stats from a history array.
 * Works for both daily (sorted by day) and endless (sorted by array order).
 */
function computeStats(history) {
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

    // Guess distribution
    const guessDistribution = [0, 0, 0, 0, 0];
    history.forEach(h => {
        if (h.won && h.attempts > 0 && h.attempts <= 5) {
            guessDistribution[h.attempts - 1]++;
        }
    });

    // Streaks (use array order — works for both daily sorted by day and endless by insertion)
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < history.length; i++) {
        if (history[i].won) {
            tempStreak++;
            if (tempStreak > maxStreak) maxStreak = tempStreak;
            if (i === history.length - 1) currentStreak = tempStreak;
        } else {
            if (i === history.length - 1) currentStreak = 0;
            tempStreak = 0;
        }
    }

    // One-shot stats
    const oneShots = history.filter(h => h.won && h.attempts === 1).length;
    let oneShotStreak = 0;
    let maxOneShotStreak = 0;
    let tempOneShotStreak = 0;

    for (let i = 0; i < history.length; i++) {
        if (history[i].won && history[i].attempts === 1) {
            tempOneShotStreak++;
            if (tempOneShotStreak > maxOneShotStreak) maxOneShotStreak = tempOneShotStreak;
            if (i === history.length - 1) oneShotStreak = tempOneShotStreak;
        } else {
            if (i === history.length - 1) oneShotStreak = 0;
            tempOneShotStreak = 0;
        }
    }

    return {
        totalPlayed, totalWon, winRate,
        currentStreak, maxStreak,
        guessDistribution,
        oneShots, oneShotStreak, maxOneShotStreak
    };
}

function getStats(modeId) {
    const history = getHistory(modeId);
    // Sort daily history by day number before computing streaks
    const sorted = [...history].sort((a, b) => a.day - b.day);
    return computeStats(sorted);
}

// ============================================
// DEBUG CONSOLE COMMANDS
// ============================================

// Clear all data for all modes
function clearAllData() {
    const modes = ['xenoblade', 'full-xeno', 'xenosaga', 'random'];
    modes.forEach(mode => {
        storageRemove(`xenoHeardle_${mode}_state`);
        storageRemove(`xenoHeardle_${mode}_history`);
        storageRemove(`xenoHeardle_${mode}_endless`);
    });
    storageRemove('xenoHeardleMode');
    storageRemove('xenoHeardleLanguage');
    console.log('✅ All data cleared! Reload the page to start fresh.');
}

// Clear data for a specific mode
function clearModeData(mode) {
    storageRemove(`xenoHeardle_${mode}_state`);
    storageRemove(`xenoHeardle_${mode}_history`);
    storageRemove(`xenoHeardle_${mode}_endless`);
    console.log(`✅ Data cleared for mode: ${mode}. Reload the page to start fresh.`);
}

// Show all saved data
function showData() {
    const modes = ['xenoblade', 'full-xeno', 'xenosaga', 'random'];
    console.log('📊 Saved game states:');
    modes.forEach(mode => {
        const state = storageGet(`xenoHeardle_${mode}_state`);
        if (state) {
            console.log(`  ${mode}: Day ${state.dayNumber}, Attempt ${state.currentAttempt}, GameOver: ${state.gameOver}`);
        } else {
            console.log(`  ${mode}: No saved state`);
        }
    });
    console.log('📈 History sizes:');
    modes.forEach(mode => {
        const history = storageGet(`xenoHeardle_${mode}_history`) || [];
        const endless = storageGet(`xenoHeardle_${mode}_endless`) || [];
        console.log(`  ${mode}: ${history.length} daily, ${endless.length} endless`);
    });
}

if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  console.log('Debug commands:');
  console.log('  clearAllData()       - Clear all saved data');
  console.log('  clearModeData(mode)  - Clear specific mode (e.g., clearModeData("xenosaga"))');
  console.log('  showData()           - Show all saved states & history sizes');
}
