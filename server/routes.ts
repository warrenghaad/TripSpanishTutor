import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import {
  analyzeSpanishText, chatWithAssistant, translateText, lookupWord, extractVocabulary,
  buildTripPack, summarizeTrail, nearbyDoors,
  translateRich, transformSentence, seededChatReply,
} from "./ai-service";
import type { ChatConversation } from "@shared/schema";

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
      // Dedupe by case-insensitive Spanish lemma — return the existing row if present.
      const existing = await storage.searchDictionaryWords(spanish);
      const match = existing.find(w => w.spanish.toLowerCase().trim() === spanish.toLowerCase().trim());
      if (match) {
        return res.json({
          ...match,
          conjugations: match.conjugations ? JSON.parse(match.conjugations) : null,
          deduped: true,
        });
      }
      const word = await storage.addDictionaryWord({
        spanish, english, partOfSpeech,
        conjugations: conjugations ? JSON.stringify(conjugations) : null,
        context: context || null, source: source || null,
      });
      res.json({
        ...word,
        conjugations: word.conjugations ? JSON.parse(word.conjugations) : null,
        deduped: false,
      });
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

  // -------- Vault-sourced daily packs --------
  //
  // GET /api/packs/daily/:date
  //   Assembles the day-pack for `:date` (YYYY-MM-DD) by reading
  //   `VallartaVoxVault/11_Research/<date>/` recursively. Returns the typed
  //   `DailyPack` JSON (airport / atelier / bridge / vocab / grammar arrays,
  //   personalization, sources actually assembled, and any per-file parse
  //   errors with `{ file, message, line }`).
  //
  //   Note: files marked `status: integrated` are physically moved to
  //   `08_ProjectPacks/<date>/sources/` by `POST /api/packs/sync`. After a
  //   sync, those files are no longer assembled by this endpoint — the
  //   rendered markdown pack at `08_ProjectPacks/<date>.md` is the canonical
  //   record. This is intentional: `integrated` is the terminal state.
  app.get("/api/packs/daily/:date", async (req, res) => {
    try {
      const date = req.params.date;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: "Invalid date format, expected YYYY-MM-DD" });
      }
      const { assembleDailyPack } = await import("./vault/assembler");
      const pack = await assembleDailyPack(date);
      res.json(pack);
    } catch (e: any) {
      console.error("daily pack error:", e);
      res.status(500).json({ error: e?.message || "Failed to assemble daily pack" });
    }
  });

  // POST /api/packs/sync
  //   Walks every dated folder under `11_Research/`, assembles a day-pack,
  //   writes/overwrites `08_ProjectPacks/<date>.md`, records a manifest row
  //   per pack, and moves `status: integrated` source files into
  //   `08_ProjectPacks/<date>/sources/` (recursively, preserving subpaths).
  //
  //   Response shape: `SyncReport`
  //     { built:   number,           // packs newly written
  //       updated: number,           // packs overwritten
  //       skipped: number,           // dated folders with zero parseable files
  //       errors:  { file, message, line? }[],  // per-file parse failures
  //       dates:   string[] }        // every date the sync touched
  app.post("/api/packs/sync", async (_req, res) => {
    try {
      const { syncAllDailyPacks } = await import("./vault/sync");
      const report = await syncAllDailyPacks();
      res.json(report);
    } catch (e: any) {
      console.error("vault sync error:", e);
      res.status(500).json({ error: e?.message || "Failed to sync vault" });
    }
  });

  // -------- Learn modes (vault-sourced) --------
  //
  // GET /api/learn/modes
  //   Returns content for the /learn page grouped into the three project
  //   modes — airport, atelier (literary authors), bridge. The grouped
  //   payload is built once at server boot (`primeLearnCache`) and
  //   refreshed by a chokidar watcher on 06_Atelier / 08_ProjectPacks /
  //   11_Research, so this handler always serves a static in-memory
  //   snapshot — no per-request disk walk. Each mode includes an `empty`
  //   hint that tells the user exactly which template + folder to drop a
  //   file into to populate it.
  app.get("/api/learn/modes", async (_req, res) => {
    try {
      const { getLearnModes } = await import("./vault/learn");
      const modes = await getLearnModes();
      res.json(modes);
    } catch (e: any) {
      console.error("learn modes error:", e);
      res.status(500).json({ error: e?.message || "Failed to load learn modes" });
    }
  });

  // -------- Vault browser (read-only) --------
  //
  // Backs the in-app /vault tab and the iOS Capacitor shell. The tree is
  // built once at boot (`primeVaultBrowserCache`) and refreshed by a
  // chokidar watcher; file reads are constrained to VAULT_ROOT.
  //
  // Optional auth: set the `VAULT_API_KEY` env var to require an
  // `X-Vault-Key` header on every vault request. When unset, the
  // endpoints are open (useful in dev, NOT recommended for a public
  // deploy that exposes private notes).
  const requireVaultKey = (req: any, res: any, next: any) => {
    const expected = process.env.VAULT_API_KEY;
    if (!expected) return next();
    const provided = req.header("x-vault-key");
    if (provided && provided === expected) return next();
    return res.status(401).json({ error: "Unauthorized" });
  };
  app.get("/api/vault/tree", requireVaultKey, async (_req, res) => {
    try {
      const { getVaultTree } = await import("./vault/browse");
      const tree = await getVaultTree();
      res.json(tree);
    } catch (e: any) {
      console.error("vault tree error:", e);
      res.status(500).json({ error: e?.message || "Failed to load vault tree" });
    }
  });

  app.get("/api/vault/file", requireVaultKey, async (req, res) => {
    try {
      const rel = String(req.query.path || "");
      const { resolveVaultFile } = await import("./vault/browse");
      const abs = await resolveVaultFile(rel);
      if (!abs) return res.status(404).json({ error: "File not found" });
      const fs = await import("fs/promises");
      const content = await fs.readFile(abs, "utf-8");
      res.json({ path: rel, content });
    } catch (e: any) {
      console.error("vault file error:", e);
      res.status(500).json({ error: e?.message || "Failed to load vault file" });
    }
  });

  // -------- Translation Cards (Translate surface) --------
  app.post("/api/translate/rich", async (req, res) => {
    try {
      const { text, direction, locale } = req.body;
      if (!text || !direction) return res.status(400).json({ error: "Missing text or direction" });
      const result = await translateRich(text, direction, locale);
      res.json(result);
    } catch (e) {
      console.error(e); res.status(500).json({ error: "Rich translation failed" });
    }
  });

  app.post("/api/translate/transform", async (req, res) => {
    try {
      const { cardId, transform, locale } = req.body;
      if (!cardId || !transform) return res.status(400).json({ error: "Missing cardId or transform" });
      const card = await storage.getTranslationCard(parseInt(cardId));
      if (!card) return res.status(404).json({ error: "Card not found" });
      const result = await transformSentence(
        {
          sourceText: card.sourceText,
          translatedText: card.translatedText,
          sourceLanguage: card.sourceLanguage,
          targetLanguage: card.targetLanguage,
        },
        transform,
        locale || card.locale || undefined,
      );
      res.json(result);
    } catch (e) {
      console.error(e); res.status(500).json({ error: "Transform failed" });
    }
  });

  app.get("/api/translation-cards", async (_req, res) => {
    try {
      const cards = await storage.listTranslationCards();
      res.json(cards);
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed" }); }
  });

  app.post("/api/translation-cards", async (req, res) => {
    try {
      const card = await storage.createTranslationCard(req.body);
      res.json(card);
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed to create card" }); }
  });

  app.get("/api/translation-cards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const card = await storage.getTranslationCard(id);
      if (!card) return res.status(404).json({ error: "Not found" });
      res.json(card);
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed" }); }
  });

  app.patch("/api/translation-cards/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const card = await storage.updateTranslationCard(id, req.body);
      if (!card) return res.status(404).json({ error: "Not found" });
      res.json(card);
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed" }); }
  });

  app.delete("/api/translation-cards/:id", async (req, res) => {
    try {
      await storage.deleteTranslationCard(parseInt(req.params.id));
      res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed" }); }
  });

  // -------- Chat conversations & seeded chat --------
  app.post("/api/chat/seeded", async (req, res) => {
    try {
      const { cardId, conversationId, messages, locale } = req.body;
      if (!cardId) return res.status(400).json({ error: "Missing cardId" });
      const card = await storage.getTranslationCard(parseInt(cardId));
      if (!card) return res.status(404).json({ error: "Card not found" });

      let conv: ChatConversation | undefined;
      if (conversationId) {
        conv = await storage.getChatConversation(parseInt(conversationId));
      }
      if (!conv) {
        conv = await storage.createChatConversation({
          seedTranslationCardId: card.id,
          locale: locale || card.locale || null,
          title: `Chat about: ${card.sourceText.slice(0, 40)}`,
        });
        await storage.updateTranslationCard(card.id, { conversationId: conv.id });
      }

      const inMessages: { role: string; content: string }[] = Array.isArray(messages) ? messages : [];
      // Persist any new user messages
      const existing = await storage.getChatMessages(conv.id);
      for (let i = existing.length; i < inMessages.length; i++) {
        const m = inMessages[i];
        if (m && (m.role === "user" || m.role === "assistant")) {
          await storage.addChatMessage({ conversationId: conv.id, role: m.role, content: m.content });
        }
      }

      const reply = await seededChatReply(
        {
          sourceText: card.sourceText,
          translatedText: card.translatedText,
          literalText: card.literalText,
          grammarNotes: Array.isArray(card.grammarNotes)
            ? (card.grammarNotes as { term: string; note: string }[])
            : null,
        },
        inMessages,
        locale || card.locale || undefined,
      );
      await storage.addChatMessage({ conversationId: conv.id, role: "assistant", content: reply });
      res.json({ reply, conversationId: conv.id });
    } catch (e) {
      console.error(e); res.status(500).json({ error: "Seeded chat failed" });
    }
  });

  app.get("/api/chat/conversations", async (_req, res) => {
    try {
      const conversations = await storage.listChatConversations();
      res.json(conversations);
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed" }); }
  });

  app.get("/api/chat/conversations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const conv = await storage.getChatConversation(id);
      if (!conv) return res.status(404).json({ error: "Not found" });
      const messages = await storage.getChatMessages(id);
      res.json({ conversation: conv, messages });
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed" }); }
  });

  app.delete("/api/chat/conversations/:id", async (req, res) => {
    try {
      await storage.deleteChatConversation(parseInt(req.params.id));
      res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed" }); }
  });

  app.get("/api/chat/conversations/:id/messages", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const messages = await storage.getChatMessages(id);
      res.json(messages);
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed" }); }
  });

  app.post("/api/chat/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { role, content } = req.body || {};
      if (!role || !content) return res.status(400).json({ error: "Missing role or content" });
      if (role !== "user" && role !== "assistant" && role !== "system") {
        return res.status(400).json({ error: "Invalid role" });
      }
      const msg = await storage.addChatMessage({ conversationId, role, content });
      res.json(msg);
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed" }); }
  });

  app.patch("/api/chat/messages/:id", async (req, res) => {
    try {
      const { content } = req.body || {};
      if (typeof content !== "string") return res.status(400).json({ error: "Missing content" });
      const msg = await storage.updateChatMessage(parseInt(req.params.id), content);
      if (!msg) return res.status(404).json({ error: "Not found" });
      res.json(msg);
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed" }); }
  });

  app.delete("/api/chat/messages/:id", async (req, res) => {
    try {
      await storage.deleteChatMessage(parseInt(req.params.id));
      res.json({ success: true });
    } catch (e) { console.error(e); res.status(500).json({ error: "Failed" }); }
  });

  // PWA / build info
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, ts: Date.now() });
  });

  return httpServer;
}
