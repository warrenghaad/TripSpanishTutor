# Obsidian AI Build Forge — Phased Build Proposal

Status: draft
Scope: phasing for the two-tier setup (workspace + build forge) described in the source proposal.

## Guiding principles

- Schemas before plugins; plugins before AI; AI before mobile; mobile before automation.
- Every new automation must replace a manual step done at least 5 times.
- Git is the single source of truth across machines. No iCloud or third-party sync until phase 5+.
- One provider per task. Do not fan out across OpenAI / Gemini / Anthropic until you have felt the limit of one.
- Every phase has a single exit check. Do not advance without it.

## Phase 0 — Vault + Git foundation (~½ day)

Outcome: a Git-backed vault that survives a local wipe.

- Create the vault folder. `git init`, push to a private GitHub repo.
- Install Obsidian Git. Auto-commit every 10 min, pull on startup, push on close.
- Lay down the folder skeleton:
  - `00_Inbox`, `01_Constitution`, `02_Specs`, `03_Chats`, `04_Trails`,
    `05_ProjectPacks`, `06_WordLens`, `07_DailyAnalysis`, `99_Archive`,
    `_templates`, `_attachments`.
- Add one sentinel note per folder so the structure survives the first commit.

Exit check: delete the vault locally, re-clone from GitHub, every folder and sentinel reappears.

## Phase 1 — Schema layer (~1 day)

Outcome: every note has a deterministic YAML shape.

- Install Templater and Linter.
- Author six templates: `ChatImport`, `DailyAnalysis`, `Trail`, `ProjectPack`,
  `WordLens`, `ConstitutionNote`.
- Each template emits a complete YAML frontmatter block on note creation
  (type, id, slug, created, source_app, tags, plus type-specific fields).
- Linter rules: required keys per `type:`, ISO date format, kebab-case slugs.

Exit check: create one note of each type from its template; Linter passes; the frontmatter is queryable in phase 2.

## Phase 2 — Query + capture (~½ day)

Outcome: the vault answers questions about itself, and one-tap capture works on desktop.

- Install Dataview and QuickAdd.
- Three baseline Dataview dashboards: open Trails, recent ChatImports,
  WordLens grouped by register.
- One QuickAdd macro per template type, each on a hotkey.

Exit check: from any note, hotkey → new ChatImport pre-filled with schema → save → appears on the ChatImports dashboard.

## Phase 3 — AI in-note (~1 day)

Outcome: one model, one plugin, real Spanish work happening in the editor.

- Install Text Generator. Connect exactly one provider:
  - Gemini 2.5 Pro if context size is the binding constraint.
  - GPT-4o if phrase fluency is the binding constraint.
- Three prompts: generate vocab pack, explain grammar, expand scene.
- Defer Copilot, Smart Connections, and File Organizer 2000.

Exit check: generate a full `WordLens` entry from a Spanish phrase via one hotkey; result fits the schema with no manual edits.

## Phase 4 — Vault recall (~½ day)

Outcome: the vault surfaces its own memory while you write.

- Install Smart Connections; let it index (≈10 min first run, local embeddings).
- Install Obsidian Copilot; point at the same provider as Text Generator.
- Add an "ask the vault" QuickAdd that opens Copilot with `@vault`.

Exit check: open a Trail note; right panel shows ≥3 semantically related notes; Copilot answers "what did I learn about food vocab in Vallarta?" from vault content alone.

## Phase 5 — Mobile capture loop (~1 day)

Outcome: phone to vault in under 10 seconds, offline-safe.

- Install Commander; build the two-row mobile toolbar from the spec.
- iOS: install Actions for Obsidian and Funnel.
- Apple Shortcut "Bear → Inbox": pull body via `bear://x-callback-url/`,
  write to `00_Inbox/` via Actions for Obsidian, tag `source_app: bear`.
- Use Working Copy (not iSH) for iPhone-side Git sync — more reliable on iOS.

Exit check: dictate one sentence into Bear, run the shortcut, the note lands in `00_Inbox` with a valid YAML stub.

