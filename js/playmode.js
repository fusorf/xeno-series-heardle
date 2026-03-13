// ============================================
// PLAY MODE - Apple Music Style Music Browser
// ============================================

// State
let playmodeActive = false;
let playmodeAudio = null;
let playmodeIsPlaying = false;
let playmodeAnimFrame = null; // kept for legacy cleanup, no longer used for progress
let playmodeCurrentSong = null;
let playmodeCurrentGame = null;
let playmodeView = 'library'; // 'library' | 'album' | 'favorites'
let playmodeQueue = [];
let playmodeQueueIndex = -1;
let playmodeShuffleOn = false;
let playmodeRepeat = 'off'; // 'off' | 'all' | 'one'
let playmodeOriginalQueue = []; // unshuffled backup
let playmodeFullscreenNP = false; // mobile full-screen now playing
let playmodeSeeking = false;
let playmodeDragging = false; // true during swipe gesture on fullscreen NP
let playmodeOriginalTitle = ''; // saved page title

// Locale helper
function pmL(key) {
    return (locale && locale.playmode && locale.playmode[key]) || null;
}

// ============================================
// TOGGLE / ACTIVATE / DEACTIVATE
// ============================================

function togglePlayMode() {
    if (playmodeActive) {
        deactivatePlayMode();
    } else {
        activatePlayMode();
    }
}

function activatePlayMode() {
    // Deactivate other overlay modes
    if (typeof blitzActive !== 'undefined' && blitzActive) deactivateBlitz();
    if (typeof guesserActive !== 'undefined' && guesserActive) deactivateGuesser();
    if (typeof endlessMode !== 'undefined' && endlessMode) toggleEndlessMode();

    // Stop game audio
    if (typeof destroyPlayer === 'function') destroyPlayer();
    if (typeof destroyResultPlayer === 'function') destroyResultPlayer();

    playmodeActive = true;
    document.body.classList.add('playmode-active');

    // Change page title
    playmodeOriginalTitle = document.title;
    document.title = 'Xeno Series Music';

    const btn = document.getElementById('playmodeButton');
    if (btn) btn.classList.add('active');

    renderPlayMode();

    // Push state for back button
    history.pushState({ playmode: true }, '');
}

function deactivatePlayMode() {
    playmodeActive = false;
    document.body.classList.remove('playmode-active');

    // Restore page title
    if (playmodeOriginalTitle) document.title = playmodeOriginalTitle;

    // Clear hash
    if (window.location.hash === '#player') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    // Stop audio
    destroyPlaymodeAudio();

    // Clear MediaSession
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
    }

    playmodeView = 'library';
    playmodeCurrentGame = null;
    playmodeFullscreenNP = false;
}

// ============================================
// AUDIO ENGINE
// ============================================

function destroyPlaymodeAudio() {
    if (playmodeAudio) {
        playmodeAudio.removeEventListener('timeupdate', updatePlaymodeProgressUI);
        playmodeAudio.pause();
        playmodeAudio.removeAttribute('src');
        playmodeAudio.load();
        playmodeAudio = null;
    }
    playmodeIsPlaying = false;
    playmodeCurrentSong = null;
}

function playSong(song, gameId) {
    const url = getAudioUrl(song);
    if (!url) return;

    // Clean up previous
    if (playmodeAudio) {
        playmodeAudio.removeEventListener('timeupdate', updatePlaymodeProgressUI);
        playmodeAudio.pause();
        playmodeAudio.removeAttribute('src');
        playmodeAudio.load();
    }

    playmodeCurrentSong = song;
    playmodeCurrentGame = gameId || song.game;

    playmodeAudio = new Audio(url);
    playmodeAudio.volume = globalVolume;
    playmodeAudio.preload = 'auto';

    playmodeAudio.addEventListener('canplaythrough', () => {
        playmodeAudio.play().then(() => {
            playmodeIsPlaying = true;
            updatePlaymodeUI();
            updateMediaSession();
        }).catch(err => console.error('Playmode play error:', err));
    }, { once: true });

    playmodeAudio.addEventListener('ended', onTrackEnded);
    playmodeAudio.addEventListener('timeupdate', updatePlaymodeProgressUI);
    playmodeAudio.addEventListener('error', (e) => {
        console.error('Playmode audio error:', e);
    });

    playmodeAudio.load();

    // Update background blur
    updatePlaymodeBg();
    updatePlaymodeUI();
}

function togglePlaymodePlayback() {
    if (!playmodeAudio) return;

    if (playmodeIsPlaying) {
        playmodeAudio.pause();
        playmodeIsPlaying = false;
    } else {
        playmodeIsPlaying = true;
        playmodeAudio.play().catch(() => {
            playmodeIsPlaying = false;
            updatePlaymodeUI();
        });
    }
    updatePlaymodeUI();
    updateMediaSession();
}

function seekPlaymode(fraction) {
    if (!playmodeAudio || !playmodeAudio.duration) return;
    playmodeAudio.currentTime = fraction * playmodeAudio.duration;
    updatePlaymodeProgressUI();
}

function onTrackEnded() {
    if (playmodeRepeat === 'one') {
        playmodeAudio.currentTime = 0;
        playmodeAudio.play();
        return;
    }
    playNextTrack();
}

// ============================================
// QUEUE MANAGEMENT
// ============================================

function buildQueue(songs, startIndex) {
    playmodeOriginalQueue = songs.slice();
    if (playmodeShuffleOn) {
        // Fisher-Yates shuffle, but keep startIndex song first
        playmodeQueue = songs.slice();
        const startSong = playmodeQueue.splice(startIndex, 1)[0];
        for (let i = playmodeQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [playmodeQueue[i], playmodeQueue[j]] = [playmodeQueue[j], playmodeQueue[i]];
        }
        playmodeQueue.unshift(startSong);
        playmodeQueueIndex = 0;
    } else {
        playmodeQueue = songs.slice();
        playmodeQueueIndex = startIndex;
    }
}

function playNextTrack() {
    if (playmodeQueue.length === 0) return;

    playmodeQueueIndex++;
    if (playmodeQueueIndex >= playmodeQueue.length) {
        if (playmodeRepeat === 'all') {
            playmodeQueueIndex = 0;
        } else {
            // End of queue
            playmodeIsPlaying = false;
            updatePlaymodeUI();
            return;
        }
    }
    const song = playmodeQueue[playmodeQueueIndex];
    playSong(song, song.game);
}

function playPrevTrack() {
    if (!playmodeAudio) return;

    // If more than 3s in, restart current track
    if (playmodeAudio.currentTime > 3) {
        playmodeAudio.currentTime = 0;
        return;
    }

    if (playmodeQueueIndex > 0) {
        playmodeQueueIndex--;
        const song = playmodeQueue[playmodeQueueIndex];
        playSong(song, song.game);
    } else {
        playmodeAudio.currentTime = 0;
    }
}

function toggleShuffle() {
    playmodeShuffleOn = !playmodeShuffleOn;
    if (playmodeShuffleOn && playmodeOriginalQueue.length > 0) {
        // Reshuffle remaining tracks
        const currentSong = playmodeQueue[playmodeQueueIndex];
        const remaining = playmodeOriginalQueue.filter(s => s !== currentSong);
        for (let i = remaining.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
        }
        playmodeQueue = [currentSong, ...remaining];
        playmodeQueueIndex = 0;
    } else if (!playmodeShuffleOn && playmodeOriginalQueue.length > 0) {
        // Restore original order
        const currentSong = playmodeQueue[playmodeQueueIndex];
        playmodeQueue = playmodeOriginalQueue.slice();
        playmodeQueueIndex = playmodeQueue.indexOf(currentSong);
        if (playmodeQueueIndex < 0) playmodeQueueIndex = 0;
    }
    updatePlaymodeUI();
}

