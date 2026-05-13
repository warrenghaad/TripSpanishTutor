import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Sprout, BookmarkPlus, NotebookPen, History, Trash2, WifiOff, AlertCircle, ExternalLink } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type LocalTranslationCard,
  updateLocalCard,
  deleteLocalCard,
} from "@/lib/translation-store";
import SentenceGrower from "./sentence-grower";

type TransformResponse = { transformedText: string; translatedText: string; note: string };
type JournalEntryResponse = { id: number; correctedText: string; createdAt: string };
type DictionaryWordResponse = { id: number; spanish: string; deduped: boolean };

function describeError(e: unknown): string {
  return e instanceof Error ? e.message : "";
}

export function TranslationCardView({ card }: { card: LocalTranslationCard }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const [growing, setGrowing] = useState(false);
  const [transformBusy, setTransformBusy] = useState<string | null>(null);
  const [queuedNote, setQueuedNote] = useState(card.queuedNote || "");

  const refresh = () => qc.invalidateQueries({ queryKey: ["local-cards"] });

  const applyTransform = useMutation({
    mutationFn: async (transform: string): Promise<{ data: TransformResponse; transform: string }> => {
      if (!card.serverId) throw new Error("Card not yet synced");
      setTransformBusy(transform);
      const res = await fetch("/api/translate/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.serverId, transform, locale: card.locale }),
      });
      if (!res.ok) throw new Error("Transform failed");
      return { data: (await res.json()) as TransformResponse, transform };
    },
    onSuccess: async ({ data, transform }) => {
      // The user's original input (sourceText / translatedText pair) defines
      // the card's language semantics; we never overwrite it here, otherwise
      // an ES→EN card would silently flip its source side to English. The
      // transform output is recorded as a layered grammar note that the UI
      // surfaces alongside the original card.
      await updateLocalCard(card.id, {
        tags: Array.from(new Set([...(card.tags || []), `transformed:${transform}`])),
        grammarNotes: [
          ...(card.grammarNotes || []),
          {
            term: `${transform}: ${data.transformedText}`,
            note: data.note ? `${data.note} (${data.translatedText})` : data.translatedText,
          },
        ],
      });
      toast({ title: `Transformed (${transform})`, description: `${data.transformedText} — ${data.note}` });
      setTransformBusy(null);
      refresh();
    },
    onError: (e: unknown) => {
      setTransformBusy(null);
      toast({ title: "Could not transform", description: describeError(e), variant: "destructive" });
    },
  });

  const saveToVocab = useMutation({
    mutationFn: async (): Promise<{ added: number; skipped: number }> => {
      const alreadySaved = new Set((card.savedVocabulary || []).map((w) => w.toLowerCase()));
      const candidates: { word: string; pos: string }[] = [];
      const pushUnique = (word: string, pos: string) => {
        const key = word.toLowerCase().trim();
        if (!key) return;
        if (alreadySaved.has(key)) return;
        if (candidates.find((c) => c.word.toLowerCase().trim() === key)) return;
        candidates.push({ word, pos });
      };
      (card.detectedVerbs || []).forEach((w) => pushUnique(w, "verb"));
      (card.detectedAdjectives || []).forEach((w) => pushUnique(w, "adjective"));
      (card.detectedAdverbs || []).forEach((w) => pushUnique(w, "adverb"));

      let added = 0;
      let skipped = 0;
      const newlyAdded: string[] = [];
      for (const c of candidates) {
        const res = await fetch("/api/dictionary/words", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            spanish: c.word,
            english: "—",
            partOfSpeech: c.pos,
            source: "translation-card",
          }),
        });
        if (!res.ok) continue;
        const word = (await res.json()) as DictionaryWordResponse;
        if (word.deduped) skipped++;
        else added++;
        newlyAdded.push(c.word);
      }
      const savedVocabulary = Array.from(
        new Set([...(card.savedVocabulary || []), ...newlyAdded]),
      );
      await updateLocalCard(card.id, {
        savedVocabulary,
        tags: Array.from(new Set([...(card.tags || []), "vocabulary"])),
      });
      return { added, skipped };
    },
    onSuccess: ({ added, skipped }) => {
      const parts: string[] = [];
      if (added) parts.push(`${added} new`);
      if (skipped) parts.push(`${skipped} already in your dictionary`);
      toast({ title: "Saved to vocabulary", description: parts.join(" · ") || "Nothing new to add." });
      refresh();
    },
    onError: () => toast({ title: "Could not save", variant: "destructive" }),
  });

  const saveToJournal = useMutation({
    mutationFn: async (): Promise<JournalEntryResponse> => {
      const res = await fetch("/api/journal/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: card.sourceText,
          correctedText: card.translatedText,
          tenseFocus: "translation",
          feedback: JSON.stringify({
            corrected: card.translatedText,
            corrections: (card.grammarNotes || []).map((g) => ({
              original: g.term,
              fixed: g.term,
              explanation: g.note,
            })),
            vocab: [],
            literalText: card.literalText,
            reflectionPrompt: "Write one more sentence about this.",
          }),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return (await res.json()) as JournalEntryResponse;
    },
    onSuccess: async (entry) => {
      await updateLocalCard(card.id, {
        journalEntryId: entry.id,
        journalArtifact: {
          id: entry.id,
          correctedText: entry.correctedText || card.translatedText,
          createdAt: entry.createdAt,
        },
        tags: Array.from(new Set([...(card.tags || []), "journal"])),
      });
      // Persist the relational link on the server card so it survives reloads / other clients.
      if (card.serverId) {
        try {
          await fetch(`/api/translation-cards/${card.serverId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ journalEntryId: entry.id }),
          });
        } catch {
          // best-effort — local mirror still holds the link
        }
      }
      toast({
        title: "Saved to journal",
        description: "Opening your entry — write one more sentence about this.",
      });
      refresh();
      navigate(`/journal?entry=${entry.id}&prompt=reflection`);
    },
    onError: () => toast({ title: "Could not save to journal", variant: "destructive" }),
  });

  const togglePractice = async () => {
    const isPractice = (card.tags || []).includes("practice");
    const next = isPractice
      ? (card.tags || []).filter((t) => t !== "practice")
      : Array.from(new Set([...(card.tags || []), "practice"]));
    await updateLocalCard(card.id, { tags: next, saved: true });
    toast({ title: isPractice ? "Removed from practice" : "Saved to practice" });
    refresh();
  };

  const remove = async () => {
    await deleteLocalCard(card.id);
    if (card.serverId) {
      try {
        await fetch(`/api/translation-cards/${card.serverId}`, { method: "DELETE" });
      } catch {
        // best-effort server cleanup
      }
    }
    refresh();
  };

  const persistQueuedNote = async () => {
    await updateLocalCard(card.id, { queuedNote });
    toast({ title: "Note saved", description: "We'll keep it with this queued card." });
    refresh();
  };

  const inPractice = (card.tags || []).includes("practice");
  const isQueued = card.status === "queued_offline";
  const isFailed = card.status === "failed";

  return (
    <Card className="p-5 space-y-4" data-testid={`translation-card-${card.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">You wrote</p>
          <p className="text-base text-foreground" data-testid={`text-source-${card.id}`}>{card.sourceText}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isQueued && (
            <Badge variant="outline" className="text-amber-600 border-amber-300" data-testid={`badge-queued-${card.id}`}>
              <WifiOff className="w-3 h-3 mr-1" /> queued
            </Badge>
          )}
          {isFailed && (
            <Badge variant="outline" className="text-destructive border-destructive">
              <AlertCircle className="w-3 h-3 mr-1" /> failed
            </Badge>
          )}
          <Button variant="ghost" size="icon" onClick={remove} data-testid={`button-delete-${card.id}`}>
            <Trash2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {!isQueued && !isFailed && (
        <>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Natural</p>
            <p className="text-lg font-medium text-primary" data-testid={`text-translated-${card.id}`}>{card.translatedText}</p>
          </div>
          {card.literalText && (
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Literal</p>
              <p className="text-sm text-muted-foreground italic">{card.literalText}</p>
            </div>
          )}
          {card.grammarNotes?.length > 0 && (
            <div className="bg-muted/40 rounded-md p-3 space-y-1.5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Grammar notes</p>
              {card.grammarNotes.map((g, i) => (
                <p key={i} className="text-sm text-foreground">
                  <span className="font-semibold text-primary">{g.term}</span>
                  <span className="text-muted-foreground"> — {g.note}</span>
                </p>
              ))}
            </div>
          )}
          {(card.detectedVerbs.length + card.detectedAdjectives.length + card.detectedAdverbs.length > 0) && (
            <div className="space-y-1.5">
              {card.detectedVerbs.length > 0 && (
                <div className="flex flex-wrap gap-1.5"><span className="text-xs text-muted-foreground self-center">verbs:</span>
                  {card.detectedVerbs.map((v, i) => <Badge key={i} variant="secondary" data-testid={`verb-${card.id}-${i}`}>{v}</Badge>)}
                </div>
              )}
              {card.detectedAdjectives.length > 0 && (
                <div className="flex flex-wrap gap-1.5"><span className="text-xs text-muted-foreground self-center">adj:</span>
                  {card.detectedAdjectives.map((v, i) => <Badge key={i} variant="outline">{v}</Badge>)}
                </div>
              )}
              {card.detectedAdverbs.length > 0 && (
                <div className="flex flex-wrap gap-1.5"><span className="text-xs text-muted-foreground self-center">adv:</span>
                  {card.detectedAdverbs.map((v, i) => <Badge key={i} variant="outline">{v}</Badge>)}
                </div>
              )}
            </div>
          )}
          {card.journalArtifact && (
            <div className="text-xs text-muted-foreground flex items-center gap-1.5" data-testid={`journal-link-${card.id}`}>
              <NotebookPen className="w-3 h-3" /> Saved to journal entry #{card.journalArtifact.id}.
              <Link
                href={`/journal?entry=${card.journalArtifact.id}&prompt=reflection`}
                className="text-primary hover:underline inline-flex items-center gap-0.5"
              >
                Open <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
            <Link href={`/chat/${card.id}`}>
              <Button size="sm" variant="default" data-testid={`button-chat-${card.id}`}>
                <MessageCircle className="w-4 h-4 mr-1" /> Chat about this
              </Button>
            </Link>
            <Link href={`/grow/${card.id}`}>
              <Button size="sm" variant="secondary" data-testid={`button-grow-page-${card.id}`}>
                <Sprout className="w-4 h-4 mr-1" /> Grow this sentence
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setGrowing((g) => !g)}
              data-testid={`button-grow-inline-${card.id}`}
            >
              {growing ? "Hide grower" : "Quick grow"}
            </Button>
            {card.suggestedTransforms.map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant="outline"
                disabled={!card.serverId || transformBusy !== null}
                onClick={() => applyTransform.mutate(t.id)}
                data-testid={`button-transform-${t.id}-${card.id}`}
              >
                {transformBusy === t.id ? "…" : t.label}
              </Button>
            ))}
            <Button size="sm" variant="outline" onClick={() => saveToJournal.mutate()} data-testid={`button-journal-${card.id}`}>
              <NotebookPen className="w-4 h-4 mr-1" /> Save to Journal
            </Button>
            <Button size="sm" variant="outline" onClick={() => saveToVocab.mutate()} data-testid={`button-vocab-${card.id}`}>
              <BookmarkPlus className="w-4 h-4 mr-1" /> Save to Vocabulary
            </Button>
            <Button
              size="sm"
              variant={inPractice ? "default" : "outline"}
              onClick={togglePractice}
              data-testid={`button-practice-${card.id}`}
            >
              <History className="w-4 h-4 mr-1" /> {inPractice ? "In practice" : "Save to Practice"}
            </Button>
          </div>
          {growing && card.serverId && <SentenceGrower card={card} />}
        </>
      )}

      {isQueued && (
        <div className="space-y-2">
          {card.packMatches && card.packMatches.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-1">
              <p className="text-xs uppercase tracking-wider text-amber-700">Pack lookup (offline)</p>
              {card.packMatches.map((m, i) => (
                <p key={i} className="text-sm text-amber-900" data-testid={`pack-match-${card.id}-${i}`}>
                  <span className="font-semibold capitalize">{m.confidence}</span>
                  <span className="text-amber-700"> · {m.kind}</span> — {m.text}
                  {m.detail && <span className="text-amber-700/80"> ({m.detail})</span>}
                </p>
              ))}
            </div>
          )}
          <p className="text-sm text-muted-foreground italic">
            You're offline — we'll translate this once you're back online.
          </p>
          <div className="flex items-center gap-2">
            <input
              className="flex-1 text-sm border border-border/60 rounded-md px-2 py-1 bg-background"
              placeholder="Add a note (optional)…"
              value={queuedNote}
              onChange={(e) => setQueuedNote(e.target.value)}
              data-testid={`input-queued-note-${card.id}`}
            />
            <Button size="sm" variant="outline" onClick={persistQueuedNote} data-testid={`button-queued-note-${card.id}`}>
              Save note
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
