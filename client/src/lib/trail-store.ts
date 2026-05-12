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

export async function ensureTrail(name: string, locale: string, tags: string[] = []): Promise<ActiveTrail> {
  const existing = readActive();
  if (existing) return existing;
  const res = await fetch("/api/trails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, locale, tags }),
  });
  if (!res.ok) throw new Error("Failed to create trail");
  const t = await res.json();
  const active: ActiveTrail = { id: t.id, name: t.name };
  writeActive(active);
  return active;
}

export async function recordNode(
  kind: TrailNodeKind,
  label: string,
  payload: any,
  source: "live" | "pack" = "live",
): Promise<void> {
  const trail = readActive();
  if (!trail) return;
  try {
    await fetch(`/api/trails/${trail.id}/nodes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, label, payload, source }),
    });
  } catch (e) {
    // fire-and-forget; if offline, silently drop. Future: queue in IDB.
  }
}
