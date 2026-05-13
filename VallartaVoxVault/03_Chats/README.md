# 03 Chats

Imported conversations — Perplexity, Claude, ChatGPT, or any other LLM session worth preserving.

## Naming

`YYYY-MM-DD - <slug>.md` — e.g. `2026-05-13 - Vallarta Vox Constitution Chat.md`.

## Schema

Use the `ChatImport` template from `12_Schemas/Templates/ChatImport.md`. The frontmatter pins:

- `type: chat_import`
- `source_app` (perplexity / claude / chatgpt)
- `conversation_role` (design / research / build / debrief / content_generation)
- `extract_to` (trail / project_pack / daily_analysis / prompt / schema)

## House rules

- Preserve the raw chat verbatim. Don't clean it up before classifying.
- Extract decisions and canon changes into their own sections before doing any other work with the chat.
- When a chat produces a usable object (trail, pack, analysis, prompt, schema), create that note next door and link both ways.
- Mark a chat `status: canonical` if it cements design or vault canon. Those become reference and rarely change.

## Related folders

- `04_Trails/` — rabbit holes extracted from chats.
- `08_ProjectPacks/` — outing prep extracted from chats.
- `11_Research/` — Perplexity research imports that aren't conversations.
- `12_Schemas/Templates/` — `ChatImport.md` lives here.