function toggleRepeat() {
    const modes = ['off', 'all', 'one'];
    const idx = modes.indexOf(playmodeRepeat);
    playmodeRepeat = modes[(idx + 1) % modes.length];
    updatePlaymodeUI();
}

// ============================================
// PLAY ALBUM / TRACK
// ============================================

function playAlbumFromTrack(gameId, trackIndex) {
    const songs = getSongsForAlbum(gameId);
    if (songs.length === 0) return;
    buildQueue(songs, trackIndex);
    playSong(songs[trackIndex], gameId);
}

function playAlbumShuffle(gameId) {
    const songs = getSongsForAlbum(gameId);
    if (songs.length === 0) return;
    playmodeShuffleOn = true;
    buildQueue(songs, Math.floor(Math.random() * songs.length));
    playSong(playmodeQueue[0], gameId);
}

// ============================================
// DATA HELPERS
// ============================================

function getAlbumList() {
    // Group games: DLCs under parent
    const albums = [];
    const added = new Set();

    // Ordered list of base game IDs
    const order = [
        'xenoblade-1', 'xenoblade-2', 'xenoblade-3',
        'xenoblade-x', 'xenogears',
        'xenosaga-1', 'xenosaga-2', 'xenosaga-3',
        'xenosaga-freaks', 'xenosaga-pied-piper'
    ];

    order.forEach(id => {
        const game = GAMES[id];
        if (!game || game.isDLC) return;
        const songs = SONG_POOLS[id];
        if (!songs || songs.length === 0) return;

        albums.push({ id, game, songCount: songs.length, isDLC: false });
        added.add(id);

        // Add DLCs
        Object.keys(GAMES).forEach(gId => {
            const g = GAMES[gId];
            if (g.parentGame === id && SONG_POOLS[gId] && SONG_POOLS[gId].length > 0) {
                albums.push({ id: gId, game: g, songCount: SONG_POOLS[gId].length, isDLC: true });
                added.add(gId);
            }
        });
    });

    // Add any remaining
    Object.keys(GAMES).forEach(id => {
        if (!added.has(id) && SONG_POOLS[id] && SONG_POOLS[id].length > 0) {
            albums.push({ id, game: GAMES[id], songCount: SONG_POOLS[id].length, isDLC: false });
        }
    });

    return albums;
}

function sortByFilename(songs) {
    return songs.slice().sort((a, b) => {
        const pa = a.file.match(/^(\d+)-(\d+)/);
        const pb = b.file.match(/^(\d+)-(\d+)/);
        if (!pa || !pb) return 0;
        const va = parseInt(pa[1]) * 1000 + parseInt(pa[2]);
        const vb = parseInt(pb[1]) * 1000 + parseInt(pb[2]);
        return va - vb;
    });
}

function getSongsForAlbum(gameId) {
    // If it's a parent game, include DLC songs
    const game = GAMES[gameId];
    if (!game) return [];

    let songs = sortByFilename(SONG_POOLS[gameId] || []);

    // Check for DLCs
    Object.keys(GAMES).forEach(gId => {
        if (GAMES[gId].parentGame === gameId && SONG_POOLS[gId]) {
            songs = songs.concat(sortByFilename(SONG_POOLS[gId]));
        }
    });

    return songs;
}

function getParentGameId(gameId) {
    const game = GAMES[gameId];
    return (game && game.parentGame) ? game.parentGame : gameId;
}

function getCoverUrl(gameId) {
    return `images/${gameId}/cover.jpg`;
}

