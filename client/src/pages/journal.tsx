import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mic, Send, Book, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Journal() {
  const [text, setText] = useState("");
  const [translated, setTranslated] = useState("");

  const handleTranslate = () => {
    // Mock translation for prototype
    if (!text) return;
    setTranslated("Hoy fue un día increíble. Fui a la playa y comí tacos de pescado. (This is a mock translation)");
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Travel Journal</h1>
          <p className="text-muted-foreground">Write in Spanglish. We'll help you fix it.</p>
        </header>

        <div className="grid gap-6">
          <Card className="p-6 space-y-4 border-primary/20 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Today's Entry</label>
              <Button variant="ghost" size="sm" className="text-primary">
                <Mic className="w-4 h-4 mr-2" />
                Dictate
              </Button>
            </div>
            <Textarea 
              placeholder="Today I went to the beach and... (Write what you know in Spanish, mix in English)" 
              className="min-h-[150px] text-lg font-sans bg-background border-border/60 focus:border-primary/50 resize-none p-4"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={handleTranslate} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Sparkles className="w-4 h-4 mr-2" />
                Translate & Polish
              </Button>
            </div>
          </Card>

          {translated && (
            <Card className="p-6 bg-secondary/5 border-secondary/20 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 mb-4 text-secondary">
                <Book className="w-5 h-5" />
                <span className="font-bold">Polished Spanish</span>
              </div>
              <p className="text-xl font-display text-foreground leading-relaxed">
                {translated}
              </p>
              <div className="mt-6 pt-4 border-t border-border/50">
                <h4 className="text-sm font-bold text-muted-foreground mb-2">Grammar Notes:</h4>
                <ul className="list-disc list-inside text-sm text-foreground/80 space-y-1">
                  <li>Use "Fui" for "I went" (Past tense of Ir)</li>
                  <li>"Tacos de pescado" is the local specialty in Vallarta.</li>
                </ul>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
