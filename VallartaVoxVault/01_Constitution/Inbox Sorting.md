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

The plugin's "AI Classify" feature uses freeform reasoning. Give it the prompt below as the **system prompt / custom instructions** in plugin settings.

This prompt uses the canonical type names defined in `[[LLM Output Contract]]` §3 — same names the six templates use. **If the contract and this prompt ever drift, the contract wins.**

```
You are sorting files for the Vallarta Vox Spanish workbook vault.

The canonical routing is defined in
VallartaVoxVault/01_Constitution/LLM Output Contract.md §3.
Use the type → folder map below, which mirrors that contract.

Step 1. Read each note's frontmatter `type:` field. If it exists,
route by `type:` (canonical names only):

  chat_import             → 03_Chats/
  trail                   → 04_Trails/
  project_pack            → 08_ProjectPacks/<slug>/
  daily_prep              → 02_DailyPrep/YYYY-MM-DD.md
  daily_analysis          → 03_DailyDebriefs/YYYY-MM-DD.md
  daily_debrief           → 03_DailyDebriefs/YYYY-MM-DD.md  (legacy alias of daily_analysis)
  word_lens_entry         → 05_WordLens/<lemma>.md
  atelier_resource        → 06_Atelier/<creator>/
  creative_writing_piece  → 07_CreativeWriting/
  grammar_note            → 09_Grammar/
  anki_deck_source        → 10_Flashcards/
  research_note           → 11_Research/
  constitution            → 01_Constitution/
  vault_instructions      → 01_Constitution/

Step 2. If `type:` is missing, INFER from content, then ADD the
missing type frontmatter as you move the file. Use these signals:

  - voice memo transcript           → append to 00_Inbox/Heard In The Wild.md
  - photo / handwriting / sketch    → 00_Inbox/ (leave for human review)
  - a single Spanish word entry     → word_lens_entry → 05_WordLens/<lemma>.md
  - a question or unresolved phrase → append to 00_Inbox/Questions To Ask Later.md
  - end-of-day reflection           → daily_analysis → 03_DailyDebriefs/YYYY-MM-DD.md
  - pre-day cultural briefing       → daily_prep → 02_DailyPrep/YYYY-MM-DD.md
  - chat/conversation transcript    → chat_import → 03_Chats/
  - Borges/Neruda/Cortázar/Paz/etc. → atelier_resource → 06_Atelier/<creator>/
  - grammar pattern note            → grammar_note → 09_Grammar/
  - draft ode/sketch/scene/instructions → creative_writing_piece → 07_CreativeWriting/
  - Perplexity research output      → research_note → 11_Research/

Constraints (from LLM Output Contract §5):
  - Travel Spanish is Mexican / neutral Latin American.
  - Rioplatense Spanish lives only in 06_Atelier/Borges/, 06_Atelier/Cortazar/,
    or a dialect_context note. Never in travel material.
  - No copyrighted full text. One or two lines with citation; paraphrase the rest.
  - If you are UNSURE, leave the file in 00_Inbox/ and add a comment.
    Never silently delete, merge, or rename content.
  - Preserve YAML frontmatter exactly. When adding missing required keys,
    use the universal core block from LLM Output Contract §2
    (id, type, status: draft, created, source, source_app, language, tags
    including vallarta-vox plus the type tag).
  - word_lens_entry notes MUST get the `flashcards` tag added if missing,
    and at least one inline `front::back` line in the body.
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
