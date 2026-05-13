---
id: vv-chat-20260513070000
type: chat_import
status: canonical
created: 2026-05-13
source_app: perplexity
chat_title: Vallarta Vox Constitution Chat
conversation_role:
  - design
  - content_generation
importance: high
app_area:
  - constitution
  - workflow
  - schemas
contains:
  - decisions
  - usable_specs
  - prompts
  - content_objects
extract_to:
  - schema
  - project_pack
  - prompt
tags:
  - vallarta-vox
  - constitution
  - canonical
  - chat-import
---

# Vallarta Vox Constitution Chat

## Source

- App: Perplexity
- Date: 2026-05-13
- Original upload: `Templates.swift` (despite the extension, this is a Perplexity chat export)
- Imported by: Claude Code, session `claude/obsidian-ai-build-forge-BSWYw`

## Why this matters

This chat is the canonical specification for the entire Vallarta Vox vault. It defines:

- the folder structure
- the universal YAML frontmatter
- the six core templates (`ChatImport`, `Trail`, `ProjectPack`, `DailyAnalysis`, `WordLensEntry`, `AtelierResource`)
- the capture-to-export automation workflow
- the vault instructions (the "Law" section)
- ten Priority-1 project packs as ready-to-drop JSON artifacts

Without this chat, every later note has nothing to be consistent with. Status `canonical` means: changes to this content must propagate everywhere downstream.

## Decisions

- `type` is the discriminator. Every important note becomes a typed object.
- Bear is mobile inbox, Obsidian is the source-of-truth vault.
- Six templates first; resist adding more until the workflow demands them.
- Mexican / neutral Latin American for travel; Rioplatense only as Borges / Cortázar context.
- "Do not let lived language disappear."

## Canon changes (already extracted into the vault)

- ✅ Six templates written to `12_Schemas/Templates/{ChatImport,Trail,ProjectPack,DailyAnalysis,WordLensEntry,AtelierResource}.md`.
- ✅ Universal frontmatter doc at `12_Schemas/Templates/_core_frontmatter.md`.
- ✅ Vault Instructions at `01_Constitution/Vallarta Vox Vault Instructions.md` (verbatim from §165-167 of the source).
- ✅ Ten Priority-1 scene packs saved to `08_ProjectPacks/01_Airport.json` … `10_RepairPhrases.json`.
- ✅ Scene-pack JSON schema at `12_Schemas/Templates/scene_pack.schema.json`.
- ✅ The LLM Output Contract (`01_Constitution/LLM Output Contract.md`) is the operational distillation of this chat plus the Workbook Architecture.
- ✅ The Research Axes taxonomy (a separate canonical artifact) is documented at `01_Constitution/Research Axes.md` and stored at `12_Schemas/research_axes_taxonomy.json`.

## Objects to extract

- [x] Trail — schemas defined; folder seeded
- [x] ProjectPack — 10 Priority-1 packs saved
- [x] DailyAnalysis — template + Day 1 instance
- [x] Prompt — Claude Code Prompt + Inbox Sorting prompt written
- [x] Schema — card.schema.json + scene_pack.schema.json
- [x] AtelierResource — template + Borges/Neruda/Cortázar/Magical Realism/Rioplatense Context seeds
- [x] WordLensEntry — template + converter script + seven seed entries

## Open questions

1. **Folder-tree drift.** The source folder tree in §11 numbers ProjectPacks=05, WordLens=07, Atelier=08, etc. The source's own 10 JSON packs declare `vault_path: 08_ProjectPacks/...`, which matches the current vault on disk. The two numbers conflict. Current canon: the JSON-aligned numbering on disk wins. If the §11 tree is the true target, a one-time renumbering pass would be needed (and would touch every JSON `vault_path`, the LLM Output Contract §1, the Inbox Sorting prompt, the Workbook Architecture, the Claude Code Prompt, and physical folder moves).
2. The source mentions `10_Scenarios/`, `11_Prompts/`, and `13_Exports/` which do not yet exist. They are currently absorbed by `08_ProjectPacks/` (scenes), `01_Constitution/` (prompts), and `dist/workbook/` (exports). Decide whether to create dedicated folders.
3. The source asks for "one constitution note, one vault_instructions note, and one schema_index note" extracted from this chat. Constitution and vault_instructions are done. The schema_index function is currently split across `12_Schemas/Templates/_core_frontmatter.md` and the LLM Output Contract — decide whether a single combined `Schema Index.md` is worth adding.

## Next action

- Hold question (1) for an explicit decision before any restructure.
- Treat this note as the immutable archive of the source chat.

## Raw chat

The full Perplexity export is included verbatim below. Formatting (collapsed single-line code blocks) is preserved from the source. The file was originally named `Templates.swift` by Perplexity's web export; despite the extension, it is a plain Markdown / text chat transcript with embedded JSON blocks.

