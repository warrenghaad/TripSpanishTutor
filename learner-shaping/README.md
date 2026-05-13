# Learner / User Shaping

Everything the app should know about *you* (or the user it's serving) so AI responses, vocabulary suggestions, journaling prompts, and translations feel personal — not generic.

This is the source of truth. Code in `server/ai-service.ts` and the practice bar / translator can read from `profile.md` and `preferences.md` to seed system prompts and tone.

## Structure

- **`profile.md`** — who the learner is. Travel context, goals, current Spanish level, any anxieties or sensitivities, things they care about (art, food, jazz, beach, etc.).
- **`voice.md`** — how the learner writes and wants to sound. Sample sentences, favorite phrases, tone preferences (warm vs. crisp, formal vs. casual), words to avoid.
- **`preferences.md`** — concrete settings: preferred locale (Vallarta/Jalisco vs. neutral), preferred tense focus, mindful-tone default on/off, content interests, dietary/medical phrases that matter.
- **`observations/`** — what the app has noticed over time (mistakes that recur, words that stuck, phrases that didn't, mood-meter trends). One dated note per session is fine. Both you and ChatGPT can append here.
- **`prompts/`** — custom system-prompt fragments that should be injected into specific surfaces (translator, chat, journal, situations). Each file is a small block of guidance, named by surface.

## How updates flow

1. ChatGPT (or you) edits/adds a file here.
2. The next agent task can wire any new fields into the AI service prompts, or surface them in the UI (e.g. a profile-edit page).
3. Treat this folder like a living user model — append, don't overwrite, when adding observations.

## Privacy note

Nothing here is sent anywhere automatically. It's only read by the app's own backend when building prompts. If you don't want a piece of info in AI context, leave it out.
