---
type: constitution_note
status: live
tags:
  - vallarta-vox
  - constitution
  - architecture
created: 2026-05-13
---

# Workbook Architecture

The canonical reference for how this vault is shaped and operated. If you ever wonder what this vault is *for*, start here.

## Core principle

> Literature is one lab. Voice is the curriculum.

The learner is building Spanish as a recognizable continuation of himself — not generic tourist fluency. The vault is the *intelligence layer* the app draws on. The workbook is where you read, annotate, spelunk slowly, drill without pressure, and sync lived language back into structured notes.

## The Atelier Daily Prep — the most important structural idea

The night before (or morning of), Perplexity researches your planned day and generates a `daily_prep` note that lands in `02_DailyPrep/`. It is **not a lesson plan**. It is a **cultural intelligence briefing** — a companion document for the day.

## The two notes that stay open

On the phone, pin these two to the Commander mobile toolbar. Everything else is reference.

1. **Today's DailyPrep** — `02_DailyPrep/YYYY-MM-DD.md` — your cultural companion for the day, readable offline.
2. **Today's DailyDebrief** — `03_DailyDebriefs/YYYY-MM-DD.md` — your live capture log, appended via QuickAdd with one tap.

## The Atelier loop

```
PERPLEXITY (research space)
  ↓ "Build a daily prep for tomorrow's <scene>"
  ↓ generates: atelier clips, vocabulary field,
    grammar patterns, cultural briefing, creative prompt
  ↓
PASTE INTO 02_DailyPrep/YYYY-MM-DD.md
  ↓ Templater fills frontmatter
  ↓ linked Atelier notes created in 06_Atelier/
  ↓
NIGHT BEFORE: read the DailyPrep in Obsidian.
  Absorb the cultural layer without pressure.
  ↓
ON THE DAY: the app draws on the same vocabulary, grammar,
  scene context. Project pack pre-loaded for offline.
  ↓
EVENING: open DailyDebrief.
  QuickAdd captures scenes, words, repair moments live.
  ↓
MORNING AFTER: Periodic Notes surfaces the debrief.
  Smart Connections links related trails.
  Dataview shows vocabulary by scene type.
  New words → 05_WordLens → Spaced Repetition → Anki.
```

## Vault structure

| Folder | Purpose |
|---|---|
| `00_Inbox/` | Bear drops, voice memos, quick captures. Sorted later, never lost. |
| `01_Constitution/` | System rules, schemas, voice principles. This note lives here. |
| `02_DailyPrep/` | Atelier-generated pre-day briefings. One file per day. |
| `03_DailyDebriefs/` | Post-day offloads and reflections. One file per day. |
| `04_Trails/` | Saved spelunks from app + desktop. |
| `05_WordLens/` | Every word worth keeping. Includes inline `#flashcard` blocks. |
| `06_Atelier/` | Art, poems, music, film, history clips. The *lab*, not the curriculum. |
| `07_CreativeWriting/` | Drafts, fragments, ode attempts, scenes. |
| `08_ProjectPacks/` | Outing prep — the app reads these offline. |
| `09_Grammar/` | Patterns discovered through use, never standalone curriculum. |
| `10_Flashcards/` | Anki-sync deck source files. |
| `11_Research/` | Perplexity session imports. |
| `12_Schemas/Templates/` | Note templates and JSON schemas. |

## Plugin stack

### Daily rhythm

| Plugin | Role |
|---|---|
| Periodic Notes | Generates daily / weekly / monthly notes from templates. |
| Calendar | Click any day → open or create that day's DailyPrep / DailyDebrief. |
| Templater | Auto-fills `id`, `created`, `outing_date`, tags at creation. |
| QuickAdd | Hotkey captures → append to today's DailyDebrief without switching files. |

Periodic Notes + Calendar + Templater = zero-friction daily rhythm: tap the calendar, today's DailyPrep opens already structured.

### Reading and annotation

| Plugin | Role |
|---|---|
| Annotator | Open and annotate EPUB / PDF inside Obsidian. Annotations save as linked Markdown. |
| PDF++ | Richer PDF annotation — highlights, underlines, sidebar comments, extract to note. |
| ePub Reader | Read `.epub` files in-vault with TOC navigation. |
| Air Quotes | Find and insert excerpts from source books into notes without breaking flow. |

For Borges: download a bilingual EPUB of *Ficciones* or *Labyrinths*, drop in `06_Atelier/Borges/`, read inside Obsidian. Annotations become linked notes next to the book.

### Vocabulary and SRS

| Plugin | Role |
|---|---|
| Spaced Repetition | Inline flashcards with `#flashcard` syntax; SRS scheduling stored as plaintext. |
| AI-AnkiSync | Expands keyword flashcards into full cards (etymology, example, register) and syncs to Anki. |
| Obsidian to Anki | Batch-exports flashcards from `05_WordLens/` to Anki decks. |

Workflow: every `wordlens` note in `05_WordLens/` contains a flashcard block. Spaced Repetition surfaces it inline. Once stable, AI-AnkiSync upgrades it. Anki runs offline on the phone.

### Retrieval and navigation

| Plugin | Role |
|---|---|
| Dataview | Query DailyPreps by `place_type`, `atelier_resources`, `spelunk_seeds`. |
| Smart Connections | Surfaces related Atelier notes, trails, or WordLens entries as you write. |
| Omnisearch | Full-text search across the vault, including inside PDFs. |

## Weekly rhythm

| Time | Action | Plugin |
|---|---|---|
| Evening before | Run Atelier research in Perplexity; paste into DailyPrep | Periodic Notes + Templater |
| Evening before | Link relevant Atelier notes; skim vocabulary field | Smart Connections |
| Morning | Open today's DailyPrep, read atelier resonance, note creative prompt | Calendar |
| During day | App handles translation, trails, spelunking live | — |
| Evening | Open DailyDebrief; QuickAdd captures scenes, words, repair moments | QuickAdd |
| Before sleep | Tap through today's new SRS flashcards | Spaced Repetition |
| Weekly | Dataview: all WordLens entries this week → AI-AnkiSync push to Anki | Dataview + AI-AnkiSync |
| Weekly | Perplexity: next week's Atelier syllabus batch | Perplexity Space |

## Constraints (preserved from CLAUDE.md)

- Practical PVR travel Spanish is **Mexican / neutral Latin American**.
- **Rioplatense** Spanish belongs only in Borges / Buenos Aires literary context notes.
- Do not make Borges, poetry, or literature the entire curriculum.
- No full copyrighted poems or long literary passages. One or two lines with citation; paraphrase the rest.
- Prefer short activity cards over long essays.
- Every learning item should produce at least one of: phrase, practice move, grammar skeleton, saved question, personal echo, JSON content card.
- Questions never disappear → [[Questions To Ask Later]].
