import { useEffect, useState } from "react";
import { idbGetAll, idbPut, idbDelete, idbGet } from "./idb";

export type TrailNodeKind = "lookup" | "translation" | "journal" | "chat" | "situation" | "grammar" | "question";

const ACTIVE_TRAIL_KEY = "vv-active-trail-id";
const STAGED_PREFIX = "staged-node:";
const STAGED_TRAIL_PREFIX = "staged-trail:";
const KV = "kv";

export type ActiveTrail = { id: number; name: string; staged?: boolean };

let listeners = new Set<(t: ActiveTrail | null) => void>();

function readActive(): ActiveTrail | null {
  try {
    const raw = localStorage.getItem(ACTIVE_TRAIL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function writeActive(t: ActiveTrail | null) {
  if (t) localStorage.setItem(ACTIVE_TRAIL_KEY, JSON.stringify(t));
  else localStorage.removeItem(ACTIVE_TRAIL_KEY);
  listeners.forEach((l) => l(t));
}

export function useActiveTrail() {
  const [trail, setTrail] = useState<ActiveTrail | null>(() => readActive());
  useEffect(() => {
    const l = (t: ActiveTrail | null) => setTrail(t);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);
  return { trail, setTrail: writeActive };
}

function autoTrailName(): string {
  const d = new Date();
  return `Trail · ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

async function stageTrail(name: string, locale: string, tags: string[]): Promise<ActiveTrail> {
  const id = -Math.floor(Math.random() * 1_000_000_000) - 1; // negative = staged sentinel
  const trail: ActiveTrail = { id, name, staged: true };
  await idbPut(KV, { stagedId: id, name, locale, tags, createdAt: new Date().toISOString() }, `${STAGED_TRAIL_PREFIX}${id}`);
  writeActive(trail);
  return trail;
}

export async function ensureTrail(name: string, locale: string, tags: string[] = []): Promise<ActiveTrail> {
  const existing = readActive();
  if (existing) return existing;
  if (navigator.onLine) {
    try {
      const res = await fetch("/api/trails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, locale, tags }),
      });
      if (res.ok) {
        const t = await res.json();
        const active: ActiveTrail = { id: t.id, name: t.name };
        writeActive(active);
        return active;
      }
    } catch { /* fall through to staging */ }
  }
  return stageTrail(name, locale, tags);
}

/**
 * Record a node on the active trail. Always succeeds:
 * - If online + real trail → POST to server
 * - Otherwise → stage in IndexedDB; sync replays it later
 */
export async function recordNode(
  kind: TrailNodeKind,
  label: string,
  payload: any,
  source: "live" | "pack" | "queued" = "live",
  locale: string = "neutral",
): Promise<{ trailId: number; nodeId: number; staged?: boolean } | null> {
  let trail = readActive();
  if (!trail) trail = await ensureTrail(autoTrailName(), locale, ["auto"]);

  // If trail is staged OR we're offline OR server fails, stage the node
  const stageNode = async (): Promise<{ trailId: number; nodeId: number; staged: true }> => {
    const stagedId = -Date.now() - Math.floor(Math.random() * 1000);
    await idbPut(KV, {
      stagedNodeId: stagedId,
      trailId: trail!.id,
      kind, label, payload, source,
      createdAt: new Date().toISOString(),
    }, `${STAGED_PREFIX}${stagedId}`);
    return { trailId: trail!.id, nodeId: stagedId, staged: true };
  };

  if (trail.staged || !navigator.onLine) return stageNode();

  try {
    const res = await fetch(`/api/trails/${trail.id}/nodes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, label, payload, source }),
    });
    if (!res.ok) return stageNode();
    const node = await res.json();
    return { trailId: trail.id, nodeId: node.id };
  } catch { return stageNode(); }
}

export async function upgradeNode(trailId: number, nodeId: number, payload: any): Promise<boolean> {
  if (nodeId < 0) {
    // Staged node — update in IDB
    const key = `${STAGED_PREFIX}${nodeId}`;
    const existing = await idbGet<any>(KV, key);
    if (existing) {
      existing.payload = payload;
      existing.source = "live";
      await idbPut(KV, existing, key);
      return true;
    }
    return false;
  }
  try {
    const res = await fetch(`/api/trails/${trailId}/nodes/${nodeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload, source: "live" }),
    });
    return res.ok;
  } catch { return false; }
}

/**
 * Reconcile staged trails + nodes with the server when we come back online.
 * Creates real trails for staged ones, posts staged nodes, and rewrites the
 * active trail id if it pointed at a staged sentinel.
 */
export async function syncStaged(): Promise<{ trails: number; nodes: number }> {
  if (!navigator.onLine) return { trails: 0, nodes: 0 };
  const all = await idbGetAll<any>(KV);
  const stagedTrails = all.filter((v) => v && typeof v === "object" && typeof v.stagedId === "number");
  const stagedNodes = all.filter((v) => v && typeof v === "object" && typeof v.stagedNodeId === "number");

  const idMap = new Map<number, number>();
  let createdTrails = 0;
  for (const t of stagedTrails) {
    try {
      const res = await fetch("/api/trails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: t.name, locale: t.locale, tags: t.tags || [] }),
      });
      if (!res.ok) continue;
      const created = await res.json();
      idMap.set(t.stagedId, created.id);
      await idbDelete(KV, `${STAGED_TRAIL_PREFIX}${t.stagedId}`);
      createdTrails++;
      // If active trail is this staged trail, update it
      const active = readActive();
      if (active?.id === t.stagedId) writeActive({ id: created.id, name: created.name });
    } catch { /* keep staged for next pass */ }
  }

  let createdNodes = 0;
  for (const n of stagedNodes) {
    const realTrailId = n.trailId < 0 ? idMap.get(n.trailId) : n.trailId;
    if (!realTrailId) continue;
    try {
      const res = await fetch(`/api/trails/${realTrailId}/nodes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: n.kind, label: n.label, payload: n.payload, source: n.source }),
      });
      if (!res.ok) continue;
      await idbDelete(KV, `${STAGED_PREFIX}${n.stagedNodeId}`);
      createdNodes++;
    } catch { /* retry next pass */ }
  }
  return { trails: createdTrails, nodes: createdNodes };
}
