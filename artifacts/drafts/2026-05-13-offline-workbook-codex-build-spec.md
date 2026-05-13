# Offline Workbook Codex Build Spec

## Purpose

Build an offline workbook inside Vallarta Voz / TripSpanishTutor. The workbook is not a fake offline LLM. It is a local-first activity engine that helps the learner become more articulate in Spanish through lived experience, identity, sentence growth, travel situations, books, Latin American art, poetry, and geometry.

The online LLM project remains the intelligence layer for translation, synthesis, deeper explanation, and content-pack expansion. The offline workbook is the reliable field instrument: it opens without network, holds prompts, captures observations, teaches core structures, and saves questions for later.

## North star

Spanish is not just vocabulary. It is a new geometry for the self.

The workbook should help the learner say:

- what I notice
- how I feel
- what I did today
- what I want
- what I will do next
- what kind of person I am becoming
- how an object, poem, image, or place becomes language

## Product relationship

The current web app already has a translation surface, chat handoff, sentence grower, journal, local IDB fallback, saved-to-practice flow, and queued offline translation behavior. Keep that architecture. Add workbook routes and content packs that operate offline.

## Offline honesty rule

Offline workbook may:

- show bundled activities
- search local workbook cards
- explain prewritten grammar scaffolds
- grow sentences from templates
- save notes/questions/reflections locally
- queue a deeper question for online LLM review

Offline workbook may not:

- pretend to perform open-ended literary interpretation
- pretend to fully translate arbitrary input without a model
- require backend calls to open, search, write, or save workbook entries
- include full copyrighted poems or artworks as replacement content

## V1 route map

Add these routes/pages if they do not already exist:

```txt
/workbook
/workbook/unit/:unitId
/workbook/spread/:spreadId
/workbook/offline
/workbook/questions
```

Navigation label: `Workbook`.

## V1 workbook tabs

1. **Start**
   - Continue last spread
   - Start a daily sentence
   - Open motif map
   - Ask later

2. **Identity**
   - Soy / Estoy
   - Quiero / Necesito / Siento / Pienso
   - voice-preserving starter sentences

3. **Today**
   - daily journal prompts
   - present, preterite, imperfect scaffolds
   - sentence expansion from today

4. **Future Self**
   - voy a + infinitive
   - simple future
   - intention prompts

5. **Texture**
   - adjectives
   - adverbs
   - intensity words
   - adjective agreement

6. **Travel**
   - airport/travel field cards
   - repair phrases
   - directions
   - documents

7. **Literature + Art Lab**
   - motif-based workbook units
   - no full poems
   - user supplies lines from books

8. **Ask Later**
   - saved questions for online LLM review
   - tags: grammar, vocabulary, literature, travel, identity, pronunciation, art, geometry

## Core activity model: workbook spread

Each activity is a spread, not a lesson. A spread is compact enough to use in an airport line and rich enough to revisit.

Spread structure:

1. Anchor: poem, artwork, object, place, sentence, or idea.
2. Motif: mirror, salt, border, wound, labyrinth, spiral, constellation, etc.
3. Spanish seed: 3 to 8 words or phrases.
4. Geometry lens: what structure is operating?
5. Commentary: short explanation.
6. Activity: write, draw, translate, map, compare, or improvise.
7. Personal echo: a sentence that helps the learner sound like himself.
8. Saveable card: one phrase, one grammar pattern, one identity note.

## V1 motif units

Build six units. Do not try to cover all Latin American literature. Use motifs as drawers.

### 1. Objects

Purpose: nouns, articles, adjectives, possession, Neruda-like object attention.

Spanish targets:

- el / la / los / las
- mi / mis
- tener
- estar en
- adjectives after nouns

Starter spread: `La taza guarda la manana`.

### 2. Mirrors

Purpose: identity, reflection, doubles, self-translation.

Spanish targets:

- ser / estar
- parecer
- reflejar
- me veo / me siento
- adjective agreement

Starter spread: `El espejo parece una puerta`.

### 3. Borders

Purpose: belonging, here/there, crossing, threshold.

Spanish targets:

- aqui / alla
- cruzar
- pertenecer
- desde / hacia / hasta
- ser de / estar en

Starter spread: `Estoy aqui, pero pienso en alla`.

### 4. Labyrinths

Purpose: pathfinding, travel, city, bureaucracy, Borges/Cortazar energy without needing full text.

Spanish targets:

- buscar
- salir
- ir por / ir hacia
- por / para
- donde / adonde

Starter spread: `Busco la salida`.

### 5. Bodies

Purpose: state, feeling, care, pain, fatigue, hunger, breath.

Spanish targets:

- tener hambre / sed / frio / calor
- estar cansado
- me duele
- sentir / sentirse
- cuidar

Starter spread: `Mi cuerpo sabe antes que mi cabeza`.

### 6. Constellations

Purpose: relation, memory, family, music, graph thinking, connection.

Spanish targets:

- con / entre / de
- recordar
- volver
- relacionarse
- conocer / saber

Starter spread: `Estoy hecho de relaciones`.

## Translation surface integration

Every workbook spread should offer:

- `Translate my answer`
- `Chat about this`
- `Grow this sentence`
- `Make it past tense`
- `Make it future tense`
- `Save to journal`
- `Save as question`

When offline:

- save the user's response locally
- run local pattern matching against bundled phrase/grammar cards
- queue translation if arbitrary translation is needed

## Data files to add

```txt
client/src/data/workbook/manifest.json
client/src/data/workbook/workbook_units.json
client/src/data/workbook/workbook_spreads.json
client/src/data/workbook/grammar_scaffolds.json
client/src/data/workbook/voice_seeds.json
client/src/data/workbook/offline_patterns.json
```

## Suggested implementation files

```txt
client/src/pages/workbook.tsx
client/src/pages/workbook-unit.tsx
client/src/pages/workbook-spread.tsx
client/src/pages/workbook-questions.tsx
client/src/components/workbook/workbook-card.tsx
client/src/components/workbook/workbook-spread-view.tsx
client/src/components/workbook/personal-echo-editor.tsx
client/src/components/workbook/offline-question-queue.tsx
client/src/lib/workbook-store.ts
client/src/lib/workbook-search.ts
client/src/lib/workbook-schema.ts
```

## Local persistence

Use IndexedDB through the existing local storage/IDB pattern if present. Store:

- workbook responses
- saved personal echoes
- ask-later questions
- spread completion state
- tags
- queued online review items

## Minimal schema

See `2026-05-13-offline-workbook-schema.json` for the canonical content shape.

## Acceptance tests

1. Start app with network off.
2. Open `/workbook`.
3. Load motif units.
4. Open Objects unit.
5. Open starter spread.
6. Write a personal echo.
7. Save it locally.
8. Tap `Grow this sentence`; if offline, use local templates or queue.
9. Tap `Save as question`.
10. Close and reopen app.
11. Saved echo and question persist.
12. Search `mirror`, `gate`, `future`, `cansado`, `labyrinth` and get local results.

## Codex task prompt

```md
Implement the offline workbook described in artifacts/drafts/2026-05-13-offline-workbook-codex-build-spec.md.

Constraints:
- Do not build a fake offline LLM.
- Do not require network for workbook pages.
- Use bundled JSON and local persistence.
- Do not include full copyrighted poems.
- Preserve the existing translation surface, chat handoff, grow sentence, journal, and practice flows.
- Add workbook pages and local content packs only.

Deliver:
- routes/pages/components
- workbook local store
- workbook local search
- starter content JSON
- acceptance tests or manual test checklist
```
