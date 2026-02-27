# Xeno Series Heardle - Architecture Documentation

## Project Structure

```
xeno-series-heardle/
├── index.html              # Main HTML entry point
├── style.css               # Global styles and theme system
├── favicon.ico             # Site favicon
│
├── js/                     # All JavaScript files
│   ├── version.js          # Auto-generated app version (pre-commit hook)
│   ├── constants.js        # Game constants (durations, max attempts, default mode)
│   ├── songs.js            # Song database with game metadata (705 songs) + GAME_MODES config
│   ├── random.js           # Deterministic randomization system (seeded PRNG)
│   ├── game.js             # Main game orchestrator (daily + endless modes)
│   ├── storage.js          # localStorage-based state management (migrated from cookies)
│   ├── theme.js            # CSS stylesheet swapping (gamemode + game themes)
│   ├── player.js           # HTML5 Audio player with progress tracking
│   └── ui.js               # UI rendering, DOM manipulation, credits visibility
│
├── images/                 # All image assets
│   ├── noise-texture.png   # Marble texture for title text effect (Marble006 inverted, CC0)
│   ├── patate.png          # Easter egg image (special dates)
│   │
│   ├── full-xeno/          # Full Xeno Series mode
│   │   ├── logo.svg        # Mode tab logo overlay (SVG)
│   │   └── background.webp
│   │
│   ├── xenoblade/          # Xenoblade mode (parent)
│   │   ├── logo.svg        # Mode tab logo overlay (Monado symbol)
│   │   └── background.webp
│   │
│   ├── xenosaga/           # Xenosaga mode (parent)
│   │   ├── logo.svg        # Mode tab logo overlay
│   │   └── background.webp
│   │
│   ├── random/             # Random mode
│   │   └── logo.svg        # Mode tab logo overlay
│   │
│   ├── xenoblade-1/        # Xenoblade Chronicles 1 DE
│   │   ├── background.webp
│   │   └── cover.jpg
│   │
│   ├── xenoblade-1-fc/     # Future Connected
│   │   ├── background.webp
│   │   └── cover.jpg
│   │
│   ├── xenoblade-2/        # Xenoblade Chronicles 2
│   │   ├── background.webp
│   │   └── cover.jpg
│   │
│   ├── xenoblade-2-torna/  # Torna: The Golden Country
│   │   ├── background.webp
│   │   └── cover.jpg
│   │
│   ├── xenoblade-3/        # Xenoblade Chronicles 3
│   │   ├── background.webp
│   │   └── cover.jpg
│   │
│   ├── xenoblade-3-fr/     # Future Redeemed
│   │   ├── background.webp
│   │   └── cover.jpg
│   │
│   ├── xenoblade-x/        # Xenoblade Chronicles X
│   │   ├── background.webp
│   │   └── cover.jpg
│   │
│   ├── xenoblade-x-de/     # Xenoblade X Definitive Edition
│   │   ├── background.webp
│   │   └── cover.jpg
│   │
│   ├── xenosaga-1/         # Xenosaga Episode I
│   │   ├── background.webp
│   │   └── cover.jpg
│   │
│   ├── xenosaga-2/         # Xenosaga Episode II
│   │   ├── background.webp
│   │   └── cover.jpg
│   │
│   ├── xenosaga-3/         # Xenosaga Episode III
│   │   ├── background.webp
│   │   └── cover.jpg
│   │
│   ├── xenosaga-freaks/    # Xenosaga Freaks
│   │   ├── background.webp
│   │   └── cover.jpg
│   │
│   ├── xenosaga-pied-piper/ # Xenosaga Pied Piper
│   │   ├── background.webp
│   │   └── cover.jpg
│   │
│   └── xenogears/          # Xenogears
│       ├── background.webp
│       └── cover.jpg
│
├── locales/                # Internationalization (EN/FR/JA)
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
└── architecture.md         # This file
```

### Script Loading Order (index.html)
```
version.js → constants.js → songs.js → random.js → storage.js → theme.js → player.js → ui.js → game.js
```

## Game Modes

Each mode is defined in `GAME_MODES` (songs.js) with: `id`, `name`, `description`, `logo` (SVG path), `games` (array), `randomStart` (bool).

