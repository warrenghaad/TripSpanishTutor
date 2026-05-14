import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Book, Sparkles, ArrowRight, Info, Heart, Lightbulb, Wind, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { useLocale } from "@/lib/locale-context";
import { smartFetch } from "@/lib/api-fetch";
import { listLocalCards } from "@/lib/translation-store";

async function findLocalJournalArtifact(entryId: number): Promise<SeededJournalEntry | null> {
  try {
    const cards = await listLocalCards();
    const card = cards.find((c) => c.journalEntryId === entryId && c.journalArtifact);
    if (!card?.journalArtifact) return null;
    return {
      id: card.journalArtifact.id,
      originalText: card.sourceText,
      correctedText: card.journalArtifact.correctedText,
      createdAt: card.journalArtifact.createdAt,
      feedback: { literalText: card.literalText ?? null },
    };
  } catch {
    return null;
  }
}

type SeededJournalEntry = {
  id: number;
  originalText: string;
  correctedText: string | null;
  createdAt: string;
  feedback?: { reflectionPrompt?: string; literalText?: string | null } | null;
};

type Feedback = {
  corrected: string;
  corrections: { original: string; fixed: string; explanation: string }[];
  vocab: { word: string; translation: string }[];
};

type JournalSection = {
  id: string;
  title: string;
  tenseLabel: string;
  tenseFocus: string;
  spanishHint: string;
  prompt: string;
  placeholder: string;
};

const journalSections: JournalSection[] = [
  {
    id: "notice",
    title: "What I Notice",
    tenseLabel: "Presente",
    tenseFocus: "present",
    spanishHint: "Noto que... / Veo... / Siento...",
    prompt: "What's present right now? Describe what you see, feel, or notice.",
    placeholder: "I notice the warm breeze... Noto que... (use whatever Spanish you know!)"
  },
  {
    id: "did",
    title: "What I Did",
    tenseLabel: "Pretérito",
    tenseFocus: "past",
    spanishHint: "Ayer... / Fui... / Probé...",
    prompt: "What did you do today? What places did you visit, foods did you try?",
    placeholder: "Today I went to... Fui a... Probé los tacos..."
  },
  {
    id: "wish",
    title: "What I'd Like to Do",
    tenseLabel: "Condicional",
    tenseFocus: "conditional",
    spanishHint: "Me gustaría... / Querría...",
    prompt: "What would you enjoy doing? Dream destinations, activities, experiences.",
    placeholder: "I would like to see... Me gustaría ir a..."
  },
  {
    id: "shouldve",
    title: "What I Could've Done",
    tenseLabel: "Condicional Perfecto",
    tenseFocus: "conditional_perfect",
    spanishHint: "Habría... / Habría ido...",
    prompt: "Reflect gently — what might you have done differently?",
    placeholder: "I would have... Habría reservado..."
  },
  {
    id: "willdo",
    title: "Tomorrow's Plan",
    tenseLabel: "Futuro",
    tenseFocus: "future",
    spanishHint: "Mañana... / Voy a... / Iré...",
    prompt: "Plan your next adventure. Where will you go? What will you do?",
    placeholder: "Tomorrow I will... Mañana voy a... Iré a..."
  }
];

const interestThemes = [
  { id: "books", label: "Books & Film", emoji: "📚" },
  { id: "jazz", label: "Jazz & Music", emoji: "🎷" },
  { id: "art", label: "Galleries & Art", emoji: "🎨" },
  { id: "food", label: "Food Tours", emoji: "🍽️" },
  { id: "nature", label: "Beach & Nature", emoji: "🌊" },
];

