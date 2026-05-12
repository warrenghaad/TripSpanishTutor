import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Package, Download, CheckCircle2, Trash2, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/lib/locale-context";
import { useOnline } from "@/lib/use-online";
import { savePack, listPacks, getActivePack, setActivePack, removePack, type TripPack } from "@/lib/pack-store";

const ALL_INTERESTS = [
  { id: "food", label: "Food & restaurants" },
  { id: "beach", label: "Beach & nature" },
  { id: "art", label: "Art & galleries" },
  { id: "music", label: "Music & nightlife" },
  { id: "transit", label: "Taxis & transit" },
  { id: "shopping", label: "Markets & shopping" },
  { id: "medical", label: "Medical & pharmacy" },
  { id: "lodging", label: "Hotels & lodging" },
];
const SIZES = [
  { id: "small", label: "Small (~30 KB)" },
  { id: "medium", label: "Medium (~80 KB)" },
  { id: "large", label: "Large (~150 KB)" },
];

export default function TripPackPage() {
  const { locale } = useLocale();
  const online = useOnline();
  const { toast } = useToast();
  const [interests, setInterests] = useState<string[]>(["food", "beach", "transit"]);
  type PackSize = "small" | "medium" | "large";
  const [size, setSize] = useState<PackSize>("medium");
  const [packs, setPacks] = useState<(TripPack & { id: string })[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();

  const refresh = async () => {
    const [list, active] = await Promise.all([listPacks(), getActivePack()]);
    setPacks(list);
    setActiveId(active?.id);
  };

  useEffect(() => { refresh(); }, []);

  const buildMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/packs/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, interests, size }),
      });
      if (!res.ok) throw new Error("Build failed");
      return (await res.json()) as TripPack;
    },
    onSuccess: async (pack) => {
      const stored = await savePack(pack);
      toast({ title: "Trip pack ready", description: `${pack.translations.length} translations, ${pack.vocabulary.length} words, ${pack.situations.length} situations.` });
      await refresh();
      setActiveId(stored.id);
    },
    onError: () => toast({ title: "Couldn't build pack", description: "Try again or pick a smaller size.", variant: "destructive" }),
  });

  const toggleInterest = (id: string) => {
    setInterests((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-7 h-7 text-primary" />
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground" data-testid="text-page-title">Trip Pack</h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            Bundle the most likely things you'll need to look up, and use them offline — on the plane, at the beach, or in a dead-zone taxi.
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs">
            {online ? (
              <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full"><Wifi className="w-3 h-3" /> online — can build packs</span>
            ) : (
              <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full"><WifiOff className="w-3 h-3" /> offline — using saved packs only</span>
            )}
          </div>
        </header>

        <Card className="p-4 md:p-6 border-primary/20 mb-6">
          <h2 className="font-display font-bold text-lg mb-3">Build a new pack</h2>

          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Locale</p>
            <p className="text-sm bg-muted/30 px-3 py-2 rounded-lg" data-testid="text-pack-locale">{locale} <span className="text-muted-foreground text-xs">(change in nav sidebar)</span></p>
          </div>

          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {ALL_INTERESTS.map((i) => (
                <button
                  key={i.id}
                  onClick={() => toggleInterest(i.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    interests.includes(i.id)
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-border/60 text-foreground hover:border-primary/40"
                  }`}
                  data-testid={`button-interest-${i.id}`}
                >
                  {i.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Size</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSize(s.id as PackSize)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    size === s.id
                      ? "bg-secondary text-white border-secondary"
                      : "bg-white border-border/60 text-foreground hover:border-secondary/40"
                  }`}
                  data-testid={`button-size-${s.id}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => buildMutation.mutate()}
            disabled={!online || buildMutation.isPending || interests.length === 0}
            className="w-full bg-primary"
            data-testid="button-build-pack"
          >
            {buildMutation.isPending ? (
              <span className="flex items-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Building (this can take 20–60s)…</span>
            ) : (
              <span className="flex items-center"><Download className="w-4 h-4 mr-2" /> Build & save offline</span>
            )}
          </Button>
        </Card>

        <Card className="p-4 md:p-6">
          <h2 className="font-display font-bold text-lg mb-3">Saved packs</h2>
          {packs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No packs saved yet. Build one above.</p>
          ) : (
            <ul className="space-y-2" data-testid="list-saved-packs">
              {packs.map((p) => (
                <li
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${activeId === p.id ? "border-primary bg-primary/5" : "border-border/40 bg-white"}`}
                  data-testid={`pack-item-${p.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{p.locale}</span>
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full">{p.scope.size}</span>
                      {activeId === p.id && (
                        <span className="text-[10px] text-green-700 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> active</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.translations.length} translations · {p.vocabulary.length} words · {p.situations.length} situations · interests: {p.scope.interests.join(", ") || "general"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">built {new Date(p.generatedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1">
                    {activeId !== p.id && (
                      <Button size="sm" variant="outline" onClick={async () => { await setActivePack(p.id); refresh(); }} data-testid={`button-activate-${p.id}`}>
                        Use
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={async () => { await removePack(p.id); refresh(); }} data-testid={`button-delete-pack-${p.id}`}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Layout>
  );
}
