---
id: vv-vault-instructions
type: vault_instructions
status: canonical
created: 2026-05-13
tags:
  - vallarta-vox
  - vault
  - canon
---

# Vallarta Vox Vault Instructions

This vault is the source-of-truth workspace for Vallarta Vox / TripSpanishTutor.

The vault stores:

- app canon
- chats
- design decisions
- trails
- project packs
- daily analyses
- WordLens entries
- atelier resources
- creative writing pieces
- scenarios
- prompts
- schemas
- exports

## Law

Do not treat notes as generic notes. Every important note should become an **object**.

Use `type` in YAML frontmatter to classify the object.

Core types:

- `chat_import`
- `trail`
- `project_pack`
- `daily_analysis`
- `word_lens_entry`
- `atelier_resource`
- `creative_writing_piece`
- `scenario`
- `prompt`
- `constitution`

Full list and the universal core frontmatter block live in `[[_core_frontmatter|12_Schemas/Templates/_core_frontmatter]]`.

## Workflow

1. Capture raw material quickly.
2. Preserve the source.
3. Classify the note.
4. Extract decisions and objects.
5. Link related notes.
6. Promote useful material into app-ready schemas.

## Capture → Inbox → Classify → Extract → Link → Export

Practical version:

1. Capture raw notes in Bear when walking, tired, or offline.
2. At night, move the note into Obsidian `00_Inbox/`.
3. Apply one template: `DailyAnalysis`, `Trail`, `WordLensEntry`, or `ChatImport`.
4. Extract structured objects from the raw text.
5. Link objects using `related_trails`, `related_project_packs`, and wiki links.
6. Export selected notes later into JSON for the app (see `scripts/build-workbook.mjs`).

## Principle

> Do not let lived language disappear.

A phrase needed in real life, a question asked while traveling, a social repair, a word noticed, an artwork loved, a song heard, or a chat decision should become durable app memory.

## Minimal templates first

Six templates, no more, until the workflow demands more:

- `[[ChatImport]]`
- `[[Trail]]`
- `[[ProjectPack]]`
- `[[DailyAnalysis]]`
- `[[WordLensEntry]]`
- `[[AtelierResource]]`

## Related canon

- `[[Workbook Architecture]]` — the daily-prep loop and plugin stack
- `[[Inbox Sorting]]` — how File Organizer 2000 routes drops
- `[[_core_frontmatter]]` — the universal frontmatter block

## Don't

- Don't treat the vault as a notebook. Treat every entry as a typed object.
- Don't paste copyrighted full text into atelier notes — scaffold with vocabulary, prompts, summary.
- Don't let the design thread of a chat disappear: every important chat becomes a `chat_import` first.
