# Tools Directory

This directory contains utility scripts for managing the Xeno Series Heardle project.

## Scripts Overview

### 1. `scan_music.py`
**Purpose:** Scans your local music library and generates song entries.

**What it does:**
- Scans all folders in your music library
- Extracts metadata (title, duration, file name)
- Handles special cases:
  - Trinity Box: Splits into 6 games (XC1 DE, XC1 FC, XC2, XC2 Torna, XC3, XC3 FR)
  - XCX DE: Splits into base game + DE exclusive tracks
  - Xenosaga II: Creates separate arrays for gamerip and movie soundtrack
- Generates `generated_songs.js` in **project root** (temporary file)

**Usage:**
```bash
python tools/scan_music.py
```

**Output:** `generated_songs.js` in project root (159KB)

---

### 2. `update_songs_metadata.py`
**Purpose:** Combines metadata + mode configs + generated songs into final `songs.js`.

**What it does:**
- Reads `generated_songs.js` from project root
- Adds GAMES metadata (16 games with colors, themes, DLC relationships)
- Adds GAME_MODES configuration (4 modes)
- Adds helper functions (getGamesWithDLC, getSongsForMode, getAudioUrl)
- Creates SONG_POOLS mapping
- Combines Xenosaga II gamerip + movie into single pool
- Writes final `songs.js` to **project root**

**Usage:**
```bash
python tools/update_songs_metadata.py
```

**Output:** `songs.js` in project root (168KB)

---

### 3. `setup_music_links.py`
**Purpose:** Creates symbolic links from your music library to the project.

**What it does:**
- Creates Windows junction points (no admin rights needed)
- Links 16 game folders to `music/` directory
- Saves disk space (no file duplication)

**Usage:**
```bash
python tools/setup_music_links.py
```

**Output:** Symbolic links in `music/` directory

---

## Workflow

### Full Workflow (when music library changes):
```bash
# 1. Scan music library
python tools/scan_music.py

# 2. Update songs.js with metadata
python tools/update_songs_metadata.py

# 3. Commit changes
git add songs.js
git commit -m "Update song database"
```

### One-time Setup (new machine):
```bash
# 1. Clone repo
git clone <repo>

# 2. Create music symlinks
python tools/setup_music_links.py

# 3. Start local server
python serve.py
```

---

## File Locations

### Project Root Files
- `songs.js` - **COMMITTED** - Final song database with metadata (168KB)
- `generated_songs.js` - **IGNORED** - Temporary file from scan (159KB)
- `serve.py` - Local HTTP server for testing

### Tools Directory
- `scan_music.py` - Music library scanner
- `update_songs_metadata.py` - Metadata assembler
- `setup_music_links.py` - Symlink creator
- `README.md` - This file

### DO NOT commit:
- `generated_songs.js` (temporary)
- `music/` directory (symlinks to local library)
- `tools/generated_songs.js` (should not exist)
- `tools/songs.js` (should not exist)

---

## Configuration

### Music Library Path
Set in `scan_music.py`:
```python
LIBRARY_PATH = r"C:\Users\Valentin\Desktop\Xeno Series full soundrack"
```

### Game Folder Mappings
Defined in both `scan_music.py` and `setup_music_links.py`:
- Trinity Box → 6 games
- XCX DE → 2 games
- Xenosaga II → 2 soundtracks
- Individual games → 1:1 mapping

---

## Total Song Count: 835

- Xenoblade 1 DE: 91 songs
- Xenoblade 1 FC: 8 songs
- Xenoblade 1 Wii: 95 songs
- Xenoblade 2: 105 songs
- Xenoblade 2 Torna: 11 songs
- Xenoblade 3: 128 songs
- Xenoblade 3 FR: 14 songs
- Xenoblade X: 55 songs
- Xenoblade X DE: 9 songs
- Xenogears: 44 songs
- Xenosaga I: 47 songs
- Xenosaga II: 70 songs (30 gamerip + 40 movie)
- Xenosaga III: 84 songs
- Xenosaga Freaks: 23 songs
- Xenosaga Pied Piper: 16 songs
- Smash Remixes: 35 songs
