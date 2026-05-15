import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  originalText: text("original_text").notNull(),
  correctedText: text("corrected_text"),
  tenseFocus: text("tense_focus").notNull(),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export const selectJournalEntrySchema = createInsertSchema(journalEntries);

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

export const dictionaryWords = pgTable("dictionary_words", {
  id: serial("id").primaryKey(),
  spanish: text("spanish").notNull(),
  english: text("english").notNull(),
  partOfSpeech: text("part_of_speech").notNull(),
  conjugations: text("conjugations"),
  context: text("context"),
  source: text("source"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDictionaryWordSchema = createInsertSchema(dictionaryWords).omit({
  id: true,
  createdAt: true,
});

export type InsertDictionaryWord = z.infer<typeof insertDictionaryWordSchema>;
export type DictionaryWord = typeof dictionaryWords.$inferSelect;

export const trails = pgTable("trails", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tags: text("tags").array().default(sql`'{}'::text[]`).notNull(),
  locale: text("locale"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTrailSchema = createInsertSchema(trails).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTrail = z.infer<typeof insertTrailSchema>;
export type Trail = typeof trails.$inferSelect;

export const trailNodes = pgTable("trail_nodes", {
  id: serial("id").primaryKey(),
  trailId: integer("trail_id").notNull().references(() => trails.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  label: text("label").notNull(),
  payload: jsonb("payload").notNull(),
  source: text("source").notNull().default("live"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTrailNodeSchema = createInsertSchema(trailNodes).omit({
  id: true,
  createdAt: true,
});

export type InsertTrailNode = z.infer<typeof insertTrailNodeSchema>;
export type TrailNode = typeof trailNodes.$inferSelect;

export const trailEdges = pgTable("trail_edges", {
  id: serial("id").primaryKey(),
  trailId: integer("trail_id").notNull().references(() => trails.id, { onDelete: "cascade" }),
  fromNodeId: integer("from_node_id").references(() => trailNodes.id, { onDelete: "cascade" }),
  toNodeId: integer("to_node_id").notNull().references(() => trailNodes.id, { onDelete: "cascade" }),
  relation: text("relation").notNull().default("follow_up"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTrailEdgeSchema = createInsertSchema(trailEdges).omit({
  id: true,
  createdAt: true,
});

export type InsertTrailEdge = z.infer<typeof insertTrailEdgeSchema>;
export type TrailEdge = typeof trailEdges.$inferSelect;

export const packManifests = pgTable("pack_manifests", {
  id: serial("id").primaryKey(),
  locale: text("locale").notNull(),
  scope: jsonb("scope").notNull(),
  sizeBytes: integer("size_bytes").notNull().default(0),
  version: integer("version").notNull().default(1),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

export const insertPackManifestSchema = createInsertSchema(packManifests).omit({
  id: true,
  generatedAt: true,
});

export type InsertPackManifest = z.infer<typeof insertPackManifestSchema>;
export type PackManifest = typeof packManifests.$inferSelect;

export const translationCards = pgTable("translation_cards", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sourceText: text("source_text").notNull(),
  sourceLanguage: text("source_language").notNull().default("auto"),
  targetLanguage: text("target_language").notNull(),
  translatedText: text("translated_text").notNull().default(""),
  literalText: text("literal_text"),
  grammarNotes: jsonb("grammar_notes"),
  detectedVerbs: jsonb("detected_verbs").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  detectedAdjectives: jsonb("detected_adjectives").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  detectedAdverbs: jsonb("detected_adverbs").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  suggestedTransforms: jsonb("suggested_transforms").$type<{ id: string; label: string }[]>(),
  tags: jsonb("tags").$type<string[]>().default(sql`'[]'::jsonb`).notNull(),
  saved: boolean("saved").default(false).notNull(),
  conversationId: integer("conversation_id"),
  journalEntryId: integer("journal_entry_id").references(() => journalEntries.id, { onDelete: "set null" }),
  status: text("status").notNull().default("completed"),
  locale: text("locale"),
});

export const insertTranslationCardSchema = createInsertSchema(translationCards).omit({
  id: true,
  createdAt: true,
});

export type InsertTranslationCard = z.infer<typeof insertTranslationCardSchema>;
export type TranslationCard = typeof translationCards.$inferSelect;

export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  seedTranslationCardId: integer("seed_translation_card_id").references(() => translationCards.id, { onDelete: "set null" }),
  locale: text("locale"),
  title: text("title").notNull().default("Conversation"),
});

export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({
  id: true,
  createdAt: true,
});

export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type ChatConversation = typeof chatConversations.$inferSelect;

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => chatConversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// ---------- Daily Loop Companion ----------
//
// `project_packs` is the cached intelligence built in Before mode. The payload
// holds the four cached_intelligence buckets from SPEC: likely_phrases,
// likely_replies, fallbacks, nearby_doors — plus optional carriedOver markers
// from a previous DailyAnalysis and a sources array describing how the pack
// was assembled.
export const projectPacks = pgTable("project_packs", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  outingType: text("outing_type").notNull(),
  purpose: text("purpose"),
  tone: text("tone"),
  locale: text("locale"),
  payload: jsonb("payload").notNull(),
  trailIds: jsonb("trail_ids").$type<number[]>().default(sql`'[]'::jsonb`).notNull(),
  prevAnalysisId: integer("prev_analysis_id"),
  sizeBytes: integer("size_bytes").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectPackSchema = createInsertSchema(projectPacks, {
  trailIds: z.array(z.number()).optional(),
}).omit({
  id: true,
  createdAt: true,
});
export type InsertProjectPack = z.infer<typeof insertProjectPackSchema>;
export type ProjectPack = typeof projectPacks.$inferSelect;

// `queued_questions` are things the offline cache could not answer. They are
// drained when the device is back online — either via the live LLM or by the
// user dismissing them.
export const queuedQuestions = pgTable("queued_questions", {
  id: serial("id").primaryKey(),
  projectPackId: integer("project_pack_id").references(() => projectPacks.id, { onDelete: "set null" }),
  trailId: integer("trail_id").references(() => trails.id, { onDelete: "set null" }),
  query: text("query").notNull(),
  context: text("context"),
  status: text("status").notNull().default("pending"),
  answer: text("answer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  answeredAt: timestamp("answered_at"),
});

export const insertQueuedQuestionSchema = createInsertSchema(queuedQuestions).omit({
  id: true,
  createdAt: true,
  answeredAt: true,
});
export type InsertQueuedQuestion = z.infer<typeof insertQueuedQuestionSchema>;
export type QueuedQuestion = typeof queuedQuestions.$inferSelect;

// `daily_analyses` capture the After-mode debrief and a list of items to
// promote into the next ProjectPack so the loop closes.
export const dailyAnalyses = pgTable("daily_analyses", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  projectPackId: integer("project_pack_id").references(() => projectPacks.id, { onDelete: "set null" }),
  trailIds: jsonb("trail_ids").$type<number[]>().default(sql`'[]'::jsonb`).notNull(),
  rawOffload: text("raw_offload").notNull(),
  payload: jsonb("payload").notNull(),
  promotedItems: jsonb("promoted_items").$type<{ kind: string; text: string; note?: string }[]>().default(sql`'[]'::jsonb`).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDailyAnalysisSchema = createInsertSchema(dailyAnalyses, {
  trailIds: z.array(z.number()).optional(),
  promotedItems: z.array(z.object({
    kind: z.string(),
    text: z.string(),
    note: z.string().optional(),
  })).optional(),
}).omit({
  id: true,
  createdAt: true,
});
export type InsertDailyAnalysis = z.infer<typeof insertDailyAnalysisSchema>;
export type DailyAnalysis = typeof dailyAnalyses.$inferSelect;

// Shape of the cached intelligence payload stored on a ProjectPack.
export type ProjectPackPayload = {
  likelyPhrases: { es: string; en: string; note?: string }[];
  likelyReplies: { es: string; en: string; note?: string }[];
  fallbacks: { es: string; en: string; note?: string }[];
  nearbyDoors: { label: string; es?: string; en?: string; note?: string }[];
  personaBrief?: string;
  carriedOver?: { kind: string; text: string; note?: string }[];
  sources?: { kind: string; ref: string }[];
};

export type DailyAnalysisPayload = {
  summary: string;
  extractedNeeds: string[];
  missedTranslations: { en?: string; es?: string; note?: string }[];
  heardPhrases: { es: string; gloss?: string }[];
  avoidedExpressions: { en?: string; es?: string; note?: string }[];
  emotionalMoments: string[];
};
