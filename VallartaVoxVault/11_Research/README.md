# 11 Research

Perplexity session imports. The research lab's output landing zone.

## What goes here

- Daily-prep research drafts before they're shaped into a `daily_prep` note (which lives in `02_DailyPrep/`).
- Multi-pass deep-research sessions (cultural context, grammar deep-dives, author surveys).
- Anything Perplexity produces that you want to keep raw — citations and all — before extracting the *useful* parts into other folders.

## Naming

`YYYY-MM-DD perplexity — <slug>.md` — e.g. `2026-05-13 perplexity — pvr airport day1.md`.

## Frontmatter

```yaml
---
id: vv-research-{{date:YYYYMMDDHHmmss}}
type: research_import
status: raw                # raw | in_progress | extracted | archived
source: perplexity
session_title: ""
created: YYYY-MM-DD
extracts_to: []            # where the useful parts go (DailyPrep, Atelier, WordLens, Grammar)
tags:
  - vallarta-vox
  - research
  - perplexity
---
```

## House rules

- Paste the Perplexity output **with citations**. Don't strip them.
- When you extract a useful fragment into another note, link **back** to the research import so the source is preserved.
- Status `raw` → `extracted` once the useful parts have homes elsewhere.
- Don't delete the original even after extraction. The vault keeps its own history.

## Related folders

- `02_DailyPrep/` — the finished cultural briefings, shaped from this raw research.
- `06_Atelier/` — when a research session lifts an author / mural / film into the curriculum.
- `09_Grammar/` — when a research session distills into a pattern note.
