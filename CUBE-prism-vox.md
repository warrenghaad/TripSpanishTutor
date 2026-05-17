> **⚠️ SUPERSEDED 2026-05-16 by [`VallartaVoxVault/01_Constitution/LANGUAGE_PRISM.md`](LANGUAGE_PRISM.md).**
> 
> This file was an ideation draft that hardened into spec without the canon-holder's sign-off. The architecture it describes (Prism as a scoring engine over faces/edges/axes with a single emergence rule as the operational core) is **wrong** — the corrected architecture is a Rubik's-cube recursive operational topology with 6 face-workspaces × 9 cubies, 12 bilateral edge-contracts, 8 trilateral vertices, and orientation-relative semantics. Read `LANGUAGE_PRISM.md`.
> 
> Kept on disk for audit trail. Do not extend, do not cite as canon.

#  The Cube Holds: A Conceptual Audit of the Vallarta Vox / TripSpanishTutor Prism Model and a Rule-Based Theory of Emergent Prompt-Stage Generation

## TL;DR

- **The corrected model is conceptually sound.** A sentence-centered prism with stable faces, typed edges, vertices, and three movement axes (vertical complexity, lateral register, depth) is defensible as both an SLA construct (it externalizes Swain's noticing-the-gap, Lantolf & Poehner's microgenesis, and van Lier's affordance-uptake) and a poetics construct (it externalizes Paz's "la técnica poética no es transmisible" stance and Bloom's revisionary ratios at technique granularity). Promoting Learning to a face — rather than a meta-layer — is correct and aligns the model with studio pedagogy (Schön) and Murray's "writing as discovery."
- **Prompt-stage emergence is achievable, but only if the seven existing sequences (Cube stages, today's-progression, six-prompt series, seven-level ladder) are demoted from architecture to substrate.** They are training data for an emergent rule, not the rule itself. The rule that actually does the work has two arguments and one operation: read the current sentence's CAF/diagnostic signature (proficiency), read its unresolved poetic tension (affordance), and select the next prompt as the highest-tension move that is still inside the writer's ZPD on a face or edge the writer has not yet sat in. Everything else collapses into that.
- **The central refinement is to demote stages and promote a single emergence rule.** The seven Cube "stages" are, almost without exception, faces or axes in disguise; treating them as stages reintroduces a hidden curriculum. The honest model is: no stages — only faces (places of attention), edges (typed moves), axes (directions), and one rule (`next_prompt = argmax_tension(unvisited(faces ∪ edges) ∩ ZPD(writer, sentence))`). The graph the writer has actually built *is* the learner model; no hidden vector is needed.

---

## Executive Evaluation: Is Prompt-Stage Emergence from Cube Geometry Achievable?

Yes, with one architectural commitment: the graph of sentences the writer has actually produced, with edges actually traversed, becomes the learner model. This collapses three problems into one — proficiency tracking, creative-writing prompting, and Spanish-pedagogy sequencing. None of these need to be solved independently when the graph is correctly structured.

The mechanism rests on five facts established in the literature:

1. **A single sentence is a sufficient diagnostic unit.** Kellogg W. Hunt's T-unit, defined in *Grammatical Structures Written at Three Grade Levels* (NCTE Research Report No. 3, 1965, p. 20) as "one main clause with all subordinate clauses attached to it" — the "shortest grammatically allowable sentences into which writing can be split" — and Foster, Tonkyn & Wigglesworth's AS-unit, defined in *Applied Linguistics* 21:3 (2000, p. 365) as "a single speaker's utterance consisting of an independent clause, or sub-clausal unit, along with any subordinate clause(s) associated with either," together demonstrate that one clausal-syntactic unit indexes proficiency reliably. The Cube's commitment that "the center is a Spanish sentence" is not metaphor — it is the empirically validated minimal unit of L2 performance measurement under the CAF (Complexity-Accuracy-Fluency) framework (Housen, Kuiken & Vedder, *Dimensions of L2 Performance and Proficiency*, Benjamins LLLT vol. 32, 2012). One sentence reveals proficiency.
2. **Assessment can be instruction.** Lantolf & Poehner's Dynamic Assessment program (*Journal of Applied Linguistics* 2004; *Language Teaching Research* 2011, 2013) explicitly dissolves the diagnose/teach loop. Poehner & Lantolf (2013) describe DA as deriving "from Vygotsky's insight that the use of mediation, attuned to learner needs, enables learners to perform beyond their current level of functioning, thereby providing insights into emerging capabilities." The Cube's emergent prompt is structurally a DA move.
3. **Language learning is affordance uptake, not stage progression.** van Lier (*The Ecology and Semiotics of Language Learning*, Kluwer 2004) and Quang Nhat Nguyen's 2025 synthesis "Affordance Theory in Language Education: A Multidimensional Framework" (*TESL-EJ* 29.3, Nov. 2025, DOI 10.55593/ej.29115a1) argue against "input + 1," "pushed output," and stage-based ZPD models because these "implicitly privilege single trajectories or normative target positions at odds with the multidimensional and emergent nature of learning." Nguyen's framework proposes five interconnected affordance dimensions — *perceptibility, learning valence, compositionality, normativity, and intentionality* — which together describe the kind of multidimensional landscape the Cube is.
4. **A sentence wants something next.** Process-writing pedagogy (Murray 1972; Elbow; Sommers; Perl) and Paz's *El arco y la lira* converge on the claim that the unfinished utterance generates its own next move. Murray: "writing is not what the writer does after the thinking is done; writing is thinking." Paz: "la técnica poética no es transmisible, porque no está hecha de recetas sino de invenciones que sólo sirven a su creador."
5. **Graph-based learner models are an active research frontier.** Bull & Kay's Open Learner Models (*IJAIED* 17:2, 2007; in *International Handbook of Metacognition and Learning Technologies*, Springer 2013) and a 2024–2025 wave of knowledge-graph-driven adaptive learning work — Ocheja, Flanagan, Dai & Ogata, "How Good is ChatGPT in Giving Adaptive Guidance Using Knowledge Graphs in E-Learning Environments?" (arXiv:2412.03856, Dec. 2024); Xie et al. in *Scientific Reports* (2025); Hou et al. in Springer LNCS (2025); and the KnowLP paper "GraphRAG-Induced Dual Knowledge Structure Graphs for Personalized Learning Path Recommendation" (arXiv:2506.22303, 2025) — demonstrate that graph traversal can be the engine of next-step selection. Ocheja et al. (2024) describe the operating principle: "the knowledge graph's role in assessing a student's comprehension of topic prerequisites. Depending on the categorized understanding (good, average, or poor), the LLM adjusts its guidance, offering advanced assistance, foundational reviews, or in-depth prerequisite explanations, respectively."

The mechanism, in one sentence: **the sentence the writer just made is a node in a graph; the edges it carries and the edges it could carry but didn't, read against PCIC/CEFR diagnostic windows and the poetic tensions named by Paz, Bloom, and the Sentence Engine, jointly produce the unique next prompt that is in-ZPD and answers the sentence's strongest unmet pull.**

---

## Layer A — Proficiency-Reading: How the Cube Knows Where the Writer Is

### A1. PCIC and CEFR Companion Volume as the dimensional substrate

The *Plan Curricular del Instituto Cervantes. Niveles de referencia para el español* (Instituto Cervantes & Biblioteca Nueva, 2006, 3 vols.) is the operative Spanish-specific reference. Its architecture is exactly what the Cube needs: **twelve inventories organized into five components** — gramatical, pragmático-discursivo, nocional, cultural, and de aprendizaje — calibrated to CEFR A1–C2. Each inventory is granular enough to be read off a single sentence: a sentence's *desplazamiento de la perspectiva temporal* (ampliación del dominio del presente al pasado o al futuro) places it on a PCIC scale; its melodic patterns, modal values, and intonational stance place it on others. The PCIC is, in effect, a pre-built dimensional reading of any Spanish utterance.

The CEFR Companion Volume (Council of Europe 2020; authors Brian North, Enrica Piccardo, Tim Goodier) extends the original framework with descriptor scales for **mediation, online interaction, plurilingual/pluricultural competence**, and new scales for "Giving Information," "Reading as a Leisure Activity," and "Using Telecommunications." Mediation in particular — including the intralingual form, reformulating Spanish in Spanish for a different audience or register — is precisely what the Cube's Lateral axis does. The Companion Volume thus authorizes Lateral movement as a measurable proficiency dimension, not just a stylistic flourish.

### A2. ZPD, scaffolding, Dynamic Assessment

The Cube's emergence rule must operate inside the Zone of Proximal Development (Vygotsky 1978; Wood, Bruner & Ross 1976). Lantolf & Poehner's program provides the operationalization: two DA concepts are directly importable — **microgenesis** (development that unfolds over a single interaction, exactly the scale at which the Cube operates) and **transcendence** (tracking learner development across tasks more complex than the original, exactly what the Cube's Vertical axis is). The Cube is structurally a DA instrument; it does not need a separate "diagnose, then teach" architecture.

### A3. Swain's Output Hypothesis

Krashen's i+1 is the wrong analogue for a writing tool because it concerns input. Swain (1985, 1995) supplies the right one: **output as noticing/triggering function** — "in producing the target language, learners may notice a gap between what they want to say and what they are able to say." The Cube's center is precisely this gap made visible. Every sentence the writer produces is a hypothesis-test (Swain's hypothesis-testing function) and a site of metalinguistic reflection (Swain's metalinguistic function). The Cube's Learning face is the formalization of Swain's reflective function.

### A4. CAF and the smallest diagnostic unit

Housen, Kuiken & Vedder (2012) is the canonical reference. The operationalization: **complexity** measured per AS-unit or T-unit (clauses ÷ T-units; subordinate clauses ÷ T-units; mean length of T-unit); **accuracy** measured as error-free AS-units ÷ total AS-units, or the Weighted Clause Ratio (Cambridge *ARAL*); **fluency** measured as words per minute or per T-unit. Crucially, all of these are computable on a single sentence.

### A5. Diagnostic writing assessment (Knoch)

Ute Knoch's *Diagnostic Writing Assessment: The Development and Validation of a Rating Scale* (Peter Lang 2009) and her 2011 *Assessing Writing* paper argue that diagnostic rating scales must be **data-based and linguistically grounded**: "Unless the underlying framework of a rating scale takes some account of linguistic theory and research in the definition of proficiency, the validity of the scale will be limited" (Knoch 2011). Her six factors — general writing ability, hedging/interpretation, content, description, repair fluency, paragraphing — establish that a diagnostic reading must be multi-dimensional, not a single score. The Cube's faces are exactly this multi-dimensionality.

### A6. Spanish-specific diagnostic windows

Empirical L2 Spanish research identifies specific morphosyntactic structures that yield disproportionate diagnostic power on a single sentence. Salaberry (1999; "L2 Spanish tense-aspect development," 2024 review) and Domínguez et al. (2013) document the Default Past Tense Hypothesis: beginner L1-English/L2-Spanish learners "first mark tense (i.e., past) but not aspect (i.e., perfective vs. imperfective) by defaulting to the preterite. Only at intermediate proficiency levels do they begin to mark aspect more systematically." Kissling (*Modern Language Journal* 2022) confirms the preterite/imperfect contrast is "notoriously difficult to acquire." Subjunctive use, clitic pronoun placement, ser/estar choice, dative-experiencer constructions (*a Juan le gusta…*), agreement (gender/number/person), discourse connectives (*mientras, aunque, como si, sin que, hasta que*), and register markers (*tú/vos/usted, vosotros/ustedes*) each add an independent diagnostic dimension. These are the Cube's diagnostic edges on the Grammar/Vertical axis.

### A7. RAE/ASALE descriptive grammar

The RAE/ASALE *Nueva gramática de la lengua española* (2009–2011), together with the *Diccionario panhispánico de dudas* and the PCIC's stated *central-norte peninsular preferente* with explicit acknowledgment of pluricentric norms, give the Cube a defensible answer to "which Spanish?" — the writer's actual sentences, read against pluricentric descriptive grammar, not prescribed to a single norm.

---

## Layer B — Poetic-Generative Tension: What the Current Sentence Wants Next

### B1–B2. The sentence as discovery (Murray, Elbow, Sommers, Perl)

Murray's "Teach Writing as a Process, Not Product" (1972) establishes the central claim: the draft, not the writer, knows what it wants. Murray (1981): revision "is not just clarifying meaning, it is discovering meaning and clarifying it while it is being discovered." Elbow (*Writing With Power*) adds the recipe-not-method stance: the writer chooses among moves rather than executing a stage. Sommers's revision studies and Perl's composing-process research show that the text talks back. The Cube formalizes "text-talks-back" as edge affordances on the current node.

### B3–B4. Affordances of a Spanish sentence

van Lier (2004), drawing on Gibson (1979), defines a learning affordance as "action potential" in the environment — neither subjective nor objective but *relational*, realized only when the learner takes it up. Nguyen (*TESL-EJ* 29.3, 2025) extends this with five dimensions — perceptibility, learning valence, compositionality, normativity, and intentionality — and observes that "over-rigid and deterministic" traditional frameworks are "increasingly insufficient for capturing the emergent complexity of contemporary language learning environments." This is the strongest theoretical backing for the user's anti-curriculum stance: **the Cube's geometry is a multidimensional affordance landscape, not a path.**

A Spanish sentence affords specific next moves: a present-tense scene affords an imperfective rewrite; an adversative clause affords a *como si* counterfactual; an experiencer affords dative-flip (*me gusta* vs. *yo amo*); a literal motion verb affords metaphoric extension. These affordances are exactly the typed edges the user has named (CAN_REWRITE_AS, HAS_TENSE_VARIANT, DEEPENS_INTO, USES_TECHNIQUE).

### B5. Felicity conditions extended

Austin and Searle's felicity conditions for speech acts can be extended: a sentence "opens" certain conditions — descriptive, evaluative, narrative, hypothetical. The Cube reads these openings as edges-out.

### B6. Style imitation as discovery — Paz, Cortázar, Bloom

Octavio Paz, *El arco y la lira* (FCE, 1956; 2nd ed. 1967): "el estilo es el punto de partida de todo intento creador; y por eso mismo, todo artista aspira a trascender ese estilo comunal o histórico. Cuando un poeta adquiere un estilo, una manera, deja de ser poeta y se convierte en constructor de artefactos literarios." This is decisive for the Author Lens face: lenses are **departure points, not destinations**. The Cube must never push a Borgesian rewrite as a goal — only as a probe that helps the sentence find what it didn't yet know it wanted. Cortázar's *figura* authorizes the Cube's claim that a sentence belongs to a larger pattern emerging only through more sentences — the graph *as* figura.

Harold Bloom's six revisionary ratios (*The Anxiety of Influence*, 1973) — **clinamen** (swerve), **tessera** (antithetical completion), **kenosis** (self-emptying), **daemonization** (counter-sublime), **askesis** (self-purgation), **apophrades** (return of the dead) — are the right grain for the influence edges. Bloom never quite committed to a developmental reading: as multiple sources note, the ratios "may or may not represent developmental stages of the ephebe." For the Cube, this is good news: the ratios should be modeled as **available moves**, not stages.

### B7–B8. Computational creativity: Boden

Margaret Boden's *The Creative Mind* (1990; 2nd ed. 2004) distinguishes three creative types: **combinational** (familiar elements in unfamiliar combinations), **exploratory** (traversal of a defined conceptual space), and **transformational** (changing the enabling constraints of the conceptual space itself). The Cube's three axes map onto Boden cleanly: Lateral movement is combinational; Vertical movement is exploratory; Depth is locally transformational — it changes which constraints govern the word/sentence.

Samuel Schapiro, Jonah Black & Lav R. Varshney's "Transformational Creativity in Science: A Graphical Theory" (arXiv:2504.18687, April 2025; Best Short Paper, 16th International Conference on Computational Creativity, June 2025) provides the formal scaffolding: "We prove that modifications made to axioms of our graphical model have the most transformative potential." Modeling creativity as a directed acyclic graph whose edges and vertices are themselves revisable is a direct structural analogue of the Cube.

---

## Layer C — The Braid: How Proficiency-Reading and Poetic Tension Intersect

This is where the Cube earns its keep. Layer A tells the system where the writer is. Layer B tells the system what the sentence wants. The braid is the rule: **the next prompt is the highest-poetic-tension move that is still inside the writer's ZPD, on a face or edge the writer has not yet sat in for this sentence (or this kind of sentence).**

### C1. The intersection rule

Let the current center be sentence *s*. The Cube computes:

- `proficiency_signature(s)` — a reading on PCIC inventories + CAF measures + diagnostic-window detectors (aspect, mood, clitics, register).
- `tensions(s)` — the unresolved affordances: which Sentence Engine slots are empty (perception present but no motion verb? motion present but no emotional pressure?); which edges are open but untraversed; which faces have not yet been sat in for this center.
- `zpd_envelope(writer)` — the writer's recent traversal history defines what is reachable: features that have appeared in the writer's last *n* sentences with growing accuracy are within ZPD; features that have never appeared are outside it; features that appeared once and failed are *exactly* on the ZPD frontier and have priority.

The next prompt maximizes (tension × novelty) subject to (move ∈ zpd_envelope). When ties occur, prefer moves that activate underused faces — this is what prevents literary over-reach (G4 below).

### C2. Adaptive learning systems theory, scoped tightly

Bull & Kay's Open Learner Model framework provides the architectural grammar. Bull & Kay (2013): an OLM has "a domain model, a pedagogical model and a learner model… The domain model consists of subject of study, such as the topics, concepts and interrelationships of concepts. The learner model maintains the system's inferences about an individual learner's understanding of the domain knowledge based on his/her interaction with the system." In the Cube these collapse into one structure: the property graph. Domain model = the type system of faces, edges, axes; pedagogical model = the emergence rule; learner model = the actual graph the writer has built. No hidden state, no opaque vector, no skill-meter — the writer can literally see their own learner model because it is their own writing rendered as a graph.

The 2024–2025 KG-based adaptive learning wave (Ocheja et al. 2024 with GPT-3.5/4 as the LLM mediator; the MDPI *Electronics* 2025 survey defining a learning path as "an ordered sequence of knowledge units that supports learners' progressive advancement"; the KnowLP paper arXiv:2506.22303 demonstrating backward prerequisite traversal from a target concept; Hou et al. 2025: "We provide a KG-based learning path recommendation system to aid in English language acquisition by producing a series of lessons intended to successfully lead learners from their present proficiency level to their desired level") shows this approach is no longer speculative.

### C3. The graph is the learner model — structural defense

This is the move that makes the Cube novel. In most adaptive systems the graph is a *map* and the learner model is a separate set of probabilities over the map. The Cube's claim is that for monolingual-target-language writing improvement, the writer's own sentence graph is itself a sufficient and self-interpreting learner model. Three reasons:

1. **Writing is the assessment.** Per Lantolf & Poehner, DA dissolves the diagnose/teach split; per Knoch, diagnostic rating is multi-dimensional and grounded in textual evidence. The graph is the evidence, not a summary of it.
2. **Proficiency is not separable from what the writer has done.** Hunt's T-units and Foster-Tonkyn-Wigglesworth's AS-units are direct readings of text. Any more abstract representation is a lossy compression.
3. **Open learner models are pedagogically superior when readable.** Bull & Kay's central finding is that learners who inspect their own model engage in deeper metacognition. The Cube's graph *is* the open learner model.

### C4. Three problems collapse into one

The "graph completion" problem, the "creative writing prompt" problem, and the "Spanish-pedagogy" problem collapse into one question — "which untraversed edge from the current node has maximum (tension × novelty) inside ZPD?" — only because the graph encodes all three layers simultaneously. This is what makes the model coherent rather than three glued-together systems.

---

## Layer D — Immersion and the Monolingual Constraint

### D1–D2. Krashen, Swain, ALG

Krashen's Comprehensible Input and Swain's Comprehensible Output bracket the Cube. J. Marvin Brown's Automatic Language Growth (AUA Bangkok; manuscript 1992) provides the strong-form monolingual stance: silent period, no L1 mediation, "Listen, Don't speak, Be patient." Brown's central claim: "adults actually retain this ability but obstruct it by using abilities they have gained to consciously study, practice, and analyze language." ALG is too strong for a writing instrument — writing requires output from the start — but its insight that L1 interference is actively obstructive reinforces the Cube's monolingual commitment.

### D3. Dogme ELT — emergent language

Scott Thornbury & Luke Meddings's Dogme ELT / Teaching Unplugged (manifesto 2000, "A Dogma for EFL"; book *Teaching Unplugged*, Delta 2009, British Council ELTons Innovation Award 2010) is the closest existing pedagogy to what the Cube wants. Thornbury's three principles — **conversation-driven, materials-light, focused on emergent language** — translate directly: the writer's own sentence drives the prompt; no pre-built curriculum; the prompt emerges from what just happened. Meddings & Thornbury (2009): "language, rather than being acquired, will emerge." The Cube is a writing-Dogme instrument.

### D4. Monolingual lexicography as a foldable field

María Moliner's *Diccionario de uso del español* (Gredos, 1st ed. 1966–67; 4th ed. 92,700 entries, 190,000 meanings) is a structural exemplar. Moliner's innovation was organizing by *use* rather than by alphabet alone, with semantic families, synonym blocks, and cross-references making the dictionary itself a navigable field. Combined with the RAE/ASALE *Diccionario de la lengua española* (pluricentric since 2014) and Seco's *Diccionario del español actual* (corpus-based), the Spanish lexicographic tradition models language as exactly the kind of nodes-with-typed-cross-references the Cube's WordLens face traverses. The Cube's "nearby door" concept is a Moliner cross-reference.

### D5. False immersion and the fallback edge

When does the Cube permit English? Only as a typed fallback edge marked GLOSS_FALLBACK with attributes {reason, expiry_condition}. This makes English an explicit, accountable, time-bound visitor — not a primary edge. Principle: English glosses are temporary scaffolds (Wood-Bruner-Ross; scaffolding fades) on otherwise monolingual edges.

### D6. The lexicographic tradition is the model

Moliner, RAE/ASALE, Seco, CREA, CORPES — the Spanish-from-inside-Spanish reference field is large and self-sufficient. The Cube's immersion commitment is continuous with what literate Spanish speakers actually do when they consult a Spanish dictionary in Spanish.

---

## Layer E — Learning as a Face, Not a Layer

### E1. The face, not the meta-layer

Donald Schön's *The Reflective Practitioner* (Basic Books 1983) and *The Design Studio* (RIBA 1985) establish the studio model: reflection is one mode among others the practitioner enters, not a meta-layer routing all other modes. Schön: a practitioner engages in a "reflective conversation with the situation," reframing while acting, not after the fact. The Cube's Learning face is precisely this — a place the writer enters *occasionally* to ask "what did I just do? what changed?"

Ericsson, Krampe & Tesch-Römer (*Psychological Review* 100:3, 1993, p. 368) define **deliberate practice** verbatim: "In comparison to play, deliberate practice is a highly structured activity, the explicit goal of which is to improve performance. Specific tasks are invented to overcome weaknesses, and performance is carefully monitored to provide cues for ways to improve it further." Deliberate practice is not identical to writing-as-discovery; it is what the writer does *when sitting on the Learning face*. By making Learning a face, the Cube respects the deliberate-practice tradition without subordinating writing to it.

Flower & Hayes's cognitive-process model (*College Composition and Communication* 32:4, December 1981) makes the same architectural point in a different vocabulary: planning, translating, and reviewing are hierarchical and embedded processes, not linear stages; writers move between them. Their "monitor" is meta-control deciding which process to enter — in the Cube, that monitor is **the writer**, not the system.

### E2. The writer can choose not to sit there

This is the architectural payoff. A writer working in Spanish to *write* — not to learn — can stay on Perception → Generation → Variation indefinitely. The Learning face is available, not mandatory. This is what distinguishes a writing instrument from a course.

### E3. The shape of a Learning-face prompt

Learning-face prompts are retrospective and comparative: "Compare the verb in your third sentence and your sixth — what changed in tense or aspect?" "Which of these three rewrites used the imperfect because the scene needed atmosphere, and which used it because it was suggested?" Learning-face prompts read the graph back to the writer.

### E4. Memory vs Learning

Memory is the Reliquary — saved nodes and edges with retrieval affordances. Learning is *noticing what changed in the writer*: which constructions moved from absent to attempted to controlled, which lexical items moved from never-used to used-once to used-with-variation. Memory is the graph; Learning is the *diff over time on the graph*. Distinct, both useful.

---

## Layer F — Honest Critique of the User's Prompt Materials

The user has produced four prompt-sequencing artifacts. Each is salvageable as substrate; none should be installed as a fixed sequence.

### F1. The six-prompt series

**Well-designed:** Each prompt names a specific affordance on the previous output. Prompt 2 ("combine those into 2 longer sentences using *mientras, como si,* or *aunque*") is structurally an edge traversal. Prompt 5 ("rewrite in three voices") is lateral movement. Prompt 6 (WordLens harvest) is a depth move on selected nodes. The series respects the Sentence Engine and produces real graph growth.

**Where it lapses into curriculum:** The fixed order. Prompt 2 always follows Prompt 1; Prompt 5 always asks for three voices including a "slightly Borgesian" one. This is exactly the literary over-reach risk (G4) — it presupposes every writing session wants to end Borgesian. A correct emergence rule would *select* among these moves based on what the current sentences afford and what the writer's recent graph shows.

**Fix:** Treat the six prompts as a *menu of moves* available at any point. The Borgesian voice is one of dozens of lateral options; it should appear when the sentence invites it (paradox compression, time-loop syntax), not by schedule.

### F2. The seven-level Graduated Creative Prompts

**Well-designed:** The seven levels (naming → motion → inner weather → tense shift → style shift → clause building → author lens) are a clean exposition of the dimensions the Cube spans.

**Where it lapses:** The word "graduated." Level 7 is positioned as more advanced than Level 1, but a beginner can attempt an author-lens move on a single noun phrase, and a C2 writer can return to Level 1 to discipline their naming. The "levels" are not levels — they are **faces and axes labeled as a staircase**.

**Fix:** Rename "levels" to "lenses" or "moves." The author-lens move is not advanced; it is one of seven (or more) moves available at every node.

### F3. The seven-step today's-progression

**Well-designed:** It is a single-session arc, not a curriculum claim. Most writers would recognize it as a credible session.

**Where it lapses:** It fossilizes one possible session as canonical. A writer who arrived with emotional pressure should not be required to start with Scene.

**Fix:** Frame this as a *recipe*, in Elbow's sense — one of many session shapes, drawn from the same Cube.

### F4. The seven Cube stages — the central critique

The seven Cube stages — Surface fluency, Variation, Expansion, Spelunking, Transfer, Voice, Memory — **are not stages; they are faces relabeled as a progression.** Specifically:
- "Surface fluency" is Generation.
- "Variation" is Variation/Copia (already a face).
- "Expansion" is what the Vertical axis does (it is movement, not place).
- "Spelunking" is Depth (already a face).
- "Transfer" is Situation (already a face) or the Memory→Generation edge.
- "Voice" is sustained Lateral movement over time, or possibly its own face.
- "Memory" is Memory (already a face).

The seven stages are six of the eight faces plus one axis, dressed as a sequence. **This is the most important place the corrected model must drop staging language entirely.** The faces exist; sequencing them confuses the geometry.

### F5. The refined model — a small rule set

- **Rule 0 (Identity):** The center is always a sentence-sized unit of situated Spanish. No prompt can be issued that does not act on the current center.
- **Rule 1 (Read the node):** Compute `proficiency_signature(s)` against PCIC inventories, CAF, and Spanish diagnostic windows (aspect, mood, clitics, ser/estar, register).
- **Rule 2 (Read the affordances):** Enumerate `available_edges(s)` — typed Structural, Transformational, Situational, Influential — open but untraversed.
- **Rule 3 (Read the history):** Compute `zpd_envelope(writer)` from the last *n* nodes.
- **Rule 4 (Score moves):** score = (poetic_tension × novelty × face_underuse) × in_ZPD_indicator. Tension is the strength of the affordance (a sentence with empty Emotional Pressure scores high on emotional-pressure edges).
- **Rule 5 (Constrain for ecology):** Disqualify moves past the ZPD frontier; disqualify recently traversed faces unless writer asks to stay.
- **Rule 6 (Permit refusal):** Writer can answer "no, ask me differently." This is DA mediation responsiveness.
- **Rule 7 (Learning is invited, not imposed):** The Learning face is offered periodically, not as a routing layer.

This rule set replaces the four artifacts. The artifacts become training data and worked examples, not the engine.

---

## Layer G — Risks and Failure Modes

**G1. Emergent prompting becomes random.** *Mitigation:* Rules 4–5 above. Tension scoring is calibrated to Sentence Engine slot-emptiness and edge-untraversedness, both objectively computable.

**G2. The Cube under-prompts and the writer plateaus.** *Mitigation:* Plateau detectors — if the last *k* sentences have not increased CAF complexity or instantiated new constructions, raise the tension threshold and bias toward edges the writer has avoided. This operationalizes Knoch's diagnostic function.

**G3. False immersion.** *Mitigation:* GLOSS_FALLBACK edge (D5). English permitted, marked, time-bound.

**G4. Literary over-reach.** *Mitigation:* Two levers. (a) `face_underuse` forces visits to Situation, Spoken-Form, etc. (b) Author-lens edges fire only when the sentence exhibits the technique-affordance (a paradox-laden sentence affords Borges; an object-to-feeling pivot affords Neruda). This is precisely Paz's claim that style is a departure point.

**G5. New curriculum under emergent dressing.** *Mitigation:* Strict prohibition on global session shapes. The system never has a plan for the session; it only has a rule for the next move. If the writer detects "this always goes Scene → Motion → Pressure," the system has failed.

**G6. Sentence-quality optimization erases voice.** *Mitigation:* Voice is a stable face, not a variable. Track voice-fingerprint markers across the writer's graph (preferred connectives, characteristic adjective density, recurring metaphor families) and *protect them* — surface as flagged any move that would erase a voice marker rather than develop it. "Lateral movement is where your personality survives."

**G7. The graph becomes unwieldy.** *Mitigation:* Working set = recent *n* + flagged-as-important + nodes reachable in *m* edges from current center. Memory face handles full retrieval.

**G8. The system trains the writer in its own ontology.** *Mitigation:* The Cube's geometry should remain mostly implicit; the writer experiences prompts, not edge-type names. The graph is open (Bull & Kay) but the writer is not required to read it as graph theory.

---

## Recommended Refined Conceptual Model

The Vallarta Vox / TripSpanishTutor Cube is one geometric object with four kinds of element, governed by one emergence rule. There are no stages. There are no sequences. There is no curriculum. There is the writer, the sentence, the geometry, and the rule.

**Elements:**
- **Center:** A Spanish sentence/phrase/word as situated utterance — Halliday's clause-as-message (with its three metafunctions: ideational/transitivity, interpersonal/mood, textual/theme-rheme) × Bakhtin's addressed, already-spoken-about utterance: "Addressivity, the quality of turning to someone, is a constitutive feature of the utterance" (Bakhtin, "The Problem of Speech Genres," 1986, p. 95).
- **Faces (8):** Perception, Generation, Variation, Depth, Situation, Memory, Spoken-Form, Learning.
- **Edges (typed):** Structural, Transformational, Situational, Influential — at technique granularity. Bloom's six revisionary ratios as second-order edges.
- **Vertices:** Convergence points where multiple edges meet.
- **Axes (3):** Vertical (grammatical complexity), Lateral (register/voice), Depth (etymology/metaphor/cave).

**Single emergence rule:** Given the current center *s* and the writer's graph *G*, the next prompt is the move that maximizes (poetic_tension(s, edge) × novelty(edge, G) × face_underuse(face_of(edge), G)) subject to in_ZPD(edge, writer). Ties broken by writer's recent preferences; refusals respected; Learning offered periodically.

**Three sources of constraint** the Cube reads against:
1. **PCIC** (twelve inventories × five components × six levels) for proficiency-signature reading.
2. **The Sentence Engine** (Perception + Motion + Modifier + Emotional Pressure + Relation, mapped to Halliday's metafunctions) for tension reading.
3. **The graph itself** (the writer's traversal history) for novelty and ZPD reading.

The model is sound. The refinement is to *trust the geometry to produce the prompts* and to demote the user's existing sequences from architecture to substrate.

---

## Caveats

1. **Boden-style transformational creativity is rare and not the system's target.** The Cube primarily operates in combinational and exploratory modes; transformational moves (the writer restructures their own ontology of what Spanish can do) are emergent gifts, not engineered outcomes.
2. **The graph-as-learner-model claim is structurally novel.** Most operational adaptive learning systems use vector/Bayesian models; KG-based learner models in adaptive language learning are an active 2024–2025 research frontier — Bull & Kay (2007, 2013) provide the OLM foundation; Ocheja et al. (arXiv:2412.03856, 2024) demonstrate the LLM-mediated form; Schapiro/Black/Varshney (arXiv:2504.18687, ICCC 2025 Best Short Paper) provide the formal graphical theory — but the approach has not been validated at scale in long-term L2 Spanish settings. This is a defensible research bet, not a proven product.
3. **The Sentence Engine is a default lens, not universal.** The user already acknowledges this. Transactional sentences (asking for the bill, giving directions), argumentative sentences, and ritualized social-formula sentences will not decompose cleanly into Perception + Motion + Pressure + Relation. The Cube needs at least two more lenses (transactional, expository) to avoid lyric-bias (G4 again).
4. **PCIC's Spain-norm preference is real.** The PCIC explicitly takes "la variedad centro-norte peninsular española" as preferred while acknowledging others. For a Vallarta-based instrument, Mexican Spanish (ustedes not vosotros, distinct vocabulary, voseo absent) is the relevant working norm. The Cube must read PCIC pluricentrically — the inventories are dimensions; the norm is the writer's actual region of use.
5. **Bloom's revisionary ratios are contested.** They are productive metaphors more than predictive psychology. Use them as edge-types, not as a developmental theory of the writer.
6. **Dynamic Assessment evidence is strong but small-scale.** Most DA studies are classroom-sized; AI-mediated DA is emerging — Nguyen, "Idiographic self-regulated affordance uptake in AI-mediated language learning," *Cogent Education* (Taylor & Francis), published online 1 November 2025, DOI 10.1080/2331186X.2025.2581414, analyzes only four Vietnamese adults across eight ChatGPT sessions — but the long-term effects are not yet known.
7. **The instrument respects writing-as-an-end-in-itself.** This is the most important caveat. If the Cube ever optimizes for "the writer learned X grammar point" over "the writer wrote what they meant," it has betrayed its purpose. Learning is a face the writer may visit; writing is what the writer does.
