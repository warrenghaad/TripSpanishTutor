import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Sun, Sunrise, Sunset, Moon, WifiOff, Wifi, Send, Loader2, Sparkles,
  ListChecks, MessageCircle, Languages, BookMarked, ArrowRight, Trash2,
} from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { useOnline } from "@/lib/use-online";
import { motion, AnimatePresence } from "framer-motion";
import { lookupInPack, type TripPack } from "@/lib/pack-store";
import { idbGet, idbPut } from "@/lib/idb";
import { enqueueRequest } from "@/lib/offline-queue";
import { recordNode } from "@/lib/trail-store";
import type { ProjectPack, DailyAnalysis, QueuedQuestion, ProjectPackPayload, DailyAnalysisPayload, TranslationCard, DictionaryWord } from "@shared/schema";

const PROJECT_PACK_IDB_KEY = "active-project-pack";
const TRANSLATION_CARDS_IDB_KEY = "day-translation-cards-cache";
const DICTIONARY_IDB_KEY = "day-dictionary-cache";

async function fetchAndCache<T>(url: string, idbKey: string): Promise<T[]> {
  if (navigator.onLine) {
    try {
      const r = await fetch(url);
      if (r.ok) {
        const data = (await r.json()) as T[];
        await idbPut("kv", data, idbKey);
        return data;
      }
    } catch { /* fall through to cache */ }
  }
  const cached = await idbGet<T[]>("kv", idbKey);
  return cached || [];
}

type Mode = "before" | "out-offline" | "out-online" | "after";

type ChatMsg = {
  role: "user" | "assistant" | "system";
  text: string;
  source?: "pack" | "live" | "queued";
  confidence?: "high" | "medium" | "low";
};

const MODE_META: Record<Mode, { label: string; icon: typeof Sun; tagline: string }> = {
  before: { label: "Before", icon: Sunrise, tagline: "Build today's pack" },
  "out-offline": { label: "Out · Offline", icon: WifiOff, tagline: "Lean on the pack" },
  "out-online": { label: "Out · Online", icon: Wifi, tagline: "Live coach + pack" },
  after: { label: "After", icon: Moon, tagline: "Offload + debrief" },
};

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function suggestMode(online: boolean): Mode {
  const h = new Date().getHours();
  if (h < 10) return "before";
  if (h >= 20) return "after";
  return online ? "out-online" : "out-offline";
}

