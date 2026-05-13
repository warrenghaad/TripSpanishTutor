# TripSpanishTutor — Spanish Voice Workbook

A Git-synced Obsidian workbook for Day 1 travel to Puerto Vallarta and the larger Spanish voice project.

> Literature is one lab. Voice is the curriculum.

This is **personal study material** that lives alongside the TripSpanishTutor app code. It can later feed JSON content packs into the app.

---

## Use it tomorrow on your phone

You only need three apps on iPhone to read and edit this workbook offline:

1. **Obsidian** (App Store, free)
2. **Working Copy** (App Store, free tier is enough for read+pull)
3. *(optional)* **GitHub iOS** for browsing online

### One-time iPhone setup (~10 minutes)

1. Install **Working Copy** from the App Store.
2. Open Working Copy → tap `+` → **Clone repository** → paste the GitHub URL of this repo. Sign in with GitHub.
3. Install **Obsidian** from the App Store.
4. Open Obsidian → **Open folder as vault** → grant access to the Working Copy clone → choose the **`workbook/`** subfolder as your vault root.
5. Done. Open `00 Dashboard` and start.

### Daily phone routine

- Pull latest in Working Copy when you wake up (one tap).
- Edit notes in Obsidian.
- Push from Working Copy at the end of the day (one tap).

You do **not** need Obsidian Git mobile plugin — Working Copy is more reliable on iOS.

---

## What's in here

```
workbook/        ← the Obsidian vault (open this folder as a vault)
content/         ← machine-readable JSON content packs
scripts/         ← validation + export + git-sync helpers
CLAUDE.md        ← standing instructions for Claude Code sessions
```

### Workbook layout

- `00 Dashboard.md` — your home page.
- `01 Day 1 PVR/` — everything you need walking off the plane.
- `02 Voice/` — phrases that keep you sounding like *you*.
- `03 Literature Lab/` — Borges / Neruda / Cortázar as a learning lab, not the curriculum.
- `04 Grammar/` — focused mini-lessons.
- `05 Verbs/` — core verb tables.
- `06 Cards/` — copy-pastable cards by category.
- `99 Inbox/` — the question catcher. **Sacred.** Questions never disappear.

---

## Sync from a desktop

```sh
sh scripts/git-sync.sh
```

It stages the workbook, commits, pulls with rebase, and pushes.

## Export content packs (later, for the app)

```sh
node scripts/validate-json.mjs   # check all packs are valid
node scripts/export-pack.mjs     # bundle into content/dist/workbook_cards.json
```

## Project principle

The learner is building Spanish as a recognizable continuation of himself — not generic tourist fluency. Mexican / neutral Latin American Spanish for travel. Rioplatense only as Borges context. Voice over polish.
