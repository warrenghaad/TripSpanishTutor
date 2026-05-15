import { useLocation } from "wouter";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { situations } from "@/lib/data";
import SituationCard from "@/components/situation-card";
import {
  Search, Plus, BookOpen, FileText, Globe, MapPin, Sun,
  PenTool, ArrowLeftRight, ChevronDown, ChevronUp, Lightbulb, Trash2, X
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/lib/locale-context";
import { recordNode } from "@/lib/trail-store";
import { Link } from "wouter";
import { Package, WifiOff, Footprints } from "lucide-react";
import { useOnline } from "@/lib/use-online";
import { useEffect, useState as useStateAlias } from "react";
import { getActivePack } from "@/lib/pack-store";
import { smartFetch } from "@/lib/api-fetch";

type ConjugationTable = Record<string, Record<string, string>>;

type LookupResult = {
  spanish: string;
  english: string;
  partOfSpeech: string;
  conjugations?: ConjugationTable;
  examples: string[];
  relatedWords: { spanish: string; english: string }[];
};

type ExtractedWord = {
  spanish: string;
  english: string;
  partOfSpeech: string;
  context: string;
};

type GrammarPattern = {
  pattern: string;
  tense: string;
  frequency: string;
  example: string;
  lesson: string;
};

type SavedWord = {
  id: number;
  spanish: string;
  english: string;
  partOfSpeech: string;
  conjugations: ConjugationTable | null;
  context: string | null;
  source: string | null;
  createdAt: string;
};

const tenseLabels: Record<string, string> = {
  presente: "Present",
  "pretérito": "Past",
  preterito: "Past",
  imperfecto: "Imperfect",
  futuro: "Future",
  condicional: "Conditional",
};

const personLabels: Record<string, string> = {
  yo: "yo",
  "tú": "tú",
  "él": "él/ella",
  "él/ella": "él/ella",
  nosotros: "nosotros",
  ellos: "ellos",
  "ellos/ustedes": "ellos/uds.",
};

function ConjugationDisplay({ conjugations }: { conjugations: ConjugationTable }) {
  const tenses = Object.keys(conjugations);
  const allPersons = ["yo", "tú", "él", "él/ella", "nosotros", "ellos", "ellos/ustedes"];
  const visiblePersons = allPersons.filter(p => tenses.some(t => conjugations[t]?.[p] !== undefined));

  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-sm" data-testid="table-conjugations">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Person</th>
            {tenses.map(t => (
              <th key={t} className="text-left py-2 px-2 text-xs font-bold text-secondary uppercase tracking-wider whitespace-nowrap">
                {tenseLabels[t] || t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visiblePersons.map(person => (
            <tr key={person} className="border-b border-border/30 hover:bg-muted/30">
              <td className="py-1.5 pr-3 font-medium text-muted-foreground italic text-xs">
                {personLabels[person] || person}
              </td>
              {tenses.map(t => (
                <td key={t} className="py-1.5 px-2 font-medium text-foreground text-sm">
                  {conjugations[t]?.[person] || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GrammarPatternCard({ pattern }: { pattern: GrammarPattern }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card className="overflow-hidden border-l-4 border-l-amber-400">
      <div className="p-3 cursor-pointer hover:bg-muted/20 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="font-bold text-sm text-foreground">{pattern.pattern}</span>
              <span className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full uppercase font-bold">{pattern.tense}</span>
              <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">{pattern.frequency}</span>
            </div>
            <p className="text-xs text-muted-foreground italic">"{pattern.example}"</p>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-3 pb-3 border-t border-border/30 pt-2">
              <p className="text-sm text-foreground leading-relaxed">{pattern.lesson}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function Home() {
  const [_, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [direction, setDirection] = useState<"en-es" | "es-en">("en-es");
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [importText, setImportText] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [extractedWords, setExtractedWords] = useState<ExtractedWord[]>([]);
  const [grammarPatterns, setGrammarPatterns] = useState<GrammarPattern[]>([]);
  const [expandedSaved, setExpandedSaved] = useState<number | null>(null);
  const [savedFilter, setSavedFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { locale } = useLocale();

  const savedWordsQuery = useQuery<SavedWord[]>({
    queryKey: ["/api/dictionary/words", savedFilter],
    queryFn: async () => {
      const url = savedFilter
        ? `/api/dictionary/words?q=${encodeURIComponent(savedFilter)}`
        : "/api/dictionary/words";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const lookupMutation = useMutation({
    mutationFn: async (word: string) => {
      const r = await smartFetch<LookupResult>({
        endpoint: "/api/dictionary/lookup",
        body: { word, direction, locale },
        trailKind: "lookup",
        label: `Lookup: ${word}`,
        lookupKey: word,
        packToResponse: (text, confidence) => ({
          spanish: word,
          english: text,
          partOfSpeech: "—",
          examples: [],
          relatedWords: [],
        }),
        offlineFallback: () => ({
          spanish: word,
          english: "(offline — saved, will look up when you reconnect)",
          partOfSpeech: "—",
          examples: [],
          relatedWords: [],
        }),
      });
      return r.data;
    },
    onSuccess: (data) => setLookupResult(data),
    onError: () => toast({ title: "Lookup failed", description: "Try another word.", variant: "destructive" }),
  });

  const extractMutation = useMutation({
    mutationFn: async (text: string) => {
      const r = await smartFetch<{ words: ExtractedWord[]; grammarPatterns: GrammarPattern[] }>({
        endpoint: "/api/dictionary/extract",
        body: { text, locale },
        trailKind: "lookup",
        label: `Extract: "${text.slice(0, 40)}"`,
        lookupKey: text,
        offlineFallback: () => ({ words: [], grammarPatterns: [] }),
      });
      return r.data;
    },
    onSuccess: (data) => {
      setExtractedWords(data.words || []);
      setGrammarPatterns(data.grammarPatterns || []);
    },
    onError: () => toast({ title: "Extraction failed", variant: "destructive" }),
  });

  const fetchUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch("/api/dictionary/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, locale }),
      });
      if (!res.ok) throw new Error("Fetch failed");
      return res.json();
    },
    onSuccess: (data) => {
      setExtractedWords(data.words || []);
      setGrammarPatterns(data.grammarPatterns || []);
    },
    onError: () => toast({ title: "Failed to process URL", description: "Make sure the URL is accessible.", variant: "destructive" }),
  });

  const saveMutation = useMutation({
    mutationFn: async (word: { spanish: string; english: string; partOfSpeech: string; conjugations?: any; context?: string; source?: string }) => {
      const res = await fetch("/api/dictionary/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(word),
      });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dictionary/words"] });
      toast({ title: "Word saved!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/dictionary/words/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/dictionary/words"] }),
  });

  const handleLookup = () => {
    if (!searchTerm.trim()) return;
    lookupMutation.mutate(searchTerm.trim());
  };

  const toggleDirection = () => {
    setDirection(d => d === "en-es" ? "es-en" : "en-es");
    setLookupResult(null);
  };

  const online = useOnline();
  const [hasPack, setHasPack] = useStateAlias(false);
  useEffect(() => {
    getActivePack().then(p => setHasPack(!!p)).catch(() => {});
  }, []);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-4 md:pt-6 pb-8 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary text-sm font-medium mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Puerto Vallarta</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground" data-testid="text-greeting">
              Vallarta Voz
            </h1>
          </div>
        </header>

        <Card className={`p-4 border-2 ${hasPack ? "border-green-200 bg-green-50/40" : "border-primary/30 bg-primary/5"}`} data-testid="card-trip-pack-cta">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${hasPack ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary"}`}>
              {hasPack ? <Package className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-base mb-0.5">
                {hasPack ? "Trip pack ready for offline use" : "Pack the app for offline use"}
              </h3>
              <p className="text-xs text-muted-foreground mb-2">
                {hasPack
                  ? "Your saved pack will answer translations, vocab, and common phrases when you're off-grid."
                  : "Bundle the words, phrases, and verbs you'll need so the app works at the beach, on the plane, or in a dead-zone taxi."}
              </p>
              <div className="flex gap-2 flex-wrap">
                <Link href="/trip-pack">
                  <Button size="sm" className="bg-primary text-xs h-8" data-testid="button-go-trip-pack">
                    <Package className="w-3.5 h-3.5 mr-1" /> {hasPack ? "Manage pack" : "Build pack"}
                  </Button>
                </Link>
                <Link href="/trails">
                  <Button size="sm" variant="outline" className="text-xs h-8" data-testid="button-go-trails">
                    <Footprints className="w-3.5 h-3.5 mr-1" /> Trails
                  </Button>
                </Link>
                {!online && (
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded-full flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> currently offline
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        <section>
          <Card className="p-4 md:p-5 border-primary/30 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-lg">Dictionary & Conjugation</h2>
              <button
                onClick={toggleDirection}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
                data-testid="button-swap-direction"
              >
                {direction === "en-es" ? "EN → ES" : "ES → EN"}
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder={direction === "en-es" ? "Type a word in English..." : "Escribe una palabra en español..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                className="flex-1 text-base"
                data-testid="input-word-search"
              />
              <Button
                onClick={handleLookup}
                disabled={lookupMutation.isPending || !searchTerm.trim()}
                className="bg-primary px-5"
                data-testid="button-lookup"
              >
                {lookupMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {direction === "en-es" ? 'Try: "to eat", "beach", "to want", "beautiful"' : 'Try: "comer", "playa", "querer", "hermoso"'}
            </p>
          </Card>

          <AnimatePresence>
            {lookupResult && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
                <Card className="p-4 md:p-5 border-l-4 border-l-secondary shadow-md">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl md:text-2xl font-display font-bold text-foreground" data-testid="text-lookup-spanish">
                        {lookupResult.spanish}
                      </h3>
                      <p className="text-base text-muted-foreground" data-testid="text-lookup-english">{lookupResult.english}</p>
                      <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold uppercase">
                        {lookupResult.partOfSpeech}
                      </span>
                    </div>
                    <Button
                      onClick={() => saveMutation.mutate({
                        spanish: lookupResult.spanish,
                        english: lookupResult.english,
                        partOfSpeech: lookupResult.partOfSpeech,
                        conjugations: lookupResult.conjugations,
                        source: "lookup",
                      })}
                      disabled={saveMutation.isPending}
                      size="sm"
                      className="bg-primary"
                      data-testid="button-save-lookup"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Save
                    </Button>
                  </div>

                  {lookupResult.conjugations && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Conjugation Table</h4>
                      <ConjugationDisplay conjugations={lookupResult.conjugations} />
                    </div>
                  )}

                  {lookupResult.examples.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Examples</h4>
                      <ul className="space-y-1.5">
                        {lookupResult.examples.map((ex, i) => (
                          <li key={i} className="text-sm bg-muted/30 p-2.5 rounded-lg" data-testid={`text-example-${i}`}>{ex}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {lookupResult.relatedWords.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Related Words</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {lookupResult.relatedWords.map((rw, i) => (
                          <button
                            key={i}
                            onClick={() => { setSearchTerm(rw.spanish); lookupMutation.mutate(rw.spanish); }}
                            className="bg-secondary/5 hover:bg-secondary/10 border border-secondary/20 px-2.5 py-1 rounded-lg text-xs transition-colors"
                            data-testid={`button-related-${i}`}
                          >
                            <span className="font-bold text-secondary">{rw.spanish}</span>
                            <span className="text-muted-foreground ml-1">({rw.english})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section>
          <Tabs defaultValue="import" className="space-y-4">
            <TabsList className="bg-background border-b border-border w-full justify-start rounded-none h-auto p-0 gap-4">
              <TabsTrigger
                value="import"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-1 py-2.5 font-medium text-sm text-muted-foreground"
                data-testid="tab-import"
              >
                <FileText className="w-4 h-4 mr-1.5" /> Import Text
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-1 py-2.5 font-medium text-sm text-muted-foreground"
                data-testid="tab-saved"
              >
                <BookOpen className="w-4 h-4 mr-1.5" /> My Dictionary
                {savedWordsQuery.data && savedWordsQuery.data.length > 0 && (
                  <span className="ml-1 bg-primary text-white text-[10px] rounded-full px-1.5 py-0.5">{savedWordsQuery.data.length}</span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="space-y-4">
              <Card className="p-4 border-primary/20">
                <h3 className="font-display font-bold text-sm mb-2">Paste Text</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Paste from an ebook, email, or article. We'll extract vocabulary and grammar patterns.
                </p>
                <Textarea
                  placeholder="Paste any text here — English, Spanish, or mixed..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="min-h-[100px] resize-none mb-3 text-sm"
                  data-testid="textarea-import"
                />
                <Button
                  onClick={() => { if (importText.trim()) extractMutation.mutate(importText.trim()); }}
                  disabled={extractMutation.isPending || !importText.trim()}
                  className="w-full bg-primary"
                  size="sm"
                  data-testid="button-extract"
                >
                  {extractMutation.isPending ? (
                    <span className="flex items-center"><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Analyzing...</span>
                  ) : (
                    <span className="flex items-center"><FileText className="w-3.5 h-3.5 mr-2" /> Extract Vocabulary & Grammar</span>
                  )}
                </Button>
              </Card>

              <Card className="p-4 border-primary/20">
                <h3 className="font-display font-bold text-sm mb-2">Import from URL</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Paste a link. We'll fetch the content and analyze it.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && importUrl.trim() && fetchUrlMutation.mutate(importUrl.trim())}
                    className="flex-1 text-sm"
                    data-testid="input-import-url"
                  />
                  <Button
                    onClick={() => { if (importUrl.trim()) fetchUrlMutation.mutate(importUrl.trim()); }}
                    disabled={fetchUrlMutation.isPending || !importUrl.trim()}
                    className="bg-secondary"
                    size="sm"
                    data-testid="button-fetch-url"
                  >
                    {fetchUrlMutation.isPending ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Globe className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </Card>

              <AnimatePresence>
                {grammarPatterns.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="space-y-2">
                      <h3 className="font-display font-bold text-sm flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        Grammar Patterns ({grammarPatterns.length})
                      </h3>
                      {grammarPatterns.map((gp, idx) => (
                        <GrammarPatternCard key={idx} pattern={gp} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {extractedWords.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display font-bold text-sm">Vocabulary ({extractedWords.length})</h3>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={() => extractedWords.forEach(w => saveMutation.mutate({
                            spanish: w.spanish, english: w.english, partOfSpeech: w.partOfSpeech, context: w.context, source: "import",
                          }))}
                          data-testid="button-save-all"
                        >
                          <Plus className="w-3 h-3 mr-1" /> Save All
                        </Button>
                      </div>
                      <div className="space-y-1.5">
                        {extractedWords.map((word, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors" data-testid={`extracted-word-${idx}`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-sm text-secondary">{word.spanish}</span>
                                <span className="text-muted-foreground text-xs">—</span>
                                <span className="text-sm text-foreground">{word.english}</span>
                                <span className="text-[9px] bg-secondary/10 text-secondary px-1 py-0.5 rounded-full uppercase font-bold">{word.partOfSpeech}</span>
                              </div>
                              {word.context && <p className="text-[11px] text-muted-foreground mt-0.5 italic truncate">"{word.context}"</p>}
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-primary hover:bg-primary/10 flex-shrink-0"
                              onClick={() => saveMutation.mutate({
                                spanish: word.spanish, english: word.english, partOfSpeech: word.partOfSpeech, context: word.context, source: "import",
                              })}
                              data-testid={`button-save-extracted-${idx}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="saved" className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Filter your dictionary..."
                  value={savedFilter}
                  onChange={(e) => setSavedFilter(e.target.value)}
                  className="flex-1 text-sm"
                  data-testid="input-filter-saved"
                />
                {savedFilter && (
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSavedFilter("")}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {savedWordsQuery.isLoading ? (
                <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
              ) : savedWordsQuery.data && savedWordsQuery.data.length > 0 ? (
                <div className="space-y-1.5">
                  {savedWordsQuery.data.map((word) => (
                    <Card key={word.id} className="overflow-hidden" data-testid={`saved-word-${word.id}`}>
                      <div
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/20 transition-colors"
                        onClick={() => setExpandedSaved(expandedSaved === word.id ? null : word.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-secondary">{word.spanish}</span>
                            <span className="text-muted-foreground text-xs">—</span>
                            <span className="text-foreground text-sm">{word.english}</span>
                            <span className="text-[9px] bg-secondary/10 text-secondary px-1 py-0.5 rounded-full uppercase font-bold">{word.partOfSpeech}</span>
                            {word.source && <span className="text-[9px] bg-muted text-muted-foreground px-1 py-0.5 rounded-full">{word.source}</span>}
                          </div>
                          {word.context && <p className="text-[11px] text-muted-foreground mt-0.5 italic">"{word.context}"</p>}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(word.id); }}
                            data-testid={`button-delete-${word.id}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                          {word.conjugations && (
                            expandedSaved === word.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <AnimatePresence>
                        {expandedSaved === word.id && word.conjugations && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="px-3 pb-3 border-t border-border/30 pt-2">
                              <ConjugationDisplay conjugations={word.conjugations} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">
                    {savedFilter ? "No words match your filter." : "Your dictionary is empty. Look up words or import text to get started!"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display font-bold">More Tools</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => setLocation('/day')}
              className="bg-gradient-to-br from-secondary to-secondary/80 rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition-all"
              data-testid="card-day-companion"
            >
              <BookOpen className="w-5 h-5 mb-2 opacity-80" />
              <h3 className="font-display font-bold text-sm mb-0.5">Day Companion</h3>
              <p className="text-white/70 text-[11px]">Pack · live · debrief</p>
            </div>
            <div
              onClick={() => setLocation('/journal')}
              className="bg-white border border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-all"
              data-testid="card-journal"
            >
              <PenTool className="w-5 h-5 mb-2 text-primary opacity-80" />
              <h3 className="font-display font-bold text-sm mb-0.5 text-foreground">Journal</h3>
              <p className="text-muted-foreground text-[11px]">Write in mixed English/Spanish</p>
            </div>
            <div
              onClick={() => setLocation('/situations')}
              className="bg-white border border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-all"
              data-testid="card-situations"
            >
              <MapPin className="w-5 h-5 mb-2 text-secondary opacity-80" />
              <h3 className="font-display font-bold text-sm mb-0.5 text-foreground">Situations</h3>
              <p className="text-muted-foreground text-[11px]">Real-world practice</p>
            </div>
            <div
              onClick={() => setLocation('/dictionary')}
              className="bg-white border border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-all"
              data-testid="card-full-dictionary"
            >
              <Search className="w-5 h-5 mb-2 text-primary opacity-80" />
              <h3 className="font-display font-bold text-sm mb-0.5 text-foreground">Full Dictionary</h3>
              <p className="text-muted-foreground text-[11px]">Expanded view</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
