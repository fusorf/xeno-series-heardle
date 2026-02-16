// ============================================
// XENO SERIES HEARDLE - SONG DATABASE
// ============================================

// Base URL for Cloudflare R2 storage
const AUDIO_BASE_URL = 'https://pub-9eda7ad184594d49baf435ccabba2bc1.r2.dev';

// ============================================
// GAME METADATA
// ============================================
const GAMES = {
  // ========== XENOBLADE X ==========
  'xenoblade-x': {
    id: 'xenoblade-x',
    name: 'Xenoblade Chronicles X',
    shortName: 'XCX',
    color: '#00A8E8',
    folder: 'Xenoblade Chronicles X - Definitive Edition (Switch, Switch 2) (gamerip) (2025)'
  },
  'xenoblade-x-de': {
    id: 'xenoblade-x-de',
    name: 'Xenoblade Chronicles X - Definitive Edition',
    shortName: 'XCX DE',
    color: '#00D4FF',
    folder: 'Xenoblade Chronicles X - Definitive Edition (Switch, Switch 2) (gamerip) (2025)',
    parentGame: 'xenoblade-x',
    isDLC: true
  },

  // ========== XENOBLADE 1 ==========
  'xenoblade-1': {
    id: 'xenoblade-1',
    name: 'Xenoblade Chronicles Definitive Edition',
    shortName: 'XC1 DE',
    color: '#8bb80e',
    folder: 'Xenoblade Chronicles Original Soundtrack Trinity Box (2023)'
  },
  'xenoblade-1-fc': {
    id: 'xenoblade-1-fc',
    name: 'Xenoblade Chronicles - Future Connected',
    shortName: 'XC1 FC',
    color: '#FF6B9D',
    folder: 'Xenoblade Chronicles Original Soundtrack Trinity Box (2023)',
    parentGame: 'xenoblade-1',
    isDLC: true
  },
  // ========== XENOBLADE 2 ==========
  'xenoblade-2': {
    id: 'xenoblade-2',
    name: 'Xenoblade Chronicles 2',
    shortName: 'XC2',
    color: '#06D6A0',
    folder: 'Xenoblade Chronicles Original Soundtrack Trinity Box (2023)'
  },
  'xenoblade-2-torna': {
    id: 'xenoblade-2-torna',
    name: 'Xenoblade Chronicles 2 - Torna: The Golden Country',
    shortName: 'XC2 Torna',
    color: '#20C997',
    folder: 'Xenoblade Chronicles Original Soundtrack Trinity Box (2023)',
    parentGame: 'xenoblade-2',
    isDLC: true
  },

  // ========== XENOBLADE 3 ==========
  'xenoblade-3': {
    id: 'xenoblade-3',
    name: 'Xenoblade Chronicles 3',
    shortName: 'XC3',
    color: '#FFB700',
    folder: 'Xenoblade Chronicles Original Soundtrack Trinity Box (2023)'
  },
  'xenoblade-3-fr': {
    id: 'xenoblade-3-fr',
    name: 'Xenoblade Chronicles 3 - Future Redeemed',
    shortName: 'XC3 FR',
    color: '#FFC300',
    folder: 'Xenoblade Chronicles Original Soundtrack Trinity Box (2023)',
    parentGame: 'xenoblade-3',
    isDLC: true
  },

  // ========== XENOSAGA ==========
  'xenosaga-1': {
    id: 'xenosaga-1',
    name: 'Xenosaga Episode I',
    shortName: 'Xenosaga I',
    color: '#7209B7',
    folder: 'Xenosaga Episode I (2004)'
  },
  'xenosaga-2': {
    id: 'xenosaga-2',
    name: 'Xenosaga Episode II',
    shortName: 'Xenosaga II',
    color: '#9D4EDD',
    folder: 'xenosaga-2'
  },
  'xenosaga-3': {
    id: 'xenosaga-3',
    name: 'Xenosaga Episode III',
    shortName: 'Xenosaga III',
    color: '#5A189A',
    folder: 'Xenosaga Episode III OST'
  },

  // ========== XENOSAGA SPIN-OFFS ==========
  'xenosaga-freaks': {
    id: 'xenosaga-freaks',
    name: 'Xenosaga Freaks',
    shortName: 'XS Freaks',
    color: '#C77DFF',
    folder: 'Xenosaga Freaks (PS2) (gamerip) (2004)',
    isSpinOff: true
  },
  'xenosaga-pied-piper': {
    id: 'xenosaga-pied-piper',
    name: 'Xenosaga Pied Piper',
    shortName: 'XS Pied Piper',
    color: '#B5179E',
    folder: 'Xenosaga Pied Piper (Mobile) (gamerip) (2004)',
    isSpinOff: true
  },

  // ========== OTHER ==========
  'xenogears': {
    id: 'xenogears',
    name: 'Xenogears',
    shortName: 'Xenogears',
    color: '#8B4513',
    folder: 'Xenogears ORIGINAL SOUNDTRACK (1998)'
  },
};


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

// ============================================
// GAME MODE CONFIGURATIONS
// ============================================
const GAME_MODES = {
  'full-xeno': {
    id: 'full-xeno',
    name: 'Full Xeno Series',
    description: 'All main Xeno games + DLC',
    games: getGamesWithDLC([
      'xenoblade-1', 'xenoblade-2', 'xenoblade-3', 'xenoblade-x',
      'xenosaga-1', 'xenosaga-2', 'xenosaga-3',
      'xenogears'
    ]),
    randomStart: false
  },
  'xenoblade': {
    id: 'xenoblade',
    name: 'Xenoblade Heardle',
    description: 'Xenoblade Chronicles series + DLC',
    games: getGamesWithDLC([
      'xenoblade-1', 'xenoblade-2', 'xenoblade-3', 'xenoblade-x'
    ]),
    randomStart: false
  },
  'xenosaga': {
    id: 'xenosaga',
    name: 'Xenosaga Heardle',
    description: 'Xenosaga trilogy',
    games: ['xenosaga-1', 'xenosaga-2', 'xenosaga-3'],
    randomStart: false
  },
  'random': {
    id: 'random',
    name: 'Random Challenge',
    description: 'Random game + random start time',
    games: getGamesWithDLC([
      'xenoblade-1', 'xenoblade-2', 'xenoblade-3', 'xenoblade-x',
      'xenosaga-1', 'xenosaga-2', 'xenosaga-3',
      'xenosaga-freaks', 'xenosaga-pied-piper',
      'xenogears'
    ]),
    randomStart: true,
    randomGameDaily: true,
    showDailyGame: true,
    hideGameFilters: true
  }
};

// ============================================
// SONG POOLS BY GAME
// ============================================

const SONGS_XENOBLADE_1 = [
  {
    "title": "Main Theme",
    "localizedTitle": "Main Theme",
    "file": "1-01. Main Theme.mp3",
    "duration": 222,
    "game": "xenoblade-1",
    "artist": "Yoko Shimomura"
  },
  {
    "title": "Prologue A",
    "localizedTitle": "Prologue A",
    "file": "1-02. Prologue A.mp3",
    "duration": 204,
    "game": "xenoblade-1",
    "artist": "Tsutomu Narita"
  },
  {
    "title": "Prologue B",
    "localizedTitle": "Prologue B",
    "file": "1-03. Prologue B.mp3",
    "duration": 199,
    "game": "xenoblade-1",
    "artist": "Tsutomu Narita"
  },
  {
    "title": "Everyday Life",
    "localizedTitle": "Everyday Life",
    "file": "1-04. Everyday Life.mp3",
    "duration": 150,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Colony 9 (Definitive Edition ver.)",
    "localizedTitle": "Colony 9 (Definitive Edition ver.)",
    "file": "1-05. Colony 9 (Definitive Edition ver.).mp3",
    "duration": 171,
    "game": "xenoblade-1",
    "artist": "Tsutomu Narita"
  },
  {
    "title": "Colony 9/Night (Definitive Edition ver.)",
    "localizedTitle": "Colony 9/Night (Definitive Edition ver.)",
    "file": "1-06. Colony 9 - Night (Definitive Edition ver.).mp3",
    "duration": 209,
    "game": "xenoblade-1",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Time to Fight! (Definitive Edition ver.)",
    "localizedTitle": "Time to Fight! (Definitive Edition ver.)",
    "file": "1-07. Time to Fight! (Definitive Edition ver.).mp3",
    "duration": 165,
    "game": "xenoblade-1",
    "artist": "Tsutomu Narita"
  },
  {
    "title": "Enemies Closing In (Definitive Edition ver.)",
    "localizedTitle": "Enemies Closing In (Definitive Edition ver.)",
    "file": "1-08. Enemies Closing In (Definitive Edition ver.).mp3",
    "duration": 257,
    "game": "xenoblade-1",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Hometown (Definitive Edition ver.)",
    "localizedTitle": "Hometown (Definitive Edition ver.)",
    "file": "1-09. Hometown (Definitive Edition ver.).mp3",
    "duration": 218,
    "game": "xenoblade-1",
    "artist": "Tsutomu Narita"
  },
  {
    "title": "Hometown/Night (Definitive Edition ver.)",
    "localizedTitle": "Hometown/Night (Definitive Edition ver.)",
    "file": "1-10. Hometown - Night (Definitive Edition ver.).mp3",
    "duration": 205,
    "game": "xenoblade-1",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "A Friend on My Mind",
    "localizedTitle": "A Friend on My Mind",
    "file": "1-11. A Friend on My Mind.mp3",
    "duration": 190,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "The Monado Awakens",
    "localizedTitle": "The Monado Awakens",
    "file": "1-12. The Monado Awakens.mp3",
    "duration": 38,
    "game": "xenoblade-1",
    "artist": "ACE+"
  },
  {
    "title": "Tephra Cave (Definitive Edition ver.)",
    "localizedTitle": "Tephra Cave (Definitive Edition ver.)",
    "file": "1-13. Tephra Cave (Definitive Edition ver.).mp3",
    "duration": 181,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Hostile Gazes (Definitive Edition ver.)",
    "localizedTitle": "Hostile Gazes (Definitive Edition ver.)",
    "file": "1-14. Hostile Gazes (Definitive Edition ver.).mp3",
    "duration": 159,
    "game": "xenoblade-1",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Crisis",
    "localizedTitle": "Crisis",
    "file": "1-15. Crisis.mp3",
    "duration": 226,
    "game": "xenoblade-1",
    "artist": "ACE+"
  },
  {
    "title": "An Obstacle in Our Path (Definitive Edition ver.)",
    "localizedTitle": "An Obstacle in Our Path (Definitive Edition ver.)",
    "file": "1-16. An Obstacle in Our Path (Definitive Edition ver.).mp3",
    "duration": 188,
    "game": "xenoblade-1",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Engage the Enemy (Definitive Edition ver.)",
    "localizedTitle": "Engage the Enemy (Definitive Edition ver.)",
    "file": "1-17. Engage the Enemy (Definitive Edition ver.).mp3",
    "duration": 229,
    "game": "xenoblade-1",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Rage, Darkness of the Heart",
    "localizedTitle": "Rage, Darkness of the Heart",
    "file": "1-18. Rage, Darkness of the Heart.mp3",
    "duration": 219,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Sorrow",
    "localizedTitle": "Sorrow",
    "file": "1-19. Sorrow.mp3",
    "duration": 153,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Once We Part Ways",
    "localizedTitle": "Once We Part Ways",
    "file": "1-20. Once We Part Ways.mp3",
    "duration": 205,
    "game": "xenoblade-1",
    "artist": "ACE+"
  },
  {
    "title": "Apprehension",
    "localizedTitle": "Apprehension",
    "file": "2-01. Apprehension.mp3",
    "duration": 165,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Memories",
    "localizedTitle": "Memories",
    "file": "2-02. Memories.mp3",
    "duration": 184,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Urgency",
    "localizedTitle": "Urgency",
    "file": "2-03. Urgency.mp3",
    "duration": 73,
    "game": "xenoblade-1",
    "artist": "ACE+"
  },
  {
    "title": "Visions of the Future (Definitive Edition ver.)",
    "localizedTitle": "Visions of the Future (Definitive Edition ver.)",
    "file": "2-04. Visions of the Future (Definitive Edition ver.).mp3",
    "duration": 153,
    "game": "xenoblade-1",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Majesty",
    "localizedTitle": "Majesty",
    "file": "2-05. Majesty.mp3",
    "duration": 219,
    "game": "xenoblade-1",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Gaur Plain (Definitive Edition ver.)",
    "localizedTitle": "Gaur Plain (Definitive Edition ver.)",
    "file": "2-06. Gaur Plain (Definitive Edition ver.).mp3",
    "duration": 265,
    "game": "xenoblade-1",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Gaur Plain/Night (Definitive Edition ver.)",
    "localizedTitle": "Gaur Plain/Night (Definitive Edition ver.)",
    "file": "2-07. Gaur Plain - Night (Definitive Edition ver.).mp3",
    "duration": 198,
    "game": "xenoblade-1",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "In the Refugee Camp (Definitive Edition ver.)",
    "localizedTitle": "In the Refugee Camp (Definitive Edition ver.)",
    "file": "2-08. In the Refugee Camp (Definitive Edition ver.).mp3",
    "duration": 205,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Face",
    "localizedTitle": "Face",
    "file": "2-09. Face.mp3",
    "duration": 164,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Colony 6 - Ether Mine (Definitive Edition ver.)",
    "localizedTitle": "Colony 6 - Ether Mine (Definitive Edition ver.)",
    "file": "2-10. Colony 6 - Ether Mine (Definitive Edition ver.).mp3",
    "duration": 175,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Unfinished Business",
    "localizedTitle": "Unfinished Business",
    "file": "2-11. Unfinished Business.mp3",
    "duration": 186,
    "game": "xenoblade-1",
    "artist": "Yoko Shimomura"
  },
  {
    "title": "Colony 6 - Silence (Definitive Edition ver.)",
    "localizedTitle": "Colony 6 - Silence (Definitive Edition ver.)",
    "file": "2-12. Colony 6 - Silence (Definitive Edition ver.).mp3",
    "duration": 163,
    "game": "xenoblade-1",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Colony 6 - Rebuilding (Definitive Edition ver.)",
    "localizedTitle": "Colony 6 - Rebuilding (Definitive Edition ver.)",
    "file": "2-13. Colony 6 - Rebuilding (Definitive Edition ver.).mp3",
    "duration": 165,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Colony 6 - Hope (Definitive Edition ver.)",
    "localizedTitle": "Colony 6 - Hope (Definitive Edition ver.)",
    "file": "2-14. Colony 6 - Hope (Definitive Edition ver.).mp3",
    "duration": 156,
    "game": "xenoblade-1",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Colony 6 - Future (Definitive Edition ver.)",
    "localizedTitle": "Colony 6 - Future (Definitive Edition ver.)",
    "file": "2-15. Colony 6 - Future (Definitive Edition ver.).mp3",
    "duration": 135,
    "game": "xenoblade-1",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Satorl Marsh (Definitive Edition ver.)",
    "localizedTitle": "Satorl Marsh (Definitive Edition ver.)",
    "file": "2-16. Satorl Marsh (Definitive Edition ver.).mp3",
    "duration": 161,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Satorl Marsh/Night (Definitive Edition ver.)",
    "localizedTitle": "Satorl Marsh/Night (Definitive Edition ver.)",
    "file": "2-17. Satorl Marsh - Night (Definitive Edition ver.).mp3",
    "duration": 211,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Bionis' Interior/Carcass (Definitive Edition ver.)",
    "localizedTitle": "Bionis' Interior/Carcass (Definitive Edition ver.)",
    "file": "2-18. Bionis' Interior - Carcass (Definitive Edition ver.).mp3",
    "duration": 199,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Forest of the Nopon (Definitive Edition ver.)",
    "localizedTitle": "Forest of the Nopon (Definitive Edition ver.)",
    "file": "2-19. Forest of the Nopon (Definitive Edition ver.).mp3",
    "duration": 139,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Forest of the Nopon/Night (Definitive Edition ver.)",
    "localizedTitle": "Forest of the Nopon/Night (Definitive Edition ver.)",
    "file": "2-20. Forest of the Nopon - Night (Definitive Edition ver.).mp3",
    "duration": 219,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Frontier Village (Definitive Edition ver.)",
    "localizedTitle": "Frontier Village (Definitive Edition ver.)",
    "file": "2-21. Frontier Village (Definitive Edition ver.).mp3",
    "duration": 180,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Frontier Village/Night (Definitive Edition ver.)",
    "localizedTitle": "Frontier Village/Night (Definitive Edition ver.)",
    "file": "2-22. Frontier Village - Night (Definitive Edition ver.).mp3",
    "duration": 200,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Riki the Legendary Heropon",
    "localizedTitle": "Riki the Legendary Heropon",
    "file": "2-23. Riki the Legendary Heropon.mp3",
    "duration": 185,
    "game": "xenoblade-1",
    "artist": "ACE+"
  },
  {
    "title": "Eryth Sea (Definitive Edition ver.)",
    "localizedTitle": "Eryth Sea (Definitive Edition ver.)",
    "file": "3-01. Eryth Sea (Definitive Edition ver.).mp3",
    "duration": 202,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Eryth Sea/Night (Definitive Edition ver.)",
    "localizedTitle": "Eryth Sea/Night (Definitive Edition ver.)",
    "file": "3-02. Eryth Sea - Night (Definitive Edition ver.).mp3",
    "duration": 205,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Alcamoth, Imperial Capital (Definitive Edition ver.)",
    "localizedTitle": "Alcamoth, Imperial Capital (Definitive Edition ver.)",
    "file": "3-03. Alcamoth, Imperial Capital (Definitive Edition ver.).mp3",
    "duration": 198,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Alcamoth, Imperial Capital/Night (Definitive Edition ver.)",
    "localizedTitle": "Alcamoth, Imperial Capital/Night (Definitive Edition ver.)",
    "file": "3-04. Alcamoth, Imperial Capital - Night (Definitive Edition ver.).mp3",
    "duration": 198,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Intrigue",
    "localizedTitle": "Intrigue",
    "file": "3-05. Intrigue.mp3",
    "duration": 159,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Where the Ancestors Sleep (Definitive Edition ver.)",
    "localizedTitle": "Where the Ancestors Sleep (Definitive Edition ver.)",
    "file": "3-06. Where the Ancestors Sleep (Definitive Edition ver.).mp3",
    "duration": 190,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Ancient Mysteries",
    "localizedTitle": "Ancient Mysteries",
    "file": "3-07. Ancient Mysteries.mp3",
    "duration": 138,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Egil's Theme",
    "localizedTitle": "Egil's Theme",
    "file": "3-08. Egil's Theme.mp3",
    "duration": 175,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Prison Island (Definitive Edition ver.)",
    "localizedTitle": "Prison Island (Definitive Edition ver.)",
    "file": "3-09. Prison Island (Definitive Edition ver.).mp3",
    "duration": 186,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "You Will Know Our Names (Definitive Edition ver.)",
    "localizedTitle": "You Will Know Our Names (Definitive Edition ver.)",
    "file": "3-10. You Will Know Our Names (Definitive Edition ver.).mp3",
    "duration": 161,
    "game": "xenoblade-1",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Thoughts Enshrined",
    "localizedTitle": "Thoughts Enshrined",
    "file": "3-11. Thoughts Enshrined.mp3",
    "duration": 204,
    "game": "xenoblade-1",
    "artist": "ACE+"
  },
  {
    "title": "Valak Mountain (Definitive Edition ver.)",
    "localizedTitle": "Valak Mountain (Definitive Edition ver.)",
    "file": "3-12. Valak Mountain (Definitive Edition ver.).mp3",
    "duration": 246,
    "game": "xenoblade-1",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Valak Mountain/Night (Definitive Edition ver.)",
    "localizedTitle": "Valak Mountain/Night (Definitive Edition ver.)",
    "file": "3-13. Valak Mountain - Night (Definitive Edition ver.).mp3",
    "duration": 199,
    "game": "xenoblade-1",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Sword Valley (Definitive Edition ver.)",
    "localizedTitle": "Sword Valley (Definitive Edition ver.)",
    "file": "3-14. Sword Valley (Definitive Edition ver.).mp3",
    "duration": 143,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Sword Valley/Night (Definitive Edition ver.)",
    "localizedTitle": "Sword Valley/Night (Definitive Edition ver.)",
    "file": "3-15. Sword Valley - Night (Definitive Edition ver.).mp3",
    "duration": 199,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Galahad Fortress (Definitive Edition ver.)",
    "localizedTitle": "Galahad Fortress (Definitive Edition ver.)",
    "file": "3-16. Galahad Fortress (Definitive Edition ver.).mp3",
    "duration": 184,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Mechanical Rhythm (Definitive Edition ver.)",
    "localizedTitle": "Mechanical Rhythm (Definitive Edition ver.)",
    "file": "3-17. Mechanical Rhythm (Definitive Edition ver.).mp3",
    "duration": 183,
    "game": "xenoblade-1",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Irregular Bound (Definitive Edition ver.)",
    "localizedTitle": "Irregular Bound (Definitive Edition ver.)",
    "file": "3-18. Irregular Bound (Definitive Edition ver.).mp3",
    "duration": 143,
    "game": "xenoblade-1",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "A Tragic Decision (Definitive Edition ver.)",
    "localizedTitle": "A Tragic Decision (Definitive Edition ver.)",
    "file": "3-19. A Tragic Decision (Definitive Edition ver.).mp3",
    "duration": 226,
    "game": "xenoblade-1",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "The Fallen Land (Definitive Edition ver.)",
    "localizedTitle": "The Fallen Land (Definitive Edition ver.)",
    "file": "4-01. The Fallen Land (Definitive Edition ver.).mp3",
    "duration": 198,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "The Fallen Land/Night (Definitive Edition ver.)",
    "localizedTitle": "The Fallen Land/Night (Definitive Edition ver.)",
    "file": "4-02. The Fallen Land - Night (Definitive Edition ver.).mp3",
    "duration": 240,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Shulk and Fiora",
    "localizedTitle": "Shulk and Fiora",
    "file": "4-03. Shulk and Fiora.mp3",
    "duration": 192,
    "game": "xenoblade-1",
    "artist": "ACE+"
  },
  {
    "title": "Reminiscence",
    "localizedTitle": "Reminiscence",
    "file": "4-04. Reminiscence.mp3",
    "duration": 210,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Riki's Kindness",
    "localizedTitle": "Riki's Kindness",
    "file": "4-05. Riki's Kindness.mp3",
    "duration": 143,
    "game": "xenoblade-1",
    "artist": "ACE+"
  },
  {
    "title": "Hope",
    "localizedTitle": "Hope",
    "file": "4-06. Hope.mp3",
    "duration": 201,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Hidden Machina Village (Definitive Edition ver.)",
    "localizedTitle": "Hidden Machina Village (Definitive Edition ver.)",
    "file": "4-07. Hidden Machina Village (Definitive Edition ver.).mp3",
    "duration": 166,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Tension",
    "localizedTitle": "Tension",
    "file": "4-08. Tension.mp3",
    "duration": 172,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Regret",
    "localizedTitle": "Regret",
    "file": "4-09. Regret.mp3",
    "duration": 156,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Mechonis Field (Definitive Edition ver.)",
    "localizedTitle": "Mechonis Field (Definitive Edition ver.)",
    "file": "4-10. Mechonis Field (Definitive Edition ver.).mp3",
    "duration": 248,
    "game": "xenoblade-1",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Shadows Creeping",
    "localizedTitle": "Shadows Creeping",
    "file": "4-11. Shadows Creeping.mp3",
    "duration": 183,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "The Battle is Upon Us",
    "localizedTitle": "The Battle is Upon Us",
    "file": "4-12. The Battle is Upon Us.mp3",
    "duration": 219,
    "game": "xenoblade-1",
    "artist": "ACE+"
  },
  {
    "title": "Central Factory (Definitive Edition ver.)",
    "localizedTitle": "Central Factory (Definitive Edition ver.)",
    "file": "4-13. Central Factory (Definitive Edition ver.).mp3",
    "duration": 301,
    "game": "xenoblade-1",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Agniratha, Mechonis Capital (Definitive Edition ver.)",
    "localizedTitle": "Agniratha, Mechonis Capital (Definitive Edition ver.)",
    "file": "4-14. Agniratha, Mechonis Capital (Definitive Edition ver.).mp3",
    "duration": 248,
    "game": "xenoblade-1",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Agniratha, Mechonis Capital/Night (Definitive Edition ver.)",
    "localizedTitle": "Agniratha, Mechonis Capital/Night (Definitive Edition ver.)",
    "file": "4-15. Agniratha, Mechonis Capital - Night (Definitive Edition ver.).mp3",
    "duration": 176,
    "game": "xenoblade-1",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Disquiet",
    "localizedTitle": "Disquiet",
    "file": "4-16. Disquiet.mp3",
    "duration": 196,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Towering Shadow",
    "localizedTitle": "Towering Shadow",
    "file": "4-17. Towering Shadow.mp3",
    "duration": 185,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Bionis' Awakening",
    "localizedTitle": "Bionis' Awakening",
    "file": "4-18. Bionis' Awakening.mp3",
    "duration": 234,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "A Spiritual Place",
    "localizedTitle": "A Spiritual Place",
    "file": "4-19. A Spiritual Place.mp3",
    "duration": 163,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Reminiscence (Music Box)",
    "localizedTitle": "Reminiscence (Music Box)",
    "file": "4-20. Reminiscence (Music Box).mp3",
    "duration": 206,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Bionis' Interior/Pulse (Definitive Edition ver.)",
    "localizedTitle": "Bionis' Interior/Pulse (Definitive Edition ver.)",
    "file": "5-01. Bionis' Interior - Pulse (Definitive Edition ver.).mp3",
    "duration": 177,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "The End Lies Ahead (Definitive Edition ver.)",
    "localizedTitle": "The End Lies Ahead (Definitive Edition ver.)",
    "file": "5-02. The End Lies Ahead (Definitive Edition ver.).mp3",
    "duration": 217,
    "game": "xenoblade-1",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Memory's End (Definitive Edition ver.)",
    "localizedTitle": "Memory's End (Definitive Edition ver.)",
    "file": "5-03. Memory's End (Definitive Edition ver.).mp3",
    "duration": 176,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Zanza's World (Definitive Edition ver.)",
    "localizedTitle": "Zanza's World (Definitive Edition ver.)",
    "file": "5-04. Zanza's World (Definitive Edition ver.).mp3",
    "duration": 169,
    "game": "xenoblade-1",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Zanza the Divine (Definitive Edition ver.)",
    "localizedTitle": "Zanza the Divine (Definitive Edition ver.)",
    "file": "5-05. Zanza the Divine (Definitive Edition ver.).mp3",
    "duration": 199,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "The God-Slaying Sword (Definitive Edition ver.)",
    "localizedTitle": "The God-Slaying Sword (Definitive Edition ver.)",
    "file": "5-06. The God-Slaying Sword (Definitive Edition ver.).mp3",
    "duration": 301,
    "game": "xenoblade-1",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Futures That Lie Ahead",
    "localizedTitle": "Futures That Lie Ahead",
    "file": "5-07. Futures That Lie Ahead.mp3",
    "duration": 231,
    "game": "xenoblade-1",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Beyond the Sky",
    "localizedTitle": "Beyond the Sky",
    "file": "5-08. Beyond the Sky.mp3",
    "duration": 269,
    "game": "xenoblade-1",
    "artist": "Sarah àlainn"
  },
  {
    "title": "Epilogue",
    "localizedTitle": "Epilogue",
    "file": "5-09. Epilogue.mp3",
    "duration": 255,
    "game": "xenoblade-1",
    "artist": "Yoko Shimomura, Tsutomu Narita"
  },
];

