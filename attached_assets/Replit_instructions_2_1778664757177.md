# Replit Backend Build Direction — Vallarta Vox / TripSpanishTutor

## Goal

Build the backend so it mirrors the Obsidian vault schema.

Obsidian is the offline workbook, research vault, schema store, and durable artifact library. The app UI is not Obsidian. The app UI is one translator-first chat surface with modular internal capabilities.

The backend must make these two worlds match:

1. App chat creates, reads, updates, and retrieves structured objects.
2. Obsidian stores the same objects as Markdown notes with YAML frontmatter.
3. Git/GitHub acts as the sync bridge between backend-generated artifacts and the Obsidian vault.

Do not build a multi-tab app UI. Do not build Obsidian as the app. Build a backend that can support one chat interface and structured artifact persistence.

---

## Canonical Product Model

The app has one primary surface:

```json
{
  "primary_surface": "single_chat",
  "default_state": "translator",
  "capabilities": [
    "translator",
    "explorable_world",
    "atelier",
    "creative_writing_lab",
    "debrief_analysis",
    "project_pack_builder"
  ]
}
```

The chat should infer capability from the user's request. It should answer the immediate need first, then optionally offer deeper doors.

Capabilities:

1. `translator`
   - Immediate translation, phrase generation, comprehension, register, repair.
2. `explorable_world`
   - WordLens, trails, etymology, idioms, grammar, language spelunking.
3. `atelier`
   - Scene-responsive literature, art, music, film, history, cultural context.
4. `creative_writing_lab`
   - Voice-preserving Spanish writing, journal translation, sentence gardening.
5. `debrief_analysis`
   - End-of-day offload, actual needs, missed phrases, future pack promotion.
6. `project_pack_builder`
   - Prepares situational intelligence for outings.

---

## Backend Principle

The database and Markdown vault should have isomorphic objects.

Every durable app object should be representable in three forms:

1. Database row
2. JSON API object
3. Obsidian Markdown note with YAML frontmatter

Example:

```text
DB table: word_lens_entries
API type: WordLensEntry
Vault note: VallartaVoxVault/05_WordLens/{slug}.md
```

This is the central backend law.

---

## Vault Folder Mapping

Use this folder map exactly unless later instructed otherwise:

```text
VallartaVoxVault/
  00_Inbox/
  01_Constitution/
  02_DailyPrep/
  03_DailyDebriefs/
  04_Trails/
  05_WordLens/
  06_Atelier/
    Borges/
    Neruda/
    Cortazar/
    Paz/
    Rulfo/
    Murals_PV/
    Music/
    Film/
    Art_Exhibits/
    Yoga_Wellness/
    Event_Finding/
  07_CreativeWriting/
  08_ProjectPacks/
  09_Grammar/
  10_Flashcards/
  11_Research/
  12_Schemas/
    Templates/
```

---

## Core Object Types

Implement these first.

```ts
type CanonicalObjectType =
  | "chat_session"
  | "chat_message"
  | "word_lens_entry"
  | "trail"
  | "trail_node"
  | "trail_edge"
  | "project_pack"
  | "daily_prep"
  | "daily_debrief"
  | "daily_analysis"
  | "atelier_resource"
  | "creative_writing_piece"
  | "grammar_note"
  | "phrase_card"
  | "queued_question"
  | "research_note";
```

---

## Database Tables

Use Postgres if available. If Replit currently has simpler storage, still define the schema in a way that can migrate to Postgres.

### 1. chat_sessions

Stores each chat session.

Fields:

```ts
{
  id: string;
  title?: string;
  created_at: string;
  updated_at: string;
  mode_hint?: "offline" | "online_while_out" | "debriefing";
  active_project_pack_id?: string;
  active_daily_prep_id?: string;
  active_location_label?: string;
  status: "active" | "archived";
}
```

### 2. chat_messages

Stores raw messages and model responses.

```ts
{
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  created_at: string;
  inferred_capabilities: string[];
  artifact_ids: string[];
  metadata: Record<string, any>;
}
```

### 3. word_lens_entries

For words, phrases, idioms, etymologies, register, and examples.

