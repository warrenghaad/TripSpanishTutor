# Artifacts

Drop zone for anything ChatGPT, Codex, Replit, Perplexity, or the learner wants to add to the project: drafts, prompt libraries, lesson outlines, content packs, pasted research, design notes, sample dialogues, workbook specs, and offline guide plans.

Nothing in here is wired into the running app on its own. It is a holding area until you or an agent decide to incorporate something.

## Current project packets

- `reference/2026-05-13-spanish-workshop-compiled-dossier-v1.md` - canonical compiled project dossier for the Spanish learning workshop.
- `reference/2026-05-13-poetry-and-identity-workbook.md` - motif-first workbook concept for Spanish, poetry, art, geometry, and identity.
- `drafts/2026-05-13-offline-workbook-codex-build-spec.md` - Codex build spec for the offline workbook.
- `drafts/2026-05-13-offline-workbook-schema.json` - starter schema for workbook units, spreads, local patterns, and ask-later questions.
- `drafts/2026-05-13-content-schemas-v1.json` - compiled content schema packet.
- `drafts/2026-05-13-replit-handoff-prompt-v1.md` - Replit handoff prompt from the compiled workshop.
- `drafts/2026-05-13-perplexity-content-librarian-prompt-v1.md` - Perplexity content-librarian prompt from the compiled workshop.

## How to use it

1. **`incoming/`** - raw drops. ChatGPT or you paste/commit files here as-is. No formatting rules. One file per artifact is fine.
2. **`drafts/`** - things being shaped or edited. Move from `incoming/` once you start working on it.
3. **`integrated/`** - once an artifact has been merged into the app, move it here so we know it is live. Add a one-line note at the top: *"Integrated into <feature> on <date>."*
4. **`reference/`** - long-lived source material you want to keep around but never integrate directly, such as transcripts, vision docs, conversations, research links, and canonical dossiers.

## Naming

`YYYY-MM-DD-short-slug.md` works well, for example `2026-05-13-vallarta-food-vocab.md`. Not enforced.

## What goes where

| Type | Folder |
|---|---|
| Raw drop, not yet read | `incoming/` |
| Being rewritten or shaped | `drafts/` |
| Now used by the app | `integrated/` |
| Background source material | `reference/` |

## Rule

Artifacts should preserve context. Do not compress away the design reasoning. If an artifact is too large to wire into the app, keep it here as source material and make a smaller implementation packet in `drafts/`.
