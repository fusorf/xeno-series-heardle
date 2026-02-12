#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Update songs.js with proper GAMES metadata and mode configurations
"""

import os

# Game metadata with DLC relationships
GAMES_METADATA = """const GAMES = {
  // ========== XENOBLADE X ==========
  'xenoblade-x': {
    id: 'xenoblade-x',
    name: 'Xenoblade Chronicles X',
    shortName: 'Xenoblade X',
    color: '#00A8E8',
    bgImage: 'assets/bg/xenoblade-x.jpg',
    coverArt: 'assets/covers/xenoblade-x.jpg',
    folder: 'xenoblade-x'
  },
  'xenoblade-x-de': {
    id: 'xenoblade-x-de',
    name: 'Xenoblade Chronicles X - Definitive Edition (New Content)',
    shortName: 'XCX DE',
    color: '#00D4FF',
    bgImage: 'assets/bg/xenoblade-x-de.jpg',
    coverArt: 'assets/covers/xenoblade-x-de.jpg',
    folder: 'xenoblade-x-de',
    parentGame: 'xenoblade-x',
    isDLC: true
  },

  // ========== XENOBLADE 1 ==========
  'xenoblade-1': {
    id: 'xenoblade-1',
    name: 'Xenoblade Chronicles Definitive Edition',
    shortName: 'Xenoblade 1 DE',
    color: '#E63946',
    bgImage: 'assets/bg/xenoblade-1.jpg',
    coverArt: 'assets/covers/xenoblade-1.jpg',
    folder: 'xenoblade-1'
  },
  'xenoblade-1-fc': {
    id: 'xenoblade-1-fc',
    name: 'Xenoblade Chronicles - Future Connected',
    shortName: 'XC1 Future Connected',
    color: '#FF6B9D',
    bgImage: 'assets/bg/xenoblade-1-fc.jpg',
    coverArt: 'assets/covers/xenoblade-1-fc.jpg',
    folder: 'xenoblade-1-fc',
    parentGame: 'xenoblade-1',
    isDLC: true
  },
  'xenoblade-1-wii': {
    id: 'xenoblade-1-wii',
    name: 'Xenoblade Chronicles (Wii Original)',
    shortName: 'Xenoblade Wii',
    color: '#D62828',
    bgImage: 'assets/bg/xenoblade-1-wii.jpg',
    coverArt: 'assets/covers/xenoblade-1-wii.jpg',
    folder: 'xenoblade-1-wii'
  },

  // ========== XENOBLADE 2 ==========
  'xenoblade-2': {
    id: 'xenoblade-2',
    name: 'Xenoblade Chronicles 2',
    shortName: 'Xenoblade 2',
    color: '#06D6A0',
    bgImage: 'assets/bg/xenoblade-2.jpg',
    coverArt: 'assets/covers/xenoblade-2.jpg',
    folder: 'xenoblade-2'
  },
  'xenoblade-2-torna': {
    id: 'xenoblade-2-torna',
    name: 'Xenoblade Chronicles 2 - Torna: The Golden Country',
    shortName: 'XC2 Torna',
    color: '#20C997',
    bgImage: 'assets/bg/xenoblade-2-torna.jpg',
    coverArt: 'assets/covers/xenoblade-2-torna.jpg',
    folder: 'xenoblade-2-torna',
    parentGame: 'xenoblade-2',
    isDLC: true
  },

  // ========== XENOBLADE 3 ==========
  'xenoblade-3': {
    id: 'xenoblade-3',
    name: 'Xenoblade Chronicles 3',
    shortName: 'Xenoblade 3',
    color: '#FFB700',
    bgImage: 'assets/bg/xenoblade-3.jpg',
    coverArt: 'assets/covers/xenoblade-3.jpg',
    folder: 'xenoblade-3'
  },
  'xenoblade-3-fr': {
    id: 'xenoblade-3-fr',
    name: 'Xenoblade Chronicles 3 - Future Redeemed',
    shortName: 'XC3 Future Redeemed',
    color: '#FFC300',
    bgImage: 'assets/bg/xenoblade-3-fr.jpg',
    coverArt: 'assets/covers/xenoblade-3-fr.jpg',
    folder: 'xenoblade-3-fr',
    parentGame: 'xenoblade-3',
    isDLC: true
  },

  // ========== XENOSAGA ==========
  'xenosaga-1': {
    id: 'xenosaga-1',
    name: 'Xenosaga Episode I',
    shortName: 'Xenosaga I',
    color: '#7209B7',
    bgImage: 'assets/bg/xenosaga-1.jpg',
    coverArt: 'assets/covers/xenosaga-1.jpg',
    folder: 'xenosaga-1'
  },
  'xenosaga-2': {
    id: 'xenosaga-2',
    name: 'Xenosaga Episode II',
    shortName: 'Xenosaga II',
    color: '#9D4EDD',
    bgImage: 'assets/bg/xenosaga-2.jpg',
    coverArt: 'assets/covers/xenosaga-2.jpg',
    folder: 'xenosaga-2'
  },
  'xenosaga-2-gamerip': {
    id: 'xenosaga-2-gamerip',
    name: 'Xenosaga Episode II (Gamerip)',
    shortName: 'Xenosaga II',
    color: '#9D4EDD',
    bgImage: 'assets/bg/xenosaga-2.jpg',
    coverArt: 'assets/covers/xenosaga-2.jpg',
    folder: 'xenosaga-2-gamerip'
  },
  'xenosaga-2-movie': {
    id: 'xenosaga-2-movie',
    name: 'Xenosaga Episode II (Movie)',
    shortName: 'Xenosaga II',
    color: '#9D4EDD',
    bgImage: 'assets/bg/xenosaga-2.jpg',
    coverArt: 'assets/covers/xenosaga-2.jpg',
    folder: 'xenosaga-2-movie'
  },
  'xenosaga-3': {
    id: 'xenosaga-3',
    name: 'Xenosaga Episode III',
    shortName: 'Xenosaga III',
    color: '#5A189A',
    bgImage: 'assets/bg/xenosaga-3.jpg',
    coverArt: 'assets/covers/xenosaga-3.jpg',
    folder: 'xenosaga-3'
  },

  // ========== XENOSAGA SPIN-OFFS ==========
  'xenosaga-freaks': {
    id: 'xenosaga-freaks',
    name: 'Xenosaga Freaks',
    shortName: 'Freaks',
    color: '#C77DFF',
    bgImage: 'assets/bg/xenosaga-freaks.jpg',
    coverArt: 'assets/covers/xenosaga-freaks.jpg',
    folder: 'xenosaga-freaks',
    isSpinOff: true
  },
  'xenosaga-pied-piper': {
    id: 'xenosaga-pied-piper',
    name: 'Xenosaga Pied Piper',
    shortName: 'Pied Piper',
    color: '#B5179E',
    bgImage: 'assets/bg/xenosaga-pied-piper.jpg',
    coverArt: 'assets/covers/xenosaga-pied-piper.jpg',
    folder: 'xenosaga-pied-piper',
    isSpinOff: true
  },

  // ========== OTHER ==========
  'xenogears': {
    id: 'xenogears',
    name: 'Xenogears',
    shortName: 'Xenogears',
    color: '#8B4513',
    bgImage: 'assets/bg/xenogears.jpg',
    coverArt: 'assets/covers/xenogears.jpg',
    folder: 'xenogears'
  },
  'smash-remixes': {
    id: 'smash-remixes',
    name: 'Super Smash Bros. Ultimate - Xenoblade',
    shortName: 'Smash Remixes',
    color: '#FF006E',
    bgImage: 'assets/bg/smash.jpg',
    coverArt: 'assets/covers/smash.jpg',
    folder: 'smash-remixes'
  }
};
"""

# Helper function to get all games including DLC for a parent
def get_helper_function():
    return """
