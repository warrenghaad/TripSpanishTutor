import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Trash2, BookOpen, FileText, Globe, ChevronDown, ChevronUp, X, Lightbulb, MapPin } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/lib/locale-context";
import { smartFetch } from "@/lib/api-fetch";
import { useOnline } from "@/lib/use-online";

type ConjugationTable = Record<string, Record<string, string>>;

type LookupResult = {
  spanish: string;
  english: string;
  partOfSpeech: string;
  conjugations?: ConjugationTable;
  examples: string[];
  relatedWords: { spanish: string; english: string }[];
  localeNotes?: string[];
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
  "pretérito": "Past (Pretérito)",
  preterito: "Past (Pretérito)",
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
    <div className="overflow-x-auto">
      <table className="w-full text-sm" data-testid="table-conjugations">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Person</th>
            {tenses.map(t => (
              <th key={t} className="text-left py-2 px-2 text-xs font-bold text-secondary uppercase tracking-wider">
                {tenseLabels[t] || t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visiblePersons.map(person => (
            <tr key={person} className="border-b border-border/30 hover:bg-muted/30">
              <td className="py-2 pr-4 font-medium text-muted-foreground italic">
                {personLabels[person] || person}
              </td>
              {tenses.map(t => (
                <td key={t} className="py-2 px-2 font-medium text-foreground">
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
      <div
        className="p-4 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="font-bold text-foreground">{pattern.pattern}</span>
              <span className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full uppercase font-bold">
                {pattern.tense}
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                {pattern.frequency}
              </span>
            </div>
            <p className="text-sm text-muted-foreground italic">"{pattern.example}"</p>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />}
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border/30 pt-3">
              <p className="text-sm text-foreground leading-relaxed">{pattern.lesson}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function Dictionary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [importText, setImportText] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [extractedWords, setExtractedWords] = useState<ExtractedWord[]>([]);
  const [grammarPatterns, setGrammarPatterns] = useState<GrammarPattern[]>([]);
  const [expandedWord, setExpandedWord] = useState<number | null>(null);
  const [savedFilter, setSavedFilter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { locale } = useLocale();
  const online = useOnline();

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
        body: { word, locale },
        trailKind: "lookup",
        label: `Lookup: ${word}`,
        lookupKey: word,
        packToResponse: (text, confidence) => ({
          spanish: word,
          english: text,
          partOfSpeech: "—",
          examples: [],
          relatedWords: [],
          localeNotes: [`From your saved trip pack (${confidence} confidence). Will refresh when you reconnect.`],
        }),
        offlineFallback: () => ({
          spanish: word,
          english: "(offline — will look up when you reconnect)",
          partOfSpeech: "—",
          examples: [],
          relatedWords: [],
          localeNotes: ["You're offline and this word isn't in your trip pack. Saved — we'll fetch it as soon as you reconnect."],
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
      if (online && (!data.words?.length && !data.grammarPatterns?.length)) {
        toast({ title: "Saved offline", description: "We'll extract vocabulary and grammar when you reconnect." });
      }
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
      toast({ title: "Word saved to dictionary!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/dictionary/words/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dictionary/words"] });
    },
  });

  const handleLookup = () => {
    if (!searchTerm.trim()) return;
    lookupMutation.mutate(searchTerm.trim());
  };

  const handleExtract = () => {
    if (!importText.trim()) return;
    extractMutation.mutate(importText.trim());
  };

  const handleFetchUrl = () => {
    if (!importUrl.trim()) return;
    fetchUrlMutation.mutate(importUrl.trim());
  };

  const saveFromLookup = () => {
    if (!lookupResult) return;
    saveMutation.mutate({
      spanish: lookupResult.spanish,
      english: lookupResult.english,
      partOfSpeech: lookupResult.partOfSpeech,
      conjugations: lookupResult.conjugations,
      source: "lookup",
    });
  };

  const saveExtractedWord = (word: ExtractedWord) => {
    saveMutation.mutate({
      spanish: word.spanish,
      english: word.english,
      partOfSpeech: word.partOfSpeech,
      context: word.context,
      source: "import",
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2" data-testid="text-page-title">Dictionary & Conjugation</h1>
          <p className="text-muted-foreground text-sm md:text-base">Look up any word, see full conjugation tables, and build your personal vocabulary.</p>
        </header>

        <Tabs defaultValue="lookup" className="space-y-6">
          <TabsList className="bg-background border-b border-border w-full justify-start rounded-none h-auto p-0 gap-4 overflow-x-auto">
            <TabsTrigger
              value="lookup"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-1 py-3 font-medium text-muted-foreground"
              data-testid="tab-lookup"
            >
              <Search className="w-4 h-4 mr-2" /> Look Up
            </TabsTrigger>
            <TabsTrigger
              value="import"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-1 py-3 font-medium text-muted-foreground"
              data-testid="tab-import"
            >
              <FileText className="w-4 h-4 mr-2" /> Import Text
            </TabsTrigger>
            <TabsTrigger
              value="saved"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-1 py-3 font-medium text-muted-foreground"
              data-testid="tab-saved"
            >
              <BookOpen className="w-4 h-4 mr-2" /> My Dictionary
              {savedWordsQuery.data && savedWordsQuery.data.length > 0 && (
                <span className="ml-1 bg-primary text-white text-[10px] rounded-full px-1.5 py-0.5">
                  {savedWordsQuery.data.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lookup" className="space-y-6">
            <Card className="p-4 md:p-6 border-primary/20">
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Type any word in English or Spanish..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                  className="flex-1 text-lg"
                  data-testid="input-word-search"
                />
                <Button
                  onClick={handleLookup}
                  disabled={lookupMutation.isPending || !searchTerm.trim()}
                  className="bg-primary px-6"
                  data-testid="button-lookup"
                >
                  {lookupMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Try: "comer", "to want", "beach", "hablar"</p>
            </Card>

            <AnimatePresence>
              {lookupResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Card className="p-4 md:p-6 border-l-4 border-l-secondary shadow-md">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground" data-testid="text-lookup-spanish">
                          {lookupResult.spanish}
                        </h2>
                        <p className="text-lg text-muted-foreground" data-testid="text-lookup-english">{lookupResult.english}</p>
                        <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold uppercase">
                          {lookupResult.partOfSpeech}
                        </span>
                      </div>
                      <Button
                        onClick={saveFromLookup}
                        disabled={saveMutation.isPending}
                        size="sm"
                        className="bg-primary"
                        data-testid="button-save-lookup"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Save
                      </Button>
                    </div>

                    {lookupResult.conjugations && (
                      <div className="mb-6">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Conjugation Table</h3>
                        <ConjugationDisplay conjugations={lookupResult.conjugations} />
                      </div>
                    )}

                    {lookupResult.examples.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Examples</h3>
                        <ul className="space-y-2">
                          {lookupResult.examples.map((ex, i) => (
                            <li key={i} className="text-sm bg-muted/30 p-3 rounded-lg" data-testid={`text-example-${i}`}>
                              {ex}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {lookupResult.relatedWords.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Related Words</h3>
                        <div className="flex flex-wrap gap-2">
                          {lookupResult.relatedWords.map((rw, i) => (
                            <button
                              key={i}
                              onClick={() => { setSearchTerm(rw.spanish); lookupMutation.mutate(rw.spanish); }}
                              className="bg-secondary/5 hover:bg-secondary/10 border border-secondary/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
                              data-testid={`button-related-${i}`}
                            >
                              <span className="font-bold text-secondary">{rw.spanish}</span>
                              <span className="text-muted-foreground ml-1">({rw.english})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {lookupResult.localeNotes && lookupResult.localeNotes.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Regional Notes
                        </h3>
                        <div className="space-y-2">
                          {lookupResult.localeNotes.map((note, idx) => (
                            <div
                              key={idx}
                              className="bg-amber-50 border border-amber-200/50 rounded-lg p-3 text-sm text-amber-900"
                              data-testid={`text-dict-locale-note-${idx}`}
                            >
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <Card className="p-4 md:p-6 border-primary/20">
              <h3 className="font-display font-bold text-lg mb-2">Paste Text</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Paste text from an ebook, email, article, or anything you're reading. We'll extract vocabulary and show you grammar patterns.
              </p>
              <Textarea
                placeholder="Paste any text here — English, Spanish, or mixed. We'll find vocabulary and grammar patterns..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="min-h-[150px] resize-none mb-3"
                data-testid="textarea-import"
              />
              <Button
                onClick={handleExtract}
                disabled={extractMutation.isPending || !importText.trim()}
                className="w-full bg-primary"
                data-testid="button-extract"
              >
                {extractMutation.isPending ? (
                  <span className="flex items-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Analyzing text...</span>
                ) : (
                  <span className="flex items-center"><FileText className="w-4 h-4 mr-2" /> Extract Vocabulary & Grammar</span>
                )}
              </Button>
            </Card>

            <Card className="p-4 md:p-6 border-primary/20">
              <h3 className="font-display font-bold text-lg mb-2">Import from URL</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Paste a link to an article or webpage. We'll fetch the content, pull out useful words, and show you the grammar patterns used.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/article..."
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleFetchUrl()}
                  className="flex-1"
                  data-testid="input-import-url"
                />
                <Button
                  onClick={handleFetchUrl}
                  disabled={fetchUrlMutation.isPending || !importUrl.trim()}
                  className="bg-secondary"
                  data-testid="button-fetch-url"
                >
                  {fetchUrlMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </Card>

            <AnimatePresence>
              {grammarPatterns.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="space-y-3">
                    <h3 className="font-display font-bold text-lg flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      Grammar Patterns Found ({grammarPatterns.length})
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      These are the grammar structures used in the text. Tap any pattern to see an explanation.
                    </p>
                    {grammarPatterns.map((gp, idx) => (
                      <GrammarPatternCard key={idx} pattern={gp} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {extractedWords.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-bold text-lg">Vocabulary ({extractedWords.length})</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          extractedWords.forEach(w => saveExtractedWord(w));
                        }}
                        data-testid="button-save-all"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Save All
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {extractedWords.map((word, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                          data-testid={`extracted-word-${idx}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-secondary">{word.spanish}</span>
                              <span className="text-muted-foreground">—</span>
                              <span className="text-foreground">{word.english}</span>
                              <span className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full uppercase font-bold">
                                {word.partOfSpeech}
                              </span>
                            </div>
                            {word.context && (
                              <p className="text-xs text-muted-foreground mt-1 italic truncate">"{word.context}"</p>
                            )}
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-primary hover:bg-primary/10 flex-shrink-0"
                            onClick={() => saveExtractedWord(word)}
                            data-testid={`button-save-extracted-${idx}`}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Filter your dictionary..."
                value={savedFilter}
                onChange={(e) => setSavedFilter(e.target.value)}
                className="flex-1"
                data-testid="input-filter-saved"
              />
              {savedFilter && (
                <Button variant="ghost" size="icon" onClick={() => setSavedFilter("")}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {savedWordsQuery.isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading your dictionary...</div>
            ) : savedWordsQuery.data && savedWordsQuery.data.length > 0 ? (
              <div className="space-y-2">
                {savedWordsQuery.data.map((word) => (
                  <Card
                    key={word.id}
                    className="overflow-hidden"
                    data-testid={`saved-word-${word.id}`}
                  >
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                      onClick={() => setExpandedWord(expandedWord === word.id ? null : word.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-lg text-secondary">{word.spanish}</span>
                          <span className="text-muted-foreground">—</span>
                          <span className="text-foreground">{word.english}</span>
                          <span className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full uppercase font-bold">
                            {word.partOfSpeech}
                          </span>
                          {word.source && (
                            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                              {word.source}
                            </span>
                          )}
                        </div>
                        {word.context && (
                          <p className="text-xs text-muted-foreground mt-1 italic">"{word.context}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(word.id); }}
                          data-testid={`button-delete-${word.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {word.conjugations && (
                          expandedWord === word.id
                            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedWord === word.id && word.conjugations && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-border/30 pt-3">
                            <ConjugationDisplay conjugations={word.conjugations} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {savedFilter ? "No words match your filter." : "Your dictionary is empty. Look up words or import text to get started!"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
