<!-- TripSpanishTutor — PR template. Keep it short. -->

## What
<!-- 1-2 sentences. What changes and why. -->

## Trail / Surface touched
- [ ] learner model (shared/tutor-schema.ts)
- [ ] trails / scenelets
- [ ] conjugator (server/conjugator/)
- [ ] drills (unevaluative invariant preserved?)
- [ ] augmented chat surface
- [ ] swarm prompts (server/swarm/prompts.ts)
- [ ] content pack (server/content/)

## Perplexity reviewer, please check
1. No evaluative language leaked into user-facing strings (banned: *correct, wrong, score, XP, streak*).
2. No new verb forms generated outside `server/conjugator/`.
3. Schema changes mirrored in `shared/tutor-schema.ts` AND iOS codegen (when iOS lands).
4. Every new scenelet line has a `SwarmAttestation` (or is explicitly hand-authored).
5. Cite files + lines for any concern.

## Test
<!-- How did you verify? At minimum: `npx tsx server/conjugator/tests/smoke.test.ts` if conjugator changed. -->

## Screenshots / Surfaces
<!-- Drop chat-surface screenshots here for any UI work. -->