// Helper: Get all games including their DLC
function getGamesWithDLC(baseGames) {
  const result = [];
  baseGames.forEach(gameId => {
    result.push(gameId);
    // Add DLC for this game
    Object.values(GAMES).forEach(game => {
      if (game.parentGame === gameId && game.isDLC) {
        result.push(game.id);
      }
    });
  });
  return result;
}
"""

# Mode configurations
MODES_CONFIG = """const GAME_MODES = {
  'full-xeno': {
    id: 'full-xeno',
    name: 'Full Xeno Series',
    description: 'All main Xeno games + DLC',
    color: '#E63946',
    bgImage: 'assets/bg/full-xeno.jpg',
    games: getGamesWithDLC([
      'xenoblade-1', 'xenoblade-2', 'xenoblade-3', 'xenoblade-x',
      'xenosaga-1', 'xenosaga-2', 'xenosaga-3',
      'xenogears', 'smash-remixes'
    ]),
    randomStart: false
  },
  'xenoblade': {
    id: 'xenoblade',
    name: 'Xenoblade Heardle',
    description: 'Xenoblade Chronicles series + DLC',
    color: '#E63946',
    bgImage: 'assets/bg/xenoblade-all.jpg',
    games: getGamesWithDLC([
      'xenoblade-1', 'xenoblade-2', 'xenoblade-3', 'xenoblade-x',
      'smash-remixes'
    ]),
    randomStart: false
  },
  'xenosaga': {
    id: 'xenosaga',
    name: 'Xenosaga Heardle',
    description: 'Xenosaga trilogy',
    color: '#7209B7',
    bgImage: 'assets/bg/xenosaga-all.jpg',
    games: ['xenosaga-1', 'xenosaga-2', 'xenosaga-3'],
    randomStart: false
  },
  'random': {
    id: 'random',
    name: 'Random Daily',
    description: 'Random game each day',
    color: '#FF6B35',
    bgImage: null,
    games: getGamesWithDLC([
      'xenoblade-1', 'xenoblade-2', 'xenoblade-3', 'xenoblade-x',
      'xenoblade-1-wii',  // Wii originals only in random
      'xenosaga-1', 'xenosaga-2', 'xenosaga-3',
      'xenosaga-freaks', 'xenosaga-pied-piper',  // Spin-offs only in random
      'xenogears', 'smash-remixes'
    ]),
    randomStart: true,
    randomGameDaily: true,
    showDailyGame: true
  }
};
"""

def main():
    print("[*] Generating updated songs.js header...")

    header = """// ============================================
