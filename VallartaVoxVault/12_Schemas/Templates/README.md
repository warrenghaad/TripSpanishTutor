# 12 Schemas / Templates

Schemas and note templates that govern the rest of the vault.

## Files

- **[[_core_frontmatter]]** — universal frontmatter every note opens with, and the type → folder table.
- **[[ChatImport]]**, **[[Trail]]**, **[[ProjectPack]]**, **[[DailyAnalysis]]**, **[[WordLensEntry]]**, **[[AtelierResource]]** — the six core templates.
- **[[card.schema.json]]** — JSON Schema for card packs (Shape A). Enforced by `scripts/validate-json.mjs`.
- **[[scene_pack.schema.json]]** — JSON Schema for scene packs (Shape B).

## Canonical contract

For LLM-generated output that must drop straight into this vault, see **[[LLM Output Contract]]** in `01_Constitution/`. That document is the single source of truth for vault layout, frontmatter, schemas, and constraints.

## Note frontmatter conventions

Every workbook note begins with YAML frontmatter:

```yaml
---
type: <one of: workbook_note, voice_principles, voice_note, day_dashboard, vault_dashboard, workbook_view, daily_prep, daily_debrief, trail, wordlens, project_pack, literature_lab, dialect_context, grammar_note, question_catcher, inbox_note>
status: <seed | live | archived>
tags:
  - spanish
  - <type-specific tags>
created: YYYY-MM-DD
---
```

## Templater templates

(planned, not yet shipped)

- ChatImport
- DailyPrep
- DailyDebrief
- Trail
- ProjectPack
- WordLens
- ConstitutionNote

When you install Templater in Obsidian, point it at this folder.
