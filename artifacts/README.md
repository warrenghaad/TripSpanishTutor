# Artifacts

Drop zone for anything ChatGPT (or you) wants to add to the project — drafts, prompt libraries, lesson outlines, content packs, pasted research, design notes, sample dialogues, etc.

Nothing in here is wired into the running app on its own. It's a holding area until you (or the agent) decide to incorporate something.

## How to use it

1. **`incoming/`** — raw drops. ChatGPT or you paste/commit files here as-is. No formatting rules. One file per artifact is fine.
2. **`drafts/`** — things being shaped or edited. Move from `incoming/` once you start working on it.
3. **`integrated/`** — once an artifact has been merged into the app (added as a trip pack, lesson, prompt, etc.), move it here so we know it's "live." Add a one-line note at the top: *"Integrated into <feature> on <date>."*
4. **`reference/`** — long-lived source material you want to keep around but never integrate directly (transcripts, vision docs, conversations, research links).

## Naming

`YYYY-MM-DD-short-slug.md` works well — e.g. `2026-05-13-vallarta-food-vocab.md`. Not enforced.

## What goes where (rule of thumb)

| Type | Folder |
|---|---|
| ChatGPT just dumped this, haven't read it | `incoming/` |
| You're rewriting / cleaning it up | `drafts/` |
| It's now used by the app | `integrated/` |
| Background reading, never to be code | `reference/` |
