# 10 Flashcards

Anki-sync deck source files. The phone-side drilling layer.

## How this folder relates to 05 WordLens

- `05_WordLens/` is the **source of truth** for words. Each WordLens note has inline `front::back` flashcards (Spaced Repetition plugin).
- `10_Flashcards/` holds **deck source files** — the curated Markdown bundles that get pushed to Anki via AI-AnkiSync or Obsidian-to-Anki.

In practice: WordLens notes accumulate organically. Periodically you (or AI-AnkiSync) gather a batch of stable cards and write a deck-source Markdown file here. That file becomes one Anki deck.

## Deck source file naming

`deck-<slug>.md` — e.g. `deck-day1-pvr.md`, `deck-voice-phrases.md`, `deck-borges.md`.

## Deck source frontmatter

```yaml
---
type: anki_deck_source
deck_name: "Spanish::Day 1 PVR"   # double-colon = Anki sub-deck
status: ready                       # draft | ready | synced
source_notes:                       # WordLens entries pulled into this deck
  - "[[ahorita]]"
created: YYYY-MM-DD
tags:
  - vallarta-vox
  - anki-deck
---
```

## Body

The body is just `front::back` lines, optionally grouped by H2 headings (the plugin can use them as sub-deck or note-type hints).

## Sync workflow

1. Edit deck-source file here.
2. AI-AnkiSync (or Obsidian-to-Anki) reads it and pushes to Anki.
3. Anki reviews happen on the phone, offline.

## When to skip this folder

If a card lives perfectly well inline in a WordLens entry and you don't need it in Anki yet, leave it there. This folder is for **promoted** cards that have earned a deck.
