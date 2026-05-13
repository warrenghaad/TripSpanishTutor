import Layout from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, BookOpen, GitMerge, ArrowRight, Pencil, MessageCircle, Sprout, Bookmark, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listLocalCards, saveLocalCard, type LocalTranslationCard } from "@/lib/translation-store";

type GoldenSections = {
  meaning?: string;
  literal?: string;
  natural?: string;
  grammarSkeleton?: string;
  practiceMove?: string;
  saveableCard?: string;
};

type AirportEntry = {
  slug: string;
  title: string;
  tags: string[];
  sections: GoldenSections;
  sourcePath: string;
};

type AtelierEntry = {
  slug: string;
  author: string;
  work?: string;
  title: string;
  excerpt?: string;
  sections: GoldenSections;
  sourcePath: string;
};

type BridgeEntry = {
  slug: string;
  pairId: string;
  travel: GoldenSections;
  literary: GoldenSections;
  sourcePath: string;
};

type EmptyHint = { template: string; folder: string; message: string };

type LearnModes = {
  generatedAt: string;
  airport: { entries: AirportEntry[]; empty: EmptyHint };
  borges: { authors: { name: string; entries: AtelierEntry[] }[]; empty: EmptyHint };
  bridge: { entries: BridgeEntry[]; empty: EmptyHint };
  errors: { file: string; message: string; line?: number }[];
};

type Mode = "airport" | "borges" | "bridge";

const MODE_META: Record<Mode, { label: string; tagline: string; icon: typeof Plane; accent: string }> = {
  airport: {
    label: "Airport",
    tagline: "Phenomenology of arrival — orientation, signs, asking again without shame.",
    icon: Plane,
    accent: "from-sky-500/10 to-sky-500/0 border-sky-500/30 text-sky-700",
  },
  borges: {
    label: "Borges",
    tagline: "Literary high-density grammar — Borges, Neruda, Cortázar, Paz, Rulfo.",
    icon: BookOpen,
    accent: "from-amber-500/10 to-amber-500/0 border-amber-500/30 text-amber-800",
  },
  bridge: {
    label: "Bridge",
    tagline: "Pair the travel line with its literary echo, side by side.",
    icon: GitMerge,
    accent: "from-emerald-500/10 to-emerald-500/0 border-emerald-500/30 text-emerald-800",
  },
};

function GoldenView({ s }: { s: GoldenSections }) {
  const Section = ({ heading, body }: { heading: string; body?: string }) =>
    body ? (
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{heading}</p>
        <div className="text-sm whitespace-pre-wrap text-foreground leading-relaxed">{body}</div>
      </div>
    ) : null;
  return (
    <div className="space-y-3">
      <Section heading="Meaning" body={s.meaning} />
      <Section heading="Literal" body={s.literal} />
      <Section heading="Natural" body={s.natural} />
      <Section heading="Grammar Skeleton" body={s.grammarSkeleton} />
      <Section heading="Practice Move" body={s.practiceMove} />
      <Section heading="Saveable Card" body={s.saveableCard} />
    </div>
  );
}

function EmptyState({ hint }: { hint: EmptyHint }) {
  return (
    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center text-muted-foreground" data-testid="empty-mode">
      <p className="text-sm">{hint.message}</p>
      <p className="text-xs mt-2 opacity-70">
        Template: <code className="font-mono">{hint.template}</code> · Folder: <code className="font-mono">{hint.folder}</code>
      </p>
    </div>
  );
}

function SaveCardButton({ slug, savePayload, alreadySaved }: { slug: string; savePayload: { source: string; translated: string; literal?: string; tag: string }; alreadySaved: boolean }) {
  const qc = useQueryClient();
  const [savedLocal, setSavedLocal] = useState(false);
  const saved = alreadySaved || savedLocal;
  const m = useMutation({
    mutationFn: async () => {
      await saveLocalCard({
        sourceText: savePayload.source,
        sourceLanguage: "es",
        targetLanguage: "en",
        translatedText: savePayload.translated,
        literalText: savePayload.literal,
        grammarNotes: [],
        detectedVerbs: [],
        detectedAdjectives: [],
        detectedAdverbs: [],
        suggestedTransforms: [],
        tags: ["practice", savePayload.tag, slug],
        saved: true,
        status: "completed",
      });
    },
    onSuccess: () => {
      setSavedLocal(true);
      qc.invalidateQueries({ queryKey: ["learn-practice-cards"] });
    },
  });
  return (
    <Button
      size="sm"
      variant={saved ? "secondary" : "outline"}
      disabled={saved || m.isPending}
      onClick={() => m.mutate()}
      data-testid={`button-save-${slug}`}
    >
      <Bookmark className="w-3 h-3 mr-1" /> {saved ? "Saved" : "Save to Practice"}
    </Button>
  );
}

