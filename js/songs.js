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
    name: 'Xenoblade Chronicles X Definitive Edition',
    shortName: 'XCX DE',
    color: '#00D4FF',
    folder: 'Xenoblade X DE - Final Tracks',
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
    folder: 'Xenosaga Freaks (PS2) (gamerip) (2004)'
  },
  'xenosaga-pied-piper': {
    id: 'xenosaga-pied-piper',
    name: 'Xenosaga Pied Piper',
    shortName: 'XS Pied Piper',
    color: '#B5179E',
    folder: 'Xenosaga Pied Piper (Mobile) (gamerip) (2004)'
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


// Search aliases for game abbreviations (exact word matching)
// "xeno" matches all games via substring on game names — no alias needed.
// DLC games auto-inherit their parent's aliases via getGameSearchAliases().
const GAME_SEARCH_ALIASES = {
  'xenoblade-x':        'xcx xbx',
  'xenoblade-x-de':     'xcxde',
  'xenoblade-1':        'xc1 xb1',
  'xenoblade-1-fc':     'xc1fc fc',
  'xenoblade-2':        'xc2 xb2',
  'xenoblade-2-torna':  'xc2t torna',
  'xenoblade-3':        'xc3 xb3',
  'xenoblade-3-fr':     'xc3fr fr',
  'xenosaga-1':         'xs xs1 xsi',
  'xenosaga-2':         'xs xs2 xsii',
  'xenosaga-3':         'xs xs3 xsiii',
  'xenosaga-freaks':    'xs xsf freaks',
  'xenosaga-pied-piper':'xs xspp',
  'xenogears':          'xg xgears',
};

function getGameSearchAliases(gameId) {
  const own = GAME_SEARCH_ALIASES[gameId] || '';
  const parent = GAMES[gameId]?.parentGame;
  const inherited = parent ? (GAME_SEARCH_ALIASES[parent] || '') : '';
  const combined = (own + ' ' + inherited).trim();
  return combined || '';
}

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
    logo: 'images/full-xeno/logo.svg',
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
    logo: 'images/xenoblade/logo.svg',
    games: getGamesWithDLC([
      'xenoblade-1', 'xenoblade-2', 'xenoblade-3', 'xenoblade-x'
    ]),
    randomStart: false
  },
  'xenosaga': {
    id: 'xenosaga',
    name: 'Xenosaga Heardle',
    description: 'Xenosaga trilogy',
    logo: 'images/xenosaga/logo.svg',
    games: ['xenosaga-1', 'xenosaga-2', 'xenosaga-3'],
    randomStart: false
  },
  'random': {
    id: 'random',
    name: 'Random Challenge',
    description: 'Random game + random start time',
    logo: 'images/random/logo.svg',
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
    "japaneseTitle": "メインテーマ",
    "localizedTitle": "Main Theme",
    "file": "1-01. Main Theme.mp3",
    "duration": 222,
    "game": "xenoblade-1",
    "composer": "Yoko Shimomura"
  },
  {
    "title": "Prologue A",
    "japaneseTitle": "プロローグ A",
    "localizedTitle": "Prologue A",
    "file": "1-02. Prologue A.mp3",
    "duration": 204,
    "game": "xenoblade-1",
    "composer": "Yoko Shimomura",
    "artist": "Tsutomu Narita"
  },
  {
    "title": "Prologue B",
    "japaneseTitle": "プロローグ B",
    "localizedTitle": "Prologue B",
    "file": "1-03. Prologue B.mp3",
    "duration": 199,
    "game": "xenoblade-1",
    "composer": "Yoko Shimomura",
    "artist": "Tsutomu Narita"
  },
  {
    "title": "Everyday Life",
    "japaneseTitle": "日常",
    "localizedTitle": "Everyday Life",
    "file": "1-04. Everyday Life.mp3",
    "duration": 150,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Colony 9 (Definitive Edition ver.)",
    "japaneseTitle": "コロニー９ (Definitive Edition ver.)",
    "localizedTitle": "Colony 9 (Definitive Edition ver.)",
    "file": "1-05. Colony 9 (Definitive Edition ver.).mp3",
    "duration": 171,
    "game": "xenoblade-1",
    "composer": "Yoko Shimomura",
    "artist": "Tsutomu Narita"
  },
  {
    "title": "Colony 9/Night (Definitive Edition ver.)",
    "japaneseTitle": "コロニー９/夜 (Definitive Edition ver.)",
    "localizedTitle": "Colony 9/Night (Definitive Edition ver.)",
    "file": "1-06. Colony 9 - Night (Definitive Edition ver.).mp3",
    "duration": 209,
    "game": "xenoblade-1",
    "composer": "Yoko Shimomura",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Time to Fight! (Definitive Edition ver.)",
    "japaneseTitle": "戦闘！ (Definitive Edition ver.)",
    "localizedTitle": "Time to Fight! (Definitive Edition ver.)",
    "file": "1-07. Time to Fight! (Definitive Edition ver.).mp3",
    "duration": 165,
    "game": "xenoblade-1",
    "composer": "Yoko Shimomura",
    "artist": "Tsutomu Narita"
  },
  {
    "title": "Enemies Closing In (Definitive Edition ver.)",
    "japaneseTitle": "敵の猛追 (Definitive Edition ver.)",
    "localizedTitle": "Enemies Closing In (Definitive Edition ver.)",
    "file": "1-08. Enemies Closing In (Definitive Edition ver.).mp3",
    "duration": 257,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Hometown (Definitive Edition ver.)",
    "japaneseTitle": "故郷 (Definitive Edition ver.)",
    "localizedTitle": "Hometown (Definitive Edition ver.)",
    "file": "1-09. Hometown (Definitive Edition ver.).mp3",
    "duration": 218,
    "game": "xenoblade-1",
    "composer": "Yoko Shimomura",
    "artist": "Tsutomu Narita"
  },
  {
    "title": "Hometown/Night (Definitive Edition ver.)",
    "japaneseTitle": "故郷/夜 (Definitive Edition ver.)",
    "localizedTitle": "Hometown/Night (Definitive Edition ver.)",
    "file": "1-10. Hometown - Night (Definitive Edition ver.).mp3",
    "duration": 205,
    "game": "xenoblade-1",
    "composer": "Yoko Shimomura",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "A Friend on My Mind",
    "japaneseTitle": "親しき人への想い",
    "localizedTitle": "A Friend on My Mind",
    "file": "1-11. A Friend on My Mind.mp3",
    "duration": 190,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "The Monado Awakens",
    "japaneseTitle": "モナド発動",
    "localizedTitle": "The Monado Awakens",
    "file": "1-12. The Monado Awakens.mp3",
    "duration": 38,
    "game": "xenoblade-1",
    "composer": "ACE+"
  },
  {
    "title": "Tephra Cave (Definitive Edition ver.)",
    "japaneseTitle": "テフラ洞窟 (Definitive Edition ver.)",
    "localizedTitle": "Tephra Cave (Definitive Edition ver.)",
    "file": "1-13. Tephra Cave (Definitive Edition ver.).mp3",
    "duration": 181,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Hostile Gazes (Definitive Edition ver.)",
    "japaneseTitle": "纏わり付く視線 (Definitive Edition ver.)",
    "localizedTitle": "Hostile Gazes (Definitive Edition ver.)",
    "file": "1-14. Hostile Gazes (Definitive Edition ver.).mp3",
    "duration": 159,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Crisis",
    "japaneseTitle": "危機",
    "localizedTitle": "Crisis",
    "file": "1-15. Crisis.mp3",
    "duration": 226,
    "game": "xenoblade-1",
    "composer": "ACE+"
  },
  {
    "title": "An Obstacle in Our Path (Definitive Edition ver.)",
    "japaneseTitle": "行く手を阻む者 (Definitive Edition ver.)",
    "localizedTitle": "An Obstacle in Our Path (Definitive Edition ver.)",
    "file": "1-16. An Obstacle in Our Path (Definitive Edition ver.).mp3",
    "duration": 188,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Engage the Enemy (Definitive Edition ver.)",
    "japaneseTitle": "敵との対峙 (Definitive Edition ver.)",
    "localizedTitle": "Engage the Enemy (Definitive Edition ver.)",
    "file": "1-17. Engage the Enemy (Definitive Edition ver.).mp3",
    "duration": 229,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Rage, Darkness of the Heart",
    "japaneseTitle": "怒り、心の闇",
    "localizedTitle": "Rage, Darkness of the Heart",
    "file": "1-18. Rage, Darkness of the Heart.mp3",
    "duration": 219,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Sorrow",
    "japaneseTitle": "悲しみ",
    "localizedTitle": "Sorrow",
    "file": "1-19. Sorrow.mp3",
    "duration": 153,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Once We Part Ways",
    "japaneseTitle": "別れ、そして…",
    "localizedTitle": "Once We Part Ways",
    "file": "1-20. Once We Part Ways.mp3",
    "duration": 205,
    "game": "xenoblade-1",
    "composer": "ACE+"
  },
  {
    "title": "Apprehension",
    "japaneseTitle": "予感",
    "localizedTitle": "Apprehension",
    "file": "2-01. Apprehension.mp3",
    "duration": 165,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Memories",
    "japaneseTitle": "思い出",
    "localizedTitle": "Memories",
    "file": "2-02. Memories.mp3",
    "duration": 184,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Urgency",
    "japaneseTitle": "焦り",
    "localizedTitle": "Urgency",
    "file": "2-03. Urgency.mp3",
    "duration": 73,
    "game": "xenoblade-1",
    "composer": "ACE+"
  },
  {
    "title": "Visions of the Future (Definitive Edition ver.)",
    "japaneseTitle": "未来視発動 (Definitive Edition ver.)",
    "localizedTitle": "Visions of the Future (Definitive Edition ver.)",
    "file": "2-04. Visions of the Future (Definitive Edition ver.).mp3",
    "duration": 153,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Majesty",
    "japaneseTitle": "雄大",
    "localizedTitle": "Majesty",
    "file": "2-05. Majesty.mp3",
    "duration": 219,
    "game": "xenoblade-1",
    "composer": "ACE+"
  },
  {
    "title": "Gaur Plain (Definitive Edition ver.)",
    "japaneseTitle": "ガウル平原 (Definitive Edition ver.)",
    "localizedTitle": "Gaur Plain (Definitive Edition ver.)",
    "file": "2-06. Gaur Plain (Definitive Edition ver.).mp3",
    "duration": 265,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Gaur Plain/Night (Definitive Edition ver.)",
    "japaneseTitle": "ガウル平原/夜 (Definitive Edition ver.)",
    "localizedTitle": "Gaur Plain/Night (Definitive Edition ver.)",
    "file": "2-07. Gaur Plain - Night (Definitive Edition ver.).mp3",
    "duration": 198,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "In the Refugee Camp (Definitive Edition ver.)",
    "japaneseTitle": "脱出艇キャンプ (Definitive Edition ver.)",
    "localizedTitle": "In the Refugee Camp (Definitive Edition ver.)",
    "file": "2-08. In the Refugee Camp (Definitive Edition ver.).mp3",
    "duration": 205,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Face",
    "japaneseTitle": "顔つき",
    "localizedTitle": "Face",
    "file": "2-09. Face.mp3",
    "duration": 164,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Colony 6 - Ether Mine (Definitive Edition ver.)",
    "japaneseTitle": "コロニー６～中央採掘場～ (Definitive Edition ver.)",
    "localizedTitle": "Colony 6 - Ether Mine (Definitive Edition ver.)",
    "file": "2-10. Colony 6 - Ether Mine (Definitive Edition ver.).mp3",
    "duration": 175,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Unfinished Business",
    "japaneseTitle": "引けない戦い",
    "localizedTitle": "Unfinished Business",
    "file": "2-11. Unfinished Business.mp3",
    "duration": 186,
    "game": "xenoblade-1",
    "composer": "Yoko Shimomura"
  },
  {
    "title": "Colony 6 - Silence (Definitive Edition ver.)",
    "japaneseTitle": "コロニー６～静寂～ (Definitive Edition ver.)",
    "localizedTitle": "Colony 6 - Silence (Definitive Edition ver.)",
    "file": "2-12. Colony 6 - Silence (Definitive Edition ver.).mp3",
    "duration": 163,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Colony 6 - Rebuilding (Definitive Edition ver.)",
    "japaneseTitle": "コロニー6 ～再興～ (Definitive Edition ver.)",
    "localizedTitle": "Colony 6 - Rebuilding (Definitive Edition ver.)",
    "file": "2-13. Colony 6 - Rebuilding (Definitive Edition ver.).mp3",
    "duration": 165,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Colony 6 - Hope (Definitive Edition ver.)",
    "japaneseTitle": "コロニー6 ～希望～ (Definitive Edition ver.)",
    "localizedTitle": "Colony 6 - Hope (Definitive Edition ver.)",
    "file": "2-14. Colony 6 - Hope (Definitive Edition ver.).mp3",
    "duration": 156,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Colony 6 - Future (Definitive Edition ver.)",
    "japaneseTitle": "コロニー6 ～未来～ (Definitive Edition ver.)",
    "localizedTitle": "Colony 6 - Future (Definitive Edition ver.)",
    "file": "2-15. Colony 6 - Future (Definitive Edition ver.).mp3",
    "duration": 135,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Satorl Marsh (Definitive Edition ver.)",
    "japaneseTitle": "燐光の地ザトール (Definitive Edition ver.)",
    "localizedTitle": "Satorl Marsh (Definitive Edition ver.)",
    "file": "2-16. Satorl Marsh (Definitive Edition ver.).mp3",
    "duration": 161,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Satorl Marsh/Night (Definitive Edition ver.)",
    "japaneseTitle": "燐光の地ザトール/夜 (Definitive Edition ver.)",
    "localizedTitle": "Satorl Marsh/Night (Definitive Edition ver.)",
    "file": "2-17. Satorl Marsh - Night (Definitive Edition ver.).mp3",
    "duration": 211,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Bionis' Interior/Carcass (Definitive Edition ver.)",
    "japaneseTitle": "巨神胎内/骸 (Definitive Edition ver.)",
    "localizedTitle": "Bionis' Interior/Carcass (Definitive Edition ver.)",
    "file": "2-18. Bionis' Interior - Carcass (Definitive Edition ver.).mp3",
    "duration": 199,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Forest of the Nopon (Definitive Edition ver.)",
    "japaneseTitle": "マクナ原生林 (Definitive Edition ver.)",
    "localizedTitle": "Forest of the Nopon (Definitive Edition ver.)",
    "file": "2-19. Forest of the Nopon (Definitive Edition ver.).mp3",
    "duration": 139,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Forest of the Nopon/Night (Definitive Edition ver.)",
    "japaneseTitle": "マクナ原生林/夜 (Definitive Edition ver.)",
    "localizedTitle": "Forest of the Nopon/Night (Definitive Edition ver.)",
    "file": "2-20. Forest of the Nopon - Night (Definitive Edition ver.).mp3",
    "duration": 219,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Frontier Village (Definitive Edition ver.)",
    "japaneseTitle": "サイハテ村 (Definitive Edition ver.)",
    "localizedTitle": "Frontier Village (Definitive Edition ver.)",
    "file": "2-21. Frontier Village (Definitive Edition ver.).mp3",
    "duration": 180,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Frontier Village/Night (Definitive Edition ver.)",
    "japaneseTitle": "サイハテ村/夜 (Definitive Edition ver.)",
    "localizedTitle": "Frontier Village/Night (Definitive Edition ver.)",
    "file": "2-22. Frontier Village - Night (Definitive Edition ver.).mp3",
    "duration": 200,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Riki the Legendary Heropon",
    "japaneseTitle": "伝説の勇者リキ",
    "localizedTitle": "Riki the Legendary Heropon",
    "file": "2-23. Riki the Legendary Heropon.mp3",
    "duration": 185,
    "game": "xenoblade-1",
    "composer": "ACE+"
  },
  {
    "title": "Eryth Sea (Definitive Edition ver.)",
    "japaneseTitle": "エルト海 (Definitive Edition ver.)",
    "localizedTitle": "Eryth Sea (Definitive Edition ver.)",
    "file": "3-01. Eryth Sea (Definitive Edition ver.).mp3",
    "duration": 202,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Eryth Sea/Night (Definitive Edition ver.)",
    "japaneseTitle": "エルト海/夜 (Definitive Edition ver.)",
    "localizedTitle": "Eryth Sea/Night (Definitive Edition ver.)",
    "file": "3-02. Eryth Sea - Night (Definitive Edition ver.).mp3",
    "duration": 205,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Alcamoth, Imperial Capital (Definitive Edition ver.)",
    "japaneseTitle": "皇都アカモート (Definitive Edition ver.)",
    "localizedTitle": "Alcamoth, Imperial Capital (Definitive Edition ver.)",
    "file": "3-03. Alcamoth, Imperial Capital (Definitive Edition ver.).mp3",
    "duration": 198,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Alcamoth, Imperial Capital/Night (Definitive Edition ver.)",
    "japaneseTitle": "皇都アカモート/夜 (Definitive Edition ver.)",
    "localizedTitle": "Alcamoth, Imperial Capital/Night (Definitive Edition ver.)",
    "file": "3-04. Alcamoth, Imperial Capital - Night (Definitive Edition ver.).mp3",
    "duration": 198,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Intrigue",
    "japaneseTitle": "陰謀",
    "localizedTitle": "Intrigue",
    "file": "3-05. Intrigue.mp3",
    "duration": 159,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Where the Ancestors Sleep (Definitive Edition ver.)",
    "japaneseTitle": "祖霊の眠る地 (Definitive Edition ver.)",
    "localizedTitle": "Where the Ancestors Sleep (Definitive Edition ver.)",
    "file": "3-06. Where the Ancestors Sleep (Definitive Edition ver.).mp3",
    "duration": 190,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Ancient Mysteries",
    "japaneseTitle": "神秘",
    "localizedTitle": "Ancient Mysteries",
    "file": "3-07. Ancient Mysteries.mp3",
    "duration": 138,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Egil's Theme",
    "japaneseTitle": "エギル",
    "localizedTitle": "Egil's Theme",
    "file": "3-08. Egil's Theme.mp3",
    "duration": 175,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Prison Island (Definitive Edition ver.)",
    "japaneseTitle": "監獄島 (Definitive Edition ver.)",
    "localizedTitle": "Prison Island (Definitive Edition ver.)",
    "file": "3-09. Prison Island (Definitive Edition ver.).mp3",
    "duration": 186,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "You Will Know Our Names (Definitive Edition ver.)",
    "japaneseTitle": "名を冠する者たち (Definitive Edition ver.)",
    "localizedTitle": "You Will Know Our Names (Definitive Edition ver.)",
    "file": "3-10. You Will Know Our Names (Definitive Edition ver.).mp3",
    "duration": 161,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Thoughts Enshrined",
    "japaneseTitle": "想いは内に…",
    "localizedTitle": "Thoughts Enshrined",
    "file": "3-11. Thoughts Enshrined.mp3",
    "duration": 204,
    "game": "xenoblade-1",
    "composer": "ACE+"
  },
  {
    "title": "Valak Mountain (Definitive Edition ver.)",
    "japaneseTitle": "ヴァラク雪山 (Definitive Edition ver.)",
    "localizedTitle": "Valak Mountain (Definitive Edition ver.)",
    "file": "3-12. Valak Mountain (Definitive Edition ver.).mp3",
    "duration": 246,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Valak Mountain/Night (Definitive Edition ver.)",
    "japaneseTitle": "ヴァラク雪山/夜 (Definitive Edition ver.)",
    "localizedTitle": "Valak Mountain/Night (Definitive Edition ver.)",
    "file": "3-13. Valak Mountain - Night (Definitive Edition ver.).mp3",
    "duration": 199,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Sword Valley (Definitive Edition ver.)",
    "japaneseTitle": "大剣の渓谷 (Definitive Edition ver.)",
    "localizedTitle": "Sword Valley (Definitive Edition ver.)",
    "file": "3-14. Sword Valley (Definitive Edition ver.).mp3",
    "duration": 143,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Sword Valley/Night (Definitive Edition ver.)",
    "japaneseTitle": "大剣の渓谷/夜 (Definitive Edition ver.)",
    "localizedTitle": "Sword Valley/Night (Definitive Edition ver.)",
    "file": "3-15. Sword Valley - Night (Definitive Edition ver.).mp3",
    "duration": 199,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Galahad Fortress (Definitive Edition ver.)",
    "japaneseTitle": "ガラハド要塞 (Definitive Edition ver.)",
    "localizedTitle": "Galahad Fortress (Definitive Edition ver.)",
    "file": "3-16. Galahad Fortress (Definitive Edition ver.).mp3",
    "duration": 184,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Mechanical Rhythm (Definitive Edition ver.)",
    "japaneseTitle": "機の律動 (Definitive Edition ver.)",
    "localizedTitle": "Mechanical Rhythm (Definitive Edition ver.)",
    "file": "3-17. Mechanical Rhythm (Definitive Edition ver.).mp3",
    "duration": 183,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Irregular Bound (Definitive Edition ver.)",
    "japaneseTitle": "イレギュラーバウンド (Definitive Edition ver.)",
    "localizedTitle": "Irregular Bound (Definitive Edition ver.)",
    "file": "3-18. Irregular Bound (Definitive Edition ver.).mp3",
    "duration": 143,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "A Tragic Decision (Definitive Edition ver.)",
    "japaneseTitle": "悲壮な決意 (Definitive Edition ver.)",
    "localizedTitle": "A Tragic Decision (Definitive Edition ver.)",
    "file": "3-19. A Tragic Decision (Definitive Edition ver.).mp3",
    "duration": 226,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "The Fallen Land (Definitive Edition ver.)",
    "japaneseTitle": "堕ちた地で… (Definitive Edition ver.)",
    "localizedTitle": "The Fallen Land (Definitive Edition ver.)",
    "file": "4-01. The Fallen Land (Definitive Edition ver.).mp3",
    "duration": 198,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "The Fallen Land/Night (Definitive Edition ver.)",
    "japaneseTitle": "堕ちた地で…/夜 (Definitive Edition ver.)",
    "localizedTitle": "The Fallen Land/Night (Definitive Edition ver.)",
    "file": "4-02. The Fallen Land - Night (Definitive Edition ver.).mp3",
    "duration": 240,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Shulk and Fiora",
    "japaneseTitle": "シュルクとフィオルン",
    "localizedTitle": "Shulk and Fiora",
    "file": "4-03. Shulk and Fiora.mp3",
    "duration": 192,
    "game": "xenoblade-1",
    "composer": "Yoko Shimomura",
    "artist": "ACE+"
  },
  {
    "title": "Reminiscence",
    "japaneseTitle": "回想",
    "localizedTitle": "Reminiscence",
    "file": "4-04. Reminiscence.mp3",
    "duration": 210,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Riki's Kindness",
    "japaneseTitle": "リキの優しさ",
    "localizedTitle": "Riki's Kindness",
    "file": "4-05. Riki's Kindness.mp3",
    "duration": 143,
    "game": "xenoblade-1",
    "composer": "ACE+"
  },
  {
    "title": "Hope",
    "japaneseTitle": "希望",
    "localizedTitle": "Hope",
    "file": "4-06. Hope.mp3",
    "duration": 201,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Hidden Machina Village (Definitive Edition ver.)",
    "japaneseTitle": "マシーナの隠れ里 (Definitive Edition ver.)",
    "localizedTitle": "Hidden Machina Village (Definitive Edition ver.)",
    "file": "4-07. Hidden Machina Village (Definitive Edition ver.).mp3",
    "duration": 166,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Tension",
    "japaneseTitle": "緊張",
    "localizedTitle": "Tension",
    "file": "4-08. Tension.mp3",
    "duration": 172,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Regret",
    "japaneseTitle": "悔恨",
    "localizedTitle": "Regret",
    "file": "4-09. Regret.mp3",
    "duration": 156,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Mechonis Field (Definitive Edition ver.)",
    "japaneseTitle": "機神界フィールド (Definitive Edition ver.)",
    "localizedTitle": "Mechonis Field (Definitive Edition ver.)",
    "file": "4-10. Mechonis Field (Definitive Edition ver.).mp3",
    "duration": 248,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Shadows Creeping",
    "japaneseTitle": "忍び寄る影",
    "localizedTitle": "Shadows Creeping",
    "file": "4-11. Shadows Creeping.mp3",
    "duration": 183,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "The Battle is Upon Us",
    "japaneseTitle": "決戦前夜",
    "localizedTitle": "The Battle is Upon Us",
    "file": "4-12. The Battle is Upon Us.mp3",
    "duration": 219,
    "game": "xenoblade-1",
    "composer": "ACE+"
  },
  {
    "title": "Central Factory (Definitive Edition ver.)",
    "japaneseTitle": "中央工廠 (Definitive Edition ver.)",
    "localizedTitle": "Central Factory (Definitive Edition ver.)",
    "file": "4-13. Central Factory (Definitive Edition ver.).mp3",
    "duration": 301,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Agniratha, Mechonis Capital (Definitive Edition ver.)",
    "japaneseTitle": "帝都アグニラータ (Definitive Edition ver.)",
    "localizedTitle": "Agniratha, Mechonis Capital (Definitive Edition ver.)",
    "file": "4-14. Agniratha, Mechonis Capital (Definitive Edition ver.).mp3",
    "duration": 248,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Agniratha, Mechonis Capital/Night (Definitive Edition ver.)",
    "japaneseTitle": "帝都アグニラータ/夜 (Definitive Edition ver.)",
    "localizedTitle": "Agniratha, Mechonis Capital/Night (Definitive Edition ver.)",
    "file": "4-15. Agniratha, Mechonis Capital - Night (Definitive Edition ver.).mp3",
    "duration": 176,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Disquiet",
    "japaneseTitle": "不安",
    "localizedTitle": "Disquiet",
    "file": "4-16. Disquiet.mp3",
    "duration": 196,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Towering Shadow",
    "japaneseTitle": "巨大な影",
    "localizedTitle": "Towering Shadow",
    "file": "4-17. Towering Shadow.mp3",
    "duration": 185,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Bionis' Awakening",
    "japaneseTitle": "巨神の目覚め",
    "localizedTitle": "Bionis' Awakening",
    "file": "4-18. Bionis' Awakening.mp3",
    "duration": 234,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "A Spiritual Place",
    "japaneseTitle": "精神世界",
    "localizedTitle": "A Spiritual Place",
    "file": "4-19. A Spiritual Place.mp3",
    "duration": 163,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Reminiscence (Music Box)",
    "japaneseTitle": "回想／オルゴール",
    "localizedTitle": "Reminiscence (Music Box)",
    "file": "4-20. Reminiscence (Music Box).mp3",
    "duration": 206,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Bionis' Interior/Pulse (Definitive Edition ver.)",
    "japaneseTitle": "巨神胎内/鼓動 (Definitive Edition ver.)",
    "localizedTitle": "Bionis' Interior/Pulse (Definitive Edition ver.)",
    "file": "5-01. Bionis' Interior - Pulse (Definitive Edition ver.).mp3",
    "duration": 177,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "The End Lies Ahead (Definitive Edition ver.)",
    "japaneseTitle": "最後の戦いへ (Definitive Edition ver.)",
    "localizedTitle": "The End Lies Ahead (Definitive Edition ver.)",
    "file": "5-02. The End Lies Ahead (Definitive Edition ver.).mp3",
    "duration": 217,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "Kenji Hiramatsu"
  },
  {
    "title": "Memory's End (Definitive Edition ver.)",
    "japaneseTitle": "記憶の果て… (Definitive Edition ver.)",
    "localizedTitle": "Memory's End (Definitive Edition ver.)",
    "file": "5-03. Memory's End (Definitive Edition ver.).mp3",
    "duration": 176,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Zanza's World (Definitive Edition ver.)",
    "japaneseTitle": "ザンザの世界で (Definitive Edition ver.)",
    "localizedTitle": "Zanza's World (Definitive Edition ver.)",
    "file": "5-04. Zanza's World (Definitive Edition ver.).mp3",
    "duration": 169,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Zanza the Divine (Definitive Edition ver.)",
    "japaneseTitle": "ザンザ (Definitive Edition ver.)",
    "localizedTitle": "Zanza the Divine (Definitive Edition ver.)",
    "file": "5-05. Zanza the Divine (Definitive Edition ver.).mp3",
    "duration": 199,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "The God-Slaying Sword (Definitive Edition ver.)",
    "japaneseTitle": "神を絶ちし剣 (Definitive Edition ver.)",
    "localizedTitle": "The God-Slaying Sword (Definitive Edition ver.)",
    "file": "5-06. The God-Slaying Sword (Definitive Edition ver.).mp3",
    "duration": 301,
    "game": "xenoblade-1",
    "composer": "ACE+",
    "artist": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Futures That Lie Ahead",
    "japaneseTitle": "それぞれの未来へ",
    "localizedTitle": "Futures That Lie Ahead",
    "file": "5-07. Futures That Lie Ahead.mp3",
    "duration": 231,
    "game": "xenoblade-1",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Beyond the Sky",
    "japaneseTitle": "Beyond the Sky",
    "localizedTitle": "Beyond the Sky",
    "file": "5-08. Beyond the Sky.mp3",
    "duration": 269,
    "game": "xenoblade-1",
    "composer": "Yasunori Mitsuda",
    "artist": "Sarah àlainn"
  },
  {
    "title": "Epilogue",
    "japaneseTitle": "エピローグ",
    "localizedTitle": "Epilogue",
    "file": "5-09. Epilogue.mp3",
    "duration": 255,
    "game": "xenoblade-1",
    "composer": "Yoko Shimomura",
    "artist": "Yoko Shimomura, Tsutomu Narita"
  },
];

