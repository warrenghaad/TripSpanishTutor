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
// query returns zero rows. We intercept Promise rejections that match this
// signature and translate them to an empty array on read paths.
const origThen = Promise.prototype.then;
// Note: we intentionally do NOT monkey-patch globally; instead each storage
// call should be wrapped with `safeSelect` below.

export async function safeSelect<T>(p: Promise<T[]>): Promise<T[]> {
  try {
    return await p;
  } catch (e: any) {
    const msg = e?.message || "";
    if (msg.includes("Cannot read properties of null") && msg.includes("map")) {
      return [];
    }
    throw e;
  }
}