```
//Use Obsidian as the canonical vault for structured app memory and Bear as fast mobile capture; the schemas should mirror Vallarta Vox’s core objects: Trail, ProjectPack, DailyAnalysis, AtelierResource, WordLensEntry, CreativeWritingLab, and ChatImport.Memory

Recommended setup

Use Obsidian as the source-of-truth vault because it supports Markdown files, YAML frontmatter, links, tags, folders, templates, and later export into JSON or app data. Use Bear as a quick-capture inbox on your phone, then periodically move or automate notes into Obsidian.

The vault should not just store notes. It should model the app canon: lived moments, language artifacts, trails, packs, debriefs, creative writing, cultural resources, and imported chats.Memory

text

VallartaVoxVault/   00_Inbox/   01_Constitution/   02_Daily/   03_Chats/   04_Trails/   05_ProjectPacks/   06_DailyAnalysis/   07_WordLens/   08_Atelier/   09_CreativeWritingLab/   10_Scenarios/   11_Prompts/   12_Schemas/   13_Exports/

This gives you one place to capture both project design and app-usable content.

Core frontmatter

Every note should share a small universal frontmatter block. Then each object type adds its own fields.

text

--- id: vv-{{date:YYYYMMDDHHmmss}} type: status: draft created: {{date:YYYY-MM-DD}} updated: {{date:YYYY-MM-DD}} source: source_app: language: tags: [] links: [] related_trails: [] related_project_packs: [] related_daily_analysis: [] app_relevance: ---

Use type as the main discriminator. Suggested values:

text

type: constitution type: chat_import type: trail type: project_pack type: daily_analysis type: word_lens_entry type: atelier_resource type: creative_writing_piece type: scenario type: phrase_card type: prompt type: research_note

The reason this matters: later you can query, export, or ingest notes by type instead of treating the vault as a pile of prose.

Main schemas

Chat import

Use this for Perplexity, Claude, ChatGPT, or project chats that need to be preserved and mined.

text

--- id: vv-chat-{{date:YYYYMMDDHHmmss}} type: chat_import status: unprocessed created: {{date:YYYY-MM-DD}} source_app: perplexity chat_title: conversation_role:   - design   - research   - build   - debrief   - content_generation importance: high app_area:   - constitution   - workflow   - atelier   - chat_modes   - schemas contains:   - decisions   - open_questions   - usable_specs   - prompts   - content_objects extract_to:   - trail   - project_pack   - daily_analysis   - prompt   - schema tags:   - vallarta-vox   - chat-import ---

Body template:

text

# {{title}}  ## Source - App: - Date: - Link: - Imported by:  ## Why this matters One sentence on why this chat is worth preserving.  ## Raw chat Paste full or partial chat here.  ## Decisions -   ## Canon changes -   ## Objects to extract - [ ] Trail - [ ] ProjectPack - [ ] DailyAnalysis - [ ] Prompt - [ ] Schema - [ ] AtelierResource - [ ] WordLensEntry  ## Open questions -   ## Next action -

Trail

Use this for rabbit holes, language spelunking, and explorations.

text

--- id: vv-trail-{{date:YYYYMMDDHHmmss}} type: trail status: active created: {{date:YYYY-MM-DD}} title: trail_kind:   - language   - cultural   - literary   - social   - travel   - emotional origin: trigger: nodes: [] edges: [] saved_phrases: [] saved_words: [] questions: [] nearby_doors: [] related_chats: [] related_project_packs: [] tags:   - vallarta-vox   - trail ---

Body:

text

# Trail: {{title}}  ## Origin What started this rabbit hole?  ## Nodes visited -   ## Edges followed -   ## Saved words - Spanish: - English: - Note:  ## Saved phrases -   ## Questions -   ## Nearby doors -   ## Summary What this trail taught or opened.  ## Promote - [ ] WordLens - [ ] ProjectPack - [ ] AtelierResource - [ ] CreativeWritingLab - [ ] Scenario

ProjectPack

Use this before an outing.

text

--- id: vv-pack-{{date:YYYYMMDDHHmmss}} type: project_pack status: planned created: {{date:YYYY-MM-DD}} outing_date: place_type: location: purpose: [] tone: [] social_goals: [] emotional_needs: [] likely_scenarios: [] cached_vocab: [] cached_grammar: [] likely_phrases: [] likely_replies: [] fallbacks: [] related_trails: [] related_daily_analysis: [] atelier_resources: [] tags:   - vallarta-vox   - project-pack ---

Body:

text

# ProjectPack: {{outing_date}} — {{place_type}}  ## Situation Where am I going, and why?  ## Social intention What do I want to be able to do with people?  ## Emotional support What might be hard?  ## Useful vocabulary -   ## Useful grammar -   ## Likely phrases | English function | Spanish | Register | |---|---|---| |  |  |  |  ## Likely replies I may hear -   ## Fallback phrases -   ## Atelier material Poetry, art, music, history, or cultural resources that could enrich this outing.  ## Offline cache priority - [ ] Must have - [ ] Nice to have - [ ] Queue for later

DailyAnalysis

Use this after the day.

text

--- id: vv-analysis-{{date:YYYYMMDDHHmmss}} type: daily_analysis status: processed created: {{date:YYYY-MM-DD}} analysis_date: related_project_pack: related_trails: [] places: [] people_context: [] actual_needs: [] missed_translations: [] heard_phrases: [] repair_moments: [] emotional_patterns: [] promote_to_next_pack: [] promote_to_wordlens: [] promote_to_atelier: [] tags:   - vallarta-vox   - daily-analysis ---

Body:

text

# DailyAnalysis: {{analysis_date}}  ## Raw offload Write messy English, Spanish fragments, scenes, feelings, failures, wins.  ## What actually mattered -   ## Things I needed to say -   ## Things I heard -   ## Where I froze or repaired -   ## Vocabulary that mattered -   ## Grammar that would have helped -   ## Social / emotional notes -   ## Atelier connections Art, music, literature, history, or cultural moments that became relevant.  ## Promote forward - [ ] Next ProjectPack - [ ] WordLens - [ ] Trail - [ ] Creative writing prompt - [ ] Scenario drill

AtelierResource

Use this for Latino art, literature, history, music, poetry, and beautiful Spanish.

text

--- id: vv-atelier-{{date:YYYYMMDDHHmmss}} type: atelier_resource status: draft created: {{date:YYYY-MM-DD}} medium:   - poetry   - prose   - visual_art   - music   - history   - film   - architecture creator: title: region: period: copyright_status: language_focus: [] cultural_focus: [] conversation_use: [] field_use: [] writing_use: [] related_trails: [] related_project_packs: [] tags:   - vallarta-vox   - atelier ---

Body:

text

# AtelierResource: {{title}}  ## What it is Brief description.  ## Why it belongs How this helps Spanish become lived, beautiful, social, or expressive.  ## Language focus - Vocabulary: - Grammar: - Register: - Useful phrases:  ## Conversation use How could I talk about this in Spanish?  ## Field use Where might this matter while traveling?  ## Writing use How could this become a journal or creative-writing prompt?  ## Copyright-safe scaffold Do not paste copyrighted full text. Use summary, vocabulary, prompts, and notes.  ## Prompts - Describe what you notice first. - Say what feeling it gives you. - Ask someone about it naturally.

WordLensEntry

Use this for words, phrases, idioms, grammar particles, and high-value expressions.

text

--- id: vv-word-{{date:YYYYMMDDHHmmss}} type: word_lens_entry status: active created: {{date:YYYY-MM-DD}} spanish: english: lemma: part_of_speech: register: region: difficulty: source_context: related_words: [] synonyms: [] antonyms: [] phrases: [] grammar_notes: [] etymology: related_trails: [] tags:   - vallarta-vox   - wordlens ---

Body:

text

# WordLens: {{spanish}}  ## Meaning Plain meaning.  ## Natural use How people actually use it.  ## Register Formal, neutral, warm, slang, poetic, regional, etc.  ## Examples | Spanish | English function | Context | |---|---|---| |  |  |  |  ## Grammar What pattern does this teach?  ## Etymology / associations Optional.  ## Nearby doors -

Automation workflow

Start simple: Bear is your mobile inbox, Obsidian is the vault, and LLM chats get imported as chat_import notes.

text

Capture → Inbox → Classify → Extract → Link → Export

Practical version:





Capture raw notes in Bear when walking, tired, or offline.



At night, move the note into Obsidian 00_Inbox.



Apply one template: DailyAnalysis, Trail, WordLensEntry, or ChatImport.



Extract structured objects from the raw text.



Link objects using related_trails, related_project_packs, and wiki links.



Export selected notes later into JSON for the app.

For automation on iPhone, the likely path is Apple Shortcuts: share text from Bear, Perplexity, Claude, or ChatGPT into a new Markdown file in your Obsidian vault folder. Even if automation is imperfect, the schema makes cleanup fast.

Vault instructions

Create one note called:

text

01_Constitution/Vallarta Vox Vault Instructions.md

Paste this:

text

--- id: vv-vault-instructions type: vault_instructions status: canonical created: 2026-05-13 tags:   - vallarta-vox   - vault   - canon ---  # Vallarta Vox Vault Instructions  This vault is the source-of-truth workspace for Vallarta Vox / TripSpanishTutor.  The vault stores: - app canon - chats - design decisions - trails - project packs - daily analyses - WordLens entries - atelier resources - creative writing pieces - scenarios - prompts - schemas - exports  ## Law  Do not treat notes as generic notes. Every important note should become an object.  Use `type` in YAML frontmatter to classify the object.  Core types: - `chat_import` - `trail` - `project_pack` - `daily_analysis` - `word_lens_entry` - `atelier_resource` - `creative_writing_piece` - `scenario` - `prompt` - `constitution`  ## Workflow  1. Capture raw material quickly. 2. Preserve the source. 3. Classify the note. 4. Extract decisions and objects. 5. Link related notes. 6. Promote useful material into app-ready schemas.  ## Principle  Do not let lived language disappear.  A phrase needed in real life, a question asked while traveling, a social repair, a word noticed, an artwork loved, a song heard, or a chat decision should become durable app memory.

Minimal templates first

Do not build twenty templates immediately. Start with these six:

text

12_Schemas/Templates/   ChatImport.md   Trail.md   ProjectPack.md   DailyAnalysis.md   WordLensEntry.md   AtelierResource.md

These six cover your real workflow: import the chat, preserve the trail, prepare the outing, debrief the day, save the language, and keep the cultural atelier alive.Memory

Next build step

Your next move should be to create the folder structure and six templates in Obsidian, then import this constitution chat as the first chat_import note. Mark it status: canonical and extract from it one constitution note, one vault_instructions note, and one schema_index note.

If you want the fastest practical setup, paste this as the first note title:

text

03_Chats/2026-05-13 - Vallarta Vox Constitution Chat.md

Then use the ChatImport frontmatter and tag it:

text

tags:   - vallarta-vox   - constitution   - canonical   - chat-import

That gives you an immediate anchor for the vault and prevents the design thread from disappearing into chat history.these are build priority #1's jsons: No existing travel packs found. I'll build the full Priority 1 travel pack set now — all 10 scene categories — as structured JSON artifacts ready to drop into `08_ProjectPacks/`.

***

## Priority 1: Travel Packs — Full Build

Below are all 10 scene packs. Each pack contains `scenelet`, `phrase_card`, `authority_exchange`, and `register_map` objects.

***

### ✈️ Pack 01: Airport



{
  "pack": "airport",
  "vault_path": "08_ProjectPacks/01_Airport.json",
  "scenelets": [
    {
      "type": "scenelet",
      "id": "airport_checkin",
      "scene": "Checking in at the counter",
      "phrases": [
        { "es": "Quisiera facturar esta maleta.", "en": "I'd like to check this bag." },
        { "es": "¿Hay cargo por exceso de equipaje?", "en": "Is there a fee for overweight baggage?" },
        { "es": "¿Puedo elegir asiento de ventana?", "en": "Can I choose a window seat?" },
        { "es": "Aquí tiene mi pasaporte.", "en": "Here is my passport." }
      ],
      "register": "formal-neutral",
      "notes": "Use usted with counter staff. Smile first — Mexicans read warmth before words."
    },
    {
      "type": "scenelet",
      "id": "airport_security",
      "scene": "Going through security",
      "phrases": [
        { "es": "¿Necesito quitarme los zapatos?", "en": "Do I need to take off my shoes?" },
        { "es": "Tengo una laptop en la mochila.", "en": "I have a laptop in my backpack." },
        { "es": "¿Adónde va esta fila?", "en": "Where does this line go?" }
      ],
      "register": "neutral",
      "notes": "Short, clear sentences. Do not over-explain. Officers are task-focused."
    },
    {
      "type": "scenelet",
      "id": "airport_gate",
      "scene": "At the gate / boarding",
      "phrases": [
        { "es": "¿Ya están abordando?", "en": "Are they boarding yet?" },
        { "es": "¿Cuál es la puerta de salida?", "en": "What is the departure gate?" },
        { "es": "¿Hay retraso?", "en": "Is there a delay?" },
        { "es": "Perdón, ¿este asiento está ocupado?", "en": "Excuse me, is this seat taken?" }
      ],
      "register": "neutral",
      "notes": "Gate agents switch to English easily — stay in Spanish anyway for practice."
    }
  ],
  "phrase_cards": [
    { "es": "vuelo", "en": "flight", "lemma": "vuelo", "notes": "el vuelo — noun" },
    { "es": "sala de espera", "en": "waiting area / lounge", "lemma": "sala", "notes": "" },
    { "es": "tarjeta de embarque", "en": "boarding pass", "lemma": "tarjeta", "notes": "also: pase de abordar (Mexico)" },
    { "es": "equipaje de mano", "en": "carry-on luggage", "lemma": "equipaje", "notes": "" },
    { "es": "escala", "en": "layover / stopover", "lemma": "escala", "notes": "hacer escala = to have a layover" },
    { "es": "aduanas", "en": "customs", "lemma": "aduanas", "notes": "see also Pack 02" }
  ],
  "authority_exchange": {
    "type": "authority_exchange",
    "id": "airport_lost_bag",
    "scenario": "Lost bag at baggage claim",
    "lines": [
      { "role": "learner", "es": "Disculpe, mi maleta no apareció.", "en": "Excuse me, my bag didn't come out." },
      { "role": "agent", "es": "¿Tiene el talón de equipaje?", "en": "Do you have your baggage claim tag?" },
      { "role": "learner", "es": "Sí, aquí está. Vuelo de la Ciudad de México.", "en": "Yes, here it is. Flight from Mexico City." },
      { "role": "agent", "es": "Vamos a buscarlo en el sistema.", "en": "We'll look for it in the system." },
      { "role": "learner", "es": "Gracias, ¿cuánto tiempo puede tardar?", "en": "Thank you, how long might it take?" }
    ],
    "register_note": "Stay calm, use usted, avoid humor in this context — convey competence."
  },
  "register_map": {
    "type": "register_map",
    "context": "Airport (Mexico)",
    "formal_triggers": ["customs officer", "airline counter staff", "security personnel"],
    "neutral_triggers": ["fellow passengers", "gate agents", "airport shops"],
    "informal_triggers": ["taxi driver waiting outside — see Pack 04"],
    "key_courtesy_phrase": "Con permiso. (Excuse me / May I pass.)",
    "regional_note": "Mexican airports favor indirect politeness. Demanding tone lands badly even if grammatically correct."
  }
}







***

### 🛂 Pack 02: Immigration & Customs



{
  "pack": "immigration_customs",
  "vault_path": "08_ProjectPacks/02_Immigration_Customs.json",
  "scenelets": [
    {
      "type": "scenelet",
      "id": "immigration_officer",
      "scene": "At the immigration window",
      "phrases": [
        { "es": "Vengo por turismo.", "en": "I'm here as a tourist." },
        { "es": "Me voy a quedar dos semanas.", "en": "I'm staying two weeks." },
        { "es": "Me hospedo en un hotel en el centro.", "en": "I'm staying at a hotel downtown." },
        { "es": "Aquí está mi forma migratoria.", "en": "Here is my immigration form." }
      ],
      "register": "formal",
      "notes": "Answer only what is asked. Short, factual sentences. Officers are not interested in personality here."
    },
    {
      "type": "scenelet",
      "id": "customs_declaration",
      "scene": "Customs declaration",
      "phrases": [
        { "es": "No traigo nada que declarar.", "en": "I have nothing to declare." },
        { "es": "Traigo algunos regalos personales.", "en": "I'm carrying some personal gifts." },
        { "es": "¿Puedo pasar?", "en": "May I pass?" },
        { "es": "¿Qué se necesita declarar?", "en": "What do I need to declare?" }
      ],
      "register": "formal",
      "notes": "The red/green light system: verde = go through, rojo = inspection. Prepare for rojo calmly."
    }
  ],
  "phrase_cards": [
    { "es": "pasaporte", "en": "passport", "lemma": "pasaporte" },
    { "es": "turismo", "en": "tourism / tourist visit", "lemma": "turismo" },
    { "es": "declarar", "en": "to declare", "lemma": "declarar", "notes": "no tengo nada que declarar" },
    { "es": "visa / visado", "en": "visa", "lemma": "visa", "notes": "Mexico uses visa; Spain uses visado" },
    { "es": "aduana", "en": "customs", "lemma": "aduana" },
    { "es": "migración", "en": "immigration", "lemma": "migración" },
    { "es": "permiso de entrada", "en": "entry permit", "lemma": "permiso" }
  ],
  "authority_exchange": {
    "type": "authority_exchange",
    "id": "customs_bag_check",
    "scenario": "Random bag inspection at customs",
    "lines": [
      { "role": "officer", "es": "¿Puede abrir su maleta, por favor?", "en": "Can you open your suitcase, please?" },
      { "role": "learner", "es": "Claro que sí.", "en": "Of course." },
      { "role": "officer", "es": "¿Qué trae aquí?", "en": "What do you have here?" },
      { "role": "learner", "es": "Ropa, artículos personales, y algunos libros.", "en": "Clothes, personal items, and some books." },
      { "role": "officer", "es": "Está bien. Puede pasar.", "en": "That's fine. You may go." }
    ],
    "register_note": "Never joke at customs. Calm cooperation reads as respect."
  },
  "register_map": {
    "type": "register_map",
    "context": "Immigration & Customs (Mexico)",
    "formal_triggers": ["all uniformed officials"],
    "key_repair_phrase": "No entendí bien. ¿Podría repetirlo, por favor? (I didn't understand well. Could you repeat that, please?)",
    "regional_note": "Mexico City (Benito Juárez) and Puerto Vallarta (Gustavo Díaz Ordaz) immigration officers are generally professional and accustomed to tourists. Patience and calm work well."
  }
}







***

### 🚕 Pack 03: Taxi



{
  "pack": "taxi",
  "vault_path": "08_ProjectPacks/03_Taxi.json",
  "scenelets": [
    {
      "type": "scenelet",
      "id": "taxi_hail",
      "scene": "Getting into a taxi",
      "phrases": [
        { "es": "¿Está libre?", "en": "Are you free / available?" },
        { "es": "¿Me lleva al centro, por favor?", "en": "Can you take me downtown, please?" },
        { "es": "¿Cuánto cobra hasta el Malecón?", "en": "How much do you charge to the Malecón?" },
        { "es": "¿Usa taxímetro o precio fijo?", "en": "Do you use a meter or a fixed price?" }
      ],
      "register": "informal-warm",
      "notes": "Puerto Vallarta taxis often use fixed zones. Confirm price before you get in. Friendly tone opens negotiation."
    },
    {
      "type": "scenelet",
      "id": "taxi_en_route",
      "scene": "During the ride — small talk",
      "phrases": [
        { "es": "¿Hace mucho que trabaja aquí?", "en": "Have you been working here long?" },
        { "es": "¿De dónde es usted?", "en": "Where are you from?" },
        { "es": "Es mi primera vez en Vallarta.", "en": "It's my first time in Vallarta." },
        { "es": "¿Qué recomienda para cenar?", "en": "What do you recommend for dinner?" }
      ],
      "register": "informal-warm",
      "notes": "Taxi drivers are an excellent local intelligence source. They know events, restaurants, and what to avoid. Curiosity lands well."
    },
    {
      "type": "scenelet",
      "id": "taxi_arrival",
      "scene": "Paying and getting out",
      "phrases": [
        { "es": "Aquí está bien, gracias.", "en": "Here is fine, thanks." },
        { "es": "¿Tiene cambio de doscientos?", "en": "Do you have change for two hundred?" },
        { "es": "Quédese con el cambio.", "en": "Keep the change." },
        { "es": "Fue un placer. ¡Hasta luego!", "en": "It was a pleasure. Goodbye!" }
      ],
      "register": "informal-warm",
      "notes": "Tipping taxi drivers is not obligatory in Mexico but appreciated. Rounding up or 'quédese con el cambio' is graceful."
    }
  ],
  "phrase_cards": [
    { "es": "taxímetro", "en": "taxi meter", "lemma": "taxímetro" },
    { "es": "el cambio", "en": "change (money)", "lemma": "cambio" },
    { "es": "la vuelta", "en": "change (money, colloquial Mexico)", "lemma": "vuelta", "notes": "more common than 'cambio' in PV" },
    { "es": "el Malecón", "en": "the seafront boardwalk (PV landmark)", "lemma": "malecón" },
    { "es": "la zona romántica", "en": "Romantic Zone (PV neighborhood)", "lemma": "zona" },
    { "es": "me lleva", "en": "take me (literally: carry me)", "lemma": "llevar", "notes": "muy mexicano — use it" }
  ],
  "authority_exchange": {
    "type": "authority_exchange",
    "id": "taxi_negotiation",
    "scenario": "Driver quotes high price",
    "lines": [
      { "role": "driver", "es": "Son trescientos pesos.", "en": "That's three hundred pesos." },
      { "role": "learner", "es": "¿No puede ser un poco menos? Vi que la zona vale doscientos.", "en": "Could it be a little less? I saw the zone price is two hundred." },
      { "role": "driver", "es": "Bueno, doscientos cincuenta.", "en": "Okay, two-fifty." },
      { "role": "learner", "es": "Trato hecho.", "en": "Deal." }
    ],
    "register_note": "Tone matters more than grammar here. Calm, amused, not aggressive. Mexicans respond to dignified negotiation."
  },
  "register_map": {
    "type": "register_map",
    "context": "Taxi (Puerto Vallarta)",
    "formal_triggers": ["airport authorized taxi booths"],
    "informal_triggers": ["street hails", "ride-share-style apps"],
    "key_safety_note": "Use Uber or official airport taxi stands when arriving late. Confirm you're in the right taxi — check plate or app match.",
    "warmth_move": "Compliment the music or say 'qué bonita ciudad' — opens drivers up."
  }
}







***

### 🏨 Pack 04: Hotel



{
  "pack": "hotel",
  "vault_path": "08_ProjectPacks/04_Hotel.json",
  "scenelets": [
    {
      "type": "scenelet",
      "id": "hotel_checkin",
      "scene": "Checking in at the front desk",
      "phrases": [
        { "es": "Tengo una reservación a nombre de...", "en": "I have a reservation under the name of..." },
        { "es": "¿A qué hora es el check-out?", "en": "What time is check-out?" },
        { "es": "¿Está incluido el desayuno?", "en": "Is breakfast included?" },
        { "es": "¿Hay wifi en la habitación?", "en": "Is there wifi in the room?" },
        { "es": "¿Me puede dar una habitación con vista al mar?", "en": "Can I have a room with an ocean view?" }
      ],
      "register": "formal-neutral",
      "notes": "Hotel front desks in PV are accustomed to English, but Spanish earns warmth and occasional upgrades."
    },
    {
      "type": "scenelet",
      "id": "hotel_problem",
      "scene": "Reporting a problem in the room",
      "phrases": [
        { "es": "El aire acondicionado no funciona.", "en": "The air conditioning isn't working." },
        { "es": "No hay agua caliente.", "en": "There's no hot water." },
        { "es": "¿Pueden mandar a alguien a revisarlo?", "en": "Can you send someone to check it?" },
        { "es": "¿Me pueden cambiar de habitación?", "en": "Can I be moved to another room?" }
      ],
      "register": "formal-neutral",
      "notes": "Use the subjunctive mandar / cambiar forms when making requests — they signal politeness naturally."
    },
    {
      "type": "scenelet",
      "id": "hotel_checkout",
      "scene": "Checking out",
      "phrases": [
        { "es": "Quisiera hacer el check-out.", "en": "I'd like to check out." },
        { "es": "¿Puede revisar la cuenta?", "en": "Could you review the bill?" },
        { "es": "Creo que hay un cargo equivocado.", "en": "I think there's an incorrect charge." },
        { "es": "¿Pueden guardar mi maleta unas horas?", "en": "Can you hold my bag for a few hours?" }
      ],
      "register": "formal-neutral"
    }
  ],
  "phrase_cards": [
    { "es": "habitación", "en": "room", "lemma": "habitación" },
    { "es": "recepción", "en": "front desk / reception", "lemma": "recepción" },
    { "es": "llave / tarjeta de acceso", "en": "key / key card", "lemma": "llave" },
    { "es": "toallas", "en": "towels", "lemma": "toalla" },
    { "es": "almohada", "en": "pillow", "lemma": "almohada" },
    { "es": "el cargo", "en": "the charge (on a bill)", "lemma": "cargo" },
    { "es": "servicio a la habitación", "en": "room service", "lemma": "servicio" }
  ],
  "authority_exchange": {
    "type": "authority_exchange",
    "id": "hotel_billing_dispute",
    "scenario": "Disputing a charge at checkout",
    "lines": [
      { "role": "learner", "es": "Disculpe, veo un cargo de quinientos pesos que no reconozco.", "en": "Excuse me, I see a charge of five hundred pesos I don't recognize." },
      { "role": "staff", "es": "Un momento, lo reviso. ¿Fue del minibar?", "en": "One moment, I'll check. Was it from the minibar?" },
      { "role": "learner", "es": "No usé el minibar. Estoy seguro.", "en": "I didn't use the minibar. I'm sure of it." },
      { "role": "staff", "es": "Tiene razón, fue un error. Lo eliminamos.", "en": "You're right, it was an error. We'll remove it." }
    ],
    "register_note": "Stay confident but not aggressive. 'Estoy seguro' (I'm sure) carries weight without hostility."
  },
  "register_map": {
    "type": "register_map",
    "context": "Hotel (Puerto Vallarta)",
    "formal_triggers": ["front desk", "concierge", "billing"],
    "informal_triggers": ["pool staff", "bellhop small talk"],
    "warmth_move": "Saying 'muy amables' (so kind) or 'qué buena atención' (great service) to staff creates loyalty for your whole stay."
  }
}







***

### 🍽️ Pack 05: Restaurant



{
  "pack": "restaurant",
  "vault_path": "08_ProjectPacks/05_Restaurant.json",
  "scenelets": [
    {
      "type": "scenelet",
      "id": "restaurant_arrival",
      "scene": "Arriving and being seated",
      "phrases": [
        { "es": "¿Tiene mesa para dos personas?", "en": "Do you have a table for two?" },
        { "es": "Tenemos reservación.", "en": "We have a reservation." },
        { "es": "¿Podemos sentarnos afuera?", "en": "Can we sit outside?" },
        { "es": "¿Cuánto tiempo de espera hay?", "en": "How long is the wait?" }
      ],
      "register": "neutral-warm"
    },
    {
      "type": "scenelet",
      "id": "restaurant_ordering",
      "scene": "Ordering food and drink",
      "phrases": [
        { "es": "¿Qué recomienda usted?", "en": "What do you recommend?" },
        { "es": "¿Cuál es el platillo del día?", "en": "What's the dish of the day?" },
        { "es": "Voy a pedir el pescado.", "en": "I'll have the fish." },
        { "es": "¿Me puede traer la carta de vinos?", "en": "Could you bring me the wine list?" },
        { "es": "Sin picante, por favor.", "en": "Without spice, please." },
        { "es": "¿Tiene opciones vegetarianas?", "en": "Do you have vegetarian options?" }
      ],
      "register": "neutral-warm",
      "notes": "Asking '¿qué recomienda?' is not just practical — it's a social invitation. Servers often light up."
    },
    {
      "type": "scenelet",
      "id": "restaurant_bill",
      "scene": "Paying the bill",
      "phrases": [
        { "es": "La cuenta, por favor.", "en": "The check, please." },
        { "es": "¿Está incluido el servicio?", "en": "Is service included?" },
        { "es": "¿Puedo pagar con tarjeta?", "en": "Can I pay by card?" },
        { "es": "Estuvo delicioso.", "en": "It was delicious." }
      ],
      "register": "neutral-warm",
      "notes": "In Mexico, 'propina' (tip) of 10–15% is standard. 'Estuvo delicioso' at the end is a small gift to the staff."
    }
  ],
  "phrase_cards": [
    { "es": "la carta / el menú", "en": "the menu", "lemma": "carta", "notes": "Both used; carta is more traditional" },
    { "es": "el platillo", "en": "the dish / plate", "lemma": "platillo", "notes": "Mexican preference; not 'plato'" },
    { "es": "la cuenta", "en": "the bill", "lemma": "cuenta" },
    { "es": "la propina", "en": "the tip", "lemma": "propina" },
    { "es": "picante", "en": "spicy", "lemma": "picante" },
    { "es": "sin / con", "en": "without / with", "lemma": "sin/con", "notes": "Core modifier pair — sin gluten, con limón, etc." },
    { "es": "para llevar", "en": "to go / takeaway", "lemma": "llevar" },
    { "es": "de lo mismo", "en": "the same again", "lemma": "mismo", "notes": "When reordering a drink — social and fluent" }
  ],
  "authority_exchange": {
    "type": "authority_exchange",
    "id": "restaurant_wrong_order",
    "scenario": "Wrong dish arrives",
    "lines": [
      { "role": "learner", "es": "Perdón, creo que se equivocaron. Yo pedí el camarón, no el pollo.", "en": "Excuse me, I think there's a mix-up. I ordered shrimp, not chicken." },
      { "role": "server", "es": "Mil disculpas, ahorita se lo traigo.", "en": "I'm so sorry, I'll bring it right away." },
      { "role": "learner", "es": "No hay prisa, gracias.", "en": "No rush, thank you." }
    ],
    "register_note": "'No hay prisa' (no rush) is a gracious power move — it de-escalates and signals ease."
  },
  "register_map": {
    "type": "register_map",
    "context": "Restaurant (Mexico / Puerto Vallarta)",
    "formal_triggers": ["fine dining", "hotel restaurants"],
    "informal_triggers": ["taquerías", "street food", "fondas"],
    "street_food_note": "At a taquería: '¿Cuánto es?' (How much is it?) and 'uno de pastor' (one pastor taco) are all you need.",
    "warmth_move": "Complimenting a specific dish by name ('el ceviche estuvo increíble') is remembered."
  }
}







***

### 🗺️ Pack 06: Directions



{
  "pack": "directions",
  "vault_path": "08_ProjectPacks/06_Directions.json",
  "scenelets": [
    {
      "type": "scenelet",
      "id": "directions_ask",
      "scene": "Asking for directions",
      "phrases": [
        { "es": "Disculpe, ¿sabe cómo llegar al Malecón?", "en": "Excuse me, do you know how to get to the Malecón?" },
        { "es": "¿Está lejos de aquí?", "en": "Is it far from here?" },
        { "es": "¿Puedo ir caminando?", "en": "Can I walk there?" },
        { "es": "¿Me puede repetir eso más despacio?", "en": "Could you repeat that more slowly?" }
      ],
      "register": "neutral",
      "notes": "Mexicans give directions generously but sometimes with landmark-based references ('junto a la farmacia', 'frente al banco') rather than street names."
    },
    {
      "type": "scenelet",
      "id": "directions_receive",
      "scene": "Understanding directions given to you",
      "key_vocabulary": [
        { "es": "a la derecha", "en": "to the right" },
        { "es": "a la izquierda", "en": "to the left" },
        { "es": "recto / derecho", "en": "straight ahead" },
        { "es": "a dos cuadras", "en": "two blocks away" },
        { "es": "en la esquina", "en": "on the corner" },
        { "es": "cruzando la calle", "en": "across the street" },
        { "es": "frente a", "en": "in front of / across from" },
        { "es": "junto a", "en": "next to" },
        { "es": "detrás de", "en": "behind" }
      ],
      "repair_phrase": "Perdón, ¿puede señalar en el mapa? (Can you point on the map?)"
    }
  ],
  "phrase_cards": [
    { "es": "cuadra", "en": "city block", "lemma": "cuadra", "notes": "Mexico: cuadra. Spain: manzana." },
    { "es": "esquina", "en": "corner (of street)", "lemma": "esquina" },
    { "es": "semáforo", "en": "traffic light", "lemma": "semáforo", "notes": "Key landmark word for directions" },
    { "es": "cruce / crucero", "en": "intersection", "lemma": "cruce" },
    { "es": "subir / bajar", "en": "go up / go down (hills)", "lemma": "subir/bajar", "notes": "PV is hilly — these come up a lot" }
  ],
  "register_map": {
    "type": "register_map",
    "context": "Directions (Puerto Vallarta)",
    "informal_triggers": ["any pedestrian, shop owner, local"],
    "pv_note": "Puerto Vallarta is organized around the Malecón (waterfront) as the main orientation axis. 'Hacia el mar' (toward the sea) and 'hacia la sierra' (toward the mountains) are useful cardinal substitutes.",
    "repair_phrase": "No encontré la calle. ¿Hay otra referencia? (I couldn't find the street. Is there another landmark?)"
  }
}







***

### 🚨 Pack 07: Emergency Help



{
  "pack": "emergency",
  "vault_path": "08_ProjectPacks/07_Emergency.json",
  "scenelets": [
    {
      "type": "scenelet",
      "id": "emergency_medical",
      "scene": "Medical emergency",
      "phrases": [
        { "es": "¡Necesito ayuda!", "en": "I need help!" },
        { "es": "Llame a una ambulancia, por favor.", "en": "Please call an ambulance." },
        { "es": "Me duele mucho aquí.", "en": "It hurts a lot here." },
        { "es": "Soy alérgico/a a la penicilina.", "en": "I'm allergic to penicillin." },
        { "es": "¿Dónde está el hospital más cercano?", "en": "Where is the nearest hospital?" },
        { "es": "Necesito un médico.", "en": "I need a doctor." }
      ],
      "register": "urgent-clear",
      "notes": "Short, declarative. Skip pleasantries. Speed matters."
    },
    {
      "type": "scenelet",
      "id": "emergency_police",
      "scene": "Reporting a theft or problem to police",
      "phrases": [
        { "es": "Me robaron la cartera.", "en": "My wallet was stolen." },
        { "es": "Me robaron el teléfono.", "en": "My phone was stolen." },
        { "es": "¿Dónde está la delegación más cercana?", "en": "Where is the nearest police station?" },
        { "es": "Necesito hacer una denuncia.", "en": "I need to file a report." },
        { "es": "¿Puede ayudarme, por favor?", "en": "Can you help me, please?" }
      ],
      "register": "formal-urgent"
    }
  ],
  "phrase_cards": [
    { "es": "socorro", "en": "help (urgent cry)", "lemma": "socorro", "notes": "More urgent than 'ayuda' in true emergency" },
    { "es": "auxilio", "en": "help / assistance (urgent)", "lemma": "auxilio" },
    { "es": "urgencias", "en": "emergency room", "lemma": "urgencias" },
    { "es": "la cruz roja", "en": "the Red Cross", "lemma": "cruz" },
    { "es": "una denuncia", "en": "a police report", "lemma": "denuncia" },
    { "es": "el seguro", "en": "insurance", "lemma": "seguro" }
  ],
  "emergency_numbers": {
    "mexico_general": "911",
    "puerto_vallarta_police": "322-290-0513",
    "red_cross_pv": "322-222-1533",
    "tourist_assistance_pv": "078"
  },
  "register_map": {
    "type": "register_map",
    "context": "Emergency (Mexico)",
    "key_note": "911 is now unified in Mexico for police, fire, and ambulance. Say your location clearly first.",
    "location_phrase": "Estoy en [street/landmark], en Puerto Vallarta. (I'm at [location], in Puerto Vallarta.)"
  }
}







***

### 💬 Pack 08: Small Talk



{
  "pack": "small_talk",
  "vault_path": "08_ProjectPacks/08_SmallTalk.json",
  "scenelets": [
    {
      "type": "scenelet",
      "id": "smalltalk_greetings",
      "scene": "Opening exchanges — greetings",
      "phrases": [
        { "es": "¿Cómo le va?", "en": "How's it going? (formal)" },
        { "es": "¿Qué tal?", "en": "How's it going? (informal)" },
        { "es": "¿Cómo está usted?", "en": "How are you? (formal)" },
        { "es": "Mucho gusto en conocerle.", "en": "A pleasure to meet you." },
        { "es": "¿De dónde es usted?", "en": "Where are you from?" },
        { "es": "Soy de los Estados Unidos.", "en": "I'm from the United States." }
      ],
      "register": "neutral-warm",
      "notes": "Mexican greetings are warm and often physical — handshakes, cheek kisses in casual contexts. Match the energy of your interlocutor."
    },
    {
      "type": "scenelet",
      "id": "smalltalk_weather_place",
      "scene": "Talking about weather and place",
      "phrases": [
        { "es": "¡Qué calor hace hoy!", "en": "It's so hot today!" },
        { "es": "Me encanta este lugar.", "en": "I love this place." },
        { "es": "Es la primera vez que vengo a Vallarta.", "en": "It's my first time coming to Vallarta." },
        { "es": "¿Cuánto tiempo lleva viviendo aquí?", "en": "How long have you been living here?" }
      ],
      "register": "informal-warm"
    }
  ],
  "smalltalk_prompts": [
    { "type": "smalltalk_prompt", "prompt_es": "¿Es usted de aquí?", "prompt_en": "Are you from here?", "expected_exchange": "short, opens local knowledge" },
    { "type": "smalltalk_prompt", "prompt_es": "¿Qué recomienda no perderme en Vallarta?", "prompt_en": "What do you recommend I not miss in Vallarta?", "expected_exchange": "invites local expertise — very well received" },
    { "type": "smalltalk_prompt", "prompt_es": "¿Le gusta su trabajo?", "prompt_en": "Do you like your work?", "expected_exchange": "genuine interest — humanizes the exchange" }
  ],
  "phrase_cards": [
    { "es": "qué padre", "en": "how cool (Mexico)", "lemma": "padre", "notes": "Mexico-specific; do not use in Spain" },
    { "es": "chido / chida", "en": "cool / nice (Mexico, informal)", "lemma": "chido" },
    { "es": "órale", "en": "okay / wow / let's go (Mexico)", "lemma": "órale", "notes": "Context-dependent; affirming, agreeing, or expressing surprise" },
    { "es": "ahorita", "en": "in a moment / right now (ambiguous)", "lemma": "ahorita", "notes": "The famously elastic Mexican time word. Could mean now, soon, or eventually." },
    { "es": "mande", "en": "pardon? / yes? (Mexico, polite)", "lemma": "mandar", "notes": "Response to being called or not hearing something" }
  ],
  "register_map": {
    "type": "register_map",
    "context": "Small Talk (Mexico / Puerto Vallarta)",
    "warmth_note": "Mexicans value warmth, indirect communication, and dignity. Asking about someone's family, hometown, or job with genuine curiosity is never intrusive — it's welcome.",
    "taboo_note": "Avoid opening with politics or price-of-living complaints. Lead with appreciation for place and food."
  }
}







***

### 🙅 Pack 09: Polite Refusal



{
  "pack": "polite_refusal",
  "vault_path": "08_ProjectPacks/09_PoliteRefusal.json",
  "scenelets": [
    {
      "type": "scenelet",
      "id": "refusal_vendor",
      "scene": "Declining street vendors or aggressive sales",
      "phrases": [
        { "es": "No, gracias.", "en": "No, thank you." },
        { "es": "Estoy bien, gracias.", "en": "I'm okay, thanks." },
        { "es": "Ahorita no, gracias.", "en": "Not right now, thanks." },
        { "es": "Ya tengo uno, gracias.", "en": "I already have one, thanks." },
        { "es": "Lo voy a pensar.", "en": "I'll think about it." }
      ],
      "register": "neutral-warm",
      "notes": "'No gracias' alone with eye contact and a slight smile is sufficient and respected. Avoid elaborate explanations — they invite further pitch."
    },
    {
      "type": "scenelet",
      "id": "refusal_invitation",
      "scene": "Declining a social invitation gracefully",
      "phrases": [
        { "es": "Qué amable, pero hoy no puedo.", "en": "How kind, but I can't today." },
        { "es": "Tengo compromiso.", "en": "I have a prior commitment." },
        { "es": "Otra vez será.", "en": "Another time." },
        { "es": "Me encantaría, pero tengo planes.", "en": "I'd love to, but I have plans." }
      ],
      "register": "warm-formal"
    },
    {
      "type": "scenelet",
      "id": "refusal_food",
      "scene": "Declining food or drink politely",
      "phrases": [
        { "es": "Gracias, ya estoy satisfecho/a.", "en": "Thank you, I'm already full." },
        { "es": "No tomo alcohol, gracias.", "en": "I don't drink alcohol, thank you." },
        { "es": "Qué rico se ve, pero ya no puedo más.", "en": "It looks delicious, but I really can't eat more." }
      ],
      "register": "warm",
      "notes": "In Mexican hospitality culture, refusing food can feel like a slight. Acknowledge the food warmly before declining."
    }
  ],
  "phrase_cards": [
    { "es": "no, gracias", "en": "no, thank you", "lemma": "gracias", "notes": "The full stop of refusal — complete and gracious" },
    { "es": "ya estoy bien", "en": "I'm already fine / I'm good", "lemma": "bien" },
    { "es": "tengo compromiso", "en": "I have a commitment / prior engagement", "lemma": "compromiso" },
    { "es": "otra vez será", "en": "another time", "lemma": "vez", "notes": "Soft, warm close to any refusal" }
  ],
  "register_map": {
    "type": "register_map",
    "context": "Polite Refusal (Mexico)",
    "cultural_note": "Mexicans generally don't take 'no' as cold — they take abruptness as cold. Warm the refusal with a word of appreciation first.",
    "irony_safe": false,
    "warmth_move": "Lead with a compliment: 'qué amable' or 'qué generoso' before the refusal lands."
  }
}







***

### 🔧 Pack 10: Repair Phrases



{
  "pack": "repair_phrases",
  "vault_path": "08_ProjectPacks/10_RepairPhrases.json",
  "scenelets": [
    {
      "type": "scenelet",
      "id": "repair_comprehension",
      "scene": "You didn't understand",
      "phrases": [
        { "es": "No entendí bien. ¿Podría repetirlo?", "en": "I didn't understand well. Could you repeat it?" },
        { "es": "¿Puede hablar más despacio, por favor?", "en": "Could you speak more slowly, please?" },
        { "es": "¿Cómo se dice eso en español?", "en": "How do you say that in Spanish?" },
        { "es": "¿Qué significa esa palabra?", "en": "What does that word mean?" },
        { "es": "¿Puede escribirlo?", "en": "Could you write it down?" }
      ],
      "register": "neutral",
      "notes": "Using repair phrases in Spanish (not just switching to English) signals commitment and earns patience from interlocutors."
    },
    {
      "type": "scenelet",
      "id": "repair_production",
      "scene": "You're searching for a word",
      "phrases": [
        { "es": "¿Cómo se llama...?", "en": "What is it called...?" },
        { "es": "Es una cosa que sirve para...", "en": "It's a thing used for..." },
        { "es": "No sé la palabra exacta, pero...", "en": "I don't know the exact word, but..." },
        { "es": "¿Me entiende?", "en": "Do you understand me?" },
        { "es": "Algo así.", "en": "Something like that." }
      ],
      "register": "neutral",
      "notes": "Circumlocution — talking around a word — is a core fluency skill. Practice it early."
    },
    {
      "type": "scenelet",
      "id": "repair_meta",
      "scene": "Meta-language: talking about your Spanish",
      "phrases": [
        { "es": "Estoy aprendiendo español.", "en": "I'm learning Spanish." },
        { "es": "Mi español no es muy bueno todavía.", "en": "My Spanish isn't very good yet." },
        { "es": "¿Lo dije bien?", "en": "Did I say it correctly?" },
        { "es": "¿Me puede corregir si me equivoco?", "en": "Can you correct me if I make a mistake?" }
      ],
      "register": "warm-humble",
      "notes": "Asking to be corrected is rare and well-received. It signals genuine investment and usually produces a generous teacher."
    }
  ],
  "phrase_cards": [
    { "es": "repetir", "en": "to repeat", "lemma": "repetir" },
    { "es": "despacio", "en": "slowly", "lemma": "despacio" },
    { "es": "¿mande?", "en": "pardon? / could you repeat? (Mexico)", "lemma": "mandar", "notes": "Very Mexican — more polite than '¿qué?'" },
    { "es": "¿cómo?", "en": "what? / pardon? (neutral)", "lemma": "cómo" },
    { "es": "algo así", "en": "something like that", "lemma": "algo", "notes": "Universal repair closer" },
    { "es": "no sé la palabra", "en": "I don't know the word", "lemma": "saber" }
  ],
  "register_map": {
    "type": "register_map",
    "context": "Repair (universal)",
    "key_insight": "Repair phrases are not failure markers — they are fluency infrastructure. Knowing 5 repair phrases in Spanish extends your effective range 10x.",
    "literary_note": "Cortázar wrote characters who thrived in linguistic indeterminacy. The learner who masters repair is living that — navigating meaning in motion."
  }
}



***

## Vault Drop Summary

All 10 packs are ready to save to `08_ProjectPacks/` with the paths noted in each object. Each pack contains:

| Pack | File | Key Objects |

|------|------|-------------|

| Airport | `01_Airport.json` | 3 scenelets, 6 phrase cards, 1 authority exchange |

| Immigration & Customs | `02_Immigration_Customs.json` | 2 scenelets, 7 phrase cards, 1 authority exchange |

| Taxi | `03_Taxi.json` | 3 scenelets, 6 phrase cards, 1 authority exchange |

| Hotel | `04_Hotel.json` | 3 scenelets, 7 phrase cards, 1 authority exchange |

| Restaurant | `05_Restaurant.json` | 3 scenelets, 8 phrase cards, 1 authority exchange |

| Directions | `06_Directions.json` | 2 scenelets, 5 phrase cards, PV orientation note |

| Emergency | `07_Emergency.json` | 2 scenelets, 6 phrase cards, PV emergency numbers |

| Small Talk | `08_SmallTalk.json` | 2 scenelets, 5 phrase cards, 3 smalltalk prompts |

| Polite Refusal | `09_PoliteRefusal.json` | 3 scenelets, 4 phrase cards, cultural note |

| Repair Phrases | `10_RepairPhrases.json` | 3 scenelets, 6 phrase cards, Cortázar note |

**Next recommended steps:** Save these to your vault, then build out `09_Grammar/` patterns discovered across these packs (e.g., the polite subjunctive cluster: *quisiera*, *podría*, *pueda*), or begin Priority 2 author curriculums.
//  Templates.swift
//  
//
//  Created by Sami on 5/13/26.
//

```