```ts
{
  id: string;
  spanish: string;
  english?: string;
  lemma?: string;
  part_of_speech?: string;
  register?: string;
  region?: string;
  difficulty?: string;
  source_context?: string;
  plain_meaning?: string;
  natural_use?: string;
  etymology?: string;
  related_words: string[];
  synonyms: string[];
  antonyms: string[];
  phrases: string[];
  grammar_notes: string[];
  examples: Array<{
    spanish: string;
    english_function: string;
    context?: string;
  }>;
  nearby_doors: string[];
  related_trails: string[];
  related_project_packs: string[];
  created_at: string;
  updated_at: string;
}
```

### 4. trails

For language spelunking and rabbit-hole memory.

```ts
{
  id: string;
  title: string;
  status: "active" | "paused" | "archived";
  trail_kind: Array<"language" | "cultural" | "literary" | "social" | "travel" | "emotional">;
  origin?: string;
  trigger?: string;
  summary?: string;
  saved_words: string[];
  saved_phrases: string[];
  questions: string[];
  nearby_doors: string[];
  related_chats: string[];
  related_project_packs: string[];
  related_daily_analysis: string[];
  created_at: string;
  updated_at: string;
}
```

### 5. trail_nodes

```ts
{
  id: string;
  trail_id: string;
  node_type: "word" | "phrase" | "idiom" | "grammar" | "etymology" | "art" | "poem" | "song" | "scene" | "question";
  label: string;
  content?: string;
  source_object_id?: string;
  order_index: number;
}
```

### 6. trail_edges

```ts
{
  id: string;
  trail_id: string;
  from_node_id: string;
  to_node_id: string;
  edge_type: "etymology" | "synonym" | "register_shift" | "scene_link" | "cultural_link" | "grammar_pattern" | "user_curiosity";
  note?: string;
}
```

### 7. project_packs

For pre-cached situational intelligence.

```ts
{
  id: string;
  title: string;
  status: "planned" | "active" | "completed" | "archived";
  outing_date?: string;
  place_type?: string;
  location_label?: string;
  purpose: string[];
  tone: string[];
  social_goals: string[];
  emotional_needs: string[];
  likely_scenarios: string[];
  cached_vocab: string[];
  cached_grammar: string[];
  likely_phrases: Array<{
    english_function: string;
    spanish: string;
    register?: string;
  }>;
  likely_replies: string[];
  fallbacks: string[];
  related_trails: string[];
  related_daily_analysis: string[];
  atelier_resources: string[];
  created_at: string;
  updated_at: string;
}
```

### 8. daily_prep

Atelier-informed morning or pre-outing briefing.

```ts
{
  id: string;
  title: string;
  outing_date: string;
  place_type?: string;
  location_name?: string;
  scene?: string;
  atelier_resources: string[];
  vocabulary_fields: string[];
  grammar_priority: string[];
  cultural_context: string[];
  conversation_targets: string[];
  spelunk_seeds: string[];
  creative_prompts: string[];
  related_trails: string[];
  related_project_pack_id?: string;
  markdown_body?: string;
  created_at: string;
  updated_at: string;
}
```

### 9. daily_debriefs

Raw user offloads after a day or event.

```ts
{
  id: string;
  debrief_date: string;
  raw_offload: string;
  places: string[];
  people_context: string[];
  fragments_spanish: string[];
  fragments_english: string[];
  related_project_pack_id?: string;
  related_daily_prep_id?: string;
  related_trails: string[];
  created_at: string;
  updated_at: string;
}
```

### 10. daily_analysis

Structured analysis generated from debriefs.

```ts
{
  id: string;
  analysis_date: string;
  related_debrief_id?: string;
  related_project_pack_id?: string;
  related_daily_prep_id?: string;
  places: string[];
  actual_needs: string[];
  missed_translations: string[];
  heard_phrases: string[];
  repair_moments: string[];
  emotional_patterns: string[];
  grammar_that_would_help: string[];
  promote_to_next_pack: string[];
  promote_to_wordlens: string[];
  promote_to_atelier: string[];
  promote_to_trails: string[];
  summary?: string;
  created_at: string;
  updated_at: string;
}
```

