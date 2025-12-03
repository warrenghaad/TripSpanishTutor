import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { analyzeSpanishText, chatWithAssistant, translateText } from "./ai-service";
import { insertJournalEntrySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/journal/analyze", async (req, res) => {
    try {
      const { text, tenseFocus } = req.body;
      
      if (!text || !tenseFocus) {
        return res.status(400).json({ error: "Missing text or tenseFocus" });
      }

      const feedback = await analyzeSpanishText(text, tenseFocus);
      
      const entry = await storage.createJournalEntry({
        originalText: text,
        correctedText: feedback.corrected,
        tenseFocus,
        feedback: JSON.stringify(feedback),
      });

      res.json({ 
        entry,
        feedback 
      });
    } catch (error) {
      console.error("Error analyzing journal entry:", error);
      res.status(500).json({ error: "Failed to analyze text" });
    }
  });

  app.get("/api/journal/entries", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const entries = await storage.getJournalEntries(limit);
      
      const entriesWithFeedback = entries.map(entry => ({
        ...entry,
        feedback: entry.feedback ? JSON.parse(entry.feedback) : null,
      }));
      
      res.json(entriesWithFeedback);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ error: "Failed to fetch entries" });
    }
  });

  app.get("/api/journal/entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(id);
      
      if (!entry) {
        return res.status(404).json({ error: "Entry not found" });
      }
      
      res.json({
        ...entry,
        feedback: entry.feedback ? JSON.parse(entry.feedback) : null,
      });
    } catch (error) {
      console.error("Error fetching journal entry:", error);
      res.status(500).json({ error: "Failed to fetch entry" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Missing messages array" });
      }

      const reply = await chatWithAssistant(messages);
      res.json({ reply });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Chat failed" });
    }
  });

  app.post("/api/translate", async (req, res) => {
    try {
      const { text, target, preset, soften } = req.body;
      
      if (!text || !target) {
        return res.status(400).json({ error: "Missing text or target language" });
      }

      const result = await translateText(text, target, preset || "general", soften || false);
      res.json(result);
    } catch (error) {
      console.error("Error translating:", error);
      res.status(500).json({ error: "Translation failed" });
    }
  });

  return httpServer;
}
