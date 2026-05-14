import { db, safeSelect, safeExecuteRows } from "../db/index";
import {
  users, journalEntries, dictionaryWords, trails, trailNodes, trailEdges, packManifests,
  translationCards, chatConversations, chatMessages,
  type User, type InsertUser,
  type JournalEntry, type InsertJournalEntry,
  type DictionaryWord, type InsertDictionaryWord,
  type Trail, type InsertTrail,
  type TrailNode, type InsertTrailNode,
  type TrailEdge, type InsertTrailEdge,
  type PackManifest, type InsertPackManifest,
  type TranslationCard, type InsertTranslationCard,
  type ChatConversation, type InsertChatConversation,
  type ChatMessage, type InsertChatMessage,
} from "@shared/schema";
import { eq, desc, ilike, or, and, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntries(limit?: number): Promise<JournalEntry[]>;
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;

  addDictionaryWord(word: InsertDictionaryWord): Promise<DictionaryWord>;
  getDictionaryWords(): Promise<DictionaryWord[]>;
  searchDictionaryWords(query: string): Promise<DictionaryWord[]>;
  deleteDictionaryWord(id: number): Promise<void>;

  createTrail(trail: InsertTrail): Promise<Trail>;
  getTrail(id: number): Promise<Trail | undefined>;
  listTrails(): Promise<Trail[]>;
  updateTrail(id: number, patch: Partial<InsertTrail>): Promise<Trail | undefined>;
  deleteTrail(id: number): Promise<void>;

  addTrailNode(node: InsertTrailNode, fromNodeId?: number | null, relation?: string): Promise<TrailNode>;
  getTrailNodes(trailId: number): Promise<TrailNode[]>;
  getTrailEdges(trailId: number): Promise<TrailEdge[]>;
  getTrailNode(id: number): Promise<TrailNode | undefined>;

  recordPackManifest(manifest: InsertPackManifest): Promise<PackManifest>;
  listPackManifests(): Promise<PackManifest[]>;

  createTranslationCard(card: InsertTranslationCard): Promise<TranslationCard>;
  listTranslationCards(limit?: number): Promise<TranslationCard[]>;
  getTranslationCard(id: number): Promise<TranslationCard | undefined>;
  updateTranslationCard(id: number, patch: Partial<InsertTranslationCard>): Promise<TranslationCard | undefined>;
  deleteTranslationCard(id: number): Promise<void>;

  createChatConversation(c: InsertChatConversation): Promise<ChatConversation>;
  getChatConversation(id: number): Promise<ChatConversation | undefined>;
  listChatConversations(): Promise<ChatConversation[]>;
  deleteChatConversation(id: number): Promise<void>;

  addChatMessage(m: InsertChatMessage): Promise<ChatMessage>;
  updateChatMessage(id: number, content: string): Promise<ChatMessage | undefined>;
  deleteChatMessage(id: number): Promise<void>;
  getChatMessages(conversationId: number): Promise<ChatMessage[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await safeSelect(db.select().from(users).where(eq(users.id, id)));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await safeSelect(db.select().from(users).where(eq(users.username, username)));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const [journalEntry] = await db.insert(journalEntries).values(entry).returning();
    return journalEntry;
  }

  async getJournalEntries(limit: number = 50): Promise<JournalEntry[]> {
    return await safeSelect(db.select().from(journalEntries).orderBy(desc(journalEntries.createdAt)).limit(limit));
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    const [entry] = await safeSelect(db.select().from(journalEntries).where(eq(journalEntries.id, id)));
    return entry;
  }

  async addDictionaryWord(word: InsertDictionaryWord): Promise<DictionaryWord> {
    // neon-http .returning() intermittently yields [] on this table — fall
    // back to insert + fetch latest by id when that happens.
    await db.insert(dictionaryWords).values(word);
    const rows = await safeSelect(
      db.select().from(dictionaryWords).orderBy(desc(dictionaryWords.id)).limit(1),
    );
    const entry = rows[0];
    if (!entry) throw new Error("dictionary insert succeeded but row not found");
    return entry;
  }

  async getDictionaryWords(): Promise<DictionaryWord[]> {
    return await safeSelect(db.select().from(dictionaryWords).orderBy(desc(dictionaryWords.createdAt)));
  }

  async searchDictionaryWords(query: string): Promise<DictionaryWord[]> {
    const pattern = `%${query}%`;
    return await safeSelect(db.select()
      .from(dictionaryWords)
      .where(or(ilike(dictionaryWords.spanish, pattern), ilike(dictionaryWords.english, pattern)))
      .orderBy(desc(dictionaryWords.createdAt)));
  }

  async deleteDictionaryWord(id: number): Promise<void> {
    await db.delete(dictionaryWords).where(eq(dictionaryWords.id, id));
  }

  async createTrail(trail: InsertTrail): Promise<Trail> {
    const [t] = await db.insert(trails).values(trail).returning();
    return t;
  }

  async getTrail(id: number): Promise<Trail | undefined> {
    const [t] = await safeSelect(db.select().from(trails).where(eq(trails.id, id)));
    return t;
  }

  async listTrails(): Promise<Trail[]> {
    return await safeSelect(db.select().from(trails).orderBy(desc(trails.updatedAt)));
  }

  async updateTrail(id: number, patch: Partial<InsertTrail>): Promise<Trail | undefined> {
    const [t] = await db.update(trails)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(trails.id, id))
      .returning();
    return t;
  }

  async deleteTrail(id: number): Promise<void> {
    await db.delete(trails).where(eq(trails.id, id));
  }

  async addTrailNode(node: InsertTrailNode, fromNodeId?: number | null, relation: string = "follow_up"): Promise<TrailNode> {
    const [n] = await db.insert(trailNodes).values(node).returning();
    if (fromNodeId) {
      await db.insert(trailEdges).values({
        trailId: node.trailId,
        fromNodeId,
        toNodeId: n.id,
        relation,
      });
    }
    await db.update(trails).set({ updatedAt: new Date() }).where(eq(trails.id, node.trailId));
    return n;
  }

  async getTrailNodes(trailId: number): Promise<TrailNode[]> {
    return await safeSelect(db.select().from(trailNodes).where(eq(trailNodes.trailId, trailId)).orderBy(trailNodes.createdAt));
  }

  async getTrailEdges(trailId: number): Promise<TrailEdge[]> {
    return await safeSelect(db.select().from(trailEdges).where(eq(trailEdges.trailId, trailId)).orderBy(trailEdges.createdAt));
  }

  async getTrailNode(id: number): Promise<TrailNode | undefined> {
    const [n] = await safeSelect(db.select().from(trailNodes).where(eq(trailNodes.id, id)));
    return n;
  }

  async updateTrailNode(id: number, patch: { payload?: any; source?: string; label?: string }): Promise<TrailNode | undefined> {
    const [n] = await db.update(trailNodes).set(patch).where(eq(trailNodes.id, id)).returning();
    return n;
  }

  async recordPackManifest(manifest: InsertPackManifest): Promise<PackManifest> {
    const [m] = await db.insert(packManifests).values(manifest).returning();
    return m;
  }

  async listPackManifests(): Promise<PackManifest[]> {
    return await safeSelect(db.select().from(packManifests).orderBy(desc(packManifests.generatedAt)));
  }

  async createTranslationCard(card: InsertTranslationCard): Promise<TranslationCard> {
    // Use INSERT ... RETURNING * so we get back the exact inserted row in
    // a single round trip. Raw db.execute() does not hit the broken
    // drizzle-orm .returning() path that previously forced us to fall
    // back on "ORDER BY id DESC LIMIT 1" (which was racy under load).
    // The neon-http driver does not return RETURNING rows from a bare
    // INSERT issued via db.execute(); wrap it in a CTE so the statement
    // is parsed as a SELECT and the inserted row reaches us reliably.
    const rows = await safeExecuteRows<TranslationCardRow>(
      db.execute(sql`
        WITH ins AS (
        INSERT INTO translation_cards (
          source_text, source_language, target_language, translated_text,
          literal_text, grammar_notes, detected_verbs, detected_adjectives,
          detected_adverbs, suggested_transforms, tags, saved,
          conversation_id, journal_entry_id, status, locale
        ) VALUES (
          ${card.sourceText},
          ${card.sourceLanguage ?? "auto"},
          ${card.targetLanguage},
          ${card.translatedText ?? ""},
          ${card.literalText ?? null},
          ${JSON.stringify(card.grammarNotes ?? null)}::jsonb,
          ${JSON.stringify(card.detectedVerbs ?? [])}::jsonb,
          ${JSON.stringify(card.detectedAdjectives ?? [])}::jsonb,
          ${JSON.stringify(card.detectedAdverbs ?? [])}::jsonb,
          ${JSON.stringify(card.suggestedTransforms ?? null)}::jsonb,
          ${JSON.stringify(card.tags ?? [])}::jsonb,
          ${card.saved ?? false},
          ${card.conversationId == null ? sql`NULL` : card.conversationId},
          ${card.journalEntryId == null ? sql`NULL` : card.journalEntryId},
          ${card.status ?? "completed"},
          ${card.locale ?? null}
        )
        RETURNING *
        )
        SELECT * FROM ins
      `),
    );
    const row = rows[0];
    if (!row) throw new Error("translation_cards insert returned no row");
    return mapTranslationCardRow(row);
  }

  async listTranslationCards(limit: number = 100): Promise<TranslationCard[]> {
    const rows = await safeExecuteRows<TranslationCardRow>(
      db.execute(sql`SELECT * FROM translation_cards ORDER BY created_at DESC LIMIT ${limit}`),
    );
    return rows.map(mapTranslationCardRow);
  }

  async getTranslationCard(id: number): Promise<TranslationCard | undefined> {
    const rows = await safeExecuteRows<TranslationCardRow>(
      db.execute(sql`SELECT * FROM translation_cards WHERE id = ${id}`),
    );
    return rows[0] ? mapTranslationCardRow(rows[0]) : undefined;
  }

  async updateTranslationCard(id: number, patch: Partial<InsertTranslationCard>): Promise<TranslationCard | undefined> {
    const sets: ReturnType<typeof sql>[] = [];
    if (patch.sourceText !== undefined) sets.push(sql`source_text = ${patch.sourceText}`);
    if (patch.sourceLanguage !== undefined) sets.push(sql`source_language = ${patch.sourceLanguage}`);
    if (patch.targetLanguage !== undefined) sets.push(sql`target_language = ${patch.targetLanguage}`);
    if (patch.translatedText !== undefined) sets.push(sql`translated_text = ${patch.translatedText}`);
    if (patch.literalText !== undefined) sets.push(sql`literal_text = ${patch.literalText}`);
    if (patch.grammarNotes !== undefined) sets.push(sql`grammar_notes = ${JSON.stringify(patch.grammarNotes)}::jsonb`);
    if (patch.detectedVerbs !== undefined) sets.push(sql`detected_verbs = ${JSON.stringify(patch.detectedVerbs)}::jsonb`);
    if (patch.detectedAdjectives !== undefined) sets.push(sql`detected_adjectives = ${JSON.stringify(patch.detectedAdjectives)}::jsonb`);
    if (patch.detectedAdverbs !== undefined) sets.push(sql`detected_adverbs = ${JSON.stringify(patch.detectedAdverbs)}::jsonb`);
    if (patch.suggestedTransforms !== undefined) sets.push(sql`suggested_transforms = ${JSON.stringify(patch.suggestedTransforms)}::jsonb`);
    if (patch.tags !== undefined) sets.push(sql`tags = ${JSON.stringify(patch.tags)}::jsonb`);
    if (patch.saved !== undefined) sets.push(sql`saved = ${patch.saved}`);
    if (patch.conversationId !== undefined) sets.push(sql`conversation_id = ${patch.conversationId}`);
    if (patch.journalEntryId !== undefined) sets.push(sql`journal_entry_id = ${patch.journalEntryId}`);
    if (patch.status !== undefined) sets.push(sql`status = ${patch.status}`);
    if (patch.locale !== undefined) sets.push(sql`locale = ${patch.locale}`);
    if (sets.length === 0) return await this.getTranslationCard(id);
    const setClause = sql.join(sets, sql`, `);
    await db.execute(sql`UPDATE translation_cards SET ${setClause} WHERE id = ${id}`);
    return await this.getTranslationCard(id);
  }

  async deleteTranslationCard(id: number): Promise<void> {
    await db.execute(sql`DELETE FROM translation_cards WHERE id = ${id}`);
  }

  async createChatConversation(c: InsertChatConversation): Promise<ChatConversation> {
    const rows = await safeExecuteRows<ChatConversation>(
      db.execute(sql`
        WITH ins AS (
        INSERT INTO chat_conversations (seed_translation_card_id, locale, title)
        VALUES (
          ${c.seedTranslationCardId == null ? sql`NULL` : c.seedTranslationCardId},
          ${c.locale ?? null},
          ${c.title ?? "Conversation"}
        )
        RETURNING *
        )
        SELECT * FROM ins
      `),
    );
    const row = rows[0];
    if (!row) throw new Error("chat_conversations insert returned no row");
    return row;
  }

  async getChatConversation(id: number): Promise<ChatConversation | undefined> {
    const rows = await safeExecuteRows<ChatConversation>(
      db.execute(sql`SELECT * FROM chat_conversations WHERE id = ${id}`),
    );
    return rows[0];
  }

  async listChatConversations(): Promise<ChatConversation[]> {
    return await safeExecuteRows<ChatConversation>(
      db.execute(sql`SELECT * FROM chat_conversations ORDER BY created_at DESC`),
    );
  }

  async deleteChatConversation(id: number): Promise<void> {
    await db.execute(sql`DELETE FROM chat_conversations WHERE id = ${id}`);
  }

  async addChatMessage(m: InsertChatMessage): Promise<ChatMessage> {
    const rows = await safeExecuteRows<ChatMessage>(
      db.execute(sql`
        WITH ins AS (
        INSERT INTO chat_messages (conversation_id, role, content)
        VALUES (${m.conversationId}, ${m.role}, ${m.content})
        RETURNING *
        )
        SELECT * FROM ins
      `),
    );
    const row = rows[0];
    if (!row) throw new Error("chat_messages insert returned no row");
    return row;
  }

  async updateChatMessage(id: number, content: string): Promise<ChatMessage | undefined> {
    const rows = await safeExecuteRows<ChatMessage>(
      db.execute(sql`
        WITH upd AS (
          UPDATE chat_messages SET content = ${content} WHERE id = ${id} RETURNING *
        )
        SELECT * FROM upd
      `),
    );
    return rows[0];
  }

  async deleteChatMessage(id: number): Promise<void> {
    await db.execute(sql`DELETE FROM chat_messages WHERE id = ${id}`);
  }

  async getChatMessages(conversationId: number): Promise<ChatMessage[]> {
    return await safeExecuteRows<ChatMessage>(
      db.execute(sql`
        SELECT * FROM chat_messages WHERE conversation_id = ${conversationId} ORDER BY created_at ASC
      `),
    );
  }
}