## Phase 6 — AI inbox automation (~½ day)

Outcome: drops auto-classify; `00_Inbox` becomes a place you never touch.

- Install File Organizer 2000; connect a provider.
- Rules: route by inferred `type:` to the right folder; preserve `source_app`.
- Voice memos → transcript + schema stub.

Exit check: drop five mixed notes into `00_Inbox`; each lands in the right folder with valid YAML within one minute.

Do not start this phase until phase 5 has been used daily for at least a week — the bottleneck for capture volume is usually habit, not automation.

## Phase 7 — Design surface (optional, on demand)

Outcome: visual work has a home, installed only when needed.

- Excalidraw, Canvas, Advanced Tables.
- One Canvas as the project map-of-contents linking
  `ConstitutionNote` → `ProjectPack` → `Trail`.

## Phase 8 — Build forge: Replit + GitHub round-trip (~1 day)

Outcome: a spec note in Obsidian becomes a code change in this repo.

- Verify Replit is connected to the GitHub repo (this project already is).
- Document the loop: write spec note → push via Obsidian Git → open in Replit
  → run `claude-code` or `codex` in the Replit shell with the spec note as
  context → review diff → push back.
- Pick one tiny real change in `TripSpanishTutor` and drive it end-to-end.

Exit check: a spec authored only in Obsidian produced a merged commit in this repo without leaving the loop.

## Phase 9 — Build forge: Claude Desktop + MCP (~½ day)

Outcome: Claude can read and write the vault directly, and run live research into notes.

- Install Claude Desktop.
- Configure filesystem MCP pointed at the vault path.
- Configure Perplexity MCP with an API key.
- Test: "Research X and write a `research_note` to `02_Specs/`."

Take a Git tag `pre-mcp-writeback` before this phase. MCP file writes are not reversible without that tag.

Exit check: Claude Desktop creates a schema-valid note in the vault from a one-line prompt, and Obsidian Git commits it on the next tick.

## Phase 10 — Operating cadence (ongoing)

Outcome: the system gets used, not just built.

- Daily: morning `DailyAnalysis` synthesizes yesterday's `ChatImport` +
  `Trail` notes.
- Weekly: Dataview retro dashboard; promote artifacts from `drafts/` to
  `integrated/`.
- Monthly: prune any plugin that has not earned its keep.

## Phase ordering rationale

Phases 0–2 are the skeleton — vault, Git, schemas, queries. Without them, every later phase produces inconsistent data that compounds. Phases 3–4 add intelligence to a clean foundation, so AI output lands in a known shape. Phase 5 makes the system field-deployable; until then, capture is desk-bound. Phase 6 removes the cost of capture once volume justifies it. Phases 8–9 are the build forge; they assume the schema is stable enough that an automated write-back will not corrupt the vault.

## Risk gates

- After phase 2: if Dataview queries are slow or schemas drift, fix before continuing — the cost of fixing schemas later grows with note count.
- After phase 5: if mobile capture is not getting used daily, do not start phase 6. The bottleneck is habit, not automation.
- Before phase 9: take the `pre-mcp-writeback` Git tag. Write access from an LLM is the highest-blast-radius change in the stack.

## Cost-of-stopping

The system is useful at any cut point. Phases 0–5 alone yield a complete personal Obsidian workspace with mobile capture. Phases 8–9 are only worth doing once you have committed to Obsidian as the primary build cockpit for the app.

## Install order (recap, sequenced to avoid plugin conflicts)

1. Obsidian Git
2. Templater
3. Linter
4. Dataview
5. QuickAdd
6. Text Generator (one provider)
7. Smart Connections
8. Obsidian Copilot
9. Commander
10. Actions for Obsidian (iOS), Funnel (iOS), Working Copy (iOS)
11. File Organizer 2000
12. Excalidraw, Canvas, Advanced Tables (on demand)

Claude Desktop + MCP is a desktop app config, not an Obsidian plugin, and is the last component to install.
