import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { analyzeSpanishText } from "./ai-service";
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

  return httpServer;
}
