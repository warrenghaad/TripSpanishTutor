import { idbDelete, idbGetAll, idbPut } from "./idb";

const QUEUE_STORE = "kv";
const PREFIX = "queued-req:";

export type QueuedRequest = {
  id: string;
  endpoint: string;
  method: string;
  body: any;
  trailId?: number;
  trailNodeId?: number;
  invalidateKeys?: any[][];
  queuedAt: string;
  label: string;
};

export async function enqueueRequest(req: Omit<QueuedRequest, "id" | "queuedAt">): Promise<QueuedRequest> {
  const id = `${PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const queued: QueuedRequest = { ...req, id, queuedAt: new Date().toISOString() };
  await idbPut(QUEUE_STORE, queued, id);
  return queued;
}

export async function listQueued(): Promise<QueuedRequest[]> {
  const all = await idbGetAll<any>(QUEUE_STORE);
  return all.filter((v) => v && typeof v === "object" && typeof v.id === "string" && v.id.startsWith(PREFIX));
}

export async function dequeue(id: string) {
  await idbDelete(QUEUE_STORE, id);
}

let replayInFlight = false;
type ReplayHandlers = {
  onSuccess?: (req: QueuedRequest, response: any) => void | Promise<void>;
  onFailure?: (req: QueuedRequest, error: unknown) => void;
};

export async function replayQueue(handlers: ReplayHandlers = {}): Promise<{ replayed: number; failed: number }> {
  if (replayInFlight) return { replayed: 0, failed: 0 };
  replayInFlight = true;
  let replayed = 0;
  let failed = 0;
  try {
    const queue = await listQueued();
    for (const req of queue) {
      try {
        const res = await fetch(req.endpoint, {
          method: req.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req.body),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // Upgrade the linked trail node in place so the timeline shows live answer
        if (req.trailId && req.trailNodeId) {
          try {
            await fetch(`/api/trails/${req.trailId}/nodes/${req.trailNodeId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                payload: { request: req.body, response: data, upgradedAt: new Date().toISOString() },
                source: "live",
              }),
            });
          } catch { /* non-fatal */ }
        }

        // Invalidate query caches so UI refreshes
        if (req.invalidateKeys?.length) {
          const { queryClient } = await import("./queryClient");
          for (const k of req.invalidateKeys) queryClient.invalidateQueries({ queryKey: k });
        }

        await dequeue(req.id);
        if (handlers.onSuccess) await handlers.onSuccess(req, data);
        replayed++;
      } catch (e) {
        failed++;
        if (handlers.onFailure) handlers.onFailure(req, e);
      }
    }
  } finally {
    replayInFlight = false;
  }
  return { replayed, failed };
}

export function startReplayWatcher(handlers: ReplayHandlers = {}) {
  const tryReplay = () => { if (navigator.onLine) replayQueue(handlers); };
  window.addEventListener("online", tryReplay);
  setTimeout(tryReplay, 1500);
  const interval = window.setInterval(tryReplay, 60_000);
  return () => {
    window.removeEventListener("online", tryReplay);
    window.clearInterval(interval);
  };
}
