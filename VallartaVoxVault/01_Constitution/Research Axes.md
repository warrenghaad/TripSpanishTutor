---
id: vv-research-axes
type: constitution
status: canonical
created: 2026-05-13
tags:
  - vallarta-vox
  - constitution
  - taxonomy
  - balance
  - curriculum
---

# Research Axes

The canonical curriculum-balance specification. Defines what the workbook is *centered* on and how content should be weighted across topics. Lives at `12_Schemas/research_axes_taxonomy.json` as a machine-readable JSON object; this note is the human-readable companion.

## The center

The center of this curriculum is **learner voice** — the learner's recognizable identity in Spanish: humor, curiosity, metaphoric thinking, precision, warmth, literary / artistic taste, and practical social presence.

**Not the center:**

- poetry alone
- Borges alone
- travel phrases alone
- generic beginner Spanish

If any single axis starts to dominate the content, the workbook is drifting and should be rebalanced.

## Balancing rule

- **Max default weight per axis: 0.18.**
- A single axis may dominate only when the learner *explicitly* asks for a focused session.
- Default distribution: balanced, rotating, voice-centered.

## The ten axes

| Axis | Weight | Research questions | App outputs |
|---|---:|---|---|
| `live_situations` | 0.13 | Will need to say in actual places; what people ask; repair phrases under pressure | scenelets, phrase cards, listening cards, offline packs |
| `etymology` | 0.11 | Where words come from; cognates and false friends; history in ordinary vocab | word-history cards, cognate maps, false-friend warnings |
| `language_love` | 0.10 | How to ask about words; "I have the idea but not the word"; Spanish as place of curiosity | meta-language phrasebook, question cards, conversation repair |
| `music` | 0.10 | How people talk about songs; rhythm / lyrics / voice / feeling / genre; songs as listening + memory drill | music conversation cards, listening drills, song reaction phrases |
| `visual_art` | 0.10 | Talking about paintings, colors, symbols, composition; visual thinking → Spanish speech | museum phrase cards, image description drills, art vocabulary maps |
| `literature_poetry` | 0.12 | What grammar/vocab the text reveals; how the text helps the learner speak as himself; conversational bridge from the reading | literary lab cards, author modules, poem-line grammar analysis, personal echo prompts |
| `humor_wordplay` | 0.09 | How to be funny in beginner Spanish; recovering from a bad joke; safe and useful wordplay | joke repair cards, pun notes, tone markers |
| `philosophy_identity` | 0.09 | How beginner Spanish can carry adult thought; short structures for time, memory, solitude, beauty | thought cards, journal prompts, conversation questions |
| `grammar_structure` | 0.09 | What grammar pattern is alive inside this phrase; how to transform it | grammar skeletons, transformation drills, verb cards |
| `journal_self_expression` | 0.07 | What he wants to say today; one sentence → a paragraph | journal scaffolds, translation cards, voice memory |

Weights sum to ≈1.00.

## Card principle

> Every card should route back to learner voice: **usable phrase, literal meaning, grammar skeleton, voice note, practice transformation**, optional cultural / literary / art / music / etymology bridge.

If a card doesn't route back to voice, it doesn't belong yet.

## Sample voice sentences (anchors)

| Spanish | English | Axis |
|---|---|---|
| Tengo la idea, pero me falta la palabra exacta. | I have the idea, but I am missing the exact word. | `language_love` |
| Lo puedo decir simple, pero la idea no es simple. | I can say it simply, but the idea is not simple. | `philosophy_identity` |
| Me gusta cómo suena esa palabra. | I like how that word sounds. | `music_language` |
| La imagen me parece rara, pero verdadera. | The image seems strange to me, but true. | `visual_art` |

## How this governs content generation

When the LLM Output Contract (`[[LLM Output Contract]]`) is in force, this taxonomy adds one more law:

1. Read the request. If it's not explicitly scoped to one axis, **distribute output across axes per the weights above**.
2. **No single axis output can exceed 0.18** of total output in a default session.
3. Every output card / note must satisfy the card principle (above): route back to voice.
4. If you can't tell which axis an item belongs to, tag the item with `axis: unknown` and add it to `[[Questions To Ask Later]]` so the human can route it.

## Related

- `[[LLM Output Contract]]` — the schema-level contract; this doc adds the balance dimension.
- `[[Workbook Architecture]]` — Atelier loop and plugin stack.
- Machine-readable source: `12_Schemas/research_axes_taxonomy.json`.