function EntryCard({ slug, title, subtitle, tags, excerpt, sections, sourcePath, savePayload, alreadySaved }: {
  slug: string;
  title: string;
  subtitle?: string;
  tags?: string[];
  excerpt?: string;
  sections: GoldenSections;
  sourcePath: string;
  savePayload: { source: string; translated: string; literal?: string; tag: string };
  alreadySaved: boolean;
}) {
  return (
    <Card className="p-5 space-y-4 hover:border-primary/40 transition-colors" data-testid={`card-entry-${slug}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display font-semibold text-lg text-foreground" data-testid={`text-title-${slug}`}>{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground italic">{subtitle}</p>}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {tags.map((t) => (
                <span key={t} className="text-[10px] bg-muted/60 text-muted-foreground rounded-full px-2 py-0.5">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <SaveCardButton slug={slug} savePayload={savePayload} alreadySaved={alreadySaved} />
      </div>
      {excerpt && (
        <blockquote
          className="border-l-4 border-amber-500/40 pl-4 py-2 italic text-foreground/90 bg-amber-500/5 rounded-r whitespace-pre-wrap text-sm"
          data-testid={`text-excerpt-${slug}`}
        >
          {excerpt}
        </blockquote>
      )}
      <GoldenView s={sections} />
      <p className="text-[10px] font-mono text-muted-foreground/70 pt-1 border-t border-border/40">{sourcePath}</p>
    </Card>
  );
}

function airportSavePayload(e: AirportEntry) {
  return {
    source: e.sections.natural || e.sections.literal || e.title,
    translated: e.sections.meaning || e.title,
    literal: e.sections.literal,
    tag: "airport",
  };
}
function atelierSavePayload(e: AtelierEntry) {
  return {
    source: e.sections.natural || e.sections.literal || e.title,
    translated: e.sections.meaning || e.title,
    literal: e.sections.literal,
    tag: `atelier-${e.author.toLowerCase()}`,
  };
}
function bridgeSavePayload(e: BridgeEntry, side: "travel" | "literary") {
  const s = side === "travel" ? e.travel : e.literary;
  return {
    source: s.natural || s.literal || e.pairId,
    translated: s.meaning || e.pairId,
    literal: s.literal,
    tag: `bridge-${side}`,
  };
}

export default function Learn() {
  const [mode, setMode] = useState<Mode>("airport");
  const { data, isLoading, error } = useQuery<LearnModes>({
    queryKey: ["learn-modes"],
    queryFn: async () => {
      const r = await fetch("/api/learn/modes");
      if (!r.ok) throw new Error("Failed to load");
      return r.json();
    },
  });
  const { data: practiceCards = [] } = useQuery<LocalTranslationCard[]>({
    queryKey: ["learn-practice-cards"],
    queryFn: async () => (await listLocalCards()).filter((c) => (c.tags || []).includes("practice")),
  });

  const counts = useMemo(() => ({
    airport: data?.airport.entries.length ?? 0,
    borges: data?.borges.authors.reduce((a, g) => a + g.entries.length, 0) ?? 0,
    bridge: data?.bridge.entries.length ?? 0,
  }), [data]);

  const savedTagSet = useMemo(() => {
    const s = new Set<string>();
    for (const c of practiceCards) for (const t of c.tags || []) s.add(t);
    return s;
  }, [practiceCards]);

  const [authorTab, setAuthorTab] = useState<string | null>(null);
  const activeAuthor = useMemo(() => {
    if (!data) return null;
    if (authorTab && data.borges.authors.find((a) => a.name === authorTab)) return authorTab;
    return data.borges.authors[0]?.name ?? null;
  }, [authorTab, data]);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <header>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Learn</h1>
          <p className="text-muted-foreground">Three modes, sourced from the vault: airport orientation, literary atelier, and the bridge between them.</p>
        </header>

        {/* Three mode cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="mode-cards">
          {(["airport", "borges", "bridge"] as Mode[]).map((m) => {
            const meta = MODE_META[m];
            const Icon = meta.icon;
            const isActive = mode === m;
            return (
              <Card
                key={m}
                onClick={() => setMode(m)}
                className={`relative p-5 cursor-pointer transition-all overflow-hidden bg-gradient-to-br ${meta.accent} ${
                  isActive ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md"
                }`}
                data-testid={`mode-card-${m}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-7 h-7" />
                  <span className="text-xs font-bold bg-white/70 rounded-full px-2 py-0.5">
                    {counts[m]} {counts[m] === 1 ? "entry" : "entries"}
                  </span>
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">{meta.label}</h2>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{meta.tagline}</p>
              </Card>
            );
          })}
        </div>

        {error && (
          <Card className="p-4 bg-destructive/10 border-destructive/30 text-destructive flex items-center gap-2" data-testid="error-state">
            <AlertTriangle className="w-4 h-4" /> Couldn't load vault content.
          </Card>
        )}
        {isLoading && <p className="text-sm text-muted-foreground">Loading vault…</p>}

        {data && data.errors.length > 0 && (
          <Card className="p-3 bg-amber-50 border-amber-200 text-xs text-amber-900" data-testid="vault-warnings">
            <p className="font-bold mb-1">Some vault files were skipped:</p>
            <ul className="space-y-0.5 font-mono">
              {data.errors.slice(0, 5).map((e, i) => (
                <li key={i}>
                  {e.file}{e.line ? `:${e.line}` : ""} — {e.message}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Mode body */}
        {data && (
          <AnimatePresence mode="wait">
            <motion.section
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              data-testid={`mode-body-${mode}`}
            >
              {mode === "airport" && (
                <div className="space-y-4">
                  {data.airport.entries.length === 0 ? (
                    <EmptyState hint={data.airport.empty} />
                  ) : (
                    data.airport.entries.map((e) => (
                      <EntryCard
                        key={e.slug}
                        slug={e.slug}
                        title={e.title}
                        tags={e.tags}
                        sections={e.sections}
                        sourcePath={e.sourcePath}
                        savePayload={airportSavePayload(e)}
                        alreadySaved={savedTagSet.has(e.slug)}
                      />
                    ))
                  )}
                </div>
              )}

              {mode === "borges" && (
                <div className="space-y-4">
                  {data.borges.authors.length === 0 ? (
                    <EmptyState hint={data.borges.empty} />
                  ) : (
                    <Tabs value={activeAuthor || undefined} onValueChange={setAuthorTab}>
                      <TabsList className="bg-background border-b border-border w-full justify-start rounded-none h-auto p-0 gap-4 overflow-x-auto">
                        {data.borges.authors.map((g) => (
                          <TabsTrigger
                            key={g.name}
                            value={g.name}
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 py-3 font-medium text-muted-foreground"
                            data-testid={`tab-author-${g.name}`}
                          >
                            {g.name}
                            <span className="ml-2 text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                              {g.entries.length}
                            </span>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {data.borges.authors.map((g) => (
                        <TabsContent key={g.name} value={g.name} className="space-y-4 mt-4">
                          {g.entries.length === 0 ? (
                            <EmptyState hint={data.borges.empty} />
                          ) : (
                            g.entries.map((e) => (
                              <EntryCard
                                key={e.slug}
                                slug={e.slug}
                                title={e.title}
                                subtitle={[e.author, e.work].filter(Boolean).join(" — ")}
                                excerpt={e.excerpt}
                                sections={e.sections}
                                sourcePath={e.sourcePath}
                                savePayload={atelierSavePayload(e)}
                                alreadySaved={savedTagSet.has(e.slug)}
                              />
                            ))
                          )}
                        </TabsContent>
                      ))}
                    </Tabs>
                  )}
                </div>
              )}

              {mode === "bridge" && (
                <div className="space-y-4">
                  {data.bridge.entries.length === 0 ? (
                    <EmptyState hint={data.bridge.empty} />
                  ) : (
                    data.bridge.entries.map((e) => (
                      <Card key={e.slug} className="p-5 space-y-4" data-testid={`card-bridge-${e.slug}`}>
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-display font-semibold text-lg">Pair: {e.pairId}</h3>
                          <p className="text-[10px] font-mono text-muted-foreground/70">{e.sourcePath}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3 p-4 rounded-lg bg-sky-500/5 border border-sky-500/20">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1"><Plane className="w-3 h-3" /> Travel</p>
                              <SaveCardButton slug={`${e.slug}-travel`} savePayload={bridgeSavePayload(e, "travel")} alreadySaved={savedTagSet.has(`${e.slug}-travel`)} />
                            </div>
                            <GoldenView s={e.travel} />
                          </div>
                          <div className="space-y-3 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Literary</p>
                              <SaveCardButton slug={`${e.slug}-literary`} savePayload={bridgeSavePayload(e, "literary")} alreadySaved={savedTagSet.has(`${e.slug}-literary`)} />
                            </div>
                            <GoldenView s={e.literary} />
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </motion.section>
          </AnimatePresence>
        )}

        {/* Saved to Practice (smaller bottom section) */}
        <section className="pt-6 border-t border-border" data-testid="saved-to-practice">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
              <Pencil className="w-4 h-4 text-primary" />
              Saved to Practice
              {practiceCards.length > 0 && (
                <span className="text-[10px] bg-primary/10 text-primary rounded-full px-2 py-0.5">{practiceCards.length}</span>
              )}
            </h2>
          </div>
          {practiceCards.length === 0 ? (
            <p className="text-sm text-muted-foreground" data-testid="empty-practice-list">
              Save a Golden card from any mode above and it'll land here for chat & growth practice.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {practiceCards.map((c) => (
                <Card key={c.id} className="p-3 hover:border-primary/40 transition-colors" data-testid={`card-practice-${c.id}`}>
                  <p className="text-xs text-muted-foreground italic mb-1 line-clamp-1">{c.sourceText}</p>
                  <p className="text-sm font-display text-foreground mb-2 line-clamp-2">{c.translatedText}</p>
                  <div className="flex flex-wrap gap-1">
                    <Link href={`/chat/${c.id}`}>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" data-testid={`button-practice-chat-${c.id}`}>
                        <MessageCircle className="w-3 h-3 mr-1" /> Chat
                      </Button>
                    </Link>
                    <Link href={`/grow/${c.id}`}>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" data-testid={`button-practice-grow-${c.id}`}>
                        <Sprout className="w-3 h-3 mr-1" /> Grow
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
