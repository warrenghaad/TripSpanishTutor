# The Four Faces of the Cube

The Cube's geometry ([`CUBE.md`](CUBE.md)) describes how a sentence refracts. The Four Faces describe **which surface of the app the writer is on**. Every screen, every prompt, every research drop, every saved card belongs to exactly one Face. The Faces are not categories — they are *places the writer goes*.

A Face is selected by the writer's *moment*, not by a menu. The Prism reads the moment and picks the Face. The four are:

1. **Travel** — the whole arc of the trip, not the airport
2. **Curaduría** — the literary canon as living Spanish-learning paths
3. **Curiosos** — the spelunk surface; where curiosity gets followed
4. **Atelier** — the human surface: therapist, translator, conversant, coach

These are the four faces of the Cube. The other four faces named in `CUBE.md` (Perception, Generation, Variation, Depth, Situation, Memory, Spoken-Form, Learning) are *micro-faces* — the attention positions inside any of the four big Faces. The Big Four are where the writer *lives*. The micro-faces are how the writer *moves* once they're there.

---

## Face 1 — Travel

**Not the airport. The whole trip.**

Travel is the Face the writer is on whenever they are preparing for, moving through, or recovering from a moment of *being elsewhere*. It is the day-coordinator Face. It is the itinerary Face. It is the "I am about to walk into a cantina I have never been to" Face.

### What Travel covers

- **Pre-day** — what is happening today in PV, who is performing, what is open, what closes at sunset, what the rain is doing.
- **In-day** — anything the writer might say or hear while *out*: ordering, asking, declining, thanking, repairing a misunderstanding, flirting, deflecting, paying, leaving, arriving.
- **Post-day** — debrief: what was said that surprised, what was heard that was missed, what to carry tomorrow.
- **Whole-trip** — the arc. Where to be on which day. Which colonia on which morning. Which restaurant before which gallery.
- **Locals events** — pulled from the Event Finding sources in `06_Atelier/Event_Finding/`. Live music tonight, the Friday Art Walk, the malecón sculpture circuit, the Wednesday market, the open-air cinema, the *Charreada*.

### What Travel does NOT cover

- Travel is not a phrasebook. The old "airport / taxi / hotel" pack model is a *substrate* of Travel, not its definition. Travel is the **day-shape**, with phrase resources available when the moment demands them.
- Travel is not English-first. Travel is Spanish-first with English as a typed fallback.
- Travel is not generic. Vallarta is the ground. Sayulita, Yelapa, Mismaloya, San Pancho, Bucerías, Tepic, Guadalajara, San Miguel, CDMX — these are reachable extensions, treated as named sub-locales.

### Travel's atomic units

- `day-shape` — a daily-prep entry generated each morning, pulling from events, weather, the writer's stated plan, and yesterday's debrief.
- `scenelet` — a moment-bound dialogue or monologue the writer might enter (still uses the existing template, but framed as part of a day-shape, not a phrasebook entry).
- `repair-card` — a single utterance that turns a broken moment back into a connection. *"Disculpe, no le entendí — ¿me lo repite más despacio?"*
- `arc-note` — a multi-day plan, written as a paragraph not a checklist.

### Travel's faces (micro)

Heavy on **Situation**, **Spoken-Form**, **Generation**. Memory pulls when the writer hits a moment they've seen before. Depth fires when a place-name's etymology earns a beat.

---

## Face 2 — Curaduría

**The literary canon as Spanish-learning paths. The *palabra bonita* archive.**

Each author is a curriculum. Reading Neruda is one path through Spanish; reading Borges is another; Cortázar is another; Paz, Rulfo, Castellanos, Pizarnik, García Márquez, Bolaño, Mistral — each is its own way of becoming a more precise speaker. The writer chooses by appetite, not by syllabus.

### The connection rule

> **A poem connects to a phenomenological experience or it does not enter the canon.**

If the writer is eating an apple, Neruda's *Oda a la manzana* is the perfect Curaduría entry for that moment. If the writer cannot sleep, early Borges — the insomnia poems of *Fervor* — is the entry. If the writer is on the malecón at dusk and the *colores se cansan*, *Un patio* is the entry. Curaduría is **phenomenologically indexed**, not chronologically.

### What Curaduría builds