function formatTime(seconds) {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// ============================================
// RENDERING
// ============================================

function renderPlayMode() {
    const overlay = document.getElementById('playmodeOverlay');
    if (!overlay) return;

    overlay.innerHTML = '';

    // Background blur
    const bg = document.createElement('div');
    bg.className = 'pm-bg-blur';
    bg.id = 'pmBgBlur';
    overlay.appendChild(bg);

    // Layout container
    const layout = document.createElement('div');
    layout.className = 'pm-layout';

    // Sidebar (desktop)
    layout.appendChild(renderSidebar());

    // Main content area
    const main = document.createElement('div');
    main.className = 'pm-main';
    main.id = 'pmMain';
    layout.appendChild(main);

    overlay.appendChild(layout);

    // Now playing bar (desktop)
    overlay.appendChild(renderNowPlayingBar());

    // Mobile mini player
    const miniPlayer = renderMiniPlayer();
    overlay.appendChild(miniPlayer);
    setupMiniPlayerSwipe(miniPlayer);


    // Fullscreen now playing (mobile)
    const fsNp = document.createElement('div');
    fsNp.className = 'pm-fullscreen-np';
    fsNp.id = 'pmFullscreenNP';
    overlay.appendChild(fsNp);
    setupFullscreenSwipeDown(fsNp);

    // Mobile bottom nav
    const bottomNav = document.createElement('div');
    bottomNav.className = 'pm-bottom-nav';
    bottomNav.id = 'pmBottomNav';
    bottomNav.innerHTML = `
        <button class="pm-nav-tab active" id="pmTabLibrary" onclick="pmNavigate('library'); pmUpdateBottomNav('library')">
            ${svgGrid()}
            <span>${pmL('library') || 'Library'}</span>
        </button>
        <button class="pm-nav-tab" id="pmTabFavorites" onclick="pmShowFavorites(); pmUpdateBottomNav('favorites')">
            ${svgHeart()}
            <span>${pmL('favorites') || 'Favorites'}</span>
        </button>
    `;
    overlay.appendChild(bottomNav);

    // Render initial view
    renderMainContent();
}

function renderSidebar() {
    const sidebar = document.createElement('div');
    sidebar.className = 'pm-sidebar';

    // Header
    const header = document.createElement('div');
    header.className = 'pm-sidebar-header';
    header.innerHTML = `
        <button class="pm-close-btn" onclick="deactivatePlayMode()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
    `;
    sidebar.appendChild(header);

    // Nav
    const nav = document.createElement('div');
    nav.className = 'pm-sidebar-nav';
    nav.innerHTML = `
        <button class="pm-nav-item active" id="pmNavLibrary" onclick="pmNavigate('library')">
            <span class="pm-nav-icon">${svgGrid()}</span>
            ${pmL('library') || 'Library'}
        </button>
        <button class="pm-nav-item" id="pmNavFavorites" onclick="pmShowFavorites()">
            <span class="pm-nav-icon">${svgHeart()}</span>
            ${pmL('favorites') || 'Favorites'}
        </button>
    `;
    sidebar.appendChild(nav);

    // Game list
    const gameList = document.createElement('div');
    gameList.className = 'pm-sidebar-games';
    gameList.id = 'pmSidebarGames';

    const label = document.createElement('div');
    label.className = 'pm-sidebar-section-label';
    label.textContent = pmL('albums') || 'Albums';
    gameList.appendChild(label);

    const albums = getAlbumList();
    albums.forEach(album => {
        if (album.isDLC) return; // Only show parent games in sidebar

        const item = document.createElement('button');
        item.className = 'pm-game-item';
        item.dataset.gameId = album.id;
        item.onclick = () => pmShowAlbum(album.id);

        const img = document.createElement('img');
        img.className = 'pm-game-thumb';
        img.src = getCoverUrl(album.id);
        img.alt = album.game.name;
        img.loading = 'lazy';

        const name = document.createElement('span');
        name.className = 'pm-game-name';
        name.textContent = album.game.name;

        item.appendChild(img);
        item.appendChild(name);
        gameList.appendChild(item);
    });

    sidebar.appendChild(gameList);
    return sidebar;
}

function renderNowPlayingBar() {
    const bar = document.createElement('div');
    bar.className = 'pm-now-playing';
    bar.id = 'pmNowPlaying';

    bar.innerHTML = `
        <div class="pm-np-progress-wrap" id="pmNpProgressWrap">
            <div class="pm-np-progress-fill" id="pmNpProgressFill"></div>
        </div>
        <img class="pm-np-cover" id="pmNpCover" src="" alt="">
        <div class="pm-np-info">
            <div class="pm-np-title" id="pmNpTitle">—</div>
            <div class="pm-np-artist" id="pmNpArtist">—</div>
        </div>
        <button class="pm-fav-btn pm-np-fav-btn" id="pmNpFavBtn" onclick="event.stopPropagation(); if(playmodeCurrentSong) pmToggleFavorite(playmodeCurrentSong)" title="Favorite">${svgHeart()}</button>
        <div class="pm-np-controls">
            <button class="pm-ctrl-btn" onclick="toggleShuffle()" id="pmBtnShuffle" title="Shuffle">${svgShuffle()}</button>
            <button class="pm-ctrl-btn" onclick="playPrevTrack()" title="Previous">${svgPrev()}</button>
            <button class="pm-ctrl-btn pm-play-btn" onclick="togglePlaymodePlayback()" id="pmBtnPlay" title="Play">${svgPlay()}</button>
            <button class="pm-ctrl-btn" onclick="playNextTrack()" title="Next">${svgNext()}</button>
            <button class="pm-ctrl-btn" onclick="toggleRepeat()" id="pmBtnRepeat" title="Repeat">${svgRepeat()}</button>
        </div>
        <div class="pm-np-time">
            <span id="pmNpTimeCurrent">0:00</span>
            <span>/</span>
            <span id="pmNpTimeTotal">0:00</span>
        </div>
        <div class="pm-np-volume">
            <button class="pm-ctrl-btn" onclick="pmToggleMute()" id="pmVolIcon">${svgVolume()}</button>
            <input type="range" class="pm-volume-slider" id="pmVolumeSlider" min="0" max="100" value="${Math.round(globalVolume * 100)}" oninput="setGlobalVolume(this.value / 100)">
        </div>
    `;

    // Seek handler
    setTimeout(() => {
        const progressWrap = document.getElementById('pmNpProgressWrap');
        if (progressWrap) {
            progressWrap.addEventListener('mousedown', (e) => {
                const rect = progressWrap.getBoundingClientRect();
                seekPlaymode((e.clientX - rect.left) / rect.width);
            });
        }
    }, 0);

    return bar;
}

function renderMiniPlayer() {
    const mini = document.createElement('div');
    mini.className = 'pm-mini-player';
    mini.id = 'pmMiniPlayer';

    mini.innerHTML = `
        <div class="pm-mini-progress">
            <div class="pm-mini-progress-fill" id="pmMiniProgressFill"></div>
        </div>
        <img class="pm-mini-cover" id="pmMiniCover" src="" alt="">
        <div class="pm-mini-info" onclick="pmShowFullscreenNP()">
            <div class="pm-mini-title" id="pmMiniTitle">—</div>
            <div class="pm-mini-artist" id="pmMiniArtist">—</div>
        </div>
        <button class="pm-mini-play-btn" onclick="event.stopPropagation(); togglePlaymodePlayback()" id="pmMiniPlayBtn">${svgPlay()}</button>
    `;

    return mini;
}

// ============================================
// MAIN CONTENT RENDERING
// ============================================

function renderMainContent() {
    const main = document.getElementById('pmMain');
    if (!main) return;

    if (playmodeView === 'library') {
        renderLibraryView(main);
    } else if (playmodeView === 'album') {
        renderAlbumView(main, playmodeCurrentGame);
    } else if (playmodeView === 'favorites') {
        renderFavoritesView(main);
    }
}

function renderLibraryView(container) {
    const content = document.createElement('div');
    content.className = 'pm-content';

    // Search + mobile close
    content.innerHTML = `
        <div class="pm-search-wrap">
            <button class="pm-search-close" onclick="deactivatePlayMode()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
            <div class="pm-search-field">
                <span class="pm-search-icon">${svgSearch()}</span>
                <input type="text" class="pm-search-input" id="pmSearchInput" placeholder="${pmL('search') || 'Search tracks, albums...'}" oninput="pmDebouncedSearch(this.value)">
            </div>
        </div>
    `;

    // Library header
    const header = document.createElement('div');
    header.className = 'pm-library-header';
    header.innerHTML = `<h2 class="pm-library-title">${pmL('library') || 'Library'}</h2>`;
    content.appendChild(header);

    // Album grid
    const grid = document.createElement('div');
    grid.className = 'pm-album-grid';
    grid.id = 'pmAlbumGrid';

    const albums = getAlbumList();
    albums.forEach(album => {
        if (album.isDLC) return; // DLCs shown inside parent album
        grid.appendChild(createAlbumCard(album));
    });

    content.appendChild(grid);
    container.innerHTML = '';
    container.appendChild(content);
    container.scrollTop = 0;
}

function createAlbumCard(album) {
    const card = document.createElement('div');
    card.className = 'pm-album-card';
    card.onclick = () => pmShowAlbum(album.id);

    // Count total songs (including DLCs)
    const totalSongs = getSongsForAlbum(album.id).length;

    card.innerHTML = `
        <div class="pm-album-cover-wrap">
            <img class="pm-album-cover" src="${getCoverUrl(album.id)}" alt="${album.game.name}" loading="lazy">
            <div class="pm-album-play-overlay" onclick="event.stopPropagation(); playAlbumShuffle('${album.id}')">
                ${svgShuffle()}
            </div>
        </div>
        <div class="pm-album-info">
            <div class="pm-album-title">${album.game.name}</div>
            <div class="pm-album-subtitle">${totalSongs} ${pmL('tracks') || 'tracks'}</div>
        </div>
    `;

    return card;
}

function renderAlbumView(container, gameId) {
    const parentId = getParentGameId(gameId);
    const game = GAMES[parentId];
    if (!game) return;

    const allSongs = getSongsForAlbum(parentId);
    const baseSongs = sortByFilename(SONG_POOLS[parentId] || []);

    // Find DLCs
    const dlcs = [];
    Object.keys(GAMES).forEach(gId => {
        if (GAMES[gId].parentGame === parentId && SONG_POOLS[gId] && SONG_POOLS[gId].length > 0) {
            dlcs.push({ id: gId, game: GAMES[gId], songs: sortByFilename(SONG_POOLS[gId]) });
        }
    });

    // Calculate total duration
    const totalDuration = allSongs.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalMin = Math.floor(totalDuration / 60);

    const content = document.createElement('div');
    content.className = 'pm-content pm-album-view';

    // Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'pm-back-btn';
    backBtn.innerHTML = `&larr; ${pmL('library') || 'Library'}`;
    backBtn.onclick = () => pmNavigate('library');
    content.appendChild(backBtn);

    // Album header
    const header = document.createElement('div');
    header.className = 'pm-album-header';
    header.innerHTML = `
        <img class="pm-album-header-cover" src="${getCoverUrl(parentId)}" alt="${game.name}">
        <div class="pm-album-header-info">
            <div class="pm-album-header-label">${pmL('album') || 'Album'}</div>
            <h1 class="pm-album-header-title">${game.name}</h1>
            <div class="pm-album-header-meta">${allSongs.length} ${pmL('tracks') || 'tracks'} &middot; ${totalMin} min</div>
            <div class="pm-album-actions">
                <button class="pm-action-btn primary" onclick="playAlbumFromTrack('${parentId}', 0)">
                    ${svgPlay()} ${pmL('play') || 'Play'}
                </button>
                <button class="pm-action-btn secondary" onclick="playAlbumShuffle('${parentId}')">
                    ${svgShuffle()} ${pmL('shuffle') || 'Shuffle'}
                </button>
            </div>
        </div>
    `;
    content.appendChild(header);

    // Track list
    const trackList = document.createElement('div');
    trackList.className = 'pm-track-list';

    // Header row
    trackList.innerHTML = `
        <div class="pm-track-list-header">
            <span>#</span>
            <span>Title</span>
            <span class="pm-th-artist">Artist</span>
            <span></span>
            <span style="text-align:right">${svgClock()}</span>
        </div>
    `;

    // Base game tracks
    let globalIndex = 0;
    baseSongs.forEach((song, i) => {
        const gi = globalIndex;
        trackList.appendChild(createTrackRow(song, i + 1, parentId, gi));
        globalIndex++;
    });

    // DLC tracks
    dlcs.forEach(dlc => {
        const section = document.createElement('div');
        section.className = 'pm-dlc-section';
        section.innerHTML = `<div class="pm-dlc-label">${dlc.game.name}</div>`;
        trackList.appendChild(section);

        dlc.songs.forEach((song, i) => {
            const gi = globalIndex;
            trackList.appendChild(createTrackRow(song, i + 1, parentId, gi));
            globalIndex++;
        });
    });

    content.appendChild(trackList);
    container.innerHTML = '';
    container.appendChild(content);
    container.scrollTop = 0;
}

function createTrackRow(song, num, albumId, globalIndex) {
    const track = document.createElement('div');
    track.className = 'pm-track';
    track.dataset.songFile = song.file;
    track.dataset.songGame = song.game;
    track.dataset.albumId = albumId;
    track.dataset.globalIndex = globalIndex;

    if (playmodeCurrentSong && playmodeCurrentSong.file === song.file && playmodeCurrentSong.game === song.game) {
        track.classList.add('playing');
        if (!playmodeIsPlaying) track.classList.add('paused');
    }

    const displayTitle = (typeof getDisplayTitle === 'function') ? getDisplayTitle(song) : song.title;
    const artist = song.artist || song.composer || '—';
    const isFav = pmIsFavorite(song);

    track.innerHTML = `
        <div class="pm-track-num">
            <span class="pm-track-num-text">${num}</span>
            <div class="pm-equalizer">
                <div class="pm-eq-bar"></div>
                <div class="pm-eq-bar"></div>
                <div class="pm-eq-bar"></div>
                <div class="pm-eq-bar"></div>
            </div>
        </div>
        <div class="pm-track-title">${displayTitle}</div>
        <div class="pm-track-artist">${artist}</div>
        <button class="pm-fav-btn ${isFav ? 'active' : ''}" data-file="${song.file}" data-game="${song.game}" onclick="event.stopPropagation(); pmToggleFavorite(SONG_POOLS['${song.game}'].find(s=>s.file==='${song.file}'))">${isFav ? svgHeartFilled() : svgHeart()}</button>
        <div class="pm-track-duration">${formatTime(song.duration)}</div>
    `;

    track.onclick = () => {
        playAlbumFromTrack(albumId, globalIndex);
    };

    return track;
}

// ============================================
// NAVIGATION
// ============================================

function pmNavigate(view) {
    playmodeView = view;
    playmodeCurrentGame = null;
    renderMainContent();
    updateSidebarActive();
}

function pmShowAlbum(gameId) {
    playmodeView = 'album';
    playmodeCurrentGame = gameId;
    renderMainContent();
    updateSidebarActive(gameId);
}

function pmShowFavorites() {
    playmodeView = 'favorites';
    playmodeCurrentGame = null;
    renderMainContent();
    updateSidebarActive();
}

function updateSidebarActive(gameId) {
    // Update nav
    const navLib = document.getElementById('pmNavLibrary');
    if (navLib) navLib.classList.toggle('active', playmodeView === 'library');
    const navFav = document.getElementById('pmNavFavorites');
    if (navFav) navFav.classList.toggle('active', playmodeView === 'favorites');

    // Update game items
    document.querySelectorAll('.pm-game-item').forEach(item => {
        item.classList.toggle('active', item.dataset.gameId === gameId);
    });

    // Update mobile bottom nav
    pmUpdateBottomNav(playmodeView);
}

function pmUpdateBottomNav(view) {
    const tabLib = document.getElementById('pmTabLibrary');
    const tabFav = document.getElementById('pmTabFavorites');
    if (tabLib) tabLib.classList.toggle('active', view === 'library' || view === 'album');
    if (tabFav) tabFav.classList.toggle('active', view === 'favorites');
}

// ============================================
// UI UPDATES
// ============================================

function updatePlaymodeUI() {
    const song = playmodeCurrentSong;
    const gameId = playmodeCurrentGame;

    // Now playing bar (desktop)
    const npBar = document.getElementById('pmNowPlaying');
    if (npBar) {
        npBar.classList.toggle('visible', !!song);
    }

    if (song) {
        const displayTitle = (typeof getDisplayTitle === 'function') ? getDisplayTitle(song) : song.title;
        const artist = song.artist || song.composer || '—';
        const coverId = getParentGameId(song.game);

        // Desktop NP
        const npTitle = document.getElementById('pmNpTitle');
        const npArtist = document.getElementById('pmNpArtist');
        const npCover = document.getElementById('pmNpCover');
        if (npTitle) npTitle.textContent = displayTitle;
        if (npArtist) npArtist.textContent = artist;
        if (npCover) npCover.src = getCoverUrl(coverId);

        // Desktop NP fav button
        const npFav = document.getElementById('pmNpFavBtn');
        if (npFav) {
            const isFav = pmIsFavorite(song);
            npFav.classList.toggle('active', isFav);
            npFav.innerHTML = isFav ? svgHeartFilled() : svgHeart();
        }

        // Mini player (mobile)
        const miniPlayer = document.getElementById('pmMiniPlayer');
        if (miniPlayer) miniPlayer.classList.add('visible');
        const miniTitle = document.getElementById('pmMiniTitle');
        const miniArtist = document.getElementById('pmMiniArtist');
        const miniCover = document.getElementById('pmMiniCover');
        if (miniTitle) miniTitle.textContent = displayTitle;
        if (miniArtist) miniArtist.textContent = artist;
        if (miniCover) miniCover.src = getCoverUrl(coverId);

        // Play/pause icons
        const playIcon = playmodeIsPlaying ? svgPause() : svgPlay();
        const btnPlay = document.getElementById('pmBtnPlay');
        if (btnPlay) btnPlay.innerHTML = playIcon;
        const miniPlayBtn = document.getElementById('pmMiniPlayBtn');
        if (miniPlayBtn) miniPlayBtn.innerHTML = playIcon;

        // Update total time
        if (playmodeAudio && playmodeAudio.duration) {
            const totalEl = document.getElementById('pmNpTimeTotal');
            if (totalEl) totalEl.textContent = formatTime(playmodeAudio.duration);
        }
    }

    // Shuffle/repeat states
    const btnShuffle = document.getElementById('pmBtnShuffle');
    if (btnShuffle) btnShuffle.classList.toggle('active', playmodeShuffleOn);
    const btnRepeat = document.getElementById('pmBtnRepeat');
    if (btnRepeat) {
        btnRepeat.classList.toggle('active', playmodeRepeat !== 'off');
        btnRepeat.innerHTML = playmodeRepeat === 'one' ? svgRepeatOne() : svgRepeat();
    }

    // Volume slider sync
    const pmVolSlider = document.getElementById('pmVolumeSlider');
    if (pmVolSlider) pmVolSlider.value = Math.round(globalVolume * 100);

    // Update track list highlighting
    updateTrackHighlights();

    // Update fullscreen NP if visible
    updateFullscreenNP();
}

let pmPrevPlayingEl = null;

function updateTrackHighlights() {
    // Remove highlight from previous track
    if (pmPrevPlayingEl) {
        pmPrevPlayingEl.classList.remove('playing', 'paused');
        pmPrevPlayingEl = null;
    }

    // Find and highlight current track
    if (playmodeCurrentSong) {
        const el = document.querySelector(`#pmMain .pm-track[data-song-file="${playmodeCurrentSong.file}"][data-song-game="${playmodeCurrentSong.game}"]`);
        if (el) {
            el.classList.add('playing');
            if (!playmodeIsPlaying) el.classList.add('paused');
            pmPrevPlayingEl = el;
        }
    }
}

function updatePlaymodeProgressUI() {
    if (!playmodeAudio) return;

    // Skip ALL progress DOM updates during drag to avoid jank
    // (rAF loop + DOM writes + blur compositing = frame drops during touch drag)
    if (playmodeDragging) return;

    const current = playmodeAudio.currentTime;
    const duration = playmodeAudio.duration || 1;
    const pct = (current / duration) * 100;

    // Desktop progress
    const fill = document.getElementById('pmNpProgressFill');
    if (fill) fill.style.width = pct + '%';

    // Desktop time
    const curEl = document.getElementById('pmNpTimeCurrent');
    if (curEl) curEl.textContent = formatTime(current);
    const totEl = document.getElementById('pmNpTimeTotal');
    if (totEl) totEl.textContent = formatTime(duration);

    // Mini player progress
    const miniFill = document.getElementById('pmMiniProgressFill');
    if (miniFill) miniFill.style.width = pct + '%';

    // Fullscreen progress
    const fsFill = document.getElementById('pmFsProgressFill');
    if (fsFill && !playmodeSeeking) fsFill.style.width = pct + '%';
    const fsCur = document.getElementById('pmFsTimeCurrent');
    if (fsCur) fsCur.textContent = formatTime(current);
    const fsTot = document.getElementById('pmFsTimeTotal');
    if (fsTot) fsTot.textContent = formatTime(duration);
}

function pmGenerateBlurredBg(coverUrl, callback) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        const c = document.createElement('canvas');
        c.width = 32;
        c.height = 32;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, 32, 32);
        callback(c.toDataURL('image/jpeg', 0.5));
    };
    img.onerror = () => {
        // Fallback: use original image with CSS blur
        callback(null);
    };
    img.src = coverUrl;
}

