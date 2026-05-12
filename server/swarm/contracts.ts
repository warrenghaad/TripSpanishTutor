// server/swarm/contracts.ts
//
// Typed JSON contracts for the translator / validator / critic agents.
// Wire format is enforced by Zod — agents that drift from the schema fail closed.

import { z } from "zod";

// ---------- Translator ----------

export const TranslateInZ = z.object({
  utterance_en: z.string().min(1),
  trail_context: z.object({
    place: z.string().optional(),
    moment: z.string().optional(),
    poem_id: z.string().optional(),
    stanza: z.number().int().optional(),
  }).default({}),
  target_skills: z.array(z.string()).default([]),
  target_variant: z.enum(["es-MX", "es-ES", "es-AR", "neutral"]).default("es-AR"),
  retry_hint: z.string().nullable().optional(),
});
export type TranslateIn = z.infer<typeof TranslateInZ>;

export const AnnotationZ = z.object({
  token: z.string(),
  skill: z.string().optional(),
  note: z.string().optional(),
});

export const TranslateOutZ = z.object({
  es: z.string(),
  en: z.string(),
  alts: z.array(z.string()).default([]),
  annotations: z.array(AnnotationZ).default([]),
  needs_conjugator: z.boolean().default(false),
  variant_notes: z.record(z.string()).default({}),
});
export type TranslateOut = z.infer<typeof TranslateOutZ>;

// ---------- Validator ----------

export const FindingZ = z.object({
  token: z.string(),
  issue: z.enum(["unknown_lemma", "wrong_inflection", "register_mismatch", "ambiguous"]),
  evidence: z.string().optional(),
});

export const ValidateOutZ = z.object({
  ok: z.boolean(),
  findings: z.array(FindingZ).default([]),
  retry_hint: z.string().nullable().default(null),
});
export type ValidateOut = z.infer<typeof ValidateOutZ>;

// ---------- Critic ----------

export const CritiqueOutZ = z.object({
  register: z.number().int().min(1).max(5),
  regional: z.number().int().min(1).max(5),
  moment:   z.number().int().min(1).max(5),
  note: z.string().optional(),
});
export type CritiqueOut = z.infer<typeof CritiqueOutZ>;
