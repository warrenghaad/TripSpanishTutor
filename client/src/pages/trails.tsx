import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Footprints, Plus, Tag, Sparkles, Compass, Trash2, Play, Pause, Pencil, Check, X, GitBranch, ExternalLink, Download, RotateCcw } from "lucide-react";
import { Link as WLink } from "wouter";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocale } from "@/lib/locale-context";
import { useActiveTrail } from "@/lib/trail-store";
import { useOnline } from "@/lib/use-online";

type Trail = { id: number; name: string; tags: string[]; locale: string | null; createdAt: string; updatedAt: string };
type TrailNode = { id: number; trailId: number; kind: string; label: string; payload: any; source: string; createdAt: string };
type TrailEdge = { id: number; trailId: number; fromNodeId: number | null; toNodeId: number; relation: string };

export default function TrailsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { locale } = useLocale();
  const { trail: active, setTrail } = useActiveTrail();
  const [selectedId, setSelectedId] = useState<number | undefined>(active?.id);
  const [newName, setNewName] = useState("");
  const [summary, setSummary] = useState<{ summary: string; bullets: string[] } | null>(null);
  const [doors, setDoors] = useState<{ kind: string; label: string; seed: string; reason: string }[]>([]);

  const trailsQuery = useQuery<Trail[]>({
    queryKey: ["/api/trails"],
    queryFn: async () => (await fetch("/api/trails")).json(),
  });

  const detailQuery = useQuery<{ trail: Trail; nodes: TrailNode[]; edges: TrailEdge[] }>({
    queryKey: ["/api/trails", selectedId],
    enabled: !!selectedId,
    queryFn: async () => (await fetch(`/api/trails/${selectedId}`)).json(),
  });

  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [tagInput, setTagInput] = useState("");

  useEffect(() => { setSummary(null); setDoors([]); setRenaming(false); }, [selectedId]);

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/trails", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, locale, tags: [] }),
      });
      return await res.json();
    },
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["/api/trails"] });
      setSelectedId(t.id);
      setNewName("");
      toast({ title: "Trail created", description: t.name });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => fetch(`/api/trails/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/trails"] });
      if (active?.id === selectedId) setTrail(null);
      setSelectedId(undefined);
    },
  });

  const patchMutation = useMutation({
    mutationFn: async (patch: { name?: string; tags?: string[] }) => {
      const res = await fetch(`/api/trails/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Update failed");
      return await res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/trails"] });
      qc.invalidateQueries({ queryKey: ["/api/trails", selectedId] });
      if (renaming) setRenaming(false);
      setTagInput("");
    },
  });

  const online = useOnline();

  const localSummary = (nodes: TrailNode[]) => {
    const byKind: Record<string, number> = {};
    nodes.forEach((n) => { byKind[n.kind] = (byKind[n.kind] || 0) + 1; });
    const recent = nodes.slice(-5).map((n) => `• ${n.kind}: ${n.label}`);
    const breakdown = Object.entries(byKind).map(([k, c]) => `${c} ${k}${c === 1 ? "" : "s"}`).join(", ") || "no steps yet";
    return {
      summary: `Offline view — ${nodes.length} step${nodes.length === 1 ? "" : "s"} so far (${breakdown}). A richer AI recap will appear when you're back online.`,
      bullets: recent.length ? recent : ["No steps recorded yet."],
    };
  };

  const summarizeMutation = useMutation({
    mutationFn: async () => {
      if (!online) {
        const nodes = detailQuery.data?.nodes || [];
        return localSummary(nodes);
      }
      const res = await fetch(`/api/trails/${selectedId}/summarize`, { method: "POST" });
      if (!res.ok) return localSummary(detailQuery.data?.nodes || []);
      return res.json();
    },
    onSuccess: (data) => setSummary(data),
  });

  const localDoors = (nodes: TrailNode[]) => {
    const seeds = Array.from(new Set(nodes.map((n) => n.label).filter(Boolean))).slice(-3);
    return seeds.map((label) => ({
      kind: "lookup",
      label: `Revisit "${label}"`,
      seed: label,
      reason: "From your recent steps. Live AI suggestions will return when you're online.",
    }));
  };

  const doorsMutation = useMutation({
    mutationFn: async () => {
      if (!online) return { doors: localDoors(detailQuery.data?.nodes || []) };
      const res = await fetch(`/api/trails/${selectedId}/doors`, { method: "POST" });
      if (!res.ok) return { doors: localDoors(detailQuery.data?.nodes || []) };
      return res.json();
    },
    onSuccess: (data) => setDoors(data.doors || []),
  });

  function TrailGraph({ nodes, edges }: { nodes: TrailNode[]; edges: TrailEdge[] }) {
    const W = 560, H = 110, pad = 16;
    const stepX = nodes.length > 1 ? (W - pad * 2) / (nodes.length - 1) : 0;
    const positions = new Map<number, { x: number; y: number; i: number }>();
    nodes.forEach((n, i) => {
      const branch = edges.find((e) => e.toNodeId === n.id && e.relation === "branch");
      positions.set(n.id, { x: pad + stepX * i, y: H / 2 + (branch ? 24 : 0), i });
    });
    const colorFor = (kind: string) => kind === "translation" ? "#0ea5e9" : kind === "lookup" ? "#f59e0b" : kind === "journal" ? "#a855f7" : kind === "situation" ? "#ef4444" : "#64748b";
    return (
      <div className="mb-4 p-3 bg-muted/20 rounded-lg" data-testid="trail-graph">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Graph</p>
          <p className="text-[10px] text-muted-foreground">{nodes.length} steps · {edges.length} links</p>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24">
          {edges.map((e) => {
            const a = e.fromNodeId ? positions.get(e.fromNodeId) : undefined;
            const b = positions.get(e.toNodeId);
            if (!a || !b) return null;
            return <line key={e.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={e.relation === "branch" ? "#a855f7" : "#cbd5e1"} strokeWidth={1.5} />;
          })}
          {nodes.map((n) => {
            const p = positions.get(n.id)!;
            return <circle key={n.id} cx={p.x} cy={p.y} r={6} fill={colorFor(n.kind)} stroke="#fff" strokeWidth={1.5}><title>{n.kind}: {n.label}</title></circle>;
          })}
        </svg>
      </div>
    );
  }

  const isActive = active?.id === selectedId;

  const branchMutation = useMutation({
    mutationFn: async (fromNode: TrailNode) => {
      const res = await fetch(`/api/trails/${selectedId}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: fromNode.kind,
          label: `Branch: ${fromNode.label}`,
          payload: { branchedFrom: fromNode.id, original: fromNode.payload },
          source: "live",
          fromNodeId: fromNode.id,
          relation: "branch",
        }),
      });
      if (!res.ok) throw new Error("Branch failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/trails", selectedId] });
      toast({ title: "Branched", description: "New step added linked to that one." });
    },
  });

  const toolPathFor = (node: TrailNode): string => {
    switch (node.kind) {
      case "translation": return "/?translate=" + encodeURIComponent(node.label);
      case "lookup": return "/dictionary?q=" + encodeURIComponent(node.label);
      case "journal": return "/journal";
      case "situation": return "/situations";
      case "grammar":
      case "chat":
      case "question":
      default: return "/";
    }
  };

  const exportJson = () => {
    if (!detailQuery.data) return;
    const blob = new Blob([JSON.stringify(detailQuery.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trail-${detailQuery.data.trail.id}-${detailQuery.data.trail.name.replace(/\W+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resumeFromNode = (node: TrailNode) => {
    if (!detailQuery.data) return;
    setTrail({ id: detailQuery.data.trail.id, name: detailQuery.data.trail.name });
    toast({ title: "Resumed", description: `Active trail set. Next steps will follow “${node.label}”.` });
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Footprints className="w-7 h-7 text-primary" />
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground" data-testid="text-page-title">Trails</h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            Every lookup, translation, and question becomes a step. Branch off, resume later, summarize what you learned, and find nearby doors to explore.
          </p>
        </header>

        <div className="grid md:grid-cols-[300px_1fr] gap-4">
          <Card className="p-4 self-start">
            <div className="flex gap-2 mb-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New trail name…"
                className="flex-1 text-sm border border-border/40 rounded px-2 py-1.5"
                data-testid="input-new-trail"
              />
              <Button size="sm" onClick={() => newName.trim() && createMutation.mutate(newName.trim())} data-testid="button-create-trail">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <ul className="space-y-1" data-testid="list-trails">
              {(trailsQuery.data || []).map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setSelectedId(t.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                      selectedId === t.id ? "bg-primary/10 text-primary" : "hover:bg-muted/30"
                    }`}
                    data-testid={`button-trail-${t.id}`}
                  >
                    <span className="truncate">{t.name}</span>
                    {active?.id === t.id && <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">ACTIVE</span>}
                  </button>
                </li>
              ))}
              {(!trailsQuery.data || trailsQuery.data.length === 0) && (
                <li className="text-xs text-muted-foreground italic px-2">No trails yet. Make one above.</li>
              )}
            </ul>
          </Card>

          {selectedId && detailQuery.data ? (
            <Card className="p-4 md:p-6">
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  {renaming ? (
                    <div className="flex gap-1 items-center">
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && renameValue.trim()) patchMutation.mutate({ name: renameValue.trim() });
                          if (e.key === "Escape") setRenaming(false);
                        }}
                        className="flex-1 text-lg font-bold border border-border/40 rounded px-2 py-1"
                        data-testid="input-rename-trail"
                      />
                      <Button size="sm" variant="ghost" onClick={() => renameValue.trim() && patchMutation.mutate({ name: renameValue.trim() })} data-testid="button-confirm-rename">
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setRenaming(false)} data-testid="button-cancel-rename">
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <h2 className="font-display font-bold text-xl" data-testid="text-trail-name">{detailQuery.data.trail.name}</h2>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => { setRenameValue(detailQuery.data!.trail.name); setRenaming(true); }} data-testid="button-rename-trail">
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1 items-center">
                    {(detailQuery.data.trail.tags || []).map((t) => (
                      <span key={t} className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full flex items-center gap-1" data-testid={`tag-${t}`}>
                        <Tag className="w-2.5 h-2.5" /> {t}
                        <button
                          onClick={() => patchMutation.mutate({ tags: (detailQuery.data!.trail.tags || []).filter((x) => x !== t) })}
                          className="hover:text-destructive ml-1"
                          aria-label={`remove ${t}`}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && tagInput.trim()) {
                          const next = Array.from(new Set([...(detailQuery.data!.trail.tags || []), tagInput.trim()]));
                          patchMutation.mutate({ tags: next });
                        }
                      }}
                      placeholder="+ tag"
                      className="text-[10px] bg-muted/30 border border-border/30 rounded-full px-2 py-0.5 w-16 focus:outline-none focus:border-primary"
                      data-testid="input-add-tag"
                    />
                    <span className="text-[10px] text-muted-foreground ml-1">{detailQuery.data.nodes.length} steps</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {isActive ? (
                    <Button size="sm" variant="outline" onClick={() => setTrail(null)} data-testid="button-pause-trail">
                      <Pause className="w-3 h-3 mr-1" /> Pause
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setTrail({ id: detailQuery.data.trail.id, name: detailQuery.data.trail.name })} data-testid="button-resume-trail">
                      <Play className="w-3 h-3 mr-1" /> Resume
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(selectedId)} data-testid="button-delete-trail">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => summarizeMutation.mutate()} disabled={summarizeMutation.isPending} data-testid="button-summarize">
                  <Sparkles className="w-3 h-3 mr-1" /> Summarize
                </Button>
                <Button size="sm" variant="outline" onClick={() => doorsMutation.mutate()} disabled={doorsMutation.isPending} data-testid="button-nearby-doors">
                  <Compass className="w-3 h-3 mr-1" /> Nearby doors
                </Button>
                <Button size="sm" variant="outline" onClick={exportJson} data-testid="button-export-trail">
                  <Download className="w-3 h-3 mr-1" /> Export JSON
                </Button>
              </div>

              {detailQuery.data.nodes.length > 0 && (
                <TrailGraph nodes={detailQuery.data.nodes} edges={detailQuery.data.edges} />
              )}

              {summary && (
                <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg" data-testid="card-trail-summary">
                  <p className="text-sm text-foreground mb-2">{summary.summary}</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                    {summary.bullets.map((b, i) => (<li key={i}>{b}</li>))}
                  </ul>
                </div>
              )}

              {doors.length > 0 && (
                <div className="mb-4 p-3 bg-secondary/5 border border-secondary/20 rounded-lg" data-testid="card-nearby-doors">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Nearby doors</p>
                  <div className="space-y-2">
                    {doors.map((d, i) => (
                      <div key={i} className="text-sm bg-white/60 px-3 py-2 rounded border border-border/40" data-testid={`door-${i}`}>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] bg-secondary/10 text-secondary px-1.5 py-0.5 rounded uppercase font-bold">{d.kind}</span>
                          <span className="font-bold">{d.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{d.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Steps</h3>
                <ol className="space-y-1.5" data-testid="list-trail-nodes">
                  {detailQuery.data.nodes.map((n, i) => (
                    <li key={n.id} className="text-sm flex flex-wrap items-center gap-2 px-3 py-2 bg-muted/20 rounded" data-testid={`node-${n.id}`}>
                      <span className="text-muted-foreground text-xs">{i + 1}.</span>
                      <span className="text-[10px] bg-white border border-border/40 px-1.5 py-0.5 rounded uppercase font-bold text-muted-foreground">{n.kind}</span>
                      <span className="flex-1 min-w-[140px] truncate">{n.label}</span>
                      {n.source === "pack" && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">pack</span>}
                      {n.source === "queued" && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">queued</span>}
                      <div className="flex gap-1 ml-auto">
                        <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => resumeFromNode(n)} title="Resume here" data-testid={`button-resume-${n.id}`}>
                          <RotateCcw className="w-3 h-3 mr-0.5" /> Resume
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => branchMutation.mutate(n)} title="Branch from here" data-testid={`button-branch-${n.id}`}>
                          <GitBranch className="w-3 h-3 mr-0.5" /> Branch
                        </Button>
                        <WLink href={toolPathFor(n)}>
                          <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" title="Open in original tool" data-testid={`button-open-${n.id}`}>
                            <ExternalLink className="w-3 h-3 mr-0.5" /> Open
                          </Button>
                        </WLink>
                      </div>
                    </li>
                  ))}
                  {detailQuery.data.nodes.length === 0 && (
                    <li className="text-xs text-muted-foreground italic px-2 py-3">
                      No steps yet. Resume this trail and start exploring — every lookup, translation, journal entry, or chat will land here.
                    </li>
                  )}
                </ol>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-muted-foreground text-sm">
              Pick a trail on the left, or make a new one.
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
