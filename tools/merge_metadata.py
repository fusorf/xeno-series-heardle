#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Merge MP3 metadata (artist/composer) into songs.js
"""

import os
import json
import re

def load_mp3_metadata():
    """Load extracted MP3 metadata"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    metadata_file = os.path.join(script_dir, 'mp3_metadata.json')

    with open(metadata_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def update_songs_js(metadata):
    """Update songs.js with artist and composer metadata"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    songs_file = os.path.join(project_dir, 'songs.js')

    with open(songs_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all song objects in the file
    # Pattern: { "title": "...", "localizedTitle": "...", "file": "...", "duration": ..., "game": "..." }
    pattern = r'\{\s*"title":\s*"([^"]+)",\s*"localizedTitle":\s*"([^"]+)",\s*"file":\s*"([^"]+)",\s*"duration":\s*(\d+),\s*"game":\s*"([^"]+)"(,\s*"startTime":\s*\d+)?\s*\}'

    matches = list(re.finditer(pattern, content))
    print(f"Found {len(matches)} song entries in songs.js")

    # Track statistics
    updated_count = 0
    not_found_count = 0

    # Create replacements (process in reverse to maintain positions)
    replacements = []
    for match in reversed(matches):
        title = match.group(1)
        localized_title = match.group(2)
        filename = match.group(3)
        duration = match.group(4)
        game = match.group(5)
        start_time = match.group(6) or ""  # May be None

        # Look up metadata
        key = f"{game}/{filename}"
        meta = metadata.get(key)

        if meta and (meta.get('artist') or meta.get('composer')):
            # Create updated object with metadata
            new_obj = '{'
            new_obj += f'\n    "title": "{title}",'
            new_obj += f'\n    "localizedTitle": "{localized_title}",'
            new_obj += f'\n    "file": "{filename}",'
            new_obj += f'\n    "duration": {duration},'
            new_obj += f'\n    "game": "{game}"'

            if meta.get('composer'):
                composer_escaped = meta['composer'].replace('"', '\\"')
                new_obj += f',\n    "composer": "{composer_escaped}"'

            if meta.get('artist'):
                artist_escaped = meta['artist'].replace('"', '\\"')
                new_obj += f',\n    "artist": "{artist_escaped}"'

            if start_time:
                new_obj += start_time

            new_obj += '\n  }'

            replacements.append((match.start(), match.end(), new_obj))
            updated_count += 1
        else:
            not_found_count += 1

    # Apply replacements
    for start, end, replacement in replacements:
        content = content[:start] + replacement + content[end:]

    # Write updated content
    with open(songs_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"\n[SUCCESS] Updated {updated_count} songs with metadata")
    print(f"[INFO] {not_found_count} songs without metadata (this is normal for some files)")
    print(f"[SUCCESS] Saved to {songs_file}")

def main():
    print("Loading MP3 metadata...")
    metadata = load_mp3_metadata()
    print(f"Loaded metadata for {len(metadata)} files\n")

    print("Updating songs.js...")
    update_songs_js(metadata)

if __name__ == '__main__':
    main()
