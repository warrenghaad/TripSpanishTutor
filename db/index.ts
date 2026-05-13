import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// Defensive shim for a known @neondatabase/serverless@0.10.x bug where the
// HTTP driver throws "Cannot read properties of null (reading 'map')" when a
// query returns zero rows. Each storage call wraps SELECTs with `safeSelect`
// to translate that specific failure to an empty array on read paths.
export async function safeSelect<T>(p: Promise<T[]>): Promise<T[]> {
  try {
    return await p;
  } catch (e) {
    if (isEmptyResultDriverBug(e)) return [];
    throw e;
  }
}

// Same shim, but for raw `db.execute(sql\`...\`)` calls that we use to work
// around drizzle-orm + neon-http arrays/.returning bugs on a few tables.
export async function safeExecuteRows<T = Record<string, unknown>>(
  p: Promise<{ rows?: T[] } | unknown>,
): Promise<T[]> {
  try {
    const r = (await p) as { rows?: T[] } | undefined;
    return r?.rows ?? [];
  } catch (e) {
    if (isEmptyResultDriverBug(e)) return [];
    throw e;
  }
}

function isEmptyResultDriverBug(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e ?? "");
  return msg.includes("Cannot read properties of null") && msg.includes("map");
}
