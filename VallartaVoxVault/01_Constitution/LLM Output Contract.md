---
id: vv-llm-output-contract
type: constitution
status: canonical
created: 2026-05-13
updated: 2026-05-13
tags:
  - vallarta-vox
  - constitution
  - contract
  - llm
---

# LLM Output Contract

This is the **single canonical source** for what the Vallarta Vox vault contains and how content must be shaped to land in it cleanly. Paste this document at the top of any LLM prompt (Perplexity, Claude, ChatGPT) whose output you want to drop straight into the vault with no rework.

If you are an LLM reading this: **follow the contract exactly**. When in doubt, leave content unrouted and tell the human what type you tried to produce.

---

## 1. Vault layout (canonical)

```
VallartaVoxVault/
  _Workbook/                ← view layer only (transclusion). Never a destination.
  00_Inbox/                 ← unsorted captures from Bear, voice memos, drops
  01_Constitution/          ← canon, rules, schemas-by-example
  02_DailyPrep/             ← pre-day cultural briefings (one per day)
  03_Chats/                 ← imported LLM conversations
  03_DailyDebriefs/         ← post-day reflections (one per day)
  04_Trails/                ← saved spelunks / rabbit holes
  05_WordLens/              ← word notes (with inline flashcards)
  06_Atelier/<creator>/     ← literature / music / film / mural lab
  07_CreativeWriting/       ← drafts, odes, fragments, scenes
  08_ProjectPacks/          ← outing prep — app reads these offline
  09_Grammar/               ← patterns discovered through use
  10_Flashcards/            ← Anki deck source files
  11_Research/              ← Perplexity research imports (not conversations)
  12_Schemas/Templates/     ← templates + JSON schemas
```

`03_Chats/` and `03_DailyDebriefs/` share a numeric prefix; the unique folder name disambiguates. Do not invent new top-level folders without updating this doc.

---

## 2. Universal frontmatter (every Markdown note)

```yaml
---
id: vv-{{date:YYYYMMDDHHmmss}}
type: <required — see §3>
status: draft            # draft | active | processed | canonical | archived
created: YYYY-MM-DD
updated: YYYY-MM-DD
source:                  # url, app, person, or "self"
source_app:              # perplexity | claude | chatgpt | bear | obsidian | self
language: mixed          # es | en | mixed
tags:                    # always include "vallarta-vox" and the type tag
  - vallarta-vox
  - <type-tag>
links: []
related_trails: []
related_project_packs: []
related_daily_analysis: []
app_relevance: medium    # high | medium | low | none
---
```

Dates are ISO `YYYY-MM-DD`. The `{{date:...}}` Templater syntax is acceptable inside `12_Schemas/Templates/` files. Actual notes must have resolved values.

---

## 3. Note types → folder + extra frontmatter fields

| `type:` | Folder | Extra fields |
|---|---|---|
| `chat_import` | `03_Chats/` | `source_app`, `chat_title`, `conversation_role[]`, `importance`, `app_area[]`, `contains[]`, `extract_to[]` |
| `trail` | `04_Trails/` | `title`, `trail_kind[]`, `origin`, `trigger`, `nodes[]`, `edges[]`, `saved_phrases[]`, `saved_words[]`, `questions[]`, `nearby_doors[]`, `related_chats[]` |
| `project_pack` | `08_ProjectPacks/<slug>/` | `outing_date`, `place_type`, `location`, `purpose[]`, `tone[]`, `social_goals[]`, `emotional_needs[]`, `likely_scenarios[]`, `cached_vocab[]`, `cached_grammar[]`, `likely_phrases[]`, `likely_replies[]`, `fallbacks[]`, `atelier_resources[]` |
| `daily_prep` | `02_DailyPrep/YYYY-MM-DD.md` | `outing_date`, `place_type`, `location_name`, `atelier_resources[]`, `vocabulary_fields[]`, `grammar_priority[]`, `cultural_context[]`, `conversation_targets[]`, `spelunk_seeds[]`, `creative_prompts[]` |
| `daily_analysis` *(alias `daily_debrief`)* | `03_DailyDebriefs/YYYY-MM-DD.md` | `analysis_date`, `related_project_pack`, `places[]`, `people_context[]`, `actual_needs[]`, `missed_translations[]`, `heard_phrases[]`, `repair_moments[]`, `emotional_patterns[]`, `promote_to_next_pack[]`, `promote_to_wordlens[]`, `promote_to_atelier[]` |
| `word_lens_entry` | `05_WordLens/<lemma>.md` | `spanish`, `english`, `lemma`, `part_of_speech`, `register`, `region`, `difficulty`, `source_context`, `related_words[]`, `synonyms[]`, `antonyms[]`, `phrases[]`, `grammar_notes[]`, `etymology`. **Must include `flashcards` tag** and one or more `front::back` lines in the body. |
| `atelier_resource` | `06_Atelier/<creator>/` | `medium[]`, `creator`, `title`, `region`, `period`, `copyright_status`, `language_focus[]`, `cultural_focus[]`, `conversation_use[]`, `field_use[]`, `writing_use[]` |
| `creative_writing_piece` | `07_CreativeWriting/` | `mode` (ode / instructions / scene / sketch), `author_lens`, `seed_object`, `language` |
| `grammar_note` | `09_Grammar/` | `pattern`, `when_to_use`, `common_traps` |
| `anki_deck_source` | `10_Flashcards/` | `deck_name`, `source_notes[]` |
| `research_note` | `11_Research/` | `session_title`, `source: perplexity`, `extracts_to[]` |
| `constitution` / `vault_instructions` | `01_Constitution/` | `status: canonical` |