// xenoblade-1-fc
const SONGS_XENOBLADE_1_FC = [
  {
    "title": "Bionis' Shoulder",
    "localizedTitle": "Bionis' Shoulder",
    "file": "5-10. Bionis' Shoulder.mp3",
    "duration": 223,
    "game": "xenoblade-1-fc",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Bionis' Shoulder/Night",
    "localizedTitle": "Bionis' Shoulder/Night",
    "file": "5-11. Bionis' Shoulder - Night.mp3",
    "duration": 258,
    "game": "xenoblade-1-fc",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Time to Fight! (Bionis' Shoulder)",
    "localizedTitle": "Time to Fight! (Bionis' Shoulder)",
    "file": "5-12. Time to Fight! (Bionis' Shoulder).mp3",
    "duration": 258,
    "game": "xenoblade-1-fc",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Fogbeasts",
    "localizedTitle": "Fogbeasts",
    "file": "5-13. Fogbeasts.mp3",
    "duration": 200,
    "game": "xenoblade-1-fc",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Gran Dell",
    "localizedTitle": "Gran Dell",
    "file": "5-14. Gran Dell.mp3",
    "duration": 207,
    "game": "xenoblade-1-fc",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Gran Dell/Night",
    "localizedTitle": "Gran Dell/Night",
    "file": "5-15. Gran Dell - Night.mp3",
    "duration": 232,
    "game": "xenoblade-1-fc",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Roar from Beyond",
    "localizedTitle": "Roar from Beyond",
    "file": "5-16. Roar from Beyond.mp3",
    "duration": 345,
    "game": "xenoblade-1-fc",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Beyond the Sky (Acoustic Arrange)",
    "localizedTitle": "Beyond the Sky (Acoustic Arrange)",
    "file": "5-17. Beyond the Sky (Acoustic Arrange).mp3",
    "duration": 339,
    "game": "xenoblade-1-fc",
    "artist": "Yasunori Mitsuda"
  },
];

// xenoblade-2
const SONGS_XENOBLADE_2 = [
  {
    "title": "Yggdrasil",
    "localizedTitle": "Yggdrasil",
    "file": "10-01. Yggdrasil.mp3",
    "duration": 215,
    "game": "xenoblade-2",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Past from Far Distance",
    "localizedTitle": "Past from Far Distance",
    "file": "10-02. Past from Far Distance.mp3",
    "duration": 166,
    "game": "xenoblade-2",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "With People and Darkness",
    "localizedTitle": "With People and Darkness",
    "file": "10-03. With People and Darkness.mp3",
    "duration": 182,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "The Power of Jin",
    "localizedTitle": "The Power of Jin",
    "file": "10-04. The Power of Jin.mp3",
    "duration": 198,
    "game": "xenoblade-2",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Praetor Amalthus - The Acting God -",
    "localizedTitle": "Praetor Amalthus - The Acting God -",
    "file": "10-05. Praetor Amalthus - The Acting God -.mp3",
    "duration": 179,
    "game": "xenoblade-2",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Walking with You",
    "localizedTitle": "Walking with You",
    "file": "10-06. Walking with You.mp3",
    "duration": 224,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Orbital Ring",
    "localizedTitle": "Orbital Ring",
    "file": "10-07. Orbital Ring.mp3",
    "duration": 229,
    "game": "xenoblade-2",
    "artist": "Manami Kiyota"
  },
  {
    "title": "The Abandoned City",
    "localizedTitle": "The Abandoned City",
    "file": "10-08. The Abandoned City.mp3",
    "duration": 216,
    "game": "xenoblade-2",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Heart in the Fog",
    "localizedTitle": "Heart in the Fog",
    "file": "10-09. Heart in the Fog.mp3",
    "duration": 182,
    "game": "xenoblade-2",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Flashback",
    "localizedTitle": "Flashback",
    "file": "10-10. Flashback.mp3",
    "duration": 140,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Sea of Clouds",
    "localizedTitle": "Sea of Clouds",
    "file": "10-11. Sea of Clouds.mp3",
    "duration": 223,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Disappearing World",
    "localizedTitle": "Disappearing World",
    "file": "10-12. Disappearing World.mp3",
    "duration": 187,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Battle in the Skies Above",
    "localizedTitle": "Battle in the Skies Above",
    "file": "10-13. Battle in the Skies Above.mp3",
    "duration": 173,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "After Despair and Hope",
    "localizedTitle": "After Despair and Hope",
    "file": "10-14. After Despair and Hope.mp3",
    "duration": 213,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Our Hope",
    "localizedTitle": "Our Hope",
    "file": "10-15. Our Hope.mp3",
    "duration": 120,
    "game": "xenoblade-2",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Parting",
    "localizedTitle": "Parting",
    "file": "10-16. Parting.mp3",
    "duration": 186,
    "game": "xenoblade-2",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "The Tomorrow with You",
    "localizedTitle": "The Tomorrow with You",
    "file": "10-17. The Tomorrow with You.mp3",
    "duration": 259,
    "game": "xenoblade-2",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Escape - Going Through Clouds -",
    "localizedTitle": "Escape - Going Through Clouds -",
    "file": "10-18. Escape - Going Through Clouds -.mp3",
    "duration": 131,
    "game": "xenoblade-2",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Elysium",
    "localizedTitle": "Elysium",
    "file": "10-19. Elysium.mp3",
    "duration": 193,
    "game": "xenoblade-2",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "White All Around Us",
    "localizedTitle": "White All Around Us",
    "file": "10-20. White All Around Us.mp3",
    "duration": 182,
    "game": "xenoblade-2",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "One Last You",
    "localizedTitle": "One Last You",
    "file": "10-21. One Last You.mp3",
    "duration": 342,
    "game": "xenoblade-2",
    "artist": "Jen Bird"
  },
  {
    "title": "Xenoblade II - Where It All Began -",
    "localizedTitle": "Xenoblade II - Where It All Began -",
    "file": "6-01. Xenoblade II - Where It All Began -.mp3",
    "duration": 80,
    "game": "xenoblade-2",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Elysium, in the Blue Sky",
    "localizedTitle": "Elysium, in the Blue Sky",
    "file": "6-02. Elysium, in the Blue Sky.mp3",
    "duration": 105,
    "game": "xenoblade-2",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Argentum",
    "localizedTitle": "Argentum",
    "file": "6-03. Argentum.mp3",
    "duration": 219,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Argentum/Night",
    "localizedTitle": "Argentum/Night",
    "file": "6-04. Argentum - Night.mp3",
    "duration": 177,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Bana's Theme",
    "localizedTitle": "Bana's Theme",
    "file": "6-05. Bana's Theme.mp3",
    "duration": 29,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "A Ship in a Stormy Sea",
    "localizedTitle": "A Ship in a Stormy Sea",
    "file": "6-06. A Ship in a Stormy Sea.mp3",
    "duration": 212,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "The Ancient Vessel",
    "localizedTitle": "The Ancient Vessel",
    "file": "6-07. The Ancient Vessel.mp3",
    "duration": 178,
    "game": "xenoblade-2",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Exploration",
    "localizedTitle": "Exploration",
    "file": "6-08. Exploration.mp3",
    "duration": 169,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "A Portent Crawling Over",
    "localizedTitle": "A Portent Crawling Over",
    "file": "6-09. A Portent Crawling Over.mp3",
    "duration": 164,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Elysium in the Dream",
    "localizedTitle": "Elysium in the Dream",
    "file": "6-10. Elysium in the Dream.mp3",
    "duration": 169,
    "game": "xenoblade-2",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "The Awakening",
    "localizedTitle": "The Awakening",
    "file": "6-11. The Awakening.mp3",
    "duration": 130,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Crossing Swords",
    "localizedTitle": "Crossing Swords",
    "file": "6-12. Crossing Swords.mp3",
    "duration": 217,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Incoming!",
    "localizedTitle": "Incoming!",
    "file": "6-13. Incoming!.mp3",
    "duration": 245,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Gormotti Forest",
    "localizedTitle": "Gormotti Forest",
    "file": "6-14. Gormotti Forest.mp3",
    "duration": 203,
    "game": "xenoblade-2",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Gormott",
    "localizedTitle": "Gormott",
    "file": "6-15. Gormott.mp3",
    "duration": 316,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Gormott/Night",
    "localizedTitle": "Gormott/Night",
    "file": "6-16. Gormott - Night.mp3",
    "duration": 201,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Battle!!",
    "localizedTitle": "Battle!!",
    "file": "6-17. Battle!!.mp3",
    "duration": 215,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Torigoth",
    "localizedTitle": "Torigoth",
    "file": "6-18. Torigoth.mp3",
    "duration": 213,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Torigoth/Night",
    "localizedTitle": "Torigoth/Night",
    "file": "6-19. Torigoth - Night.mp3",
    "duration": 159,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Wanted Nia",
    "localizedTitle": "Wanted Nia",
    "file": "6-20. Wanted Nia.mp3",
    "duration": 130,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Omens of Life",
    "localizedTitle": "Omens of Life",
    "file": "6-21. Omens of Life.mp3",
    "duration": 116,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Awakened DNA",
    "localizedTitle": "Awakened DNA",
    "file": "6-22. Awakened DNA.mp3",
    "duration": 66,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "A Nopon's Life",
    "localizedTitle": "A Nopon's Life",
    "file": "6-23. A Nopon's Life.mp3",
    "duration": 141,
    "game": "xenoblade-2",
    "artist": "ACE (工藤ともり, CHiCO)"
  },
  {
    "title": "Tiger! Tiger!",
    "localizedTitle": "Tiger! Tiger!",
    "file": "6-24. Tiger! Tiger!.mp3",
    "duration": 144,
    "game": "xenoblade-2",
    "artist": "Manami Kiyota"
  },
  {
    "title": "A Brewing Storm",
    "localizedTitle": "A Brewing Storm",
    "file": "6-25. A Brewing Storm.mp3",
    "duration": 152,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Titan Battleship",
    "localizedTitle": "Titan Battleship",
    "file": "7-01. Titan Battleship.mp3",
    "duration": 277,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Monster Surprised You",
    "localizedTitle": "Monster Surprised You",
    "file": "7-02. Monster Surprised You.mp3",
    "duration": 194,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Irritation",
    "localizedTitle": "Irritation",
    "file": "7-03. Irritation.mp3",
    "duration": 161,
    "game": "xenoblade-2",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Where We Used To Be",
    "localizedTitle": "Where We Used To Be",
    "file": "7-04. Where We Used To Be.mp3",
    "duration": 190,
    "game": "xenoblade-2",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Friendship",
    "localizedTitle": "Friendship",
    "file": "7-05. Friendship.mp3",
    "duration": 174,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "The Towering Yggdrasil",
    "localizedTitle": "The Towering Yggdrasil",
    "file": "7-06. The Towering Yggdrasil.mp3",
    "duration": 156,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Ophion",
    "localizedTitle": "Ophion",
    "file": "7-07. Ophion.mp3",
    "duration": 145,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Womb Center",
    "localizedTitle": "Womb Center",
    "file": "7-08. Womb Center.mp3",
    "duration": 184,
    "game": "xenoblade-2",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Garfont Mercenaries",
    "localizedTitle": "Garfont Mercenaries",
    "file": "7-09. Garfont Mercenaries.mp3",
    "duration": 198,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Garfont Mercenaries/Night",
    "localizedTitle": "Garfont Mercenaries/Night",
    "file": "7-10. Garfont Mercenaries - Night.mp3",
    "duration": 128,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Death Match with Torna",
    "localizedTitle": "Death Match with Torna",
    "file": "7-11. Death Match with Torna.mp3",
    "duration": 203,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Kingdom of Uraya",
    "localizedTitle": "Kingdom of Uraya",
    "file": "7-12. Kingdom of Uraya.mp3",
    "duration": 202,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Kingdom of Uraya/Night",
    "localizedTitle": "Kingdom of Uraya/Night",
    "file": "7-13. Kingdom of Uraya - Night.mp3",
    "duration": 149,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Those Who Stand Against Our Path",
    "localizedTitle": "Those Who Stand Against Our Path",
    "file": "7-14. Those Who Stand Against Our Path.mp3",
    "duration": 219,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Fonsa Myma",
    "localizedTitle": "Fonsa Myma",
    "file": "7-15. Fonsa Myma.mp3",
    "duration": 180,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Fonsa Myma/Night",
    "localizedTitle": "Fonsa Myma/Night",
    "file": "7-16. Fonsa Myma - Night.mp3",
    "duration": 175,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "The Heroic Adventures",
    "localizedTitle": "The Heroic Adventures",
    "file": "7-17. The Heroic Adventures.mp3",
    "duration": 164,
    "game": "xenoblade-2",
    "artist": "Manami Kiyota"
  },
  {
    "title": "The Beginning of Darkness",
    "localizedTitle": "The Beginning of Darkness",
    "file": "7-18. The Beginning of Darkness.mp3",
    "duration": 175,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Drifting Soul",
    "localizedTitle": "Drifting Soul",
    "file": "7-19. Drifting Soul.mp3",
    "duration": 336,
    "game": "xenoblade-2",
    "artist": "Jen Bird"
  },
  {
    "title": "Counterattack",
    "localizedTitle": "Counterattack",
    "file": "8-01. Counterattack.mp3",
    "duration": 273,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "You Will Recall Our Names",
    "localizedTitle": "You Will Recall Our Names",
    "file": "8-02. You Will Recall Our Names.mp3",
    "duration": 217,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Desolation",
    "localizedTitle": "Desolation",
    "file": "8-03. Desolation.mp3",
    "duration": 188,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Contrition",
    "localizedTitle": "Contrition",
    "file": "8-04. Contrition.mp3",
    "duration": 167,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "War and Peace",
    "localizedTitle": "War and Peace",
    "file": "8-05. War and Peace.mp3",
    "duration": 166,
    "game": "xenoblade-2",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Driver VS",
    "localizedTitle": "Driver VS",
    "file": "8-06. Driver VS.mp3",
    "duration": 169,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Alba Cavanich",
    "localizedTitle": "Alba Cavanich",
    "file": "8-07. Alba Cavanich.mp3",
    "duration": 177,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Alba Cavanich/Night",
    "localizedTitle": "Alba Cavanich/Night",
    "file": "8-08. Alba Cavanich - Night.mp3",
    "duration": 197,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Running",
    "localizedTitle": "Running",
    "file": "8-09. Running.mp3",
    "duration": 178,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Mor Ardain - Roaming the Wastes -",
    "localizedTitle": "Mor Ardain - Roaming the Wastes -",
    "file": "8-10. Mor Ardain - Roaming the Wastes -.mp3",
    "duration": 185,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Mor Ardain/Night",
    "localizedTitle": "Mor Ardain/Night",
    "file": "8-11. Mor Ardain - Night.mp3",
    "duration": 195,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Eye of Shining Justice",
    "localizedTitle": "Eye of Shining Justice",
    "file": "8-12. Eye of Shining Justice.mp3",
    "duration": 115,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Bringer of Chaos! Ultimate",
    "localizedTitle": "Bringer of Chaos! Ultimate",
    "file": "8-13. Bringer of Chaos! Ultimate.mp3",
    "duration": 205,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Song of Giga Rosa",
    "localizedTitle": "Song of Giga Rosa",
    "file": "8-14. Song of Giga Rosa.mp3",
    "duration": 112,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Jump Towards the Morning Sun",
    "localizedTitle": "Jump Towards the Morning Sun",
    "file": "8-15. Jump Towards the Morning Sun.mp3",
    "duration": 142,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Leftherian Archipelago",
    "localizedTitle": "Leftherian Archipelago",
    "file": "8-16. Leftherian Archipelago.mp3",
    "duration": 241,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Leftherian Archipelago/Night",
    "localizedTitle": "Leftherian Archipelago/Night",
    "file": "8-17. Leftherian Archipelago - Night.mp3",
    "duration": 264,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Gramps",
    "localizedTitle": "Gramps",
    "file": "8-18. Gramps.mp3",
    "duration": 162,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Gramps/Night",
    "localizedTitle": "Gramps/Night",
    "file": "8-19. Gramps - Night.mp3",
    "duration": 182,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "A Place in the Sun",
    "localizedTitle": "A Place in the Sun",
    "file": "8-20. A Place in the Sun.mp3",
    "duration": 154,
    "game": "xenoblade-2",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Our Eternal Land",
    "localizedTitle": "Our Eternal Land",
    "file": "9-01. Our Eternal Land.mp3",
    "duration": 191,
    "game": "xenoblade-2",
    "artist": "ANúNA"
  },
  {
    "title": "We Are the Chosen Ones",
    "localizedTitle": "We Are the Chosen Ones",
    "file": "9-02. We Are the Chosen Ones.mp3",
    "duration": 204,
    "game": "xenoblade-2",
    "artist": "ANúNA"
  },
  {
    "title": "Misgivings",
    "localizedTitle": "Misgivings",
    "file": "9-03. Misgivings.mp3",
    "duration": 170,
    "game": "xenoblade-2",
    "artist": "Manami Kiyota"
  },
  {
    "title": "The Impending Crisis",
    "localizedTitle": "The Impending Crisis",
    "file": "9-04. The Impending Crisis.mp3",
    "duration": 201,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Temperantia",
    "localizedTitle": "Temperantia",
    "file": "9-05. Temperantia.mp3",
    "duration": 197,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Over the Sinful Entreaty",
    "localizedTitle": "Over the Sinful Entreaty",
    "file": "9-06. Over the Sinful Entreaty.mp3",
    "duration": 242,
    "game": "xenoblade-2",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Tantal",
    "localizedTitle": "Tantal",
    "file": "9-07. Tantal.mp3",
    "duration": 204,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Tantal/Night",
    "localizedTitle": "Tantal/Night",
    "file": "9-08. Tantal - Night.mp3",
    "duration": 182,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Ever Come to an End",
    "localizedTitle": "Ever Come to an End",
    "file": "9-09. Ever Come to an End.mp3",
    "duration": 188,
    "game": "xenoblade-2",
    "artist": "ANúNA"
  },
  {
    "title": "Shadow of the Lowlands",
    "localizedTitle": "Shadow of the Lowlands",
    "file": "9-10. Shadow of the Lowlands.mp3",
    "duration": 174,
    "game": "xenoblade-2",
    "artist": "ANúNA"
  },
  {
    "title": "The Past Revealed",
    "localizedTitle": "The Past Revealed",
    "file": "9-11. The Past Revealed.mp3",
    "duration": 145,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "The Decision",
    "localizedTitle": "The Decision",
    "file": "9-12. The Decision.mp3",
    "duration": 301,
    "game": "xenoblade-2",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Loneliness",
    "localizedTitle": "Loneliness",
    "file": "9-13. Loneliness.mp3",
    "duration": 171,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Spirit Crucible Elpys",
    "localizedTitle": "Spirit Crucible Elpys",
    "file": "9-14. Spirit Crucible Elpys.mp3",
    "duration": 161,
    "game": "xenoblade-2",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Tensed Mind",
    "localizedTitle": "Tensed Mind",
    "file": "9-15. Tensed Mind.mp3",
    "duration": 157,
    "game": "xenoblade-2",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Drifting Soul (Violin Version)",
    "localizedTitle": "Drifting Soul (Violin Version)",
    "file": "9-16. Drifting Soul (Violin Version).mp3",
    "duration": 309,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "A Faint Hope",
    "localizedTitle": "A Faint Hope",
    "file": "9-17. A Faint Hope.mp3",
    "duration": 161,
    "game": "xenoblade-2",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Cliffs of Morytha",
    "localizedTitle": "Cliffs of Morytha",
    "file": "9-18. Cliffs of Morytha.mp3",
    "duration": 207,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Still, Move Forward!",
    "localizedTitle": "Still, Move Forward!",
    "file": "9-19. Still, Move Forward!.mp3",
    "duration": 216,
    "game": "xenoblade-2",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Land of Morytha",
    "localizedTitle": "Land of Morytha",
    "file": "9-20. Land of Morytha.mp3",
    "duration": 220,
    "game": "xenoblade-2",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
];

// xenoblade-2-torna
const SONGS_XENOBLADE_2_TORNA = [
  {
    "title": "The Beginning of Our Memory",
    "localizedTitle": "The Beginning of Our Memory",
    "file": "11-01. The Beginning of Our Memory.mp3",
    "duration": 202,
    "game": "xenoblade-2-torna",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Lasaria Woodland",
    "localizedTitle": "Lasaria Woodland",
    "file": "11-02. Lasaria Woodland.mp3",
    "duration": 183,
    "game": "xenoblade-2-torna",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Battle!!/Torna",
    "localizedTitle": "Battle!!/Torna",
    "file": "11-03. Battle!! - Torna.mp3",
    "duration": 406,
    "game": "xenoblade-2-torna",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Four-limbed Titan/Gormott",
    "localizedTitle": "Four-limbed Titan/Gormott",
    "file": "11-04. Four-limbed Titan - Gormott.mp3",
    "duration": 303,
    "game": "xenoblade-2-torna",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Kingdom of Torna",
    "localizedTitle": "Kingdom of Torna",
    "file": "11-05. Kingdom of Torna.mp3",
    "duration": 275,
    "game": "xenoblade-2-torna",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Kingdom of Torna/Night",
    "localizedTitle": "Kingdom of Torna/Night",
    "file": "11-06. Kingdom of Torna - Night.mp3",
    "duration": 237,
    "game": "xenoblade-2-torna",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Auresco, Royal Capital",
    "localizedTitle": "Auresco, Royal Capital",
    "file": "11-07. Auresco, Royal Capital.mp3",
    "duration": 178,
    "game": "xenoblade-2-torna",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Auresco, Royal Capital/Night",
    "localizedTitle": "Auresco, Royal Capital/Night",
    "file": "11-08. Auresco, Royal Capital - Night.mp3",
    "duration": 193,
    "game": "xenoblade-2-torna",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Over Despair and Animus",
    "localizedTitle": "Over Despair and Animus",
    "file": "11-09. Over Despair and Animus.mp3",
    "duration": 186,
    "game": "xenoblade-2-torna",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Our Paths May Never Cross",
    "localizedTitle": "Our Paths May Never Cross",
    "file": "11-10. Our Paths May Never Cross.mp3",
    "duration": 186,
    "game": "xenoblade-2-torna",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "A Moment of Eternity",
    "localizedTitle": "A Moment of Eternity",
    "file": "11-11. A Moment of Eternity.mp3",
    "duration": 298,
    "game": "xenoblade-2-torna",
    "artist": "Jen Bird"
  },
];

// xenoblade-3
const SONGS_XENOBLADE_3 = [
  {
    "title": "Off-Seer",
    "localizedTitle": "Off-Seer",
    "file": "12-01. Off-Seer.mp3",
    "duration": 198,
    "game": "xenoblade-3",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Battlefield - The Scramble for Life",
    "localizedTitle": "Battlefield - The Scramble for Life",
    "file": "12-02. Battlefield - The Scramble for Life.mp3",
    "duration": 218,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Tactical Action (Dynamic)",
    "localizedTitle": "Tactical Action (Dynamic)",
    "file": "12-03. Tactical Action (Dynamic).mp3",
    "duration": 110,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Tactical Action",
    "localizedTitle": "Tactical Action",
    "file": "12-04. Tactical Action.mp3",
    "duration": 95,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "The Exhausted Victorious, The Speechless Defeated",
    "localizedTitle": "The Exhausted Victorious, The Speechless Defeated",
    "file": "12-05. The Exhausted Victorious, The Speechless Defeated.mp3",
    "duration": 254,
    "game": "xenoblade-3",
    "artist": "救仁郷裕, 藤井理央"
  },
  {
    "title": "Young Warriors",
    "localizedTitle": "Young Warriors",
    "file": "12-06. Young Warriors.mp3",
    "duration": 195,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Lost Days of Warmth",
    "localizedTitle": "Lost Days of Warmth",
    "file": "12-07. Lost Days of Warmth.mp3",
    "duration": 184,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Shining Aspiration - Inherited Melody",
    "localizedTitle": "Shining Aspiration - Inherited Melody",
    "file": "12-08. Shining Aspiration - Inherited Melody.mp3",
    "duration": 257,
    "game": "xenoblade-3",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Yzana Plains",
    "localizedTitle": "Yzana Plains",
    "file": "12-09. Yzana Plains.mp3",
    "duration": 277,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Yzana Plains/Night",
    "localizedTitle": "Yzana Plains/Night",
    "file": "12-10. Yzana Plains - Night.mp3",
    "duration": 249,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Keves Battle",
    "localizedTitle": "Keves Battle",
    "file": "12-11. Keves Battle.mp3",
    "duration": 199,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Soldiers' Paean",
    "localizedTitle": "Soldiers' Paean",
    "file": "12-12. Soldiers' Paean.mp3",
    "duration": 205,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Indescribable Unease",
    "localizedTitle": "Indescribable Unease",
    "file": "12-13. Indescribable Unease.mp3",
    "duration": 200,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Iris Network",
    "localizedTitle": "Iris Network",
    "file": "12-14. Iris Network.mp3",
    "duration": 204,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Alfeto Valley",
    "localizedTitle": "Alfeto Valley",
    "file": "13-01. Alfeto Valley.mp3",
    "duration": 195,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Alfeto Valley/Night",
    "localizedTitle": "Alfeto Valley/Night",
    "file": "13-02. Alfeto Valley - Night.mp3",
    "duration": 221,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Nearing the Enemy",
    "localizedTitle": "Nearing the Enemy",
    "file": "13-03. Nearing the Enemy.mp3",
    "duration": 184,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Impending Crisis",
    "localizedTitle": "Impending Crisis",
    "file": "13-04. Impending Crisis.mp3",
    "duration": 231,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Immediate Threat",
    "localizedTitle": "Immediate Threat",
    "file": "13-05. Immediate Threat.mp3",
    "duration": 265,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "The Two Off-Seers",
    "localizedTitle": "The Two Off-Seers",
    "file": "13-06. The Two Off-Seers.mp3",
    "duration": 202,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Suffocating Reverberation",
    "localizedTitle": "Suffocating Reverberation",
    "file": "13-07. Suffocating Reverberation.mp3",
    "duration": 187,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Ouroboros Awakening",
    "localizedTitle": "Ouroboros Awakening",
    "file": "13-08. Ouroboros Awakening.mp3",
    "duration": 154,
    "game": "xenoblade-3",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Moebius Battle",
    "localizedTitle": "Moebius Battle",
    "file": "13-09. Moebius Battle.mp3",
    "duration": 511,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Against the World",
    "localizedTitle": "Against the World",
    "file": "13-10. Against the World.mp3",
    "duration": 206,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "A Life Woven Together",
    "localizedTitle": "A Life Woven Together",
    "file": "13-11. A Life Woven Together.mp3",
    "duration": 192,
    "game": "xenoblade-3",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "A Life Sent On",
    "localizedTitle": "A Life Sent On",
    "file": "13-12. A Life Sent On.mp3",
    "duration": 116,
    "game": "xenoblade-3",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Quiet Intrigue",
    "localizedTitle": "Quiet Intrigue",
    "file": "13-13. Quiet Intrigue.mp3",
    "duration": 188,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Hostile Colony (Dynamic)",
    "localizedTitle": "Hostile Colony (Dynamic)",
    "file": "13-14. Hostile Colony (Dynamic).mp3",
    "duration": 154,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Hostile Colony",
    "localizedTitle": "Hostile Colony",
    "file": "13-15. Hostile Colony.mp3",
    "duration": 168,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Everyday Life",
    "localizedTitle": "Everyday Life",
    "file": "13-16. Everyday Life.mp3",
    "duration": 221,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "The Bereaved and Those Left Behind",
    "localizedTitle": "The Bereaved and Those Left Behind",
    "file": "13-17. The Bereaved and Those Left Behind.mp3",
    "duration": 249,
    "game": "xenoblade-3",
    "artist": "Yasunori Mitsuda, 野口明生"
  },
  {
    "title": "Off-Seer - Noah",
    "localizedTitle": "Off-Seer - Noah",
    "file": "13-18. Off-Seer - Noah.mp3",
    "duration": 124,
    "game": "xenoblade-3",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Millick Meadows",
    "localizedTitle": "Millick Meadows",
    "file": "14-01. Millick Meadows.mp3",
    "duration": 266,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Millick Meadows/Night",
    "localizedTitle": "Millick Meadows/Night",
    "file": "14-02. Millick Meadows - Night.mp3",
    "duration": 196,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "A Formidable Enemy",
    "localizedTitle": "A Formidable Enemy",
    "file": "14-03. A Formidable Enemy.mp3",
    "duration": 214,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Eagus Wilderness",
    "localizedTitle": "Eagus Wilderness",
    "file": "14-04. Eagus Wilderness.mp3",
    "duration": 250,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Eagus Wilderness/Night",
    "localizedTitle": "Eagus Wilderness/Night",
    "file": "14-05. Eagus Wilderness - Night.mp3",
    "duration": 249,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Suspicion",
    "localizedTitle": "Suspicion",
    "file": "14-06. Suspicion.mp3",
    "duration": 175,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Sun-Dappled Glade",
    "localizedTitle": "Sun-Dappled Glade",
    "file": "14-07. Sun-Dappled Glade.mp3",
    "duration": 178,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Blade - Those Who Know Fear",
    "localizedTitle": "Blade - Those Who Know Fear",
    "file": "14-08. Blade - Those Who Know Fear.mp3",
    "duration": 176,
    "game": "xenoblade-3",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Moebius",
    "localizedTitle": "Moebius",
    "file": "14-09. Moebius.mp3",
    "duration": 205,
    "game": "xenoblade-3",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Those Who Devour Life",
    "localizedTitle": "Those Who Devour Life",
    "file": "14-10. Those Who Devour Life.mp3",
    "duration": 200,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Remorse",
    "localizedTitle": "Remorse",
    "file": "14-11. Remorse.mp3",
    "duration": 196,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Keves Colony",
    "localizedTitle": "Keves Colony",
    "file": "14-12. Keves Colony.mp3",
    "duration": 201,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Keves Colony/Night",
    "localizedTitle": "Keves Colony/Night",
    "file": "14-13. Keves Colony - Night.mp3",
    "duration": 178,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Encroaching Malice",
    "localizedTitle": "Encroaching Malice",
    "file": "14-14. Encroaching Malice.mp3",
    "duration": 183,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Ribbi Flats",
    "localizedTitle": "Ribbi Flats",
    "file": "14-15. Ribbi Flats.mp3",
    "duration": 186,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Ribbi Flats/Night",
    "localizedTitle": "Ribbi Flats/Night",
    "file": "14-16. Ribbi Flats - Night.mp3",
    "duration": 200,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "You Will Know Our Names - Finale",
    "localizedTitle": "You Will Know Our Names - Finale",
    "file": "14-17. You Will Know Our Names - Finale.mp3",
    "duration": 318,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Dannagh Desert",
    "localizedTitle": "Dannagh Desert",
    "file": "15-01. Dannagh Desert.mp3",
    "duration": 241,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Dannagh Desert/Night",
    "localizedTitle": "Dannagh Desert/Night",
    "file": "15-02. Dannagh Desert - Night.mp3",
    "duration": 251,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Rae-Bel Tableland",
    "localizedTitle": "Rae-Bel Tableland",
    "file": "15-03. Rae-Bel Tableland.mp3",
    "duration": 282,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Rae-Bel Tableland/Night",
    "localizedTitle": "Rae-Bel Tableland/Night",
    "file": "15-04. Rae-Bel Tableland - Night.mp3",
    "duration": 265,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Urayan Tunnels",
    "localizedTitle": "Urayan Tunnels",
    "file": "15-05. Urayan Tunnels.mp3",
    "duration": 196,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Ferronis",
    "localizedTitle": "Ferronis",
    "file": "15-06. Ferronis.mp3",
    "duration": 234,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Confronting Our Past",
    "localizedTitle": "Confronting Our Past",
    "file": "15-07. Confronting Our Past.mp3",
    "duration": 171,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Chain Attack",
    "localizedTitle": "Chain Attack",
    "file": "15-08. Chain Attack.mp3",
    "duration": 330,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Off-Seer - Mio",
    "localizedTitle": "Off-Seer - Mio",
    "file": "15-09. Off-Seer - Mio.mp3",
    "duration": 118,
    "game": "xenoblade-3",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Great Cotte Falls",
    "localizedTitle": "Great Cotte Falls",
    "file": "15-10. Great Cotte Falls.mp3",
    "duration": 234,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Great Cotte Falls/Night",
    "localizedTitle": "Great Cotte Falls/Night",
    "file": "15-11. Great Cotte Falls - Night.mp3",
    "duration": 223,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Mysterious Land",
    "localizedTitle": "Mysterious Land",
    "file": "15-12. Mysterious Land.mp3",
    "duration": 198,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Maktha Wildwood",
    "localizedTitle": "Maktha Wildwood",
    "file": "15-13. Maktha Wildwood.mp3",
    "duration": 298,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Maktha Wildwood/Night",
    "localizedTitle": "Maktha Wildwood/Night",
    "file": "15-14. Maktha Wildwood - Night.mp3",
    "duration": 276,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Light of the Moon - Hope",
    "localizedTitle": "Light of the Moon - Hope",
    "file": "15-15. Light of the Moon - Hope.mp3",
    "duration": 207,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Agnus Colony",
    "localizedTitle": "Agnus Colony",
    "file": "16-01. Agnus Colony.mp3",
    "duration": 225,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Agnus Colony/Night",
    "localizedTitle": "Agnus Colony/Night",
    "file": "16-02. Agnus Colony - Night.mp3",
    "duration": 194,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Agnus Battle",
    "localizedTitle": "Agnus Battle",
    "file": "16-03. Agnus Battle.mp3",
    "duration": 223,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "A Life Become Distant",
    "localizedTitle": "A Life Become Distant",
    "file": "16-04. A Life Become Distant.mp3",
    "duration": 177,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "In the Morning Mist",
    "localizedTitle": "In the Morning Mist",
    "file": "16-05. In the Morning Mist.mp3",
    "duration": 249,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Life's Fading Flame - Holding These Thoughts",
    "localizedTitle": "Life's Fading Flame - Holding These Thoughts",
    "file": "16-06. Life's Fading Flame - Holding These Thoughts.mp3",
    "duration": 219,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Carrying the Weight of Life",
    "localizedTitle": "Carrying the Weight of Life",
    "file": "16-07. Carrying the Weight of Life.mp3",
    "duration": 269,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Rest Spot",
    "localizedTitle": "Rest Spot",
    "file": "16-08. Rest Spot.mp3",
    "duration": 204,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Syra Hovering Reefs",
    "localizedTitle": "Syra Hovering Reefs",
    "file": "16-09. Syra Hovering Reefs.mp3",
    "duration": 221,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Syra Hovering Reefs/Night",
    "localizedTitle": "Syra Hovering Reefs/Night",
    "file": "16-10. Syra Hovering Reefs - Night.mp3",
    "duration": 220,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Keves Castle",
    "localizedTitle": "Keves Castle",
    "file": "16-11. Keves Castle.mp3",
    "duration": 202,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Keves Castle (Battle)",
    "localizedTitle": "Keves Castle (Battle)",
    "file": "16-12. Keves Castle (Battle).mp3",
    "duration": 191,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "The False Queens",
    "localizedTitle": "The False Queens",
    "file": "16-13. The False Queens.mp3",
    "duration": 357,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Great Sword's Base",
    "localizedTitle": "Great Sword's Base",
    "file": "16-14. Great Sword's Base.mp3",
    "duration": 234,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Great Sword's Base/Night",
    "localizedTitle": "Great Sword's Base/Night",
    "file": "16-15. Great Sword's Base - Night.mp3",
    "duration": 233,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "City",
    "localizedTitle": "City",
    "file": "17-01. City.mp3",
    "duration": 248,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "City/Night",
    "localizedTitle": "City/Night",
    "file": "17-02. City - Night.mp3",
    "duration": 225,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Sailing the Seas",
    "localizedTitle": "Sailing the Seas",
    "file": "17-03. Sailing the Seas.mp3",
    "duration": 287,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Erythia Sea",
    "localizedTitle": "Erythia Sea",
    "file": "17-04. Erythia Sea.mp3",
    "duration": 200,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Erythia Sea/Night",
    "localizedTitle": "Erythia Sea/Night",
    "file": "17-05. Erythia Sea - Night.mp3",
    "duration": 177,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Battle on the Seas",
    "localizedTitle": "Battle on the Seas",
    "file": "17-06. Battle on the Seas.mp3",
    "duration": 226,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Malevolent Hollow",
    "localizedTitle": "Malevolent Hollow",
    "file": "17-07. Malevolent Hollow.mp3",
    "duration": 213,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Li Garte Prison Camp",
    "localizedTitle": "Li Garte Prison Camp",
    "file": "17-08. Li Garte Prison Camp.mp3",
    "duration": 209,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Moebius Battle/M",
    "localizedTitle": "Moebius Battle/M",
    "file": "17-09. Moebius Battle - M.mp3",
    "duration": 511,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "That To Which The Defeated Cling",
    "localizedTitle": "That To Which The Defeated Cling",
    "file": "17-10. That To Which The Defeated Cling.mp3",
    "duration": 196,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "A Step Away",
    "localizedTitle": "A Step Away",
    "file": "17-11. A Step Away.mp3",
    "duration": 295,
    "game": "xenoblade-3",
    "artist": "Sara Weeda"
  },
  {
    "title": "A Life Overflowing",
    "localizedTitle": "A Life Overflowing",
    "file": "17-12. A Life Overflowing.mp3",
    "duration": 268,
    "game": "xenoblade-3",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Homecoming",
    "localizedTitle": "Homecoming",
    "file": "17-13. Homecoming.mp3",
    "duration": 437,
    "game": "xenoblade-3",
    "artist": "Yasunori Mitsuda, Mariam Abounnasr"
  },
  {
    "title": "Words That Never Reached You",
    "localizedTitle": "Words That Never Reached You",
    "file": "17-14. Words That Never Reached You.mp3",
    "duration": 195,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Agnus Castle",
    "localizedTitle": "Agnus Castle",
    "file": "18-01. Agnus Castle.mp3",
    "duration": 204,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Agnus Castle/Night",
    "localizedTitle": "Agnus Castle/Night",
    "file": "18-02. Agnus Castle - Night.mp3",
    "duration": 186,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Captocorn Peak",
    "localizedTitle": "Captocorn Peak",
    "file": "18-03. Captocorn Peak.mp3",
    "duration": 218,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Captocorn Peak/Night",
    "localizedTitle": "Captocorn Peak/Night",
    "file": "18-04. Captocorn Peak - Night.mp3",
    "duration": 226,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Off-Seer - Miyabi",
    "localizedTitle": "Off-Seer - Miyabi",
    "file": "18-05. Off-Seer - Miyabi.mp3",
    "duration": 138,
    "game": "xenoblade-3",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Feelings Risen to the Sky",
    "localizedTitle": "Feelings Risen to the Sky",
    "file": "18-06. Feelings Risen to the Sky.mp3",
    "duration": 195,
    "game": "xenoblade-3",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Cloudkeep",
    "localizedTitle": "Cloudkeep",
    "file": "18-07. Cloudkeep.mp3",
    "duration": 221,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Converging Emotions",
    "localizedTitle": "Converging Emotions",
    "file": "18-08. Converging Emotions.mp3",
    "duration": 229,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Saffronia Village",
    "localizedTitle": "Saffronia Village",
    "file": "18-09. Saffronia Village.mp3",
    "duration": 262,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Off-Seer - Crys",
    "localizedTitle": "Off-Seer - Crys",
    "file": "18-10. Off-Seer - Crys.mp3",
    "duration": 109,
    "game": "xenoblade-3",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Feelings Upon This Melody",
    "localizedTitle": "Feelings Upon This Melody",
    "file": "18-11. Feelings Upon This Melody.mp3",
    "duration": 188,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Fort O'Virbus",
    "localizedTitle": "Fort O'Virbus",
    "file": "18-12. Fort O'Virbus.mp3",
    "duration": 183,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Fort O'Virbus/Night",
    "localizedTitle": "Fort O'Virbus/Night",
    "file": "18-13. Fort O'Virbus - Night.mp3",
    "duration": 224,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Elaice Highway",
    "localizedTitle": "Elaice Highway",
    "file": "18-14. Elaice Highway.mp3",
    "duration": 241,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Elaice Highway/Night",
    "localizedTitle": "Elaice Highway/Night",
    "file": "18-15. Elaice Highway - Night.mp3",
    "duration": 258,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "The Great Sea Stirs",
    "localizedTitle": "The Great Sea Stirs",
    "file": "18-16. The Great Sea Stirs.mp3",
    "duration": 252,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Ultimate Enemy",
    "localizedTitle": "Ultimate Enemy",
    "file": "18-17. Ultimate Enemy.mp3",
    "duration": 258,
    "game": "xenoblade-3",
    "artist": "救仁郷裕, 藤井理央"
  },
  {
    "title": "Brilliant Wings",
    "localizedTitle": "Brilliant Wings",
    "file": "18-18. Brilliant Wings.mp3",
    "duration": 247,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Kaleidoscopic Core",
    "localizedTitle": "Kaleidoscopic Core",
    "file": "18-19. Kaleidoscopic Core.mp3",
    "duration": 215,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Origin Ascending",
    "localizedTitle": "Origin Ascending",
    "file": "19-01. Origin Ascending.mp3",
    "duration": 219,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Origin",
    "localizedTitle": "Origin",
    "file": "19-02. Origin.mp3",
    "duration": 418,
    "game": "xenoblade-3",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Origin Battle",
    "localizedTitle": "Origin Battle",
    "file": "19-03. Origin Battle.mp3",
    "duration": 112,
    "game": "xenoblade-3",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Noah and N",
    "localizedTitle": "Noah and N",
    "file": "19-04. Noah and N.mp3",
    "duration": 337,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Grand Theater of Life",
    "localizedTitle": "Grand Theater of Life",
    "file": "19-05. Grand Theater of Life.mp3",
    "duration": 216,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Z - Harbinger of the End",
    "localizedTitle": "Z - Harbinger of the End",
    "file": "19-06. Z - Harbinger of the End.mp3",
    "duration": 225,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "The Two Queens of Aionios",
    "localizedTitle": "The Two Queens of Aionios",
    "file": "19-07. The Two Queens of Aionios.mp3",
    "duration": 187,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Congregating Lives",
    "localizedTitle": "Congregating Lives",
    "file": "19-08. Congregating Lives.mp3",
    "duration": 205,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Showdown with Z",
    "localizedTitle": "Showdown with Z",
    "file": "19-09. Showdown with Z.mp3",
    "duration": 218,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "How the Future Endures",
    "localizedTitle": "How the Future Endures",
    "file": "19-10. How the Future Endures.mp3",
    "duration": 289,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Something's Beginning to Move",
    "localizedTitle": "Something's Beginning to Move",
    "file": "19-11. Something's Beginning to Move.mp3",
    "duration": 282,
    "game": "xenoblade-3",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Where We Belong",
    "localizedTitle": "Where We Belong",
    "file": "19-12. Where We Belong.mp3",
    "duration": 335,
    "game": "xenoblade-3",
    "artist": "Sara Weeda"
  },
  {
    "title": "Melia - Ancient Memories",
    "localizedTitle": "Melia - Ancient Memories",
    "file": "19-13. Melia - Ancient Memories.mp3",
    "duration": 234,
    "game": "xenoblade-3",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Nia - Toward the Heavens",
    "localizedTitle": "Nia - Toward the Heavens",
    "file": "19-14. Nia - Toward the Heavens.mp3",
    "duration": 203,
    "game": "xenoblade-3",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Hope for the Future",
    "localizedTitle": "Hope for the Future",
    "file": "19-15. Hope for the Future.mp3",
    "duration": 187,
    "game": "xenoblade-3",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Noah and Mio - Our Melody",
    "localizedTitle": "Noah and Mio - Our Melody",
    "file": "19-16. Noah and Mio - Our Melody.mp3",
    "duration": 47,
    "game": "xenoblade-3",
    "artist": "Yasunori Mitsuda"
  },
];

// xenoblade-3-fr
const SONGS_XENOBLADE_3_FR = [
  {
    "title": "At Our Life's End",
    "localizedTitle": "At Our Life's End",
    "file": "20-01. At Our Life's End.mp3",
    "duration": 233,
    "game": "xenoblade-3-fr",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "New Battle!!!",
    "localizedTitle": "New Battle!!!",
    "file": "20-02. New Battle!!!.mp3",
    "duration": 407,
    "game": "xenoblade-3-fr",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Cent-Omnia Region",
    "localizedTitle": "Cent-Omnia Region",
    "file": "20-03. Cent-Omnia Region.mp3",
    "duration": 265,
    "game": "xenoblade-3-fr",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Cent-Omnia Region/Night",
    "localizedTitle": "Cent-Omnia Region/Night",
    "file": "20-04. Cent-Omnia Region - Night.mp3",
    "duration": 276,
    "game": "xenoblade-3-fr",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Yesterdale - Colony 9",
    "localizedTitle": "Yesterdale - Colony 9",
    "file": "20-05. Yesterdale - Colony 9.mp3",
    "duration": 229,
    "game": "xenoblade-3-fr",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Yesterdale - Colony 9/Night",
    "localizedTitle": "Yesterdale - Colony 9/Night",
    "file": "20-06. Yesterdale - Colony 9 - Night.mp3",
    "duration": 237,
    "game": "xenoblade-3-fr",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Black Mountains - Valak Mountain",
    "localizedTitle": "Black Mountains - Valak Mountain",
    "file": "20-07. Black Mountains - Valak Mountain.mp3",
    "duration": 294,
    "game": "xenoblade-3-fr",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Black Mountains - Valak Mountain/Night",
    "localizedTitle": "Black Mountains - Valak Mountain/Night",
    "file": "20-08. Black Mountains - Valak Mountain - Night.mp3",
    "duration": 242,
    "game": "xenoblade-3-fr",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Black Mountains - Prison Island",
    "localizedTitle": "Black Mountains - Prison Island",
    "file": "20-09. Black Mountains - Prison Island.mp3",
    "duration": 294,
    "game": "xenoblade-3-fr",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Black Mountains - Prison Island/Night",
    "localizedTitle": "Black Mountains - Prison Island/Night",
    "file": "20-10. Black Mountains - Prison Island - Night.mp3",
    "duration": 244,
    "game": "xenoblade-3-fr",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Redeem the Future",
    "localizedTitle": "Redeem the Future",
    "file": "20-11. Redeem the Future.mp3",
    "duration": 223,
    "game": "xenoblade-3-fr",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Redeem the Future - Finale",
    "localizedTitle": "Redeem the Future - Finale",
    "file": "20-12. Redeem the Future - Finale.mp3",
    "duration": 234,
    "game": "xenoblade-3-fr",
    "artist": "Manami Kiyota"
  },
  {
    "title": "Two Worlds and Two Hearts",
    "localizedTitle": "Two Worlds and Two Hearts",
    "file": "20-13. Two Worlds and Two Hearts.mp3",
    "duration": 192,
    "game": "xenoblade-3-fr",
    "artist": "Mariam Abounnasr"
  },
  {
    "title": "Future Awaits",
    "localizedTitle": "Future Awaits",
    "file": "20-14. Future Awaits.mp3",
    "duration": 285,
    "game": "xenoblade-3-fr",
    "artist": "Joanne Hogg"
  },
];

// xenoblade-x
const SONGS_XENOBLADE_X = [
  {
    "title": "no1=CODENAMEZ",
    "localizedTitle": "Codename Z",
    "file": "1-01. no1=CODENAMEZ.mp3",
    "duration": 314,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "no2=THEMEX",
    "localizedTitle": "Theme X",
    "file": "1-02. no2=THEMEX.mp3",
    "duration": 320,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "no3=NO.EX01",
    "localizedTitle": "No.EX 01",
    "file": "1-03. no3=NO.EX01.mp3",
    "duration": 256,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "no4=D91M",
    "localizedTitle": "Requiem",
    "file": "1-04. no4=D91M.mp3",
    "duration": 299,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "no5=KAKU-WEST＊→▲★★KAI",
    "localizedTitle": "Kakusei Houkai",
    "file": "1-05. no5=KAKU-WEST＊→▲★★KAI.mp3",
    "duration": 365,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "no6=LP",
    "localizedTitle": "LP",
    "file": "1-06. no6=LP.mp3",
    "duration": 286,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "no7=G-LOW-S→F.S.K.O",
    "localizedTitle": "Growth F.S.K.O",
    "file": "1-07. no7=G-LOW-S→F.S.K.O.mp3",
    "duration": 328,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "no8=UN↑口and巨DIE",
    "localizedTitle": "Michi Kyodai",
    "file": "1-08. no8=UN↑口and巨DIE.mp3",
    "duration": 308,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "no9=MONOX",
    "localizedTitle": "Mono X",
    "file": "1-09. no9=MONOX.mp3",
    "duration": 197,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "no10=CR17S19S8",
    "localizedTitle": "CR17S19S8",
    "file": "1-10. no10=CR17S19S8.mp3",
    "duration": 357,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "no11=RE:ARR.X",
    "localizedTitle": "Re:Arr X",
    "file": "1-11. no11=REARR.X.mp3",
    "duration": 370,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "Your Voice",
    "localizedTitle": "Your Voice",
    "file": "1-12. Your Voice.mp3",
    "duration": 302,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Mika Kobayashi"
  },
  {
    "title": "Wir fliegen",
    "localizedTitle": "Wir fliegen",
    "file": "1-13. Wir fliegen.mp3",
    "duration": 297,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Cyua"
  },
  {
    "title": "So nah, so fern",
    "localizedTitle": "So nah, so fern",
    "file": "1-14. So nah, so fern.mp3",
    "duration": 285,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Mika Kobayashi"
  },
  {
    "title": "NEMOUSU秘OUS",
    "localizedTitle": "NEMOUSU秘OUS",
    "file": "1-15. NEMOUSU秘OUS.mp3",
    "duration": 296,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "Black tar",
    "localizedTitle": "Black tar",
    "file": "2-01. Black tar.mp3",
    "duration": 367,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "mpi"
  },
  {
    "title": "z5m20i12r04a28",
    "localizedTitle": "Z5 Mira",
    "file": "2-02. z5m20i12r04a28.mp3",
    "duration": 297,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "z10b2r0i1e2f0i9n1g3",
    "localizedTitle": "Z10 Briefing",
    "file": "2-03. z10b2r0i1e2f0i9n1g3.mp3",
    "duration": 269,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "Uncontrollable",
    "localizedTitle": "Uncontrollable",
    "file": "2-04. Uncontrollable.mp3",
    "duration": 228,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Mika Kobayashi & mpi"
  },
  {
    "title": "z15f20i12e09l14d",
    "localizedTitle": "Z15 Field",
    "file": "2-05. z15f20i12e09l14d.mp3",
    "duration": 379,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "z39b20co13mi01cal09",
    "localizedTitle": "Z39B Comical",
    "file": "2-06. z39b20co13mi01cal09.mp3",
    "duration": 227,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "By my side",
    "localizedTitle": "By my side",
    "file": "2-07. By my side.mp3",
    "duration": 189,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Aimee Blackschleger"
  },
  {
    "title": "z?2f0i1e2l0d914",
    "localizedTitle": "Z ? Field",
    "file": "2-08. z2f0i1e2l0d914.mp3",
    "duration": 156,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "z37b20a13t01t08le",
    "localizedTitle": "Z37 Battle",
    "file": "2-09. z37b20a13t01t08le.mp3",
    "duration": 188,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "z30huri2ba0tt12le1110",
    "localizedTitle": "Z30 Furi Battle",
    "file": "2-10. z30huri2ba0tt12le1110.mp3",
    "duration": 171,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "z12e201v2e091n4t",
    "localizedTitle": "Z12 Event",
    "file": "2-11. z12e201v2e091n4t.mp3",
    "duration": 411,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "z29ba2t0t1l301e17",
    "localizedTitle": "Z29 Battle",
    "file": "2-12. z29ba2t0t1l301e17.mp3",
    "duration": 172,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "z16b2gu012ro09u1su4",
    "localizedTitle": "Z16B Growth",
    "file": "2-13. z16b2gu012ro09u1su4.mp3",
    "duration": 172,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "z13e20v12e09n14t",
    "localizedTitle": "Z13 Event",
    "file": "2-14. z13e20v12e09n14t.mp3",
    "duration": 356,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "z7b2012lp0427arr",
    "localizedTitle": "Z7B LP Arrange",
    "file": "2-15. z7b2012lp0427arr.mp3",
    "duration": 142,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "In the forest",
    "localizedTitle": "In the forest",
    "file": "2-16. In the forest.mp3",
    "duration": 314,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "mpi"
  },
  {
    "title": "z23s20a12m0a9-1r4u",
    "localizedTitle": "Z23 Samaar",
    "file": "2-17. z23s20a12m0a9-1r4u.mp3",
    "duration": 296,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "The way",
    "localizedTitle": "The way",
    "file": "2-18. The way.mp3",
    "duration": 336,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Sayulee"
  },
  {
    "title": "The key we've lost",
    "localizedTitle": "The key we've lost",
    "file": "3-01. The key we've lost.mp3",
    "duration": 372,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Mika Kobayashi"
  },
  {
    "title": "N周L辺A",
    "localizedTitle": "NLA Shuuhen",
    "file": "3-02. N周L辺A.mp3",
    "duration": 318,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "N木ig木ht木L",
    "localizedTitle": "Yakou Mori",
    "file": "3-03. N木ig木ht木L.mp3",
    "duration": 330,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "N市L街A",
    "localizedTitle": "NLA Shigai",
    "file": "3-04. N市L街A.mp3",
    "duration": 307,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "亡KEI却KOKU心",
    "localizedTitle": "Boukyaku Keikoku",
    "file": "3-05. 亡KEI却KOKU心.mp3",
    "duration": 347,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "Melancholia",
    "localizedTitle": "Melancholia",
    "file": "3-06. Melancholia.mp3",
    "duration": 250,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Aimee Blackschleger"
  },
  {
    "title": "fiKAIeldJOU",
    "localizedTitle": "Field Kaijou",
    "file": "3-07. fiKAIeldJOU.mp3",
    "duration": 377,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "aBOreSSs",
    "localizedTitle": "Ares Boss",
    "file": "3-08. aBOreSSs.mp3",
    "duration": 336,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "MNN＋@0・",
    "localizedTitle": "Ma-non",
    "file": "3-09. MNN＋@0・.mp3",
    "duration": 351,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "In the forest <X→Z ver.>",
    "localizedTitle": "In the forest <X/Y ver.>",
    "file": "3-10. In the forest X→Z ver..mp3",
    "duration": 288,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "46-:ri9",
    "localizedTitle": "Shiro no Tairiku",
    "file": "3-11. 46-ri9.mp3",
    "duration": 312,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "96-:rip",
    "localizedTitle": "Kuro no Tairiku",
    "file": "3-12. 96-rip.mp3",
    "duration": 354,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "raTEoREkiSImeAra",
    "localizedTitle": "raTEoREkiSImeAra",
    "file": "3-13. raTEoREkiSImeAra.mp3",
    "duration": 409,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "Don't worry",
    "localizedTitle": "Don't worry",
    "file": "3-14. Don't worry.mp3",
    "duration": 236,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Aimee Blackschleger"
  },
  {
    "title": "PianoX1",
    "localizedTitle": "PianoX1",
    "file": "4-01. PianoX1.mp3",
    "duration": 232,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "PianoX2",
    "localizedTitle": "PianoX2",
    "file": "4-02. PianoX2.mp3",
    "duration": 233,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "PianoX3",
    "localizedTitle": "PianoX3",
    "file": "4-03. PianoX3.mp3",
    "duration": 175,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "X-BT1",
    "localizedTitle": "X-BT1",
    "file": "4-04. X-BT1.mp3",
    "duration": 118,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "X-BT2",
    "localizedTitle": "X-BT2",
    "file": "4-05. X-BT2.mp3",
    "duration": 297,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "X-BT3",
    "localizedTitle": "X-BT3",
    "file": "4-06. X-BT3.mp3",
    "duration": 283,
    "game": "xenoblade-x",
    "composer": "Hiroyuki Sawano",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "X-BT4",
    "localizedTitle": "X-BT4",
    "file": "4-07. X-BT4.mp3",
    "duration": 300,
    "game": "xenoblade-x",
    "composer": "Hiroyuki Sawano",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "In the forest (no vocal effects ver.)",
    "localizedTitle": "In the forest (no vocal effects ver.)",
    "file": "4-08. In the forest (no vocal effects ver.).mp3",
    "duration": 313,
    "game": "xenoblade-x",
    "composer": "Hiroyuki Sawano",
    "artist": "Hiroyuki SAWANO"
  },
];

// xenoblade-x-de
const SONGS_XENOBLADE_X_DE = [
  {
    "title": "Don't worry <2XDv>",
    "localizedTitle": "Don't worry <2XDv>",
    "file": "5-01. Don't worry 2XDv.mp3",
    "duration": 235,
    "game": "xenoblade-x-de",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "Don't worry <2XDv> (Instrumental ver.)",
    "localizedTitle": "Don't worry <2XDv> (Instrumental ver.)",
    "file": "5-02. Don't worry 2XDv (Instrumental ver.).mp3",
    "duration": 235,
    "game": "xenoblade-x-de",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "2S-FIELD",
    "localizedTitle": "Volitaris Field",
    "file": "5-03. 2S-FIELD.mp3",
    "duration": 165,
    "game": "xenoblade-x-de",
    "composer": "Misaki Umase",
    "artist": "Misaki Umase"
  },
  {
    "title": "2D-BATTLE",
    "localizedTitle": "Volitaris Battle",
    "file": "5-04. 2D-BATTLE.mp3",
    "duration": 170,
    "game": "xenoblade-x-de",
    "composer": "Misaki Umase",
    "artist": "Misaki Umase"
  },
  {
    "title": "2DXLB (Instrumental ver.)",
    "localizedTitle": "2DXLB (Instrumental ver.)",
    "file": "5-05. 2DXLB (Instrumental ver.).mp3",
    "duration": 192,
    "game": "xenoblade-x-de",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "2DXLB",
    "localizedTitle": "2DXLB",
    "file": "5-06. 2DXLB.mp3",
    "duration": 188,
    "game": "xenoblade-x-de",
    "composer": "Hiroyuki SAWANO",
    "artist": "Laco"
  },
  {
    "title": "The key we've lost <2XDv>",
    "localizedTitle": "The key we've lost <2XDv>",
    "file": "5-07. The key we've lost 2XDv.mp3",
    "duration": 200,
    "game": "xenoblade-x-de",
    "composer": "Hiroyuki SAWANO",
    "artist": "Laco"
  },
  {
    "title": "2N-ERA",
    "localizedTitle": "2N-ERA",
    "file": "5-08. 2N-ERA.mp3",
    "duration": 381,
    "game": "xenoblade-x-de",
    "composer": "Misaki Umase",
    "artist": "Misaki Umase"
  },
  {
    "title": "2D-TRAVELOGUE",
    "localizedTitle": "2D-TRAVELOGUE",
    "file": "5-09. 2D-TRAVELOGUE.mp3",
    "duration": 447,
    "game": "xenoblade-x-de",
    "composer": "Misaki Umase",
    "artist": "Misaki Umase"
  },
];

// xenogears
const SONGS_XENOGEARS = [
  {
    "title": "Dark Daybreak",
    "localizedTitle": "Dark Dawn",
    "file": "1-01. Dark Daybreak.mp3",
    "duration": 292,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "STARS OF TEARS (OUT TAKE)",
    "localizedTitle": "STARS OF TEARS (OUT TAKE)",
    "file": "1-02. STARS OF TEARS (OUT TAKE).mp3",
    "duration": 177,
    "game": "xenogears",
    "artist": "Joanne Hogg"
  },
  {
    "title": "Bonds of Sea and Flame",
    "localizedTitle": "Bonds of Sea and Flame",
    "file": "1-03. Bonds of Sea and Flame.mp3",
    "duration": 189,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "My Village is Number One!",
    "localizedTitle": "Village Pride",
    "file": "1-04. My Village is Number One!.mp3",
    "duration": 244,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Valley Where the Wind Is Born",
    "localizedTitle": "Wind from the Valley",
    "file": "1-05. Valley Where the Wind Is Born.mp3",
    "duration": 153,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Faraway Promise",
    "localizedTitle": "A Distant Promise",
    "file": "1-06. Faraway Promise.mp3",
    "duration": 112,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Steel Giant",
    "localizedTitle": "Steel Giants",
    "file": "1-07. Steel Giant.mp3",
    "duration": 149,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "The Blackmoon Forest",
    "localizedTitle": "The Blackmoon Forest",
    "file": "1-08. The Blackmoon Forest.mp3",
    "duration": 244,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Where the Egg of Dreams Hatches",
    "localizedTitle": "Where Dreams Hatch",
    "file": "1-09. Where the Egg of Dreams Hatches.mp3",
    "duration": 183,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Dozing Off (Short Version)",
    "localizedTitle": "Doze (Short Version)",
    "file": "1-10. Dozing Off (Short Version).mp3",
    "duration": 10,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Dazil, Town of Burning Sands",
    "localizedTitle": "Desert City Dazil",
    "file": "1-11. Dazil, Town of Burning Sands.mp3",
    "duration": 208,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Aspiration",
    "localizedTitle": "Adoration",
    "file": "1-12. Aspiration.mp3",
    "duration": 189,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Grahf, Ruler of Darkness",
    "localizedTitle": "Grahf -Ruler of Darkness-",
    "file": "1-13. Grahf, Ruler of Darkness.mp3",
    "duration": 231,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Fuse",
    "localizedTitle": "Fuse",
    "file": "1-14. Fuse.mp3",
    "duration": 154,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "After the Soldiers' Dreams",
    "localizedTitle": "Dreams of the Brave",
    "file": "1-15. After the Soldiers' Dreams.mp3",
    "duration": 309,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Unstealable Jewel",
    "localizedTitle": "Intangible Treasure",
    "file": "1-16. Unstealable Jewel.mp3",
    "duration": 207,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Aveh, The Ancient Dance",
    "localizedTitle": "Ancient Dance of Aveh",
    "file": "1-17. Aveh, The Ancient Dance.mp3",
    "duration": 111,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Invasion",
    "localizedTitle": "Infiltration",
    "file": "1-18. Invasion.mp3",
    "duration": 193,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Stage of Death",
    "localizedTitle": "Deadly Dance",
    "file": "1-19. Stage of Death.mp3",
    "duration": 159,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "In A Dark Slumber...",
    "localizedTitle": "Dark Slumber",
    "file": "1-20. In A Dark Slumber....mp3",
    "duration": 23,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "The Gentle Breeze Sings",
    "localizedTitle": "Windy Song",
    "file": "1-21. The Gentle Breeze Sings.mp3",
    "duration": 250,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Our Wounded Bodies Shall Advance Towards the Light",
    "localizedTitle": "We Wounded Follow the Light",
    "file": "1-22. Our Wounded Bodies Shall Advance Towards the Light.mp3",
    "duration": 117,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "lost... Broken Shards",
    "localizedTitle": "Lost... -Screeching Shards-",
    "file": "1-23. lost... Broken Shards.mp3",
    "duration": 66,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Thames, Spirit of the Men of the Sea",
    "localizedTitle": "The Thames -Men of the Sea-",
    "file": "1-24. Thames, Spirit of the Men of the Sea.mp3",
    "duration": 231,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "The Blue Traveler",
    "localizedTitle": "Blue Traveler",
    "file": "1-25. The Blue Traveler.mp3",
    "duration": 192,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "In a Prison of Peace and Regret",
    "localizedTitle": "Cage of Remorse and Relief",
    "file": "2-01. In a Prison of Peace and Regret.mp3",
    "duration": 163,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Jaws of Ice",
    "localizedTitle": "Icy Chin",
    "file": "2-02. Jaws of Ice.mp3",
    "duration": 174,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Crimson Knight",
    "localizedTitle": "Blazing Knights",
    "file": "2-03. Crimson Knight.mp3",
    "duration": 163,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "October Mermaid",
    "localizedTitle": "October Mermaid",
    "file": "2-04. October Mermaid.mp3",
    "duration": 268,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "The Wind Calls to Shevat in the Blue Sky",
    "localizedTitle": "Shevat -The Wind Calls-",
    "file": "2-05. The Wind Calls to Shevat in the Blue Sky.mp3",
    "duration": 212,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "The Sky, the Clouds, and You",
    "localizedTitle": "With the Sky, the Clouds, and You",
    "file": "2-06. The Sky, the Clouds, and You.mp3",
    "duration": 156,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "A Gathering of Stars in the Night Sky",
    "localizedTitle": "Gather Up the Night Stars",
    "file": "2-07. A Gathering of Stars in the Night Sky.mp3",
    "duration": 185,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Tears of the Stars, Thoughts of the People",
    "localizedTitle": "Earthly Tears, Mortal Thoughts",
    "file": "2-08. Tears of the Stars, Thoughts of the People.mp3",
    "duration": 215,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Flight",
    "localizedTitle": "Soaring",
    "file": "2-09. Flight.mp3",
    "duration": 289,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Wings",
    "localizedTitle": "Wings",
    "file": "2-10. Wings.mp3",
    "duration": 141,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Solaris, Celestial Paradise",
    "localizedTitle": "Solaris -Supernal Paradise-",
    "file": "2-11. Solaris, Celestial Paradise.mp3",
    "duration": 224,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Dozing Off (Long Version)",
    "localizedTitle": "Doze (Long Version)",
    "file": "2-12. Dozing Off (Long Version).mp3",
    "duration": 14,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "The One Who is Torn Apart",
    "localizedTitle": "Torn",
    "file": "2-13. The One Who is Torn Apart.mp3",
    "duration": 307,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "A Prayer for the Joy Man Desires",
    "localizedTitle": "Prayers -The Joy of Hope-",
    "file": "2-14. A Prayer for the Joy Man Desires.mp3",
    "duration": 206,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Premonition",
    "localizedTitle": "Foreboding",
    "file": "2-15. Premonition.mp3",
    "duration": 295,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Awakening",
    "localizedTitle": "Awakening",
    "file": "2-16. Awakening.mp3",
    "duration": 263,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "One Who Bares Fangs at God",
    "localizedTitle": "Fangs Bared at God",
    "file": "2-17. One Who Bares Fangs at God.mp3",
    "duration": 367,
    "game": "xenogears",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "The Beginning and the End",
    "localizedTitle": "The Beginning and the End",
    "file": "2-18. The Beginning and the End.mp3",
    "duration": 277,
    "game": "xenogears",
    "artist": "The Great Voices of Bulgaria"
  },
  {
    "title": "SMALL TWO OF PIECES ~Broken Shards~",
    "localizedTitle": "Small Two of Pieces -Screeching Shards-",
    "file": "2-19. SMALL TWO OF PIECES ~Broken Shards~.mp3",
    "duration": 380,
    "game": "xenogears",
    "artist": "Joanne Hogg"
  },
];

// xenosaga-1
const SONGS_XENOSAGA_1 = [
  {
    "title": "Shion ~Memories of the Past~",
    "localizedTitle": "Shion ~Memories of the Past~",
    "file": "1-01 Shion ~Memories of the Past~.mp3",
    "duration": 75,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Prologue",
    "localizedTitle": "Prologue",
    "file": "1-02 Prologue.mp3",
    "duration": 274,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Gnosis",
    "localizedTitle": "Gnosis",
    "file": "1-03 Gnosis.mp3",
    "duration": 265,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "U-TIC Organization",
    "localizedTitle": "U-TIC Organization",
    "file": "1-04 U-TIC Organization.mp3",
    "duration": 168,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "The Girl Who Closed Her Heart",
    "localizedTitle": "The Girl Who Closed Her Heart",
    "file": "1-05 The Girl Who Closed Her Heart.mp3",
    "duration": 134,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Ormus",
    "localizedTitle": "Ormus",
    "file": "1-06 Ormus.mp3",
    "duration": 149,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Nephilim",
    "localizedTitle": "Nephilim",
    "file": "1-07 Nephilim.mp3",
    "duration": 153,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Warmth <New Recording>",
    "localizedTitle": "Warmth <New Recording>",
    "file": "1-08 Warmth _New Recording_.mp3",
    "duration": 121,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "The Resurrection",
    "localizedTitle": "The Resurrection",
    "file": "1-09 The Resurrection.mp3",
    "duration": 113,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "The Beach of Nothingness <New Recording>",
    "localizedTitle": "The Beach of Nothingness <New Recording>",
    "file": "1-10 The Beach of Nothingness _New Recording_.mp3",
    "duration": 155,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Green Sleeves <New Recording>",
    "localizedTitle": "Green Sleeves <New Recording>",
    "file": "1-11 Green Sleeves _New Recording_.mp3",
    "duration": 146,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "KOS-MOS",
    "localizedTitle": "KOS-MOS",
    "file": "1-12 KOS-MOS.mp3",
    "duration": 147,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "The Miracle",
    "localizedTitle": "The Miracle",
    "file": "1-13 The Miracle.mp3",
    "duration": 112,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Zarathustra",
    "localizedTitle": "Zarathustra",
    "file": "1-14 Zarathustra.mp3",
    "duration": 185,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Ω",
    "localizedTitle": "Ω",
    "file": "1-15 Ω.mp3",
    "duration": 248,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Escape",
    "localizedTitle": "Escape",
    "file": "1-16 Escape.mp3",
    "duration": 152,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Pain",
    "localizedTitle": "Pain",
    "file": "1-17 Pain.mp3",
    "duration": 338,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Kokoro",
    "localizedTitle": "Kokoro",
    "file": "1-18 Kokoro.mp3",
    "duration": 337,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Shion ~Emotion~",
    "localizedTitle": "Shion ~Emotion~",
    "file": "1-19 Shion ~Emotion~.mp3",
    "duration": 84,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "World to be Born",
    "localizedTitle": "World to be Born",
    "file": "1-20 World to be Born.mp3",
    "duration": 199,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Pain -piano version- <New Recording>",
    "localizedTitle": "Pain -piano version- <New Recording>",
    "file": "1-21 Pain -piano version- _New Recording_.mp3",
    "duration": 165,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Opening",
    "localizedTitle": "Opening",
    "file": "2-01 Opening.mp3",
    "duration": 242,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Battle",
    "localizedTitle": "Battle",
    "file": "2-02 Battle.mp3",
    "duration": 179,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Battle's End",
    "localizedTitle": "Battle's End",
    "file": "2-03 Battle's End.mp3",
    "duration": 42,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Startup Test",
    "localizedTitle": "Startup Test",
    "file": "2-04 Startup Test.mp3",
    "duration": 142,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Reminiscence",
    "localizedTitle": "Reminiscence",
    "file": "2-05 Reminiscence.mp3",
    "duration": 198,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Awakening",
    "localizedTitle": "Awakening",
    "file": "2-06 Awakening.mp3",
    "duration": 140,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Shion's Crisis",
    "localizedTitle": "Shion's Crisis",
    "file": "2-07 Shion's Crisis.mp3",
    "duration": 113,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Battling KOS-MOS",
    "localizedTitle": "Battling KOS-MOS",
    "file": "2-08 Battling KOS-MOS.mp3",
    "duration": 199,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Sorrow",
    "localizedTitle": "Sorrow",
    "file": "2-09 Sorrow.mp3",
    "duration": 234,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Life or Death",
    "localizedTitle": "Life or Death",
    "file": "2-10 Life or Death.mp3",
    "duration": 195,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Game Over",
    "localizedTitle": "Game Over",
    "file": "2-11 Game Over.mp3",
    "duration": 41,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Margulis",
    "localizedTitle": "Margulis",
    "file": "2-12 Margulis.mp3",
    "duration": 269,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Pursued Spaceship",
    "localizedTitle": "Pursued Spaceship",
    "file": "2-13 Pursued Spaceship.mp3",
    "duration": 222,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Relief",
    "localizedTitle": "Relief",
    "file": "2-14 Relief.mp3",
    "duration": 167,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Everyday",
    "localizedTitle": "Everyday",
    "file": "2-15 Everyday.mp3",
    "duration": 114,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "U.M.N. MODE",
    "localizedTitle": "U.M.N. MODE",
    "file": "2-16 U.M.N. MODE.mp3",
    "duration": 159,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Durandal",
    "localizedTitle": "Durandal",
    "file": "2-17 Durandal.mp3",
    "duration": 153,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Invading the Enemy Ship",
    "localizedTitle": "Invading the Enemy Ship",
    "file": "2-18 Invading the Enemy Ship.mp3",
    "duration": 40,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Kookai Foundation",
    "localizedTitle": "Kookai Foundation",
    "file": "2-19 Kookai Foundation.mp3",
    "duration": 117,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Anxiety",
    "localizedTitle": "Anxiety",
    "file": "2-20 Anxiety.mp3",
    "duration": 247,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Panic",
    "localizedTitle": "Panic",
    "file": "2-21 Panic.mp3",
    "duration": 146,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Song of Nephilim",
    "localizedTitle": "Song of Nephilim",
    "file": "2-22 Song of Nephilim.mp3",
    "duration": 66,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Inner Space",
    "localizedTitle": "Inner Space",
    "file": "2-23 Inner Space.mp3",
    "duration": 107,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Albedo",
    "localizedTitle": "Albedo",
    "file": "2-24 Albedo.mp3",
    "duration": 230,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Proto Merkabah",
    "localizedTitle": "Proto Merkabah",
    "file": "2-25 Proto Merkabah.mp3",
    "duration": 330,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
  {
    "title": "Last Battle",
    "localizedTitle": "Last Battle",
    "file": "2-26 Last Battle.mp3",
    "duration": 304,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Yasunori Mitsuda"
  },
];

// xenosaga-2 (gamerip)
const SONGS_XENOSAGA_2_GAMERIP = [
  {
    "title": "Old Miltia (14 Years Ago)",
    "localizedTitle": "Old Miltia (14 Years Ago)",
    "file": "1-01. Old Miltia (14 Years Ago).mp3",
    "duration": 239,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "E.S. Battle",
    "localizedTitle": "E.S. Battle",
    "file": "1-02. E.S. Battle.mp3",
    "duration": 214,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Victory Theme",
    "localizedTitle": "Victory Theme",
    "file": "1-03. Victory Theme.mp3",
    "duration": 51,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Character Battle",
    "localizedTitle": "Character Battle",
    "file": "1-04. Character Battle.mp3",
    "duration": 219,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Second Miltia",
    "localizedTitle": "Second Miltia",
    "file": "1-06. Second Miltia.mp3",
    "duration": 176,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Evading the U-TIC Organization",
    "localizedTitle": "Evading the U-TIC Organization",
    "file": "1-07. Evading the U-TIC Organization.mp3",
    "duration": 276,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Minor Boss Battle",
    "localizedTitle": "Minor Boss Battle",
    "file": "1-08. Minor Boss Battle.mp3",
    "duration": 191,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Records",
    "localizedTitle": "Records",
    "file": "1-09. Records.mp3",
    "duration": 86,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Moby Dick's Cafe",
    "localizedTitle": "Moby Dick's Cafe",
    "file": "1-10. Moby Dick's Cafe.mp3",
    "duration": 350,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Uzuki Residence",
    "localizedTitle": "Uzuki Residence",
    "file": "1-11. Uzuki Residence.mp3",
    "duration": 236,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "U.M.N. Control Center",
    "localizedTitle": "U.M.N. Control Center",
    "file": "1-12. U.M.N. Control Center.mp3",
    "duration": 159,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Vector Industries, Second Division",
    "localizedTitle": "Vector Industries, Second Division",
    "file": "1-13. Vector Industries, Second Division.mp3",
    "duration": 197,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Subconscious Domain (Sakura's World)",
    "localizedTitle": "Subconscious Domain (Sakura's World)",
    "file": "1-14. Subconscious Domain (Sakura's World).mp3",
    "duration": 186,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Subconscious Domain (Summer)",
    "localizedTitle": "Subconscious Domain (Summer)",
    "file": "1-15. Subconscious Domain (Summer).mp3",
    "duration": 237,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Subconscious Domain (Winter)",
    "localizedTitle": "Subconscious Domain (Winter)",
    "file": "1-16. Subconscious Domain (Winter).mp3",
    "duration": 319,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "The Elsa von Brabant",
    "localizedTitle": "The Elsa von Brabant",
    "file": "2-01. The Elsa von Brabant.mp3",
    "duration": 200,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Robot Academy",
    "localizedTitle": "Robot Academy",
    "file": "2-02. Robot Academy.mp3",
    "duration": 117,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Ormus Stronghold",
    "localizedTitle": "Ormus Stronghold",
    "file": "2-03. Ormus Stronghold.mp3",
    "duration": 207,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Major Boss Battle",
    "localizedTitle": "Major Boss Battle",
    "file": "2-04. Major Boss Battle.mp3",
    "duration": 243,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Ormus Stronghold - Countdown to Self-Destruct",
    "localizedTitle": "Ormus Stronghold - Countdown to Self-Destruct",
    "file": "2-05. Ormus Stronghold - Countdown to Self-Destruct.mp3",
    "duration": 200,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "The Durandal",
    "localizedTitle": "The Durandal",
    "file": "2-06. The Durandal.mp3",
    "duration": 224,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Kukai Foundation",
    "localizedTitle": "Kukai Foundation",
    "file": "2-07. Kukai Foundation.mp3",
    "duration": 182,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Foundation Fishing Lab",
    "localizedTitle": "Foundation Fishing Lab",
    "file": "2-08. Foundation Fishing Lab.mp3",
    "duration": 195,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Old Miltia (Submerged City)",
    "localizedTitle": "Old Miltia (Submerged City)",
    "file": "2-09. Old Miltia (Submerged City).mp3",
    "duration": 207,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Labyrinthos",
    "localizedTitle": "Labyrinthos",
    "file": "2-10. Labyrinthos.mp3",
    "duration": 219,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Omega System",
    "localizedTitle": "Omega System",
    "file": "2-11. Omega System.mp3",
    "duration": 218,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Space-Time Anomaly",
    "localizedTitle": "Space-Time Anomaly",
    "file": "2-12. Space-Time Anomaly.mp3",
    "duration": 271,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Final Battle",
    "localizedTitle": "Final Battle",
    "file": "2-13. Final Battle.mp3",
    "duration": 360,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Desert",
    "localizedTitle": "Desert",
    "file": "2-14. Desert.mp3",
    "duration": 283,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Industrial Plant",
    "localizedTitle": "Industrial Plant",
    "file": "2-15. Industrial Plant.mp3",
    "duration": 188,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "artist": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
];

// xenosaga-2 (movie)
const SONGS_XENOSAGA_2_MOVIE = [
  {
    "title": "in the beginning, there was....",
    "localizedTitle": "in the beginning, there was....",
    "file": "1-01. in the beginning, there was.....mp3",
    "duration": 120,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "first meeting",
    "localizedTitle": "first meeting",
    "file": "1-02. first meeting.mp3",
    "duration": 168,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Xenosaga II opening theme",
    "localizedTitle": "Xenosaga II opening theme",
    "file": "1-03. Xenosaga II opening theme.mp3",
    "duration": 152,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "assault",
    "localizedTitle": "assault",
    "file": "1-04. assault.mp3",
    "duration": 221,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "strain-Jin",
    "localizedTitle": "strain-Jin",
    "file": "1-05. strain-Jin.mp3",
    "duration": 235,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "here he comes",
    "localizedTitle": "here he comes",
    "file": "1-06. here he comes.mp3",
    "duration": 117,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "fatal fight (Jin & Margulis)",
    "localizedTitle": "fatal fight (Jin & Margulis)",
    "file": "1-07. fatal fight (Jin & Margulis).mp3",
    "duration": 253,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "R&D report",
    "localizedTitle": "R&D report",
    "file": "1-08. R&D report.mp3",
    "duration": 111,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "chase",
    "localizedTitle": "chase",
    "file": "1-09. chase.mp3",
    "duration": 159,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "surrounded",
    "localizedTitle": "surrounded",
    "file": "1-10. surrounded.mp3",
    "duration": 175,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "lamentation",
    "localizedTitle": "lamentation",
    "file": "1-11. lamentation.mp3",
    "duration": 324,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Albedo",
    "localizedTitle": "Albedo",
    "file": "1-12. Albedo.mp3",
    "duration": 119,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "communication breakdown",
    "localizedTitle": "communication breakdown",
    "file": "1-13. communication breakdown.mp3",
    "duration": 253,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Sakura (theme-piano ver.)",
    "localizedTitle": "Sakura (theme-piano ver.)",
    "file": "1-14. Sakura (theme-piano ver.).mp3",
    "duration": 98,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Sakura #2 (theme-simple voc.ver.)",
    "localizedTitle": "Sakura #2 (theme-simple voc.ver.)",
    "file": "1-15. Sakura #2 (theme-simple voc.ver.).mp3",
    "duration": 152,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "strained",
    "localizedTitle": "strained",
    "file": "1-16. strained.mp3",
    "duration": 68,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Jr. #2",
    "localizedTitle": "Jr. #2",
    "file": "1-17. Jr. #2.mp3",
    "duration": 101,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "strained #2 - Albedo #2",
    "localizedTitle": "strained #2 - Albedo #2",
    "file": "1-18. strained #2 - Albedo #2.mp3",
    "duration": 235,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "in the beginning, there was... #2",
    "localizedTitle": "in the beginning, there was... #2",
    "file": "1-19. in the beginning, there was... #2.mp3",
    "duration": 120,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "battle of Elsa",
    "localizedTitle": "battle of Elsa",
    "file": "1-20. battle of Elsa.mp3",
    "duration": 182,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "here she comes (KOS-MOS)",
    "localizedTitle": "here she comes (KOS-MOS)",
    "file": "1-21. here she comes (KOS-MOS).mp3",
    "duration": 158,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "battle of Elsa #2",
    "localizedTitle": "battle of Elsa #2",
    "file": "1-22. battle of Elsa #2.mp3",
    "duration": 129,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "gate out",
    "localizedTitle": "gate out",
    "file": "1-23. gate out.mp3",
    "duration": 209,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "here he comes #2",
    "localizedTitle": "here he comes #2",
    "file": "2-01. here he comes #2.mp3",
    "duration": 210,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "creeping fear",
    "localizedTitle": "creeping fear",
    "file": "2-02. creeping fear.mp3",
    "duration": 126,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "U-DO - Febronia",
    "localizedTitle": "U-DO - Febronia",
    "file": "2-03. U-DO - Febronia.mp3",
    "duration": 228,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "final crisis",
    "localizedTitle": "final crisis",
    "file": "2-04. final crisis.mp3",
    "duration": 134,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "presentiment - Jr.#3",
    "localizedTitle": "presentiment - Jr.#3",
    "file": "2-05. presentiment - Jr.#3.mp3",
    "duration": 195,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "a field of battle - bitter #2",
    "localizedTitle": "a field of battle - bitter #2",
    "file": "2-06. a field of battle - bitter #2.mp3",
    "duration": 176,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "inside - Sakura #3",
    "localizedTitle": "inside - Sakura #3",
    "file": "2-07. inside - Sakura #3.mp3",
    "duration": 84,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "I am free",
    "localizedTitle": "I am free",
    "file": "2-08. I am free.mp3",
    "duration": 100,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Sakura #4 (theme - gentle strings ver.)",
    "localizedTitle": "Sakura #4 (theme - gentle strings ver.)",
    "file": "2-09. Sakura #4 (theme - gentle strings ver.).mp3",
    "duration": 126,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Sweet Song (Xenosaga II ending theme)",
    "localizedTitle": "Sweet Song (Xenosaga II ending theme)",
    "file": "2-10. Sweet Song (Xenosaga II ending theme).mp3",
    "duration": 333,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Jr.",
    "localizedTitle": "Jr.",
    "file": "2-11. Jr..mp3",
    "duration": 206,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Jr. #4",
    "localizedTitle": "Jr. #4",
    "file": "2-12. Jr. #4.mp3",
    "duration": 157,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "fatal fight #2",
    "localizedTitle": "fatal fight #2",
    "file": "2-13. fatal fight #2.mp3",
    "duration": 140,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "bitter",
    "localizedTitle": "bitter",
    "file": "2-14. bitter.mp3",
    "duration": 173,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Nephilim",
    "localizedTitle": "Nephilim",
    "file": "2-15. Nephilim.mp3",
    "duration": 88,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "the image theme of Xenosaga II #piano ver.",
    "localizedTitle": "the image theme of Xenosaga II #piano ver.",
    "file": "2-16. the image theme of Xenosaga II #piano ver..mp3",
    "duration": 190,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "the image theme of Xenosaga II",
    "localizedTitle": "the image theme of Xenosaga II",
    "file": "2-17. the image theme of Xenosaga II.mp3",
    "duration": 204,
    "game": "xenosaga-2",
    "artist": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
];

// xenosaga-3
const SONGS_XENOSAGA_3 = [
  {
    "title": "I love you, sincerely (title screen ver.)",
    "localizedTitle": "I love you, sincerely (title screen ver.)",
    "file": "01. I love you, sincerely (title screen ver.).mp3",
    "duration": 190,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "The Body of the Saint",
    "localizedTitle": "The Body of the Saint",
    "file": "02. The Body of the Saint.mp3",
    "duration": 79,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "S-Line Division Infiltration",
    "localizedTitle": "S-Line Division Infiltration",
    "file": "03. S-Line Division Infiltration.mp3",
    "duration": 171,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Rolling Down the U.M.N. #2",
    "localizedTitle": "Rolling Down the U.M.N. #2",
    "file": "04. Rolling Down the U.M.N. #2.mp3",
    "duration": 210,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Fallout (original ver.)",
    "localizedTitle": "Fallout (original ver.)",
    "file": "05. Fallout (original ver.).mp3",
    "duration": 179,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Rolling Down the U.M.N. #3",
    "localizedTitle": "Rolling Down the U.M.N. #3",
    "file": "06. Rolling Down the U.M.N. #3.mp3",
    "duration": 104,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Discovered!",
    "localizedTitle": "Discovered!",
    "file": "07. Discovered!.mp3",
    "duration": 131,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Battleland #2",
    "localizedTitle": "Battleland #2",
    "file": "08. Battleland #2.mp3",
    "duration": 138,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Beach",
    "localizedTitle": "Beach",
    "file": "09. Beach.mp3",
    "duration": 151,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Shion's Flashback",
    "localizedTitle": "Shion's Flashback",
    "file": "10. Shion's Flashback.mp3",
    "duration": 147,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Margulis & Pellegri",
    "localizedTitle": "Margulis & Pellegri",
    "file": "11. Margulis & Pellegri.mp3",
    "duration": 177,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Floating Landmass Appears",
    "localizedTitle": "Floating Landmass Appears",
    "file": "12. Floating Landmass Appears.mp3",
    "duration": 10,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Survive ~ E.S. Battle",
    "localizedTitle": "Survive ~ E.S. Battle",
    "file": "13. Survive ~ E.S. Battle (extended).mp3",
    "duration": 344,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "The Battle of Your Soul (variation)",
    "localizedTitle": "The Battle of Your Soul (variation)",
    "file": "14. The Battle of Your Soul (variation).mp3",
    "duration": 207,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Fatal Fight #3 ~ Battle vs. E.S. Levi - Over The Floating Landmass",
    "localizedTitle": "Fatal Fight #3 ~ Battle vs. E.S. Levi - Over The Floating Landmass",
    "file": "15. Fatal Fight #3 ~ Battle vs. E.S. Levi - Over The Floating Landmass.mp3",
    "duration": 131,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Yuriev & Sellers",
    "localizedTitle": "Yuriev & Sellers",
    "file": "16. Yuriev & Sellers.mp3",
    "duration": 256,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Fifth Jerusalem",
    "localizedTitle": "Fifth Jerusalem",
    "file": "17. Fifth Jerusalem.mp3",
    "duration": 196,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Mobius Hotel",
    "localizedTitle": "Mobius Hotel",
    "file": "18. Mobius Hotel.mp3",
    "duration": 131,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Jingle",
    "localizedTitle": "Jingle",
    "file": "19. Jingle.mp3",
    "duration": 12,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "CAT Facility",
    "localizedTitle": "CAT Facility",
    "file": "20. CAT Facility.mp3",
    "duration": 111,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "T-elos (variation)",
    "localizedTitle": "T-elos (variation)",
    "file": "21. T-elos (variation).mp3",
    "duration": 144,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Juli's Briefing",
    "localizedTitle": "Juli's Briefing",
    "file": "22. Juli's Briefing.mp3",
    "duration": 131,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Maybe Tomorrow (strings ver.)",
    "localizedTitle": "Maybe Tomorrow (strings ver.)",
    "file": "23. Maybe Tomorrow (strings ver.).mp3",
    "duration": 55,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Cardinal Heinlein",
    "localizedTitle": "Cardinal Heinlein",
    "file": "24. Cardinal Heinlein.mp3",
    "duration": 100,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "I love you, sincerely (piano ver.)",
    "localizedTitle": "I love you, sincerely (piano ver.)",
    "file": "25. I love you, sincerely (piano ver.).mp3",
    "duration": 301,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Elsa - Start of CAT Infiltration",
    "localizedTitle": "Elsa - Start of CAT Infiltration",
    "file": "26. Elsa - Start of CAT Infiltration.mp3",
    "duration": 224,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Creeping Into",
    "localizedTitle": "Creeping Into",
    "file": "27. Creeping Into (extended).mp3",
    "duration": 276,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Minor Boss Battle",
    "localizedTitle": "Minor Boss Battle",
    "file": "28. Minor Boss Battle.mp3",
    "duration": 144,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "A New World (piano ver.)",
    "localizedTitle": "A New World (piano ver.)",
    "file": "01. A New World (piano ver.).mp3",
    "duration": 112,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "In a Limestone Cave",
    "localizedTitle": "In a Limestone Cave",
    "file": "02. In a Limestone Cave.mp3",
    "duration": 245,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Ancient Temple",
    "localizedTitle": "Ancient Temple",
    "file": "03. Ancient Temple.mp3",
    "duration": 192,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "T-elos's Challenge",
    "localizedTitle": "T-elos's Challenge",
    "file": "04. T-elos's Challenge.mp3",
    "duration": 114,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "T-elos #2 (variation)",
    "localizedTitle": "T-elos #2 (variation)",
    "file": "05. T-elos #2 (variation).mp3",
    "duration": 156,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "A New World (variation)",
    "localizedTitle": "A New World (variation)",
    "file": "06. A New World (variation).mp3",
    "duration": 50,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Old Miltia Forest",
    "localizedTitle": "Old Miltia Forest",
    "file": "07. Old Miltia Forest.mp3",
    "duration": 87,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Old Miltia Forest #2",
    "localizedTitle": "Old Miltia Forest #2",
    "file": "08. Old Miltia Forest #2.mp3",
    "duration": 87,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Rescue of Virgil",
    "localizedTitle": "Rescue of Virgil",
    "file": "09. Rescue of Virgil.mp3",
    "duration": 134,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Sneaking Around in Miltia",
    "localizedTitle": "Sneaking Around in Miltia",
    "file": "10. Sneaking Around in Miltia.mp3",
    "duration": 252,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Acute Neurosis Treatment Facility",
    "localizedTitle": "Acute Neurosis Treatment Facility",
    "file": "11. Acute Neurosis Treatment Facility.mp3",
    "duration": 191,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "On Our Ways",
    "localizedTitle": "On Our Ways",
    "file": "12. On Our Ways (extended).mp3",
    "duration": 233,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Joachim",
    "localizedTitle": "Joachim",
    "file": "13. Joachim.mp3",
    "duration": 256,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "She's Coming Back (variation)",
    "localizedTitle": "She's Coming Back (variation)",
    "file": "14. She's Coming Back (variation).mp3",
    "duration": 143,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Creeping Into #2",
    "localizedTitle": "Creeping Into #2",
    "file": "15. Creeping Into #2.mp3",
    "duration": 143,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Acute Neurosis Treatment Facility - Under Attack",
    "localizedTitle": "Acute Neurosis Treatment Facility - Under Attack",
    "file": "16. Acute Neurosis Treatment Facility - Under Attack.mp3",
    "duration": 169,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Joachim's Decision",
    "localizedTitle": "Joachim's Decision",
    "file": "17. Joachim's Decision.mp3",
    "duration": 130,
    "game": "xenosaga-3",
    "composer": "Yasunori Mitsuda",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Outrageous",
    "localizedTitle": "Outrageous",
    "file": "18. Outrageous (extended).mp3",
    "duration": 320,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Jin",
    "localizedTitle": "Jin",
    "file": "19. Jin.mp3",
    "duration": 69,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "The Harsh Truth (piano ver.)",
    "localizedTitle": "The Harsh Truth (piano ver.)",
    "file": "20. The Harsh Truth (piano ver.).mp3",
    "duration": 57,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Labyrinthos - Search for Shion",
    "localizedTitle": "Labyrinthos - Search for Shion",
    "file": "21. Labyrinthos - Search for Shion.mp3",
    "duration": 152,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Assault #2",
    "localizedTitle": "Assault #2",
    "file": "22. Assault #2.mp3",
    "duration": 196,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Testament (no vocals)",
    "localizedTitle": "Testament (no vocals)",
    "file": "23. Testament (no vocals).mp3",
    "duration": 203,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Virgil's Lament",
    "localizedTitle": "Virgil's Lament",
    "file": "24. Virgil's Lament.mp3",
    "duration": 148,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Song of Nephilim",
    "localizedTitle": "Song of Nephilim",
    "file": "25. Song of Nephilim.mp3",
    "duration": 157,
    "game": "xenosaga-3",
    "composer": "Yasunori Mitsuda",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "A Dark Omen #2 ~ Merkabah",
    "localizedTitle": "A Dark Omen #2 ~ Merkabah",
    "file": "26. A Dark Omen #2 ~ Merkabah.mp3",
    "duration": 170,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Survive #2 ~ Invasion of the Durandal",
    "localizedTitle": "Survive #2 ~ Invasion of the Durandal",
    "file": "27. Survive #2 ~ Invasion of the Durandal.mp3",
    "duration": 201,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Godsibb",
    "localizedTitle": "Godsibb",
    "file": "28. Godsibb (extended).mp3",
    "duration": 307,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "When the Grief Lets You Go",
    "localizedTitle": "When the Grief Lets You Go",
    "file": "01. When the Grief Lets You Go (extended).mp3",
    "duration": 122,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "chaos & Canaan",
    "localizedTitle": "chaos & Canaan",
    "file": "02. chaos & Canaan.mp3",
    "duration": 89,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Abel's Ark",
    "localizedTitle": "Abel's Ark",
    "file": "03. Abel's Ark.mp3",
    "duration": 175,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Battleland (variation)",
    "localizedTitle": "Battleland (variation)",
    "file": "04. Battleland (variation).mp3",
    "duration": 211,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Battle vs. Yuriev",
    "localizedTitle": "Battle vs. Yuriev",
    "file": "05. Battle vs. Yuriev.mp3",
    "duration": 251,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Godsibb (no vocal)",
    "localizedTitle": "Godsibb (no vocal)",
    "file": "06. Godsibb (no vocal).mp3",
    "duration": 173,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Destruction of the Star System",
    "localizedTitle": "Destruction of the Star System",
    "file": "07. Destruction of the Star System.mp3",
    "duration": 85,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "To the Last Place",
    "localizedTitle": "To the Last Place",
    "file": "08. To the Last Place (extended).mp3",
    "duration": 206,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "A Memory of a Tragedy",
    "localizedTitle": "A Memory of a Tragedy",
    "file": "09. A Memory of a Tragedy (extended).mp3",
    "duration": 191,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Richard & Hermann's Appearance",
    "localizedTitle": "Richard & Hermann's Appearance",
    "file": "10. Richard & Hermann's Appearance.mp3",
    "duration": 110,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Forgotten Sanctuary",
    "localizedTitle": "Forgotten Sanctuary",
    "file": "11. Forgotten Sanctuary.mp3",
    "duration": 144,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Voyager",
    "localizedTitle": "Voyager",
    "file": "12. Voyager.mp3",
    "duration": 123,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Testament",
    "localizedTitle": "Testament",
    "file": "13. Testament (extended).mp3",
    "duration": 213,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Fatal Fight #4 ~ vs. E.S. Levi - Michtam Underground Lab",
    "localizedTitle": "Fatal Fight #4 ~ vs. E.S. Levi - Michtam Underground Lab",
    "file": "14. Fatal Fight #4 ~ vs. E.S. Levi - Michtam Underground Lab.mp3",
    "duration": 148,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Zarathustra Dungeon",
    "localizedTitle": "Zarathustra Dungeon",
    "file": "15. Zarathustra Dungeon (extended).mp3",
    "duration": 242,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "T-elos' Final Appearance",
    "localizedTitle": "T-elos' Final Appearance",
    "file": "16. T-elos' Final Appearance.mp3",
    "duration": 209,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Hepatica (KOS-MOS)",
    "localizedTitle": "Hepatica (KOS-MOS)",
    "file": "17. Hepatica (KOS-MOS).mp3",
    "duration": 265,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "The Harsh Truth ~ Battle vs. Shion & Kevin (piano + strings ver.)",
    "localizedTitle": "The Harsh Truth ~ Battle vs. Shion & Kevin (piano + strings ver.)",
    "file": "18. The Harsh Truth ~ Battle vs. Shion & Kevin (piano + strings ver.).mp3",
    "duration": 127,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Wilhelm",
    "localizedTitle": "Wilhelm",
    "file": "19. Wilhelm.mp3",
    "duration": 168,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Nephilim & Abel",
    "localizedTitle": "Nephilim & Abel",
    "file": "20. Nephilim & Abel.mp3",
    "duration": 98,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Promised Pain",
    "localizedTitle": "Promised Pain",
    "file": "21. Promised Pain (extended).mp3",
    "duration": 314,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Maybe Tomorrow (piano ver.)",
    "localizedTitle": "Maybe Tomorrow (piano ver.)",
    "file": "22. Maybe Tomorrow (piano ver.).mp3",
    "duration": 73,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Hepatica (piano ver.)",
    "localizedTitle": "Hepatica (piano ver.)",
    "file": "23. Hepatica (piano ver.).mp3",
    "duration": 171,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Chase (intro)",
    "localizedTitle": "Chase (intro)",
    "file": "24. Chase (intro).mp3",
    "duration": 46,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "Battle vs. Erde Kaiser Σ",
    "localizedTitle": "Battle vs. Erde Kaiser Σ",
    "file": "25. Battle vs. Erde Kaiser Σ.mp3",
    "duration": 188,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "HaKox Theme A",
    "localizedTitle": "HaKox Theme A",
    "file": "26. HaKox Theme A.mp3",
    "duration": 144,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "HaKox Theme B",
    "localizedTitle": "HaKox Theme B",
    "file": "27. HaKox Theme B.mp3",
    "duration": 197,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "She's Coming Back (short ver.)",
    "localizedTitle": "She's Coming Back (short ver.)",
    "file": "28. She's Coming Back (short ver.).mp3",
    "duration": 31,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura",
    "artist": "Yuki Kajiura"
  },
];

// xenosaga-freaks
const SONGS_XENOSAGA_FREAKS = [
  {
    "title": "Elsa",
    "localizedTitle": "Elsa",
    "file": "01. Elsa.mp3",
    "duration": 188,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe",
    "artist": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Elsa 2",
    "localizedTitle": "Elsa 2",
    "file": "02. Elsa 2.mp3",
    "duration": 287,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe",
    "artist": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Subconcious Domain (Sakura's World)",
    "localizedTitle": "Subconcious Domain (Sakura's World)",
    "file": "03. Subconcious Domain (Sakura's World).mp3",
    "duration": 146,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe",
    "artist": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Nyaa 1",
    "localizedTitle": "Nyaa 1",
    "file": "04. Nyaa 1.mp3",
    "duration": 204,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe",
    "artist": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Durandal 1",
    "localizedTitle": "Durandal 1",
    "file": "05. Durandal 1.mp3",
    "duration": 164,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe",
    "artist": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Durandal 2",
    "localizedTitle": "Durandal 2",
    "file": "06. Durandal 2.mp3",
    "duration": 240,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe",
    "artist": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Encylopedia",
    "localizedTitle": "Encylopedia",
    "file": "07. Encylopedia.mp3",
    "duration": 184,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe",
    "artist": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Unknown",
    "localizedTitle": "Unknown",
    "file": "08. Unknown.mp3",
    "duration": 186,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe",
    "artist": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Nyaa 2",
    "localizedTitle": "Nyaa 2",
    "file": "09. Nyaa 2.mp3",
    "duration": 146,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe",
    "artist": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Credits",
    "localizedTitle": "Credits",
    "file": "10. Credits.mp3",
    "duration": 205,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe",
    "artist": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Options",
    "localizedTitle": "Options",
    "file": "11. Options.mp3",
    "duration": 235,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe",
    "artist": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Xeno-Pittan - Opening",
    "localizedTitle": "Xeno-Pittan - Opening",
    "file": "12. Xeno-Pittan - Opening.mp3",
    "duration": 29,
    "game": "xenosaga-freaks",
    "composer": "Satoru Kosaki",
    "artist": "Satoru Kosaki"
  },
  {
    "title": "Xeno-Pittan - Top Menu",
    "localizedTitle": "Xeno-Pittan - Top Menu",
    "file": "13. Xeno-Pittan - Top Menu.mp3",
    "duration": 51,
    "game": "xenosaga-freaks",
    "composer": "Satoru Kosaki",
    "artist": "Satoru Kosaki"
  },
  {
    "title": "Xeno-Pittan - Stage Select",
    "localizedTitle": "Xeno-Pittan - Stage Select",
    "file": "14. Xeno-Pittan - Stage Select.mp3",
    "duration": 114,
    "game": "xenosaga-freaks",
    "artist": "Namco Sound Team"
  },
  {
    "title": "Xeno-Pittan - Stage 01",
    "localizedTitle": "Xeno-Pittan - Stage 01",
    "file": "15. Xeno-Pittan - Stage 01.mp3",
    "duration": 341,
    "game": "xenosaga-freaks",
    "artist": "Namco Sound Team"
  },
  {
    "title": "Xeno-Pittan - estrellita",
    "localizedTitle": "Xeno-Pittan - estrellita",
    "file": "16. Xeno-Pittan - estrellita.mp3",
    "duration": 296,
    "game": "xenosaga-freaks",
    "composer": "Satoru Kousaki",
    "artist": "Ai Maeda"
  },
  {
    "title": "Xeno-Pittan - [ai]",
    "localizedTitle": "Xeno-Pittan - [ai]",
    "file": "17. Xeno-Pittan - [ai].mp3",
    "duration": 615,
    "game": "xenosaga-freaks",
    "composer": "Satoru Kousaki",
    "artist": "Mariko Suzuki"
  },
  {
    "title": "Xeno-Pittan - paradox",
    "localizedTitle": "Xeno-Pittan - paradox",
    "file": "18. Xeno-Pittan - paradox.mp3",
    "duration": 577,
    "game": "xenosaga-freaks",
    "composer": "Hiroshi Okubo",
    "artist": "Rumi Shishido"
  },
  {
    "title": "Xeno-Pittan - Our Xenopittan",
    "localizedTitle": "Xeno-Pittan - Our Xenopittan",
    "file": "19. Xeno-Pittan - Our Xenopittan.mp3",
    "duration": 237,
    "game": "xenosaga-freaks",
    "composer": "Satoru Kousaki",
    "artist": "Ai Maeda, Mariko Suzuki, & Rumi Shishido"
  },
  {
    "title": "Xeno-Pittan - Stage Clear",
    "localizedTitle": "Xeno-Pittan - Stage Clear",
    "file": "20. Xeno-Pittan - Stage Clear.mp3",
    "duration": 6,
    "game": "xenosaga-freaks",
    "composer": "Satoru Kosaki",
    "artist": "Satoru Kosaki"
  },
  {
    "title": "Xeno-Pittan - Time Up",
    "localizedTitle": "Xeno-Pittan - Time Up",
    "file": "21. Xeno-Pittan - Time Up.mp3",
    "duration": 4,
    "game": "xenosaga-freaks",
    "composer": "Satoru Kosaki",
    "artist": "Satoru Kosaki"
  },
  {
    "title": "Xeno-Pittan - Continue",
    "localizedTitle": "Xeno-Pittan - Continue",
    "file": "22. Xeno-Pittan - Continue.mp3",
    "duration": 13,
    "game": "xenosaga-freaks",
    "composer": "Satoru Kosaki",
    "artist": "Satoru Kosaki"
  },
  {
    "title": "Xeno-Pittan - Personality Test",
    "localizedTitle": "Xeno-Pittan - Personality Test",
    "file": "23. Xeno-Pittan - Personality Test.mp3",
    "duration": 41,
    "game": "xenosaga-freaks",
    "composer": "Satoru Kosaki",
    "artist": "Satoru Kosaki"
  },
];

// xenosaga-pied-piper
const SONGS_XENOSAGA_PIED_PIPER = [
  {
    "title": "Xenosaga Pied Piper OST [ver. SH900i] - 01 - Sharon's Theme (Unofficial name)",
    "localizedTitle": "Xenosaga Pied Piper OST [ver. SH900i] - 01 - Sharon's Theme (Unofficial name)",
    "file": "01. Sharon's Theme.mp3",
    "duration": 53,
    "game": "xenosaga-pied-piper",
    "artist": "Watte Tv"
  },
  {
    "title": "Xenosaga Pied Piper OST [ver. SH900i] - 02 - Creeping Suspicion(Unofficial name)",
    "localizedTitle": "Xenosaga Pied Piper OST [ver. SH900i] - 02 - Creeping Suspicion(Unofficial name)",
    "file": "02. Creeping Suspicion.mp3",
    "duration": 24,
    "game": "xenosaga-pied-piper",
    "artist": "Watte Tv"
  },
  {
    "title": "Xenosaga Pied Piper OST [ver. SH900i] - 03 - U.M.N. Operation (Unofficial name)",
    "localizedTitle": "Xenosaga Pied Piper OST [ver. SH900i] - 03 - U.M.N. Operation (Unofficial name)",
    "file": "03. U.M.N. Operation.mp3",
    "duration": 27,
    "game": "xenosaga-pied-piper",
    "artist": "Watte Tv"
  },
  {
    "title": "Xenosaga Pied Piper OST [ver. SH900i] - 04 - At Ease (Unofficial name)",
    "localizedTitle": "Xenosaga Pied Piper OST [ver. SH900i] - 04 - At Ease (Unofficial name)",
    "file": "04. At Ease.mp3",
    "duration": 28,
    "game": "xenosaga-pied-piper",
    "artist": "Watte Tv"
  },
  {
    "title": "Xenosaga Pied Piper OST [ver. SH900i] - 05 - Mission Briefing (Unofficial name)",
    "localizedTitle": "Xenosaga Pied Piper OST [ver. SH900i] - 05 - Mission Briefing (Unofficial name)",
    "file": "05. Mission Briefing.mp3",
    "duration": 36,
    "game": "xenosaga-pied-piper",
    "artist": "Watte Tv"
  },
  {
    "title": "Xenosaga Pied Piper OST - 06 [ver. SH900i] - High Alert (Unofficial name)",
    "localizedTitle": "Xenosaga Pied Piper OST - 06 [ver. SH900i] - High Alert (Unofficial name)",
    "file": "06. High Alert.mp3",
    "duration": 25,
    "game": "xenosaga-pied-piper",
    "artist": "Watte Tv"
  },
  {
    "title": "Xenosaga Pied Piper OST [ver. SH900i] - 07 - Aggravated Assault (Unofficial name)",
    "localizedTitle": "Xenosaga Pied Piper OST [ver. SH900i] - 07 - Aggravated Assault (Unofficial name)",
    "file": "07. Aggravated Assault.mp3",
    "duration": 19,
    "game": "xenosaga-pied-piper",
    "artist": "Watte Tv"
  },
  {
    "title": "Xenosaga Pied Piper OST [ver. SH900i] - 08 - All Clear (Unofficial name)",
    "localizedTitle": "Xenosaga Pied Piper OST [ver. SH900i] - 08 - All Clear (Unofficial name)",
    "file": "08. All Clear.mp3",
    "duration": 3,
    "game": "xenosaga-pied-piper",
    "artist": "Watte Tv"
  },
  {
    "title": "Xenosaga Pied Piper OST [ver. SH900i] - 09 - Operation Update (Unofficial name)",
    "localizedTitle": "Xenosaga Pied Piper OST [ver. SH900i] - 09 - Operation Update (Unofficial name)",
    "file": "09. Operation Update.mp3",
    "duration": 30,
    "game": "xenosaga-pied-piper",
    "artist": "Watte Tv"
  },
  {
    "title": "Xenosaga Pied Piper OST [ver. SH900i] - 10 - U.M.N. Menace (Unofficial name)",
    "localizedTitle": "Xenosaga Pied Piper OST [ver. SH900i] - 10 - U.M.N. Menace (Unofficial name)",
    "file": "10. U.M.N. Menace.mp3",
    "duration": 32,
    "game": "xenosaga-pied-piper",
    "artist": "Watte Tv"
  },
  {
    "title": "Xenosaga Pied Piper OST [ver. SH900i] - 11 - Revelations (Unofficial name)",
    "localizedTitle": "Xenosaga Pied Piper OST [ver. SH900i] - 11 - Revelations (Unofficial name)",
    "file": "11. Revelations.mp3",
    "duration": 24,
    "game": "xenosaga-pied-piper",
    "artist": "Watte Tv"
  },
  {
    "title": "Xenosaga Pied Piper OST [ver. SH900i] - 12 - End of Watch Call (Unofficial name)",
    "localizedTitle": "Xenosaga Pied Piper OST [ver. SH900i] - 12 - End of Watch Call (Unofficial name)",
    "file": "12. End of Watch Call.mp3",
    "duration": 36,
    "game": "xenosaga-pied-piper",
    "artist": "Watte Tv"
  },
  {
    "title": "Xenosaga Pied Piper OST [ver. SH900i] - 13 - Pulse (Unofficial name)",
    "localizedTitle": "Xenosaga Pied Piper OST [ver. SH900i] - 13 - Pulse (Unofficial name)",
    "file": "13. Pulse.mp3",
    "duration": 6,
    "game": "xenosaga-pied-piper",
    "artist": "Watte Tv"
  },
  {
    "title": "Xenosaga Pied Piper OST [ver. SH900i] - 14 - The Zohar's Awakening (Unofficial name)",
    "localizedTitle": "Xenosaga Pied Piper OST [ver. SH900i] - 14 - The Zohar's Awakening (Unofficial name)",
    "file": "14. The Zohar's Awakening.mp3",
    "duration": 61,
    "game": "xenosaga-pied-piper",
    "artist": "Watte Tv"
  },
  {
    "title": "Xenosaga Pied Piper OST [ver. SH900i] - 15 - Mantle of Shadow (Unofficial name)",
    "localizedTitle": "Xenosaga Pied Piper OST [ver. SH900i] - 15 - Mantle of Shadow (Unofficial name)",
    "file": "15. Mantle of Shadow.mp3",
    "duration": 28,
    "game": "xenosaga-pied-piper",
    "artist": "Watte Tv"
  },
  {
    "title": "Xenosaga Pied Piper OST [ver. SH900i] - 16 - Final Report (Unofficial name)",
    "localizedTitle": "Xenosaga Pied Piper OST [ver. SH900i] - 16 - Final Report (Unofficial name)",
    "file": "16. Final Report.mp3",
    "duration": 57,
    "game": "xenosaga-pied-piper",
    "artist": "Watte Tv"
  },
];


// ============================================
// SONG POOL MAPPING
// ============================================
const SONG_POOLS = {
  'xenoblade-1': SONGS_XENOBLADE_1,
  'xenoblade-1-fc': SONGS_XENOBLADE_1_FC,
  'xenoblade-2': SONGS_XENOBLADE_2,
  'xenoblade-2-torna': SONGS_XENOBLADE_2_TORNA,
  'xenoblade-3': SONGS_XENOBLADE_3,
  'xenoblade-3-fr': SONGS_XENOBLADE_3_FR,
  'xenoblade-x': SONGS_XENOBLADE_X,
  'xenoblade-x-de': SONGS_XENOBLADE_X_DE,
  'xenogears': SONGS_XENOGEARS,
  'xenosaga-1': SONGS_XENOSAGA_1,
  'xenosaga-3': SONGS_XENOSAGA_3,
  'xenosaga-freaks': SONGS_XENOSAGA_FREAKS,
  'xenosaga-pied-piper': SONGS_XENOSAGA_PIED_PIPER,
  'xenosaga-2': [...SONGS_XENOSAGA_2_GAMERIP, ...SONGS_XENOSAGA_2_MOVIE],
};

// ============================================
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

  // Use song-level folder override if present, otherwise game folder
  const folder = song.folder || game.folder;
  return `${AUDIO_BASE_URL}/music/${folder}/${encodedFile}`;
}

// Legacy compatibility
const SONGS = SONGS_XENOBLADE_X;
