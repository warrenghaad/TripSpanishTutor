---
id: vv-claude-code-prompt
type: constitution
status: canonical
created: 2026-05-13
tags:
  - vallarta-vox
  - constitution
  - contract
  - claude-code
---

# Claude Code Prompt

Paste this into Claude Code as the **first message** of a new session in this repo. It tells Claude Code how to behave when working on the Vallarta Vox vault, and what canonical sources to read before touching anything.

---

## Paste-ready prompt

> You are working in the Vallarta Vox / TripSpanishTutor repository. Before doing anything else, read these three files in order and follow them:
>
> 1. `CLAUDE.md` at the repo root — standing instructions for the project.
> 2. `VallartaVoxVault/01_Constitution/LLM Output Contract.md` — the canonical vault layout, frontmatter, type → folder routing, JSON pack shapes, and hard constraints.
> 3. `VallartaVoxVault/01_Constitution/Workbook Architecture.md` — the Atelier-loop design and the two-open-notes principle (DailyPrep + DailyDebrief).
>
> **Operating rules in this repo:**
>
> - Use the canonical vault layout from the contract §1. Do not invent new top-level folders.
> - For new Markdown notes, open with the universal core frontmatter from contract §2 plus the type's extra fields from §3.
> - For new JSON packs in `08_ProjectPacks/`, use Shape A (card pack) or Shape B (scene pack) from contract §4. Validate via `node scripts/validate-json.mjs` after writing.
> - For new vocabulary entries, **prefer** `node scripts/words-to-wordlens.mjs <csv>` over hand-writing WordLens notes. It guarantees contract compliance and adds the required `flashcards` tag and inline `front::back` lines.
> - For inbox routing logic (File Organizer 2000 prompt), the canonical rules live in `01_Constitution/Inbox Sorting.md`. If you change routing in one place, update the contract first.
> - Respect the hard constraints: Mexican / neutral Latin American Spanish for travel; Rioplatense only inside `06_Atelier/Borges/`, `06_Atelier/Cortazar/`, or a `dialect_context` note; no copyrighted full text; voice-first; questions are sacred (`00_Inbox/Questions To Ask Later.md`).
> - Use the `Edit` / `Read` / `Write` tools to make changes — never paste-and-overwrite the contract or templates. If you genuinely need to evolve the schema, edit `LLM Output Contract.md` first, then propagate.
> - Validate and build before committing anything that touches JSON: `node scripts/validate-json.mjs && node scripts/build-workbook.mjs`.
> - Commit with descriptive messages explaining the why, not the what. Push to whatever branch you are on. Do not force-push.
> - For risky or irreversible actions (deleting folders, renaming many files, force-push, dropping tracked data), confirm with the user first.
>
> **Working branch:** the repository may already be on a feature branch like `claude/...`. Stay on it unless told otherwise.
>
> **What "done" looks like for a task:**
>
> 1. The change is on disk.
> 2. `node scripts/validate-json.mjs` passes if any JSON changed.
> 3. `node scripts/build-workbook.mjs` produces `dist/workbook/manifest.json` reflecting the new state (only if cards/packs changed).
> 4. The change is committed with a clear message.
> 5. The change is pushed to the remote branch.
>
> Confirm you have read the three files above, then proceed with the user's actual request.

---

## Why this prompt exists

Claude Code is the workhorse for this vault — it edits files, runs scripts, commits, pushes. Without a standing instruction set, every new session re-derives conventions and drifts. This prompt anchors any session to the contract.

## How to update this prompt

If the contract evolves (new note types, new constraints, schema changes), edit `LLM Output Contract.md` first. Then update §3 ("Operating rules") of the paste-ready prompt above only if a Claude-Code-specific behavior changes (e.g., a new script, a new validate step).

The paste-ready prompt should always be **short enough to fit in the first message** of a Claude Code session. Resist the urge to dump the entire contract into it — the prompt should *point at* the canonical docs, not duplicate them.

## Related

- `[[LLM Output Contract]]` — for chat LLMs producing content (Perplexity / Claude.ai / ChatGPT).
- `[[Inbox Sorting]]` — File Organizer 2000 routing prompt.
- `[[Workbook Architecture]]` — Atelier loop and plugin stack.
