import Layout from "@/components/layout";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Languages, Send, WifiOff, RotateCcw } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/lib/locale-context";
import {
  type LocalTranslationCard,
  type LocalPackMatch,
  saveLocalCard,
  listLocalCards,
  updateLocalCard,
} from "@/lib/translation-store";
import { TranslationCardView } from "@/components/translation-card";
import { getActivePack, lookupInPack, type TripPack } from "@/lib/pack-store";

type Direction = "auto" | "en-es" | "es-en";

type RichTranslationResponse = {
  translatedText: string;
  literalText?: string;
  grammarNotes?: { term: string; note: string }[];
  detectedVerbs?: string[];
  detectedAdjectives?: string[];
  detectedAdverbs?: string[];
  suggestedTransforms?: { id: string; label: string }[];
  resolvedSourceLanguage?: "en" | "es";
  resolvedTargetLanguage?: "en" | "es";
};

type ServerCardResponse = { id: number };

function describeError(e: unknown): string {
  return e instanceof Error ? e.message : "";
}

async function persistServerCard(card: LocalTranslationCard): Promise<ServerCardResponse> {
  const res = await fetch("/api/translation-cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceText: card.sourceText,
      sourceLanguage: card.sourceLanguage,
      targetLanguage: card.targetLanguage,
      translatedText: card.translatedText,
      literalText: card.literalText,
      grammarNotes: card.grammarNotes,
      detectedVerbs: card.detectedVerbs,
      detectedAdjectives: card.detectedAdjectives,
      detectedAdverbs: card.detectedAdverbs,
      suggestedTransforms: card.suggestedTransforms,
      tags: card.tags,
      saved: card.saved,
      status: card.status,
      locale: card.locale,
    }),
  });
  if (!res.ok) throw new Error("server save failed");
  return (await res.json()) as ServerCardResponse;
}

