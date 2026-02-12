#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Scan music library and generate song entries for songs.js
"""

import os
import json
import sys
from pathlib import Path

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

try:
    from mutagen import File
    HAS_MUTAGEN = True
except ImportError:
    print("Warning: mutagen not installed. Durations will be set to 0.")
    print("Install with: pip install mutagen")
    HAS_MUTAGEN = False

import re

# Music library path
LIBRARY_PATH = r"C:\Users\Valentin\Desktop\Xeno Series full soundrack"

# Mapping folder names to game IDs
# Note: Both Xenosaga II folders will be combined into xenosaga-2
FOLDER_TO_GAME = {
    "Xenoblade Chronicles Original Soundtrack Trinity Box (2023)": "trinity-box",  # Will be split later
    "Xenoblade Chronicles (Wii) (gamerip) (2010)": "xenoblade-1-wii",
    "Xenoblade Chronicles X - Definitive Edition (Switch, Switch 2) (gamerip) (2025)": "xenoblade-x",
    "Xenogears ORIGINAL SOUNDTRACK (1998)": "xenogears",
    "Xenosaga Episode I (2004)": "xenosaga-1",
    "Xenosaga Episode III OST": "xenosaga-3",
    "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)": "xenosaga-2-gamerip",
    "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)": "xenosaga-2-movie",
    "Xenosaga Freaks (PS2) (gamerip) (2004)": "xenosaga-freaks",
    "Xenosaga Pied Piper (Mobile) (gamerip) (2004)": "xenosaga-pied-piper",
    "Super Smash Bros. Ultimate Vol. 20 - Xenoblade Chronicles (Switch) (gamerip) (2018)": "smash-remixes"
}

# Trinity Box track ranges
TRINITY_BOX_RANGES = {
    "xenoblade-1": {"start": "1-01", "end": "5-09"},  # XC1 DE
    "xenoblade-1-fc": {"start": "5-10", "end": "5-17"},  # XC1 DE - Future Connected
    "xenoblade-2": {"start": "6-01", "end": "10-21"},  # XC2
    "xenoblade-2-torna": {"start": "11-01", "end": "11-11"},  # XC2 - Torna
    "xenoblade-3": {"start": "12-01", "end": "19-16"},  # XC3
    "xenoblade-3-fr": {"start": "20-01", "end": "20-14"}  # XC3 - Future Redeemed
}

# XCX DE track ranges
XCX_DE_RANGES = {
    "xenoblade-x": {"start": "1-01", "end": "4-56"},  # Base game
    "xenoblade-x-de": {"start": "5-01", "end": "5-09"}  # DE exclusive
}

# Localized titles for XCX DE exclusive tracks
XCX_DE_TITLES = {
    "2S-FIELD": "Volitaris Field",
    "2D-BATTLE": "Volitaris Battle"
}

def get_audio_duration(filepath):
    """Get duration of audio file in seconds"""
    if not HAS_MUTAGEN:
        return 180  # Default 3 minutes

    try:
        audio = File(filepath)
        if audio and audio.info:
            return int(audio.info.length)
        return 180
    except Exception as e:
        return 180

def clean_title(filename):
    """Clean filename to get title"""
    # Remove track number prefix (e.g., "1-01. " or "01 ")
    title = re.sub(r'^\d+-\d+\.\s*', '', filename)
    title = re.sub(r'^\d+\s*-?\s*', '', title)

    # Remove file extension
    title = os.path.splitext(title)[0]

    return title.strip()

def get_track_number(filename):
    """Extract track number from filename (e.g., '1-01' from '1-01. Main Theme.mp3')"""
    match = re.match(r'^(\d+-\d+)', filename)
    return match.group(1) if match else None

def is_in_range(track_num, start, end):
    """Check if track number is within range"""
    if not track_num:
        return False

    # Convert "1-01" to (1, 1) for comparison
    def parse_track(t):
        parts = t.split('-')
        return (int(parts[0]), int(parts[1]))

    track = parse_track(track_num)
    start_track = parse_track(start)
    end_track = parse_track(end)

    return start_track <= track <= end_track

def apply_xcx_de_title(title):
    """Apply localized title for XCX DE tracks"""
    for code, localized in XCX_DE_TITLES.items():
        if code in title:
            return localized
    return title

def scan_folder(folder_path, game_id):
    """Scan a folder and return list of song entries"""
    songs_by_game = {}

    # Supported audio formats
    audio_extensions = ('.mp3', '.flac', '.wav', '.ogg', '.m4a')

    for root, dirs, files in os.walk(folder_path):
        for file in sorted(files):
            if file.lower().endswith(audio_extensions):
                filepath = os.path.join(root, file)

                # Get duration
                duration = get_audio_duration(filepath)

                # Clean title
                title = clean_title(file)

                # Determine actual game ID based on special cases
                actual_game_id = game_id

                # Handle Trinity Box split
                if game_id == "trinity-box":
                    track_num = get_track_number(file)
                    for sub_game_id, range_data in TRINITY_BOX_RANGES.items():
                        if is_in_range(track_num, range_data["start"], range_data["end"]):
                            actual_game_id = sub_game_id
                            break

                # Handle XCX DE split
                elif game_id == "xenoblade-x":
                    track_num = get_track_number(file)
                    for sub_game_id, range_data in XCX_DE_RANGES.items():
                        if is_in_range(track_num, range_data["start"], range_data["end"]):
                            actual_game_id = sub_game_id
                            # Apply XCX DE localized titles
                            if sub_game_id == "xenoblade-x-de":
                                localized_title = apply_xcx_de_title(title)
                            else:
                                localized_title = title
                            break
                    else:
                        localized_title = title
                else:
                    localized_title = title

                # Create entry
                song = {
                    "title": title,
                    "localizedTitle": localized_title if 'localized_title' in locals() else title,
                    "file": file,
                    "duration": duration,
                    "game": actual_game_id
                }

                # Group by game ID
                if actual_game_id not in songs_by_game:
                    songs_by_game[actual_game_id] = []
                songs_by_game[actual_game_id].append(song)

    return songs_by_game

def generate_js_array(game_id, songs):
    """Generate JavaScript array code"""
    var_name = f"SONGS_{game_id.upper().replace('-', '_')}"

    js_code = f"// {game_id}\n"
    js_code += f"const {var_name} = [\n"

    for song in songs:
        js_code += "  {\n"
        js_code += f'    "title": {json.dumps(song["title"], ensure_ascii=False)},\n'
        js_code += f'    "localizedTitle": {json.dumps(song["localizedTitle"], ensure_ascii=False)},\n'
        js_code += f'    "file": {json.dumps(song["file"], ensure_ascii=False)},\n'
        js_code += f'    "duration": {song["duration"]},\n'
        js_code += f'    "game": "{song["game"]}"\n'
        js_code += "  },\n"

    js_code += "];\n\n"

    return js_code

def main():
    """Main scanning function"""
    all_code = "// ============================================\n"
    all_code += "// AUTO-GENERATED SONG ENTRIES\n"
    all_code += "// Generated by tools/scan_music.py\n"
    all_code += "// ============================================\n\n"

    all_songs_by_game = {}

    for folder_name, game_id in FOLDER_TO_GAME.items():
        folder_path = os.path.join(LIBRARY_PATH, folder_name)

        if not os.path.exists(folder_path):
            print(f"[!] Folder not found: {folder_name}")
            continue

        print(f"[*] Scanning {folder_name}...")
        songs_by_game = scan_folder(folder_path, game_id)

        if songs_by_game:
            for sub_game_id, songs in songs_by_game.items():
                if sub_game_id not in all_songs_by_game:
                    all_songs_by_game[sub_game_id] = []
                all_songs_by_game[sub_game_id].extend(songs)
                print(f"    [+] {sub_game_id}: {len(songs)} songs")
        else:
            print(f"    [!] No songs found")

    # Generate JavaScript arrays
    for game_id in sorted(all_songs_by_game.keys()):
        songs = all_songs_by_game[game_id]
        all_code += generate_js_array(game_id, songs)

    # Write output
    output_file = "generated_songs.js"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(all_code)

    print(f"\n[+] Generated {output_file}")
    print("\n[*] Statistics:")
    total = 0
    for game_id, songs in sorted(all_songs_by_game.items()):
        count = len(songs)
        print(f"    {game_id}: {count} songs")
        total += count
    print(f"    TOTAL: {total} songs")

    print("\n[*] Next steps:")
    print("    1. Review generated_songs.js")
    print("    2. Update localizedTitle fields if needed")
    print("    3. Copy arrays to songs.js")

if __name__ == "__main__":
    main()
