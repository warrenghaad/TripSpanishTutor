# Custom prompt fragments

Small snippets that get injected into the AI system prompt for a specific surface.

Suggested files:
- `translator.md` — extra guidance for the translator
- `chat.md` — for the conversational practice partner
- `journal.md` — for journal grammar feedback
- `situations.md` — for the situations/role-play surface
- `dictionary.md` — for word lookups

Keep each one to a paragraph or two. The agent can wire these into `server/ai-service.ts` so they prepend to the existing system prompts.
