# Xeno Series Heardle - Architecture Documentation

## Project Structure

```
xeno-series-heardle/
├── index.html              # Main HTML entry point
├── style.css               # Global styles and theme system
├── favicon.ico             # Site favicon
│
├── js/                     # All JavaScript files
│   ├── constants.js        # Game constants (durations, max attempts, default mode)
│   ├── songs.js            # Song database with game metadata (705 songs)
│   ├── random.js           # Deterministic randomization system (seeded PRNG)
│   ├── game.js             # Main game orchestrator
│   ├── storage.js          # Cookie-based state management
│   ├── theme.js            # CSS stylesheet swapping (gamemode + game themes)
│   ├── player.js           # HTML5 Audio player with progress tracking
│   └── ui.js               # UI rendering and DOM manipulation
│
├── images/                 # All image assets
│   ├── patate.png          # Easter egg image (special dates)
│   │
│   ├── xenoblade-x/        # Xenoblade Chronicles X
│   │   ├── logo.png
│   │   ├── background.png
│   │   └── cover.png
│   │
│   ├── xenoblade-x-de/     # Xenoblade X Definitive Edition
│   │   ├── logo.png
│   │   ├── background.png
│   │   └── cover.png
│   │
│   ├── xenoblade-1/        # Xenoblade Chronicles 1 DE
│   │   ├── logo.png
│   │   ├── background.png
│   │   └── cover.png
│   │
│   ├── xenoblade-1-fc/     # Future Connected
│   │   ├── logo.png
│   │   ├── background.png
│   │   └── cover.png
│   │
│   ├── xenoblade-2/        # Xenoblade Chronicles 2
│   │   ├── logo.png
│   │   ├── background.png
│   │   └── cover.png
│   │
│   ├── xenoblade-2-torna/  # Torna: The Golden Country
│   │   ├── logo.png
│   │   ├── background.png
│   │   └── cover.png
│   │
│   ├── xenoblade-3/        # Xenoblade Chronicles 3
│   │   ├── logo.png
│   │   ├── background.png
│   │   └── cover.png
│   │
│   ├── xenoblade-3-fr/     # Future Redeemed
│   │   ├── logo.png
│   │   ├── background.png
│   │   └── cover.png
│   │
│   ├── xenosaga-1/         # Xenosaga Episode I
│   │   ├── logo.png
│   │   ├── background.png
│   │   └── cover.png
│   │
│   ├── xenosaga-2/         # Xenosaga Episode II
│   │   ├── logo.png
│   │   ├── background.png
│   │   └── cover.png
│   │
│   ├── xenosaga-3/         # Xenosaga Episode III
│   │   ├── logo.png
│   │   ├── background.png
│   │   └── cover.png
│   │
│   ├── xenosaga-freaks/    # Xenosaga Freaks
│   │   ├── logo.png
│   │   ├── background.png
│   │   └── cover.png
│   │
│   ├── xenosaga-pied-piper/ # Xenosaga Pied Piper
│   │   ├── logo.png
│   │   ├── background.png
│   │   └── cover.png
│   │
│   └── xenogears/          # Xenogears
│       ├── logo.png
│       ├── background.png
│       └── cover.png
│
├── locales/                # Internationalization
│   ├── en.json             # English
│   ├── fr.json             # French
│   └── ja.json             # Japanese
│
├── themes/                 # CSS theme files (override :root variables)
│   ├── games/              # Per-game color themes (loaded on results screen)
│   │   ├── xenoblade-1.css # XC1: green Monado + Headland One font
│   │   ├── xenoblade-x.css # XCX: blue + futuristic effects (grid, particles, glow)
│   │   ├── xenoblade-x-de.css # XCX DE: cyan + futuristic effects
│   │   └── ...             # One file per game/DLC
│   └── gamemodes/          # Per-gamemode color themes (loaded during gameplay)
│       ├── full-xeno.css
│       ├── xenoblade.css
│       ├── xenosaga.css
│       └── random.css
│
├── .gitignore              # Git ignore rules
├── README.md               # Project description
└── ARCHITECTURE.md         # This file
```

### Script Loading Order (index.html)
```
constants.js → songs.js → random.js → storage.js → theme.js → player.js → ui.js → game.js
```

## Game Modes

