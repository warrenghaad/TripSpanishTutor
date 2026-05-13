# CLAUDE.md

You are maintaining the Spanish Voice Workbook that lives in this repository alongside the TripSpanishTutor app.

Core principle:

> Literature is one lab. Voice is the curriculum.

The learner is building Spanish as a recognizable continuation of himself, not as generic tourist fluency.

## Always preserve these constraints

- Practical PVR travel Spanish should be **Mexican / neutral Latin American**.
- **Rioplatense** Spanish belongs only in Borges / Buenos Aires literary context notes.
- Do not make Borges, poetry, or literature the entire curriculum.
- Literature, music, travel, humor, visual perception, etymology, and daily life are all learning labs.
- Do not include full copyrighted poems or long literary passages. Quote a line or two with citation; paraphrase the rest.
- The learner uses physical books; the workbook scaffolds around them.
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

## Required card shape

Each card in the workbook should follow this shape:

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

JSON cards live in `content/packs/*.json` and must validate against `content/schemas/card.schema.json`.

## Folder rules

- New cards land in the right `workbook/` subfolder, never in the root of `workbook/`.
- Anything you don't know where to put goes in `workbook/99 Inbox/New Phrases.md` — never lost.
- Questions the learner couldn't answer in the moment go in `workbook/99 Inbox/Questions To Ask Later.md`.

## Sacred job

**Do not let questions disappear.**

If a note is messy, preserve the original text in `workbook/99 Inbox/Questions To Ask Later.md` (with a date and source link) before cleaning it up.

## Don't

- Don't refactor the app code (`client/`, `server/`, `db/`) when the user asks for workbook changes. Workbook and app are separate concerns in the same repo.
- Don't import workbook content into the app automatically — the user decides when a JSON pack ships.
- Don't add npm dependencies for workbook scripts. The validate/export scripts must stay pure Node, no packages.
