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

/** Rewrite trailId/trailNodeId on every queued request using the given remap.
 *  Called by the trail sync to point queued PATCH-on-replay at the freshly
 *  created server node ids, instead of the staged negative sentinels. */
export async function remapQueuedTrailIds(
  trailMap: Map<number, number>,
  nodeMap: Map<number, number>,
): Promise<number> {
  if (trailMap.size === 0 && nodeMap.size === 0) return 0;
  const queue = await listQueued();
  let updated = 0;
  for (const req of queue) {
    const newTrailId = req.trailId !== undefined && trailMap.has(req.trailId) ? trailMap.get(req.trailId)! : req.trailId;
    const newNodeId = req.trailNodeId !== undefined && nodeMap.has(req.trailNodeId) ? nodeMap.get(req.trailNodeId)! : req.trailNodeId;
    if (newTrailId !== req.trailId || newNodeId !== req.trailNodeId) {
      await idbPut(QUEUE_STORE, { ...req, trailId: newTrailId, trailNodeId: newNodeId }, req.id);
      updated++;
    }
  }
  return updated;
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
      // Skip items still tied to a staged (negative) trail/node id — sync
      // hasn't reconciled them yet. Leave queued so the next pass (after
      // syncStaged remaps ids) can replay AND upgrade in place.
      if ((req.trailId !== undefined && req.trailId < 0) || (req.trailNodeId !== undefined && req.trailNodeId < 0)) {
        continue;
      }
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