### 1. Full Xeno Series (`full-xeno`)
- **Games**: Xenoblade 1 DE, FC, 2, Torna, 3, FR, X, X DE + Xenosaga I-II-III + Xenogears
- **Logo**: `images/full-xeno/logo.svg`
- **Theme**: Red (#E63946)
- **Random Start**: No (always 0s)
- **Song Pool**: ~635 songs

### 2. Xenoblade Heardle (`xenoblade`) - Default
- **Games**: Xenoblade 1 DE, FC, 2, Torna, 3, FR, X, X DE
- **Logo**: `images/xenoblade/logo.svg` (Monado symbol)
- **Theme**: Red (#E63946)
- **Random Start**: No
- **Song Pool**: ~421 songs

### 3. Xenosaga Heardle (`xenosaga`)
- **Games**: Xenosaga I, II, III
- **Logo**: `images/xenosaga/logo.svg`
- **Theme**: Purple (#7209B7)
- **Random Start**: No
- **Song Pool**: ~201 songs

### 4. Random Daily (`random`)
- **Games**: All 14 games (including Freaks, Pied Piper)
- **Logo**: `images/random/logo.svg`
- **Theme**: Inherits daily game's color
- **Random Start**: YES (random timestamp between 0 and duration-16s)
- **Special**: Daily game name is revealed to players
- **Song Pool**: 705 songs (full database)

### 5. Endless Mode (overlay on any mode)
- **Toggle**: Fixed button (∞) in bottom-left corner
- **Badge**: Animated ∞ symbol next to title (Helvetica Neue, oblique, fade+expand transition)
- **Label**: "Endless Now" text under title (clip-path left-to-right reveal animation, fade-out on disable)
- **Behavior**: Plays random songs continuously, independent from daily game
- **Banner**: Always shows "Selected Game" (never "Today's Game"), even without game override
- **Start Mode Toggle**: Classic / Random Start toggle below game name in banner (Random mode only)
  - Classic: song starts at 0s
  - Random Start: song starts at random timestamp (0 to duration-16s) — **default**
  - Uses same `.share-scope-toggle` / `.scope-btn` pattern as other toggles
  - State: `endlessRandomStart` variable in game.js
- **Stats**: Separate endless history stored in localStorage per mode
  - Random mode stats split into two sub-sections: "Random Excerpt" vs "From the Start"
  - Each history entry stores `randomStart: true` flag when applicable
- **Functions**: `toggleEndlessMode()`, `startEndlessRound()`, `setEndlessStart()` in game.js

## Data Flow

```
1. User visits page
   └─> initGame() [game.js]
       ├─> Load locale (EN/FR/JA) via fetch
       ├─> Load saved mode preference (localStorage)
       ├─> Render mode selector tabs [ui.js]
       ├─> Get daily song (deterministic)
       │   └─> getDailySong(mode) [random.js]
       │       ├─> Standard modes: selectStandardDailySong()
       │       └─> Random mode: selectRandomDailySong()
       │           ├─> Pick game (seed 1)
       │           ├─> Pick song (seed 2)
       │           └─> Pick start time (seed 3)
       ├─> Apply theme (CSS variables) [theme.js]
       ├─> Show daily game banner (Random mode, or Endless mode)
       │   └─> Endless: banner shows "Selected Game" + start mode toggle
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
               ├─> Save state (localStorage) [storage.js]
               └─> Re-render with new duration [ui.js]

4. User switches mode
   └─> switchMode(modeId) [game.js]
       ├─> Save preference (localStorage)
       ├─> Cleanup current player
       └─> Re-initialize game for new mode

5. User shares results
   └─> buildShareText() [game.js]
       ├─> copyResults() → clipboard
       └─> tweetResults() → x.com/intent/tweet
```

## Visual Design

### Title Text Effect (h1)
- **Font**: Helvetica Neue, 900 weight, oblique, -3px letter-spacing
- **Texture**: Marble texture (`noise-texture.png`) + gradient overlay via `background-clip: text`
- **Layers**: Bottom layer = marble texture (200x200 tiled), Top layer = gradient (dark bottom → transparent top) for relief
- **Source**: ambientCG Marble006 (CC0), inverted, 300x300, grayscale with sigmoidal contrast

### Mode Tab Logo Overlay
- **System**: SVG logos embedded via CSS custom property `--mode-logo` on each tab
- **Rendering**: `::after` pseudo-element, centered, 80% size, low opacity (0.15)
- **Active state**: `filter: none` (dark logo on blue gradient), inactive: `filter: brightness(0) invert(1)` (white logo on dark bg)
- **Scalable**: Add `logo` field to any GAME_MODES entry to enable

### Responsive Design
- **Breakpoint**: 900px (single breakpoint for mobile/desktop)
- **Height scaling**: `clamp()` with `vh` units on most vertical-spacing elements (body padding, buttons, gaps, margins)
- **Credits**: Fixed at bottom on desktop, hidden when scrollbar present, fade-in when scrolled near bottom (`updateCreditsVisibility()` in ui.js)
- **Album covers**: 3D perspective hover effect on results screen

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

### Random Mode Seeds (daily)
- **Seed 1**: Game selection (weighted by game pool size)
- **Seed 2**: Song selection (within selected game)
- **Seed 3**: Start time (0 to duration-16s)

### Endless Mode
- Uses `Math.random()` (non-deterministic) via `getEndlessSong(modeId, gameId, randomStart)`
- `gameId`: optional lock to a specific game's song pool (user-selected filter)
- `randomStart`: when true, picks random start time (0 to duration-16s)

### Why Deterministic?
- All clients get same song/game daily without server
- Can't predict future days without computing each day
- Invalidates automatically if song pool changes

### Day Numbering
- **Epoch**: 2026-02-09 (Day 1, launch date)
- **Timezone**: UTC (song changeover at 23:00 UTC)
- **Cycle length**: 20 days (to avoid immediate repeats)

## State Management

### localStorage
- **Mode preference**: `xenoHeardleMode`
- **Language**: `xenoHeardleLang`
- **Game state**: `xenoHeardle_{mode}_state` (cleared at UTC midnight via dayNumber check)
  - Separate state per mode (independent progress)
- **Endless history**: `xenoHeardle_{mode}_endless_history`
- **Endless stats**: Per-mode win/loss/streak tracking
- **Stats UI**: Game filter chips in header (horizontal scroll, shared across all categories)

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

### Debug Utilities (browser console, localhost only)
```javascript
clearAllData()           // Wipe all saved games
clearModeData(mode)      // Clear specific mode
showData()               // Display all saved states
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
| Xenoblade 3 | `xenoblade-3` | 128 | #FFB700 |
| Xenoblade 3 FR | `xenoblade-3-fr` | 14 | #FFC300 |
| Xenoblade X | `xenoblade-x` | 55 | #00A8E8 |
| Xenoblade X DE | `xenoblade-x-de` | 9 | #00D4FF |
| Xenogears | `xenogears` | 44 | #8B4513 |
| Xenosaga I | `xenosaga-1` | 47 | #7209B7 |
| Xenosaga II | `xenosaga-2` | 70 | #9D4EDD |
| Xenosaga III | `xenosaga-3` | 84 | #5A189A |
| Xenosaga Freaks | `xenosaga-freaks` | 23 | #C77DFF |
| Xenosaga Pied Piper | `xenosaga-pied-piper` | 16 | #B5179E |
| **Total** | | **705** | |

### Song Entry Format
```javascript
{
  title: "Song Name",
  japaneseTitle: "日本語タイトル",    // Japanese title (shown when locale=ja)
  localizedTitle: "Localized Name",  // or null
  file: "filename.mp3",
  duration: 234.5,                    // seconds
  game: "game-id",
  composer: "Composer Name",          // or null
  artist: "Artist Name"              // or null
}
```

## Image Assets

Each game has image assets in `images/{game-id}/`:
- **background.webp** - Background image for theming
- **cover.jpg** - Album cover art (3D hover effect on results screen)

Mode parent folders (`images/{mode-id}/`) contain:
- **logo.svg** - SVG logo used as mode tab overlay texture
- **background.webp** - Mode background

Additional assets:
- **noise-texture.png** - Marble texture for h1 title text effect

## Development

### Testing Random Quality
```javascript
// In browser console
previewUpcomingSongs('random', 30);
testRandomnessQuality('random', 100);
```

### Debug Utilities
```javascript
clearAllData()           // Wipe all saved games
clearModeData(mode)      // Clear specific mode
showData()               // Display all saved states
```

## Notes

- **UTC timezone** used for all date calculations
- **Song changeover**: 23:00 UTC (1 hour before midnight)
- **Day #1 epoch**: 2026-02-09 (launch date)
- **Cycle length**: 20 days (avoids immediate repeats)
- **Max song duration**: Should be > 16s (for random start mode)
- **Locale files**: Must match structure in en.json (EN/FR/JA)
- **No build step**: Pure vanilla JS, no bundler required
- **No backend**: 100% client-side application
- **All music hosted on Cloudflare R2**
- **Responsive breakpoint**: 900px (mobile ↔ desktop)
- **iOS compatibility**: font-weight capped at 900 (iOS Safari max)