function updatePlaymodeBg() {
    const bg = document.getElementById('pmBgBlur');
    if (!bg || !playmodeCurrentSong) return;
    const coverId = getParentGameId(playmodeCurrentSong.game);
    const coverUrl = getCoverUrl(coverId);

    pmGenerateBlurredBg(coverUrl, (blurredUrl) => {
        if (blurredUrl) {
            bg.style.backgroundImage = `url('${blurredUrl}')`;
            bg.classList.add('pm-preblurred');
        } else {
            bg.style.backgroundImage = `url('${coverUrl}')`;
            bg.classList.remove('pm-preblurred');
        }
        bg.style.opacity = '0.15';
    });
}

function updateFsBg() {
    const fsBg = document.querySelector('.pm-fs-bg');
    if (!fsBg || !playmodeCurrentSong) return;
    const coverId = getParentGameId(playmodeCurrentSong.game);
    const coverUrl = getCoverUrl(coverId);

    pmGenerateBlurredBg(coverUrl, (blurredUrl) => {
        if (blurredUrl) {
            fsBg.style.backgroundImage = `url('${blurredUrl}')`;
            fsBg.classList.add('pm-preblurred');
        } else {
            fsBg.style.backgroundImage = `url('${coverUrl}')`;
            fsBg.classList.remove('pm-preblurred');
        }
    });
}

