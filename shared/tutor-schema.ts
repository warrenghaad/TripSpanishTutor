// shared/tutor-schema.ts
//
// Schema additions for the TripSpanishTutor learning core.
// Sits BESIDE the existing schema.ts (users, journal_entries, dictionary_words);
// nothing here renames or migrates existing tables.
//
// Conventions:
//  - All learner-progress tables store BEHAVIOR (reaches, exposures), never grades.
//  - "inSpec" booleans live on drill rows; UI never reads them as right/wrong.
//  - Content packs (Borges, Travel) reference these tables via skill IDs.

import { sql } from "drizzle-orm";
import {
  pgTable, text, varchar, integer, real, boolean,
  timestamp, jsonb, primaryKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ---------- Learner model ----------

export const learners = pgTable("learners", {
  id:            varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  handle:        text("handle").notNull().unique(),
  locale:        text("locale").default("en-US"),
  targetVariant: text("target_variant").default("es-AR"), // Rioplatense by default for Borges work
  createdAt:     timestamp("created_at").defaultNow().notNull(),
});

export const skills = pgTable("skills", {
  id:            text("id").primaryKey(),          // e.g. "verb.estar.present.location"
  family:        text("family").notNull(),         // verb | vocab | phonology | pragmatic | etymology
  surface:       text("surface").notNull(),        // human-readable label
  cefr:          text("cefr"),                     // A1..C1
  prerequisites: jsonb("prerequisites").$type<string[]>().default([]),
});

export const learnerSkill = pgTable(
  "learner_skill",
  {
    learnerId:     varchar("learner_id").notNull().references(() => learners.id),
    skillId:       text("skill_id").notNull().references(() => skills.id),
    strength:      real("strength").default(0.0),  // 0..1, decays with half-life
    lastSeen:      timestamp("last_seen"),
    exposures:     integer("exposures").default(0),
    // Unevaluative: we record reaches (attempts) + reaches_in_spec separately.
    reaches:       integer("reaches").default(0),
    reachesInSpec: integer("reaches_in_spec").default(0),
  },
  (t) => ({ pk: primaryKey({ columns: [t.learnerId, t.skillId] }) })
);

// ---------- Trails ----------

export const trails = pgTable("trails", {
  id:          varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  learnerId:   varchar("learner_id").notNull().references(() => learners.id),
  packId:      text("pack_id"),                    // "travel.phx-pvr" | "borges.fervor" | ...
  label:       text("label").notNull(),            // "PHX → PVR · May 24-30" or "Fervor de Buenos Aires (1923)"
  status:      text("status").default("draft"),    // draft | active | completed
  generatedBy: text("generated_by"),               // model id + version (or "hand-authored")
  createdAt:   timestamp("created_at").defaultNow().notNull(),
});

export const trailStops = pgTable("trail_stops", {
  id:           varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trailId:      varchar("trail_id").notNull().references(() => trails.id),
  ordinal:      integer("ordinal").notNull(),
  // For travel trails: place / moment.
  // For literary trails: poemId / stanza index.
  place:        text("place"),
  moment:       text("moment"),
  poemId:       text("poem_id"),
  stanza:       integer("stanza"),
  sceneletId:   varchar("scenelet_id").references(() => scenelets.id),
  targetSkills: jsonb("target_skills").$type<string[]>().default([]),
});

export const scenelets = pgTable("scenelets", {
  id:          varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lines:       jsonb("lines").$type<SceneletLine[]>().notNull(),
  validatedBy: jsonb("validated_by").$type<SwarmAttestation[]>().default([]),
});

export interface SceneletLine {
  speaker: "tutor" | "learner" | "narrator";
  es: string;
  en: string;
  alts?: string[];
  annotations?: Annotation[];
}
export interface Annotation { token: string; skill?: string; note?: string }
export interface SwarmAttestation {
  agent: "translator" | "validator" | "critic";
  model: string;
  at: string;
  ok: boolean;
  notes?: string;
}

// ---------- Vocab & Verbs ----------

export const lemmas = pgTable("lemmas", {
  id:            text("id").primaryKey(),          // "estar" | "espejo"
  pos:           text("pos").notNull(),            // verb | noun | adj | ...
  gloss:         text("gloss").notNull(),
  cefr:          text("cefr"),
  frequencyRank: integer("frequency_rank"),
  // Borges-grade etymology lives here as a JSON trail.
  etymology:     jsonb("etymology").$type<EtymologyStep[]>(),
  variantNotes:  jsonb("variant_notes").$type<Record<string, string>>(),
});

export interface EtymologyStep {
  era: string;        // "Greek" | "Vulgar Latin" | "Andalusi Arabic" | "Old Spanish"
  form: string;       // "labýrinthos"
  gloss?: string;
  note?: string;
}

export const verbForms = pgTable("verb_forms", {
  id:        varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lemma:     text("lemma").notNull().references(() => lemmas.id),
  mood:      text("mood").notNull(),               // ind | sub | imp | cond
  tense:     text("tense").notNull(),              // pres | pret | imp | fut | pluperf | perf
  person:    text("person").notNull(),             // 1s | 2s | 3s | 1p | 2p | 3p | 2s_vos
  form:      text("form").notNull(),
  irregular: boolean("irregular").default(false),
});

export const vocabExposure = pgTable(
  "vocab_exposure",
  {
    learnerId: varchar("learner_id").notNull().references(() => learners.id),
    lemma:     text("lemma").notNull().references(() => lemmas.id),
    exposures: integer("exposures").default(0),
    reaches:   integer("reaches").default(0),
    lastSeen:  timestamp("last_seen"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.learnerId, t.lemma] }) })
);

