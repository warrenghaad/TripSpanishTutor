import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  type LocalTranslationCard,
  type LocalGrowStep,
  loadLocalGrowTrail,
  saveLocalGrowTrail,
} from "@/lib/translation-store";

const LAYERS: { id: string; label: string }[] = [
  { id: "subject", label: "+ Subject" },
  { id: "verb", label: "+ Verb" },
  { id: "object", label: "+ Object" },
  { id: "adjective", label: "+ Adjective" },
  { id: "adverb", label: "+ Adverb" },
  { id: "place", label: "+ Place" },
  { id: "time", label: "+ Time" },
  { id: "reason", label: "+ Reason" },
  { id: "reflection", label: "+ Reflection" },
];

type TransformResponse = { transformedText: string; translatedText: string; note: string };

function describeError(e: unknown): string {
  return e instanceof Error ? e.message : "";
}

export default function SentenceGrower({ card }: { card: LocalTranslationCard }) {
  const { toast } = useToast();
  const [steps, setSteps] = useState<LocalGrowStep[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadLocalGrowTrail(card.id).then((trail) => {
      if (!alive || !trail) return;
      setSteps(trail.steps);
    });
    return () => { alive = false; };
  }, [card.id]);

  const grow = useMutation({
    mutationFn: async (layer: string): Promise<LocalGrowStep> => {
      setBusy(layer);
      const res = await fetch("/api/translate/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.serverId, transform: layer, locale: card.locale }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as TransformResponse;
      return {
        layer,
        transformedText: data.transformedText,
        translatedText: data.translatedText,
        note: data.note,
        createdAt: new Date().toISOString(),
      };
    },
    onSuccess: async (step) => {
      const next = [...steps, step];
      setSteps(next);
      await saveLocalGrowTrail(card.id, next);
      setBusy(null);
    },
    onError: (e: unknown) => {
      setBusy(null);
      toast({ title: "Could not grow", description: describeError(e), variant: "destructive" });
    },
  });

  const reset = async () => {
    setSteps([]);
    await saveLocalGrowTrail(card.id, []);
  };

  const current = steps.length > 0 ? steps[steps.length - 1] : null;

  return (
    <Card className="p-4 mt-3 bg-muted/30 space-y-3" data-testid={`grower-${card.id}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-display font-semibold text-sm">Grow this sentence</h4>
        {steps.length > 0 && (
          <Button size="sm" variant="ghost" onClick={reset} data-testid={`grower-reset-${card.id}`}>Reset</Button>
        )}
      </div>

      <div className="text-sm">
        <span className="text-muted-foreground">Current: </span>
        <span className="font-medium text-primary">{current?.transformedText || card.translatedText}</span>
        <p className="text-xs text-muted-foreground italic mt-1">{current?.translatedText || card.sourceText}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {LAYERS.map((l) => (
          <Button
            key={l.id}
            size="sm"
            variant="outline"
            disabled={busy !== null || !card.serverId}
            onClick={() => grow.mutate(l.id)}
            data-testid={`grower-layer-${l.id}-${card.id}`}
          >
            {busy === l.id ? "…" : l.label}
          </Button>
        ))}
      </div>

      {steps.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-border/40">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Layers added</p>
          {steps.map((s, i) => (
            <div key={i} className="text-xs">
              <span className="font-semibold text-primary">{s.layer}</span>
              <span className="text-muted-foreground"> — {s.note}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