### 11. atelier_resources

For literature, art, music, film, history, and cultural material.

```ts
{
  id: string;
  title: string;
  medium: "poetry" | "prose" | "visual_art" | "music" | "film" | "history" | "architecture" | "event" | "travel_guide";
  creator?: string;
  region?: string;
  period?: string;
  copyright_status?: string;
  source_url?: string;
  summary?: string;
  language_focus: string[];
  cultural_focus: string[];
  conversation_use: string[];
  field_use: string[];
  writing_use: string[];
  prompt_examples: string[];
  related_trails: string[];
  related_project_packs: string[];
  related_daily_prep: string[];
  markdown_body?: string;
  created_at: string;
  updated_at: string;
}
```

### 12. creative_writing_pieces

```ts
{
  id: string;
  title?: string;
  source_language: "english" | "spanish" | "mixed";
  draft_original: string;
  spanish_draft?: string;
  revision_notes: string[];
  voice_notes: string[];
  grammar_notes: string[];
  vocabulary_field: string[];
  author_lens?: "Borges" | "Neruda" | "Cortazar" | "Paz" | "Rulfo" | "none";
  related_atelier_resources: string[];
  related_trails: string[];
  created_at: string;
  updated_at: string;
}
```

### 13. queued_questions

For offline unresolved questions.

```ts
{
  id: string;
  question: string;
  context?: string;
  source: "offline_chat" | "daily_prep" | "wordlens" | "trail" | "debrief";
  status: "queued" | "answered" | "promoted";
  answer?: string;
  promoted_object_ids: string[];
  created_at: string;
  updated_at: string;
}
```

### 14. research_notes

For Perplexity / GPT / Gemini / Claude research imports.

```ts
{
  id: string;
  title: string;
  source_app: "perplexity" | "claude" | "chatgpt" | "gemini" | "manual";
  source_url?: string;
  research_area: string[];
  summary?: string;
  decisions: string[];
  open_questions: string[];
  extract_to: string[];
  markdown_body: string;
  created_at: string;
  updated_at: string;
}
```

---

## Markdown Serialization

Implement a serializer that converts every object into Obsidian-compatible Markdown.

Required function:

```ts
function objectToMarkdown(objectType: CanonicalObjectType, object: any): string
```

Required output format:

```markdown
***
id: vv-word-20260513042800
type: word_lens_entry
status: active
created: 2026-05-13
updated: 2026-05-13
spanish: pena ajena
english: secondhand embarrassment
lemma: pena
register: neutral
region: Mexico / Latin America
related_trails: []
related_project_packs: []
tags:
  - vallarta-vox
  - wordlens
***

# WordLens: pena ajena

## Meaning

...

## Natural use

...

## Grammar

...

## Nearby doors

...
```

Also implement reverse parsing:

```ts
function markdownToObject(markdown: string): {
  frontmatter: Record<string, any>;
  body: string;
  objectType: CanonicalObjectType;
}
```

Use a YAML parser. Preserve unknown frontmatter fields so Obsidian notes can evolve without breaking the backend.

---

## File Path Mapping

Implement:

```ts
function getVaultPath(objectType: CanonicalObjectType, object: any): string
```

Mapping:

```ts
{
  "daily_prep": "VallartaVoxVault/02_DailyPrep/{date}-{slug}.md",
  "daily_debrief": "VallartaVoxVault/03_DailyDebriefs/{date}-{slug}.md",
  "daily_analysis": "VallartaVoxVault/03_DailyDebriefs/{date}-analysis-{slug}.md",
  "trail": "VallartaVoxVault/04_Trails/{slug}.md",
  "word_lens_entry": "VallartaVoxVault/05_WordLens/{slug}.md",
  "atelier_resource": "VallartaVoxVault/06_Atelier/{category}/{slug}.md",
  "creative_writing_piece": "VallartaVoxVault/07_CreativeWriting/{date}-{slug}.md",
  "project_pack": "VallartaVoxVault/08_ProjectPacks/{date}-{slug}.md",
  "grammar_note": "VallartaVoxVault/09_Grammar/{slug}.md",
  "research_note": "VallartaVoxVault/11_Research/{date}-{slug}.md"
}
```

