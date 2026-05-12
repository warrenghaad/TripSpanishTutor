// server/conjugator/tests/smoke.test.ts
//
// Smoke tests — runnable with `npx tsx server/conjugator/tests/smoke.test.ts`.
// No test framework dependency; throws on failure.

import { conjugate, acceptableForms, parse } from "../index";

function eq<T>(actual: T, expected: T, label: string) {
  const a = JSON.stringify(actual), b = JSON.stringify(expected);
  if (a !== b) throw new Error(`FAIL ${label}\n  expected: ${b}\n  actual:   ${a}`);
  console.log(`  ok  ${label}`);
}

console.log("conjugator smoke tests");

// Regular present
eq(conjugate({ lemma: "hablar", mood: "ind", tense: "pres", person: "1s" }).form, "hablo", "hablar 1s");
eq(conjugate({ lemma: "comer",  mood: "ind", tense: "pres", person: "3p" }).form, "comen", "comer 3p");
eq(conjugate({ lemma: "vivir",  mood: "ind", tense: "pres", person: "1p" }).form, "vivimos", "vivir 1p");

// Vos forms (Rioplatense — Borges country)
eq(conjugate({ lemma: "hablar", mood: "ind", tense: "pres", person: "2s_vos" }).form, "hablás", "hablar vos");
eq(conjugate({ lemma: "ser",    mood: "ind", tense: "pres", person: "2s_vos" }).form, "sos",    "ser vos");
eq(conjugate({ lemma: "tener",  mood: "ind", tense: "pres", person: "2s_vos" }).form, "tenés",  "tener vos");

// Irregulars
eq(conjugate({ lemma: "estar", mood: "ind", tense: "pres", person: "1s" }).form, "estoy", "estar 1s");
eq(conjugate({ lemma: "ir",    mood: "ind", tense: "pres", person: "3s" }).form, "va",    "ir 3s");

// acceptableForms returns both tú + vos for 2s
const acc = acceptableForms({ lemma: "tener", mood: "ind", tense: "pres", person: "2s" });
eq(acc.sort(), ["tenés", "tienes"], "tener 2s acceptableForms includes vos");

// parse
const hits = parse("estoy");
eq(hits.length > 0, true, "parse('estoy') finds at least one slot");
eq(hits[0].lemma, "estar", "parse('estoy') → estar");

console.log("all smoke tests passed");
