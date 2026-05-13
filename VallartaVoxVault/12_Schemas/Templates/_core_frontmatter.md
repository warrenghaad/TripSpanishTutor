# 12 Schemas / Templates — Universal Core Frontmatter

Every note in the vault should open with the universal core frontmatter block below, plus any type-specific fields documented in the matching template (`ChatImport.md`, `Trail.md`, `ProjectPack.md`, `DailyAnalysis.md`, `WordLensEntry.md`, `AtelierResource.md`).

`type` is the discriminator. It determines where the note lives, how it links, and how downstream code queries or exports it.

```yaml
---
id: vv-{{date:YYYYMMDDHHmmss}}
type:                      # see allowed values below
status: draft              # draft | active | processed | canonical | archived
created: {{date:YYYY-MM-DD}}
updated: {{date:YYYY-MM-DD}}
source:                    # url, app, person, or "self"
source_app:                # perplexity | claude | chatgpt | bear | obsidian | self
language:                  # es | en | mixed
tags: []
links: []
related_trails: []
related_project_packs: []
related_daily_analysis: []
app_relevance:             # high | medium | low | none
---
```

## Allowed `type` values

- `constitution`
- `vault_instructions`
- `chat_import`
- `trail`
- `project_pack`
- `daily_analysis`
- `daily_prep` *(legacy alias of `daily_analysis` used for pre-day notes)*
- `daily_debrief` *(legacy alias used for post-day notes)*
- `word_lens_entry`
- `atelier_resource`
- `creative_writing_piece`
- `scenario`
- `phrase_card`
- `prompt`
- `research_note`
- `schema_index`
- `workbook_view`

## Rules

- Always include `id`, `type`, `status`, `created`. Everything else may default to empty.
- Use `kebab-case` slugs in filenames; keep accents in the body.
- Don't reuse `id` values. The `vv-{{type}}-YYYYMMDDHHmmss` pattern guarantees uniqueness.
- When a note evolves from one type to another (e.g. `chat_import` → `trail`), create the new note and link back rather than mutating the original.

## Six core templates

| Template | Type | Folder |
|---|---|---|
| `ChatImport.md` | `chat_import` | `03_Chats/` |
| `Trail.md` | `trail` | `04_Trails/` |
| `ProjectPack.md` | `project_pack` | `08_ProjectPacks/<slug>/` |
| `DailyAnalysis.md` | `daily_analysis` *(alias `daily_debrief`)* | `03_DailyDebriefs/` |
| `WordLensEntry.md` | `word_lens_entry` | `05_WordLens/` |
| `AtelierResource.md` | `atelier_resource` | `06_Atelier/<creator>/` |

Pre-day briefings use a different template (`daily_prep` type → `02_DailyPrep/`); see the existing `02_DailyPrep/_template.md`.

Start with these six. Resist the urge to build more until the workflow demands them.

## Canonical contract

The single source of truth for routing, schemas, and constraints is `[[LLM Output Contract]]` in `01_Constitution/`. Paste that document at the top of any LLM prompt whose output should land in this vault.
