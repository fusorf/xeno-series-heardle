#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract artist and composer metadata from MP3 files using mutagen
Install with: pip install mutagen
"""

import os
import json
from mutagen.mp3 import MP3
from mutagen.id3 import ID3

def extract_metadata(music_dir):
    """Extract metadata from all MP3 files in the music directory"""
    metadata = {}

    # Walk through all subdirectories
    for root, dirs, files in os.walk(music_dir):
        for file in files:
            if file.endswith('.mp3'):
                filepath = os.path.join(root, file)
                rel_path = os.path.relpath(filepath, music_dir)

                # Get game folder name (first directory in relative path)
                game_folder = rel_path.split(os.sep)[0]

                try:
                    audio = MP3(filepath, ID3=ID3)

                    # Extract metadata
                    artist = None
                    composer = None

                    # Try to get artist (TPE1)
                    if 'TPE1' in audio.tags:
                        artist = str(audio.tags['TPE1'])

                    # Try to get composer (TCOM)
                    if 'TCOM' in audio.tags:
                        composer = str(audio.tags['TCOM'])

                    # Store if we found any metadata
                    if artist or composer:
                        key = f"{game_folder}/{file}"
                        metadata[key] = {
                            'file': file,
                            'game': game_folder,
                            'artist': artist,
                            'composer': composer
                        }
                        print(f"[OK] {key}")
                        if artist:
                            print(f"  Artist: {artist}")
                        if composer:
                            print(f"  Composer: {composer}")

                except Exception as e:
                    # Skip files with errors (encoding issues, etc.)
                    pass

    return metadata

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    music_dir = os.path.join(project_dir, 'music')

    if not os.path.exists(music_dir):
        print(f"Music directory not found: {music_dir}")
        return

    print("Extracting metadata from MP3 files...")
    print(f"Music directory: {music_dir}\n")

    metadata = extract_metadata(music_dir)

    # Save to JSON file
    output_file = os.path.join(project_dir, 'tools', 'mp3_metadata.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    print(f"\n[SUCCESS] Extracted metadata for {len(metadata)} files")
    print(f"[SUCCESS] Saved to {output_file}")

if __name__ == '__main__':
    main()
