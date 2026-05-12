# Borges Pack — *Fervor de Buenos Aires* (1923)

The first content pack for TripSpanishTutor's literary trails. Uses Borges's
first book as an anchor for a multi-layer reading method that three frontier
models converged on independently: **read aloud → mine vocabulary → trace
etymology → notice grammar → research culture → write a personal echo**.

## Why this works

Borges's poetry is inherently multi-layered: each poem contains Argentine
street culture, Latin/Arabic/Greek etymological depth, philosophical
abstraction, and grammatical precision simultaneously. For a learner who
prefers trails to drills, that density is an asset, not an obstacle.

Borges himself wrote: *"Poems in a foreign language have a prestige they do
not enjoy in their own language, for one hears, one sees, each one of the
words individually."* That reframes beginner status as a perceptual advantage —
the struggle is the reading.

## Variant

This pack defaults to **es-AR (Rioplatense)** — voseo, sheísmo/yeísmo, and
the prosody Borges actually wrote in. The conjugator's `2s_vos` person and
acceptableForms() function are wired to make `tenés` and `tienes` both
in-spec on 2s drills.

## Structure

- `poems.json` — canonical Spanish text + metadata, one entry per poem.
- `lemmas.json` — target lemmas with full etymology trails (Latin/Greek/Arabic).
- `trail.json` — ordered TrailStops binding poems to skills.

## Method (one poem per session)

1. **Read aloud.** Two passes minimum. Don't translate yet.
2. **Mine 5 words.** Use WordDoors (etymology + Borges-symbolic function).
3. **Notice grammar.** What does the poem *demand* (preterite vs. imperfect,
   subjunctive of doubt, voseo)?
4. **Research culture.** Each poem includes a CultureNote on the place,
   period, or symbol.
5. **Write a Personal Echo.** 3 lines, any register. Don't evaluate it. Save
   it to `personal_echoes` — that row IS the trail's artifact.

Borges argued there is no "definitive text": alternate and contradictory
translations can be equally valuable (*Las dos maneras de traducir*, 1926;
*Las versiones homéricas*, 1932). Your halting translation is participation,
not failure.