type TranslationCardRow = {
  id: number;
  created_at: string | Date;
  source_text: string;
  source_language: string;
  target_language: string;
  translated_text: string;
  literal_text: string | null;
  grammar_notes: { term: string; note: string }[] | null;
  detected_verbs: string[] | null;
  detected_adjectives: string[] | null;
  detected_adverbs: string[] | null;
  suggested_transforms: { id: string; label: string }[] | null;
  tags: string[] | null;
  saved: boolean;
  conversation_id: number | null;
  journal_entry_id: number | null;
  status: string;
  locale: string | null;
};

function mapTranslationCardRow(row: TranslationCardRow): TranslationCard {
  return {
    id: row.id,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    sourceText: row.source_text,
    sourceLanguage: row.source_language,
    targetLanguage: row.target_language,
    translatedText: row.translated_text,
    literalText: row.literal_text,
    grammarNotes: row.grammar_notes,
    detectedVerbs: row.detected_verbs ?? [],
    detectedAdjectives: row.detected_adjectives ?? [],
    detectedAdverbs: row.detected_adverbs ?? [],
    suggestedTransforms: row.suggested_transforms,
    tags: row.tags ?? [],
    saved: row.saved,
    conversationId: row.conversation_id,
    journalEntryId: row.journal_entry_id,
    status: row.status,
    locale: row.locale,
  };
}

export const storage = new DatabaseStorage();
