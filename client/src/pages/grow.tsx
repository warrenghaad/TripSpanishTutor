import Layout from "@/components/layout";
import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sprout } from "lucide-react";
import { getLocalCard, type LocalTranslationCard } from "@/lib/translation-store";
import SentenceGrower from "@/components/sentence-grower";

export default function GrowPage() {
  const [, params] = useRoute<{ id: string }>("/grow/:id");
  const cardId = params ? parseInt(params.id) : undefined;
  const [card, setCard] = useState<LocalTranslationCard | undefined>();

  useEffect(() => {
    let alive = true;
    if (cardId == null) return;
    getLocalCard(cardId).then((c) => {
      if (alive) setCard(c);
    });
    return () => { alive = false; };
  }, [cardId]);

  if (!card) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link href="/"><Button variant="ghost" data-testid="button-grow-back"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button></Link>
          <p className="text-muted-foreground mt-4">Card not found.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-4">
        <Link href="/"><Button variant="ghost" size="sm" data-testid="button-grow-back"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Translate</Button></Link>

        <header>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Sprout className="w-6 h-6 text-primary" /> Grow this sentence
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Add one piece at a time — subject, verb, place, time — to build a longer Spanish sentence.
          </p>
        </header>

        <Card className="p-4 bg-muted/30">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Seed sentence</p>
          <p className="text-lg font-medium text-primary">{card.translatedText}</p>
          <p className="text-xs text-muted-foreground italic">{card.sourceText}</p>
        </Card>

        <SentenceGrower card={card} />
      </div>
    </Layout>
  );
}