If `type:` is omitted, the note belongs in `00_Inbox/` for human triage.

---

## 4. JSON pack shapes (`08_ProjectPacks/`)

Two valid shapes coexist. Both validate via schemas in `12_Schemas/Templates/`.

### Shape A — card pack

For day-scoped vocabulary packs (e.g. `Day1_PVR/day1_pvr_voice_travel.json`). Validates against `card.schema.json`.

```json
{
  "pack_id": "day1_pvr_voice_travel",
  "version": "0.1",
  "title": "Day 1 PVR — Voice + Travel",
  "vault_path": "08_ProjectPacks/<slug>/<file>.json",
  "cards": [
    {
      "id": "travel.gate.where",
      "type": "phrase",
      "title": "Where is the gate?",
      "spanish": "¿Dónde está la puerta?",
      "english": "Where is the gate?",
      "literal": "Where is the door/gate?",
      "grammar": ["..."],
      "when_to_use": "...",
      "practice": ["..."],
      "tags": ["spanish", "travel", "..."],
      "source_notes": ["08_ProjectPacks/.../01 Airport Survival.md"]
    }
  ]
}
```

Card `type` must be one of: `phrase`, `verb`, `noun`, `adjective`, `listening`, `literary_bridge`, `repair`, `voice`, `grammar`.

### Shape B — scene pack

For Priority-1 scene-category packs (e.g. `01_Airport.json`, `05_Restaurant.json`). Validates against `scene_pack.schema.json`.

```json
{
  "pack": "airport",
  "vault_path": "08_ProjectPacks/01_Airport.json",
  "scenelets": [
    {
      "type": "scenelet",
      "id": "airport_checkin",
      "scene": "Checking in at the counter",
      "phrases": [{ "es": "...", "en": "..." }],
      "register": "formal-neutral",
      "notes": "..."
    }
  ],
  "phrase_cards": [
    { "es": "vuelo", "en": "flight", "lemma": "vuelo", "notes": "..." }
  ],
  "authority_exchange": {
    "type": "authority_exchange",
    "id": "...",
    "scenario": "...",
    "lines": [{ "role": "learner", "es": "...", "en": "..." }],
    "register_note": "..."
  },
  "register_map": {
    "type": "register_map",
    "context": "...",
    "formal_triggers": [],
    "neutral_triggers": [],
    "informal_triggers": [],
    "warmth_move": "...",
    "regional_note": "..."
  },
  "smalltalk_prompts": [],
  "emergency_numbers": {}
}
```

`smalltalk_prompts` and `emergency_numbers` are optional and used only by specific packs (SmallTalk, Emergency).

---

## 5. Hard constraints

- Travel Spanish is **Mexican / neutral Latin American**.
- **Rioplatense** (vos, sh-pronunciation, lunfardo) appears **only** in `06_Atelier/Borges/`, `06_Atelier/Cortazar/`, or a `dialect_context` note. Never in travel material.
- **No copyrighted full text.** Quote at most one or two lines with citation; paraphrase the rest.
- Every learning item must produce at least one of: phrase, practice move, grammar skeleton, saved question, personal echo, JSON content card.
- Voice-first: usable Spanish before explanation. Adult intelligence preserved; beginner-accessible.
- `word_lens_entry` notes must include the `flashcards` tag plus inline `front::back` lines so the Spaced Repetition plugin picks them up.
- Questions are sacred. If unsure, append to `00_Inbox/Questions To Ask Later.md`. Never silently drop content.

---

## 6. Output rules for the LLM

1. **Markdown notes** open with the universal frontmatter (§2) plus the type's extra fields (§3), then a body that follows the type's template in `12_Schemas/Templates/<Type>.md`.
2. **JSON packs** match Shape A or Shape B exactly (§4). Always include `vault_path`.
3. **Filenames:**
   - `daily_prep` / `daily_analysis`: `YYYY-MM-DD.md`
   - `chat_import`: `YYYY-MM-DD - <slug>.md`
   - `word_lens_entry`: `<lemma>.md` (lowercase, no accents in filename)
   - `trail`: `YYYY-MM-DD - <slug>.md`
   - `atelier_resource`: `<title>.md` inside `06_Atelier/<creator>/`
4. **Tags** always include `vallarta-vox` plus the type tag. `chat-import`, `trail`, `project-pack`, `daily-prep`, `daily-analysis`, `wordlens` (note: drops the `_lens_entry`), `atelier`, `flashcards` (on WordLens).
5. **Wikilinks** use double brackets: `[[Note Name]]` or `[[Folder/Note Name|alias]]`. Prefer name-only when unambiguous.
6. **If unsure of type:** output the note with `type:` left blank, status `draft`, drop in `00_Inbox/`, add a `## Human review` section explaining what you tried to produce.

---

## 7. Quick reference for the LLM (paste-ready)

> You are producing content for the Vallarta Vox Spanish workbook vault.
> Follow the LLM Output Contract at `VallartaVoxVault/01_Constitution/LLM Output Contract.md`.
> Use the canonical folder layout in §1, the universal frontmatter in §2,
> and the per-type extra fields in §3. JSON packs match Shape A or B in §4.
> Honor the hard constraints in §5 (Mexican neutral Spanish for travel;
> Rioplatense only in Atelier; no copyrighted full text; voice-first).
> Output one or more files, each clearly prefixed with its intended path
> like `### VallartaVoxVault/04_Trails/2026-05-14 - ahorita-on-the-malecon.md`
> followed by the file contents in a fenced code block.