async function lookupOfflineMatches(text: string): Promise<LocalPackMatch[]> {
  const pack: TripPack | undefined = await getActivePack();
  if (!pack) return [];
  const out: LocalPackMatch[] = [];
  // Whole-phrase lookup
  const whole = lookupInPack(pack, text);
  if (whole) {
    out.push({
      kind: whole.details && "es" in (whole.details as Record<string, unknown>) ? "translation" : "vocab",
      text: whole.text,
      confidence: whole.confidence,
    });
  }
  // Per-word partials so a long offline sentence still surfaces hits
  const words = text
    .split(/\s+/)
    .map((w) => w.replace(/[¿?¡!.,;:]/g, "").trim())
    .filter((w) => w.length > 2);
  const seen = new Set<string>();
  for (const w of words.slice(0, 6)) {
    const ans = lookupInPack(pack, w);
    if (!ans) continue;
    const key = `${ans.text}|${ans.confidence}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ kind: "vocab", text: `${w} → ${ans.text}`, confidence: ans.confidence });
    if (out.length >= 5) break;
  }
  return out;
}

async function translateRichRequest(
  text: string,
  direction: Direction,
  locale: string,
): Promise<RichTranslationResponse> {
  const res = await fetch("/api/translate/rich", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, direction, locale }),
  });
  if (!res.ok) throw new Error("translate failed");
  return (await res.json()) as RichTranslationResponse;
}

export default function TranslatePage() {
  const { locale } = useLocale();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [direction, setDirection] = useState<Direction>("auto");
  const [online, setOnline] = useState<boolean>(typeof navigator === "undefined" ? true : navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const { data: cards = [] } = useQuery<LocalTranslationCard[]>({
    queryKey: ["local-cards"],
    queryFn: listLocalCards,
  });

  const translate = useMutation({
    mutationFn: async (): Promise<LocalTranslationCard> => {
      const trimmed = text.trim();
      if (!trimmed) throw new Error("empty");

      const sourceLanguage =
        direction === "es-en" ? "es" : direction === "en-es" ? "en" : "auto";
      const targetLanguage = direction === "es-en" ? "en" : "es";

      const queueOffline = async (reason: "offline" | "network-failure"): Promise<LocalTranslationCard> => {
        const packMatches = await lookupOfflineMatches(trimmed);
        const local = await saveLocalCard({
          sourceText: trimmed,
          sourceLanguage,
          targetLanguage,
          translatedText: "",
          grammarNotes: [],
          detectedVerbs: [],
          detectedAdjectives: [],
          detectedAdverbs: [],
          suggestedTransforms: [],
          tags: ["offline"],
          saved: false,
          status: "queued_offline",
          locale,
          packMatches,
          originalDirection: direction,
        });
        toast({
          title: reason === "offline" ? "Saved offline" : "Translation unavailable — queued",
          description: packMatches.length
            ? `Found ${packMatches.length} match${packMatches.length === 1 ? "" : "es"} in your trip pack — full translation when service returns.`
            : reason === "offline"
              ? "We'll translate when you're back online."
              : "We'll retry when you press Retry queued.",
        });
        return local;
      };

      if (!online) return queueOffline("offline");

      let rich: RichTranslationResponse;
      try {
        rich = await translateRichRequest(trimmed, direction, locale);
      } catch {
        // Online but the translation request failed — still queue rather than dropping it.
        return queueOffline("network-failure");
      }

      // For auto-detect, the server tells us which side it actually used;
      // for explicit en-es / es-en we already know. Persist the resolved
      // languages so downstream features (transforms, chat seeding,
      // practice surface labels) operate on the correct side.
      const resolvedSourceLanguage =
        rich.resolvedSourceLanguage ??
        (direction === "es-en" ? "es" : direction === "en-es" ? "en" : "en");
      const resolvedTargetLanguage =
        rich.resolvedTargetLanguage ??
        (direction === "es-en" ? "en" : direction === "en-es" ? "es" : "es");

      const local = await saveLocalCard({
        sourceText: trimmed,
        sourceLanguage: resolvedSourceLanguage,
        targetLanguage: resolvedTargetLanguage,
        translatedText: rich.translatedText,
        literalText: rich.literalText,
        grammarNotes: rich.grammarNotes || [],
        detectedVerbs: rich.detectedVerbs || [],
        detectedAdjectives: rich.detectedAdjectives || [],
        detectedAdverbs: rich.detectedAdverbs || [],
        suggestedTransforms: rich.suggestedTransforms || [],
        tags: [],
        saved: false,
        status: "completed",
        locale,
        originalDirection: direction,
      });
      try {
        const server = await persistServerCard(local);
        await updateLocalCard(local.id, { serverId: server.id });
      } catch {
        // best-effort server mirror — local copy is the source of truth
      }
      return local;
    },
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["local-cards"] });
    },
    onError: (e: unknown) => {
      if (describeError(e) !== "empty") {
        toast({ title: "Translation failed", description: describeError(e), variant: "destructive" });
      }
    },
  });

  const queued = cards.filter((c) => c.status === "queued_offline");

  const retryQueued = useMutation({
    mutationFn: async (): Promise<{ flushed: number; failed: number }> => {
      let flushed = 0;
      let failed = 0;
      for (const q of queued) {
        try {
          // Replay using the direction the user originally chose so "auto"
          // queued cards are not silently coerced to en→es on retry.
          const replayDirection: Direction =
            q.originalDirection ?? (q.targetLanguage === "en" ? "es-en" : "en-es");
          const rich = await translateRichRequest(
            q.sourceText,
            replayDirection,
            q.locale || locale,
          );
          const updated = await updateLocalCard(q.id, {
            sourceLanguage:
              rich.resolvedSourceLanguage ?? q.sourceLanguage,
            targetLanguage:
              rich.resolvedTargetLanguage ?? q.targetLanguage,
            translatedText: rich.translatedText,
            literalText: rich.literalText,
            grammarNotes: rich.grammarNotes || [],
            detectedVerbs: rich.detectedVerbs || [],
            detectedAdjectives: rich.detectedAdjectives || [],
            detectedAdverbs: rich.detectedAdverbs || [],
            suggestedTransforms: rich.suggestedTransforms || [],
            tags: (q.tags || []).filter((t) => t !== "offline"),
            status: "completed",
          });
          if (updated) {
            try {
              const server = await persistServerCard(updated);
              await updateLocalCard(q.id, { serverId: server.id });
            } catch {
              // server mirror best-effort
            }
          }
          flushed++;
        } catch {
          await updateLocalCard(q.id, { status: "failed" });
          failed++;
        }
      }
      return { flushed, failed };
    },
    onSuccess: ({ flushed, failed }) => {
      toast({
        title: failed === 0 ? "Queued cards translated" : "Queued cards processed",
        description: `${flushed} translated · ${failed} failed`,
      });
      qc.invalidateQueries({ queryKey: ["local-cards"] });
    },
    onError: (e: unknown) => toast({ title: "Retry failed", description: describeError(e), variant: "destructive" }),
  });

  const practiceCards = cards.filter((c) => c.tags?.includes("practice"));

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        <header>
          <h1 className="text-3xl font-display font-bold text-foreground mb-1 flex items-center gap-2">
            <Languages className="w-7 h-7 text-primary" /> Translate
          </h1>
          <p className="text-muted-foreground text-sm">
            Type a phrase in English or Spanish. Each translation becomes a card you can chat with, grow, or save.
          </p>
        </header>

        <Card className="p-4 space-y-3">
          <Tabs value={direction} onValueChange={(v) => setDirection(v as Direction)}>
            <TabsList>
              <TabsTrigger value="auto" data-testid="dir-auto">Auto</TabsTrigger>
              <TabsTrigger value="en-es" data-testid="dir-en-es">EN → ES</TabsTrigger>
              <TabsTrigger value="es-en" data-testid="dir-es-en">ES → EN</TabsTrigger>
            </TabsList>
          </Tabs>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What would you like to say?"
            rows={3}
            data-testid="input-translate-text"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") translate.mutate();
            }}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {!online && (
                <span className="flex items-center gap-1 text-amber-600">
                  <WifiOff className="w-3 h-3" /> Offline — will queue
                </span>
              )}
            </p>
            <Button onClick={() => translate.mutate()} disabled={translate.isPending || !text.trim()} data-testid="button-translate">
              <Send className="w-4 h-4 mr-1" />
              {translate.isPending ? "Translating…" : "Translate"}
            </Button>
          </div>
        </Card>

        {queued.length > 0 && (
          <Card className="p-3 flex items-center justify-between bg-amber-50 border-amber-200" data-testid="section-queued">
            <p className="text-sm text-amber-900">
              {queued.length} queued offline card{queued.length === 1 ? "" : "s"} waiting to translate.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => retryQueued.mutate()}
              disabled={!online || retryQueued.isPending}
              data-testid="button-retry-queued"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              {retryQueued.isPending ? "Flushing…" : online ? "Retry queued" : "Reconnect to retry"}
            </Button>
          </Card>
        )}

        {practiceCards.length > 0 && (
          <details className="bg-accent/20 rounded-md p-3 text-sm" data-testid="section-practice">
            <summary className="cursor-pointer font-medium">
              {practiceCards.length} sentence{practiceCards.length === 1 ? "" : "s"} saved to practice
            </summary>
            <ul className="mt-2 space-y-1 pl-3 text-muted-foreground">
              {practiceCards.slice(0, 5).map((c) => (
                <li key={c.id} className="truncate">• {c.translatedText || c.sourceText}</li>
              ))}
            </ul>
          </details>
        )}

        <section className="space-y-4">
          {cards.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">
              <p>Start by typing something above. Your cards will collect here.</p>
            </Card>
          )}
          {cards.map((c) => (
            <TranslationCardView key={c.id} card={c} />
          ))}
        </section>
      </div>
    </Layout>
  );
}