// ============================================
// MOBILE FULLSCREEN NOW PLAYING
// ============================================

function pmRenderFullscreenNPContent() {
    const fs = document.getElementById('pmFullscreenNP');
    if (!fs || !playmodeCurrentSong) return;

    const song = playmodeCurrentSong;
    const displayTitle = (typeof getDisplayTitle === 'function') ? getDisplayTitle(song) : song.title;
    const artist = song.artist || song.composer || '—';
    const coverId = getParentGameId(song.game);
    const playIcon = playmodeIsPlaying ? svgPause() : svgPlay();

    fs.innerHTML = `
        <div class="pm-fs-bg"></div>
        <button class="pm-fs-close" onclick="pmHideFullscreenNP()">&#x2715;</button>
        <div class="pm-fs-content">
            <div class="pm-fs-cover-wrap" id="pmFsCoverWrap">
                <img class="pm-fs-cover" id="pmFsCover" src="${getCoverUrl(coverId)}" alt="">
            </div>
            <div class="pm-fs-info">
                <div class="pm-fs-title">${displayTitle}</div>
                <div class="pm-fs-artist">${artist}</div>
            </div>
            <div class="pm-fs-progress">
                <div class="pm-fs-progress-bar" id="pmFsProgressBar">
                    <div class="pm-fs-progress-fill" id="pmFsProgressFill" style="width: 0%"></div>
                </div>
                <div class="pm-fs-times">
                    <span id="pmFsTimeCurrent">0:00</span>
                    <span id="pmFsTimeTotal">${formatTime(song.duration)}</span>
                </div>
            </div>
            <div class="pm-fs-controls">
                <button class="pm-fs-ctrl ${playmodeShuffleOn ? 'active' : ''}" onclick="toggleShuffle(); updateFullscreenNP()" id="pmFsShuffle">${svgShuffle()}</button>
                <button class="pm-fs-ctrl" onclick="playPrevTrack()">${svgPrev()}</button>
                <button class="pm-fs-play" onclick="togglePlaymodePlayback()" id="pmFsPlayBtn">${playIcon}</button>
                <button class="pm-fs-ctrl" onclick="playNextTrack()">${svgNext()}</button>
                <button class="pm-fs-ctrl ${playmodeRepeat !== 'off' ? 'active' : ''}" onclick="toggleRepeat(); updateFullscreenNP()" id="pmFsRepeat">${playmodeRepeat === 'one' ? svgRepeatOne() : svgRepeat()}</button>
            </div>
            <div class="pm-fs-actions-row">
                <button class="pm-fs-go-album" onclick="pmGoToAlbum()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M21 15V6"/><path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M12 12V3"/><path d="M9.5 15a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/><path d="M3 9v6"/><circle cx="3" cy="18" r="2.5" fill="none"/></svg>
                    ${pmL('viewInTracklist') || 'View in tracklist'}
                </button>
                <button class="pm-fs-fav-btn ${pmIsFavorite(song) ? 'active' : ''}" id="pmFsFavBtn" onclick="pmToggleFavorite(playmodeCurrentSong)">
                    ${pmIsFavorite(song) ? svgHeartFilled() : svgHeart()}
                </button>
            </div>
        </div>
    `;

    // Pre-blur the fullscreen background
    updateFsBg();

    // Seek on progress bar
    const progressBar = document.getElementById('pmFsProgressBar');
    if (progressBar) {
        setupFsSeek(progressBar);
    }
}

