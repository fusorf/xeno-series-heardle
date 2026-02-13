// ============================================
// DETERMINISTIC RANDOM SYSTEM
// ============================================
// Uses cryptographic PRNG with deterministic seeding
// Ensures all clients get the same daily song

// ============================================
// SEEDED RANDOM NUMBER GENERATOR
// ============================================
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  // Simple but effective hash function for seeding
  hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Linear Congruential Generator (LCG) - improved version
  // Using better constants than the original
  next() {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff; // Return 0-1
  }

  // Get random integer between min (inclusive) and max (exclusive)
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min)) + min;
  }

  // Shuffle array using Fisher-Yates algorithm
  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// ============================================
// DAILY SONG SELECTION SYSTEM
// ============================================

// Get current UTC date as YYYY-MM-DD string
// Song changes at 23:00 UTC (1 hour before midnight)
function getUTCDateString() {
  const now = new Date();

  // Add 1 hour offset so the day changes at 23:00 UTC instead of 00:00 UTC
  const offsetDate = new Date(now.getTime() + (1 * 60 * 60 * 1000));

  const year = offsetDate.getUTCFullYear();
  const month = String(offsetDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(offsetDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get day number since epoch (for consistent numbering)
function getDaysSinceEpoch(dateString) {
  const baseDate = new Date('2026-02-09T00:00:00Z'); // Epoch start (launch date)
  const currentDate = new Date(dateString + 'T00:00:00Z');
  const diffTime = currentDate - baseDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Start at day 1
}

// Create deterministic seed for a specific day and mode
function createSeed(dateString, modeId, extraSalt = '') {
  const seedString = `${dateString}-${modeId}-${extraSalt}-xenoheardle`;
  const rng = new SeededRandom(0);
  return rng.hash(seedString);
}

// ============================================
// MODE-SPECIFIC SONG SELECTION
// ============================================

// Select daily song for standard modes (full-xeno, xenoblade, xenosaga)
function selectStandardDailySong(modeId, dateString) {
  const songs = getSongsForMode(modeId);
  if (songs.length === 0) return null;

  // Create seed based on date and mode
  const seed = createSeed(dateString, modeId);
  const rng = new SeededRandom(seed);

  // Shuffle all songs deterministically
  const shuffled = rng.shuffle(songs);

  // Use cycle system to avoid immediate repeats (20-day cycles)
  const dayNumber = getDaysSinceEpoch(dateString);
  const cycleLength = Math.min(20, songs.length);
  const songIndex = (dayNumber - 1) % shuffled.length;

  return {
    ...shuffled[songIndex],
    dayNumber,
    startTime: 0, // Always start at beginning for standard modes
    mode: modeId
  };
}

// Select daily song for random mode (picks game, then song, with random start)
// Note: The selected game is SHOWN to the player (not hidden)
// Players know which game the song is from, but must guess the specific song
function selectRandomDailySong(dateString) {
  const mode = GAME_MODES['random'];
  if (!mode) return null;

  const dayNumber = getDaysSinceEpoch(dateString);

  // Step 1: Choose random game for today (THIS IS SHOWN TO PLAYERS)
  const gameSeed = createSeed(dateString, 'random', 'game');
  const gameRng = new SeededRandom(gameSeed);
  const gameIndex = gameRng.nextInt(0, mode.games.length);
  const selectedGameId = mode.games[gameIndex];
  const selectedGame = GAMES[selectedGameId];

  // Step 2: Get songs from selected game
  const gameSongs = SONG_POOLS[selectedGameId] || [];
  if (gameSongs.length === 0) return null;

  // Step 3: Choose random song from that game
  const songSeed = createSeed(dateString, 'random', 'song');
  const songRng = new SeededRandom(songSeed);
  const shuffledSongs = songRng.shuffle(gameSongs);
  const songIndex = (dayNumber - 1) % shuffledSongs.length;
  const selectedSong = shuffledSongs[songIndex];

  // Step 4: Choose random start time
  const minRequiredDuration = 16; // DURATIONS[4] = 16 seconds
  const maxStartTime = Math.max(0, selectedSong.duration - minRequiredDuration);
  const timeSeed = createSeed(dateString, 'random', 'starttime');
  const timeRng = new SeededRandom(timeSeed);
  const startTime = maxStartTime > 0 ? timeRng.nextInt(0, maxStartTime + 1) : 0;

  return {
    ...selectedSong,
    dayNumber,
    startTime, // Random start time!
    mode: 'random',
    dailyGame: selectedGame // Include which game was selected
  };
}

// ============================================
// MAIN DAILY SONG GETTER
// ============================================

// Get the daily song for current mode
function getDailySong(modeId = 'full-xeno') {
  const dateString = getUTCDateString();
  const mode = GAME_MODES[modeId];

  if (!mode) {
    return null;
  }

  // Random mode uses special logic
  if (mode.randomGameDaily) {
    return selectRandomDailySong(dateString);
  }

  // Standard modes
  return selectStandardDailySong(modeId, dateString);
}