### 1. Full Xeno Series (`full-xeno`)
- **Games**: Xenoblade 1 DE, FC, 2, Torna, 3, FR, X, X DE + Xenosaga I-II-III + Xenogears
- **Theme**: Red (#E63946)
- **Random Start**: No (always 0s)
- **Song Pool**: ~635 songs

### 2. Xenoblade Heardle (`xenoblade`) - Default
- **Games**: Xenoblade 1 DE, FC, 2, Torna, 3, FR, X, X DE
- **Theme**: Red (#E63946)
- **Random Start**: No
- **Song Pool**: ~421 songs

### 3. Xenosaga Heardle (`xenosaga`)
- **Games**: Xenosaga I, II, III
- **Theme**: Purple (#7209B7)
- **Random Start**: No
- **Song Pool**: ~201 songs

### 4. Random Daily (`random`)
- **Games**: All 14 games (including Freaks, Pied Piper)
- **Theme**: Inherits daily game's color
- **Random Start**: YES (random timestamp between 0 and duration-16s)
- **Special**: Daily game name is revealed to players
- **Song Pool**: 705 songs (full database)

## Data Flow

```
1. User visits page
   └─> initGame() [game.js]
       ├─> Load locale (EN/FR/JA) via fetch
       ├─> Load saved mode preference (cookie)
       ├─> Render mode selector tabs [ui.js]
       ├─> Get daily song (deterministic)
       │   └─> getDailySong(mode) [random.js]
       │       ├─> Standard modes: selectStandardDailySong()
       │       └─> Random mode: selectRandomDailySong()
       │           ├─> Pick game (seed 1)
       │           ├─> Pick song (seed 2)
       │           └─> Pick start time (seed 3)
       ├─> Apply theme (CSS variables) [theme.js]
       ├─> Show daily game banner (Random mode only)
       └─> Load saved state [storage.js] or render new game [ui.js]

2. User plays
   └─> Click play button
       └─> playAudio() [player.js]
           ├─> Init HTML5 Audio element
           ├─> Load audio via getAudioUrl() [songs.js]
           ├─> Seek to startTime (0 or random)
           ├─> Play for DURATIONS[attempt] seconds (1s, 3s, 7s, 14s, 16s)
           └─> Update progress bar via requestAnimationFrame

3. User guesses
   └─> Search autocomplete (mode-specific songs)
       └─> Submit guess
           ├─> Correct → endGame(won=true)
           └─> Wrong → currentAttempt++
               ├─> Save state (cookie) [storage.js]
               └─> Re-render with new duration [ui.js]

4. User switches mode
   └─> switchMode(modeId) [game.js]
       ├─> Save preference (cookie)
       ├─> Cleanup current player
       └─> Re-initialize game for new mode
```

## Theme System

### Two-level CSS theming via stylesheet swapping
- **Gamemode theme** (`themes/gamemodes/`): loaded during gameplay
- **Game theme** (`themes/games/`): loaded on results screen (overrides gamemode)
- **Random mode**: loads game theme directly (no gamemode theme)
- Two dynamic `<link>` elements in `<head>`, created by `initThemeSystem()` in theme.js

### CSS Variables (overridden by theme files)
```css
--theme-primary / --theme-secondary / --theme-accent   /* Colors */
--theme-primary-rgb / --theme-secondary-rgb / --theme-accent-rgb  /* RGB for alpha */
--theme-bg-darkest / --theme-bg-darker / --theme-bg-dark  /* Backgrounds */
--theme-font-heading: 'Orbitron', sans-serif  /* Heading font (per-theme) */
--theme-font-body: 'Rajdhani', sans-serif     /* Body font (per-theme) */
```

### Futuristic Effects (XCX/XCX DE exclusive)
Grid, particles, scanlines, glow animations are defined only in `xenoblade-x.css` and `xenoblade-x-de.css`. Other themes have no effects.

## Randomization System

### Deterministic Seeds
```javascript
Seed = hash(date + mode + salt + "xenoheardle")
```

Uses a seeded Linear Congruential Generator (LCG) via `SeededRandom` class.

### Random Mode Seeds
- **Seed 1**: Game selection (weighted by game pool size)
- **Seed 2**: Song selection (within selected game)
- **Seed 3**: Start time (0 to duration-16s)

### Why Deterministic?
- All clients get same song/game daily without server
- Can't predict future days without computing each day
- Invalidates automatically if song pool changes

### Day Numbering
- **Epoch**: 2025-01-01 (Day 0)
- **Timezone**: UTC
- **Cycle length**: 20 days (to avoid immediate repeats)

## State Management

### Cookies
- **Mode preference**: `xenoHeardleMode` (365 days)
- **Language**: `xenoHeardleLang` (365 days)
- **Game state**: `xenoHeardle_{mode}_state` (1 day, expires at UTC midnight)
  - Separate state per mode (independent progress)

### Saved State Schema
```javascript
{
  dayNumber: int,        // Current day number since epoch
  currentAttempt: int,   // 0-4
  guesses: string[],     // Array of guess strings ("skip" or song title)
  gameOver: bool,
  won: bool
}
```

### Debug Utilities (browser console)
```javascript
clearAllCookies()        // Wipe all saved games
clearModeCookies(mode)   // Clear specific mode
showCookies()            // Display all saved states
```

## Audio System

### Current Implementation (HTML5 Audio)
```
player.js → HTML5 <audio> element
├── Gameplay player: short snippets (1-16s)
│   ├─ Preloads audio file
│   ├─ Seeks to startTime (0 or random)
│   ├─ Plays for DURATIONS[attempt] seconds
│   └─ Progress bar via requestAnimationFrame
│
└── Result player: full song playback
    ├─ Initialized after game ends
    ├─ Click-to-seek on progress bar
    └─ Time display (current / total)
```

### Audio Sources
- **Production**: Cloudflare R2 via `AUDIO_BASE_URL` constant in songs.js

## Song Database

### Games (14 total including DLC)
| Game | ID | Songs | Color |
|------|----|-------|-------|
| Xenoblade 1 DE | `xenoblade-1` | 91 | #8bb80e |
| Xenoblade 1 FC | `xenoblade-1-fc` | 8 | #FF6B9D |
| Xenoblade 2 | `xenoblade-2` | 105 | #06D6A0 |
| Xenoblade 2 Torna | `xenoblade-2-torna` | 11 | #20C997 |
| Xenoblade 3 | `xenoblade-3` | 128 | #4361EE |
| Xenoblade 3 FR | `xenoblade-3-fr` | 14 | #7B2FBE |
| Xenoblade X | `xenoblade-x` | 55 | #00A8E8 |
| Xenoblade X DE | `xenoblade-x-de` | 9 | #00D4FF |
| Xenogears | `xenogears` | 44 | #FFD700 |
| Xenosaga I | `xenosaga-1` | 47 | #9B59B6 |
| Xenosaga II | `xenosaga-2` | 70 | #9D4EDD |
| Xenosaga III | `xenosaga-3` | 84 | #8E44AD |
| Xenosaga Freaks | `xenosaga-freaks` | 23 | #A855F7 |
| Xenosaga Pied Piper | `xenosaga-pied-piper` | 16 | #C084FC |
| **Total** | | **705** | |

### Song Entry Format
```javascript
{
  title: "Song Name",
  localizedTitle: "Localized Name",  // or null
  file: "filename.mp3",
  duration: 234.5,                    // seconds
  game: "game-id",
  composer: "Composer Name",          // or null
  artist: "Artist Name"              // or null
}
```

## Image Assets

Each game has three image types in `images/{game-id}/`:
- **logo.png** - Game logo for branding
- **background.png** - Background image for theming
- **cover.png** - Album cover art

All placeholders are currently 1x1 transparent PNGs to be replaced with actual assets.

## Development

### Testing Random Quality
```javascript
// In browser console
previewUpcomingSongs('random', 30);
testRandomnessQuality('random', 100);
```

### Debug Utilities
```javascript
clearAllCookies()        // Wipe all saved games
clearModeCookies(mode)   // Clear specific mode
showCookies()            // Display all saved states
```

## Notes

- **UTC timezone** used for all date calculations
- **Day #1 epoch**: 2025-01-01
- **Cycle length**: 20 days (avoids immediate repeats)
- **Max song duration**: Should be > 16s (for random start mode)
- **Locale files**: Must match structure in en.json
- **No build step**: Pure vanilla JS, no bundler required
- **No backend**: 100% client-side application
- **All music hosted on Cloudflare R2**
