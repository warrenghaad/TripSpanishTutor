# README — Vallarta Vox Content Sync + Obsidian Workbook

## Purpose

Set up two-way content sync between:

1. Remote AI/content generation
2. GitHub repository
3. Local Obsidian vault
4. Replit/backend app

Obsidian is not the app UI. It is the offline workbook, research library, schema vault, and durable artifact store.

The app is one translator-first chat surface. The backend and AI agents should write structured content into this vault so Obsidian can pull it automatically.

---

## Source of Truth

The canonical content root is:

```text
VallartaVoxVault/
```

All content-related files must be written somewhere inside this folder.

Do not scatter content into random repo folders.

Use repo code folders for app/backend implementation.
Use `VallartaVoxVault/` for workbook, content, schemas, research, and generated notes.

---

## Folder Routing Rules

Route content files by object type:

```text
VallartaVoxVault/
  00_Inbox/
    Raw captures, unresolved drops, voice memo transcripts, pasted notes.

  01_Constitution/
    Standing rules, project identity, LLM behavior rules, app constitution.

  02_DailyPrep/
    Pre-day briefings, outing prep, Atelier-informed scene briefings.

  03_DailyDebriefs/
    Raw daily debriefs, post-day reflections, daily analyses.

  04_Trails/
    Language spelunks, curiosity chains, etymology trails, phrase clusters.

  05_WordLens/
    Durable word/phrase/idiom notes with meaning, use, register, etymology.

  06_Atelier/
    Literature, art, music, film, history, cultural context.
    Subfolders:
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
    Spanish drafts, journal fragments, sentence gardening, ode attempts.

  08_ProjectPacks/
    Offline travel packs, scene packs, phrase packs, repair packs.
    Subfolder:
      JSON_Export/

  09_Grammar/
    Grammar patterns discovered through use, not abstract textbook drills.

  10_Flashcards/
    Spaced repetition source files, Anki export-ready cards.

  11_Research/
    Perplexity, Claude, GPT, Gemini, or manual research imports.

  12_Schemas/
    Object schemas, templates, JSON examples, Markdown templates.
    Subfolder:
      Templates/
```

---

## Content Routing Table

Use this table when deciding where to place a generated file.

| Object Type | Folder | File Format |
|---|---|---|
| `raw_capture` | `00_Inbox/` | `.md` |
| `constitution_note` | `01_Constitution/` | `.md` |
| `daily_prep` | `02_DailyPrep/` | `.md` |
| `daily_debrief` | `03_DailyDebriefs/` | `.md` |
| `daily_analysis` | `03_DailyDebriefs/` | `.md` |
| `trail` | `04_Trails/` | `.md` |
| `word_lens_entry` | `05_WordLens/` | `.md` |
| `atelier_resource` | `06_Atelier/{category}/` | `.md` |
| `creative_writing_piece` | `07_CreativeWriting/` | `.md` |
| `project_pack` | `08_ProjectPacks/` | `.md` |
| `project_pack_json` | `08_ProjectPacks/JSON_Export/` | `.json` |
| `grammar_note` | `09_Grammar/` | `.md` |
| `flashcard_source` | `10_Flashcards/` | `.md` or `.csv` |
| `research_note` | `11_Research/` | `.md` |
| `schema` | `12_Schemas/` | `.json` or `.md` |
| `template` | `12_Schemas/Templates/` | `.md` |

---

## File Naming Rules

Use predictable names.

### DailyPrep

```text
02_DailyPrep/YYYY-MM-DD-location-or-scene.md
```

Example:

```text
02_DailyPrep/2026-05-14-galeria-corsica-artwalk.md
```

### DailyDebrief

```text
03_DailyDebriefs/YYYY-MM-DD-debrief.md
```

Example:

```text
03_DailyDebriefs/2026-05-14-debrief.md
```

### DailyAnalysis

```text
03_DailyDebriefs/YYYY-MM-DD-analysis.md
```

Example:

```text
03_DailyDebriefs/2026-05-14-analysis.md
```

### WordLens

```text
05_WordLens/spanish-slug.md
```

Example:

```text
05_WordLens/pena-ajena.md
```