export default function Journal() {
  const [activeSection, setActiveSection] = useState("did");
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [humLevel, setHumLevel] = useState([2]);
  const [theme, setTheme] = useState("food");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const { locale } = useLocale();

  const search = useSearch();
  const params = new URLSearchParams(search);
  const focusedEntryId = params.get("entry");
  const showReflectionPrompt = params.get("prompt") === "reflection";

  const { data: focusedEntry } = useQuery<SeededJournalEntry | null>({
    queryKey: ["journal-entry", focusedEntryId],
    enabled: !!focusedEntryId,
    queryFn: async () => {
      // Try the network first, but always fall back to the IndexedDB
      // mirror written when the user pressed "Save to Journal", so the
      // reflection card and prompt remain readable with no network.
      const idNum = parseInt(focusedEntryId!);
      const local = await findLocalJournalArtifact(idNum);
      try {
        const res = await fetch(`/api/journal/entries/${focusedEntryId}`);
        if (res.ok) return (await res.json()) as SeededJournalEntry;
      } catch {
        // fall through to local fallback
      }
      return local;
    },
  });

  useEffect(() => {
    if (focusedEntryId) {
      const el = document.getElementById(`focused-entry-${focusedEntryId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [focusedEntryId, focusedEntry]);

  const analyzeMutation = useMutation({
    mutationFn: async (data: { text: string; tenseFocus: string; locale: string }) => {
      const r = await smartFetch<{ feedback: Feedback }>({
        endpoint: "/api/journal/analyze",
        body: data,
        trailKind: "journal",
        label: `Journal (${data.tenseFocus}): ${data.text.slice(0, 40)}`,
        lookupKey: data.text,
        offlineFallback: () => ({
          feedback: {
            corrected: data.text,
            corrections: [],
            vocab: [],
          },
        }),
      });
      return r.data;
    },
    onSuccess: (data) => setFeedback(data.feedback),
  });

  const currentSection = journalSections.find(s => s.id === activeSection)!;
  const currentText = entries[activeSection] || "";

  const handleTextChange = (value: string) => {
    setEntries(prev => ({ ...prev, [activeSection]: value }));
    setFeedback(null);
  };

  const handleAnalyze = () => {
    if (!currentText.trim()) return;
    analyzeMutation.mutate({ text: currentText, tenseFocus: currentSection.tenseFocus, locale });
  };

  const humLabels = ["Quiet", "Present", "Steady", "Strong", "Loud"];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">Travel Journal</h1>
          <p className="text-muted-foreground text-sm md:text-base">Write in whatever mix of English and Spanish you know. We'll help you learn the rest.</p>
        </header>

        {focusedEntry && (
          <Card
            id={`focused-entry-${focusedEntry.id}`}
            className="p-4 md:p-6 mb-6 bg-primary/5 border-l-4 border-l-primary"
            data-testid={`focused-entry-${focusedEntry.id}`}
          >
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Saved from Translate</span>
            </div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">You wrote</p>
            <p className="text-sm text-muted-foreground italic mb-3">{focusedEntry.originalText}</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Spanish</p>
            <p className="text-lg font-display text-foreground mb-4" data-testid="text-focused-corrected">
              {focusedEntry.correctedText || focusedEntry.originalText}
            </p>
            {showReflectionPrompt && (
              <div
                className="bg-white rounded-lg p-3 border border-primary/20"
                data-testid="reflection-prompt"
              >
                <p className="text-sm text-primary font-medium flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Write one more sentence about this.</span>
                </p>
                <Textarea
                  className="mt-2 min-h-[80px] resize-none text-sm"
                  placeholder="Add another sentence in any mix of English and Spanish…"
                  value={entries["reflection"] || ""}
                  onChange={(e) => setEntries((prev) => ({ ...prev, reflection: e.target.value }))}
                  data-testid="textarea-reflection"
                />
              </div>
            )}
          </Card>
        )}

        <Card className="p-4 md:p-6 mb-6 bg-gradient-to-br from-secondary/5 to-primary/5 border-0">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Wind className="w-4 h-4 text-secondary" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  The Hum Right Now
                </span>
              </div>
              <Slider
                value={humLevel}
                onValueChange={setHumLevel}
                max={4}
                step={1}
                className="w-full"
                data-testid="slider-hum-level"
              />
              <div className="flex justify-between mt-1">
                {humLabels.map((label, i) => (
                  <span 
                    key={label} 
                    className={`text-[10px] ${humLevel[0] === i ? "text-secondary font-bold" : "text-muted-foreground"}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="border-l border-border/50 pl-4 hidden md:block" />
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Today's Theme
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {interestThemes.map(t => (
                  <Button
                    key={t.id}
                    variant={theme === t.id ? "default" : "outline"}
                    size="sm"
                    className={`text-xs h-7 px-2 ${theme === t.id ? "bg-primary" : ""}`}
                    onClick={() => setTheme(t.id)}
                    data-testid={`button-theme-${t.id}`}
                  >
                    {t.emoji}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {humLevel[0] >= 3 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 p-3 bg-white/50 rounded-lg border border-secondary/20"
            >
              <p className="text-sm text-secondary flex items-start gap-2">
                <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>The hum is loud right now, and that's okay. Let it be background noise while you write. Breathe slowly: 4 counts in, 7 hold, 8 out.</span>
              </p>
            </motion.div>
          )}
        </Card>

        <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
          {journalSections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveSection(section.id);
                setFeedback(null);
              }}
              className={`text-xs whitespace-nowrap ${activeSection === section.id ? "bg-secondary" : ""}`}
              data-testid={`button-section-${section.id}`}
            >
              {section.title}
            </Button>
          ))}
        </div>

        <Card className="p-4 md:p-6 border-secondary/20 shadow-md mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-display font-bold text-lg text-foreground">{currentSection.title}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold">
                  {currentSection.tenseLabel}
                </span>
                <span className="text-xs text-muted-foreground italic">
                  {currentSection.spanishHint}
                </span>
              </div>
            </div>
            <Link href="/learn">
              <Button variant="ghost" size="sm" className="text-xs text-primary" data-testid="link-practice-verbs">
                <Book className="w-3 h-3 mr-1" /> Practice verbs
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 bg-muted/30 p-3 rounded-lg">
            {currentSection.prompt}
          </p>
          
          <Textarea 
            placeholder={currentSection.placeholder}
            className="min-h-[140px] text-base bg-background border-border/60 focus:border-primary/50 resize-none p-4 mb-4"
            value={currentText}
            onChange={(e) => handleTextChange(e.target.value)}
            data-testid="textarea-journal-entry"
          />
          
          <Button 
            onClick={handleAnalyze} 
            disabled={analyzeMutation.isPending || !currentText.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            data-testid="button-analyze"
          >
            {analyzeMutation.isPending ? (
              <span className="flex items-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"/> Analyzing...</span>
            ) : (
              <span className="flex items-center"><Sparkles className="w-4 h-4 mr-2" /> Check My Spanish</span>
            )}
          </Button>
        </Card>

        <AnimatePresence>
          {feedback && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
              data-testid="card-feedback"
            >
              <Card className="p-4 md:p-6 bg-white border-l-4 border-l-primary shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-primary">
                  <Book className="w-32 h-32 -mr-8 -mt-8" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="font-display font-bold text-lg">Full Spanish Version</h3>
                  </div>
                  
                  <p className="text-lg md:text-xl font-display text-foreground leading-relaxed mb-6" data-testid="text-corrected">
                    {feedback.corrected}
                  </p>

                  {feedback.corrections.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-dashed border-border">
                      <div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Info className="w-3 h-3" /> What You Wrote → What You Could Say
                        </h4>
                        <ul className="space-y-3">
                          {feedback.corrections.map((correction, idx) => (
                            <li key={idx} className="text-sm group" data-testid={`correction-${idx}`}>
                              <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                                <span className="text-muted-foreground">{correction.original}</span>
                                <ArrowRight className="w-3 h-3 text-primary flex-shrink-0" />
                                <span className="text-primary font-bold">{correction.fixed}</span>
                              </div>
                              <p className="text-muted-foreground text-xs pl-4 border-l-2 border-border group-hover:border-primary/30 transition-colors flex items-start gap-1">
                                {correction.explanation.toLowerCase().includes('correct') || correction.explanation.toLowerCase().includes('great') ? (
                                  <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                ) : null}
                                {correction.explanation}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {feedback.vocab.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Book className="w-3 h-3" /> New Vocabulary
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {feedback.vocab.map((v, idx) => (
                              <div key={idx} className="bg-secondary/5 p-2 rounded-lg flex flex-col" data-testid={`vocab-${idx}`}>
                                <span className="font-bold text-secondary text-sm">{v.word}</span>
                                <span className="text-muted-foreground text-xs">{v.translation}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              <div className="flex justify-center">
                <Link href="/learn">
                  <Button variant="outline" className="text-secondary border-secondary" data-testid="link-practice-more">
                    <Book className="w-4 h-4 mr-2" /> Practice these verbs in Sentence Builder
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