Atelier category mapping:

```ts
{
  "Borges": "Borges",
  "Neruda": "Neruda",
  "Cortazar": "Cortazar",
  "Paz": "Paz",
  "Rulfo": "Rulfo",
  "visual_art": "Art_Exhibits",
  "music": "Music",
  "film": "Film",
  "event": "Event_Finding",
  "yoga": "Yoga_Wellness",
  "history": "Murals_PV"
}
```

---

## GitHub Sync Service

Implement a backend service that can write generated Markdown notes to GitHub.

Environment variables:

```bash
GITHUB_TOKEN=
GITHUB_OWNER=warrenghaad
GITHUB_REPO=TripSpanishTutor
GITHUB_BRANCH=main
VAULT_ROOT=VallartaVoxVault
```

Functions:

```ts
async function commitMarkdownToVault(params: {
  path: string;
  markdown: string;
  message: string;
}): Promise<{ url: string; sha: string }>
```

```ts
async function readMarkdownFromVault(path: string): Promise<string>
```

```ts
async function listVaultFolder(path: string): Promise<Array<{
  path: string;
  sha: string;
  type: "file" | "dir";
}>>
```

```ts
async function upsertVaultNote(params: {
  objectType: CanonicalObjectType;
  object: any;
  commitMessage?: string;
}): Promise<{ path: string; url: string; sha: string }>
```

Important:
- Use GitHub Contents API.
- If file exists, include existing `sha` before updating.
- If file does not exist, create it.
- Commit messages should be semantic and readable.

Examples:
- `daily-prep: Galería Corsica ArtWalk 2026-05-14`
- `wordlens: pena-ajena`
- `analysis: debrief 2026-05-13`
- `atelier: Borges garden of forking paths scaffold`

---

## API Endpoints

Implement these REST endpoints.

### Chat

```http
POST /api/chat
```

Input:

```json
{
  "sessionId": "optional",
  "message": "How do I say I am just browsing warmly?",
  "context": {
    "modeHint": "online_while_out",
    "locationLabel": "bookstore",
    "activeProjectPackId": "optional",
    "activeDailyPrepId": "optional"
  }
}
```

Output:

```json
{
  "reply": "Puedes decir: Solo estoy mirando, gracias. ...",
  "inferredCapabilities": ["translator"],
  "nearbyDoors": [
    {"label": "Make it warmer", "capability": "translator"},
    {"label": "Bookstore small talk", "capability": "project_pack_builder"},
    {"label": "Spelunk mirar vs ver", "capability": "explorable_world"}
  ],
  "artifacts": []
}
```

### Save artifact

```http
POST /api/artifacts
```

Input:

```json
{
  "type": "word_lens_entry",
  "object": {}
}
```

Behavior:
1. Validate object.
2. Save to DB.
3. Serialize to Markdown.
4. Commit to GitHub vault.
5. Return DB id and GitHub path.

### Generate DailyPrep

```http
POST /api/daily-prep/generate
```

Input:

```json
{
  "outingDate": "2026-05-14",
  "placeType": "gallery",
  "locationName": "Galería Corsica / Puerto Vallarta ArtWalk",
  "goals": [
    "small talk",
    "art vocabulary",
    "ask about artists",
    "notice cultural context"
  ]
}
```

Output:
- Creates `daily_prep` DB row.
- Commits Markdown to `02_DailyPrep/`.
- Returns object + vault path.

### Debrief

```http
POST /api/debrief
```

Input:

```json
{
  "date": "2026-05-13",
  "rawOffload": "I went to a bookstore and froze when trying to ask...",
  "relatedProjectPackId": "optional",
  "relatedDailyPrepId": "optional"
}
```

Output:
- Saves `daily_debrief`.
- Generates `daily_analysis`.
- Creates promoted `word_lens_entry`, `trail`, or `project_pack` suggestions.
- Commits Markdown notes to vault.

### Vault Sync

```http
POST /api/vault/upsert
GET /api/vault/file?path=
GET /api/vault/list?path=
```

---

## LLM Router

Implement a router that infers capability before composing final output.

