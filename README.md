# Xeno Series Heardle

A music guessing game inspired by Heardle/Wordle for the Xeno video game series (Xenoblade Chronicles, Xenosaga, Xenogears).

Listen to progressively longer snippets of a song and guess the title within 5 attempts.

## Features

- **4 game modes**: Xenoblade, Full Xeno Series, Xenosaga, Random Daily
- **705 songs** across 14 games
- **Deterministic daily songs** - all players get the same song, no server needed
- **3 languages**: English, French, Japanese
- **Responsive** sci-fi themed UI with per-game color themes
- **Cookie-based** progress saving (independent per mode)

## How to Play

1. Press play to hear a 1-second snippet of today's song
2. Search and select a song title, or skip
3. Each wrong guess or skip unlocks a longer snippet (1s, 3s, 7s, 14s, 16s)
4. Guess correctly within 5 attempts to win

## Local Development

### Prerequisites
- Python 3 (for local server and build tools)
- A local music library with Xeno series soundtracks

### Setup
```bash
# Clone the repo
git clone <repo-url>
cd xenoblade-x-heardle

# Create symlinks to your music library (Windows)
python tools/setup_music_links.py

# Start a local HTTP server
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

### Updating the Song Database

When your music library changes:
```bash
# 1. Scan music library
python tools/scan_music.py

# 2. Build final songs.js with metadata
python tools/update_songs_metadata.py

# 3. Commit
git add songs.js
git commit -m "Update song database"
```

See [tools/README.md](tools/README.md) for detailed documentation.

## Tech Stack

- Pure vanilla JavaScript (no frameworks, no build step)
- HTML5 Audio API
- CSS3 with dynamic theming via CSS variables
- Python build scripts for song database generation

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed technical documentation.

## Game Modes

| Mode | Songs | Description |
|------|-------|-------------|
| Xenoblade | ~421 | Xenoblade Chronicles series |
| Full Xeno | ~635 | All main Xeno games + DLC |
| Xenosaga | ~201 | Xenosaga trilogy |
| Random | 705 | All games, random start time, game revealed |
