import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronDown, FileText, Folder, Download, Wifi, WifiOff, Settings as SettingsIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiUrl, getApiBaseUrl, setApiBaseUrl, isCapacitorNative, getVaultApiKey, setVaultApiKey, vaultHeaders } from "@/lib/api-base";

// Vault browser — read-only.
//
// Two data sources:
//   1. Bundled snapshot at `/vault-snapshot.json` (frozen at build time,
//      shipped inside the .ipa, so the app works offline on day one).
//   2. Live `/api/vault/tree` + `/api/vault/file` against the deployed
//      Replit backend, used when the "Live refresh" toggle is on AND the
//      device has network.
//
// The toggle defaults to OFF on native (offline-first) and ON in the
// browser (where you're always next to the server).

type VaultNode =
  | { type: "dir"; name: string; path: string; children: VaultNode[] }
  | { type: "file"; name: string; path: string; size: number };

type Snapshot = {
  generatedAt: string;
  tree: VaultNode;
  files: Record<string, string>;
};

async function fetchSnapshot(): Promise<Snapshot | null> {
  try {
    const r = await fetch("/vault-snapshot.json");
    if (!r.ok) return null;
    return (await r.json()) as Snapshot;
  } catch {
    return null;
  }
}

async function fetchLiveTree(): Promise<VaultNode> {
  const url = await apiUrl("/api/vault/tree");
  const r = await fetch(url, { headers: await vaultHeaders() });
  if (!r.ok) throw new Error(`tree ${r.status}`);
  return r.json();
}

async function fetchLiveFile(path: string): Promise<string> {
  const url = await apiUrl(`/api/vault/file?path=${encodeURIComponent(path)}`);
  const r = await fetch(url, { headers: await vaultHeaders() });
  if (!r.ok) throw new Error(`file ${r.status}`);
  const j = await r.json();
  return j.content as string;
}