// XENO SERIES HEARDLE - SONG DATABASE
// ============================================

// Base URL for Cloudflare R2 storage (to be configured later)
const AUDIO_BASE_URL = '';

// ============================================
// GAME METADATA
// ============================================
"""

    output = header + GAMES_METADATA + "\n"
    output += get_helper_function() + "\n"

    output += "// ============================================\n"
    output += "// GAME MODE CONFIGURATIONS\n"
    output += "// ============================================\n"
    output += MODES_CONFIG + "\n"

    # Read generated songs (in parent directory)
    print("[*] Reading generated_songs.js...")
    generated_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "generated_songs.js")
    with open(generated_path, 'r', encoding='utf-8') as f:
        generated_content = f.read()

    # Skip the header in generated file
    song_arrays_start = generated_content.find("// smash-remixes")
    if song_arrays_start == -1:
        song_arrays_start = generated_content.find("const SONGS_")

    song_arrays = generated_content[song_arrays_start:]

    output += "// ============================================\n"
    output += "// SONG POOLS BY GAME\n"
    output += "// ============================================\n\n"
    output += song_arrays

    # Add SONG_POOLS mapping
    output += "\n// ============================================\n"
    output += "// SONG POOL MAPPING\n"
    output += "// ============================================\n"
    output += "const SONG_POOLS = {\n"

    pools = [
        "smash-remixes", "xenoblade-1", "xenoblade-1-fc", "xenoblade-1-wii",
        "xenoblade-2", "xenoblade-2-torna", "xenoblade-3", "xenoblade-3-fr",
        "xenoblade-x", "xenoblade-x-de", "xenogears",
        "xenosaga-1", "xenosaga-3",
        "xenosaga-freaks", "xenosaga-pied-piper"
    ]

    for pool in pools:
        var_name = f"SONGS_{pool.upper().replace('-', '_')}"
        output += f"  '{pool}': {var_name},\n"

    # Combine both Xenosaga 2 sources into one pool
    output += "  'xenosaga-2': [...SONGS_XENOSAGA_2_GAMERIP, ...SONGS_XENOSAGA_2_MOVIE],\n"

    output += "};\n\n"

    # Add helper functions
    output += """// ============================================
// HELPER FUNCTIONS
// ============================================

// Get all songs for a specific mode
function getSongsForMode(modeId) {
  const mode = GAME_MODES[modeId];
  if (!mode) return [];

  const songs = [];
  mode.games.forEach(gameId => {
    const gameSongs = SONG_POOLS[gameId] || [];
    songs.push(...gameSongs);
  });

  return songs;
}

// Get audio URL for a song
function getAudioUrl(song) {
  const game = GAMES[song.game];
  if (!game) return '';

  // Encode filename to handle spaces, #, and special characters
  const encodedFile = encodeURIComponent(song.file);

  // If AUDIO_BASE_URL is set, use R2 storage
  if (AUDIO_BASE_URL) {
    return `${AUDIO_BASE_URL}/${game.folder}/${encodedFile}`;
  }

  // Otherwise return local path for testing
  return `music/${game.folder}/${encodedFile}`;
}

// Legacy compatibility
const SONGS = SONGS_XENOBLADE_X;
"""

    # Write updated songs.js (in parent directory)
    print("[*] Writing songs.js...")
    songs_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "songs.js")
    with open(songs_path, 'w', encoding='utf-8') as f:
        f.write(output)

    print("\n[+] songs.js updated successfully!")
    print("[*] Summary:")
    print("    - Game metadata with DLC relationships")
    print("    - Helper function for DLC inclusion")
    print("    - 4 game modes configured")
    print("    - 835 songs organized by game")
    print("    - Song pool mapping complete")

if __name__ == "__main__":
    main()
