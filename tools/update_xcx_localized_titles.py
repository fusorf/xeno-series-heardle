#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Update Xenoblade X localized titles in generated_songs.js
"""

import re
import os

# Mapping from title patterns to localized titles
# Using the data from the OST tracklist
TITLE_MAPPING = {
    # Disc 1
    "no1=CODENAMEZ": "Codename Z",
    "no2=THEMEX": "Theme X",
    "no3=NO.EX01": "No.EX 01",
    "no4=D91M": "Requiem",
    "no5=KAKU-WEST＊→▲★★KAI": "Kakusei Houkai",
    "no6=LP": "LP",
    "no7=G-LOW-S→F.S.K.O": "Growth F.S.K.O",
    "no8=UN↑口and巨DIE": "Michi Kyodai",
    "no9=MONOX": "Mono X",
    "no10=CR17S19S8": "CR17S19S8",
    "no11=RE:ARR.X": "Re:Arr X",
    "Your Voice": "Your Voice",
    "Wir fliegen": "Wir fliegen",
    "So nah, so fern": "So nah, so fern",
    "NEMOUSU秘OUSS": "Shintekiou",

    # Disc 2
    "Black tar": "Black tar",
    "z5m20i12r04a28": "Z5 Mira",
    "z10b2r0i1e2f0i9n1g3": "Z10 Briefing",
    "Uncontrollable": "Uncontrollable",
    "z15f20i12e09l14d": "Z15 Field",
    "z39b20co13mi01cal09": "Z39B Comical",
    "By my side": "By my side",
    "z?2f0i1e2l0d914": "Z ? Field",
    "z37b20a13t01t08le": "Z37 Battle",
    "z30huri2ba0tt12le1110": "Z30 Furi Battle",
    "z12e201v2e091n4t": "Z12 Event",
    "z29ba2t0t1l301e17": "Z29 Battle",
    "z16b2gu012ro09u1su4": "Z16B Growth",
    "z13e20v12e09n14t": "Z13 Event",
    "z7b2012lp0427arr": "Z7B LP Arrange",
    "In the forest": "In the forest",
    "z23s20a12m0a9-1r4u": "Z23 Samaar",
    "The way": "The way",

    # Disc 3
    "The key we've lost": "The key we've lost",
    "N周L辺A": "NLA Shuuhen",
    "N木ig木ht木L": "Yakou Mori",
    "N市L街A": "NLA Shigai",
    "亡KEI却KOKU心": "Boukyaku Keikoku",
    "Melancholia": "Melancholia",
    "fiKAIeldJOU": "Field Kaijou",
    "aBOreSSs": "Ares Boss",
    "MNN＋@0・": "Ma-non",
    "In the forest <X→Z ver.>": "In the forest <X/Y ver.>",
    "46-:ri9": "Shiro no Tairiku",
    "96-:rip": "Kuro no Tairiku",
    "raTEoREkiSImeAL": "Lao Chimera Telethia",
    "Don't worry": "Don't worry",
}

def normalize_title(title):
    """Normalize title for matching (remove spaces, lowercase)"""
    return title.replace(" ", "").lower()

def find_localized_title(original_title):
    """Find the localized title for a given original title"""
    # Try exact match first
    if original_title in TITLE_MAPPING:
        return TITLE_MAPPING[original_title]

    # Try case-insensitive match
    original_normalized = normalize_title(original_title)
    for key, value in TITLE_MAPPING.items():
        if normalize_title(key) == original_normalized:
            return value

    # If no match found, return original
    return original_title

def update_generated_songs():
    """Update the generated_songs.js file with localized titles"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    file_path = os.path.join(parent_dir, "generated_songs.js")

    print(f"[*] Reading {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the SONGS_XENOBLADE_X section
    xcx_start = content.find("const SONGS_XENOBLADE_X = [")
    if xcx_start == -1:
        print("[!] Could not find SONGS_XENOBLADE_X in file")
        return

    # Find the end of the XCX section (next const or end of file)
    xcx_end = content.find("\nconst SONGS_", xcx_start + 1)
    if xcx_end == -1:
        xcx_end = len(content)

    xcx_section = content[xcx_start:xcx_end]

    # Process each song entry
    updated_section = xcx_section
    updates_count = 0

    # Pattern to match song entries
    # Matches: "title": "...", followed by "localizedTitle": "..."
    pattern = r'"title":\s*"([^"]+)",\s*\n\s*"localizedTitle":\s*"([^"]+)"'

    def replace_localized(match):
        nonlocal updates_count
        title = match.group(1)
        old_localized = match.group(2)
        new_localized = find_localized_title(title)

        if new_localized != old_localized:
            updates_count += 1
            try:
                print(f"  [{updates_count}] '{title}' -> '{new_localized}'")
            except UnicodeEncodeError:
                print(f"  [{updates_count}] Updated song (contains special characters)")

        return f'"title": "{title}",\n    "localizedTitle": "{new_localized}"'

    updated_section = re.sub(pattern, replace_localized, updated_section)

    # Replace in original content
    updated_content = content[:xcx_start] + updated_section + content[xcx_end:]

    print(f"\n[*] Writing updated file...")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(updated_content)

    print(f"\n[+] Updated {updates_count} localized titles!")

if __name__ == "__main__":
    update_generated_songs()
