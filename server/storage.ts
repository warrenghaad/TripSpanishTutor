import { db, safeSelect } from "../db/index";
import {
  users, journalEntries, dictionaryWords, trails, trailNodes, trailEdges, packManifests,
  type User, type InsertUser,
  type JournalEntry, type InsertJournalEntry,
  type DictionaryWord, type InsertDictionaryWord,
  type Trail, type InsertTrail,
  type TrailNode, type InsertTrailNode,
  type TrailEdge, type InsertTrailEdge,
  type PackManifest, type InsertPackManifest,
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
    const [entry] = await db.insert(dictionaryWords).values(word).returning();
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

  async recordPackManifest(manifest: InsertPackManifest): Promise<PackManifest> {
    const [m] = await db.insert(packManifests).values(manifest).returning();
    return m;
  }

  async listPackManifests(): Promise<PackManifest[]> {
    return await safeSelect(db.select().from(packManifests).orderBy(desc(packManifests.generatedAt)));
  }
}

export const storage = new DatabaseStorage();
