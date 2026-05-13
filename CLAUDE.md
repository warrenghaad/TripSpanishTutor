# CLAUDE.md

You are maintaining the Vallarta Vox Spanish Voice Workbook that lives in this repository alongside the TripSpanishTutor app.

The canonical architecture reference is `VallartaVoxVault/01_Constitution/Workbook Architecture.md`. **Read it before making structural changes.** The notes below summarize the constraints; the architecture doc has the full picture.

## Core principle

> Literature is one lab. Voice is the curriculum.

The learner is building Spanish as a recognizable continuation of himself, not generic tourist fluency. The vault is the **intelligence layer** the app draws on.

## The Atelier Daily Prep is the most important structural idea

Perplexity researches the upcoming day and generates a `daily_prep` note in `02_DailyPrep/YYYY-MM-DD.md`. It is **not a lesson plan**. It is a **cultural intelligence briefing** — a companion document for the outing. Always honor its canonical frontmatter (`id`, `outing_date`, `place_type`, `location_name`, `atelier_resources`, `vocabulary_fields`, `grammar_priority`, `cultural_context`, `conversation_targets`, `spelunk_seeds`, `creative_prompts`, `related_trails`, `tags`).

The corresponding `03_DailyDebriefs/YYYY-MM-DD.md` captures what actually happened.

**These two notes are the workbook's heartbeat.** Everything else in the vault is reference.

## Always preserve these constraints

- Practical PVR travel Spanish should be **Mexican / neutral Latin American**.
- **Rioplatense** Spanish belongs only in Borges / Buenos Aires literary context notes.
- Do not make Borges, poetry, or literature the entire curriculum.
- Literature, music, travel, humor, visual perception, etymology, and daily life are all learning labs.
- Do not include full copyrighted poems or long literary passages. Quote a line or two with citation; paraphrase the rest.
- The learner uses physical books; the workbook scaffolds around them. EPUBs of public-domain or owned works can live inside `06_Atelier/<author>/`.
- Prefer short activity cards over long essays.
- Every learning item should produce at least one of:
  - phrase
  - practice move
  - grammar skeleton
  - saved question
  - personal echo
  - JSON content card

## Writing style

- Phone-readable Markdown.
- Clear headings.
- Short sections.
- Usable Spanish first, explanation second.
- Keep humor alive without making the Spanish unnatural.
- Beginner accessible, adult intelligence preserved.

## Required card shape (for workbook notes that aren't daily_prep / daily_debrief)

```md
### Title

Spanish:

English:

Literal:

Grammar skeleton:

When to use:

Practice:

Voice note:
```

JSON cards live in `VallartaVoxVault/08_ProjectPacks/**/*.json` and must validate against `VallartaVoxVault/12_Schemas/Templates/card.schema.json`. Enforced by `scripts/validate-json.mjs`.

## WordLens convention

Every word note in `05_WordLens/` includes inline `front::back` Spaced Repetition flashcards and tags `flashcards`. AI-AnkiSync promotes stable entries into Anki decks via `10_Flashcards/`.

## Folder rules

- New cards land in the right `VallartaVoxVault/` subfolder, never in the root.
- Anything you don't know where to put goes in `00_Inbox/New Phrases.md` — never lost.
- Questions the learner couldn't answer in the moment go in `00_Inbox/Questions To Ask Later.md`.

## Sacred job

**Do not let questions disappear.**

If a note is messy, preserve the original text in `00_Inbox/Questions To Ask Later.md` (with a date and source link) before cleaning it up.

## Plugin stack (reference — installed in Obsidian, not by this repo)

- **Daily rhythm:** Periodic Notes, Calendar, Templater, QuickAdd.
- **Reading:** Annotator, PDF++, ePub Reader, Air Quotes.
- **SRS:** Spaced Repetition, AI-AnkiSync, Obsidian-to-Anki.
- **Retrieval:** Dataview, Smart Connections, Omnisearch.
- **Mobile:** Commander (for the two-open-notes toolbar on iPhone).

## Don't

- Don't refactor the app code (`client/`, `server/`, `db/`) when the user asks for vault changes. Vault and app are separate concerns in the same repo.
- Don't import vault content into the app automatically — the user decides when a JSON pack ships.
- Don't add npm dependencies for vault scripts. The validate/build scripts stay pure Node, no packages.
- Don't auto-fill the DailyPrep `atelier_resources` with travel material — atelier means *cultural resonance*, not vocabulary lists.