export default function DayPage() {
  const { locale } = useLocale();
  const online = useOnline();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [mode, setMode] = useState<Mode>(() => suggestMode(navigator.onLine));
  const [autoMode, setAutoMode] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [tripPack, setTripPack] = useState<TripPack | undefined>();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-suggest mode unless user manually overrode
  useEffect(() => {
    if (autoMode) setMode(suggestMode(online));
  }, [online, autoMode]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9999, behavior: "smooth" });
  }, [messages]);

  // Load latest pack & analysis. Hydrate from IDB first so the offline mode
  // works even when the network is unreachable; refresh from server when it
  // succeeds and write the latest payload back to IDB for next launch.
  const packQuery = useQuery<ProjectPack | null>({
    queryKey: ["/api/day/project-packs/latest"],
    queryFn: async () => {
      try {
        const r = await fetch("/api/day/project-packs/latest");
        if (r.ok) {
          const fresh = (await r.json()) as ProjectPack | null;
          if (fresh) await idbPut("kv", fresh, PROJECT_PACK_IDB_KEY);
          return fresh;
        }
      } catch {
        // network failure — fall through to cached
      }
      const cached = await idbGet<ProjectPack>("kv", PROJECT_PACK_IDB_KEY);
      return cached || null;
    },
  });
  const analysisQuery = useQuery<DailyAnalysis | null>({
    queryKey: ["/api/day/analyses/latest"],
    queryFn: async () => {
      const r = await fetch("/api/day/analyses/latest");
      if (!r.ok) return null;
      return r.json();
    },
  });
  const queuedQuery = useQuery<QueuedQuestion[]>({
    queryKey: ["/api/day/queued-questions", "pending"],
    queryFn: async () => {
      const r = await fetch("/api/day/queued-questions?status=pending");
      if (!r.ok) return [];
      return r.json();
    },
  });

  // Cached offline trip pack (built on /trip-pack page) gives the real
  // offline lookup index for Out-Offline mode. ProjectPack is the AI brief.
  useEffect(() => {
    import("@/lib/pack-store").then((m) => m.getActivePack().then(setTripPack).catch(() => {}));
  }, [mode]);

  const pack = packQuery.data;
  const packPayload = pack?.payload as ProjectPackPayload | undefined;

  // ---- Mode switching helpers ------------------------------------------
  const switchMode = (m: Mode) => {
    setAutoMode(false);
    setMode(m);
    setMessages([]);
  };

  // ---- Before: build pack ----------------------------------------------
  const [outingType, setOutingType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState("");
  const buildPackMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/day/project-packs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: todayISO(), outingType, purpose, tone, locale }),
      });
      if (!r.ok) throw new Error("Build failed");
      return (await r.json()) as ProjectPack;
    },
    onSuccess: () => {
      toast({ title: "Pack ready", description: "Today's project pack is loaded." });
      qc.invalidateQueries({ queryKey: ["/api/day/project-packs/latest"] });
      setOutingType(""); setPurpose(""); setTone("");
    },
    onError: () => toast({ title: "Couldn't build pack", variant: "destructive" }),
  });

  // ---- Out-Online chat --------------------------------------------------
  const onlineChatMutation = useMutation({
    mutationFn: async (text: string) => {
      const packCtx = packPayload
        ? `\n\nThe learner's ProjectPack for today (${pack?.outingType}): ${packPayload.personaBrief || ""}. Likely phrases include: ${packPayload.likelyPhrases.slice(0, 4).map((p) => p.es).join("; ")}.`
        : "";
      const trailCtx = trailContext
        ? `\n\nRecent trail activity: ${trailContext}.`
        : "";
      const ctx = packCtx + trailCtx;
      const conversation = [
        { role: "system" as const, content: `You are Vallarta Voz, a warm Spanish learning companion.${ctx}` },
        ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.text })),
        { role: "user" as const, content: text },
      ];
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation, locale }),
      });
      if (!r.ok) throw new Error("Chat failed");
      return (await r.json()).reply as string;
    },
    onSuccess: (reply, sentText) => {
      setMessages((prev) => [...prev, { role: "assistant", text: reply, source: "live" }]);
      // Capture the live-coach exchange on the active trail so the After
      // debrief and tomorrow's pack can see what was discussed.
      recordNode("chat", sentText.slice(0, 80), { question: sentText, reply, mode: "out-online" }, "live", locale).catch(() => {});
    },
    onError: () => toast({ title: "Live coach failed", variant: "destructive" }),
  });

  // ---- Out-Online trail context ----------------------------------------
  // Keep a rolling buffer of the last few trail node labels so the live
  // coach knows what the user has been doing today (saved words, lookups,
  // heard phrases). Refreshed each time messages change.
  const [trailContext, setTrailContext] = useState<string>("");
  useEffect(() => {
    if (mode !== "out-online" || !online) return;
    (async () => {
      try {
        const r = await fetch("/api/trails?limit=1");
        if (!r.ok) return;
        const trails = await r.json();
        const t = Array.isArray(trails) ? trails[0] : null;
        if (!t?.id) return;
        const nr = await fetch(`/api/trails/${t.id}/nodes?limit=8`);
        if (!nr.ok) return;
        const nodes = await nr.json();
        type TrailNodeLite = { kind: string; label: string };
        const list: TrailNodeLite[] = Array.isArray(nodes)
          ? (nodes as TrailNodeLite[]).filter((n) => typeof n?.kind === "string" && typeof n?.label === "string")
          : [];
        const summary = list.slice(-8).map((n) => `[${n.kind}] ${n.label}`).join("; ");
        setTrailContext(summary);
      } catch { /* non-fatal */ }
    })();
  }, [mode, online, messages.length]);

  // ---- Out-Offline lookup + queue --------------------------------------
  // When online we POST straight to the server queue; when offline we hand
  // the request off to the IndexedDB-backed offline queue, which the
  // sync-watcher drains automatically on reconnect.
  const queueMutation = useMutation({
    mutationFn: async (query: string) => {
      const body = { query, projectPackId: pack?.id, context: pack?.outingType };
      if (!navigator.onLine) {
        await enqueueRequest({
          endpoint: "/api/day/queued-questions",
          method: "POST",
          body,
          label: `Day · queued question: "${query.slice(0, 40)}"`,
          invalidateKeys: [["/api/day/queued-questions", "pending"]],
        });
        return { offline: true, query };
      }
      const r = await fetch("/api/day/queued-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("queue failed");
      return await r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/day/queued-questions", "pending"] }),
  });

  // ---- Offline lookup cascade: cached pack → translation cards → dictionary
  // Returns a list of suggestions for a dropdown when the cached ProjectPack
  // misses. Each step is best-effort: translation_cards and dictionary_words
  // are server-backed, so they only succeed when the device can reach them.
  type LookupHit = { source: "translation-card" | "dictionary"; primary: string; secondary?: string; id?: number };
  const [lookupHits, setLookupHits] = useState<LookupHit[]>([]);
  const [lookingUp, setLookingUp] = useState(false);

  // Pre-warm caches on mount when online so Out-Offline truly works without
  // any network: subsequent lookups read straight from IndexedDB.
  useEffect(() => {
    if (navigator.onLine) {
      fetchAndCache<TranslationCard>("/api/translation-cards", TRANSLATION_CARDS_IDB_KEY).catch(() => {});
      fetchAndCache<DictionaryWord>("/api/dictionary/words", DICTIONARY_IDB_KEY).catch(() => {});
    }
  }, []);

  async function fallbackLookupCascade(query: string): Promise<LookupHit[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    const hits: LookupHit[] = [];
    const cards = await fetchAndCache<TranslationCard>("/api/translation-cards", TRANSLATION_CARDS_IDB_KEY);
    for (const c of cards) {
      if (
        (c.sourceText && c.sourceText.toLowerCase().includes(q)) ||
        (c.translatedText && c.translatedText.toLowerCase().includes(q))
      ) {
        hits.push({
          source: "translation-card",
          primary: c.translatedText || c.sourceText,
          secondary: c.translatedText ? c.sourceText : undefined,
          id: c.id,
        });
        if (hits.length >= 3) break;
      }
    }
    const words = await fetchAndCache<DictionaryWord>("/api/dictionary/words", DICTIONARY_IDB_KEY);
    for (const w of words) {
      if (
        (w.spanish && w.spanish.toLowerCase().includes(q)) ||
        (w.english && w.english.toLowerCase().includes(q))
      ) {
        hits.push({
          source: "dictionary",
          primary: w.spanish,
          secondary: w.english || undefined,
          id: w.id,
        });
        if (hits.length >= 6) break;
      }
    }
    return hits;
  }

  const answerQueuedMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/day/queued-questions/${id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      if (!r.ok) throw new Error("answer failed");
      return await r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/day/queued-questions", "pending"] }),
  });

  const dismissQueuedMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/day/queued-questions/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("dismiss failed");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/day/queued-questions", "pending"] }),
  });

  // ---- Auto-drain queued questions on reconnect ------------------------
  // When online + we have pending queued questions that haven't been
  // surfaced in chat yet, fire off the answer endpoint and inject the
  // reply into the chat thread. Tracks shown ids so we don't re-inject.
  const drainedIds = useRef<Set<number>>(new Set());
  useEffect(() => {
    if (!online) return;
    const pending = (queuedQuery.data || []).filter(
      (q) => q.status === "pending" && !drainedIds.current.has(q.id),
    );
    if (pending.length === 0) return;
    let cancelled = false;
    (async () => {
      for (const q of pending) {
        if (cancelled) return;
        drainedIds.current.add(q.id);
        try {
          const r = await fetch(`/api/day/queued-questions/${q.id}/answer`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locale }),
          });
          if (!r.ok) continue;
          const answered = (await r.json()) as QueuedQuestion;
          if (cancelled) return;
          setMessages((prev) => [
            ...prev,
            { role: "system", text: `Earlier you asked: "${q.query}"`, source: "queued" },
            { role: "assistant", text: answered.answer || "(no answer)", source: "queued", confidence: "medium" },
          ]);
        } catch { /* will retry on next render where data still has it */ }
      }
      qc.invalidateQueries({ queryKey: ["/api/day/queued-questions", "pending"] });
    })();
    return () => { cancelled = true; };
  }, [online, queuedQuery.data, locale, qc]);

  // ---- After: debrief ---------------------------------------------------
  const [offload, setOffload] = useState("");
  const debriefMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/day/debrief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: todayISO(),
          rawOffload: offload,
          projectPackId: pack?.id,
          locale,
        }),
      });
      if (!r.ok) throw new Error("debrief failed");
      return (await r.json()) as DailyAnalysis;
    },
    onSuccess: () => {
      toast({ title: "Debrief saved", description: "Promoted items will appear in tomorrow's pack." });
      qc.invalidateQueries({ queryKey: ["/api/day/analyses/latest"] });
      setOffload("");
    },
    onError: () => toast({ title: "Debrief failed", variant: "destructive" }),
  });

  // ---- Persistent input bar dispatch -----------------------------------
  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");

    if (mode === "before") {
      // The Before bar acts as a quick-create for outing type if empty
      if (!outingType) setOutingType(text);
      else if (!purpose) setPurpose(text);
      else setTone(text);
      return;
    }
    if (mode === "after") {
      // Append to offload buffer
      setOffload((prev) => (prev ? `${prev}\n${text}` : text));
      return;
    }
    setMessages((prev) => [...prev, { role: "user", text }]);

    if (mode === "out-offline") {
      // Cascade: cached ProjectPack → cached TripPack index → cached
      // translation_cards & dictionary_words (IDB) → IDB-queue.
      setLookupHits([]);
      const inPayload = packPayload ? findInProjectPack(packPayload, text) : undefined;
      if (inPayload) {
        setMessages((prev) => [...prev, { role: "assistant", text: inPayload, source: "pack", confidence: "high" }]);
        recordNode("lookup", text.slice(0, 80), { query: text, hit: inPayload, source: "project-pack" }, "pack", locale).catch(() => {});
        return;
      }
      const inTrip = tripPack ? lookupInPack(tripPack, text) : undefined;
      if (inTrip) {
        setMessages((prev) => [...prev, { role: "assistant", text: inTrip.text, source: "pack", confidence: inTrip.confidence }]);
        recordNode("lookup", text.slice(0, 80), { query: text, hit: inTrip.text, source: "trip-pack" }, "pack", locale).catch(() => {});
        return;
      }
      // Try translation_cards + dictionary as the spec's dropdown fallback
      setLookingUp(true);
      fallbackLookupCascade(text)
        .then((hits) => {
          setLookupHits(hits);
          if (hits.length === 0) {
            queueMutation.mutate(text);
            setMessages((prev) => [...prev, {
              role: "assistant",
              text: navigator.onLine
                ? "Not in today's pack — queued for the live coach. I'll surface the answer next time."
                : "Offline — queued locally. Will sync to the live coach when you reconnect.",
              source: "queued",
            }]);
            recordNode("question", text.slice(0, 80), { query: text, status: "queued" }, "queued", locale).catch(() => {});
          } else {
            setMessages((prev) => [...prev, {
              role: "assistant",
              text: `Found ${hits.length} possible match${hits.length === 1 ? "" : "es"} in your translation cards / dictionary — pick one below or queue for the live coach.`,
              source: "pack",
              confidence: "low",
            }]);
          }
        })
        .finally(() => setLookingUp(false));
      return;
    }

    if (mode === "out-online") {
      onlineChatMutation.mutate(text);
    }
  }

  const ModeIcon = MODE_META[mode].icon;

  const placeholderByMode: Record<Mode, string> = {
    before: !outingType ? "Where are you headed today?" : !purpose ? "What's the purpose? (eat, browse, swim…)" : "Tone? (warm, crisp, playful…)",
    "out-offline": "Ask anything — I'll search today's pack first.",
    "out-online": "Ask the live coach (pack stays loaded as context).",
    after: "Dump the day — English, Spanish, fragments, all welcome.",
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        <header>
          <div className="flex items-center gap-3 mb-2">
            <ModeIcon className="w-7 h-7 text-primary" />
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground" data-testid="text-page-title">
              Day Companion
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            One chat surface, four modes. The day loops: build a pack, lean on it offline, refine it live, debrief at night.
          </p>
        </header>

        {/* Mode switcher */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2" data-testid="mode-switcher">
          {(Object.keys(MODE_META) as Mode[]).map((m) => {
            const Meta = MODE_META[m];
            const Icon = Meta.icon;
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`text-left p-3 rounded-xl border transition ${
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-white hover:border-primary/40"
                }`}
                data-testid={`button-mode-${m}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-bold text-sm">{Meta.label}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{Meta.tagline}</p>
              </button>
            );
          })}
        </div>

        {autoMode && (
          <p className="text-[11px] text-muted-foreground -mt-2">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Auto-suggested by time of day &amp; connection — pick one to override.
          </p>
        )}

        {/* Pack snapshot card (always visible if a pack exists) */}
        {pack && (
          <Card className="p-4 border-secondary/30 bg-secondary/5" data-testid="card-pack-summary">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Today's Project Pack</p>
                <h2 className="font-bold text-base">{pack.outingType}{pack.purpose ? ` · ${pack.purpose}` : ""}</h2>
                {packPayload?.personaBrief && (
                  <p className="text-xs text-muted-foreground mt-1">{packPayload.personaBrief}</p>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground text-right shrink-0">
                <div>{packPayload?.likelyPhrases.length || 0} phrases</div>
                <div>{packPayload?.likelyReplies.length || 0} replies</div>
                <div>{packPayload?.fallbacks.length || 0} fallbacks</div>
              </div>
            </div>
            {packPayload?.carriedOver && packPayload.carriedOver.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                  Carried over from yesterday's debrief
                </p>
                <ul className="space-y-1">
                  {packPayload.carriedOver.slice(0, 3).map((c, i) => (
                    <li key={i} className="text-xs" data-testid={`carry-over-${i}`}>
                      <ArrowRight className="w-3 h-3 inline mr-1 text-primary" />
                      <span className="font-medium">{c.text}</span>
                      {c.note && <span className="text-muted-foreground"> — {c.note}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}

        {/* Mode bodies */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {mode === "before" && (
              <BeforeMode
                outingType={outingType}
                purpose={purpose}
                tone={tone}
                setOutingType={setOutingType}
                setPurpose={setPurpose}
                setTone={setTone}
                onBuild={() => buildPackMutation.mutate()}
                building={buildPackMutation.isPending}
                disabled={!outingType.trim()}
              />
            )}

            {(mode === "out-offline" || mode === "out-online") && (
              <OutMode
                mode={mode}
                messages={messages}
                scrollRef={scrollRef}
                pack={pack}
                packPayload={packPayload}
                queued={queuedQuery.data || []}
                online={online}
                onAnswerQueued={(id) => answerQueuedMutation.mutate(id)}
                onDismissQueued={(id) => dismissQueuedMutation.mutate(id)}
                answeringId={answerQueuedMutation.isPending ? answerQueuedMutation.variables ?? null : null}
                lookupHits={lookupHits}
                lookingUp={lookingUp}
                onPickLookupHit={(hit) => {
                  setMessages((prev) => [...prev, {
                    role: "assistant",
                    text: hit.secondary ? `${hit.primary} — ${hit.secondary}` : hit.primary,
                    source: "pack",
                    confidence: "medium",
                  }]);
                  setLookupHits([]);
                }}
                onQueueAnyway={(text) => {
                  queueMutation.mutate(text);
                  setLookupHits([]);
                  setMessages((prev) => [...prev, {
                    role: "assistant",
                    text: "Queued for the live coach.",
                    source: "queued",
                  }]);
                }}
              />
            )}

            {mode === "after" && (
              <AfterMode
                offload={offload}
                setOffload={setOffload}
                onSubmit={() => debriefMutation.mutate()}
                submitting={debriefMutation.isPending}
                latestAnalysis={analysisQuery.data || null}
                captureCounts={{
                  messages: messages.length,
                  queued: queuedQuery.data?.length || 0,
                  words: offload.trim() ? offload.trim().split(/\s+/).length : 0,
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Persistent input bar (sticky, shared across modes) */}
        <div className="sticky bottom-20 md:bottom-4 z-30">
          <Card className="p-2 md:p-3 border-primary/30 bg-white/95 backdrop-blur shadow-lg" data-testid="day-input-bar">
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={placeholderByMode[mode]}
                rows={1}
                className="resize-none min-h-[40px] max-h-32 text-sm border-0 focus-visible:ring-0"
                data-testid="input-day-bar"
              />
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!input.trim() || onlineChatMutation.isPending}
                className="bg-primary"
                data-testid="button-day-send"
              >
                {onlineChatMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1 pt-1">
              <span>{MODE_META[mode].label} mode</span>
              <span className="flex items-center gap-1">
                {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {online ? "online" : "offline"}
              </span>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

// ---------- Subviews ----------

function BeforeMode(props: {
  outingType: string; purpose: string; tone: string;
  setOutingType: (s: string) => void; setPurpose: (s: string) => void; setTone: (s: string) => void;
  onBuild: () => void; building: boolean; disabled: boolean;
}) {
  return (
    <Card className="p-4 md:p-6 border-primary/20" data-testid="before-mode">
      <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
        <Sunrise className="w-5 h-5 text-primary" />
        Build today's project pack
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        This pulls your learner profile, recent trails, vault wordlens/grammar, and yesterday's promoted items into one outing-specific brief.
      </p>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Outing</label>
          <Input
            value={props.outingType}
            onChange={(e) => props.setOutingType(e.target.value)}
            placeholder="e.g. Mercado Cuale walk-through"
            data-testid="input-outing-type"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Purpose (optional)</label>
          <Input
            value={props.purpose}
            onChange={(e) => props.setPurpose(e.target.value)}
            placeholder="e.g. find a vegetarian comida corrida"
            data-testid="input-purpose"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Tone (optional)</label>
          <Input
            value={props.tone}
            onChange={(e) => props.setTone(e.target.value)}
            placeholder="e.g. warm, low-pressure, curious"
            data-testid="input-tone"
          />
        </div>
        <Button
          className="w-full bg-primary"
          onClick={props.onBuild}
          disabled={props.disabled || props.building}
          data-testid="button-build-project-pack"
        >
          {props.building ? (
            <span className="flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Building (this can take 15-40s)…</span>
          ) : (
            <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2" /> Build pack</span>
          )}
        </Button>
      </div>
    </Card>
  );
}

function OutMode(props: {
  mode: Mode; messages: ChatMsg[]; scrollRef: React.RefObject<HTMLDivElement | null>;
  pack: ProjectPack | null | undefined; packPayload: ProjectPackPayload | undefined | null;
  queued: QueuedQuestion[]; online: boolean;
  onAnswerQueued: (id: number) => void; onDismissQueued: (id: number) => void;
  answeringId: number | null;
  lookupHits?: { source: "translation-card" | "dictionary"; primary: string; secondary?: string; id?: number }[];
  lookingUp?: boolean;
  onPickLookupHit?: (hit: { source: "translation-card" | "dictionary"; primary: string; secondary?: string; id?: number }) => void;
  onQueueAnyway?: (text: string) => void;
}) {
  const { mode, messages, packPayload, queued, lookupHits, lookingUp, onPickLookupHit, onQueueAnyway } = props;
  const lastUserText = [...messages].reverse().find((m) => m.role === "user")?.text || "";
  return (
    <div className="space-y-4">
      {!props.pack && (
        <Card className="p-4 bg-amber-50 border-amber-200" data-testid="warn-no-pack">
          <p className="text-sm text-amber-900">
            No project pack yet for today. Switch to <strong>Before</strong> to build one — this mode works much better with a pack loaded.
          </p>
        </Card>
      )}

      {/* Pack quick-reference (Out-Offline) or chat-with-context (Out-Online) */}
      {mode === "out-offline" && packPayload && (
        <PackQuickRef payload={packPayload} />
      )}

      <Card className="p-3 md:p-4 min-h-[260px]" data-testid="day-chat-thread">
        <div ref={props.scrollRef} className="max-h-[320px] overflow-y-auto space-y-2">
          {messages.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              {mode === "out-offline"
                ? "Ask anything in the bar below — I'll search today's pack first."
                : "Live coach ready. Today's pack stays loaded as context."}
            </p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg text-sm ${
                  m.role === "user"
                    ? "bg-primary/10 ml-8"
                    : m.source === "pack"
                      ? "bg-secondary/10 mr-8 border border-secondary/30"
                      : m.source === "queued"
                        ? "bg-amber-50 mr-8 border border-amber-200"
                        : "bg-muted/50 mr-8"
                }`}
                data-testid={`chat-msg-${i}`}
              >
                {m.role !== "user" && m.source && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    {m.source === "pack" ? `📦 from pack · ${m.confidence}` : m.source === "queued" ? "⏳ queued" : "🌐 live"}
                  </span>
                )}
                {m.text}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Offline cascade dropdown (translation cards + dictionary) */}
      {mode === "out-offline" && (lookingUp || (lookupHits && lookupHits.length > 0)) && (
        <Card className="p-3 border-secondary/30 bg-white" data-testid="lookup-dropdown">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
            <Languages className="w-3 h-3" />
            {lookingUp ? "Searching translation cards & dictionary…" : "Possible matches"}
          </h3>
          {lookingUp && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          {!lookingUp && lookupHits && (
            <ul className="space-y-1.5">
              {lookupHits.map((h, i) => (
                <li key={i}>
                  <button
                    onClick={() => onPickLookupHit?.(h)}
                    className="w-full text-left p-2 rounded-md hover:bg-secondary/10 border border-transparent hover:border-secondary/30 text-xs"
                    data-testid={`lookup-hit-${i}`}
                  >
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mr-2">
                      {h.source === "translation-card" ? "card" : "dict"}
                    </span>
                    <span className="font-medium">{h.primary}</span>
                    {h.secondary && <span className="text-muted-foreground"> — {h.secondary}</span>}
                  </button>
                </li>
              ))}
              {lastUserText && (
                <li className="pt-1">
                  <button
                    onClick={() => onQueueAnyway?.(lastUserText)}
                    className="w-full text-left p-2 rounded-md hover:bg-amber-50 border border-transparent hover:border-amber-200 text-xs text-muted-foreground"
                    data-testid="button-queue-anyway"
                  >
                    None of these — queue for the live coach instead.
                  </button>
                </li>
              )}
            </ul>
          )}
        </Card>
      )}

      {/* Queued questions (only show if there are any) */}
      {queued.length > 0 && (
        <Card className="p-4 bg-amber-50/50 border-amber-200" data-testid="queued-questions">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-3">
            <ListChecks className="w-4 h-4" /> Queued questions ({queued.length})
          </h3>
          <ul className="space-y-2">
            {queued.slice(0, 6).map((q) => (
              <li key={q.id} className="bg-white rounded-lg p-2 border border-amber-100" data-testid={`queued-${q.id}`}>
                <p className="text-xs font-medium">{q.query}</p>
                {q.context && <p className="text-[10px] text-muted-foreground">{q.context}</p>}
                <div className="flex gap-1 mt-2">
                  {props.online && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      disabled={props.answeringId === q.id}
                      onClick={() => props.onAnswerQueued(q.id)}
                      data-testid={`button-answer-${q.id}`}
                    >
                      {props.answeringId === q.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageCircle className="w-3 h-3 mr-1" />}
                      Answer now
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => props.onDismissQueued(q.id)}
                    data-testid={`button-dismiss-${q.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                {q.answer && (
                  <p className="text-xs mt-2 pt-2 border-t border-amber-100 text-foreground">{q.answer}</p>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function PackQuickRef({ payload }: { payload: ProjectPackPayload }) {
  const sections: { title: string; items: { es?: string; en?: string; label?: string; note?: string }[]; icon: typeof Languages }[] = [
    { title: "Likely phrases", items: payload.likelyPhrases, icon: Languages },
    { title: "Likely replies you'll hear", items: payload.likelyReplies, icon: MessageCircle },
    { title: "Fallbacks / repair", items: payload.fallbacks, icon: ListChecks },
    { title: "Nearby doors", items: payload.nearbyDoors, icon: BookMarked },
  ];
  return (
    <div className="grid md:grid-cols-2 gap-3" data-testid="pack-quick-ref">
      {sections.map((s) => (
        <Card key={s.title} className="p-3" data-testid={`pack-section-${s.title.replace(/[^a-z]/gi, "-").toLowerCase()}`}>
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
            <s.icon className="w-3 h-3" /> {s.title} ({s.items.length})
          </h3>
          <ul className="space-y-1.5">
            {s.items.slice(0, 6).map((it, i) => (
              <li key={i} className="text-xs">
                {it.label && <span className="font-bold">{it.label}: </span>}
                {it.es && <span className="font-medium text-foreground">{it.es}</span>}
                {it.es && it.en && <span className="text-muted-foreground"> — {it.en}</span>}
                {!it.es && it.en && <span className="text-muted-foreground">{it.en}</span>}
                {it.note && <p className="text-[10px] text-muted-foreground mt-0.5">{it.note}</p>}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}

function AfterMode(props: {
  offload: string; setOffload: (s: string) => void;
  onSubmit: () => void; submitting: boolean;
  latestAnalysis: DailyAnalysis | null;
  captureCounts?: { messages: number; queued: number; words: number };
}) {
  const payload = props.latestAnalysis?.payload as DailyAnalysisPayload | undefined;
  const counts = props.captureCounts;
  return (
    <div className="space-y-4">
      {counts && (
        <Card className="p-3 bg-secondary/5 border-secondary/30" data-testid="after-capture-counts">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2">
            Today's day capture
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div data-testid="capture-messages"><div className="text-xl font-bold">{counts.messages}</div><div className="text-[10px] text-muted-foreground">chat turns</div></div>
            <div data-testid="capture-queued"><div className="text-xl font-bold">{counts.queued}</div><div className="text-[10px] text-muted-foreground">queued Qs</div></div>
            <div data-testid="capture-words"><div className="text-xl font-bold">{counts.words}</div><div className="text-[10px] text-muted-foreground">words drafted</div></div>
          </div>
        </Card>
      )}
      <Card className="p-4 md:p-6 border-primary/20" data-testid="after-mode">
        <h2 className="font-display font-bold text-lg mb-2 flex items-center gap-2">
          <Sunset className="w-5 h-5 text-primary" /> Offload your day
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Dump it raw — what worked, what tripped you, the phrases you heard, the things you wanted to say but couldn't. We'll extract structure and surface the most useful bits in tomorrow's pack.
        </p>
        <Textarea
          value={props.offload}
          onChange={(e) => props.setOffload(e.target.value)}
          placeholder="So I went to the mercado and the lady said 'a la orden' which I think means…"
          rows={8}
          className="text-sm"
          data-testid="textarea-offload"
        />
        <Button
          className="w-full mt-3 bg-primary"
          disabled={!props.offload.trim() || props.submitting}
          onClick={props.onSubmit}
          data-testid="button-debrief"
        >
          {props.submitting ? (
            <span className="flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reading the day…</span>
          ) : (
            <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2" /> Run debrief</span>
          )}
        </Button>
      </Card>

      {props.latestAnalysis && payload && (
        <Card className="p-4 md:p-5 bg-secondary/5 border-secondary/30" data-testid="latest-analysis">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
            Latest debrief · {new Date(props.latestAnalysis.createdAt).toLocaleString()}
          </p>
          {payload.summary && <p className="text-sm mt-2">{payload.summary}</p>}

          {props.latestAnalysis.promotedItems && props.latestAnalysis.promotedItems.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-xs font-bold mb-1">Will appear in tomorrow's pack:</p>
              <ul className="space-y-1">
                {props.latestAnalysis.promotedItems.map((p, i) => (
                  <li key={i} className="text-xs" data-testid={`promoted-item-${i}`}>
                    <ArrowRight className="w-3 h-3 inline mr-1 text-primary" />
                    <span className="font-medium">{p.text}</span>
                    {p.note && <span className="text-muted-foreground"> — {p.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {payload.missedTranslations && payload.missedTranslations.length > 0 && (
            <details className="mt-3 text-xs">
              <summary className="cursor-pointer font-bold">Missed translations ({payload.missedTranslations.length})</summary>
              <ul className="mt-1 space-y-1 pl-3">
                {payload.missedTranslations.map((m, i) => (
                  <li key={i}>
                    {m.en && <span>{m.en} → </span>}
                    {m.es && <span className="font-medium">{m.es}</span>}
                    {m.note && <span className="text-muted-foreground"> · {m.note}</span>}
                  </li>
                ))}
              </ul>
            </details>
          )}

          {payload.heardPhrases && payload.heardPhrases.length > 0 && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer font-bold">Phrases you heard</summary>
              <ul className="mt-1 space-y-1 pl-3">
                {payload.heardPhrases.map((h, i) => (
                  <li key={i}><span className="font-medium">{h.es}</span>{h.gloss && <span className="text-muted-foreground"> — {h.gloss}</span>}</li>
                ))}
              </ul>
            </details>
          )}
        </Card>
      )}
    </div>
  );
}

// ---------- Helpers ----------

function findInProjectPack(payload: ProjectPackPayload, query: string): string | undefined {
  const q = query.toLowerCase().trim();
  if (!q) return undefined;
  const allBuckets: { items: { es?: string; en?: string; note?: string; label?: string }[]; tag: string }[] = [
    { items: payload.likelyPhrases, tag: "phrase" },
    { items: payload.likelyReplies, tag: "reply" },
    { items: payload.fallbacks, tag: "fallback" },
    { items: payload.nearbyDoors, tag: "door" },
  ];
  for (const b of allBuckets) {
    for (const it of b.items) {
      const hay = [it.es, it.en, it.label, it.note].filter(Boolean).join(" ").toLowerCase();
      if (hay.includes(q)) {
        const es = it.es || it.label || "";
        const en = it.en || "";
        return `${es}${en ? ` — ${en}` : ""}${it.note ? ` (${it.note})` : ""}`;
      }
    }
  }
  return undefined;
}
