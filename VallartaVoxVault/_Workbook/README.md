# _Workbook — the view layer

The vault around this folder is the **backend**: durable storage, organized by type (Constitution, ProjectPacks, WordLens, Atelier, Grammar, Inbox).

This `_Workbook/` folder is the **frontend**: short, phone-readable pages assembled from vault content via Obsidian transclusion (`![[Note Name]]`).

## Pages

- [[00 Today]] — your single phone page for today.
- [[Day 1 PVR]] — full Day 1 view, all topic notes embedded.
- [[Voice]] — voice phrases + sentence grower.
- [[Grammar Quick Ref]] — grammar reference.
- [[Inbox]] — questions, things heard, things wanted.

## How retrieval works

Each page in `_Workbook/` does one job: pull together a *view* of vault content using `![[Note Name]]` embeds.

When you open a `_Workbook/` page in Obsidian, the embeds expand inline — so you see the actual content, not just links.

If you edit the source note (e.g. `[[Voice Recovery Phrases]]` in `01_Constitution/Voice/`), the embed updates everywhere automatically.

## Naming

Underscore prefix (`_Workbook`) sorts above the numbered backend folders, so it's the first thing you see in Obsidian's file tree.