```ts
type Capability =
  | "translator"
  | "explorable_world"
  | "atelier"
  | "creative_writing_lab"
  | "debrief_analysis"
  | "project_pack_builder";
```

Router rules:

```ts
function inferCapabilities(message: string, context: any): Capability[] {
  // If user asks "how do I say", "what did they mean", "make this warmer"
  // => translator
  // If user asks "why", "etymology", "idiom", "grammar", "spelunk"
  // => explorable_world
  // If user mentions art, poetry, music, film, history, gallery, mural, bookstore
  // => atelier
  // If user asks rewrite, journal, paragraph, poetic, voice
  // => creative_writing_lab
  // If user describes what happened today / debrief / I froze / I needed
  // => debrief_analysis
  // If user says tomorrow / going to / plan / prepare / pack
  // => project_pack_builder
}
```

Composition law:
- Always answer immediate need first.
- If `translator` is present, begin with usable Spanish.
- If `explorable_world` is present, include concise WordLens-style depth.
- If `atelier` is present, include relevant cultural/literary/artistic resonance.
- If `creative_writing_lab` is present, preserve user voice.
- If `debrief_analysis` is present, generate structured analysis object.
- If `project_pack_builder` is present, generate or update ProjectPack.

Do not make the user choose a mode.

---

## LLM Prompt Files

Create these files:

```text
server/prompts/
  system.vallarta-vox.md
  capability.translator.md
  capability.explorable-world.md
  capability.atelier.md
  capability.creative-writing.md
  capability.debrief-analysis.md
  capability.project-pack-builder.md
  artifact-policy.md
```

### system.vallarta-vox.md

```markdown
You are Vallarta Vox, a translator-first expressive Spanish companion.

The user interacts through one chat surface. Do not require mode selection.

You have six internal capabilities:
1. Translator
2. Explorable World
3. Atelier
4. Creative Writing Lab
5. Debrief Analysis
6. ProjectPack Builder

Default to Translator when urgency or real-world speech is implied.

Always answer the immediate need first. Then, when useful, offer one or two nearby doors:
- grammar door
- etymology door
- cultural door
- phrase variant door
- writing door
- save-to-trail door

Do not grade, score, shame, or over-teach.
Do not flatten the user into a beginner.
Be beginner-aware but advanced-capable.
Preserve voice, dignity, curiosity, humor, and social courage.

When an artifact should be saved, output compact JSON matching the backend schemas.
```

---

## Validation

Add tests for:

1. `objectToMarkdown()` for each object type.
2. `markdownToObject()` preserves frontmatter and body.
3. `getVaultPath()` routes correctly.
4. `inferCapabilities()` detects common requests.
5. `upsertVaultNote()` creates path + commit payload correctly.
6. `/api/artifacts` saves DB row and generates Markdown.
7. `/api/daily-prep/generate` creates DailyPrep note.
8. `/api/debrief` creates DailyDebrief + DailyAnalysis.

---

## Build Order

Do this in order:

1. Create shared TypeScript types for all canonical objects.
2. Create DB schema / migrations.
3. Create Markdown serializer and parser.
4. Create vault path mapper.
5. Create GitHub sync service.
6. Create artifact API.
7. Create LLM router.
8. Create prompt files.
9. Create chat endpoint.
10. Create DailyPrep generator.
11. Create Debrief endpoint.
12. Add tests.

Do not start by overbuilding UI. Backend first.

---

## Definition of Done

Backend is acceptable when:

1. A chat message can infer capability.
2. A generated artifact can save to DB.
3. The same artifact can serialize to Markdown.
4. The Markdown note can commit to GitHub under the correct Obsidian folder.
5. Obsidian can pull the note and display readable YAML + Markdown.
6. A Markdown note can be parsed back into an object.
7. DailyPrep and DailyAnalysis are both working end-to-end.

The backend must match Obsidian. The app must stay one chat surface.
```

This is the right Replit direction because it makes the backend treat Obsidian as the durable workbook and schema mirror, while the app remains a single modular chat interface rather than drifting into a multi-screen dashboard. [perplexity](https://www.perplexity.ai/search/76b88060-0e1a-430f-90a0-311fc92d6359)
