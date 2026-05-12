// server/conjugator/index.ts
//
// Deterministic Spanish conjugator. LLMs propose; the conjugator disposes.
// v0: regular -AR/-ER/-IR + ~12 high-frequency irregulars (estar, ser, ir, haber,
// tener, hacer, decir, poder, querer, saber, ver, dar). Expand from irregulars.json.
//
// Public API matches the project-plan PDF.

import irregulars from "./irregulars.json" with { type: "json" };

export type Mood   = "ind" | "sub" | "imp" | "cond";
export type Tense  = "pres" | "pret" | "imp" | "fut" | "pluperf" | "perf";
export type Person = "1s" | "2s" | "3s" | "1p" | "2p" | "3p" | "2s_vos";
export type Variant = "es-MX" | "es-ES" | "es-AR" | "neutral";

export interface ConjugateRequest {
  lemma:   string;
  mood:    Mood;
  tense:   Tense;
  person:  Person;
  variant?: Variant;
}

export interface ConjugateResult {
  form: string;
  source: "irregular-table" | "regular-rule";
  notes?: string;
}

type IrregularsFile = Record<string, Record<string, Record<string, Partial<Record<Person, string>>>>>;
const TABLE = irregulars as IrregularsFile;

// ----- Regular paradigms (indicative present only in v0; expand). -----

const REG_PRES_AR: Record<Person, string> = {
  "1s": "o", "2s": "as", "3s": "a", "1p": "amos", "2p": "áis", "3p": "an", "2s_vos": "ás",
};
const REG_PRES_ER: Record<Person, string> = {
  "1s": "o", "2s": "es", "3s": "e", "1p": "emos", "2p": "éis", "3p": "en", "2s_vos": "és",
};
const REG_PRES_IR: Record<Person, string> = {
  "1s": "o", "2s": "es", "3s": "e", "1p": "imos", "2p": "ís", "3p": "en", "2s_vos": "ís",
};

function regularPresent(lemma: string, person: Person): string | null {
  const stem = lemma.slice(0, -2);
  const ending = lemma.slice(-2);
  if (ending === "ar") return stem + REG_PRES_AR[person];
  if (ending === "er") return stem + REG_PRES_ER[person];
  if (ending === "ir") return stem + REG_PRES_IR[person];
  return null;
}

// ----- Public API -----

export function conjugate(r: ConjugateRequest): ConjugateResult {
  // 1. Irregular table wins.
  const fromTable = TABLE[r.lemma]?.[r.mood]?.[r.tense]?.[r.person];
  if (fromTable) return { form: fromTable, source: "irregular-table" };

  // 2. Regular rule for indicative present (v0 scope).
  if (r.mood === "ind" && r.tense === "pres") {
    const reg = regularPresent(r.lemma, r.person);
    if (reg) return { form: reg, source: "regular-rule" };
  }

  throw new Error(
    `[conjugator] no rule for ${r.lemma} ${r.mood}.${r.tense}.${r.person} ` +
    `(v0 covers irregular table + regular indicative present)`
  );
}

/**
 * For unevaluative drills: returns all forms a learner could "reach" and still be in-spec.
 * Includes the vos form on top of the tú form for Rioplatense work.
 */
export function acceptableForms(r: ConjugateRequest): string[] {
  const out = new Set<string>();
  try { out.add(conjugate(r).form); } catch { /* swallow */ }
  if (r.person === "2s") {
    try { out.add(conjugate({ ...r, person: "2s_vos" }).form); } catch { /* swallow */ }
  }
  return [...out];
}

/**
 * Reverse-parse a form to candidate slots. Ambiguity is normal (e.g. "estás" → 2s ind pres).
 * v0: scans the irregular table only; regular reverse-parse is in the backlog.
 */
export function parse(form: string): ConjugateRequest[] {
  const hits: ConjugateRequest[] = [];
  for (const [lemma, moods] of Object.entries(TABLE)) {
    for (const [mood, tenses] of Object.entries(moods)) {
      for (const [tense, persons] of Object.entries(tenses)) {
        for (const [person, f] of Object.entries(persons)) {
          if (f === form) {
            hits.push({ lemma, mood: mood as Mood, tense: tense as Tense, person: person as Person });
          }
        }
      }
    }
  }
  return hits;
}
