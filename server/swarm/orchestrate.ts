// server/swarm/orchestrate.ts
//
// Deterministic orchestrator. Loops translator -> (deterministic conjugator fill)
// -> validator -> critic, retrying up to N=2 with a hint. Never a model itself.

import {
  TranslateIn, TranslateOut, ValidateOut, CritiqueOut,
  TranslateInZ, TranslateOutZ, ValidateOutZ, CritiqueOutZ,
} from "./contracts";
import { conjugate, ConjugateRequest, Mood, Tense, Person } from "../conjugator";

export interface SwarmDeps {
  translator: (input: TranslateIn) => Promise<TranslateOut>;
  validator:  (out: TranslateOut)  => Promise<ValidateOut>;
  critic:     (out: TranslateOut, ctx: TranslateIn["trail_context"]) => Promise<CritiqueOut>;
}

export interface SwarmResult {
  surface: TranslateOut;
  critique: CritiqueOut;
  attempts: number;
  fellBack: boolean;
}

// Replace any {{lemma.mood.tense.person}} placeholders in `es` with deterministic forms.
function fillForms(out: TranslateOut): TranslateOut {
  const re = /\{\{([a-záéíóúñ]+)\.(ind|sub|imp|cond)\.(pres|pret|imp|fut|pluperf|perf)\.(1s|2s|3s|1p|2p|3p|2s_vos)\}\}/gi;
  out.es = out.es.replace(re, (_, lemma, mood, tense, person) => {
    const req: ConjugateRequest = { lemma, mood: mood as Mood, tense: tense as Tense, person: person as Person };
    try { return conjugate(req).form; } catch { return `[?${lemma}]`; }
  });
  return out;
}

export async function runSwarm(rawInput: TranslateIn, deps: SwarmDeps): Promise<SwarmResult> {
  const input = TranslateInZ.parse(rawInput);

  for (let attempt = 1; attempt <= 3; attempt++) {
    const t  = TranslateOutZ.parse(await deps.translator(input));
    if (t.needs_conjugator) fillForms(t);

    const v = ValidateOutZ.parse(await deps.validator(t));
    if (!v.ok) { input.retry_hint = v.retry_hint ?? null; continue; }

    const c = CritiqueOutZ.parse(await deps.critic(t, input.trail_context));
    if (c.register < 3 || c.regional < 3 || c.moment < 3) continue;

    return { surface: t, critique: c, attempts: attempt, fellBack: false };
  }

  // Graceful fallback — UI shows a "un momento" placeholder.
  return {
    surface: {
      es: "Un momento…",
      en: "One moment…",
      alts: [],
      annotations: [],
      needs_conjugator: false,
      variant_notes: {},
    },
    critique: { register: 3, regional: 3, moment: 3, note: "fallback" },
    attempts: 3,
    fellBack: true,
  };
}
