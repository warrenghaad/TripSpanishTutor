---
type: constitution_note
status: live
tags:
  - vallarta-vox
  - constitution
  - inbox
  - automation
created: 2026-05-13
---

# Inbox Sorting

The inbox (`00_Inbox/`) collects everything captured but not yet sorted: Bear drops, voice memos, photos of handwriting, quick notes. The sacred rule from the project principle:

> **Do not let questions disappear.** Nothing in the inbox is ever lost.

## Tool: File Organizer 2000

The vault uses the Obsidian community plugin **File Organizer 2000** to AI-classify inbox drops and route them to the correct folder.

- AI-based (uses an LLM provider — OpenAI by default).
- Watches `00_Inbox/`.
- Reads filename, frontmatter, and body to infer a `type:`.
- Moves the file to the matching folder.
- Can transcribe voice memos and OCR handwriting before classifying.
- Cost: small per-file API call. Stays predictable as long as you don't classify the entire vault in one batch.

## One-time setup

1. In Obsidian: **Settings → Community plugins → Browse → "File Organizer 2000" → Install → Enable**.
2. In the plugin settings:
   - **Inbox folder:** `00_Inbox`
   - **Output mode:** Move to inferred folder (not copy).
   - **API key:** paste your OpenAI key (or whichever provider the plugin supports in the current version).
   - **Transcribe audio:** on (so voice memos become Markdown).
   - **OCR images:** on (so handwritten photos become Markdown).
3. Restart Obsidian. Plugin starts watching `00_Inbox/`.

## Routing rules (canonical for this vault)

The plugin's "AI Classify" feature uses freeform reasoning. Give it the rules below as the **system prompt / custom instructions** in plugin settings, so it routes consistently with the rest of the vault.

```
You are sorting files for the Vallarta Vox Spanish workbook vault.

Read each note's frontmatter `type:` field first. If it exists,
route by `type:` using this map:

  daily_prep         → 02_DailyPrep/
  daily_debrief      → 03_DailyDebriefs/
  trail              → 04_Trails/
  wordlens           → 05_WordLens/
  literature_lab     → 06_Atelier/<author>/    (read `author:` if present)
  dialect_context    → 06_Atelier/
  research_import    → 11_Research/
  project_pack       → 08_ProjectPacks/<slug>/
  grammar_note       → 09_Grammar/
  voice_principles   → 01_Constitution/Voice/
  voice_note         → 01_Constitution/Voice/
  anki_deck_source   → 10_Flashcards/
  workbook_note      → leave in 00_Inbox/ unless body clearly fits one
                       of the other folders (e.g. a Day 1 PVR note
                       belongs in 08_ProjectPacks/Day1_PVR/).
  question_catcher   → 00_Inbox/   (stays)
  inbox_note         → 00_Inbox/   (stays)

If `type:` is absent, infer from content:

  - voice memo transcript           → 00_Inbox/Heard In The Wild.md (append)
  - photo / handwriting / sketch    → 00_Inbox/ (leave for human review)
  - a single Spanish word entry     → 05_WordLens/<lemma>.md
  - a question or unresolved phrase → 00_Inbox/Questions To Ask Later.md (append)
  - end-of-day reflection           → 03_DailyDebriefs/<today>.md (append)
  - pre-day briefing                → 02_DailyPrep/<date>.md
  - Borges/Neruda/Cortazar/etc.     → 06_Atelier/<author>/
  - grammar pattern note            → 09_Grammar/
  - draft creative writing          → 07_CreativeWriting/

Constraints:
  - PVR travel Spanish is Mexican / neutral Latin American.
  - Rioplatense Spanish belongs only in Borges / Buenos Aires context
    inside 06_Atelier/. Never in travel notes.
  - If you are unsure, LEAVE the file in 00_Inbox/. The human will sort.
    Never silently delete or merge content. Questions never disappear.
  - Preserve YAML frontmatter exactly. Add missing required keys with
    sensible defaults (created: today, status: seed, tags: [vallarta-vox]).
```

## When the AI misclassifies

- **Wrong folder:** drag back to `00_Inbox/`, drop a one-liner into [[Questions To Ask Later]] noting what tripped it up, and tighten the rule above.
- **Unsure:** the plugin should leave it in `00_Inbox/`. If it didn't, file an item in [[Questions To Ask Later]] and move manually.
- **Lost frontmatter:** rare, but if it happens, revert via Working Copy / Git. The vault is versioned.

## Costs and limits

- Each classification = one short LLM call. Small but not free.
- Don't run "classify entire vault" — only `00_Inbox/`.
- If you're offline (on the plane), drops just accumulate in `00_Inbox/` and get classified next time you have network. Inbox is allowed to grow.

## Why AI instead of a rule script

A rule script would also work since most notes have `type:` frontmatter. But the inbox often gets unstructured drops (voice memo, photo, Bear note with no frontmatter). The AI handles those gracefully; a script would dump them all in `00_Inbox/` for human triage. Pick the lower-friction path.

If you ever want a deterministic fallback, the rules above can be re-implemented as `scripts/sort-inbox.mjs` (pure Node, frontmatter-keyed) without changing this doc.

## Don't

- Don't classify `01_Constitution/` (the rules folder watches itself).
- Don't classify `_Workbook/` (it's a view layer; nothing should move in or out).
- Don't classify `12_Schemas/` (templates are stable; don't shuffle them).

In the plugin settings, add these as **excluded folders**.