### Trails

```text
04_Trails/YYYY-MM-DD-short-trail-title.md
```

Example:

```text
04_Trails/2026-05-14-pena-ajena-verguenza.md
```

### ProjectPacks

```text
08_ProjectPacks/NN_Pack_Name.md
08_ProjectPacks/JSON_Export/NN_Pack_Name.json
```

Example:

```text
08_ProjectPacks/01_Airport.md
08_ProjectPacks/JSON_Export/01_Airport.json
```

### Atelier

```text
06_Atelier/{Category}/creator-or-topic-title.md
```

Example:

```text
06_Atelier/Borges/borges-ficciones-entry-scaffold.md
06_Atelier/Murals_PV/puerto-vallarta-mural-vocabulary.md
```

---

## Frontmatter Rules

Every Markdown file inside the vault should begin with YAML frontmatter.

Minimum frontmatter:

```yaml
***
id: vv-YYYYMMDD-HHMMSS-slug
type: object_type_here
status: seed
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: claude
tags:
  - vallarta-vox
***
```

Content-specific frontmatter should be added where useful.

Example:

```yaml
***
id: vv-prep-20260514-galeria-corsica
type: daily_prep
status: ready
created: 2026-05-13
updated: 2026-05-13
outing_date: 2026-05-14
place_type: gallery
location_name: Galería Corsica / Puerto Vallarta ArtWalk
atelier_resources:
  - puerto-vallarta-artwalk
  - mexican-muralism
vocabulary_fields:
  - art_description
  - gallery_smalltalk
grammar_priority:
  - polite_questions
  - expressing_opinion
tags:
  - vallarta-vox
  - daily-prep
  - atelier
  - puerto-vallarta
***
```

---

## Two-Way Sync Model

This project uses GitHub as the bridge.

```text
Remote AI / Replit / Claude / Perplexity
        ↓ writes files or commits via GitHub API
GitHub repo
        ↓ pulled by Obsidian Git
Local Obsidian workbook
        ↓ user edits locally
Obsidian Git commits and pushes
GitHub repo
        ↓ read by Replit/backend/AI agents
App/backend updates its content index
```

The goal is two-way sync:

1. Remote agents can create files in the vault remotely.
2. Obsidian can pull those files.
3. The user can edit files locally in Obsidian.
4. Obsidian Git pushes edits back to GitHub.
5. Backend/agents can read updated files.

---

## Obsidian Git Setup Assumption

Assume the user will install and enable the Obsidian Git community plugin.

Recommended plugin settings:

```text
Pull on startup: enabled
Auto pull interval: 10 minutes
Auto commit-and-sync interval: 10 minutes
Auto commit-and-sync after stopping file edits: enabled
Push on commit-and-sync: enabled
Merge strategy: merge
```

Obsidian Git supports automatic pull/commit/push workflows when configured this way [web:259]. Several setup guides recommend ignoring device-specific workspace files such as `.obsidian/workspace.json`, `.obsidian/workspace-mobile.json`, `.trash/`, and `.DS_Store` [web:259][web:102].

---

## .gitignore

Create or update:

```text
# Device-specific Obsidian state
.obsidian/workspace.json
.obsidian/workspace-mobile.json
.obsidian/workspace
.obsidian/cache
.trash/

# System files
.DS_Store
Thumbs.db

# Secrets
.env
.env.local
*.pem
```

Do not ignore the actual Markdown content in `VallartaVoxVault/`.

---

## Remote Write Requirement

Create a backend or script that writes content into GitHub.

Use GitHub Contents API or Octokit.

GitHub file update rules:

1. Content must be base64 encoded.
2. If the file already exists, fetch its existing `sha`.
3. Send the `sha` when updating.
4. If file does not exist, create it without `sha`.
5. Use semantic commit messages.

The GitHub Contents API supports creating or replacing files in a repository [web:268]. When updating an existing file through the API, the existing blob `sha` must be included and content should be base64 encoded [web:265].

---

## Required Environment Variables

Use these:

```bash
GITHUB_TOKEN=
GITHUB_OWNER=warrenghaad
GITHUB_REPO=TripSpanishTutor
GITHUB_BRANCH=main
VAULT_ROOT=VallartaVoxVault
```

