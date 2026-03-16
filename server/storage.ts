import { db } from "../db/index";
import { users, journalEntries, dictionaryWords, type User, type InsertUser, type JournalEntry, type InsertJournalEntry, type DictionaryWord, type InsertDictionaryWord } from "@shared/schema";
import { eq, desc, ilike, or } from "drizzle-orm";

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
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
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
    return await db.select()
      .from(journalEntries)
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit);
  }

  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry;
  }

  async addDictionaryWord(word: InsertDictionaryWord): Promise<DictionaryWord> {
    const [entry] = await db.insert(dictionaryWords).values(word).returning();
    return entry;
  }

  async getDictionaryWords(): Promise<DictionaryWord[]> {
    return await db.select()
      .from(dictionaryWords)
      .orderBy(desc(dictionaryWords.createdAt));
  }

  async searchDictionaryWords(query: string): Promise<DictionaryWord[]> {
    const pattern = `%${query}%`;
    return await db.select()
      .from(dictionaryWords)
      .where(
        or(
          ilike(dictionaryWords.spanish, pattern),
          ilike(dictionaryWords.english, pattern)
        )
      )
      .orderBy(desc(dictionaryWords.createdAt));
  }

  async deleteDictionaryWord(id: number): Promise<void> {
    await db.delete(dictionaryWords).where(eq(dictionaryWords.id, id));
  }
}

export const storage = new DatabaseStorage();