function TreeNode({
  node,
  depth,
  selected,
  onSelect,
}: {
  node: VaultNode;
  depth: number;
  selected: string | null;
  onSelect: (path: string) => void;
}) {
  const [open, setOpen] = useState(depth < 1);
  if (node.type === "file") {
    const isSel = selected === node.path;
    return (
      <button
        type="button"
        onClick={() => onSelect(node.path)}
        data-testid={`vault-file-${node.path}`}
        className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded hover:bg-muted text-sm ${isSel ? "bg-muted font-medium" : ""}`}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        <FileText className="h-3.5 w-3.5 shrink-0 opacity-60" />
        <span className="truncate">{node.name}</span>
      </button>
    );
  }
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        data-testid={`vault-dir-${node.path || "root"}`}
        className="flex items-center gap-1 w-full text-left px-2 py-1 rounded hover:bg-muted text-sm font-medium"
        style={{ paddingLeft: 4 + depth * 12 }}
      >
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        <Folder className="h-3.5 w-3.5 opacity-60" />
        <span className="truncate">{node.name}</span>
        <span className="ml-auto text-xs text-muted-foreground">{node.children.length}</span>
      </button>
      {open && (
        <div>
          {node.children.map((c) => (
            <TreeNode key={c.path || c.name} node={c} depth={depth + 1} selected={selected} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function VaultPage() {
  const native = isCapacitorNative();
  const [live, setLive] = useState<boolean>(!native);
  const [selected, setSelected] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiBase, setApiBase] = useState<string>("");
  const [vaultKey, setVaultKey] = useState<string>("");

  useEffect(() => {
    getApiBaseUrl().then(setApiBase);
    getVaultApiKey().then(setVaultKey);
  }, []);

  const snapshotQ = useQuery<Snapshot | null>({ queryKey: ["vault", "snapshot"], queryFn: fetchSnapshot });
  const liveTreeQ = useQuery<VaultNode>({ queryKey: ["vault", "tree", "live"], queryFn: fetchLiveTree, enabled: live });
  const liveFileQ = useQuery<string>({
    queryKey: ["vault", "file", selected, "live"],
    queryFn: () => fetchLiveFile(selected!),
    enabled: live && !!selected,
  });

  const tree = useMemo<VaultNode | null>(() => {
    if (live && liveTreeQ.data) return liveTreeQ.data;
    if (snapshotQ.data) return snapshotQ.data.tree;
    return null;
  }, [live, liveTreeQ.data, snapshotQ.data]);

  const fileContent = useMemo<string | null>(() => {
    if (!selected) return null;
    if (live && liveFileQ.data !== undefined) return liveFileQ.data;
    if (snapshotQ.data?.files?.[selected]) return snapshotQ.data.files[selected];
    return null;
  }, [selected, live, liveFileQ.data, snapshotQ.data]);

  const snapshotAge = snapshotQ.data?.generatedAt
    ? new Date(snapshotQ.data.generatedAt).toLocaleString()
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-display">Vault</h1>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              {live ? <Wifi className="h-4 w-4 text-emerald-600" /> : <WifiOff className="h-4 w-4 text-muted-foreground" />}
              <Label htmlFor="live-toggle" className="cursor-pointer">Live refresh</Label>
              <Switch id="live-toggle" checked={live} onCheckedChange={setLive} data-testid="toggle-live" />
            </div>
            {native && (
              <Button variant="ghost" size="icon" onClick={() => setShowSettings((s) => !s)} data-testid="button-vault-settings">
                <SettingsIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {showSettings && native && (
          <Card className="p-4 space-y-2">
            <Label htmlFor="api-base">Backend URL</Label>
            <div className="flex gap-2">
              <Input
                id="api-base"
                value={apiBase}
                onChange={(e) => setApiBase(e.target.value)}
                placeholder="https://your-app.replit.app"
                data-testid="input-api-base"
              />
              <Button onClick={() => setApiBaseUrl(apiBase).then(() => liveTreeQ.refetch())} data-testid="button-save-api-base">
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The iOS app talks to this URL when "Live refresh" is on. Leave blank to use the bundled snapshot only.
            </p>
            <Label htmlFor="vault-key" className="pt-2">Vault API key (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="vault-key"
                type="password"
                value={vaultKey}
                onChange={(e) => setVaultKey(e.target.value)}
                placeholder="Matches VAULT_API_KEY on the backend"
                data-testid="input-vault-key"
              />
              <Button onClick={() => setVaultApiKey(vaultKey).then(() => liveTreeQ.refetch())} data-testid="button-save-vault-key">
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Required only if the backend sets the matching VAULT_API_KEY environment variable.
            </p>
          </Card>
        )}

        <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
          {snapshotAge && (
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              Bundled snapshot: <span className="font-mono">{snapshotAge}</span>
            </span>
          )}
          {live && liveTreeQ.isFetching && <span>Refreshing from server…</span>}
          {live && liveTreeQ.error ? <span className="text-destructive">Live fetch failed — falling back to snapshot.</span> : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 min-h-[60vh]">
          <Card className="p-2 overflow-auto max-h-[80vh]">
            {tree ? (
              <TreeNode node={tree} depth={0} selected={selected} onSelect={setSelected} />
            ) : (
              <div className="p-4 text-sm text-muted-foreground" data-testid="vault-empty">
                {snapshotQ.isLoading ? "Loading snapshot…" : "No vault data available."}
              </div>
            )}
          </Card>

          <Card className="p-4 overflow-auto max-h-[80vh]">
            {!selected ? (
              <div className="text-sm text-muted-foreground">Pick a markdown file from the tree to view it.</div>
            ) : fileContent !== null ? (
              <article className="prose prose-sm max-w-none">
                <div className="text-xs text-muted-foreground font-mono mb-3">{selected}</div>
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed bg-muted/30 p-3 rounded" data-testid="vault-file-content">{fileContent}</pre>
              </article>
            ) : (
              <div className="text-sm text-muted-foreground">
                {live && liveFileQ.isLoading ? "Loading…" : "File not in bundled snapshot. Turn on Live refresh to fetch it."}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