The GitHub token must have repository contents write permission.

Do not commit the token.
Do not write it into Obsidian.
Do not place it in Markdown notes.

---

## Required Sync Functions

Implement these functions in the backend or a script:

```ts
async function upsertVaultFile(params: {
  path: string;
  content: string;
  commitMessage: string;
}): Promise<{
  path: string;
  sha: string;
  url: string;
}>
```

```ts
async function readVaultFile(path: string): Promise<string>
```

```ts
async function listVaultFolder(path: string): Promise<Array<{
  path: string;
  type: "file" | "dir";
  sha: string;
}>>
```

```ts
async function deleteVaultFile(params: {
  path: string;
  commitMessage: string;
}): Promise<void>
```

---

## Suggested File

Create:

```text
server/services/vaultSync.ts
```

Implement with Octokit:

```ts
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const branch = process.env.GITHUB_BRANCH || "main";

export async function upsertVaultFile({
  path,
  content,
  commitMessage,
}: {
  path: string;
  content: string;
  commitMessage: string;
}) {
  const encoded = Buffer.from(content, "utf8").toString("base64");

  let sha: string | undefined;

  try {
    const existing = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    if (!Array.isArray(existing.data) && "sha" in existing.data) {
      sha = existing.data.sha;
    }
  } catch (err: any) {
    if (err.status !== 404) throw err;
  }

  const result = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    branch,
    message: commitMessage,
    content: encoded,
    sha,
  });

  return {
    path,
    sha: result.data.content?.sha || "",
    url: result.data.content?.html_url || "",
  };
}
```

---

## Required API Endpoint

Create:

```http
POST /api/vault/upsert
```

Input:

```json
{
  "path": "VallartaVoxVault/02_DailyPrep/2026-05-14-galeria-corsica-artwalk.md",
  "content": "---\ntype: daily_prep\n---\n# Daily Prep\n...",
  "commitMessage": "daily-prep: galeria corsica artwalk 2026-05-14"
}
```

Output:

```json
{
  "ok": true,
  "path": "VallartaVoxVault/02_DailyPrep/2026-05-14-galeria-corsica-artwalk.md",
  "sha": "...",
  "url": "https://github.com/..."
}
```

Also create:

```http
GET /api/vault/file?path=...
GET /api/vault/list?path=...
```

---

## Safety Rules

1. Never overwrite a file if the new content is empty.
2. Never write outside `VallartaVoxVault/`.
3. Reject paths containing `../`.
4. Reject writes to `.env`, `.git`, or `.obsidian`.
5. Prefer upsert, not blind overwrite.
6. If there is a conflict, create a new file with suffix:
   `-conflict-YYYYMMDD-HHMMSS.md`
7. Log every remote write.

---

## Content Generation Rule

When an AI generates content, it should produce both:

1. Human-readable Markdown note
2. Optional structured JSON block or sidecar `.json` if app ingestion needs it

For ProjectPacks, save both:

```text
08_ProjectPacks/Pack_Name.md
08_ProjectPacks/JSON_Export/Pack_Name.json
```

For most other objects, Markdown with YAML frontmatter is enough.

---

## Commit Message Format

Use semantic commit messages:

```text
daily-prep: {date} {scene}
daily-analysis: {date}
wordlens: {spanish-slug}
trail: {short-title}
atelier: {creator-or-topic}
project-pack: {pack-name}
research: {topic}
template: {template-name}
schema: {schema-name}
```

Examples:

```text
daily-prep: 2026-05-14 galeria corsica artwalk
wordlens: pena-ajena
project-pack: airport
atelier: borges ficciones entry scaffold
research: puerto vallarta event sources
```

---

## Definition of Done

This setup is done when:

1. A remote process can write a Markdown file to `VallartaVoxVault/02_DailyPrep/`.
2. The file appears in GitHub.
3. Obsidian Git pulls it into the local vault.
4. The user can edit the note in Obsidian.
5. Obsidian Git pushes the edit back to GitHub.
6. The backend can read the edited note.
7. No content files are written outside `VallartaVoxVault/`.
