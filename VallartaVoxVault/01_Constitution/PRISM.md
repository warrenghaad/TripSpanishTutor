# PRISM — How the Cube Refracts

The Cube is the static geometry. The **Prism** is what happens when the writer's attention falls on the current sentence: light enters along one face, refracts at the axes, and exits as a particular next prompt. Different attention angles produce different next moves on the same sentence. The Prism is therefore not separate from the Cube — it is the Cube *in operation*.

Read [`CUBE.md`](CUBE.md) first.

---

## 1. The refraction event

A refraction is one full cycle:

```
   current sentence (center)
            │
            ▼
   PROFICIENCY-READING ──► tension map
            │                  │
            ▼                  ▼
   ZPD envelope ◄──► graph traversal history
            │
            ▼
   next prompt = argmax (tension × novelty × face_underuse)
                  subject to (move ∈ ZPD)
```

The refraction is the moment the writer is *seen*. It is not visible to the writer as a process — the writer experiences only the next prompt. But the geometry is preserved: any prompt the system issues should be traceable to a specific face, edge, and axis, on a sentence that is the current center.

---

## 2. The three lenses every refraction uses

Every refraction reads the current center against three references at once. This is not optional — a refraction missing any one of these is incomplete.

1. **PCIC** — the proficiency-reading lens. Gives the level-coordinate (A1–C2) on twelve inventories.
2. **The Sentence Engine** (or one of its siblings — see §3) — the tension-reading lens. Gives the slot-map: which thematic slots are filled, which are empty, which are over-pressed.
3. **The graph** — the novelty-reading lens. Gives the ZPD envelope: which features are within reach (recently attempted and growing), which are on the frontier (attempted once and failed — *highest priority*), which are out of reach.

---

## 3. The Sentence Engine is a default lens, not universal

The **Sentence Engine** is the default tension-reader: **Perception + Motion + Modifier + Emotional Pressure + Relation**. It maps onto Halliday's three metafunctions (ideational, interpersonal, textual) and works beautifully for lyric and phenomenological sentences — exactly the register Vallarta Vox lives in for Atelier and Bridge modes.

But it is biased toward the lyric. Vallarta Vox needs **at least two more lenses** so transactional and expository sentences get a clean refraction:

| Lens | Use for | Slots |
|---|---|---|
| **Sentence Engine** (default) | Lyric, phenomenological, Atelier, Bridge | Perception · Motion · Modifier · Emotional Pressure · Relation |
| **Transactional Engine** | Airport mode — ordering, asking, exchanging | Need · Politeness Frame · Repair Mechanism · Specificity Anchor · Receipt |
| **Expository Engine** | Grammar notes, journal explanations, planning | Claim · Ground · Qualifier · Connector · Closure |

A center's *mode* (declared in frontmatter — `airport`, `atelier`, `bridge`) picks the default lens; the Prism may switch lenses mid-refraction if the sentence has moved to a different register. A bridge-note refracts through *both* the Transactional and the Sentence Engine, in that order, because the bridge's premise is that one grammar skeleton serves both worlds.

---

## 4. What "tension" is, precisely

Tension is the **strength of an open affordance** — how much the sentence pulls toward a specific next move. Tension is computable, not vibey:

- **Slot-emptiness tension** — a sentence with empty Emotional Pressure scores high on emotional-pressure edges. A transactional sentence with no Repair Mechanism scores high on "what if they didn't understand?" edges.
- **Unbalanced-axis tension** — a sentence that has moved hard down the Depth axis (heavy etymology) and not at all on Lateral pulls toward a register move.
- **Untraversed-edge tension** — the writer has never traversed *como si* counterfactual from this kind of sentence; that edge has fresh tension.
- **Voice-protection negative tension** — moves that would erase a voice marker carry *negative* tension and are de-prioritized.

The scoring rule:

```
score(move) = poetic_tension(move, sentence)
            × novelty(move, graph)
            × face_underuse(face_of(move), graph)
            × in_ZPD(move, writer)
```

Ties broken by the writer's recent preferences. The writer can always refuse — "no, ask me differently" — and the refusal is itself a graph edge (a meta-edge of type `REFUSED`, with attributes the next refraction reads).

---

## 5. ZPD as an envelope, not a level

The Zone of Proximal Development is the most-misused concept in adaptive learning. The Prism uses it precisely:

- **In-ZPD:** features appearing in the writer's last *n* sentences with growing accuracy.
- **ZPD frontier:** features appearing once and failing. *These get priority over in-ZPD moves* — they are exactly where the next mediated success is possible.
- **Out-of-ZPD:** features that have never appeared. These are not selected unless the writer explicitly requests "show me something new."

ZPD is therefore a **dynamic envelope**, not a level on a ladder. It changes after every sentence.

---

## 6. Faces refract differently

Each face produces a characteristic *kind* of prompt:

| Face | Prompt shape | Example for `Voy a la puerta veintidós.` |
|---|---|---|
| Perception | Sensory or attentional probe | "What can you hear at the gate while you say this?" |
| Generation | Production demand, no rewriting | "Say it once more, with breath." |
| Variation | Same meaning, different shape | "Try it without `voy a` — what verb of arrival fits?" |
| Depth | Etymology / image probe | "What did *puerta* mean before it meant a gate?" |
| Situation | Phenomenological re-grounding | "Whom are you saying this to, and why are they listening?" |
| Memory | Retrieval / connection | "Have you written `voy a` in another sentence today?" |
| Spoken-Form | Mouth / rhythm probe | "Read it aloud — where does the stress land?" |
| Learning | Retrospective comparison | "Compare this `a la` to the `a las` you used at breakfast." |

The Prism never chooses a face by schedule. It chooses the face whose characteristic prompt shape has the highest tension-score for *this* sentence.

---

## 7. The refraction in the day-pack pipeline

The vault's day-pack auto-generation (`08_ProjectPacks/YYYY-MM-DD.md`) is a *low-frequency Prism event*: it refracts the previous day's traversal history and the upcoming day's situational pressure (airport mode if a flight is imminent; atelier mode if a reading session is planned) into a curated set of `## Airport`, `## Atelier`, `## Bridge` sections.

The day-pack pipeline therefore needs the Prism's three-lens read at *day granularity*:
- **PCIC across the day** — what level-coordinates dominated the writer's last 24 hours?
- **Day-Engine slots** — which sections were under-represented? (Many airport scenelets, no atelier? The day-pack restores balance.)
- **Graph day-diff** — what edges did the writer traverse today that they hadn't before? Flag those for the *Memory* surface tomorrow.

---

## 8. Refraction outside the app — using the Prism by hand

The Prism is a thinking tool the writer can use without the app. When stuck on a sentence:

1. **Name the center.** Write the sentence on a card.
2. **Find the loudest empty slot.** Run the sentence through the Sentence Engine (or Transactional / Expository). Which slot is missing?
3. **Pick a face you have not sat on today.** Look at yesterday's debrief in `03_DailyDebriefs/` — which face is underused?
4. **Traverse one edge.** Make the single move that connects the empty slot to the underused face.
5. **Save the move.** Drop the result into `07_CreativeWriting/` or `04_Trails/`. The traversal becomes a new edge on your graph.

This is the Prism on paper. The app automates it; the paper version is always available offline, on a flight, in a cantina without signal.

---

## 9. What the Prism is not

It is not a recommendation engine. It does not optimize for the writer's stated goal (other than "write the next sentence well"). It does not score the writer's output. It does not converge.

The Prism's only commitment: **the next prompt is the highest-tension move still inside the writer's ZPD, on a face or edge they have not yet sat in for this sentence.** Everything else in the vault is in service of that one refraction.