// xenoblade-1-fc
const SONGS_XENOBLADE_1_FC = [
  {
    "title": "Bionis' Shoulder",
    "japaneseTitle": "巨神肩",
    "localizedTitle": "Bionis' Shoulder",
    "file": "5-10. Bionis' Shoulder.mp3",
    "duration": 223,
    "game": "xenoblade-1-fc",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Bionis' Shoulder/Night",
    "japaneseTitle": "巨神肩/夜",
    "localizedTitle": "Bionis' Shoulder/Night",
    "file": "5-11. Bionis' Shoulder - Night.mp3",
    "duration": 258,
    "game": "xenoblade-1-fc",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Time to Fight! (Bionis' Shoulder)",
    "japaneseTitle": "戦いの刻",
    "localizedTitle": "Time to Fight! (Bionis' Shoulder)",
    "file": "5-12. Time to Fight! (Bionis' Shoulder).mp3",
    "duration": 258,
    "game": "xenoblade-1-fc",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Fogbeasts",
    "japaneseTitle": "霧乃獣",
    "localizedTitle": "Fogbeasts",
    "file": "5-13. Fogbeasts.mp3",
    "duration": 200,
    "game": "xenoblade-1-fc",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Gran Dell",
    "japaneseTitle": "古代都市グランデル",
    "localizedTitle": "Gran Dell",
    "file": "5-14. Gran Dell.mp3",
    "duration": 207,
    "game": "xenoblade-1-fc",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Gran Dell/Night",
    "japaneseTitle": "古代都市グランデル/夜",
    "localizedTitle": "Gran Dell/Night",
    "file": "5-15. Gran Dell - Night.mp3",
    "duration": 232,
    "game": "xenoblade-1-fc",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Roar from Beyond",
    "japaneseTitle": "彼方よりの咆哮",
    "localizedTitle": "Roar from Beyond",
    "file": "5-16. Roar from Beyond.mp3",
    "duration": 345,
    "game": "xenoblade-1-fc",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Beyond the Sky (Acoustic Arrange)",
    "japaneseTitle": "Beyond the Sky (Acoustic Arrange)",
    "localizedTitle": "Beyond the Sky (Acoustic Arrange)",
    "file": "5-17. Beyond the Sky (Acoustic Arrange).mp3",
    "duration": 339,
    "game": "xenoblade-1-fc",
    "composer": "Yasunori Mitsuda"
  },
];

// xenoblade-2
const SONGS_XENOBLADE_2 = [
  {
    "title": "Yggdrasil",
    "japaneseTitle": "ユグドラシル",
    "localizedTitle": "Yggdrasil",
    "file": "10-01. Yggdrasil.mp3",
    "duration": 215,
    "game": "xenoblade-2",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Past from Far Distance",
    "japaneseTitle": "Past from Far Distance",
    "localizedTitle": "Past from Far Distance",
    "file": "10-02. Past from Far Distance.mp3",
    "duration": 166,
    "game": "xenoblade-2",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "With People and Darkness",
    "japaneseTitle": "人と闇と",
    "localizedTitle": "With People and Darkness",
    "file": "10-03. With People and Darkness.mp3",
    "duration": 182,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "The Power of Jin",
    "japaneseTitle": "シンの力",
    "localizedTitle": "The Power of Jin",
    "file": "10-04. The Power of Jin.mp3",
    "duration": 198,
    "game": "xenoblade-2",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Praetor Amalthus - The Acting God -",
    "japaneseTitle": "マルベーニ　～神の代行者～",
    "localizedTitle": "Praetor Amalthus - The Acting God -",
    "file": "10-05. Praetor Amalthus - The Acting God -.mp3",
    "duration": 179,
    "game": "xenoblade-2",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Walking with You",
    "japaneseTitle": "君と歩く道",
    "localizedTitle": "Walking with You",
    "file": "10-06. Walking with You.mp3",
    "duration": 224,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Orbital Ring",
    "japaneseTitle": "オービタルリング",
    "localizedTitle": "Orbital Ring",
    "file": "10-07. Orbital Ring.mp3",
    "duration": 229,
    "game": "xenoblade-2",
    "composer": "Manami Kiyota"
  },
  {
    "title": "The Abandoned City",
    "japaneseTitle": "廃墟",
    "localizedTitle": "The Abandoned City",
    "file": "10-08. The Abandoned City.mp3",
    "duration": 216,
    "game": "xenoblade-2",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Heart in the Fog",
    "japaneseTitle": "彷徨う心",
    "localizedTitle": "Heart in the Fog",
    "file": "10-09. Heart in the Fog.mp3",
    "duration": 182,
    "game": "xenoblade-2",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Flashback",
    "japaneseTitle": "フラッシュバック",
    "localizedTitle": "Flashback",
    "file": "10-10. Flashback.mp3",
    "duration": 140,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Sea of Clouds",
    "japaneseTitle": "静かなる雲海",
    "localizedTitle": "Sea of Clouds",
    "file": "10-11. Sea of Clouds.mp3",
    "duration": 223,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Disappearing World",
    "japaneseTitle": "消えゆく世界",
    "localizedTitle": "Disappearing World",
    "file": "10-12. Disappearing World.mp3",
    "duration": 187,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Battle in the Skies Above",
    "japaneseTitle": "Battle in the Skies Above",
    "localizedTitle": "Battle in the Skies Above",
    "file": "10-13. Battle in the Skies Above.mp3",
    "duration": 173,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "After Despair and Hope",
    "japaneseTitle": "絶望と希望…そして",
    "localizedTitle": "After Despair and Hope",
    "file": "10-14. After Despair and Hope.mp3",
    "duration": 213,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Our Hope",
    "japaneseTitle": "二人の望み",
    "localizedTitle": "Our Hope",
    "file": "10-15. Our Hope.mp3",
    "duration": 120,
    "game": "xenoblade-2",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Parting",
    "japaneseTitle": "決別",
    "localizedTitle": "Parting",
    "file": "10-16. Parting.mp3",
    "duration": 186,
    "game": "xenoblade-2",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "The Tomorrow with You",
    "japaneseTitle": "The Tomorrow with You",
    "localizedTitle": "The Tomorrow with You",
    "file": "10-17. The Tomorrow with You.mp3",
    "duration": 259,
    "game": "xenoblade-2",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Escape - Going Through Clouds -",
    "japaneseTitle": "脱出　～雲を抜けて～",
    "localizedTitle": "Escape - Going Through Clouds -",
    "file": "10-18. Escape - Going Through Clouds -.mp3",
    "duration": 131,
    "game": "xenoblade-2",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Elysium",
    "japaneseTitle": "楽園",
    "localizedTitle": "Elysium",
    "file": "10-19. Elysium.mp3",
    "duration": 193,
    "game": "xenoblade-2",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "White All Around Us",
    "japaneseTitle": "White All Around Us",
    "localizedTitle": "White All Around Us",
    "file": "10-20. White All Around Us.mp3",
    "duration": 182,
    "game": "xenoblade-2",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "One Last You",
    "japaneseTitle": "One Last You",
    "localizedTitle": "One Last You",
    "file": "10-21. One Last You.mp3",
    "duration": 342,
    "game": "xenoblade-2",
    "composer": "Jen Bird"
  },
  {
    "title": "Xenoblade II - Where It All Began -",
    "japaneseTitle": "Xenoblade II - Where It All Began -",
    "localizedTitle": "Xenoblade II - Where It All Began -",
    "file": "6-01. Xenoblade II - Where It All Began -.mp3",
    "duration": 80,
    "game": "xenoblade-2",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Elysium, in the Blue Sky",
    "japaneseTitle": "Elysium, in the Blue Sky",
    "localizedTitle": "Elysium, in the Blue Sky",
    "file": "6-02. Elysium, in the Blue Sky.mp3",
    "duration": 105,
    "game": "xenoblade-2",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Argentum",
    "japaneseTitle": "アヴァリティア商会",
    "localizedTitle": "Argentum",
    "file": "6-03. Argentum.mp3",
    "duration": 219,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Argentum/Night",
    "japaneseTitle": "アヴァリティア商会/夜",
    "localizedTitle": "Argentum/Night",
    "file": "6-04. Argentum - Night.mp3",
    "duration": 177,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Bana's Theme",
    "japaneseTitle": "バーンのテーマ",
    "localizedTitle": "Bana's Theme",
    "file": "6-05. Bana's Theme.mp3",
    "duration": 29,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "A Ship in a Stormy Sea",
    "japaneseTitle": "嵐の船上",
    "localizedTitle": "A Ship in a Stormy Sea",
    "file": "6-06. A Ship in a Stormy Sea.mp3",
    "duration": 212,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "The Ancient Vessel",
    "japaneseTitle": "古代船",
    "localizedTitle": "The Ancient Vessel",
    "file": "6-07. The Ancient Vessel.mp3",
    "duration": 178,
    "game": "xenoblade-2",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Exploration",
    "japaneseTitle": "Exploration",
    "localizedTitle": "Exploration",
    "file": "6-08. Exploration.mp3",
    "duration": 169,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "A Portent Crawling Over",
    "japaneseTitle": "蠢くモノ",
    "localizedTitle": "A Portent Crawling Over",
    "file": "6-09. A Portent Crawling Over.mp3",
    "duration": 164,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Elysium in the Dream",
    "japaneseTitle": "夢の中の楽園",
    "localizedTitle": "Elysium in the Dream",
    "file": "6-10. Elysium in the Dream.mp3",
    "duration": 169,
    "game": "xenoblade-2",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "The Awakening",
    "japaneseTitle": "目覚め",
    "localizedTitle": "The Awakening",
    "file": "6-11. The Awakening.mp3",
    "duration": 130,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Crossing Swords",
    "japaneseTitle": "交わる剣",
    "localizedTitle": "Crossing Swords",
    "file": "6-12. Crossing Swords.mp3",
    "duration": 217,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Incoming!",
    "japaneseTitle": "Incoming!",
    "localizedTitle": "Incoming!",
    "file": "6-13. Incoming!.mp3",
    "duration": 245,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Gormotti Forest",
    "japaneseTitle": "グーラ領/森林",
    "localizedTitle": "Gormotti Forest",
    "file": "6-14. Gormotti Forest.mp3",
    "duration": 203,
    "game": "xenoblade-2",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Gormott",
    "japaneseTitle": "グーラ領",
    "localizedTitle": "Gormott",
    "file": "6-15. Gormott.mp3",
    "duration": 316,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Gormott/Night",
    "japaneseTitle": "グーラ領/夜",
    "localizedTitle": "Gormott/Night",
    "file": "6-16. Gormott - Night.mp3",
    "duration": 201,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Battle!!",
    "japaneseTitle": "戦闘!!",
    "localizedTitle": "Battle!!",
    "file": "6-17. Battle!!.mp3",
    "duration": 215,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Torigoth",
    "japaneseTitle": "トリゴの街",
    "localizedTitle": "Torigoth",
    "file": "6-18. Torigoth.mp3",
    "duration": 213,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Torigoth/Night",
    "japaneseTitle": "トリゴの街/夜",
    "localizedTitle": "Torigoth/Night",
    "file": "6-19. Torigoth - Night.mp3",
    "duration": 159,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Wanted Nia",
    "japaneseTitle": "人相書きとニア",
    "localizedTitle": "Wanted Nia",
    "file": "6-20. Wanted Nia.mp3",
    "duration": 130,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Omens of Life",
    "japaneseTitle": "生命の予兆",
    "localizedTitle": "Omens of Life",
    "file": "6-21. Omens of Life.mp3",
    "duration": 116,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Awakened DNA",
    "japaneseTitle": "ブレイド誕生",
    "localizedTitle": "Awakened DNA",
    "file": "6-22. Awakened DNA.mp3",
    "duration": 66,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "A Nopon's Life",
    "japaneseTitle": "ノポンの少年",
    "localizedTitle": "A Nopon's Life",
    "file": "6-23. A Nopon's Life.mp3",
    "duration": 141,
    "game": "xenoblade-2",
    "composer": "ACE (工藤ともり, CHiCO)"
  },
  {
    "title": "Tiger! Tiger!",
    "japaneseTitle": "Tiger! Tiger!",
    "localizedTitle": "Tiger! Tiger!",
    "file": "6-24. Tiger! Tiger!.mp3",
    "duration": 144,
    "game": "xenoblade-2",
    "composer": "Manami Kiyota"
  },
  {
    "title": "A Brewing Storm",
    "japaneseTitle": "立ちこめる暗雲",
    "localizedTitle": "A Brewing Storm",
    "file": "6-25. A Brewing Storm.mp3",
    "duration": 152,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Titan Battleship",
    "japaneseTitle": "巨神獣戦艦",
    "localizedTitle": "Titan Battleship",
    "file": "7-01. Titan Battleship.mp3",
    "duration": 277,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Monster Surprised You",
    "japaneseTitle": "Monster Surprised You",
    "localizedTitle": "Monster Surprised You",
    "file": "7-02. Monster Surprised You.mp3",
    "duration": 194,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Irritation",
    "japaneseTitle": "焦燥",
    "localizedTitle": "Irritation",
    "file": "7-03. Irritation.mp3",
    "duration": 161,
    "game": "xenoblade-2",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Where We Used To Be",
    "japaneseTitle": "Where We Used To Be",
    "localizedTitle": "Where We Used To Be",
    "file": "7-04. Where We Used To Be.mp3",
    "duration": 190,
    "game": "xenoblade-2",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Friendship",
    "japaneseTitle": "触れあい",
    "localizedTitle": "Friendship",
    "file": "7-05. Friendship.mp3",
    "duration": 174,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "The Towering Yggdrasil",
    "japaneseTitle": "そびえ立つ世界樹",
    "localizedTitle": "The Towering Yggdrasil",
    "file": "7-06. The Towering Yggdrasil.mp3",
    "duration": 156,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Ophion",
    "japaneseTitle": "サーペント",
    "localizedTitle": "Ophion",
    "file": "7-07. Ophion.mp3",
    "duration": 145,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Womb Center",
    "japaneseTitle": "インヴィディア/腹の中",
    "localizedTitle": "Womb Center",
    "file": "7-08. Womb Center.mp3",
    "duration": 184,
    "game": "xenoblade-2",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Garfont Mercenaries",
    "japaneseTitle": "フレースヴェルグ傭兵団",
    "localizedTitle": "Garfont Mercenaries",
    "file": "7-09. Garfont Mercenaries.mp3",
    "duration": 198,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Garfont Mercenaries/Night",
    "japaneseTitle": "フレースヴェルグ傭兵団/夜",
    "localizedTitle": "Garfont Mercenaries/Night",
    "file": "7-10. Garfont Mercenaries - Night.mp3",
    "duration": 128,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Death Match with Torna",
    "japaneseTitle": "Death Match with Torna",
    "localizedTitle": "Death Match with Torna",
    "file": "7-11. Death Match with Torna.mp3",
    "duration": 203,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Kingdom of Uraya",
    "japaneseTitle": "インヴィディア烈王国",
    "localizedTitle": "Kingdom of Uraya",
    "file": "7-12. Kingdom of Uraya.mp3",
    "duration": 202,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Kingdom of Uraya/Night",
    "japaneseTitle": "インヴィディア烈王国/夜",
    "localizedTitle": "Kingdom of Uraya/Night",
    "file": "7-13. Kingdom of Uraya - Night.mp3",
    "duration": 149,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Those Who Stand Against Our Path",
    "japaneseTitle": "行く手を阻む者たち",
    "localizedTitle": "Those Who Stand Against Our Path",
    "file": "7-14. Those Who Stand Against Our Path.mp3",
    "duration": 219,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Fonsa Myma",
    "japaneseTitle": "首都フォンス・マイム",
    "localizedTitle": "Fonsa Myma",
    "file": "7-15. Fonsa Myma.mp3",
    "duration": 180,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Fonsa Myma/Night",
    "japaneseTitle": "首都フォンス・マイム/夜",
    "localizedTitle": "Fonsa Myma/Night",
    "file": "7-16. Fonsa Myma - Night.mp3",
    "duration": 175,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "The Heroic Adventures",
    "japaneseTitle": "英雄の生涯",
    "localizedTitle": "The Heroic Adventures",
    "file": "7-17. The Heroic Adventures.mp3",
    "duration": 164,
    "game": "xenoblade-2",
    "composer": "Manami Kiyota"
  },
  {
    "title": "The Beginning of Darkness",
    "japaneseTitle": "闇の始動",
    "localizedTitle": "The Beginning of Darkness",
    "file": "7-18. The Beginning of Darkness.mp3",
    "duration": 175,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Drifting Soul",
    "japaneseTitle": "Drifting Soul",
    "localizedTitle": "Drifting Soul",
    "file": "7-19. Drifting Soul.mp3",
    "duration": 336,
    "game": "xenoblade-2",
    "composer": "Jen Bird"
  },
  {
    "title": "Counterattack",
    "japaneseTitle": "Counterattack",
    "localizedTitle": "Counterattack",
    "file": "8-01. Counterattack.mp3",
    "duration": 273,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "You Will Recall Our Names",
    "japaneseTitle": "さらに名を冠する者たち",
    "localizedTitle": "You Will Recall Our Names",
    "file": "8-02. You Will Recall Our Names.mp3",
    "duration": 217,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Desolation",
    "japaneseTitle": "哀惜",
    "localizedTitle": "Desolation",
    "file": "8-03. Desolation.mp3",
    "duration": 188,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Contrition",
    "japaneseTitle": "悔恨",
    "localizedTitle": "Contrition",
    "file": "8-04. Contrition.mp3",
    "duration": 167,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "War and Peace",
    "japaneseTitle": "ブリーフィング",
    "localizedTitle": "War and Peace",
    "file": "8-05. War and Peace.mp3",
    "duration": 166,
    "game": "xenoblade-2",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Driver VS",
    "japaneseTitle": "Driver VS",
    "localizedTitle": "Driver VS",
    "file": "8-06. Driver VS.mp3",
    "duration": 169,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Alba Cavanich",
    "japaneseTitle": "帝都アルバ・マーゲン",
    "localizedTitle": "Alba Cavanich",
    "file": "8-07. Alba Cavanich.mp3",
    "duration": 177,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Alba Cavanich/Night",
    "japaneseTitle": "帝都アルバ・マーゲン/夜",
    "localizedTitle": "Alba Cavanich/Night",
    "file": "8-08. Alba Cavanich - Night.mp3",
    "duration": 197,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Running",
    "japaneseTitle": "疾走",
    "localizedTitle": "Running",
    "file": "8-09. Running.mp3",
    "duration": 178,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Mor Ardain - Roaming the Wastes -",
    "japaneseTitle": "スペルビア帝国　～赤土を駆け抜けて～",
    "localizedTitle": "Mor Ardain - Roaming the Wastes -",
    "file": "8-10. Mor Ardain - Roaming the Wastes -.mp3",
    "duration": 185,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Mor Ardain/Night",
    "japaneseTitle": "スペルビア帝国/夜",
    "localizedTitle": "Mor Ardain/Night",
    "file": "8-11. Mor Ardain - Night.mp3",
    "duration": 195,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Eye of Shining Justice",
    "japaneseTitle": "覇王の心眼",
    "localizedTitle": "Eye of Shining Justice",
    "file": "8-12. Eye of Shining Justice.mp3",
    "duration": 115,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Bringer of Chaos! Ultimate",
    "japaneseTitle": "雷轟！アルティメット",
    "localizedTitle": "Bringer of Chaos! Ultimate",
    "file": "8-13. Bringer of Chaos! Ultimate.mp3",
    "duration": 205,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Song of Giga Rosa",
    "japaneseTitle": "最強サクラの歌",
    "localizedTitle": "Song of Giga Rosa",
    "file": "8-14. Song of Giga Rosa.mp3",
    "duration": 112,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Jump Towards the Morning Sun",
    "japaneseTitle": "朝陽に跳ぶ",
    "localizedTitle": "Jump Towards the Morning Sun",
    "file": "8-15. Jump Towards the Morning Sun.mp3",
    "duration": 142,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Leftherian Archipelago",
    "japaneseTitle": "リベラリタス島嶼群",
    "localizedTitle": "Leftherian Archipelago",
    "file": "8-16. Leftherian Archipelago.mp3",
    "duration": 241,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Leftherian Archipelago/Night",
    "japaneseTitle": "リベラリタス島嶼群/夜",
    "localizedTitle": "Leftherian Archipelago/Night",
    "file": "8-17. Leftherian Archipelago - Night.mp3",
    "duration": 264,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Gramps",
    "japaneseTitle": "故郷",
    "localizedTitle": "Gramps",
    "file": "8-18. Gramps.mp3",
    "duration": 162,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Gramps/Night",
    "japaneseTitle": "故郷/夜",
    "localizedTitle": "Gramps/Night",
    "file": "8-19. Gramps - Night.mp3",
    "duration": 182,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "A Place in the Sun",
    "japaneseTitle": "日だまりの中で",
    "localizedTitle": "A Place in the Sun",
    "file": "8-20. A Place in the Sun.mp3",
    "duration": 154,
    "game": "xenoblade-2",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Our Eternal Land",
    "japaneseTitle": "Our Eternal Land",
    "localizedTitle": "Our Eternal Land",
    "file": "9-01. Our Eternal Land.mp3",
    "duration": 191,
    "game": "xenoblade-2",
    "composer": "ANúNA"
  },
  {
    "title": "We Are the Chosen Ones",
    "japaneseTitle": "We Are the Chosen Ones",
    "localizedTitle": "We Are the Chosen Ones",
    "file": "9-02. We Are the Chosen Ones.mp3",
    "duration": 204,
    "game": "xenoblade-2",
    "composer": "ANúNA"
  },
  {
    "title": "Misgivings",
    "japaneseTitle": "疑念",
    "localizedTitle": "Misgivings",
    "file": "9-03. Misgivings.mp3",
    "duration": 170,
    "game": "xenoblade-2",
    "composer": "Manami Kiyota"
  },
  {
    "title": "The Impending Crisis",
    "japaneseTitle": "迫りくる危機",
    "localizedTitle": "The Impending Crisis",
    "file": "9-04. The Impending Crisis.mp3",
    "duration": 201,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Temperantia",
    "japaneseTitle": "テンペランティア",
    "localizedTitle": "Temperantia",
    "file": "9-05. Temperantia.mp3",
    "duration": 197,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Over the Sinful Entreaty",
    "japaneseTitle": "罪深き懇望の果てに",
    "localizedTitle": "Over the Sinful Entreaty",
    "file": "9-06. Over the Sinful Entreaty.mp3",
    "duration": 242,
    "game": "xenoblade-2",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Tantal",
    "japaneseTitle": "ルクスリア王国",
    "localizedTitle": "Tantal",
    "file": "9-07. Tantal.mp3",
    "duration": 204,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Tantal/Night",
    "japaneseTitle": "ルクスリア王国/夜",
    "localizedTitle": "Tantal/Night",
    "file": "9-08. Tantal - Night.mp3",
    "duration": 182,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Ever Come to an End",
    "japaneseTitle": "Ever Come to an End",
    "localizedTitle": "Ever Come to an End",
    "file": "9-09. Ever Come to an End.mp3",
    "duration": 188,
    "game": "xenoblade-2",
    "composer": "ANúNA"
  },
  {
    "title": "Shadow of the Lowlands",
    "japaneseTitle": "Shadow of the Lowlands",
    "localizedTitle": "Shadow of the Lowlands",
    "file": "9-10. Shadow of the Lowlands.mp3",
    "duration": 174,
    "game": "xenoblade-2",
    "composer": "ANúNA"
  },
  {
    "title": "The Past Revealed",
    "japaneseTitle": "暴かれる過去",
    "localizedTitle": "The Past Revealed",
    "file": "9-11. The Past Revealed.mp3",
    "duration": 145,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "The Decision",
    "japaneseTitle": "意志",
    "localizedTitle": "The Decision",
    "file": "9-12. The Decision.mp3",
    "duration": 301,
    "game": "xenoblade-2",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Loneliness",
    "japaneseTitle": "寂寞",
    "localizedTitle": "Loneliness",
    "file": "9-13. Loneliness.mp3",
    "duration": 171,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Spirit Crucible Elpys",
    "japaneseTitle": "エルピス霊洞",
    "localizedTitle": "Spirit Crucible Elpys",
    "file": "9-14. Spirit Crucible Elpys.mp3",
    "duration": 161,
    "game": "xenoblade-2",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Tensed Mind",
    "japaneseTitle": "張り詰めた糸",
    "localizedTitle": "Tensed Mind",
    "file": "9-15. Tensed Mind.mp3",
    "duration": 157,
    "game": "xenoblade-2",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Drifting Soul (Violin Version)",
    "japaneseTitle": "Drifting Soul (Violin Version)",
    "localizedTitle": "Drifting Soul (Violin Version)",
    "file": "9-16. Drifting Soul (Violin Version).mp3",
    "duration": 309,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "A Faint Hope",
    "japaneseTitle": "微かな希望",
    "localizedTitle": "A Faint Hope",
    "file": "9-17. A Faint Hope.mp3",
    "duration": 161,
    "game": "xenoblade-2",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Cliffs of Morytha",
    "japaneseTitle": "モルスの断崖",
    "localizedTitle": "Cliffs of Morytha",
    "file": "9-18. Cliffs of Morytha.mp3",
    "duration": 207,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Still, Move Forward!",
    "japaneseTitle": "それでも、前へ進め！",
    "localizedTitle": "Still, Move Forward!",
    "file": "9-19. Still, Move Forward!.mp3",
    "duration": 216,
    "game": "xenoblade-2",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Land of Morytha",
    "japaneseTitle": "モルスの地",
    "localizedTitle": "Land of Morytha",
    "file": "9-20. Land of Morytha.mp3",
    "duration": 220,
    "game": "xenoblade-2",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
];

// xenoblade-2-torna
const SONGS_XENOBLADE_2_TORNA = [
  {
    "title": "The Beginning of Our Memory",
    "japaneseTitle": "The Beginning of Our Memory",
    "localizedTitle": "The Beginning of Our Memory",
    "file": "11-01. The Beginning of Our Memory.mp3",
    "duration": 202,
    "game": "xenoblade-2-torna",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Lasaria Woodland",
    "japaneseTitle": "Lasaria Woodland",
    "localizedTitle": "Lasaria Woodland",
    "file": "11-02. Lasaria Woodland.mp3",
    "duration": 183,
    "game": "xenoblade-2-torna",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Battle!!/Torna",
    "japaneseTitle": "Battle!!/Torna",
    "localizedTitle": "Battle!!/Torna",
    "file": "11-03. Battle!! - Torna.mp3",
    "duration": 406,
    "game": "xenoblade-2-torna",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Four-limbed Titan/Gormott",
    "japaneseTitle": "Four-limbed Titan/Gormott",
    "localizedTitle": "Four-limbed Titan/Gormott",
    "file": "11-04. Four-limbed Titan - Gormott.mp3",
    "duration": 303,
    "game": "xenoblade-2-torna",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Kingdom of Torna",
    "japaneseTitle": "Kingdom of Torna",
    "localizedTitle": "Kingdom of Torna",
    "file": "11-05. Kingdom of Torna.mp3",
    "duration": 275,
    "game": "xenoblade-2-torna",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Kingdom of Torna/Night",
    "japaneseTitle": "Kingdom of Torna/Night",
    "localizedTitle": "Kingdom of Torna/Night",
    "file": "11-06. Kingdom of Torna - Night.mp3",
    "duration": 237,
    "game": "xenoblade-2-torna",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Auresco, Royal Capital",
    "japaneseTitle": "Auresco, Royal Capital",
    "localizedTitle": "Auresco, Royal Capital",
    "file": "11-07. Auresco, Royal Capital.mp3",
    "duration": 178,
    "game": "xenoblade-2-torna",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Auresco, Royal Capital/Night",
    "japaneseTitle": "Auresco, Royal Capital/Night",
    "localizedTitle": "Auresco, Royal Capital/Night",
    "file": "11-08. Auresco, Royal Capital - Night.mp3",
    "duration": 193,
    "game": "xenoblade-2-torna",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Over Despair and Animus",
    "japaneseTitle": "Over Despair and Animus",
    "localizedTitle": "Over Despair and Animus",
    "file": "11-09. Over Despair and Animus.mp3",
    "duration": 186,
    "game": "xenoblade-2-torna",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Our Paths May Never Cross",
    "japaneseTitle": "Our Paths May Never Cross",
    "localizedTitle": "Our Paths May Never Cross",
    "file": "11-10. Our Paths May Never Cross.mp3",
    "duration": 186,
    "game": "xenoblade-2-torna",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "A Moment of Eternity",
    "japaneseTitle": "A Moment of Eternity",
    "localizedTitle": "A Moment of Eternity",
    "file": "11-11. A Moment of Eternity.mp3",
    "duration": 298,
    "game": "xenoblade-2-torna",
    "composer": "Jen Bird"
  },
];

// xenoblade-3
const SONGS_XENOBLADE_3 = [
  {
    "title": "Off-Seer",
    "japaneseTitle": "おくりびと",
    "localizedTitle": "Off-Seer",
    "file": "12-01. Off-Seer.mp3",
    "duration": 198,
    "game": "xenoblade-3",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Battlefield - The Scramble for Life",
    "japaneseTitle": "戦場～命の奪い合い",
    "localizedTitle": "Battlefield - The Scramble for Life",
    "file": "12-02. Battlefield - The Scramble for Life.mp3",
    "duration": 218,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Tactical Action (Dynamic)",
    "japaneseTitle": "Tactical Action (Dynamic)",
    "localizedTitle": "Tactical Action (Dynamic)",
    "file": "12-03. Tactical Action (Dynamic).mp3",
    "duration": 110,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Tactical Action",
    "japaneseTitle": "Tactical Action",
    "localizedTitle": "Tactical Action",
    "file": "12-04. Tactical Action.mp3",
    "duration": 95,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "The Exhausted Victorious, The Speechless Defeated",
    "japaneseTitle": "憔悴した勝者、物言わぬ敗者",
    "localizedTitle": "The Exhausted Victorious, The Speechless Defeated",
    "file": "12-05. The Exhausted Victorious, The Speechless Defeated.mp3",
    "duration": 254,
    "game": "xenoblade-3",
    "composer": "救仁郷裕, 藤井理央"
  },
  {
    "title": "Young Warriors",
    "japaneseTitle": "幼き戦士達",
    "localizedTitle": "Young Warriors",
    "file": "12-06. Young Warriors.mp3",
    "duration": 195,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Lost Days of Warmth",
    "japaneseTitle": "過ぎ去りし温もりの日々",
    "localizedTitle": "Lost Days of Warmth",
    "file": "12-07. Lost Days of Warmth.mp3",
    "duration": 184,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Shining Aspiration - Inherited Melody",
    "japaneseTitle": "憧れの光～受け継がれる調べ",
    "localizedTitle": "Shining Aspiration - Inherited Melody",
    "file": "12-08. Shining Aspiration - Inherited Melody.mp3",
    "duration": 257,
    "game": "xenoblade-3",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Yzana Plains",
    "japaneseTitle": "イザナ平原",
    "localizedTitle": "Yzana Plains",
    "file": "12-09. Yzana Plains.mp3",
    "duration": 277,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Yzana Plains/Night",
    "japaneseTitle": "イザナ平原/夜",
    "localizedTitle": "Yzana Plains/Night",
    "file": "12-10. Yzana Plains - Night.mp3",
    "duration": 249,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Keves Battle",
    "japaneseTitle": "Keves Battle",
    "localizedTitle": "Keves Battle",
    "file": "12-11. Keves Battle.mp3",
    "duration": 199,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Soldiers' Paean",
    "japaneseTitle": "兵士達の賛歌",
    "localizedTitle": "Soldiers' Paean",
    "file": "12-12. Soldiers' Paean.mp3",
    "duration": 205,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Indescribable Unease",
    "japaneseTitle": "言い知れぬ不安",
    "localizedTitle": "Indescribable Unease",
    "file": "12-13. Indescribable Unease.mp3",
    "duration": 200,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Iris Network",
    "japaneseTitle": "Iris Network",
    "localizedTitle": "Iris Network",
    "file": "12-14. Iris Network.mp3",
    "duration": 204,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Alfeto Valley",
    "japaneseTitle": "アルフェト渓谷",
    "localizedTitle": "Alfeto Valley",
    "file": "13-01. Alfeto Valley.mp3",
    "duration": 195,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Alfeto Valley/Night",
    "japaneseTitle": "アルフェト渓谷/夜",
    "localizedTitle": "Alfeto Valley/Night",
    "file": "13-02. Alfeto Valley - Night.mp3",
    "duration": 221,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Nearing the Enemy",
    "japaneseTitle": "接敵",
    "localizedTitle": "Nearing the Enemy",
    "file": "13-03. Nearing the Enemy.mp3",
    "duration": 184,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Impending Crisis",
    "japaneseTitle": "迫り来る危機",
    "localizedTitle": "Impending Crisis",
    "file": "13-04. Impending Crisis.mp3",
    "duration": 231,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Immediate Threat",
    "japaneseTitle": "Immediate Threat",
    "localizedTitle": "Immediate Threat",
    "file": "13-05. Immediate Threat.mp3",
    "duration": 265,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "The Two Off-Seers",
    "japaneseTitle": "おくりびと二人",
    "localizedTitle": "The Two Off-Seers",
    "file": "13-06. The Two Off-Seers.mp3",
    "duration": 202,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Suffocating Reverberation",
    "japaneseTitle": "鳴り止む音",
    "localizedTitle": "Suffocating Reverberation",
    "file": "13-07. Suffocating Reverberation.mp3",
    "duration": 187,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Ouroboros Awakening",
    "japaneseTitle": "ウロボロス覚醒",
    "localizedTitle": "Ouroboros Awakening",
    "file": "13-08. Ouroboros Awakening.mp3",
    "duration": 154,
    "game": "xenoblade-3",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Moebius Battle",
    "japaneseTitle": "Moebius Battle",
    "localizedTitle": "Moebius Battle",
    "file": "13-09. Moebius Battle.mp3",
    "duration": 511,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Against the World",
    "japaneseTitle": "敵となる世界",
    "localizedTitle": "Against the World",
    "file": "13-10. Against the World.mp3",
    "duration": 206,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "A Life Woven Together",
    "japaneseTitle": "紡がれる命",
    "localizedTitle": "A Life Woven Together",
    "file": "13-11. A Life Woven Together.mp3",
    "duration": 192,
    "game": "xenoblade-3",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "A Life Sent On",
    "japaneseTitle": "おくられる命",
    "localizedTitle": "A Life Sent On",
    "file": "13-12. A Life Sent On.mp3",
    "duration": 116,
    "game": "xenoblade-3",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Quiet Intrigue",
    "japaneseTitle": "静かなる陰謀",
    "localizedTitle": "Quiet Intrigue",
    "file": "13-13. Quiet Intrigue.mp3",
    "duration": 188,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Hostile Colony (Dynamic)",
    "japaneseTitle": "Hostile Colony (Dynamic)",
    "localizedTitle": "Hostile Colony (Dynamic)",
    "file": "13-14. Hostile Colony (Dynamic).mp3",
    "duration": 154,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Hostile Colony",
    "japaneseTitle": "Hostile Colony",
    "localizedTitle": "Hostile Colony",
    "file": "13-15. Hostile Colony.mp3",
    "duration": 168,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Everyday Life",
    "japaneseTitle": "日常",
    "localizedTitle": "Everyday Life",
    "file": "13-16. Everyday Life.mp3",
    "duration": 221,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "The Bereaved and Those Left Behind",
    "japaneseTitle": "遺す者と残される者",
    "localizedTitle": "The Bereaved and Those Left Behind",
    "file": "13-17. The Bereaved and Those Left Behind.mp3",
    "duration": 249,
    "game": "xenoblade-3",
    "composer": "Yasunori Mitsuda, 野口明生"
  },
  {
    "title": "Off-Seer - Noah",
    "japaneseTitle": "おくりびと～ノア",
    "localizedTitle": "Off-Seer - Noah",
    "file": "13-18. Off-Seer - Noah.mp3",
    "duration": 124,
    "game": "xenoblade-3",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Millick Meadows",
    "japaneseTitle": "ミリク平原",
    "localizedTitle": "Millick Meadows",
    "file": "14-01. Millick Meadows.mp3",
    "duration": 266,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Millick Meadows/Night",
    "japaneseTitle": "ミリク平原/夜",
    "localizedTitle": "Millick Meadows/Night",
    "file": "14-02. Millick Meadows - Night.mp3",
    "duration": 196,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "A Formidable Enemy",
    "japaneseTitle": "A Formidable Enemy",
    "localizedTitle": "A Formidable Enemy",
    "file": "14-03. A Formidable Enemy.mp3",
    "duration": 214,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Eagus Wilderness",
    "japaneseTitle": "イーグス荒野",
    "localizedTitle": "Eagus Wilderness",
    "file": "14-04. Eagus Wilderness.mp3",
    "duration": 250,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Eagus Wilderness/Night",
    "japaneseTitle": "イーグス荒野/夜",
    "localizedTitle": "Eagus Wilderness/Night",
    "file": "14-05. Eagus Wilderness - Night.mp3",
    "duration": 249,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Suspicion",
    "japaneseTitle": "疑惑",
    "localizedTitle": "Suspicion",
    "file": "14-06. Suspicion.mp3",
    "duration": 175,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Sun-Dappled Glade",
    "japaneseTitle": "木漏れ日",
    "localizedTitle": "Sun-Dappled Glade",
    "file": "14-07. Sun-Dappled Glade.mp3",
    "duration": 178,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Blade - Those Who Know Fear",
    "japaneseTitle": "ブレイド～怖さを知る者",
    "localizedTitle": "Blade - Those Who Know Fear",
    "file": "14-08. Blade - Those Who Know Fear.mp3",
    "duration": 176,
    "game": "xenoblade-3",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Moebius",
    "japaneseTitle": "メビウス",
    "localizedTitle": "Moebius",
    "file": "14-09. Moebius.mp3",
    "duration": 205,
    "game": "xenoblade-3",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Those Who Devour Life",
    "japaneseTitle": "命を貪るモノ",
    "localizedTitle": "Those Who Devour Life",
    "file": "14-10. Those Who Devour Life.mp3",
    "duration": 200,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Remorse",
    "japaneseTitle": "後悔",
    "localizedTitle": "Remorse",
    "file": "14-11. Remorse.mp3",
    "duration": 196,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Keves Colony",
    "japaneseTitle": "ケヴェス軍コロニー",
    "localizedTitle": "Keves Colony",
    "file": "14-12. Keves Colony.mp3",
    "duration": 201,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Keves Colony/Night",
    "japaneseTitle": "ケヴェス軍コロニー/夜",
    "localizedTitle": "Keves Colony/Night",
    "file": "14-13. Keves Colony - Night.mp3",
    "duration": 178,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Encroaching Malice",
    "japaneseTitle": "忍び寄る悪意",
    "localizedTitle": "Encroaching Malice",
    "file": "14-14. Encroaching Malice.mp3",
    "duration": 183,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Ribbi Flats",
    "japaneseTitle": "リビ平原",
    "localizedTitle": "Ribbi Flats",
    "file": "14-15. Ribbi Flats.mp3",
    "duration": 186,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Ribbi Flats/Night",
    "japaneseTitle": "リビ平原/夜",
    "localizedTitle": "Ribbi Flats/Night",
    "file": "14-16. Ribbi Flats - Night.mp3",
    "duration": 200,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "You Will Know Our Names - Finale",
    "japaneseTitle": "名を冠する者たち～Finale",
    "localizedTitle": "You Will Know Our Names - Finale",
    "file": "14-17. You Will Know Our Names - Finale.mp3",
    "duration": 318,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Dannagh Desert",
    "japaneseTitle": "ダナ砂漠",
    "localizedTitle": "Dannagh Desert",
    "file": "15-01. Dannagh Desert.mp3",
    "duration": 241,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Dannagh Desert/Night",
    "japaneseTitle": "ダナ砂漠/夜",
    "localizedTitle": "Dannagh Desert/Night",
    "file": "15-02. Dannagh Desert - Night.mp3",
    "duration": 251,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Rae-Bel Tableland",
    "japaneseTitle": "レーベ高原",
    "localizedTitle": "Rae-Bel Tableland",
    "file": "15-03. Rae-Bel Tableland.mp3",
    "duration": 282,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Rae-Bel Tableland/Night",
    "japaneseTitle": "レーベ高原/夜",
    "localizedTitle": "Rae-Bel Tableland/Night",
    "file": "15-04. Rae-Bel Tableland - Night.mp3",
    "duration": 265,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Urayan Tunnels",
    "japaneseTitle": "インヴィディア坑道",
    "localizedTitle": "Urayan Tunnels",
    "file": "15-05. Urayan Tunnels.mp3",
    "duration": 196,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Ferronis",
    "japaneseTitle": "鉄巨神",
    "localizedTitle": "Ferronis",
    "file": "15-06. Ferronis.mp3",
    "duration": 234,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Confronting Our Past",
    "japaneseTitle": "過去との対峙",
    "localizedTitle": "Confronting Our Past",
    "file": "15-07. Confronting Our Past.mp3",
    "duration": 171,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Chain Attack",
    "japaneseTitle": "Chain Attack",
    "localizedTitle": "Chain Attack",
    "file": "15-08. Chain Attack.mp3",
    "duration": 330,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Off-Seer - Mio",
    "japaneseTitle": "おくりびと～ミオ",
    "localizedTitle": "Off-Seer - Mio",
    "file": "15-09. Off-Seer - Mio.mp3",
    "duration": 118,
    "game": "xenoblade-3",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Great Cotte Falls",
    "japaneseTitle": "コンティ大瀑布",
    "localizedTitle": "Great Cotte Falls",
    "file": "15-10. Great Cotte Falls.mp3",
    "duration": 234,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Great Cotte Falls/Night",
    "japaneseTitle": "コンティ大瀑布/夜",
    "localizedTitle": "Great Cotte Falls/Night",
    "file": "15-11. Great Cotte Falls - Night.mp3",
    "duration": 223,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Mysterious Land",
    "japaneseTitle": "神秘の地",
    "localizedTitle": "Mysterious Land",
    "file": "15-12. Mysterious Land.mp3",
    "duration": 198,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Maktha Wildwood",
    "japaneseTitle": "モルクナ大森林",
    "localizedTitle": "Maktha Wildwood",
    "file": "15-13. Maktha Wildwood.mp3",
    "duration": 298,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Maktha Wildwood/Night",
    "japaneseTitle": "モルクナ大森林/夜",
    "localizedTitle": "Maktha Wildwood/Night",
    "file": "15-14. Maktha Wildwood - Night.mp3",
    "duration": 276,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Light of the Moon - Hope",
    "japaneseTitle": "月の光～希望",
    "localizedTitle": "Light of the Moon - Hope",
    "file": "15-15. Light of the Moon - Hope.mp3",
    "duration": 207,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Agnus Colony",
    "japaneseTitle": "アグヌス軍コロニー",
    "localizedTitle": "Agnus Colony",
    "file": "16-01. Agnus Colony.mp3",
    "duration": 225,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Agnus Colony/Night",
    "japaneseTitle": "アグヌス軍コロニー/夜",
    "localizedTitle": "Agnus Colony/Night",
    "file": "16-02. Agnus Colony - Night.mp3",
    "duration": 194,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Agnus Battle",
    "japaneseTitle": "Agnus Battle",
    "localizedTitle": "Agnus Battle",
    "file": "16-03. Agnus Battle.mp3",
    "duration": 223,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "A Life Become Distant",
    "japaneseTitle": "遠のく命",
    "localizedTitle": "A Life Become Distant",
    "file": "16-04. A Life Become Distant.mp3",
    "duration": 177,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "In the Morning Mist",
    "japaneseTitle": "朝靄の中で",
    "localizedTitle": "In the Morning Mist",
    "file": "16-05. In the Morning Mist.mp3",
    "duration": 249,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Life's Fading Flame - Holding These Thoughts",
    "japaneseTitle": "消えゆく命の灯火～想いに乗せて",
    "localizedTitle": "Life's Fading Flame - Holding These Thoughts",
    "file": "16-06. Life's Fading Flame - Holding These Thoughts.mp3",
    "duration": 219,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Carrying the Weight of Life",
    "japaneseTitle": "命を背負って",
    "localizedTitle": "Carrying the Weight of Life",
    "file": "16-07. Carrying the Weight of Life.mp3",
    "duration": 269,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Rest Spot",
    "japaneseTitle": "Rest Spot",
    "localizedTitle": "Rest Spot",
    "file": "16-08. Rest Spot.mp3",
    "duration": 204,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Syra Hovering Reefs",
    "japaneseTitle": "シウェラ浮遊岩礁地帯",
    "localizedTitle": "Syra Hovering Reefs",
    "file": "16-09. Syra Hovering Reefs.mp3",
    "duration": 221,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Syra Hovering Reefs/Night",
    "japaneseTitle": "シウェラ浮遊岩礁地帯/夜",
    "localizedTitle": "Syra Hovering Reefs/Night",
    "file": "16-10. Syra Hovering Reefs - Night.mp3",
    "duration": 220,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Keves Castle",
    "japaneseTitle": "ケヴェスキャッスル",
    "localizedTitle": "Keves Castle",
    "file": "16-11. Keves Castle.mp3",
    "duration": 202,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Keves Castle (Battle)",
    "japaneseTitle": "ケヴェスキャッスル(バトル)",
    "localizedTitle": "Keves Castle (Battle)",
    "file": "16-12. Keves Castle (Battle).mp3",
    "duration": 191,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "The False Queens",
    "japaneseTitle": "偽りの女王",
    "localizedTitle": "The False Queens",
    "file": "16-13. The False Queens.mp3",
    "duration": 357,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Great Sword's Base",
    "japaneseTitle": "大剣の麓",
    "localizedTitle": "Great Sword's Base",
    "file": "16-14. Great Sword's Base.mp3",
    "duration": 234,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Great Sword's Base/Night",
    "japaneseTitle": "大剣の麓/夜",
    "localizedTitle": "Great Sword's Base/Night",
    "file": "16-15. Great Sword's Base - Night.mp3",
    "duration": 233,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "City",
    "japaneseTitle": "シティー",
    "localizedTitle": "City",
    "file": "17-01. City.mp3",
    "duration": 248,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "City/Night",
    "japaneseTitle": "シティー/夜",
    "localizedTitle": "City/Night",
    "file": "17-02. City - Night.mp3",
    "duration": 225,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Sailing the Seas",
    "japaneseTitle": "Sailing the Seas",
    "localizedTitle": "Sailing the Seas",
    "file": "17-03. Sailing the Seas.mp3",
    "duration": 287,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Erythia Sea",
    "japaneseTitle": "エルティア海",
    "localizedTitle": "Erythia Sea",
    "file": "17-04. Erythia Sea.mp3",
    "duration": 200,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Erythia Sea/Night",
    "japaneseTitle": "エルティア海/夜",
    "localizedTitle": "Erythia Sea/Night",
    "file": "17-05. Erythia Sea - Night.mp3",
    "duration": 177,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Battle on the Seas",
    "japaneseTitle": "Battle on the Seas",
    "localizedTitle": "Battle on the Seas",
    "file": "17-06. Battle on the Seas.mp3",
    "duration": 226,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Malevolent Hollow",
    "japaneseTitle": "邪念の空洞",
    "localizedTitle": "Malevolent Hollow",
    "file": "17-07. Malevolent Hollow.mp3",
    "duration": 213,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Li Garte Prison Camp",
    "japaneseTitle": "リ・ガート収容所",
    "localizedTitle": "Li Garte Prison Camp",
    "file": "17-08. Li Garte Prison Camp.mp3",
    "duration": 209,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Moebius Battle/M",
    "japaneseTitle": "Moebius Battle/M",
    "localizedTitle": "Moebius Battle/M",
    "file": "17-09. Moebius Battle - M.mp3",
    "duration": 511,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "That To Which The Defeated Cling",
    "japaneseTitle": "敗者が縋るモノ",
    "localizedTitle": "That To Which The Defeated Cling",
    "file": "17-10. That To Which The Defeated Cling.mp3",
    "duration": 196,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "A Step Away",
    "japaneseTitle": "A Step Away",
    "localizedTitle": "A Step Away",
    "file": "17-11. A Step Away.mp3",
    "duration": 295,
    "game": "xenoblade-3",
    "composer": "Sara Weeda"
  },
  {
    "title": "A Life Overflowing",
    "japaneseTitle": "こぼれ落ちる命",
    "localizedTitle": "A Life Overflowing",
    "file": "17-12. A Life Overflowing.mp3",
    "duration": 268,
    "game": "xenoblade-3",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Homecoming",
    "japaneseTitle": "成人の儀",
    "localizedTitle": "Homecoming",
    "file": "17-13. Homecoming.mp3",
    "duration": 437,
    "game": "xenoblade-3",
    "composer": "Yasunori Mitsuda, Mariam Abounnasr"
  },
  {
    "title": "Words That Never Reached You",
    "japaneseTitle": "届かぬ言葉",
    "localizedTitle": "Words That Never Reached You",
    "file": "17-14. Words That Never Reached You.mp3",
    "duration": 195,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Agnus Castle",
    "japaneseTitle": "アグヌスキャッスル",
    "localizedTitle": "Agnus Castle",
    "file": "18-01. Agnus Castle.mp3",
    "duration": 204,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Agnus Castle/Night",
    "japaneseTitle": "アグヌスキャッスル/夜",
    "localizedTitle": "Agnus Castle/Night",
    "file": "18-02. Agnus Castle - Night.mp3",
    "duration": 186,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Captocorn Peak",
    "japaneseTitle": "カプトコルヌ山嶺",
    "localizedTitle": "Captocorn Peak",
    "file": "18-03. Captocorn Peak.mp3",
    "duration": 218,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Captocorn Peak/Night",
    "japaneseTitle": "カプトコルヌ山嶺/夜",
    "localizedTitle": "Captocorn Peak/Night",
    "file": "18-04. Captocorn Peak - Night.mp3",
    "duration": 226,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Off-Seer - Miyabi",
    "japaneseTitle": "おくりびと～ミヤビ",
    "localizedTitle": "Off-Seer - Miyabi",
    "file": "18-05. Off-Seer - Miyabi.mp3",
    "duration": 138,
    "game": "xenoblade-3",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Feelings Risen to the Sky",
    "japaneseTitle": "空へと昇った想い",
    "localizedTitle": "Feelings Risen to the Sky",
    "file": "18-06. Feelings Risen to the Sky.mp3",
    "duration": 195,
    "game": "xenoblade-3",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Cloudkeep",
    "japaneseTitle": "天空の砦",
    "localizedTitle": "Cloudkeep",
    "file": "18-07. Cloudkeep.mp3",
    "duration": 221,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Converging Emotions",
    "japaneseTitle": "交差する想い",
    "localizedTitle": "Converging Emotions",
    "file": "18-08. Converging Emotions.mp3",
    "duration": 229,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Saffronia Village",
    "japaneseTitle": "サフロージュの里",
    "localizedTitle": "Saffronia Village",
    "file": "18-09. Saffronia Village.mp3",
    "duration": 262,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Off-Seer - Crys",
    "japaneseTitle": "おくりびと～クリス",
    "localizedTitle": "Off-Seer - Crys",
    "file": "18-10. Off-Seer - Crys.mp3",
    "duration": 109,
    "game": "xenoblade-3",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Feelings Upon This Melody",
    "japaneseTitle": "調べに想いを乗せて",
    "localizedTitle": "Feelings Upon This Melody",
    "file": "18-11. Feelings Upon This Melody.mp3",
    "duration": 188,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Fort O'Virbus",
    "japaneseTitle": "オービルブス要塞",
    "localizedTitle": "Fort O'Virbus",
    "file": "18-12. Fort O'Virbus.mp3",
    "duration": 183,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Fort O'Virbus/Night",
    "japaneseTitle": "オービルブス要塞/夜",
    "localizedTitle": "Fort O'Virbus/Night",
    "file": "18-13. Fort O'Virbus - Night.mp3",
    "duration": 224,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Elaice Highway",
    "japaneseTitle": "エレス大道",
    "localizedTitle": "Elaice Highway",
    "file": "18-14. Elaice Highway.mp3",
    "duration": 241,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Elaice Highway/Night",
    "japaneseTitle": "エレス大道/夜",
    "localizedTitle": "Elaice Highway/Night",
    "file": "18-15. Elaice Highway - Night.mp3",
    "duration": 258,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "The Great Sea Stirs",
    "japaneseTitle": "The Great Sea Stirs",
    "localizedTitle": "The Great Sea Stirs",
    "file": "18-16. The Great Sea Stirs.mp3",
    "duration": 252,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Ultimate Enemy",
    "japaneseTitle": "Ultimate Enemy",
    "localizedTitle": "Ultimate Enemy",
    "file": "18-17. Ultimate Enemy.mp3",
    "duration": 258,
    "game": "xenoblade-3",
    "composer": "救仁郷裕, 藤井理央"
  },
  {
    "title": "Brilliant Wings",
    "japaneseTitle": "Brilliant Wings～輝く対の翼",
    "localizedTitle": "Brilliant Wings",
    "file": "18-18. Brilliant Wings.mp3",
    "duration": 247,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Kaleidoscopic Core",
    "japaneseTitle": "Kaleidoscopic Core",
    "localizedTitle": "Kaleidoscopic Core",
    "file": "18-19. Kaleidoscopic Core.mp3",
    "duration": 215,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Origin Ascending",
    "japaneseTitle": "オリジン突入",
    "localizedTitle": "Origin Ascending",
    "file": "19-01. Origin Ascending.mp3",
    "duration": 219,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Origin",
    "japaneseTitle": "オリジン",
    "localizedTitle": "Origin",
    "file": "19-02. Origin.mp3",
    "duration": 418,
    "game": "xenoblade-3",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Origin Battle",
    "japaneseTitle": "Origin Battle",
    "localizedTitle": "Origin Battle",
    "file": "19-03. Origin Battle.mp3",
    "duration": 112,
    "game": "xenoblade-3",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Noah and N",
    "japaneseTitle": "ノアとエヌ",
    "localizedTitle": "Noah and N",
    "file": "19-04. Noah and N.mp3",
    "duration": 337,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Grand Theater of Life",
    "japaneseTitle": "命の劇場",
    "localizedTitle": "Grand Theater of Life",
    "file": "19-05. Grand Theater of Life.mp3",
    "duration": 216,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Z - Harbinger of the End",
    "japaneseTitle": "ゼット～終わりを告げる者",
    "localizedTitle": "Z - Harbinger of the End",
    "file": "19-06. Z - Harbinger of the End.mp3",
    "duration": 225,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "The Two Queens of Aionios",
    "japaneseTitle": "二人の女王",
    "localizedTitle": "The Two Queens of Aionios",
    "file": "19-07. The Two Queens of Aionios.mp3",
    "duration": 187,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Congregating Lives",
    "japaneseTitle": "集う命たち",
    "localizedTitle": "Congregating Lives",
    "file": "19-08. Congregating Lives.mp3",
    "duration": 205,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Showdown with Z",
    "japaneseTitle": "Showdown with Z",
    "localizedTitle": "Showdown with Z",
    "file": "19-09. Showdown with Z.mp3",
    "duration": 218,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "How the Future Endures",
    "japaneseTitle": "託される未来",
    "localizedTitle": "How the Future Endures",
    "file": "19-10. How the Future Endures.mp3",
    "duration": 289,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Something's Beginning to Move",
    "japaneseTitle": "動き始める刻",
    "localizedTitle": "Something's Beginning to Move",
    "file": "19-11. Something's Beginning to Move.mp3",
    "duration": 282,
    "game": "xenoblade-3",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Where We Belong",
    "japaneseTitle": "Where We Belong",
    "localizedTitle": "Where We Belong",
    "file": "19-12. Where We Belong.mp3",
    "duration": 335,
    "game": "xenoblade-3",
    "composer": "Sara Weeda"
  },
  {
    "title": "Melia - Ancient Memories",
    "japaneseTitle": "メリア～いにしえの記憶",
    "localizedTitle": "Melia - Ancient Memories",
    "file": "19-13. Melia - Ancient Memories.mp3",
    "duration": 234,
    "game": "xenoblade-3",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Nia - Toward the Heavens",
    "japaneseTitle": "ニア～天空に向かって",
    "localizedTitle": "Nia - Toward the Heavens",
    "file": "19-14. Nia - Toward the Heavens.mp3",
    "duration": 203,
    "game": "xenoblade-3",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Hope for the Future",
    "japaneseTitle": "未来への希望",
    "localizedTitle": "Hope for the Future",
    "file": "19-15. Hope for the Future.mp3",
    "duration": 187,
    "game": "xenoblade-3",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Noah and Mio - Our Melody",
    "japaneseTitle": "ノアとミオ～二人の調べ",
    "localizedTitle": "Noah and Mio - Our Melody",
    "file": "19-16. Noah and Mio - Our Melody.mp3",
    "duration": 47,
    "game": "xenoblade-3",
    "composer": "Yasunori Mitsuda"
  },
];

// xenoblade-3-fr
const SONGS_XENOBLADE_3_FR = [
  {
    "title": "At Our Life's End",
    "japaneseTitle": "紡がれた命の果てに",
    "localizedTitle": "At Our Life's End",
    "file": "20-01. At Our Life's End.mp3",
    "duration": 233,
    "game": "xenoblade-3-fr",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "New Battle!!!",
    "japaneseTitle": "New Battle!!!",
    "localizedTitle": "New Battle!!!",
    "file": "20-02. New Battle!!!.mp3",
    "duration": 407,
    "game": "xenoblade-3-fr",
    "composer": "Kenji Hiramatsu"
  },
  {
    "title": "Cent-Omnia Region",
    "japaneseTitle": "セントムニア地方",
    "localizedTitle": "Cent-Omnia Region",
    "file": "20-03. Cent-Omnia Region.mp3",
    "duration": 265,
    "game": "xenoblade-3-fr",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Cent-Omnia Region/Night",
    "japaneseTitle": "セントムニア地方/夜",
    "localizedTitle": "Cent-Omnia Region/Night",
    "file": "20-04. Cent-Omnia Region - Night.mp3",
    "duration": 276,
    "game": "xenoblade-3-fr",
    "composer": "ACE (TOMOri Kudo, CHiCO)"
  },
  {
    "title": "Yesterdale - Colony 9",
    "japaneseTitle": "望郷の山懐・コロニー9",
    "localizedTitle": "Yesterdale - Colony 9",
    "file": "20-05. Yesterdale - Colony 9.mp3",
    "duration": 229,
    "game": "xenoblade-3-fr",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Yesterdale - Colony 9/Night",
    "japaneseTitle": "望郷の山懐・コロニー9/夜",
    "localizedTitle": "Yesterdale - Colony 9/Night",
    "file": "20-06. Yesterdale - Colony 9 - Night.mp3",
    "duration": 237,
    "game": "xenoblade-3-fr",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Black Mountains - Valak Mountain",
    "japaneseTitle": "黒い山・ヴァラク山",
    "localizedTitle": "Black Mountains - Valak Mountain",
    "file": "20-07. Black Mountains - Valak Mountain.mp3",
    "duration": 294,
    "game": "xenoblade-3-fr",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Black Mountains - Valak Mountain/Night",
    "japaneseTitle": "黒い山・ヴァラク山/夜",
    "localizedTitle": "Black Mountains - Valak Mountain/Night",
    "file": "20-08. Black Mountains - Valak Mountain - Night.mp3",
    "duration": 242,
    "game": "xenoblade-3-fr",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Black Mountains - Prison Island",
    "japaneseTitle": "黒い山・監獄島",
    "localizedTitle": "Black Mountains - Prison Island",
    "file": "20-09. Black Mountains - Prison Island.mp3",
    "duration": 294,
    "game": "xenoblade-3-fr",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Black Mountains - Prison Island/Night",
    "japaneseTitle": "黒い山・監獄島/夜",
    "localizedTitle": "Black Mountains - Prison Island/Night",
    "file": "20-10. Black Mountains - Prison Island - Night.mp3",
    "duration": 244,
    "game": "xenoblade-3-fr",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Redeem the Future",
    "japaneseTitle": "Battle for the Future",
    "localizedTitle": "Redeem the Future",
    "file": "20-11. Redeem the Future.mp3",
    "duration": 223,
    "game": "xenoblade-3-fr",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Redeem the Future - Finale",
    "japaneseTitle": "Final Battle for the Future",
    "localizedTitle": "Redeem the Future - Finale",
    "file": "20-12. Redeem the Future - Finale.mp3",
    "duration": 234,
    "game": "xenoblade-3-fr",
    "composer": "Manami Kiyota"
  },
  {
    "title": "Two Worlds and Two Hearts",
    "japaneseTitle": "二つの世界と二人の想い",
    "localizedTitle": "Two Worlds and Two Hearts",
    "file": "20-13. Two Worlds and Two Hearts.mp3",
    "duration": 192,
    "game": "xenoblade-3-fr",
    "composer": "Mariam Abounnasr"
  },
  {
    "title": "Future Awaits",
    "japaneseTitle": "Future Awaits",
    "localizedTitle": "Future Awaits",
    "file": "20-14. Future Awaits.mp3",
    "duration": 285,
    "game": "xenoblade-3-fr",
    "composer": "Joanne Hogg"
  },
];

// xenoblade-x
const SONGS_XENOBLADE_X = [
  {
    "title": "no1=CODENAMEZ",
    "japaneseTitle": "no1=CODENAMEZ",
    "localizedTitle": "Codename Z",
    "file": "1-01. no1=CODENAMEZ.mp3",
    "duration": 314,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "no2=THEMEX",
    "japaneseTitle": "no2=THEMEX",
    "localizedTitle": "Theme X",
    "file": "1-02. no2=THEMEX.mp3",
    "duration": 320,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "no3=NO.EX01",
    "japaneseTitle": "no3=NO.EX01",
    "localizedTitle": "No.EX 01",
    "file": "1-03. no3=NO.EX01.mp3",
    "duration": 256,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "no4=D91M",
    "japaneseTitle": "no4=D91M",
    "localizedTitle": "Requiem",
    "file": "1-04. no4=D91M.mp3",
    "duration": 299,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "no5=KAKU-WEST＊→▲★★KAI",
    "japaneseTitle": "no5=KAKU-WEST＊→▲★★KAI",
    "localizedTitle": "Kakusei Houkai",
    "file": "1-05. no5=KAKU-WEST＊→▲★★KAI.mp3",
    "duration": 365,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "no6=LP",
    "japaneseTitle": "no6=LP",
    "localizedTitle": "LP",
    "file": "1-06. no6=LP.mp3",
    "duration": 286,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "no7=G-LOW-S→F.S.K.O",
    "japaneseTitle": "no7=G-LOW-S→F.S.K.O",
    "localizedTitle": "Growth F.S.K.O",
    "file": "1-07. no7=G-LOW-S→F.S.K.O.mp3",
    "duration": 328,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "no8=UN↑口and巨DIE",
    "japaneseTitle": "no8=UN↑口and巨DIE",
    "localizedTitle": "Michi Kyodai",
    "file": "1-08. no8=UN↑口and巨DIE.mp3",
    "duration": 308,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "no9=MONOX",
    "japaneseTitle": "no9=MONOX",
    "localizedTitle": "Mono X",
    "file": "1-09. no9=MONOX.mp3",
    "duration": 197,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "no10=CR17S19S8",
    "japaneseTitle": "no10=CR17S19S8",
    "localizedTitle": "CR17S19S8",
    "file": "1-10. no10=CR17S19S8.mp3",
    "duration": 357,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "no11=RE:ARR.X",
    "japaneseTitle": "no11=RE:ARR.X",
    "localizedTitle": "Re:Arr X",
    "file": "1-11. no11=REARR.X.mp3",
    "duration": 370,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "Your Voice",
    "japaneseTitle": "Your Voice",
    "localizedTitle": "Your Voice",
    "file": "1-12. Your Voice.mp3",
    "duration": 302,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Mika Kobayashi"
  },
  {
    "title": "Wir fliegen",
    "japaneseTitle": "Wir fliegen",
    "localizedTitle": "Wir fliegen",
    "file": "1-13. Wir fliegen.mp3",
    "duration": 297,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Cyua"
  },
  {
    "title": "So nah, so fern",
    "japaneseTitle": "So nah, so fern",
    "localizedTitle": "So nah, so fern",
    "file": "1-14. So nah, so fern.mp3",
    "duration": 285,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Mika Kobayashi"
  },
  {
    "title": "NEMOUSU秘OUS",
    "japaneseTitle": "NEMOUSU秘OUS",
    "localizedTitle": "NEMOUSU秘OUS",
    "file": "1-15. NEMOUSU秘OUS.mp3",
    "duration": 296,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "Black tar",
    "japaneseTitle": "Black tar",
    "localizedTitle": "Black tar",
    "file": "2-01. Black tar.mp3",
    "duration": 367,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "mpi"
  },
  {
    "title": "z5m20i12r04a28",
    "japaneseTitle": "z5m20i12r04a28",
    "localizedTitle": "Z5 Mira",
    "file": "2-02. z5m20i12r04a28.mp3",
    "duration": 297,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "z10b2r0i1e2f0i9n1g3",
    "japaneseTitle": "z10b2r0i1e2f0i9n1g3",
    "localizedTitle": "Z10 Briefing",
    "file": "2-03. z10b2r0i1e2f0i9n1g3.mp3",
    "duration": 269,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "Uncontrollable",
    "japaneseTitle": "Uncontrollable",
    "localizedTitle": "Uncontrollable",
    "file": "2-04. Uncontrollable.mp3",
    "duration": 228,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Mika Kobayashi & mpi"
  },
  {
    "title": "z15f20i12e09l14d",
    "japaneseTitle": "z15f20i12e09l14d",
    "localizedTitle": "Z15 Field",
    "file": "2-05. z15f20i12e09l14d.mp3",
    "duration": 379,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "z39b20co13mi01cal09",
    "japaneseTitle": "z39b20co13mi01cal09",
    "localizedTitle": "Z39B Comical",
    "file": "2-06. z39b20co13mi01cal09.mp3",
    "duration": 227,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "By my side",
    "japaneseTitle": "By my side",
    "localizedTitle": "By my side",
    "file": "2-07. By my side.mp3",
    "duration": 189,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Aimee Blackschleger"
  },
  {
    "title": "z?2f0i1e2l0d914",
    "japaneseTitle": "z?2f0i1e2l0d914",
    "localizedTitle": "Z ? Field",
    "file": "2-08. z2f0i1e2l0d914.mp3",
    "duration": 156,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "z37b20a13t01t08le",
    "japaneseTitle": "z37b20a13t01t08le",
    "localizedTitle": "Z37 Battle",
    "file": "2-09. z37b20a13t01t08le.mp3",
    "duration": 188,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "z30huri2ba0tt12le1110",
    "japaneseTitle": "z30huri2ba0tt12le1110",
    "localizedTitle": "Z30 Furi Battle",
    "file": "2-10. z30huri2ba0tt12le1110.mp3",
    "duration": 171,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "z12e201v2e091n4t",
    "japaneseTitle": "z12e201v2e091n4t",
    "localizedTitle": "Z12 Event",
    "file": "2-11. z12e201v2e091n4t.mp3",
    "duration": 411,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "z29ba2t0t1l301e17",
    "japaneseTitle": "z29ba2t0t1l301e17",
    "localizedTitle": "Z29 Battle",
    "file": "2-12. z29ba2t0t1l301e17.mp3",
    "duration": 172,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "z16b2gu012ro09u1su4",
    "japaneseTitle": "z16b2gu012ro09u1su4",
    "localizedTitle": "Z16B Growth",
    "file": "2-13. z16b2gu012ro09u1su4.mp3",
    "duration": 172,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "z13e20v12e09n14t",
    "japaneseTitle": "z13e20v12e09n14t",
    "localizedTitle": "Z13 Event",
    "file": "2-14. z13e20v12e09n14t.mp3",
    "duration": 356,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "z7b2012lp0427arr",
    "japaneseTitle": "z7b2012lp0427arr",
    "localizedTitle": "Z7B LP Arrange",
    "file": "2-15. z7b2012lp0427arr.mp3",
    "duration": 142,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "In the forest",
    "japaneseTitle": "In the forest",
    "localizedTitle": "In the forest",
    "file": "2-16. In the forest.mp3",
    "duration": 314,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "mpi"
  },
  {
    "title": "z23s20a12m0a9-1r4u",
    "japaneseTitle": "z23s20a12m0a9-1r4u",
    "localizedTitle": "Z23 Samaar",
    "file": "2-17. z23s20a12m0a9-1r4u.mp3",
    "duration": 296,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "The way",
    "japaneseTitle": "The way",
    "localizedTitle": "The way",
    "file": "2-18. The way.mp3",
    "duration": 336,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Sayulee"
  },
  {
    "title": "The key we've lost",
    "japaneseTitle": "The key we've lost",
    "localizedTitle": "The key we've lost",
    "file": "3-01. The key we've lost.mp3",
    "duration": 372,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Mika Kobayashi"
  },
  {
    "title": "N周L辺A",
    "japaneseTitle": "N周L辺A",
    "localizedTitle": "NLA Shuuhen",
    "file": "3-02. N周L辺A.mp3",
    "duration": 318,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "N木ig木ht木L",
    "japaneseTitle": "N木ig木ht木L",
    "localizedTitle": "Yakou Mori",
    "file": "3-03. N木ig木ht木L.mp3",
    "duration": 330,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "N市L街A",
    "japaneseTitle": "N市L街A",
    "localizedTitle": "NLA Shigai",
    "file": "3-04. N市L街A.mp3",
    "duration": 307,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "亡KEI却KOKU心",
    "japaneseTitle": "亡KEI却KOKU心",
    "localizedTitle": "Boukyaku Keikoku",
    "file": "3-05. 亡KEI却KOKU心.mp3",
    "duration": 347,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "Melancholia",
    "japaneseTitle": "Melancholia",
    "localizedTitle": "Melancholia",
    "file": "3-06. Melancholia.mp3",
    "duration": 250,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Aimee Blackschleger"
  },
  {
    "title": "fiKAIeldJOU",
    "japaneseTitle": "fiKAIeldJOU",
    "localizedTitle": "Field Kaijou",
    "file": "3-07. fiKAIeldJOU.mp3",
    "duration": 377,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "aBOreSSs",
    "japaneseTitle": "aBOreSSs",
    "localizedTitle": "Ares Boss",
    "file": "3-08. aBOreSSs.mp3",
    "duration": 336,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "MNN＋@0・",
    "japaneseTitle": "MNN＋@0・",
    "localizedTitle": "Ma-non",
    "file": "3-09. MNN＋@0・.mp3",
    "duration": 351,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "In the forest <X→Z ver.>",
    "japaneseTitle": "In the forest <X→Z ver.>",
    "localizedTitle": "In the forest <X/Y ver.>",
    "file": "3-10. In the forest X→Z ver..mp3",
    "duration": 288,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "46-:ri9",
    "japaneseTitle": "46-:ri9",
    "localizedTitle": "Shiro no Tairiku",
    "file": "3-11. 46-ri9.mp3",
    "duration": 312,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "96-:rip",
    "japaneseTitle": "96-:rip",
    "localizedTitle": "Kuro no Tairiku",
    "file": "3-12. 96-rip.mp3",
    "duration": 354,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "raTEoREkiSImeAra",
    "japaneseTitle": "raTEoREkiSImeAra",
    "localizedTitle": "raTEoREkiSImeAra",
    "file": "3-13. raTEoREkiSImeAra.mp3",
    "duration": 409,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "Don't worry",
    "japaneseTitle": "Don't worry",
    "localizedTitle": "Don't worry",
    "file": "3-14. Don't worry.mp3",
    "duration": 236,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Aimee Blackschleger"
  },
  {
    "title": "PianoX1",
    "japaneseTitle": "PianoX1",
    "localizedTitle": "PianoX1",
    "file": "4-01. PianoX1.mp3",
    "duration": 232,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "PianoX2",
    "japaneseTitle": "PianoX2",
    "localizedTitle": "PianoX2",
    "file": "4-02. PianoX2.mp3",
    "duration": 233,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "PianoX3",
    "japaneseTitle": "PianoX3",
    "localizedTitle": "PianoX3",
    "file": "4-03. PianoX3.mp3",
    "duration": 175,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "X-BT1",
    "japaneseTitle": "X-BT1",
    "localizedTitle": "X-BT1",
    "file": "4-04. X-BT1.mp3",
    "duration": 118,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "X-BT2",
    "japaneseTitle": "X-BT2",
    "localizedTitle": "X-BT2",
    "file": "4-05. X-BT2.mp3",
    "duration": 297,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "X-BT3",
    "japaneseTitle": "X-BT3",
    "localizedTitle": "X-BT3",
    "file": "4-06. X-BT3.mp3",
    "duration": 283,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "X-BT4",
    "japaneseTitle": "X-BT4",
    "localizedTitle": "X-BT4",
    "file": "4-07. X-BT4.mp3",
    "duration": 300,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
  {
    "title": "In the forest (no vocal effects ver.)",
    "japaneseTitle": "In the forest (no vocal effects ver.)",
    "localizedTitle": "In the forest (no vocal effects ver.)",
    "file": "4-08. In the forest (no vocal effects ver.).mp3",
    "duration": 313,
    "game": "xenoblade-x",
    "composer": "Hiroyuki SAWANO",
    "artist": "Hiroyuki SAWANO"
  },
];

// xenoblade-x-de
const SONGS_XENOBLADE_X_DE = [
  {
    "title": "Don't worry <2XDv>",
    "japaneseTitle": "Don't worry <2XDv>",
    "localizedTitle": "Don't worry <2XDv>",
    "file": "Don_t worry ＜2XDv＞.mp3",
    "duration": 233,
    "game": "xenoblade-x-de",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "Don't worry <2XDv> (Instrumental ver.)",
    "japaneseTitle": "Don't worry <2XDv> (Instrumental ver.)",
    "localizedTitle": "Don't worry <2XDv> (Instrumental ver.)",
    "file": "Don_t worry ＜2XDv＞ (no vocals ver.).mp3",
    "duration": 233,
    "game": "xenoblade-x-de",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "2S-FIELD",
    "japaneseTitle": "2S-FIELD",
    "localizedTitle": "Volitaris Field",
    "file": "2S-FIELD.mp3",
    "duration": 170,
    "game": "xenoblade-x-de",
    "composer": "Misaki Umase"
  },
  {
    "title": "2D-BATTLE",
    "japaneseTitle": "2D-BATTLE",
    "localizedTitle": "Volitaris Battle",
    "file": "2D-BATTLE.mp3",
    "duration": 178,
    "game": "xenoblade-x-de",
    "composer": "Misaki Umase"
  },
  {
    "title": "2XDLB (Instrumental ver.)",
    "japaneseTitle": "2XDLB (Instrumental ver.)",
    "localizedTitle": "2DXLB (Instrumental ver.)",
    "file": "5-05. 2DXLB (Instrumental ver.).mp3",
    "folder": "Xenoblade Chronicles X - Definitive Edition (Switch, Switch 2) (gamerip) (2025)",
    "duration": 192,
    "game": "xenoblade-x-de",
    "composer": "Hiroyuki SAWANO"
  },
  {
    "title": "2XDLB",
    "japaneseTitle": "2XDLB",
    "localizedTitle": "2DXLB",
    "file": "2XDLB.mp3",
    "duration": 186,
    "game": "xenoblade-x-de",
    "composer": "Hiroyuki SAWANO",
    "artist": "Laco"
  },
  {
    "title": "The key we've lost <2XDv>",
    "japaneseTitle": "The key we've lost <2XDv>",
    "localizedTitle": "The key we've lost <2XDv>",
    "file": "The key we_ve lost ＜2XDv＞.mp3",
    "duration": 198,
    "game": "xenoblade-x-de",
    "composer": "Hiroyuki SAWANO",
    "artist": "Laco"
  },
  {
    "title": "2N-ERA",
    "japaneseTitle": "2N-ERA",
    "localizedTitle": "2N-ERA",
    "file": "2N-ERA.mp3",
    "duration": 381,
    "game": "xenoblade-x-de",
    "composer": "Misaki Umase"
  },
  {
    "title": "2D-TRAVELOGUE",
    "japaneseTitle": "2D-TRAVELOGUE",
    "localizedTitle": "2D-TRAVELOGUE",
    "file": "2D-TRAVELOGUE.mp3",
    "duration": 444,
    "game": "xenoblade-x-de",
    "composer": "Misaki Umase"
  },
];

// xenogears
const SONGS_XENOGEARS = [
  {
    "title": "Dark Daybreak",
    "japaneseTitle": "Dark Daybreak",
    "localizedTitle": "Dark Dawn",
    "file": "1-01. Dark Daybreak.mp3",
    "duration": 292,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "STARS OF TEARS (OUT TAKE)",
    "japaneseTitle": "STARS OF TEARS (OUT TAKE)",
    "localizedTitle": "STARS OF TEARS (OUT TAKE)",
    "file": "1-02. STARS OF TEARS (OUT TAKE).mp3",
    "duration": 177,
    "game": "xenogears",
    "composer": "Joanne Hogg"
  },
  {
    "title": "Bonds of Sea and Flame",
    "japaneseTitle": "Bonds of Sea and Flame",
    "localizedTitle": "Bonds of Sea and Flame",
    "file": "1-03. Bonds of Sea and Flame.mp3",
    "duration": 189,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "My Village is Number One!",
    "japaneseTitle": "My Village is Number One!",
    "localizedTitle": "Village Pride",
    "file": "1-04. My Village is Number One!.mp3",
    "duration": 244,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Valley Where the Wind Is Born",
    "japaneseTitle": "Valley Where the Wind Is Born",
    "localizedTitle": "Wind from the Valley",
    "file": "1-05. Valley Where the Wind Is Born.mp3",
    "duration": 153,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Faraway Promise",
    "japaneseTitle": "Faraway Promise",
    "localizedTitle": "A Distant Promise",
    "file": "1-06. Faraway Promise.mp3",
    "duration": 112,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Steel Giant",
    "japaneseTitle": "Steel Giant",
    "localizedTitle": "Steel Giants",
    "file": "1-07. Steel Giant.mp3",
    "duration": 149,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "The Blackmoon Forest",
    "japaneseTitle": "The Blackmoon Forest",
    "localizedTitle": "The Blackmoon Forest",
    "file": "1-08. The Blackmoon Forest.mp3",
    "duration": 244,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Where the Egg of Dreams Hatches",
    "japaneseTitle": "Where the Egg of Dreams Hatches",
    "localizedTitle": "Where Dreams Hatch",
    "file": "1-09. Where the Egg of Dreams Hatches.mp3",
    "duration": 183,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Dozing Off (Short Version)",
    "japaneseTitle": "Dozing Off (Short Version)",
    "localizedTitle": "Doze (Short Version)",
    "file": "1-10. Dozing Off (Short Version).mp3",
    "duration": 10,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Dazil, Town of Burning Sands",
    "japaneseTitle": "Dazil, Town of Burning Sands",
    "localizedTitle": "Desert City Dazil",
    "file": "1-11. Dazil, Town of Burning Sands.mp3",
    "duration": 208,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Aspiration",
    "japaneseTitle": "Aspiration",
    "localizedTitle": "Adoration",
    "file": "1-12. Aspiration.mp3",
    "duration": 189,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Grahf, Ruler of Darkness",
    "japaneseTitle": "Grahf, Ruler of Darkness",
    "localizedTitle": "Grahf -Ruler of Darkness-",
    "file": "1-13. Grahf, Ruler of Darkness.mp3",
    "duration": 231,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Fuse",
    "japaneseTitle": "Fuse",
    "localizedTitle": "Fuse",
    "file": "1-14. Fuse.mp3",
    "duration": 154,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "After the Soldiers' Dreams",
    "japaneseTitle": "After the Soldiers' Dreams",
    "localizedTitle": "Dreams of the Brave",
    "file": "1-15. After the Soldiers' Dreams.mp3",
    "duration": 309,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Unstealable Jewel",
    "japaneseTitle": "Unstealable Jewel",
    "localizedTitle": "Intangible Treasure",
    "file": "1-16. Unstealable Jewel.mp3",
    "duration": 207,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Aveh, The Ancient Dance",
    "japaneseTitle": "Aveh, The Ancient Dance",
    "localizedTitle": "Ancient Dance of Aveh",
    "file": "1-17. Aveh, The Ancient Dance.mp3",
    "duration": 111,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Invasion",
    "japaneseTitle": "Invasion",
    "localizedTitle": "Infiltration",
    "file": "1-18. Invasion.mp3",
    "duration": 193,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Stage of Death",
    "japaneseTitle": "Stage of Death",
    "localizedTitle": "Deadly Dance",
    "file": "1-19. Stage of Death.mp3",
    "duration": 159,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "In A Dark Slumber...",
    "japaneseTitle": "In A Dark Slumber...",
    "localizedTitle": "Dark Slumber",
    "file": "1-20. In A Dark Slumber....mp3",
    "duration": 23,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "The Gentle Breeze Sings",
    "japaneseTitle": "The Gentle Breeze Sings",
    "localizedTitle": "Windy Song",
    "file": "1-21. The Gentle Breeze Sings.mp3",
    "duration": 250,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Our Wounded Bodies Shall Advance Towards the Light",
    "japaneseTitle": "Our Wounded Bodies Shall Advance Towards the Light",
    "localizedTitle": "We Wounded Follow the Light",
    "file": "1-22. Our Wounded Bodies Shall Advance Towards the Light.mp3",
    "duration": 117,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "lost... Broken Shards",
    "japaneseTitle": "lost... Broken Shards",
    "localizedTitle": "Lost... -Screeching Shards-",
    "file": "1-23. lost... Broken Shards.mp3",
    "duration": 66,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Thames, Spirit of the Men of the Sea",
    "japaneseTitle": "Thames, Spirit of the Men of the Sea",
    "localizedTitle": "The Thames -Men of the Sea-",
    "file": "1-24. Thames, Spirit of the Men of the Sea.mp3",
    "duration": 231,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "The Blue Traveler",
    "japaneseTitle": "The Blue Traveler",
    "localizedTitle": "Blue Traveler",
    "file": "1-25. The Blue Traveler.mp3",
    "duration": 192,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "In a Prison of Peace and Regret",
    "japaneseTitle": "In a Prison of Peace and Regret",
    "localizedTitle": "Cage of Remorse and Relief",
    "file": "2-01. In a Prison of Peace and Regret.mp3",
    "duration": 163,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Jaws of Ice",
    "japaneseTitle": "Jaws of Ice",
    "localizedTitle": "Icy Chin",
    "file": "2-02. Jaws of Ice.mp3",
    "duration": 174,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Crimson Knight",
    "japaneseTitle": "Crimson Knight",
    "localizedTitle": "Blazing Knights",
    "file": "2-03. Crimson Knight.mp3",
    "duration": 163,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "October Mermaid",
    "japaneseTitle": "October Mermaid",
    "localizedTitle": "October Mermaid",
    "file": "2-04. October Mermaid.mp3",
    "duration": 268,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "The Wind Calls to Shevat in the Blue Sky",
    "japaneseTitle": "The Wind Calls to Shevat in the Blue Sky",
    "localizedTitle": "Shevat -The Wind Calls-",
    "file": "2-05. The Wind Calls to Shevat in the Blue Sky.mp3",
    "duration": 212,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "The Sky, the Clouds, and You",
    "japaneseTitle": "The Sky, the Clouds, and You",
    "localizedTitle": "With the Sky, the Clouds, and You",
    "file": "2-06. The Sky, the Clouds, and You.mp3",
    "duration": 156,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "A Gathering of Stars in the Night Sky",
    "japaneseTitle": "A Gathering of Stars in the Night Sky",
    "localizedTitle": "Gather Up the Night Stars",
    "file": "2-07. A Gathering of Stars in the Night Sky.mp3",
    "duration": 185,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Tears of the Stars, Thoughts of the People",
    "japaneseTitle": "Tears of the Stars, Thoughts of the People",
    "localizedTitle": "Earthly Tears, Mortal Thoughts",
    "file": "2-08. Tears of the Stars, Thoughts of the People.mp3",
    "duration": 215,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Flight",
    "japaneseTitle": "Flight",
    "localizedTitle": "Soaring",
    "file": "2-09. Flight.mp3",
    "duration": 289,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Wings",
    "japaneseTitle": "Wings",
    "localizedTitle": "Wings",
    "file": "2-10. Wings.mp3",
    "duration": 141,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Solaris, Celestial Paradise",
    "japaneseTitle": "Solaris, Celestial Paradise",
    "localizedTitle": "Solaris -Supernal Paradise-",
    "file": "2-11. Solaris, Celestial Paradise.mp3",
    "duration": 224,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Dozing Off (Long Version)",
    "japaneseTitle": "Dozing Off (Long Version)",
    "localizedTitle": "Doze (Long Version)",
    "file": "2-12. Dozing Off (Long Version).mp3",
    "duration": 14,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "The One Who is Torn Apart",
    "japaneseTitle": "The One Who is Torn Apart",
    "localizedTitle": "Torn",
    "file": "2-13. The One Who is Torn Apart.mp3",
    "duration": 307,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "A Prayer for the Joy Man Desires",
    "japaneseTitle": "A Prayer for the Joy Man Desires",
    "localizedTitle": "Prayers -The Joy of Hope-",
    "file": "2-14. A Prayer for the Joy Man Desires.mp3",
    "duration": 206,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Premonition",
    "japaneseTitle": "Premonition",
    "localizedTitle": "Foreboding",
    "file": "2-15. Premonition.mp3",
    "duration": 295,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Awakening",
    "japaneseTitle": "Awakening",
    "localizedTitle": "Awakening",
    "file": "2-16. Awakening.mp3",
    "duration": 263,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "One Who Bares Fangs at God",
    "japaneseTitle": "One Who Bares Fangs at God",
    "localizedTitle": "Fangs Bared at God",
    "file": "2-17. One Who Bares Fangs at God.mp3",
    "duration": 367,
    "game": "xenogears",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "The Beginning and the End",
    "japaneseTitle": "The Beginning and the End",
    "localizedTitle": "The Beginning and the End",
    "file": "2-18. The Beginning and the End.mp3",
    "duration": 277,
    "game": "xenogears",
    "composer": "The Great Voices of Bulgaria"
  },
  {
    "title": "SMALL TWO OF PIECES ~Broken Shards~",
    "japaneseTitle": "SMALL TWO OF PIECES ~Broken Shards~",
    "localizedTitle": "Small Two of Pieces -Screeching Shards-",
    "file": "2-19. SMALL TWO OF PIECES ~Broken Shards~.mp3",
    "duration": 380,
    "game": "xenogears",
    "composer": "Joanne Hogg"
  },
];

// xenosaga-1
const SONGS_XENOSAGA_1 = [
  {
    "title": "Shion ~Memories of the Past~",
    "japaneseTitle": "Shion ~Memories of the Past~",
    "localizedTitle": "Shion ~Memories of the Past~",
    "file": "1-01 Shion ~Memories of the Past~.mp3",
    "duration": 75,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Prologue",
    "japaneseTitle": "Prologue",
    "localizedTitle": "Prologue",
    "file": "1-02 Prologue.mp3",
    "duration": 274,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Gnosis",
    "japaneseTitle": "Gnosis",
    "localizedTitle": "Gnosis",
    "file": "1-03 Gnosis.mp3",
    "duration": 265,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "U-TIC Organization",
    "japaneseTitle": "U-TIC Organization",
    "localizedTitle": "U-TIC Organization",
    "file": "1-04 U-TIC Organization.mp3",
    "duration": 168,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "The Girl Who Closed Her Heart",
    "japaneseTitle": "The Girl Who Closed Her Heart",
    "localizedTitle": "The Girl Who Closed Her Heart",
    "file": "1-05 The Girl Who Closed Her Heart.mp3",
    "duration": 134,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Ormus",
    "japaneseTitle": "Ormus",
    "localizedTitle": "Ormus",
    "file": "1-06 Ormus.mp3",
    "duration": 149,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Nephilim",
    "japaneseTitle": "Nephilim",
    "localizedTitle": "Nephilim",
    "file": "1-07 Nephilim.mp3",
    "duration": 153,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Warmth <New Recording>",
    "japaneseTitle": "Warmth <New Recording>",
    "localizedTitle": "Warmth <New Recording>",
    "file": "1-08 Warmth _New Recording_.mp3",
    "duration": 121,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "The Resurrection",
    "japaneseTitle": "The Resurrection",
    "localizedTitle": "The Resurrection",
    "file": "1-09 The Resurrection.mp3",
    "duration": 113,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "The Beach of Nothingness <New Recording>",
    "japaneseTitle": "The Beach of Nothingness <New Recording>",
    "localizedTitle": "The Beach of Nothingness <New Recording>",
    "file": "1-10 The Beach of Nothingness _New Recording_.mp3",
    "duration": 155,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Green Sleeves <New Recording>",
    "japaneseTitle": "Green Sleeves <New Recording>",
    "localizedTitle": "Green Sleeves <New Recording>",
    "file": "1-11 Green Sleeves _New Recording_.mp3",
    "duration": 146,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "KOS-MOS",
    "japaneseTitle": "KOS-MOS",
    "localizedTitle": "KOS-MOS",
    "file": "1-12 KOS-MOS.mp3",
    "duration": 147,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "The Miracle",
    "japaneseTitle": "The Miracle",
    "localizedTitle": "The Miracle",
    "file": "1-13 The Miracle.mp3",
    "duration": 112,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Zarathustra",
    "japaneseTitle": "Zarathustra",
    "localizedTitle": "Zarathustra",
    "file": "1-14 Zarathustra.mp3",
    "duration": 185,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Ω",
    "japaneseTitle": "Ω",
    "localizedTitle": "Omega",
    "file": "1-15 Ω.mp3",
    "duration": 248,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Escape",
    "japaneseTitle": "Escape",
    "localizedTitle": "Escape",
    "file": "1-16 Escape.mp3",
    "duration": 152,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Pain",
    "japaneseTitle": "Pain",
    "localizedTitle": "Pain",
    "file": "1-17 Pain.mp3",
    "duration": 338,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Kokoro",
    "japaneseTitle": "Kokoro",
    "localizedTitle": "Kokoro",
    "file": "1-18 Kokoro.mp3",
    "duration": 337,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Shion ~Emotion~",
    "japaneseTitle": "Shion ~Emotion~",
    "localizedTitle": "Shion ~Emotion~",
    "file": "1-19 Shion ~Emotion~.mp3",
    "duration": 84,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "World to be Born",
    "japaneseTitle": "World to be Born",
    "localizedTitle": "World to be Born",
    "file": "1-20 World to be Born.mp3",
    "duration": 199,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Pain -piano version- <New Recording>",
    "japaneseTitle": "Pain -piano version- <New Recording>",
    "localizedTitle": "Pain -piano version- <New Recording>",
    "file": "1-21 Pain -piano version- _New Recording_.mp3",
    "duration": 165,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Opening",
    "japaneseTitle": "Opening",
    "localizedTitle": "Opening",
    "file": "2-01 Opening.mp3",
    "duration": 242,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Battle",
    "japaneseTitle": "Battle",
    "localizedTitle": "Battle",
    "file": "2-02 Battle.mp3",
    "duration": 179,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Battle's End",
    "japaneseTitle": "Battle's End",
    "localizedTitle": "Battle's End",
    "file": "2-03 Battle's End.mp3",
    "duration": 42,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Startup Test",
    "japaneseTitle": "Startup Test",
    "localizedTitle": "Startup Test",
    "file": "2-04 Startup Test.mp3",
    "duration": 142,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Reminiscence",
    "japaneseTitle": "回想",
    "localizedTitle": "Reminiscence",
    "file": "2-05 Reminiscence.mp3",
    "duration": 198,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Awakening",
    "japaneseTitle": "Awakening",
    "localizedTitle": "Awakening",
    "file": "2-06 Awakening.mp3",
    "duration": 140,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Shion's Crisis",
    "japaneseTitle": "Shion's Crisis",
    "localizedTitle": "Shion's Crisis",
    "file": "2-07 Shion's Crisis.mp3",
    "duration": 113,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Battling KOS-MOS",
    "japaneseTitle": "Battling KOS-MOS",
    "localizedTitle": "Battling KOS-MOS",
    "file": "2-08 Battling KOS-MOS.mp3",
    "duration": 199,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Sorrow",
    "japaneseTitle": "悲しみ",
    "localizedTitle": "Sorrow",
    "file": "2-09 Sorrow.mp3",
    "duration": 234,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Life or Death",
    "japaneseTitle": "Life or Death",
    "localizedTitle": "Life or Death",
    "file": "2-10 Life or Death.mp3",
    "duration": 195,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Game Over",
    "japaneseTitle": "Game Over",
    "localizedTitle": "Game Over",
    "file": "2-11 Game Over.mp3",
    "duration": 41,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Margulis",
    "japaneseTitle": "Margulis",
    "localizedTitle": "Margulis",
    "file": "2-12 Margulis.mp3",
    "duration": 269,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Pursued Spaceship",
    "japaneseTitle": "Pursued Spaceship",
    "localizedTitle": "Pursued Spaceship",
    "file": "2-13 Pursued Spaceship.mp3",
    "duration": 222,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Relief",
    "japaneseTitle": "Relief",
    "localizedTitle": "Relief",
    "file": "2-14 Relief.mp3",
    "duration": 167,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Everyday",
    "japaneseTitle": "Everyday",
    "localizedTitle": "Everyday",
    "file": "2-15 Everyday.mp3",
    "duration": 114,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "U.M.N. MODE",
    "japaneseTitle": "U.M.N. MODE",
    "localizedTitle": "U.M.N. MODE",
    "file": "2-16 U.M.N. MODE.mp3",
    "duration": 159,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Durandal",
    "japaneseTitle": "Durandal",
    "localizedTitle": "Durandal",
    "file": "2-17 Durandal.mp3",
    "duration": 153,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Invading the Enemy Ship",
    "japaneseTitle": "Invading the Enemy Ship",
    "localizedTitle": "Invading the Enemy Ship",
    "file": "2-18 Invading the Enemy Ship.mp3",
    "duration": 40,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Kookai Foundation",
    "japaneseTitle": "Kookai Foundation",
    "localizedTitle": "Kookai Foundation",
    "file": "2-19 Kookai Foundation.mp3",
    "duration": 117,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Anxiety",
    "japaneseTitle": "Anxiety",
    "localizedTitle": "Anxiety",
    "file": "2-20 Anxiety.mp3",
    "duration": 247,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Panic",
    "japaneseTitle": "Panic",
    "localizedTitle": "Panic",
    "file": "2-21 Panic.mp3",
    "duration": 146,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Song of Nephilim",
    "japaneseTitle": "Song of Nephilim",
    "localizedTitle": "Song of Nephilim",
    "file": "2-22 Song of Nephilim.mp3",
    "duration": 66,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Inner Space",
    "japaneseTitle": "Inner Space",
    "localizedTitle": "Inner Space",
    "file": "2-23 Inner Space.mp3",
    "duration": 107,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Albedo",
    "japaneseTitle": "Albedo",
    "localizedTitle": "Albedo",
    "file": "2-24 Albedo.mp3",
    "duration": 230,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Proto Merkabah",
    "japaneseTitle": "Proto Merkabah",
    "localizedTitle": "Proto Merkabah",
    "file": "2-25 Proto Merkabah.mp3",
    "duration": 330,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
  {
    "title": "Last Battle",
    "japaneseTitle": "Last Battle",
    "localizedTitle": "Last Battle",
    "file": "2-26 Last Battle.mp3",
    "duration": 304,
    "game": "xenosaga-1",
    "composer": "Yasunori Mitsuda"
  },
];

// xenosaga-2 (gamerip)
const SONGS_XENOSAGA_2_GAMERIP = [
  {
    "title": "Old Miltia (14 Years Ago)",
    "japaneseTitle": "Old Miltia (14 Years Ago)",
    "localizedTitle": "Old Miltia (14 Years Ago)",
    "file": "1-01. Old Miltia (14 Years Ago).mp3",
    "duration": 239,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "E.S. Battle",
    "japaneseTitle": "E.S. Battle",
    "localizedTitle": "E.S. Battle",
    "file": "1-02. E.S. Battle.mp3",
    "duration": 214,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Victory Theme",
    "japaneseTitle": "Victory Theme",
    "localizedTitle": "Victory Theme",
    "file": "1-03. Victory Theme.mp3",
    "duration": 51,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Character Battle",
    "japaneseTitle": "Character Battle",
    "localizedTitle": "Character Battle",
    "file": "1-04. Character Battle.mp3",
    "duration": 219,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Second Miltia",
    "japaneseTitle": "Second Miltia",
    "localizedTitle": "Second Miltia",
    "file": "1-06. Second Miltia.mp3",
    "duration": 176,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Evading the U-TIC Organization",
    "japaneseTitle": "Evading the U-TIC Organization",
    "localizedTitle": "Evading the U-TIC Organization",
    "file": "1-07. Evading the U-TIC Organization.mp3",
    "duration": 276,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Minor Boss Battle",
    "japaneseTitle": "Minor Boss Battle",
    "localizedTitle": "Minor Boss Battle",
    "file": "1-08. Minor Boss Battle.mp3",
    "duration": 191,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Records",
    "japaneseTitle": "Records",
    "localizedTitle": "Records",
    "file": "1-09. Records.mp3",
    "duration": 86,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Moby Dick's Cafe",
    "japaneseTitle": "Moby Dick's Cafe",
    "localizedTitle": "Moby Dick's Cafe",
    "file": "1-10. Moby Dick's Cafe.mp3",
    "duration": 350,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Uzuki Residence",
    "japaneseTitle": "Uzuki Residence",
    "localizedTitle": "Uzuki Residence",
    "file": "1-11. Uzuki Residence.mp3",
    "duration": 236,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "U.M.N. Control Center",
    "japaneseTitle": "U.M.N. Control Center",
    "localizedTitle": "U.M.N. Control Center",
    "file": "1-12. U.M.N. Control Center.mp3",
    "duration": 159,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Vector Industries, Second Division",
    "japaneseTitle": "Vector Industries, Second Division",
    "localizedTitle": "Vector Industries, Second Division",
    "file": "1-13. Vector Industries, Second Division.mp3",
    "duration": 197,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Subconscious Domain (Sakura's World)",
    "japaneseTitle": "Subconscious Domain (Sakura's World)",
    "localizedTitle": "Subconscious Domain (Sakura's World)",
    "file": "1-14. Subconscious Domain (Sakura's World).mp3",
    "duration": 186,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Subconscious Domain (Summer)",
    "japaneseTitle": "Subconscious Domain (Summer)",
    "localizedTitle": "Subconscious Domain (Summer)",
    "file": "1-15. Subconscious Domain (Summer).mp3",
    "duration": 237,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Subconscious Domain (Winter)",
    "japaneseTitle": "Subconscious Domain (Winter)",
    "localizedTitle": "Subconscious Domain (Winter)",
    "file": "1-16. Subconscious Domain (Winter).mp3",
    "duration": 319,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "The Elsa von Brabant",
    "japaneseTitle": "The Elsa von Brabant",
    "localizedTitle": "The Elsa von Brabant",
    "file": "2-01. The Elsa von Brabant.mp3",
    "duration": 200,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Robot Academy",
    "japaneseTitle": "Robot Academy",
    "localizedTitle": "Robot Academy",
    "file": "2-02. Robot Academy.mp3",
    "duration": 117,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Ormus Stronghold",
    "japaneseTitle": "Ormus Stronghold",
    "localizedTitle": "Ormus Stronghold",
    "file": "2-03. Ormus Stronghold.mp3",
    "duration": 207,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Major Boss Battle",
    "japaneseTitle": "Major Boss Battle",
    "localizedTitle": "Major Boss Battle",
    "file": "2-04. Major Boss Battle.mp3",
    "duration": 243,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Ormus Stronghold - Countdown to Self-Destruct",
    "japaneseTitle": "Ormus Stronghold - Countdown to Self-Destruct",
    "localizedTitle": "Ormus Stronghold - Countdown to Self-Destruct",
    "file": "2-05. Ormus Stronghold - Countdown to Self-Destruct.mp3",
    "duration": 200,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "The Durandal",
    "japaneseTitle": "The Durandal",
    "localizedTitle": "The Durandal",
    "file": "2-06. The Durandal.mp3",
    "duration": 224,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Kukai Foundation",
    "japaneseTitle": "Kukai Foundation",
    "localizedTitle": "Kukai Foundation",
    "file": "2-07. Kukai Foundation.mp3",
    "duration": 182,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Foundation Fishing Lab",
    "japaneseTitle": "Foundation Fishing Lab",
    "localizedTitle": "Foundation Fishing Lab",
    "file": "2-08. Foundation Fishing Lab.mp3",
    "duration": 195,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Old Miltia (Submerged City)",
    "japaneseTitle": "Old Miltia (Submerged City)",
    "localizedTitle": "Old Miltia (Submerged City)",
    "file": "2-09. Old Miltia (Submerged City).mp3",
    "duration": 207,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Labyrinthos",
    "japaneseTitle": "Labyrinthos",
    "localizedTitle": "Labyrinthos",
    "file": "2-10. Labyrinthos.mp3",
    "duration": 219,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Omega System",
    "japaneseTitle": "Omega System",
    "localizedTitle": "Omega System",
    "file": "2-11. Omega System.mp3",
    "duration": 218,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Space-Time Anomaly",
    "japaneseTitle": "Space-Time Anomaly",
    "localizedTitle": "Space-Time Anomaly",
    "file": "2-12. Space-Time Anomaly.mp3",
    "duration": 271,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Final Battle",
    "japaneseTitle": "Final Battle",
    "localizedTitle": "Final Battle",
    "file": "2-13. Final Battle.mp3",
    "duration": 360,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Desert",
    "japaneseTitle": "Desert",
    "localizedTitle": "Desert",
    "file": "2-14. Desert.mp3",
    "duration": 283,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
  {
    "title": "Industrial Plant",
    "japaneseTitle": "Industrial Plant",
    "localizedTitle": "Industrial Plant",
    "file": "2-15. Industrial Plant.mp3",
    "duration": 188,
    "game": "xenosaga-2",
    "composer": "Shinji Hosoe",
    "folder": "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)"
  },
];

// xenosaga-2 (movie)
const SONGS_XENOSAGA_2_MOVIE = [
  {
    "title": "in the beginning, there was....",
    "japaneseTitle": "in the beginning, there was....",
    "localizedTitle": "in the beginning, there was....",
    "file": "1-01. in the beginning, there was.....mp3",
    "duration": 120,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "first meeting",
    "japaneseTitle": "first meeting",
    "localizedTitle": "first meeting",
    "file": "1-02. first meeting.mp3",
    "duration": 168,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Xenosaga II opening theme",
    "japaneseTitle": "Xenosaga II opening theme",
    "localizedTitle": "Xenosaga II opening theme",
    "file": "1-03. Xenosaga II opening theme.mp3",
    "duration": 152,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "assault",
    "japaneseTitle": "assault",
    "localizedTitle": "assault",
    "file": "1-04. assault.mp3",
    "duration": 221,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "strain-Jin",
    "japaneseTitle": "strain-Jin",
    "localizedTitle": "strain-Jin",
    "file": "1-05. strain-Jin.mp3",
    "duration": 235,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "here he comes",
    "japaneseTitle": "here he comes",
    "localizedTitle": "here he comes",
    "file": "1-06. here he comes.mp3",
    "duration": 117,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "fatal fight (Jin & Margulis)",
    "japaneseTitle": "fatal fight (Jin & Margulis)",
    "localizedTitle": "fatal fight (Jin & Margulis)",
    "file": "1-07. fatal fight (Jin & Margulis).mp3",
    "duration": 253,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "R&D report",
    "japaneseTitle": "R&D report",
    "localizedTitle": "R&D report",
    "file": "1-08. R&D report.mp3",
    "duration": 111,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "chase",
    "japaneseTitle": "chase",
    "localizedTitle": "chase",
    "file": "1-09. chase.mp3",
    "duration": 159,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "surrounded",
    "japaneseTitle": "surrounded",
    "localizedTitle": "surrounded",
    "file": "1-10. surrounded.mp3",
    "duration": 175,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "lamentation",
    "japaneseTitle": "lamentation",
    "localizedTitle": "lamentation",
    "file": "1-11. lamentation.mp3",
    "duration": 324,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Albedo",
    "japaneseTitle": "Albedo",
    "localizedTitle": "Albedo",
    "file": "1-12. Albedo.mp3",
    "duration": 119,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "communication breakdown",
    "japaneseTitle": "communication breakdown",
    "localizedTitle": "communication breakdown",
    "file": "1-13. communication breakdown.mp3",
    "duration": 253,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Sakura (theme-piano ver.)",
    "japaneseTitle": "Sakura (theme-piano ver.)",
    "localizedTitle": "Sakura (theme-piano ver.)",
    "file": "1-14. Sakura (theme-piano ver.).mp3",
    "duration": 98,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Sakura #2 (theme-simple voc.ver.)",
    "japaneseTitle": "Sakura #2 (theme-simple voc.ver.)",
    "localizedTitle": "Sakura #2 (theme-simple voc.ver.)",
    "file": "1-15. Sakura #2 (theme-simple voc.ver.).mp3",
    "duration": 152,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "strained",
    "japaneseTitle": "strained",
    "localizedTitle": "strained",
    "file": "1-16. strained.mp3",
    "duration": 68,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Jr. #2",
    "japaneseTitle": "Jr. #2",
    "localizedTitle": "Jr. #2",
    "file": "1-17. Jr. #2.mp3",
    "duration": 101,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "strained #2 - Albedo #2",
    "japaneseTitle": "strained #2 - Albedo #2",
    "localizedTitle": "strained #2 - Albedo #2",
    "file": "1-18. strained #2 - Albedo #2.mp3",
    "duration": 235,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "in the beginning, there was... #2",
    "japaneseTitle": "in the beginning, there was... #2",
    "localizedTitle": "in the beginning, there was... #2",
    "file": "1-19. in the beginning, there was... #2.mp3",
    "duration": 120,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "battle of Elsa",
    "japaneseTitle": "battle of Elsa",
    "localizedTitle": "battle of Elsa",
    "file": "1-20. battle of Elsa.mp3",
    "duration": 182,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "here she comes (KOS-MOS)",
    "japaneseTitle": "here she comes (KOS-MOS)",
    "localizedTitle": "here she comes (KOS-MOS)",
    "file": "1-21. here she comes (KOS-MOS).mp3",
    "duration": 158,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "battle of Elsa #2",
    "japaneseTitle": "battle of Elsa #2",
    "localizedTitle": "battle of Elsa #2",
    "file": "1-22. battle of Elsa #2.mp3",
    "duration": 129,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "gate out",
    "japaneseTitle": "gate out",
    "localizedTitle": "gate out",
    "file": "1-23. gate out.mp3",
    "duration": 209,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "here he comes #2",
    "japaneseTitle": "here he comes #2",
    "localizedTitle": "here he comes #2",
    "file": "2-01. here he comes #2.mp3",
    "duration": 210,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "creeping fear",
    "japaneseTitle": "creeping fear",
    "localizedTitle": "creeping fear",
    "file": "2-02. creeping fear.mp3",
    "duration": 126,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "U-DO - Febronia",
    "japaneseTitle": "U-DO - Febronia",
    "localizedTitle": "U-DO - Febronia",
    "file": "2-03. U-DO - Febronia.mp3",
    "duration": 228,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "final crisis",
    "japaneseTitle": "final crisis",
    "localizedTitle": "final crisis",
    "file": "2-04. final crisis.mp3",
    "duration": 134,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "presentiment - Jr.#3",
    "japaneseTitle": "presentiment - Jr.#3",
    "localizedTitle": "presentiment - Jr.#3",
    "file": "2-05. presentiment - Jr.#3.mp3",
    "duration": 195,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "a field of battle - bitter #2",
    "japaneseTitle": "a field of battle - bitter #2",
    "localizedTitle": "a field of battle - bitter #2",
    "file": "2-06. a field of battle - bitter #2.mp3",
    "duration": 176,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "inside - Sakura #3",
    "japaneseTitle": "inside - Sakura #3",
    "localizedTitle": "inside - Sakura #3",
    "file": "2-07. inside - Sakura #3.mp3",
    "duration": 84,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "I am free",
    "japaneseTitle": "I am free",
    "localizedTitle": "I am free",
    "file": "2-08. I am free.mp3",
    "duration": 100,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Sakura #4 (theme - gentle strings ver.)",
    "japaneseTitle": "Sakura #4 (theme - gentle strings ver.)",
    "localizedTitle": "Sakura #4 (theme - gentle strings ver.)",
    "file": "2-09. Sakura #4 (theme - gentle strings ver.).mp3",
    "duration": 126,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Sweet Song (Xenosaga II ending theme)",
    "japaneseTitle": "Sweet Song (Xenosaga II ending theme)",
    "localizedTitle": "Sweet Song (Xenosaga II ending theme)",
    "file": "2-10. Sweet Song (Xenosaga II ending theme).mp3",
    "duration": 333,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Jr.",
    "japaneseTitle": "Jr.",
    "localizedTitle": "Jr.",
    "file": "2-11. Jr..mp3",
    "duration": 206,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Jr. #4",
    "japaneseTitle": "Jr. #4",
    "localizedTitle": "Jr. #4",
    "file": "2-12. Jr. #4.mp3",
    "duration": 157,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "fatal fight #2",
    "japaneseTitle": "fatal fight #2",
    "localizedTitle": "fatal fight #2",
    "file": "2-13. fatal fight #2.mp3",
    "duration": 140,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "bitter",
    "japaneseTitle": "bitter",
    "localizedTitle": "bitter",
    "file": "2-14. bitter.mp3",
    "duration": 173,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "Nephilim",
    "japaneseTitle": "Nephilim",
    "localizedTitle": "Nephilim",
    "file": "2-15. Nephilim.mp3",
    "duration": 88,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "the image theme of Xenosaga II #piano ver.",
    "japaneseTitle": "the image theme of Xenosaga II #piano ver.",
    "localizedTitle": "the image theme of Xenosaga II #piano ver.",
    "file": "2-16. the image theme of Xenosaga II #piano ver..mp3",
    "duration": 190,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
  {
    "title": "the image theme of Xenosaga II",
    "japaneseTitle": "the image theme of Xenosaga II",
    "localizedTitle": "the image theme of Xenosaga II",
    "file": "2-17. the image theme of Xenosaga II.mp3",
    "duration": 204,
    "game": "xenosaga-2",
    "composer": "Yuki Kajiura",
    "folder": "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)"
  },
];

// xenosaga-3
const SONGS_XENOSAGA_3 = [
  {
    "title": "I love you, sincerely (title screen ver.)",
    "japaneseTitle": "I love you, sincerely (title screen ver.)",
    "localizedTitle": "I love you, sincerely (title screen ver.)",
    "file": "01. I love you, sincerely (title screen ver.).mp3",
    "duration": 190,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "The Body of the Saint",
    "japaneseTitle": "The Body of the Saint",
    "localizedTitle": "The Body of the Saint",
    "file": "02. The Body of the Saint.mp3",
    "duration": 79,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "S-Line Division Infiltration",
    "japaneseTitle": "S-Line Division Infiltration",
    "localizedTitle": "S-Line Division Infiltration",
    "file": "03. S-Line Division Infiltration.mp3",
    "duration": 171,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Rolling Down the U.M.N. #2",
    "japaneseTitle": "Rolling Down the U.M.N. #2",
    "localizedTitle": "Rolling Down the U.M.N. #2",
    "file": "04. Rolling Down the U.M.N. #2.mp3",
    "duration": 210,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "fallout",
    "japaneseTitle": "fallout",
    "localizedTitle": "fallout",
    "file": "1-02. fallout.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 123,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "rolling down the U.M.N.",
    "japaneseTitle": "rolling down the U.M.N.",
    "localizedTitle": "rolling down the U.M.N.",
    "file": "1-08. rolling down the UMN.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 127,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Discovered!",
    "japaneseTitle": "Discovered!",
    "localizedTitle": "Discovered!",
    "file": "07. Discovered!.mp3",
    "duration": 131,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Battleland #2",
    "japaneseTitle": "Battleland #2",
    "localizedTitle": "Battleland #2",
    "file": "08. Battleland #2.mp3",
    "duration": 138,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Beach",
    "japaneseTitle": "Beach",
    "localizedTitle": "Beach",
    "file": "09. Beach.mp3",
    "duration": 151,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Shion's Flashback",
    "japaneseTitle": "Shion's Flashback",
    "localizedTitle": "Shion's Flashback",
    "file": "10. Shion's Flashback.mp3",
    "duration": 147,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Margulis & Pellegri",
    "japaneseTitle": "Margulis & Pellegri",
    "localizedTitle": "Margulis & Pellegri",
    "file": "11. Margulis & Pellegri.mp3",
    "duration": 177,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Floating Landmass Appears",
    "japaneseTitle": "Floating Landmass Appears",
    "localizedTitle": "Floating Landmass Appears",
    "file": "12. Floating Landmass Appears.mp3",
    "duration": 10,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "survive",
    "japaneseTitle": "survive",
    "localizedTitle": "survive",
    "file": "2-05. survive.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 188,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "the battle of your soul",
    "japaneseTitle": "the battle of your soul",
    "localizedTitle": "the battle of your soul",
    "file": "1-07. the battle of your soul.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 187,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Fatal Fight #3 ~ Battle vs. E.S. Levi - Over The Floating Landmass",
    "japaneseTitle": "Fatal Fight #3 ~ Battle vs. E.S. Levi - Over The Floating Landmass",
    "localizedTitle": "Fatal Fight #3 ~ Battle vs. E.S. Levi - Over The Floating Landmass",
    "file": "15. Fatal Fight #3 ~ Battle vs. E.S. Levi - Over The Floating Landmass.mp3",
    "duration": 131,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Yuriev & Sellers",
    "japaneseTitle": "Yuriev & Sellers",
    "localizedTitle": "Yuriev & Sellers",
    "file": "16. Yuriev & Sellers.mp3",
    "duration": 256,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Fifth Jerusalem",
    "japaneseTitle": "Fifth Jerusalem",
    "localizedTitle": "Fifth Jerusalem",
    "file": "17. Fifth Jerusalem.mp3",
    "duration": 196,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Mobius Hotel",
    "japaneseTitle": "Mobius Hotel",
    "localizedTitle": "Mobius Hotel",
    "file": "18. Mobius Hotel.mp3",
    "duration": 131,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Jingle",
    "japaneseTitle": "Jingle",
    "localizedTitle": "Jingle",
    "file": "19. Jingle.mp3",
    "duration": 12,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "CAT Facility",
    "japaneseTitle": "CAT Facility",
    "localizedTitle": "CAT Facility",
    "file": "20. CAT Facility.mp3",
    "duration": 111,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "T-elos",
    "japaneseTitle": "T-elos",
    "localizedTitle": "T-elos",
    "file": "1-13. T-elos.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 141,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Juli's Briefing",
    "japaneseTitle": "Juli's Briefing",
    "localizedTitle": "Juli's Briefing",
    "file": "22. Juli's Briefing.mp3",
    "duration": 131,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Maybe Tomorrow (strings ver.)",
    "japaneseTitle": "Maybe Tomorrow (strings ver.)",
    "localizedTitle": "Maybe Tomorrow (strings ver.)",
    "file": "23. Maybe Tomorrow (strings ver.).mp3",
    "duration": 55,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Cardinal Heinlein",
    "japaneseTitle": "Cardinal Heinlein",
    "localizedTitle": "Cardinal Heinlein",
    "file": "24. Cardinal Heinlein.mp3",
    "duration": 100,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "I love you, sincerely (piano ver.)",
    "japaneseTitle": "I love you, sincerely (piano ver.)",
    "localizedTitle": "I love you, sincerely (piano ver.)",
    "file": "25. I love you, sincerely (piano ver.).mp3",
    "duration": 301,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Elsa - Start of CAT Infiltration",
    "japaneseTitle": "Elsa - Start of CAT Infiltration",
    "localizedTitle": "Elsa - Start of CAT Infiltration",
    "file": "26. Elsa - Start of CAT Infiltration.mp3",
    "duration": 224,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Creeping Into",
    "japaneseTitle": "Creeping Into",
    "localizedTitle": "Creeping Into",
    "file": "27. Creeping Into (extended).mp3",
    "duration": 276,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Minor Boss Battle",
    "japaneseTitle": "Minor Boss Battle",
    "localizedTitle": "Minor Boss Battle",
    "file": "28. Minor Boss Battle.mp3",
    "duration": 144,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "A New World (piano ver.)",
    "japaneseTitle": "A New World (piano ver.)",
    "localizedTitle": "A New World (piano ver.)",
    "file": "01. A New World (piano ver.).mp3",
    "duration": 112,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "in a limestone cave",
    "japaneseTitle": "in a limestone cave",
    "localizedTitle": "in a limestone cave",
    "file": "1-09. in a limestone cave.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 136,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Ancient Temple",
    "japaneseTitle": "Ancient Temple",
    "localizedTitle": "Ancient Temple",
    "file": "03. Ancient Temple.mp3",
    "duration": 192,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "T-elos's Challenge",
    "japaneseTitle": "T-elos's Challenge",
    "localizedTitle": "T-elos's Challenge",
    "file": "04. T-elos's Challenge.mp3",
    "duration": 114,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "T-elos#2",
    "japaneseTitle": "T-elos#2",
    "localizedTitle": "T-elos#2",
    "file": "2-06. T-elos#2.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 131,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "A New World (variation)",
    "japaneseTitle": "A New World (variation)",
    "localizedTitle": "A New World (variation)",
    "file": "06. A New World (variation).mp3",
    "duration": 50,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Old Miltia Forest",
    "japaneseTitle": "Old Miltia Forest",
    "localizedTitle": "Old Miltia Forest",
    "file": "07. Old Miltia Forest.mp3",
    "duration": 87,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Old Miltia Forest #2",
    "japaneseTitle": "Old Miltia Forest #2",
    "localizedTitle": "Old Miltia Forest #2",
    "file": "08. Old Miltia Forest #2.mp3",
    "duration": 87,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Rescue of Virgil",
    "japaneseTitle": "Rescue of Virgil",
    "localizedTitle": "Rescue of Virgil",
    "file": "09. Rescue of Virgil.mp3",
    "duration": 134,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Sneaking Around in Miltia",
    "japaneseTitle": "Sneaking Around in Miltia",
    "localizedTitle": "Sneaking Around in Miltia",
    "file": "10. Sneaking Around in Miltia.mp3",
    "duration": 252,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Acute Neurosis Treatment Facility",
    "japaneseTitle": "Acute Neurosis Treatment Facility",
    "localizedTitle": "Acute Neurosis Treatment Facility",
    "file": "11. Acute Neurosis Treatment Facility.mp3",
    "duration": 191,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "on our ways",
    "japaneseTitle": "on our ways",
    "localizedTitle": "on our ways",
    "file": "1-11. on our ways.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 156,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Joachim",
    "japaneseTitle": "Joachim",
    "localizedTitle": "Joachim",
    "file": "13. Joachim.mp3",
    "duration": 256,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "she's coming back",
    "japaneseTitle": "she's coming back",
    "localizedTitle": "she's coming back",
    "file": "2-07. she's coming back.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 117,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Creeping Into #2",
    "japaneseTitle": "Creeping Into #2",
    "localizedTitle": "Creeping Into #2",
    "file": "15. Creeping Into #2.mp3",
    "duration": 143,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Acute Neurosis Treatment Facility - Under Attack",
    "japaneseTitle": "Acute Neurosis Treatment Facility - Under Attack",
    "localizedTitle": "Acute Neurosis Treatment Facility - Under Attack",
    "file": "16. Acute Neurosis Treatment Facility - Under Attack.mp3",
    "duration": 169,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Joachim's Decision",
    "japaneseTitle": "Joachim's Decision",
    "localizedTitle": "Joachim's Decision",
    "file": "17. Joachim's Decision.mp3",
    "duration": 130,
    "game": "xenosaga-3",
    "composer": "Yasunori Mitsuda",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "outrageous",
    "japaneseTitle": "outrageous",
    "localizedTitle": "outrageous",
    "file": "2-13. outrageous.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 161,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Jin",
    "japaneseTitle": "Jin",
    "localizedTitle": "Jin",
    "file": "19. Jin.mp3",
    "duration": 69,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "The Harsh Truth (piano ver.)",
    "japaneseTitle": "The Harsh Truth (piano ver.)",
    "localizedTitle": "The Harsh Truth (piano ver.)",
    "file": "20. The Harsh Truth (piano ver.).mp3",
    "duration": 57,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Labyrinthos - Search for Shion",
    "japaneseTitle": "Labyrinthos - Search for Shion",
    "localizedTitle": "Labyrinthos - Search for Shion",
    "file": "21. Labyrinthos - Search for Shion.mp3",
    "duration": 152,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Assault #2",
    "japaneseTitle": "Assault #2",
    "localizedTitle": "Assault #2",
    "file": "22. Assault #2.mp3",
    "duration": 196,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Testament (no vocals)",
    "japaneseTitle": "Testament (no vocals)",
    "localizedTitle": "Testament (no vocals)",
    "file": "23. Testament (no vocals).mp3",
    "duration": 203,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Virgil's Lament",
    "japaneseTitle": "Virgil's Lament",
    "localizedTitle": "Virgil's Lament",
    "file": "24. Virgil's Lament.mp3",
    "duration": 148,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Song of Nephilim",
    "japaneseTitle": "Song of Nephilim",
    "localizedTitle": "Song of Nephilim",
    "file": "25. Song of Nephilim.mp3",
    "duration": 157,
    "game": "xenosaga-3",
    "composer": "Yasunori Mitsuda",
    "artist": "Yuki Kajiura"
  },
  {
    "title": "A Dark Omen #2 ~ Merkabah",
    "japaneseTitle": "A Dark Omen #2 ~ Merkabah",
    "localizedTitle": "A Dark Omen #2 ~ Merkabah",
    "file": "26. A Dark Omen #2 ~ Merkabah.mp3",
    "duration": 170,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Survive #2 ~ Invasion of the Durandal",
    "japaneseTitle": "Survive #2 ~ Invasion of the Durandal",
    "localizedTitle": "Survive #2 ~ Invasion of the Durandal",
    "file": "27. Survive #2 ~ Invasion of the Durandal.mp3",
    "duration": 201,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "godsibb",
    "japaneseTitle": "godsibb",
    "localizedTitle": "godsibb",
    "file": "2-09. godsibb.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 202,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "when the grief lets you go",
    "japaneseTitle": "when the grief lets you go",
    "localizedTitle": "when the grief lets you go",
    "file": "2-08. when the grief lets you go.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 152,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "chaos & Canaan",
    "japaneseTitle": "chaos & Canaan",
    "localizedTitle": "chaos & Canaan",
    "file": "02. chaos & Canaan.mp3",
    "duration": 89,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Abel's Ark",
    "japaneseTitle": "Abel's Ark",
    "localizedTitle": "Abel's Ark",
    "file": "03. Abel's Ark.mp3",
    "duration": 175,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "battleland",
    "japaneseTitle": "battleland",
    "localizedTitle": "battleland",
    "file": "2-02. battleland.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 214,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Battle vs. Yuriev",
    "japaneseTitle": "Battle vs. Yuriev",
    "localizedTitle": "Battle vs. Yuriev",
    "file": "05. Battle vs. Yuriev.mp3",
    "duration": 251,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Godsibb (no vocal)",
    "japaneseTitle": "Godsibb (no vocal)",
    "localizedTitle": "Godsibb (no vocal)",
    "file": "06. Godsibb (no vocal).mp3",
    "duration": 173,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Destruction of the Star System",
    "japaneseTitle": "Destruction of the Star System",
    "localizedTitle": "Destruction of the Star System",
    "file": "07. Destruction of the Star System.mp3",
    "duration": 85,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "to the last place",
    "japaneseTitle": "to the last place",
    "localizedTitle": "to the last place",
    "file": "1-23. to the last place.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 113,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "a memory of a tragedy",
    "japaneseTitle": "a memory of a tragedy",
    "localizedTitle": "a memory of a tragedy",
    "file": "2-03. a memory of a tragedy.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 100,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Richard & Hermann's Appearance",
    "japaneseTitle": "Richard & Hermann's Appearance",
    "localizedTitle": "Richard & Hermann's Appearance",
    "file": "10. Richard & Hermann's Appearance.mp3",
    "duration": 110,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "forgotten sanctuary",
    "japaneseTitle": "forgotten sanctuary",
    "localizedTitle": "forgotten sanctuary",
    "file": "1-05. forgotten sanctuary.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 145,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Voyager",
    "japaneseTitle": "Voyager",
    "localizedTitle": "Voyager",
    "file": "12. Voyager.mp3",
    "duration": 123,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "testament",
    "japaneseTitle": "testament",
    "localizedTitle": "testament",
    "file": "2-04. testament.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 224,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Fatal Fight #4 ~ vs. E.S. Levi - Michtam Underground Lab",
    "japaneseTitle": "Fatal Fight #4 ~ vs. E.S. Levi - Michtam Underground Lab",
    "localizedTitle": "Fatal Fight #4 ~ vs. E.S. Levi - Michtam Underground Lab",
    "file": "14. Fatal Fight #4 ~ vs. E.S. Levi - Michtam Underground Lab.mp3",
    "duration": 148,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Zarathustra dangeon",
    "japaneseTitle": "Zarathustra dangeon",
    "localizedTitle": "Zarathustra dangeon",
    "file": "1-19. Zarathustra dangeon.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 137,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "T-elos' Final Appearance",
    "japaneseTitle": "T-elos' Final Appearance",
    "localizedTitle": "T-elos' Final Appearance",
    "file": "16. T-elos' Final Appearance.mp3",
    "duration": 209,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "hepatica (KOS-MOS)",
    "japaneseTitle": "hepatica (KOS-MOS)",
    "localizedTitle": "hepatica (KOS-MOS)",
    "file": "2-01. hepatica(Kos-Mos).mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 314,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "the harsh truth",
    "japaneseTitle": "the harsh truth",
    "localizedTitle": "the harsh truth",
    "file": "1-22. the harsh truth.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 128,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Wilhelm",
    "japaneseTitle": "Wilhelm",
    "localizedTitle": "Wilhelm",
    "file": "19. Wilhelm.mp3",
    "duration": 168,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Nephilim & Abel",
    "japaneseTitle": "Nephilim & Abel",
    "localizedTitle": "Nephilim & Abel",
    "file": "20. Nephilim & Abel.mp3",
    "duration": 98,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "promised pain",
    "japaneseTitle": "promised pain",
    "localizedTitle": "promised pain",
    "file": "1-16. promised pain.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 186,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Maybe Tomorrow (piano ver.)",
    "japaneseTitle": "Maybe Tomorrow (piano ver.)",
    "localizedTitle": "Maybe Tomorrow (piano ver.)",
    "file": "22. Maybe Tomorrow (piano ver.).mp3",
    "duration": 73,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Hepatica (piano ver.)",
    "japaneseTitle": "Hepatica (piano ver.)",
    "localizedTitle": "Hepatica (piano ver.)",
    "file": "23. Hepatica (piano ver.).mp3",
    "duration": 171,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Chase (intro)",
    "japaneseTitle": "Chase (intro)",
    "localizedTitle": "Chase (intro)",
    "file": "24. Chase (intro).mp3",
    "duration": 46,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Battle vs. Erde Kaiser Σ",
    "japaneseTitle": "Battle vs. Erde Kaiser Σ",
    "localizedTitle": "Battle vs. Erde Kaiser Σ",
    "file": "25. Battle vs. Erde Kaiser Σ.mp3",
    "duration": 188,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "HaKox Theme A",
    "japaneseTitle": "HaKox Theme A",
    "localizedTitle": "HaKox Theme A",
    "file": "26. HaKox Theme A.mp3",
    "duration": 144,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "HaKox Theme B",
    "japaneseTitle": "HaKox Theme B",
    "localizedTitle": "HaKox Theme B",
    "file": "27. HaKox Theme B.mp3",
    "duration": 197,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "She's Coming Back (short ver.)",
    "japaneseTitle": "She's Coming Back (short ver.)",
    "localizedTitle": "She's Coming Back (short ver.)",
    "file": "28. She's Coming Back (short ver.).mp3",
    "duration": 31,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  // Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)
  {
    "title": "a prelude to the tragedy",
    "japaneseTitle": "a prelude to the tragedy",
    "localizedTitle": "a prelude to the tragedy",
    "file": "1-01. a prelude to the tragedy.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 120,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "we've got to believe in something",
    "japaneseTitle": "we've got to believe in something",
    "localizedTitle": "we've got to believe in something",
    "file": "1-03. we've got to believe in something.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 186,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "a dark omen",
    "japaneseTitle": "a dark omen",
    "localizedTitle": "a dark omen",
    "file": "1-04. a dark omen.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 147,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "inferno",
    "japaneseTitle": "inferno",
    "localizedTitle": "inferno",
    "file": "1-10. inferno.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 114,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "a new world",
    "japaneseTitle": "a new world",
    "localizedTitle": "a new world",
    "file": "1-12. a new world.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 131,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "the Miltia incidents",
    "japaneseTitle": "the Miltia incidents",
    "localizedTitle": "the Miltia incidents",
    "file": "1-14. the Miltia incidents.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 184,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Febronia",
    "japaneseTitle": "Febronia",
    "localizedTitle": "Febronia",
    "file": "1-15. Febronia.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 170,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "mother, I miss you",
    "japaneseTitle": "mother, I miss you",
    "localizedTitle": "mother, I miss you",
    "file": "1-17. mother,I miss you.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 140,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "fate",
    "japaneseTitle": "fate",
    "localizedTitle": "fate",
    "file": "1-18. fate.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 131,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "shifting territories",
    "japaneseTitle": "shifting territories",
    "localizedTitle": "shifting territories",
    "file": "1-20. shifting territories.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 201,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "hepatica#2",
    "japaneseTitle": "hepatica#2",
    "localizedTitle": "hepatica#2",
    "file": "1-21. hepatica#2.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 102,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "Febronia#2",
    "japaneseTitle": "Febronia#2",
    "localizedTitle": "Febronia#2",
    "file": "2-10. Febronia #2.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 132,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "crisis coming",
    "japaneseTitle": "crisis coming",
    "localizedTitle": "crisis coming",
    "file": "2-11. crisis coming.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 170,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "a new world#2",
    "japaneseTitle": "a new world#2",
    "localizedTitle": "a new world#2",
    "file": "2-12. a new world #2.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 114,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "when the grief lets you go#2",
    "japaneseTitle": "when the grief lets you go#2",
    "localizedTitle": "when the grief lets you go#2",
    "file": "2-14. when the grief lets you go #2.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 202,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "I love you, sincerely",
    "japaneseTitle": "I love you, sincerely",
    "localizedTitle": "I love you, sincerely",
    "file": "2-15. I love you,sincerely.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 211,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "hepatica#3~I believe in you",
    "japaneseTitle": "hepatica#3~I believe in you",
    "localizedTitle": "hepatica#3~I believe in you",
    "file": "2-16. hepatica - I believe in you.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 471,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
  {
    "title": "maybe tomorrow~ending medley",
    "japaneseTitle": "maybe tomorrow~ending medley",
    "localizedTitle": "maybe tomorrow~ending medley",
    "file": "2-17. maybe tomorrow - ending medley.mp3",
    "folder": "Xenosaga III - Also Sprach Zarathustra ORIGINAL SOUND BEST TRACKS (2006)",
    "duration": 463,
    "game": "xenosaga-3",
    "composer": "Yuki Kajiura"
  },
];

// xenosaga-freaks
const SONGS_XENOSAGA_FREAKS = [
  {
    "title": "A Day Aboard the Elsa",
    "japaneseTitle": "Elsa",
    "localizedTitle": "Elsa",
    "file": "01. Elsa.mp3",
    "duration": 188,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Elsa",
    "japaneseTitle": "Elsa 2",
    "localizedTitle": "Elsa 2",
    "file": "02. Elsa 2.mp3",
    "duration": 287,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Consciousness ~ MOMO",
    "japaneseTitle": "Subconcious Domain (Sakura's World)",
    "localizedTitle": "Subconcious Domain (Sakura's World)",
    "file": "03. Subconcious Domain (Sakura's World).mp3",
    "duration": 146,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Nyaa 1",
    "japaneseTitle": "Nyaa 1",
    "localizedTitle": "Nyaa 1",
    "file": "04. Nyaa 1.mp3",
    "duration": 204,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "The Durandal",
    "japaneseTitle": "Durandal 1",
    "localizedTitle": "Durandal 1",
    "file": "05. Durandal 1.mp3",
    "duration": 164,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "The Durandal - Hacked",
    "japaneseTitle": "Durandal 2",
    "localizedTitle": "Durandal 2",
    "file": "06. Durandal 2.mp3",
    "duration": 240,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Encylopedia",
    "japaneseTitle": "Encylopedia",
    "localizedTitle": "Encylopedia",
    "file": "07. Encylopedia.mp3",
    "duration": 184,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Depths of Consciousness",
    "japaneseTitle": "Unknown",
    "localizedTitle": "Unknown",
    "file": "08. Unknown.mp3",
    "duration": 186,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Nyaa 2",
    "japaneseTitle": "Nyaa 2",
    "localizedTitle": "Nyaa 2",
    "file": "09. Nyaa 2.mp3",
    "duration": 146,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Credits",
    "japaneseTitle": "Credits",
    "localizedTitle": "Credits",
    "file": "10. Credits.mp3",
    "duration": 205,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Foundation",
    "japaneseTitle": "Options",
    "localizedTitle": "Options",
    "file": "11. Options.mp3",
    "duration": 235,
    "game": "xenosaga-freaks",
    "composer": "Shinji Hosoe, Ayako Saso, Masashi Yano, & Keiichi Okabe"
  },
  {
    "title": "Opening",
    "japaneseTitle": "Xeno-Pittan - Opening",
    "localizedTitle": "Xeno-Pittan - Opening",
    "file": "12. Xeno-Pittan - Opening.mp3",
    "duration": 29,
    "game": "xenosaga-freaks",
    "composer": "Satoru Kosaki"
  },
  {
    "title": "Top Menu",
    "japaneseTitle": "Xeno-Pittan - Top Menu",
    "localizedTitle": "Xeno-Pittan - Top Menu",
    "file": "13. Xeno-Pittan - Top Menu.mp3",
    "duration": 51,
    "game": "xenosaga-freaks",
    "composer": "Satoru Kosaki"
  },
  {
    "title": "Stage Select",
    "japaneseTitle": "Xeno-Pittan - Stage Select",
    "localizedTitle": "Xeno-Pittan - Stage Select",
    "file": "14. Xeno-Pittan - Stage Select.mp3",
    "duration": 114,
    "game": "xenosaga-freaks",
    "composer": "Namco Sound Team"
  },
  {
    "title": "Stage Theme",
    "japaneseTitle": "Xeno-Pittan - Stage 01",
    "localizedTitle": "Xeno-Pittan - Stage 01",
    "file": "15. Xeno-Pittan - Stage 01.mp3",
    "duration": 341,
    "game": "xenosaga-freaks",
    "composer": "Namco Sound Team"
  },
  {
    "title": "estrellita",
    "japaneseTitle": "Xeno-Pittan - estrellita",
    "localizedTitle": "Xeno-Pittan - estrellita",
    "file": "16. Xeno-Pittan - estrellita.mp3",
    "duration": 296,
    "game": "xenosaga-freaks",
    "composer": "Satoru Kousaki",
    "artist": "Ai Maeda"
  },
  {
    "title": "[ai]",
    "japaneseTitle": "Xeno-Pittan - [ai]",
    "localizedTitle": "Xeno-Pittan - [ai]",
    "file": "17. Xeno-Pittan - [ai].mp3",
    "duration": 615,
    "game": "xenosaga-freaks",
    "composer": "Satoru Kousaki",
    "artist": "Mariko Suzuki"
  },
  {
    "title": "paradox",
    "japaneseTitle": "Xeno-Pittan - paradox",
    "localizedTitle": "Xeno-Pittan - paradox",
    "file": "18. Xeno-Pittan - paradox.mp3",
    "duration": 577,
    "game": "xenosaga-freaks",
    "composer": "Hiroshi Okubo",
    "artist": "Rumi Shishido"
  },
  {
    "title": "Pittan for Two",
    "japaneseTitle": "Xeno-Pittan - Our Xenopittan",
    "localizedTitle": "Xeno-Pittan - Our Xenopittan",
    "file": "19. Xeno-Pittan - Our Xenopittan.mp3",
    "duration": 237,
    "game": "xenosaga-freaks",
    "composer": "Satoru Kousaki",
    "artist": "Ai Maeda, Mariko Suzuki, & Rumi Shishido"
  },
  {
    "title": "Stage Clear",
    "japaneseTitle": "Xeno-Pittan - Stage Clear",
    "localizedTitle": "Xeno-Pittan - Stage Clear",
    "file": "20. Xeno-Pittan - Stage Clear.mp3",
    "duration": 6,
    "game": "xenosaga-freaks",
    "composer": "Satoru Kosaki"
  },
  {
    "title": "Time Up",
    "japaneseTitle": "Xeno-Pittan - Time Up",
    "localizedTitle": "Xeno-Pittan - Time Up",
    "file": "21. Xeno-Pittan - Time Up.mp3",
    "duration": 4,
    "game": "xenosaga-freaks",
    "composer": "Satoru Kosaki"
  },
  {
    "title": "Continue",
    "japaneseTitle": "Xeno-Pittan - Continue",
    "localizedTitle": "Xeno-Pittan - Continue",
    "file": "22. Xeno-Pittan - Continue.mp3",
    "duration": 13,
    "game": "xenosaga-freaks",
    "composer": "Satoru Kosaki"
  },
  {
    "title": "Personality Test",
    "japaneseTitle": "Xeno-Pittan - Personality Test",
    "localizedTitle": "Xeno-Pittan - Personality Test",
    "file": "23. Xeno-Pittan - Personality Test.mp3",
    "duration": 41,
    "game": "xenosaga-freaks",
    "composer": "Satoru Kosaki"
  },
];

// xenosaga-pied-piper
const SONGS_XENOSAGA_PIED_PIPER = [
  {
    "title": "Sharon's Theme",
    "japaneseTitle": "Sharon's Theme",
    "localizedTitle": "Sharon's Theme",
    "file": "01. Sharon's Theme.mp3",
    "duration": 53,
    "game": "xenosaga-pied-piper",
    "composer": "TWO FIVE (Kousei Muraki, Tomokazu Ushiyama)"
  },
  {
    "title": "Creeping Suspicion",
    "japaneseTitle": "Creeping Suspicion",
    "localizedTitle": "Creeping Suspicion",
    "file": "02. Creeping Suspicion.mp3",
    "duration": 24,
    "game": "xenosaga-pied-piper",
    "composer": "TWO FIVE (Kousei Muraki, Tomokazu Ushiyama)"
  },
  {
    "title": "U.M.N. Operation",
    "japaneseTitle": "U.M.N. Operation",
    "localizedTitle": "U.M.N. Operation",
    "file": "03. U.M.N. Operation.mp3",
    "duration": 27,
    "game": "xenosaga-pied-piper",
    "composer": "TWO FIVE (Kousei Muraki, Tomokazu Ushiyama)"
  },
  {
    "title": "At Ease",
    "japaneseTitle": "At Ease",
    "localizedTitle": "At Ease",
    "file": "04. At Ease.mp3",
    "duration": 28,
    "game": "xenosaga-pied-piper",
    "composer": "TWO FIVE (Kousei Muraki, Tomokazu Ushiyama)"
  },
  {
    "title": "Mission Briefing",
    "japaneseTitle": "Mission Briefing",
    "localizedTitle": "Mission Briefing",
    "file": "05. Mission Briefing.mp3",
    "duration": 36,
    "game": "xenosaga-pied-piper",
    "composer": "TWO FIVE (Kousei Muraki, Tomokazu Ushiyama)"
  },
  {
    "title": "High Alert",
    "japaneseTitle": "High Alert",
    "localizedTitle": "High Alert",
    "file": "06. High Alert.mp3",
    "duration": 25,
    "game": "xenosaga-pied-piper",
    "composer": "TWO FIVE (Kousei Muraki, Tomokazu Ushiyama)"
  },
  {
    "title": "Aggravated Assault",
    "japaneseTitle": "Aggravated Assault",
    "localizedTitle": "Aggravated Assault",
    "file": "07. Aggravated Assault.mp3",
    "duration": 19,
    "game": "xenosaga-pied-piper",
    "composer": "TWO FIVE (Kousei Muraki, Tomokazu Ushiyama)"
  },
  {
    "title": "All Clear",
    "japaneseTitle": "All Clear",
    "localizedTitle": "All Clear",
    "file": "08. All Clear.mp3",
    "duration": 3,
    "game": "xenosaga-pied-piper",
    "composer": "TWO FIVE (Kousei Muraki, Tomokazu Ushiyama)"
  },
  {
    "title": "Operation Update",
    "japaneseTitle": "Operation Update",
    "localizedTitle": "Operation Update",
    "file": "09. Operation Update.mp3",
    "duration": 30,
    "game": "xenosaga-pied-piper",
    "composer": "TWO FIVE (Kousei Muraki, Tomokazu Ushiyama)"
  },
  {
    "title": "U.M.N. Menace",
    "japaneseTitle": "U.M.N. Menace",
    "localizedTitle": "U.M.N. Menace",
    "file": "10. U.M.N. Menace.mp3",
    "duration": 32,
    "game": "xenosaga-pied-piper",
    "composer": "TWO FIVE (Kousei Muraki, Tomokazu Ushiyama)"
  },
  {
    "title": "Revelations",
    "japaneseTitle": "Revelations",
    "localizedTitle": "Revelations",
    "file": "11. Revelations.mp3",
    "duration": 24,
    "game": "xenosaga-pied-piper",
    "composer": "TWO FIVE (Kousei Muraki, Tomokazu Ushiyama)"
  },
  {
    "title": "End of Watch Call",
    "japaneseTitle": "End of Watch Call",
    "localizedTitle": "End of Watch Call",
    "file": "12. End of Watch Call.mp3",
    "duration": 36,
    "game": "xenosaga-pied-piper",
    "composer": "TWO FIVE (Kousei Muraki, Tomokazu Ushiyama)"
  },
  {
    "title": "Pulse",
    "japaneseTitle": "Pulse",
    "localizedTitle": "Pulse",
    "file": "13. Pulse.mp3",
    "duration": 6,
    "game": "xenosaga-pied-piper",
    "composer": "TWO FIVE (Kousei Muraki, Tomokazu Ushiyama)"
  },
  {
    "title": "The Zohar's Awakening",
    "japaneseTitle": "The Zohar's Awakening",
    "localizedTitle": "The Zohar's Awakening",
    "file": "14. The Zohar's Awakening.mp3",
    "duration": 61,
    "game": "xenosaga-pied-piper",
    "composer": "TWO FIVE (Kousei Muraki, Tomokazu Ushiyama)"
  },
  {
    "title": "Mantle of Shadow",
    "japaneseTitle": "Mantle of Shadow",
    "localizedTitle": "Mantle of Shadow",
    "file": "15. Mantle of Shadow.mp3",
    "duration": 28,
    "game": "xenosaga-pied-piper",
    "composer": "TWO FIVE (Kousei Muraki, Tomokazu Ushiyama)"
  },
  {
    "title": "Final Report",
    "japaneseTitle": "Final Report",
    "localizedTitle": "Final Report",
    "file": "16. Final Report.mp3",
    "duration": 57,
    "game": "xenosaga-pied-piper",
    "composer": "TWO FIVE (Kousei Muraki, Tomokazu Ushiyama)"
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
// APRIL FOOLS - POISSON D'AVRIL
// ============================================

const APRIL_FOOLS_SONGS = {
  'full-xeno': {
    title: "Crimson Knight (Kazoo ver.)",
    localizedTitle: "Blazing Knights (Kazoo ver.)",
    file: "Crimson Knight (Kazoo ver.).mp3",
    duration: 158,
    game: "xenogears",
    composer: "Yasunori Mitsuda",
    folder: "poisson"
  },
  'xenoblade': {
    title: "Battle!! (but you won't forget)",
    localizedTitle: "Battle!! (but you won't forget)",
    file: "Battle!! (but you won't forget).mp3",
    duration: 205,
    game: "xenoblade-2",
    composer: "ACE+",
    folder: "poisson"
  },
  'xenosaga': {
    title: "Battle (DS)",
    localizedTitle: "Battle (DS)",
    file: "Battle (DS).mp3",
    duration: 180,
    game: "xenosaga-1",
    composer: "Yasunori Mitsuda",
    folder: "poisson"
  },
  'random': {
    title: "Uncontrollable (OST Version)",
    localizedTitle: "Uncontrollable (OST Version)",
    file: "Uncontrollable (OST Version).mp3",
    duration: 228,
    game: "xenoblade-x",
    composer: "Hiroyuki Sawano",
    folder: "poisson"
  }
};

// Check if today is April 1st (uses same 2h offset as daily song changeover)
function isAprilFools() {
  const dateString = window.DATE_OVERRIDE || null;
  if (dateString) {
    const parts = dateString.split('-');
    return parseInt(parts[1], 10) === 4 && parseInt(parts[2], 10) === 1;
  }
  const now = new Date();
  const offsetDate = new Date(now.getTime() + (2 * 60 * 60 * 1000));
  return offsetDate.getUTCMonth() === 3 && offsetDate.getUTCDate() === 1;
}

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

  if (isAprilFools()) {
    const afSong = APRIL_FOOLS_SONGS[modeId];
    if (afSong) {
      songs.push(afSong);
    }
  }

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
