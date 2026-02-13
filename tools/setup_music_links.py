#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Create symbolic links from music library to project music folder
This allows the web server to serve audio files without duplicating GBs of data
"""

import os
import sys
from pathlib import Path

# Music library path (same as in scan_music.py)
LIBRARY_PATH = r"C:\Users\Valentin\Desktop\Xeno Series full soundrack"

# Project music folder
PROJECT_MUSIC_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "music")

# Folder mapping (must match GAMES metadata in songs.js)
FOLDER_MAPPING = {
    # Trinity Box -> Split into multiple games
    "Xenoblade Chronicles Original Soundtrack Trinity Box (2023)": [
        ("xenoblade-1", "Trinity Box"),
        ("xenoblade-1-fc", "Trinity Box"),
        ("xenoblade-2", "Trinity Box"),
        ("xenoblade-2-torna", "Trinity Box"),
        ("xenoblade-3", "Trinity Box"),
        ("xenoblade-3-fr", "Trinity Box")
    ],

    # XCX DE -> Split into base + DE content
    "Xenoblade Chronicles X - Definitive Edition (Switch, Switch 2) (gamerip) (2025)": [
        ("xenoblade-x", "XCX DE"),
        ("xenoblade-x-de", "XCX DE")
    ],

    # Individual games
    "Xenogears ORIGINAL SOUNDTRACK (1998)": [("xenogears", "Xenogears")],
    "Xenosaga Episode I (2004)": [("xenosaga-1", "Xenosaga I")],
    "Xenosaga Episode III OST": [("xenosaga-3", "Xenosaga III")],
    "Xenosaga II - Jenseits von Gut und Böse (PS2) (gamerip) (2004)": [("xenosaga-2-gamerip", "Xenosaga II Gamerip")],
    "Xenosaga II - Jenseits von Gut und Böse ~Movie Scene Soundtrack~ (2004)": [("xenosaga-2-movie", "Xenosaga II Movie")],
    "Xenosaga Freaks (PS2) (gamerip) (2004)": [("xenosaga-freaks", "Freaks")],
    "Xenosaga Pied Piper (Mobile) (gamerip) (2004)": [("xenosaga-pied-piper", "Pied Piper")]
}

def create_symlink_windows(source, target):
    """Create symlink on Windows using mklink"""
    try:
        # Remove existing if present
        if os.path.exists(target):
            if os.path.islink(target) or os.path.isdir(target):
                os.rmdir(target)
            else:
                os.remove(target)

        # Create directory junction (works without admin rights)
        os.system(f'mklink /J "{target}" "{source}"')
        return True
    except Exception as e:
        print(f"Error creating symlink: {e}")
        return False

def main():
    """Create music folder structure with symlinks"""
    print("[*] Setting up music folder structure...")

    # Create music folder if it doesn't exist
    os.makedirs(PROJECT_MUSIC_PATH, exist_ok=True)
    print(f"[+] Created {PROJECT_MUSIC_PATH}")

    # Process each source folder
    for source_folder, targets in FOLDER_MAPPING.items():
        source_path = os.path.join(LIBRARY_PATH, source_folder)

        if not os.path.exists(source_path):
            print(f"[!] Source folder not found: {source_folder}")
            continue

        # Create symlinks for each target game
        for game_id, label in targets:
            target_path = os.path.join(PROJECT_MUSIC_PATH, game_id)

            print(f"[*] Linking {label} -> {game_id}...")

            if create_symlink_windows(source_path, target_path):
                print(f"    [+] Created symlink: {target_path}")
            else:
                print(f"    [!] Failed to create symlink for {game_id}")

    print("\n[+] Music folder setup complete!")
    print(f"[*] Music files are now accessible at: {PROJECT_MUSIC_PATH}")
    print("[*] Note: These are symbolic links, not copies (saves disk space)")
    print("\n[*] You can now test the game with audio playback!")

if __name__ == "__main__":
    main()
