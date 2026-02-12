# Xeno Series Heardle - Architecture Documentation

## 📁 Project Structure

```
xenoblade-x-heardle/
├── index.html              # Main HTML entry point
├── style.css               # Global styles and theme system
│
├── songs.js                # Song database with game metadata
├── random.js               # Deterministic randomization system
├── game-new.js             # Main game orchestrator
│
├── js/                     # Modular components
│   ├── storage.js          # Cookie and state management
│   ├── theme.js            # Theme application
│   ├── player.js           # Audio player (YouTube → HTML5)
│   └── ui.js               # UI rendering and DOM manipulation
│
├── locales/                # Internationalization
│   ├── en.json
│   └── fr.json
│
└── assets/                 # Visual assets (TODO)
    ├── bg/                 # Background images per game
    └── covers/             # Album covers per game
```

## 🎮 Game Modes

### 1. Full Xeno Series
- **Games**: Xenoblade 1 DE, 2, 3, X + Smash remixes + Xenosaga 1-2-3 + Xenogears
- **Theme**: Red (#E63946)
- **Random Start**: No

### 2. Xenoblade Heardle
- **Games**: Xenoblade 1 DE, 2, 3, X + Smash remixes
- **Theme**: Red (#E63946)
- **Random Start**: No

### 3. Xenosaga Heardle
- **Games**: Xenosaga 1, 2, 3
- **Theme**: Purple (#7209B7)
- **Random Start**: No

### 4. Random Daily
- **Games**: ALL games (including Wii originals, spin-offs)
- **Theme**: Daily game's color (inherited)
- **Random Start**: YES (100% - random timestamp between 0 and duration-30s)
- **Special**: Daily game is revealed to players

## 🔄 Data Flow

```
1. User visits page
   └─> initGame()
       ├─> Load locale (EN/FR)
       ├─> Load saved mode preference (cookie)
       ├─> Render mode selector tabs
       ├─> Get daily song (deterministic)
       │   └─> getDailySong(mode) from random.js
       │       ├─> Standard modes: selectStandardDailySong()
       │       └─> Random mode: selectRandomDailySong()
       │           ├─> Pick game (seed 1)
       │           ├─> Pick song (seed 2)
       │           └─> Pick start time (seed 3)
       ├─> Apply theme (CSS variables)
       ├─> Show daily game banner (Random mode only)
       └─> Load saved state or render new game

2. User plays
   └─> Click play button
       └─> playAudio() from player.js
           ├─> Init YouTube player if needed
           ├─> Seek to startTime (0 or random)
           ├─> Play for DURATIONS[attempt] seconds
           └─> Update progress bar

3. User guesses
   └─> Search autocomplete (mode-specific songs)
       └─> Submit guess
           ├─> Correct → endGame(won=true)
           └─> Wrong → currentAttempt++
               ├─> Save state (cookie)
               └─> Re-render with new duration

4. User switches mode
   └─> switchMode(modeId)
       ├─> Save preference (cookie)
       └─> Reload page (reset state)
```

## 🎨 Theme System

### CSS Variables (Dynamic)
```css
--theme-primary: #color    /* Mode/game primary color */
--theme-glow: rgba(...)    /* Auto-calculated glow */
```

### Theme Application
1. **Standard modes**: Use mode's predefined color
2. **Random mode**: Inherit daily game's color
3. **Color conversion**: Hex → RGB for glow effects

## 🎲 Randomization System

### Deterministic Seeds
```javascript
Seed = hash(date + mode + salt + "xenoheardle")
```

### Random Mode Seeds
- **Seed 1**: Game selection
- **Seed 2**: Song selection (within game)
- **Seed 3**: Start time (0 to duration-30s)

### Why Deterministic?
- ✅ All clients get same song/game daily
- ✅ No server needed (100% client-side)
- ✅ Can't predict future days without computing each day
- ✅ Invalidates automatically if song pool changes

## 💾 State Management

### Cookies
- **Mode preference**: `xenoHeardleMode` (365 days)
- **Game state**: `xenoHeardle_{mode}_state` (1 day)
  - Separate state per mode
  - Reset daily at 00:00 UTC

### Saved State
```javascript
{
  dayNumber: int,
  currentAttempt: int,
  guesses: string[],
  gameOver: bool,
  won: bool
}
```

## 🎵 Audio System

### Current (YouTube)
```javascript
player.js → YouTube IFrame API
- Embedded invisible player
- Seek to startTime
- Play for duration
```

### Future (HTML5 + R2)
```javascript
player.js → HTML5 <audio>
- Direct MP3 playback
- Cloudflare R2 storage
- Better control & performance
```

## 🚀 Migration Path

### Phase 1: ✅ DONE
- Multi-mode UI
- Modular architecture
- Theme system

### Phase 2: TODO
- Fill song databases (all games)
- Collect background images
- Collect cover arts

### Phase 3: TODO
- Setup Cloudflare R2
- Upload MP3 files
- Migrate player.js to HTML5

### Phase 4: TODO
- Test all modes
- Deploy to production

## 🛠️ Development

### Testing Random Quality
```javascript
// In browser console
previewUpcomingSongs('random', 30);
testRandomnessQuality('random', 100);
```

### Adding New Game
1. Add metadata to `GAMES` in songs.js
2. Add song array `SONGS_GAMENAME`
3. Add to `SONG_POOLS`
4. Add to mode's `games` array
5. Add color scheme
6. Add background/cover assets

### Adding New Mode
1. Add to `GAME_MODES` in songs.js
2. Update UI tabs in renderModeSelector()
3. Add color theme
4. Test with existing songs

## 📝 Notes

- **UTC timezone** used for all date calculations
- **Day #1 epoch**: 2025-01-01
- **Cycle length**: 20 days (to avoid immediate repeats)
- **Max song duration**: Should be > 30s (for random start)
- **Locale files**: Must match structure in en.json/fr.json
