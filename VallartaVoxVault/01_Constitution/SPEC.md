# VallartaVoxVault — Content Spec

This document is the **house style** for everything written into the vault by Perplexity, ChatGPT, or by hand. Every consumer of the vault (the app's day-pack builder, the `/learn` page, Obsidian sync) parses files according to the rules below.

If a file does not follow this spec, the app will skip it (and `vault-doctor.sh` will flag it).

---

## 1. Folder map

| Folder | Purpose | Who writes here |
|---|---|---|
| `00_Inbox/` | Quick captures, voice memos, Bear drops, raw thoughts | You (mostly via Obsidian) |
| `01_Constitution/` | System rules, schemas, vault instructions, learner profile | You + ChatGPT |
| `02_DailyPrep/` | Atelier-generated pre-day briefings | ChatGPT / Perplexity |
| `03_DailyDebriefs/` | Post-day offloads and reflections | You |
| `04_Trails/` | Saved spelunks from the app and desktop | App + you |
| `05_WordLens/` | Every word worth keeping | App + you |
| `06_Atelier/` | Art, poems, music, film, history clips — by author | ChatGPT / Perplexity |
| `07_CreativeWriting/` | Drafts, fragments, ode attempts, scenes | You |
| `08_ProjectPacks/` | Outing prep — the app's offline pack source (auto-generated) | App |
| `09_Grammar/` | Patterns discovered through use | App + you |
| `10_Flashcards/` | Anki-sync deck source files | App |
| `11_Research/` | Perplexity session imports — the drop zone | Perplexity |
| `12_Schemas/Templates/` | Frontmatter templates per kind | (do not edit by hand) |

`06_Atelier/` is divided by author / medium: `Borges/`, `Neruda/`, `Cortazar/`, `Paz/`, `Rulfo/`, `Murals_PV/`, `Music/`, `Film/`.

---

## 2. Three Modes

Every consumer file declares one of three **modes** in its frontmatter. The `/learn` page uses these as its top-level navigation.

| Mode | Meaning | Typical kinds | Typical folder |
|---|---|---|---|
| `airport` | Phenomenology of travel — orientation, signs, asking, listening, motion, need | `airport-scenelet`, `vocab-pack`, `grammar-note` | `11_Research/`, `08_ProjectPacks/` |
| `atelier` | Literary + cultural Spanish — poems, prose, murals, music, film | `atelier-entry`, `vocab-pack`, `grammar-note` | `06_Atelier/<Author>/`, `11_Research/` |
| `bridge` | Pairs a travel line with a literary line so grammar/image rhymes across both | `bridge-note` | `11_Research/`, `06_Atelier/` |

---

## 3. Frontmatter

Every spec-compliant file starts with YAML frontmatter:

```yaml
---
kind: airport-scenelet      # required — see kinds table
date: 2026-05-13            # required — YYYY-MM-DD; for atelier files, date authored or imported
locale: vallarta            # required — vallarta | mexico-city | oaxaca | colombia | argentina | spain | cuba | neutral
mode: airport               # required — airport | atelier | bridge
tags: [signs, orientation]  # optional — short list, lowercase, hyphens
source: perplexity          # optional — perplexity | chatgpt | hand | app
status: draft               # optional — draft | ready | integrated  (default: ready)
author: Borges              # optional — required for atelier kinds (Borges, Neruda, Cortazar, Paz, Rulfo, etc.)
work: "El otro, el mismo"   # optional — collection / volume / album / film name for atelier
pair_id: door-001           # optional — for bridge-notes, links the two halves
---
```

### Required vs optional by kind

| Kind | Required frontmatter | Notes |
|---|---|---|
| `airport-scenelet` | kind, date, locale, mode=airport | tags strongly recommended |
| `atelier-entry` | kind, date, locale, mode=atelier, author | `work` recommended; excerpt only per copyright rule. The legacy name `borges-line` is an alias — parsers should treat `kind: borges-line` as `atelier-entry` with `author: Borges`. |
| `bridge-note` | kind, date, locale, mode=bridge, pair_id | body must contain both halves (see §5) |
| `vocab-pack` | kind, date, locale, mode | one entry per word in the body |
| `grammar-note` | kind, date, locale, mode | |
| `day-pack` | kind, date, locale | mode optional; assembled or hand-authored |
| `daily-prep` | kind, date, locale | |
| `daily-debrief` | kind, date | locale optional |
| `wordlens-entry` | kind, date, locale | one word per file |
| `flashcard` | kind, date, locale | front/back required in body |

---

## 4. Naming & paths

- Filenames: `kebab-case-slug.md`. No spaces.
- Drop new Perplexity research at: `11_Research/YYYY-MM-DD/<kind>-<slug>.md`.
- Atelier work belongs in `06_Atelier/<Author>/<kind>-<slug>.md`.
- Auto-generated day packs land at `08_ProjectPacks/YYYY-MM-DD.md`. Do not hand-edit; edit the source files in `11_Research/` instead.
- When `status: integrated` is set on a research file, the app moves it to `08_ProjectPacks/YYYY-MM-DD/sources/`.

---

## 5. The Golden Interaction Pattern (body)

Every consumer file (airport-scenelet, atelier-entry, bridge-note, vocab-pack, grammar-note) uses these six sections, in order. Use the exact `## ` headings — the parser keys off them.

```markdown
## Meaning
What the phrase / line / situation means in plain English.

## Literal
Word-for-word Spanish structure, hyphen-glossed.

## Natural
How a fluent speaker would actually say or read it.

## Grammar Skeleton
The pattern the line teaches — tense, mood, agreement, word order.

## Practice Move
One tiny transformation the learner can do right now (substitute a noun, flip the tense, swap the subject).

## Saveable Card
A single, copy-paste-ready card the app can save into WordLens / practice. Format:
- **front:** Spanish phrase
- **back:** English meaning
- **note:** one-line context
```

For **bridge-note**, the body has two stacked Golden blocks — one labelled `# Travel Half` and one labelled `# Literary Half` — sharing the same `pair_id`.

For **vocab-pack**, the body is a list of WordLens-style mini-entries (front / back / note) without the six-section structure; one item per word.

For **day-pack**, the body is a curated narrative with `## Airport`, `## Atelier`, `## Bridge` sections that each link to or inline the underlying entries.

---

## 6. Copyright rule

For copyrighted poems, prose, lyrics, or screenplays:

- Store **excerpts only** (a line or two — fair use for commentary).
- The bulk of the file is your own commentary, grammar notes, etymology, learner notes.
- Always set `source:` to the original publication and credit the author in frontmatter.
- The learner uses their own physical book / streaming subscription for the full text — the vault stores the **scaffolding** around it.

---

## 7. Prompt for Perplexity (paste this verbatim)

> You are contributing to **VallartaVoxVault**, a Spanish-learning vault for a literary traveler in Puerto Vallarta. Output one or more markdown files. Each file MUST begin with YAML frontmatter containing `kind`, `date`, `locale`, `mode`, and any kind-specific required fields (see the spec). Use one of these `kind` values: `airport-scenelet`, `atelier-entry`, `bridge-note`, `vocab-pack`, `grammar-note`, `day-pack`. Use one of these `mode` values: `airport`, `atelier`, `bridge`. The body MUST follow the Golden Interaction Pattern exactly: `## Meaning`, `## Literal`, `## Natural`, `## Grammar Skeleton`, `## Practice Move`, `## Saveable Card`. For atelier kinds, set `author:` and `work:` and store **excerpts only** — your own commentary should dominate. For bridge-notes, output two stacked Golden blocks (`# Travel Half` and `# Literary Half`) that share a `pair_id`. Save filenames as kebab-case. Suggest a path under `11_Research/<today>/` (or `06_Atelier/<Author>/` for atelier). Do not invent fields outside this spec.

---

## 8. Status field flow

- `draft` — work in progress, ignored by the app.
- `ready` — default; the app reads and serves it.
- `integrated` — consumed by an auto-build (e.g. day pack); the app moves it under `08_ProjectPacks/<date>/sources/`.

---

## 9. See also

- `01_Constitution/LANGUAGE_PRISM.md` — **the canonical Prism architecture** (v0.1): 6 face-workspaces × 9-cubie grid, 12 typed edge-contracts, 8 vertices, myelination, trails, data model
- `01_Constitution/VAULT.md` — folder purposes at a glance
- `01_Constitution/project-space.md` — the founding vision document
- `01_Constitution/learner-profile.md` — who the learner is (defined through use)
- `12_Schemas/Templates/` — copy-paste starting points
- ~~`01_Constitution/CUBE.md`~~, ~~`01_Constitution/PRISM.md`~~, ~~`12_Schemas/prompts/cube-emergence-rule.md`~~, ~~`CUBE-prism-vox.md`~~ — **superseded by `LANGUAGE_PRISM.md` on 2026-05-16**. Kept on disk for audit trail. Do not cite as canon.
