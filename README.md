# Xeno Series Heardle

A music guessing game inspired by Heardle/Wordle for the Xeno video game series (Xenoblade Chronicles, Xenosaga, Xenogears).

Listen to progressively longer snippets of a song and guess the title within 5 attempts.

## Features

- **4 game modes**: Xenoblade, Full Xeno Series, Xenosaga, Random Daily
- **705 songs** across 14 games
- **Deterministic daily songs** - all players get the same song, no server needed
- **3 languages**: English, French, Japanese
- **Responsive** sci-fi themed UI with per-game color themes

## How to Play

1. Press play to hear a 1-second snippet of today's song
2. Search and select a song title, or skip
3. Each wrong guess or skip unlocks a longer snippet (1s, 3s, 7s, 14s, 16s)
4. Guess correctly within 5 attempts to win

## Tech Stack

Pure vanilla JavaScript - no frameworks, no build step. All music hosted on Cloudflare R2.
