# 12 Schemas / Templates

Schemas and note templates that govern the rest of the vault.

## Files

- **[[card.schema.json]]** — JSON Schema for content cards. Every card in `08_ProjectPacks/**/*.json` must validate against this. Enforced by `scripts/validate-json.mjs`.

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
