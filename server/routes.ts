import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import {
  analyzeSpanishText, chatWithAssistant, translateText, lookupWord, extractVocabulary,
  buildTripPack, summarizeTrail, nearbyDoors,
} from "./ai-service";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/journal/analyze", async (req, res) => {
    try {
      const { text, tenseFocus, locale } = req.body;
      if (!text || !tenseFocus) {
        return res.status(400).json({ error: "Missing text or tenseFocus" });
      }
      const feedback = await analyzeSpanishText(text, tenseFocus, locale);
      const entry = await storage.createJournalEntry({
        originalText: text,
        correctedText: feedback.corrected,
        tenseFocus,
        feedback: JSON.stringify(feedback),
      });
      res.json({ entry, feedback });
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
      const { messages, locale } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Missing messages array" });
      }
      const reply = await chatWithAssistant(messages, locale);
      res.json({ reply });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Chat failed" });
    }
  });

  app.post("/api/translate", async (req, res) => {
    try {
      const { text, target, preset, soften, locale } = req.body;
      if (!text || !target) {
        return res.status(400).json({ error: "Missing text or target language" });
      }
      const result = await translateText(text, target, preset || "general", soften || false, locale);
      res.json(result);
    } catch (error) {
      console.error("Error translating:", error);
      res.status(500).json({ error: "Translation failed" });
    }
  });

  app.post("/api/dictionary/lookup", async (req, res) => {
    try {
      const { word, direction, locale } = req.body;
      if (!word) return res.status(400).json({ error: "Missing word" });
      const result = await lookupWord(word, direction, locale);
      res.json(result);
    } catch (error) {
      console.error("Error looking up word:", error);
      res.status(500).json({ error: "Lookup failed" });
    }
  });

  app.post("/api/dictionary/extract", async (req, res) => {
    try {
      const { text, locale } = req.body;
      if (!text) return res.status(400).json({ error: "Missing text" });
      const result = await extractVocabulary(text, locale);
      res.json(result);
    } catch (error) {
      console.error("Error extracting vocabulary:", error);
      res.status(500).json({ error: "Extraction failed" });
    }
  });

  app.post("/api/dictionary/fetch-url", async (req, res) => {
    try {
      const { url, locale } = req.body;
      if (!url || typeof url !== "string") return res.status(400).json({ error: "Missing URL" });
      let parsed: URL;
      try { parsed = new URL(url); } catch { return res.status(400).json({ error: "Invalid URL format" }); }
      if (!["http:", "https:"].includes(parsed.protocol)) return res.status(400).json({ error: "Only HTTP/HTTPS URLs are allowed" });
      const hostname = parsed.hostname.toLowerCase();
      const blocked = ["localhost", "127.0.0.1", "0.0.0.0", "[::1]", "169.254.169.254", "metadata.google.internal"];
      if (blocked.some(b => hostname === b) || hostname.endsWith(".local") || hostname.startsWith("10.") || hostname.startsWith("192.168.") || hostname.startsWith("172.")) {
        return res.status(400).json({ error: "Cannot fetch internal or private URLs" });
      }
      const response = await fetch(parsed.href, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; VallartaVoz/1.0)" },
        signal: AbortSignal.timeout(10000),
        redirect: "follow",
      });
      if (!response.ok) return res.status(400).json({ error: "Could not fetch that URL" });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html") && !contentType.includes("text/plain") && !contentType.includes("application/xhtml")) {
        return res.status(400).json({ error: "URL must point to a text/HTML page" });
      }
      const rawText = await response.text();
      const html = rawText.substring(0, 200000);
      const textContent = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&[a-z]+;/gi, " ")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 4000);
      if (textContent.length < 20) return res.status(400).json({ error: "Not enough text content found on that page" });
      const result = await extractVocabulary(textContent, locale);
      res.json(result);
    } catch (error) {
      console.error("Error fetching URL:", error);
      res.status(500).json({ error: "Failed to fetch and analyze URL" });
    }
  });

  app.get("/api/dictionary/words", async (req, res) => {
    try {
      const query = req.query.q as string;
      const words = query ? await storage.searchDictionaryWords(query) : await storage.getDictionaryWords();
      const parsed = words.map(w => ({ ...w, conjugations: w.conjugations ? JSON.parse(w.conjugations) : null }));
      res.json(parsed);
    } catch (error) {
      console.error("Error fetching dictionary:", error);
      res.status(500).json({ error: "Failed to fetch dictionary" });
    }
  });

  app.post("/api/dictionary/words", async (req, res) => {
    try {
      const { spanish, english, partOfSpeech, conjugations, context, source } = req.body;
      if (!spanish || !english || !partOfSpeech) return res.status(400).json({ error: "Missing required fields" });
      const word = await storage.addDictionaryWord({
        spanish, english, partOfSpeech,
        conjugations: conjugations ? JSON.stringify(conjugations) : null,
        context: context || null, source: source || null,
      });
      res.json({ ...word, conjugations: word.conjugations ? JSON.parse(word.conjugations) : null });
    } catch (error) {
      console.error("Error adding word:", error);
      res.status(500).json({ error: "Failed to add word" });
    }
  });

  app.delete("/api/dictionary/words/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDictionaryWord(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting word:", error);
      res.status(500).json({ error: "Failed to delete word" });
    }
  });

  // -------- Trails --------
  app.get("/api/trails", async (_req, res) => {
    try {
      const list = await storage.listTrails();
      // Attach a lightweight kind sequence (last 12 steps) so the client can
      // render a per-card thumbnail without a per-trail roundtrip.
      const enriched = await Promise.all(list.map(async (t) => {
        try {
          const nodes = await storage.getTrailNodes(t.id);
          return { ...t, nodeCount: nodes.length, kindSequence: nodes.slice(-12).map((n) => n.kind) };
        } catch { return { ...t, nodeCount: 0, kindSequence: [] as string[] }; }
      }));
      res.json(enriched);
    } catch (e) {
      console.error(e); res.status(500).json({ error: "Failed to list trails" });
    }
  });

  app.post("/api/trails", async (req, res) => {
    try {
      const { name, tags, locale } = req.body;
      const t = await storage.createTrail({
        name: name || "Untitled trail",
        tags: Array.isArray(tags) ? tags : [],
        locale: locale || null,
      });
      res.json(t);
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed to create trail" }); }
  });

  app.get("/api/trails/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const trail = await storage.getTrail(id);
      if (!trail) return res.status(404).json({ error: "Not found" });
      const [nodes, edges] = await Promise.all([
        storage.getTrailNodes(id),
        storage.getTrailEdges(id),
      ]);
      res.json({ trail, nodes, edges });
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed to fetch trail" }); }
  });

  app.patch("/api/trails/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, tags } = req.body;
      const patch: any = {};
      if (typeof name === "string") patch.name = name;
      if (Array.isArray(tags)) patch.tags = tags;
      const t = await storage.updateTrail(id, patch);
      if (!t) return res.status(404).json({ error: "Not found" });
      res.json(t);
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed to update trail" }); }
  });

  app.delete("/api/trails/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTrail(id);
      res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed to delete trail" }); }
  });

  app.post("/api/trails/:id/nodes", async (req, res) => {
    try {
      const trailId = parseInt(req.params.id);
      const { kind, label, payload, source, fromNodeId, relation } = req.body;
      if (!kind || !label) return res.status(400).json({ error: "Missing kind or label" });
      const node = await storage.addTrailNode(
        { trailId, kind, label, payload: payload || {}, source: source || "live" },
        fromNodeId || null,
        relation || "follow_up",
      );
      res.json(node);
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed to add node" }); }
  });

  app.patch("/api/trails/:id/nodes/:nodeId", async (req, res) => {
    try {
      const nodeId = parseInt(req.params.nodeId);
      const { payload, source, label } = req.body;
      const node = await storage.updateTrailNode(nodeId, { payload, source, label });
      if (!node) return res.status(404).json({ error: "Not found" });
      res.json(node);
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed to update node" }); }
  });

  app.post("/api/trails/:id/summarize", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const trail = await storage.getTrail(id);
      if (!trail) return res.status(404).json({ error: "Not found" });
      const nodes = await storage.getTrailNodes(id);
      const result = await summarizeTrail(
        trail.name,
        nodes.map(n => ({ kind: n.kind, label: n.label, payload: n.payload })),
        trail.locale || undefined,
      );
      res.json(result);
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed to summarize" }); }
  });

  app.post("/api/trails/:id/doors", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const trail = await storage.getTrail(id);
      if (!trail) return res.status(404).json({ error: "Not found" });
      const nodes = await storage.getTrailNodes(id);
      const doors = await nearbyDoors(
        trail.name,
        nodes.map(n => ({ kind: n.kind, label: n.label })),
        trail.locale || undefined,
      );
      res.json({ doors });
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed to suggest doors" }); }
  });

  // -------- Trip Packs --------
  app.post("/api/packs/build", async (req, res) => {
    try {
      const { locale, interests, size } = req.body;
      if (!locale) return res.status(400).json({ error: "Missing locale" });
      const pack = await buildTripPack(locale, Array.isArray(interests) ? interests : [], size || "medium");
      const json = JSON.stringify(pack);
      await storage.recordPackManifest({
        locale, scope: { interests: pack.scope.interests, size: pack.scope.size },
        sizeBytes: json.length, version: pack.version,
      });
      res.json(pack);
    } catch (e) {
      console.error(e); res.status(500).json({ error: "Failed to build pack" });
    }
  });

  app.get("/api/packs/manifests", async (_req, res) => {
    try {
      const list = await storage.listPackManifests();
      res.json(list);
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed" }); }
  });

  // PWA / build info
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, ts: Date.now() });
  });

  return httpServer;
}
