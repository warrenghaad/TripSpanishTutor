# TripSpanishTutor — Vallarta Vox Workbook + App

A Git-synced Obsidian Spanish workbook (`VallartaVoxVault/`) living alongside the TripSpanishTutor app code.

> Literature is one lab. Voice is the curriculum.

The vault is the **intelligence layer** the app draws on. Read `VallartaVoxVault/01_Constitution/Workbook Architecture.md` for the canonical design.

---

## Use it tomorrow on your phone

You only need three apps on iPhone to read and edit the workbook offline:

1. **Obsidian** (App Store, free)
2. **Working Copy** (App Store, free tier is enough for read+pull)
3. *(optional)* **Calendar** + **Periodic Notes** + **Templater** Obsidian plugins for the daily rhythm.

### One-time iPhone setup (~10 minutes)

1. Install **Working Copy**. `+` → **Clone repository** → paste this repo's GitHub URL.
2. Install **Obsidian**.
3. Obsidian → **Open folder as vault** → grant access to the Working Copy clone → choose the **`VallartaVoxVault/`** subfolder as your vault.
4. Open `_Workbook/00 Today.md`. That is your home page.
5. Pin two notes to the Commander mobile toolbar (once you install Commander):
   - `02_DailyPrep/<today's date>.md`
   - `03_DailyDebriefs/<today's date>.md`

### Daily phone routine

- Morning: Working Copy → pull. Open today's DailyPrep, read the cultural briefing.
- During day: open today's DailyDebrief via the Commander toolbar; QuickAdd captures inline.
- Evening: review the day's flashcards in the Spaced Repetition plugin.
- Night: Working Copy → push.

You do **not** need the Obsidian Git mobile plugin — Working Copy is more reliable on iOS.

---

## Architecture (one-screen summary)

```
VallartaVoxVault/                ← Obsidian vault (the backend)
  _Workbook/                     ← frontend view layer (transclusion)
  00_Inbox/                      ← captures
  01_Constitution/               ← rules, voice, schemas (read this first)
  02_DailyPrep/                  ← Atelier-generated daily briefings
  03_DailyDebriefs/              ← end-of-day captures
  04_Trails/                     ← saved spelunks
  05_WordLens/                   ← word notes (with inline flashcards)
  06_Atelier/                    ← literature / music / film / mural lab
  07_CreativeWriting/            ← drafts and odes
  08_ProjectPacks/               ← outing prep (the app reads these offline)
  09_Grammar/                    ← patterns discovered through use
  10_Flashcards/                 ← Anki deck source files
  11_Research/                   ← Perplexity imports
  12_Schemas/Templates/          ← schemas + Templater templates

scripts/                         ← validate, build, sync (no npm deps)
client/ server/ db/              ← the TripSpanishTutor app
```

## The two notes that stay open

Per the canonical architecture, only two notes are pinned. Everything else is reference.

1. **Today's DailyPrep** (`02_DailyPrep/YYYY-MM-DD.md`) — cultural intelligence briefing for the day.
2. **Today's DailyDebrief** (`03_DailyDebriefs/YYYY-MM-DD.md`) — live capture log.

`_Workbook/00 Today.md` is a frontend page that transcludes both into one scrollable view.

## The Atelier loop

```
Perplexity research → 02_DailyPrep/YYYY-MM-DD.md
  (Atelier clips, vocab field, grammar priority,
   cultural briefing, creative prompt)
        ↓ night before
   read the prep
        ↓ during the day
   app handles live; project pack pre-loaded
        ↓ evening
   03_DailyDebriefs/YYYY-MM-DD.md filled via QuickAdd
        ↓ next morning
   words → 05_WordLens → Spaced Repetition → Anki
```

## Plugin stack (install in Obsidian, not by this repo)

- **Daily rhythm:** Periodic Notes, Calendar, Templater, QuickAdd
- **Reading:** Annotator, PDF++, ePub Reader, Air Quotes
- **SRS:** Spaced Repetition, AI-AnkiSync, Obsidian-to-Anki
- **Retrieval:** Dataview, Smart Connections, Omnisearch
- **Mobile:** Commander

Full table with roles: `VallartaVoxVault/01_Constitution/Workbook Architecture.md`.

## Sync, validate, build

```sh
sh scripts/git-sync.sh                # commit, pull --rebase, push
node scripts/validate-json.mjs        # validate every JSON pack in the vault
node scripts/build-workbook.mjs       # bundle vault JSON into dist/workbook/
```

Build output (`dist/workbook/workbook_cards.json`, `manifest.json`) is gitignored.

## Project principle (repeat)

Mexican / neutral Latin American Spanish for travel. Rioplatense only as Borges context. Voice over polish. Questions are sacred — they never disappear from `00_Inbox/Questions To Ask Later.md`.