- **Author profiles** — one per author. CEFR-tagged reading order. Tonal signature. Phenomenological domains the author owns (Neruda owns ordinary objects; Borges owns mirrors, libraries, dawns, insomnia; Cortázar owns the uncanny inside the familiar; Paz owns thresholds, presence, the lyric instant).
- **Text scaffolds** — one per poem or story. Plain meaning, grammar skeleton, target lemmas, reusable phrases. Never the full copyrighted text — only the scaffold around lines the writer already owns.
- **Phenomenology index** — a reverse map. *Apple → Neruda Oda. Insomnia → Borges, Pizarnik. Dawn → Borges Amanecer, Paz. Mirror → Borges Espejos, Pizarnik. Patio at dusk → Borges Un patio. Café conversation → Cortázar Rayuela ch. 7. Loss of a friend → Borges A mi padre, Mistral Los sonetos de la muerte.*
- **Bilingual poetry tooling** — track useful GitHub repos and Python libraries for bilingual editions, parallel-text alignment, prosody analysis. Surface them in `11_Research/curaduria/tooling.md` so the writer can pull from them, not reinvent.

### What Curaduría does NOT do

- It does not decorate Travel. A Borges line never gets stapled to a taxi scenelet because *arrabal* sounds nice. The connection is phenomenological or it is nothing.
- It does not present authors as monuments. Authors are voices the writer can *try on*. Influential edges are probes, not destinations.
- It does not push completion. Reading one Neruda ode well is more useful than reading all of *Veinte poemas* poorly.

### Curaduría's atomic units

- `author_profile` — one per author. Tonal signature, phenomenological domains, suggested entry text, reading progression.
- `text_scaffold` — one per text. Golden pattern adapted: Meaning, Literal, Natural, Grammar Skeleton, Target Lemmas, Practice Move, Phenomenological Anchor.
- `phenomenology_entry` — one per phenomenon. A reverse-index card that says "if the writer is experiencing X, surface authors A, B, C."
- `palabra_bonita` — one per beautiful word. The canon-within-the-canon. *Quietud, umbral, vislumbre, penumbra, fervor, manzana, espejo, cansarse, caducidad.*

### Curaduría's faces (micro)

Heavy on **Depth**, **Variation**, **Perception**. The Influential edges of the Cube fire most often here.

---

## Face 3 — Curiosos

**The spelunk surface. The curiosity-following surface. The trail-builder.**

Curiosos is where the writer follows a thread without knowing where it leads. It is the Face that exists *because* the other three faces will surface things worth following. A word's etymology in Curaduría. A taxi driver's slang in Travel. A therapist's reframe in Atelier. Each of these can become a *curiosity* — and Curiosos is where curiosities become **trails**.

### What Curiosos is

- **The spelunk Face.** Long-form. The writer enters with one question and leaves with five. The output is a trail, not an answer.
- **Inspired by any other Face.** A Curiosos entry always has a *source moment* in Travel, Curaduría, or Atelier. The source moment is what makes it a curiosity instead of a search.
- **Cross-cutting.** A Curiosos trail can touch any number of Vallarta Voz domains — etymology, regional history, music, food anthropology, regional Spanish variation, the politics of voseo, the geography of mole, the cinema of Ripstein, the murals of Manuel Lepe.
- **Where the Atelier vault folder lives.** `04_Trails/` is the on-disk home. The existing `04_Trails/arrabal-etymology.md` is the prototype.

### What Curiosos does NOT do

- It is not a research assistant. Curiosos is *with* the writer's question, not in service of an external answer.
- It is not exhaustive. A trail closes when it earns a *palabra bonita*, a new edge, a new author, a new place to go, or a new line to write. Not when it runs out of sources.
- It does not require completion. Half-trails are valuable. The writer can return.

### Curiosos's atomic units

- `trail` — the main object. Nodes and edges. See `04_Trails/arrabal-etymology.md`.
- `spelunk_seed` — a one-line question dropped from another Face. *"Why does the gate-agent say 'ahorita' when she means 'in twenty minutes'?"*
- `etymology_note` — one per word-trail. Often the spine of a longer trail.
- `cultural_note` — one per cultural thread (mole-as-geography, voseo-as-class-marker, the *charreada* circuit).

### Curiosos's faces (micro)

Heavy on **Depth** and **Memory**. Variation fires often as the writer asks "what would this word be in PV?" Learning is invited but never imposed.