function pmShowFullscreenNP() {
    if (!playmodeCurrentSong) return;
    playmodeFullscreenNP = true;

    const fs = document.getElementById('pmFullscreenNP');
    if (!fs) return;

    pmRenderFullscreenNPContent();

    // Remove dragging state and let CSS transition handle the slide
    fs.classList.remove('dragging');
    fs.style.transform = '';
    fs.classList.add('visible');

    // Disable underlying blurs (they're hidden behind fullscreen NP)
    const overlay = document.getElementById('playmodeOverlay');
    if (overlay) overlay.classList.add('pm-fs-active');

    updatePlaymodeProgressUI();
}

function setupFsSeek(bar) {
    const doSeek = (e) => {
        const rect = bar.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const frac = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const fill = document.getElementById('pmFsProgressFill');
        if (fill) fill.style.width = (frac * 100) + '%';
        return frac;
    };

    bar.addEventListener('mousedown', (e) => {
        playmodeSeeking = true;
        bar.classList.add('dragging');
        const frac = doSeek(e);

        const onMove = (ev) => doSeek(ev);
        const onUp = (ev) => {
            playmodeSeeking = false;
            bar.classList.remove('dragging');
            const finalFrac = doSeek(ev);
            seekPlaymode(finalFrac);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });

    bar.addEventListener('touchstart', (e) => {
        playmodeSeeking = true;
        bar.classList.add('dragging');
        doSeek(e);
    }, { passive: true });

    bar.addEventListener('touchmove', (e) => {
        if (playmodeSeeking) doSeek(e);
    }, { passive: true });

    bar.addEventListener('touchend', (e) => {
        playmodeSeeking = false;
        bar.classList.remove('dragging');
        const rect = bar.getBoundingClientRect();
        const touch = e.changedTouches[0];
        const frac = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
        seekPlaymode(frac);
    });
}

function pmHideFullscreenNP() {
    playmodeFullscreenNP = false;
    const fs = document.getElementById('pmFullscreenNP');
    if (fs) fs.classList.remove('visible');

    // Re-enable underlying blurs
    const overlay = document.getElementById('playmodeOverlay');
    if (overlay) overlay.classList.remove('pm-fs-active');
}

// ============================================
// SWIPE GESTURES
// ============================================

function setupMiniPlayerSwipe(miniEl) {
    let startY = 0;
    let startTime = 0;
    let dragging = false;
    let rendered = false;

    miniEl.addEventListener('touchstart', (e) => {
        if (!playmodeCurrentSong) return;
        startY = e.touches[0].clientY;
        startTime = Date.now();
        dragging = false;
        rendered = false;
    }, { passive: true });

    miniEl.addEventListener('touchmove', (e) => {
        if (!playmodeCurrentSong || startY === 0) return;
        const dy = startY - e.touches[0].clientY;
        // Only start dragging on upward movement
        if (dy > 10) {
            if (!dragging) {
                dragging = true;
                playmodeDragging = true;
            }
            e.preventDefault(); // prevent native pan competing with our transform
            const fs = document.getElementById('pmFullscreenNP');
            if (fs && !playmodeFullscreenNP) {
                // Render content on first drag frame
                if (!rendered) {
                    pmRenderFullscreenNPContent();
                    rendered = true;
                }
                fs.classList.add('dragging');
                const h = window.innerHeight;
                const offset = Math.max(0, h - dy);
                fs.style.transform = `translateY(${offset}px)`;
            }
        }
    }, { passive: false });

    miniEl.addEventListener('touchend', (e) => {
        if (!dragging) {
            startY = 0;
            return;
        }
        dragging = false;
        playmodeDragging = false;
        const fs = document.getElementById('pmFullscreenNP');
        if (!fs) { startY = 0; return; }

        const endY = e.changedTouches[0].clientY;
        const dy = startY - endY;
        const velocity = dy / (Date.now() - startTime);

        fs.classList.remove('dragging');

        // Open if dragged more than 30% of screen or fast swipe
        if (dy > window.innerHeight * 0.3 || velocity > 0.5) {
            pmShowFullscreenNP();
        } else {
            // Snap back down
            fs.style.transform = '';
        }

        startY = 0;
    });
}

function setupFullscreenSwipeDown(fsEl) {
    let startY = 0;
    let startTime = 0;
    let dragging = false;

    fsEl.addEventListener('touchstart', (e) => {
        // Don't capture if touching progress bar or controls
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'button' || tag === 'svg' || tag === 'line' || tag === 'polyline' ||
            tag === 'polygon' || tag === 'rect' || tag === 'path' || tag === 'circle' || tag === 'text' ||
            e.target.closest('.pm-fs-progress') || e.target.closest('.pm-fs-controls')) {
            return;
        }
        startY = e.touches[0].clientY;
        startTime = Date.now();
        dragging = false;
    }, { passive: true });

    fsEl.addEventListener('touchmove', (e) => {
        if (startY === 0) return;
        const dy = e.touches[0].clientY - startY;
        // Only start dragging on downward movement
        if (dy > 10) {
            if (!dragging) {
                dragging = true;
                playmodeDragging = true;
            }
            e.preventDefault(); // prevent native pan competing with our transform
            fsEl.classList.add('dragging');
            fsEl.style.transform = `translateY(${dy}px)`;
        }
    }, { passive: false });

    fsEl.addEventListener('touchend', (e) => {
        if (!dragging) {
            startY = 0;
            return;
        }
        dragging = false;
        playmodeDragging = false;

        const endY = e.changedTouches[0].clientY;
        const dy = endY - startY;
        const velocity = dy / (Date.now() - startTime);

        fsEl.classList.remove('dragging');
        fsEl.style.transform = '';

        // Close if dragged more than 25% of screen or fast swipe
        if (dy > window.innerHeight * 0.25 || velocity > 0.4) {
            pmHideFullscreenNP();
        } else {
            // Snap back
            fsEl.classList.add('visible');
        }

        startY = 0;
    });
}

