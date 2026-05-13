# 05 WordLens

Every word worth keeping gets its own note. Small, durable, linkable. Each note doubles as a Spaced Repetition source for the Anki sync.

## Naming

`<lemma>.md` — e.g. `ahorita.md`, `mande.md`, `traste.md`. Lowercase filename; keep accents in the body.

## Frontmatter

```yaml
---
type: wordlens
lemma: ahorita
part_of_speech: adv          # noun | verb | adj | adv | phrase | interjection
register: informal_mx        # neutral | formal | informal_mx | informal_rio | literary | slang
created: YYYY-MM-DD
tags:
  - spanish
  - wordlens
  - mexican           # or argentine, chilean, etc.
  - flashcards        # ← required so Spaced Repetition picks up the cards
---
```

## Body sections

- **Meaning** — short. Bullet ambiguities.
- **How to read which** — the *which-meaning-now* skill.
- **Heard** — dated captures from the wild.
- **Use it yourself** — sentences you've actually said or want to say.
- **See also** — related words / WordLens entries / notes.
- **Voice note** — one line of personal stance.
- **Flashcards** — inline cards in `front::back` syntax for the Spaced Repetition plugin.

## Flashcard convention

This vault uses the Obsidian **Spaced Repetition** plugin. To make a card:

1. Add `flashcards` to the note's `tags:`.
2. Anywhere in the body, write a line: `Front question::Back answer`.
3. For reversed (both directions): use `:::` instead of `::`.
4. For multi-line:

```md
Front question
?
Back answer that can run multiple
lines until a blank line.
```

The plugin surfaces these inline. Once a word is stable, **AI-AnkiSync** can upgrade the card with etymology, example sentence, and register notes, then push to Anki for offline phone drilling.

## Example

→ [[ahorita]]
