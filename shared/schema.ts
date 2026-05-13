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