function pmGoToAlbum() {
    if (!playmodeCurrentSong) return;
    const gameId = getParentGameId(playmodeCurrentSong.game);

    // Close fullscreen NP
    pmHideFullscreenNP();

    // Navigate to album
    pmShowAlbum(gameId);

    // Scroll to current track after render
    setTimeout(() => {
        const playing = document.querySelector('#pmMain .pm-track.playing');
        if (playing) {
            playing.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

function updateFullscreenNP() {
    if (!playmodeFullscreenNP) return;

    const song = playmodeCurrentSong;
    if (song) {
        const displayTitle = (typeof getDisplayTitle === 'function') ? getDisplayTitle(song) : song.title;
        const artist = song.artist || song.composer || '—';
        const coverId = getParentGameId(song.game);

        // Update song info
        const fsTitle = document.querySelector('.pm-fs-title');
        const fsArtist = document.querySelector('.pm-fs-artist');
        const fsCover = document.getElementById('pmFsCover');
        const fsBg = document.querySelector('.pm-fs-bg');
        const fsTimeTotal = document.getElementById('pmFsTimeTotal');

        if (fsTitle) fsTitle.textContent = displayTitle;
        if (fsArtist) fsArtist.textContent = artist;
        if (fsCover) fsCover.src = getCoverUrl(coverId);
        if (fsBg) updateFsBg();
        if (fsTimeTotal) fsTimeTotal.textContent = formatTime(song.duration);

        const fsHeart = document.getElementById('pmFsFavBtn');
        if (fsHeart) {
            const isFav = pmIsFavorite(song);
            fsHeart.classList.toggle('active', isFav);
            fsHeart.innerHTML = isFav ? svgHeartFilled() : svgHeart();
        }
    }

    const fsPlayBtn = document.getElementById('pmFsPlayBtn');
    if (fsPlayBtn) fsPlayBtn.innerHTML = playmodeIsPlaying ? svgPause() : svgPlay();

    const fsShuffle = document.getElementById('pmFsShuffle');
    if (fsShuffle) fsShuffle.classList.toggle('active', playmodeShuffleOn);

    const fsRepeat = document.getElementById('pmFsRepeat');
    if (fsRepeat) {
        fsRepeat.classList.toggle('active', playmodeRepeat !== 'off');
        fsRepeat.innerHTML = playmodeRepeat === 'one' ? svgRepeatOne() : svgRepeat();
    }
}

// ============================================
// SEARCH
// ============================================

let pmSearchTimeout = null;

function pmDebouncedSearch(value) {
    clearTimeout(pmSearchTimeout);
    pmSearchTimeout = setTimeout(() => pmFilterLibrary(value), 150);
}

function pmFilterLibrary(query) {
    const grid = document.getElementById('pmAlbumGrid');
    if (!grid) return;

    const q = query.toLowerCase().trim();
    if (!q) {
        // Show albums
        grid.style.display = '';
        grid.innerHTML = '';
        const albums = getAlbumList();
        albums.forEach(album => {
            if (album.isDLC) return;
            grid.appendChild(createAlbumCard(album));
        });

        // Remove search results
        const existing = document.getElementById('pmSearchResults');
        if (existing) existing.remove();
        return;
    }

    // Hide album grid, show song results
    grid.style.display = 'none';

    let results = document.getElementById('pmSearchResults');
    if (!results) {
        results = document.createElement('div');
        results.id = 'pmSearchResults';
        results.className = 'pm-track-list';
        grid.parentNode.appendChild(results);
    }

    // Search songs across all games
    const matches = [];
    Object.keys(SONG_POOLS).forEach(gameId => {
        const songs = SONG_POOLS[gameId];
        if (!songs) return;
        songs.forEach(song => {
            const title = (song.title || '').toLowerCase();
            const jTitle = (song.japaneseTitle || '').toLowerCase();
            const lTitle = (song.localizedTitle || '').toLowerCase();
            const composer = (song.composer || '').toLowerCase();
            const artist = (song.artist || '').toLowerCase();
            const gameName = (GAMES[gameId]?.name || '').toLowerCase();
            const shortName = (GAMES[gameId]?.shortName || '').toLowerCase();

            if (title.includes(q) || jTitle.includes(q) || lTitle.includes(q) ||
                composer.includes(q) || artist.includes(q) ||
                gameName.includes(q) || shortName.includes(q)) {
                matches.push({ song, gameId });
            }
        });
    });

    results.innerHTML = '';
    if (matches.length === 0) {
        results.innerHTML = `<div style="padding: 20px; color: var(--pm-text-tertiary); font-size: 14px;">${pmL('noResults') || 'No results found'}</div>`;
        return;
    }

    // Limit results
    const shown = matches.slice(0, 50);
    shown.forEach(({ song, gameId }, i) => {
        const track = document.createElement('div');
        track.className = 'pm-track';
        track.style.gridTemplateColumns = '1fr 1fr 60px';

        if (playmodeCurrentSong && playmodeCurrentSong.file === song.file && playmodeCurrentSong.game === song.game) {
            track.classList.add('playing');
            if (!playmodeIsPlaying) track.classList.add('paused');
        }

        const displayTitle = (typeof getDisplayTitle === 'function') ? getDisplayTitle(song) : song.title;
        const artist = song.artist || song.composer || '—';
        const gameName = GAMES[gameId]?.name || '';

        track.innerHTML = `
            <div class="pm-track-title">${displayTitle}<span style="color:var(--pm-text-tertiary); font-size:12px; margin-left:8px">${gameName}</span></div>
            <div class="pm-track-artist">${artist}</div>
            <div class="pm-track-duration">${formatTime(song.duration)}</div>
        `;

        track.onclick = () => {
            // Build queue from search results
            const searchSongs = shown.map(m => m.song);
            buildQueue(searchSongs, i);
            playSong(song, gameId);
        };

        results.appendChild(track);
    });

    if (matches.length > 50) {
        results.innerHTML += `<div style="padding: 12px; color: var(--pm-text-tertiary); font-size: 13px; text-align: center;">${pmL('showing') || 'Showing'} 50 ${pmL('of') || 'of'} ${matches.length} ${pmL('results') || 'results'}</div>`;
    }
}

function pmFocusSearch() {
    pmNavigate('library');
    setTimeout(() => {
        const input = document.getElementById('pmSearchInput');
        if (input) input.focus();
    }, 100);
}

// ============================================
// MUTE TOGGLE
// ============================================

function pmToggleMute() {
    if (globalVolume > 0) {
        window._pmPrevVolume = globalVolume;
        setGlobalVolume(0);
    } else {
        setGlobalVolume(window._pmPrevVolume || 1);
    }
    const icon = document.getElementById('pmVolIcon');
    if (icon) icon.innerHTML = globalVolume === 0 ? svgVolumeMute() : svgVolume();
}

// ============================================
// MEDIA SESSION API
// ============================================

let pmMediaSessionHandlersRegistered = false;

function pmRegisterMediaSessionHandlers() {
    if (pmMediaSessionHandlersRegistered || !('mediaSession' in navigator)) return;
    pmMediaSessionHandlersRegistered = true;

    navigator.mediaSession.setActionHandler('play', () => {
        if (playmodeAudio && !playmodeIsPlaying) togglePlaymodePlayback();
    });
    navigator.mediaSession.setActionHandler('pause', () => {
        if (playmodeAudio && playmodeIsPlaying) togglePlaymodePlayback();
    });
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrevTrack());
    navigator.mediaSession.setActionHandler('nexttrack', () => playNextTrack());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (playmodeAudio && details.seekTime != null) {
            playmodeAudio.currentTime = details.seekTime;
        }
    });
}

function updateMediaSession() {
    if (!('mediaSession' in navigator) || !playmodeCurrentSong) return;

    pmRegisterMediaSessionHandlers();

    const song = playmodeCurrentSong;
    const displayTitle = (typeof getDisplayTitle === 'function') ? getDisplayTitle(song) : song.title;
    const artist = song.artist || song.composer || 'Xeno Series';
    const coverId = getParentGameId(song.game);
    const game = GAMES[coverId];

    navigator.mediaSession.metadata = new MediaMetadata({
        title: displayTitle,
        artist: artist,
        album: game ? game.name : 'Xeno Series',
        artwork: [
            { src: getCoverUrl(coverId), sizes: '512x512', type: 'image/jpeg' }
        ]
    });

    navigator.mediaSession.playbackState = playmodeIsPlaying ? 'playing' : 'paused';
}

// ============================================
// BACK BUTTON HANDLER
// ============================================

window.addEventListener('popstate', (e) => {
    if (playmodeActive) {
        if (playmodeFullscreenNP) {
            pmHideFullscreenNP();
        } else if (playmodeView === 'album' || playmodeView === 'favorites') {
            pmNavigate('library');
        } else {
            deactivatePlayMode();
        }
    }
});

// ============================================
// FAVORITES
// ============================================

const PM_FAV_KEY = 'xenoHeardle_playmode_favorites';
let pmFavCache = null;

function pmGetFavorites() {
    if (pmFavCache !== null) return pmFavCache;
    try {
        pmFavCache = JSON.parse(localStorage.getItem(PM_FAV_KEY)) || [];
    } catch { pmFavCache = []; }
    return pmFavCache;
}

function pmSaveFavorites(favs) {
    pmFavCache = favs;
    localStorage.setItem(PM_FAV_KEY, JSON.stringify(favs));
}

function pmIsFavorite(song) {
    const favs = pmGetFavorites();
    return favs.some(f => f.file === song.file && f.game === song.game);
}

function pmToggleFavorite(song) {
    let favs = pmGetFavorites();
    const idx = favs.findIndex(f => f.file === song.file && f.game === song.game);
    if (idx >= 0) {
        favs.splice(idx, 1);
    } else {
        favs.push({ file: song.file, game: song.game });
    }
    pmSaveFavorites(favs);
    pmUpdateFavIcons(song);
}

function pmUpdateFavIcons(song) {
    // Update all heart icons for this song
    document.querySelectorAll(`.pm-fav-btn[data-file="${song.file}"][data-game="${song.game}"]`).forEach(btn => {
        const isFav = pmIsFavorite(song);
        btn.classList.toggle('active', isFav);
        btn.innerHTML = isFav ? svgHeartFilled() : svgHeart();
    });
    // Update fullscreen NP heart if visible
    const fsHeart = document.getElementById('pmFsFavBtn');
    if (fsHeart && playmodeCurrentSong && playmodeCurrentSong.file === song.file) {
        const isFav2 = pmIsFavorite(song);
        fsHeart.classList.toggle('active', isFav2);
        fsHeart.innerHTML = isFav2 ? svgHeartFilled() : svgHeart();
    }
    // Update desktop NP heart
    const npHeart = document.getElementById('pmNpFavBtn');
    if (npHeart && playmodeCurrentSong && playmodeCurrentSong.file === song.file) {
        const isFav3 = pmIsFavorite(song);
        npHeart.classList.toggle('active', isFav3);
        npHeart.innerHTML = isFav3 ? svgHeartFilled() : svgHeart();
    }
}

function pmGetFavoriteSongs() {
    const favs = pmGetFavorites();
    const songs = [];
    favs.forEach(f => {
        const pool = SONG_POOLS[f.game];
        if (!pool) return;
        const song = pool.find(s => s.file === f.file);
        if (song) songs.push(song);
    });
    return songs;
}

function renderFavoritesView(container) {
    const content = document.createElement('div');
    content.className = 'pm-content pm-album-view';

    // Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'pm-back-btn';
    backBtn.innerHTML = `&larr; ${pmL('library') || 'Library'}`;
    backBtn.onclick = () => pmNavigate('library');
    content.appendChild(backBtn);

    // Header
    const header = document.createElement('div');
    header.className = 'pm-library-header';
    header.innerHTML = `<h2 class="pm-library-title">${pmL('favorites') || 'Favorites'}</h2>`;
    content.appendChild(header);

    const favSongs = pmGetFavoriteSongs();

    if (favSongs.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.style.cssText = 'padding: 20px; color: var(--pm-text-tertiary); font-size: 14px;';
        emptyMsg.textContent = pmL('noFavorites') || 'No favorites yet. Tap the heart icon on any track to add it here.';
        content.appendChild(emptyMsg);
        container.innerHTML = '';
        container.appendChild(content);
        container.scrollTop = 0;
        return;
    }

    // Actions
    const actions = document.createElement('div');
    actions.className = 'pm-album-actions';
    actions.style.marginBottom = '20px';
    actions.innerHTML = `
        <button class="pm-action-btn primary" onclick="pmPlayFavorites(false)">
            ${svgPlay()} ${pmL('play') || 'Play'}
        </button>
        <button class="pm-action-btn secondary" onclick="pmPlayFavorites(true)">
            ${svgShuffle()} ${pmL('shuffle') || 'Shuffle'}
        </button>
    `;
    content.appendChild(actions);

    // Track list
    const trackList = document.createElement('div');
    trackList.className = 'pm-track-list';

    favSongs.forEach((song, i) => {
        const track = document.createElement('div');
        track.className = 'pm-track pm-track-fav';
        track.dataset.songFile = song.file;
        track.dataset.songGame = song.game;

        if (playmodeCurrentSong && playmodeCurrentSong.file === song.file && playmodeCurrentSong.game === song.game) {
            track.classList.add('playing');
            if (!playmodeIsPlaying) track.classList.add('paused');
        }

        const displayTitle = (typeof getDisplayTitle === 'function') ? getDisplayTitle(song) : song.title;
        const artist = song.artist || song.composer || '—';
        const gameName = GAMES[song.game]?.name || '';

        track.innerHTML = `
            <div class="pm-track-title">${displayTitle}<span style="color:var(--pm-text-tertiary); font-size:12px; margin-left:8px">${gameName}</span></div>
            <div class="pm-track-artist">${artist}</div>
            <button class="pm-fav-btn active" data-file="${song.file}" data-game="${song.game}" onclick="event.stopPropagation(); pmToggleFavorite(SONG_POOLS['${song.game}'].find(s=>s.file==='${song.file}')); setTimeout(()=>{ if(playmodeView==='favorites') renderFavoritesView(document.getElementById('pmMain')); }, 200)">${svgHeartFilled()}</button>
            <div class="pm-track-duration">${formatTime(song.duration)}</div>
        `;

        track.onclick = () => {
            buildQueue(favSongs, i);
            playSong(song, song.game);
        };

        trackList.appendChild(track);
    });

    content.appendChild(trackList);
    container.innerHTML = '';
    container.appendChild(content);
    container.scrollTop = 0;
}

function pmPlayFavorites(shuffle) {
    const songs = pmGetFavoriteSongs();
    if (songs.length === 0) return;
    if (shuffle) {
        playmodeShuffleOn = true;
        buildQueue(songs, Math.floor(Math.random() * songs.length));
        playSong(playmodeQueue[0], playmodeQueue[0].game);
    } else {
        playmodeShuffleOn = false;
        buildQueue(songs, 0);
        playSong(songs[0], songs[0].game);
    }
}

// ============================================
// HASH ROUTING (#player)
// ============================================

function pmCheckHash() {
    if (window.location.hash === '#player') {
        if (!playmodeActive) activatePlayMode();
    }
}

window.addEventListener('hashchange', pmCheckHash);
window.addEventListener('DOMContentLoaded', pmCheckHash);

// ============================================
// SVG ICONS
// ============================================

function svgPlay() {
    return '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 19,12 8,19"/></svg>';
}

function svgPause() {
    return '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
}

function svgPrev() {
    return '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="5" width="2" height="14" rx="0.5"/><polygon points="20,5 10,12 20,19"/></svg>';
}

function svgNext() {
    return '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="18" y="5" width="2" height="14" rx="0.5"/><polygon points="4,5 14,12 4,19"/></svg>';
}

function svgShuffle() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>';
}

function svgRepeat() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
}

function svgRepeatOne() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><text x="12" y="14" text-anchor="middle" fill="currentColor" stroke="none" font-size="8" font-weight="bold">1</text></svg>';
}

function svgVolume() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
}

function svgVolumeMute() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
}

function svgGrid() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
}

function svgSearch() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
}

function svgClock() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
}

function svgHeart() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
}

function svgHeartFilled() {
    return '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
}