---

## Face 4 — Atelier

**The human surface. Therapist + translator + conversant + language coach. Four roles, one Face.**

Atelier is where the writer is *with someone*. The someone is the app. The app, on this Face, is not a phrasebook — it is a presence. The four roles are facets of one presence, swapped by the Prism according to what the writer needs in this minute.

### The four roles

1. **Therapist** — listens before correcting. Asks where the writer is and what they are bringing in. Never grades, never evaluates. Reflects back what was said. *"You said 'no puedo' three times today. What is the no-puedo about?"*
2. **Translator** — the working surface. Take what the writer said and give them four registers (literal, natural, argentine-or-mexican, borges-or-neruda-shaped). Always Spanish-first. Always with a peelable English fallback. This is also the surface the app *opens to* per the writer's instruction on May 12.
3. **Conversant** — a partner in Spanish, not a teacher. Holds a real conversation at the writer's level. Drops a *palabra bonita* when one is earned. Does not lecture.
4. **Coach** — the Cube/Prism in person. Reads the writer's recent graph and proposes the next move. Frontier features get priority. Voice markers are protected. The Coach knows the Cube but never names it to the writer.

### How the roles swap

The Prism picks the role from the writer's *opening utterance*:

- *"I'm stuck."* → Therapist.
- *"How do I say…?"* → Translator.
- *"Háblame de Vallarta hoy."* → Conversant.
- *"What should I work on?"* → Coach.

But the role is **fluid**. A Translator question can become a Therapist question in one beat. The Prism never locks the role. The Coach can hand off to the Conversant mid-sentence.

### What Atelier does NOT do

- It does not perform emotion. The Therapist role is *listening shape*, not therapy. Refer to a human therapist for therapy.
- It does not correct unsolicited. The Coach offers; the writer accepts or refuses. Refusal is a graph event.
- It does not flatten. The four roles have distinct **tone**. Therapist is slow. Translator is precise. Conversant is warm. Coach is patient.

### Atelier's atomic units

- `atelier_session` — a single conversation, tagged with which role(s) were active.
- `palabra_bonita` — same object as Curaduría's; can be dropped by Conversant or Coach.
- `repair_card` — same as Travel's; can be drilled inside an Atelier session.
- `voice_marker` — a recurring move in the writer's Spanish that the Coach has identified and *protects*.

### Atelier's faces (micro)

All eight CUBE micro-faces are in play. Atelier is the only Face that uses the full Cube on every session.

---

## How the Four Faces interlock

```
                       Curaduría
                          ▲
                          │ (palabra bonita,
                          │  phenomenological anchor)
                          │
        Travel ──────── Atelier ──────── Curiosos
        (day-shape,     (the human       (spelunks,
         locals events)  surface)         trails, edges)
                          │
                          ▼
                       (the writer's
                        sentence-graph,
                        which IS the
                        learner model)
```

- **Travel feeds Atelier**: the day's plan and the writer's actual moments are what Atelier sessions are about.
- **Atelier feeds Curiosos**: questions raised in conversation become spelunks.
- **Curiosos feeds Curaduría**: a trail through *arrabal* lands on Borges, which becomes an author profile.
- **Curaduría feeds Travel**: a Neruda ode about *manzanas* surfaces when the writer is at the *frutería* in Versalles.
- **Atelier reads from all three** to choose its role.

The writer never names the Faces. They live on them.

---

## Implementation note

This spec is canon. The vault and the iOS app surface should read from this file:

- `VallartaVoxVault/01_Constitution/SPEC.md` will register the Four Faces under "See also."
- `VallartaVoxVault/01_Constitution/VAULT.md` will add a "Four Faces" section pointing here.
- The iOS app's primary navigation (per the May 12 instruction: *opens to the translator, not a tab bar*) keeps the Translator role of Atelier as the launch surface. The other three Faces are toolbar destinations, not tabs — same pattern.
- The `12_Schemas/prompts/cube-emergence-rule.md` operational rule already references modes (`airport`, `atelier`, `bridge`). Those modes are now formally aligned with Travel, Atelier, and the Travel/Curaduría bridge. A migration note will land in a follow-up PR; this PR establishes the canon first.

The Four Faces are how the Cube is *seen*. The Cube is how a sentence is *moved*. The graph is the learner model. The writer writes.
