import { recordNode, upgradeNode, type TrailNodeKind } from "./trail-store";
import { getActivePack, lookupInPack } from "./pack-store";
import { enqueueRequest } from "./offline-queue";
import { queryClient } from "./queryClient";

export type SmartFetchOptions<T> = {
  endpoint: string;
  body: any;
  /** Trail kind to record on success / pack-fallback / queue */
  trailKind: TrailNodeKind;
  /** Short label shown in trail timeline + sync toast */
  label: string;
  /** When offline + no pack hit, what shape to return so the UI doesn't crash */
  offlineFallback: () => T;
  /** When pack hit, transform PackHit -> response shape */
  packToResponse?: (text: string, confidence: "high" | "medium" | "low") => T;
  /** When live response is invalidated by replay, query keys to refresh */
  invalidateKeys?: any[][];
  /** Lookup string for pack search; defaults to body.text or body.word */
  lookupKey?: string;
};

export type SmartResult<T> = {
  data: T;
  source: "live" | "pack" | "queued";
};

/**
 * Unified online/offline fetch wrapper.
 * - Online: POST normally, record node as `live`.
 * - Offline + pack hit: return pack response, record node as `pack`, queue for upgrade.
 * - Offline + no pack hit: return offlineFallback, record node as `queued`, queue for upgrade.
 *
 * Queued requests carry the trail node id so replay can upgrade it in place
 * and the UI gets cache invalidation.
 */
export async function smartFetch<T>(opts: SmartFetchOptions<T>): Promise<SmartResult<T>> {
  const lookupKey: string = opts.lookupKey ?? (opts.body?.text || opts.body?.word || "");

  if (navigator.onLine) {
    try {
      const res = await fetch(opts.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opts.body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as T;
      recordNode(opts.trailKind, opts.label, { request: opts.body, response: data }, "live");
      return { data, source: "live" };
    } catch {
      // fall through to offline path on network failure
    }
  }

  const pack = await getActivePack();
  const hit = pack && lookupKey ? lookupInPack(pack, lookupKey) : undefined;

  let data: T;
  let source: "pack" | "queued";
  if (hit && opts.packToResponse) {
    data = opts.packToResponse(hit.text, hit.confidence);
    source = "pack";
  } else {
    data = opts.offlineFallback();
    source = "queued";
  }

  const node = await recordNode(
    opts.trailKind,
    opts.label,
    { request: opts.body, response: data, source },
    source,
  );

  await enqueueRequest({
    endpoint: opts.endpoint,
    method: "POST",
    body: opts.body,
    label: opts.label,
    trailId: node?.trailId,
    trailNodeId: node?.nodeId,
    invalidateKeys: opts.invalidateKeys,
  });

  return { data, source };
}

export async function upgradeOnReplay(trailId: number | undefined, nodeId: number | undefined, response: any) {
  if (!trailId || !nodeId) return;
  await upgradeNode(trailId, nodeId, { response, upgradedAt: new Date().toISOString() });
}

export function invalidateAfterReplay(keys: any[][] | undefined) {
  if (!keys) return;
  for (const k of keys) queryClient.invalidateQueries({ queryKey: k });
}
