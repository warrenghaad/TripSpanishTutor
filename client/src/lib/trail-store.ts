import { useEffect, useState } from "react";

export type TrailNodeKind = "lookup" | "translation" | "journal" | "chat" | "situation" | "grammar" | "question";

const ACTIVE_TRAIL_KEY = "vv-active-trail-id";

export type ActiveTrail = { id: number; name: string };

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

export async function ensureTrail(name: string, locale: string, tags: string[] = []): Promise<ActiveTrail | null> {
  const existing = readActive();
  if (existing) return existing;
  if (!navigator.onLine) return null;
  try {
    const res = await fetch("/api/trails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, locale, tags }),
    });
    if (!res.ok) return null;
    const t = await res.json();
    const active: ActiveTrail = { id: t.id, name: t.name };
    writeActive(active);
    return active;
  } catch { return null; }
}

function autoTrailName(): string {
  const d = new Date();
  return `Trail · ${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

/**
 * Record a node on the active trail. If no trail is active and we are online,
 * auto-create an "Untitled trail" so the timeline reliably captures activity.
 * Returns the created node id (or null when offline-no-trail).
 */
export async function recordNode(
  kind: TrailNodeKind,
  label: string,
  payload: any,
  source: "live" | "pack" | "queued" = "live",
  locale: string = "neutral",
): Promise<{ trailId: number; nodeId: number } | null> {
  let trail = readActive();
  if (!trail) trail = await ensureTrail(autoTrailName(), locale, ["auto"]);
  if (!trail) return null;
  try {
    const res = await fetch(`/api/trails/${trail.id}/nodes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, label, payload, source }),
    });
    if (!res.ok) return null;
    const node = await res.json();
    return { trailId: trail.id, nodeId: node.id };
  } catch { return null; }
}

export async function upgradeNode(trailId: number, nodeId: number, payload: any, source: "live" = "live"): Promise<boolean> {
  try {
    const res = await fetch(`/api/trails/${trailId}/nodes/${nodeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload, source }),
    });
    return res.ok;
  } catch { return false; }
}
