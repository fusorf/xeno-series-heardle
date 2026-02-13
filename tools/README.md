# Tools Directory

Utility scripts for managing the Xeno Series Heardle song database.

## Scripts Overview

### 1. `scan_music.py`
**Purpose:** Scans your local music library and generates song entries with full ID3 metadata.

**What it does:**
- Scans all folders in your music library
- Reads ID3 tags directly from MP3 files:
  - **TIT2** (title) - clean song title, no track number prefixes
  - **TPE1** (artist) - performer/artist
  - **TCOM** (composer) - song composer
  - Duration from audio stream info
- Handles special cases:
  - Trinity Box: Splits into 6 games (XC1 DE, XC1 FC, XC2, XC2 Torna, XC3, XC3 FR)
  - XCX DE: Splits into base game + DE exclusive tracks
  - Xenosaga II: Creates separate arrays for gamerip and movie soundtrack
- Generates `generated_songs.js` in **project root** (temporary file)

**Usage:**
```bash
python tools/scan_music.py
```

**Output:** `generated_songs.js` in project root

**Dependencies:** `pip install mutagen`

---

### 2. `update_songs_metadata.py`
**Purpose:** Combines metadata + mode configs + generated songs into final `songs.js`.

**What it does:**
- Reads `generated_songs.js` from project root
- Adds GAMES metadata (14 games with colors, themes, DLC relationships)
- Adds GAME_MODES configuration (4 modes)
- Adds helper functions (getGamesWithDLC, getSongsForMode, getAudioUrl)
- Creates SONG_POOLS mapping
- Combines Xenosaga II gamerip + movie into single pool
- Writes final `songs.js` to **project root**

**Usage:**
```bash
python tools/update_songs_metadata.py
```

**Output:** `songs.js` in project root

---

### 3. `setup_music_links.py`
**Purpose:** Creates symbolic links from your music library to the project.

**What it does:**
- Creates Windows junction points (no admin rights needed)
- Links game folders to `music/` directory
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
# 1. Scan music library (reads ID3 metadata from MP3 files)
python tools/scan_music.py

# 2. Build final songs.js with game metadata and mode configs
python tools/update_songs_metadata.py

# 3. Commit changes
git add songs.js
git commit -m "Update song database"
```

### One-time Setup (new machine):
```bash
# 1. Clone repo
git clone <repo-url>
cd xenoblade-x-heardle

# 2. Install Python dependencies
pip install mutagen

# 3. Create music symlinks
python tools/setup_music_links.py

# 4. Start local server
python -m http.server 8000
```

---

## File Locations

### Project Root Files
- `songs.js` - **COMMITTED** - Final song database with metadata
- `generated_songs.js` - **IGNORED** - Temporary file from scan

### Tools Directory
- `scan_music.py` - Music library scanner (reads ID3 metadata)
- `update_songs_metadata.py` - Metadata assembler
- `setup_music_links.py` - Symlink creator
- `README.md` - This file

### DO NOT commit:
- `generated_songs.js` (temporary build artifact)
- `music/` directory (symlinks to local library)

---

## Configuration

### Music Library Path
Set in `scan_music.py`:
```python
LIBRARY_PATH = r"C:\Users\Valentin\Desktop\Xeno Series full soundrack"
```

### Game Folder Mappings
Defined in both `scan_music.py` and `setup_music_links.py`:
- Trinity Box → 6 games (XC1 DE, FC, XC2, Torna, XC3, FR)
- XCX DE → 2 games (base + DE content)
- Xenosaga II → 2 soundtracks (gamerip + movie)
- Individual games → 1:1 mapping

---

## Total Song Count: 705

| Game | Songs |
|------|-------|
| Xenoblade 1 DE | 91 |
| Xenoblade 1 FC | 8 |
| Xenoblade 2 | 105 |
| Xenoblade 2 Torna | 11 |
| Xenoblade 3 | 128 |
| Xenoblade 3 FR | 14 |
| Xenoblade X | 55 |
| Xenoblade X DE | 9 |
| Xenogears | 44 |
| Xenosaga I | 47 |
| Xenosaga II | 70 (30 gamerip + 40 movie) |
| Xenosaga III | 84 |
| Xenosaga Freaks | 23 |
| Xenosaga Pied Piper | 16 |