// ---------- Drills (unevaluative) ----------

export const drillRuns = pgTable("drill_runs", {
  id:        varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  learnerId: varchar("learner_id").notNull().references(() => learners.id),
  drillType: text("drill_type").notNull(),         // conjugate | cloze | shadow | recall | echo
  prompt:    jsonb("prompt").notNull(),
  response:  jsonb("response"),
  observed:  jsonb("observed").$type<DrillObservation>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export interface DrillObservation {
  reached: string[];
  inSpec: boolean;
  latencyMs: number;
  selfReportedConfidence?: 1 | 2 | 3 | 4 | 5;
}

// ---------- Augmented chat surface ----------

export const chatTurns = pgTable("chat_turns", {
  id:        varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  learnerId: varchar("learner_id").notNull().references(() => learners.id),
  trailId:   varchar("trail_id").references(() => trails.id),
  role:      text("role").notNull(),               // learner | tutor | system
  surface:   jsonb("surface").$type<ChatSurface>().notNull(),
  audioUrl:  text("audio_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export interface ChatSurface {
  es: string;
  en: string;
  alts: string[];
  annotations: Annotation[];
  drillHooks: { skillId: string; kind: string }[];
}

// ---------- Content packs (Borges, Travel, ...) ----------

export const poems = pgTable("poems", {
  id:         text("id").primaryKey(),             // "borges.fervor.calle-desconocida"
  author:     text("author").notNull(),            // "Jorge Luis Borges"
  collection: text("collection"),                  // "Fervor de Buenos Aires (1923)"
  title:      text("title").notNull(),
  year:       integer("year"),
  body:       text("body").notNull(),              // canonical Spanish, line-broken
  themes:     jsonb("themes").$type<string[]>().default([]),
  targetLemmas: jsonb("target_lemmas").$type<string[]>().default([]),
});

// PersonalEcho — a learner-authored response anchored to a poem.
// Unevaluative: we don't grade these; we keep them as part of the trail.
export const personalEchoes = pgTable("personal_echoes", {
  id:        varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  learnerId: varchar("learner_id").notNull().references(() => learners.id),
  poemId:    text("poem_id").notNull().references(() => poems.id),
  register:  text("register").notNull(),           // literal | natural | argentine | borges-like | travel
  text:      text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------- Zod insert schemas (selected) ----------

export const insertLearnerSchema  = createInsertSchema(learners).omit({ id: true, createdAt: true });
export const insertSkillSchema    = createInsertSchema(skills);
export const insertTrailSchema    = createInsertSchema(trails).omit({ id: true, createdAt: true });
export const insertDrillRunSchema = createInsertSchema(drillRuns).omit({ id: true, createdAt: true });
export const insertChatTurnSchema = createInsertSchema(chatTurns).omit({ id: true, createdAt: true });
export const insertPoemSchema     = createInsertSchema(poems);
export const insertEchoSchema     = createInsertSchema(personalEchoes).omit({ id: true, createdAt: true });

export type Learner       = typeof learners.$inferSelect;
export type Skill         = typeof skills.$inferSelect;
export type Trail         = typeof trails.$inferSelect;
export type TrailStop     = typeof trailStops.$inferSelect;
export type Scenelet      = typeof scenelets.$inferSelect;
export type Lemma         = typeof lemmas.$inferSelect;
export type VerbForm      = typeof verbForms.$inferSelect;
export type DrillRun      = typeof drillRuns.$inferSelect;
export type ChatTurn      = typeof chatTurns.$inferSelect;
export type Poem          = typeof poems.$inferSelect;
export type PersonalEcho  = typeof personalEchoes.$inferSelect;

// Re-export a Zod type for ChatSurface so the client + iOS codegen share one shape.
export const chatSurfaceZ = z.object({
  es: z.string(),
  en: z.string(),
  alts: z.array(z.string()).default([]),
  annotations: z.array(z.object({
    token: z.string(),
    skill: z.string().optional(),
    note: z.string().optional(),
  })).default([]),
  drillHooks: z.array(z.object({
    skillId: z.string(),
    kind: z.string(),
  })).default([]),
});
