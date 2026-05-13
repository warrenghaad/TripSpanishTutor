import fs from "fs/promises";
import path from "path";
import chokidar from "chokidar";
import {
  PACKS_DIR, RESEARCH_DIR, VAULT_ROOT, parseFile,
} from "./loader";
import type { AirportEntry, AtelierEntry, BridgeEntry, ParsedFile } from "./types";
import type { LearnModes, LearnAuthorGroup, LearnEmptyHint } from "@shared/learn";

const ATELIER_DIR = path.join(VAULT_ROOT, "06_Atelier");

const LEARN_WATCH_DIRS = [RESEARCH_DIR, PACKS_DIR, ATELIER_DIR];

// LearnModes and friends are declared in `shared/learn.ts` so the client
// and server agree on the shape served by `GET /api/learn/modes`. Re-export
// here for legacy imports that still pull from this module.
export type {
  LearnModes,
  LearnAuthorGroup,
  LearnEmptyHint,
} from "@shared/learn";

const TODAY_PLACEHOLDER = "<today>";

const EMPTY_HINTS: Record<"airport" | "borges" | "bridge", LearnEmptyHint> = {
  airport: {
    template: "airport-scenelet",
    folder: `11_Research/${TODAY_PLACEHOLDER}/`,
    message: "Drop an `airport-scenelet` from `12_Schemas/Templates/` into `11_Research/<today>/` to fill this section.",
  },
  borges: {
    template: "atelier-entry",
    folder: "06_Atelier/<Author>/",
    message: "Drop an `atelier-entry` (with `author: Borges`) into `06_Atelier/Borges/` or `11_Research/<today>/` to fill this section.",
  },
  bridge: {
    template: "bridge-note",
    folder: `11_Research/${TODAY_PLACEHOLDER}/`,
    message: "Drop a `bridge-note` (with paired `# Travel Half` and `# Literary Half`) into `11_Research/<today>/` to pair travel & literary lines here.",
  },
};

function titleFromSlug(slug: string): string {
  return slug.replace(/^[a-z]+-/, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function listMd(dir: string): Promise<string[]> {
  let entries: import("fs").Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await listMd(full)));
    else if (e.isFile() && e.name.endsWith(".md") && !e.name.startsWith(".")) out.push(full);
  }
  return out;
}

async function loadAll(roots: string[]): Promise<{ parsed: ParsedFile[]; errors: LearnModes["errors"] }> {
  const parsed: ParsedFile[] = [];
  const errors: LearnModes["errors"] = [];
  const seen = new Set<string>();
  for (const root of roots) {
    const files = await listMd(root);
    for (const f of files) {
      if (seen.has(f)) continue;
      seen.add(f);
      const rel = path.relative(VAULT_ROOT, f);
      // Generated day-packs land at `08_ProjectPacks/YYYY-MM-DD.md` and are
      // assembled output, not spec-frontmatter content. Skip them silently
      // so they don't pollute the parse-error list in the UI. Spec-compliant
      // pack source notes still live under `08_ProjectPacks/sources/...`.
      if (/^08_ProjectPacks[\\/][0-9]{4}-[0-9]{2}-[0-9]{2}\.md$/.test(rel)) continue;
      try {
        const p = await parseFile(f);
        if (p.frontmatter.status === "draft") continue;
        parsed.push(p);
      } catch (e: any) {
        errors.push({
          file: rel,
          message: e?.message || String(e),
          line: e?.line,
        });
      }
    }
  }
  return { parsed, errors };
}

// Cap the rendered literary excerpt at a conservative length to keep us
// inside fair-use territory regardless of how long an upstream vault file
// quotes a primary source. The full source file is still authoritative on
// disk; this only constrains what the UI renders.
const MAX_EXCERPT_CHARS = 280;

function leadExcerpt(body: string): string | undefined {
  const before = body.split(/^##\s+/m)[0] || "";
  const trimmed = before.trim();
  if (!trimmed) return undefined;
  // Strip a leading "> " from each line so the excerpt renders as plain prose;
  // the UI will style it as a pull-quote.
  const cleaned = trimmed
    .split("\n")
    .map((l) => l.replace(/^>\s?/, ""))
    .join("\n")
    .trim();
  if (!cleaned) return undefined;
  return cleaned.length > MAX_EXCERPT_CHARS
    ? cleaned.slice(0, MAX_EXCERPT_CHARS).trimEnd() + "…"
    : cleaned;
}

// Normalize an author string to its canonical literary key (case-insensitive,
// diacritic-insensitive) so "borges", "BORGES", "Cortázar", "cortazar" all
// land in the same author tab and pass the literary whitelist.
function normalizeAuthor(raw: string): string | null {
  const folded = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
  return AUTHOR_CANONICAL.get(folded) ?? null;
}

const AUTHOR_CANONICAL = new Map<string, string>([
  ["borges", "Borges"],
  ["neruda", "Neruda"],
  ["cortazar", "Cortázar"],
  ["paz", "Paz"],
  ["rulfo", "Rulfo"],
]);

function authorFromAtelierPath(relPath: string, fmAuthor?: string): string | null {
  if (fmAuthor) {
    const n = normalizeAuthor(fmAuthor);
    if (n) return n;
  }
  // 06_Atelier/<Author>/...
  const parts = relPath.split(path.sep);
  if (parts[0] === "06_Atelier" && parts[1]) return normalizeAuthor(parts[1]);
  return null;
}

function parseSaveableCard(body: string): { front?: string; back?: string; note?: string } {
  const m = body.match(/^##\s+Saveable Card\s*$([\s\S]*?)(?=^##\s+|\s*$(?![\s\S]))/m);
  if (!m) return {};
  const block = m[1];
  const pick = (label: string): string | undefined => {
    const re = new RegExp(`^[-*]\\s*\\*\\*${label}:?\\*\\*\\s*(.+?)\\s*$`, "im");
    const mm = block.match(re);
    return mm ? mm[1].trim() : undefined;
  };
  return { front: pick("front"), back: pick("back"), note: pick("note") };
}

// --- Boot-time cache + watcher invalidation -----------------------------
//
// /learn is the highest-traffic surface of the app and its content lives in
// VallartaVoxVault on disk. Re-walking 06_Atelier + 08_ProjectPacks +
// 11_Research on every request would punish offline robustness and add
// latency. Instead we build the LearnModes payload once at server boot
// (via `primeLearnCache`) and re-build it whenever a watched vault file
// changes (via `watchLearnVault`). All `getLearnModes()` callers serve the
// cached snapshot — `loadLearnModes()` is the underlying builder, kept
// exported for the sync path used by the watcher / boot sync.
let cached: LearnModes | null = null;
let inflight: Promise<LearnModes> | null = null;
let rebuildTimer: NodeJS.Timeout | null = null;

async function rebuild(): Promise<LearnModes> {
  cached = await loadLearnModes();
  return cached;
}

export async function getLearnModes(): Promise<LearnModes> {
  if (cached) return cached;
  if (!inflight) inflight = rebuild().finally(() => { inflight = null; });
  return inflight;
}

export async function primeLearnCache(): Promise<void> {
  await rebuild();
}

export function watchLearnVault(): void {
  const watcher = chokidar.watch(LEARN_WATCH_DIRS, {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
  });
  const trigger = () => {
    if (rebuildTimer) clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(() => { void rebuild().catch(() => { /* swallow; keep stale cache */ }); }, 500);
  };
  watcher.on("add", trigger).on("change", trigger).on("unlink", trigger);
}

export async function loadLearnModes(): Promise<LearnModes> {
  const { parsed, errors } = await loadAll([RESEARCH_DIR, PACKS_DIR, ATELIER_DIR]);

  const airport: AirportEntry[] = [];
  const bridge: BridgeEntry[] = [];
  const atelierByAuthor = new Map<string, AtelierEntry[]>();

  for (const p of parsed) {
    const kind = p.frontmatter.kind;
    // Airport: any file whose kind is airport-scenelet OR whose mode is
    // explicitly tagged "airport" (e.g. day-pack airport sections, future
    // airport-flavored kinds). The shape we render is the same Golden
    // sections, so we accept anything tagged for the mode.
    if (kind === "airport-scenelet" || p.frontmatter.mode === "airport") {
      airport.push({
        slug: p.slug,
        title: titleFromSlug(p.slug),
        tags: p.frontmatter.tags || [],
        sections: p.sections,
        saveable: parseSaveableCard(p.body),
        sourcePath: p.relPath,
      });
      continue;
    }
    if (kind === "atelier-entry") {
      const author = authorFromAtelierPath(p.relPath, p.frontmatter.author);
      // Skip non-literary atelier content (FilmMurals_PV / Music subdirs)
      // — those surface under their own modes, not the Borges card.
      if (!author) continue;
      const entry: AtelierEntry = {
        slug: p.slug,
        author,
        work: p.frontmatter.work,
        title: titleFromSlug(p.slug),
        excerpt: leadExcerpt(p.body),
        sections: p.sections,
        saveable: parseSaveableCard(p.body),
        sourcePath: p.relPath,
      };
      const list = atelierByAuthor.get(author) || [];
      list.push(entry);
      atelierByAuthor.set(author, list);
      continue;
    }
    if (kind === "bridge-note") {
      if (!p.bridgeHalves) {
        // Don't silently drop a malformed bridge-note: surface to the UI so
        // the user knows their template is missing one of the two halves.
        errors.push({
          file: p.relPath,
          message: "bridge-note is missing `# Travel Half` and/or `# Literary Half` sections",
        });
        continue;
      }
      // For bridge notes the body has nested halves; extract a saveable
      // card from each half-block independently if present.
      const travelBlock = p.body.match(/^#\s+Travel Half\s*$([\s\S]*?)(?=^#\s+Literary Half|$(?![\s\S]))/m)?.[1] || "";
      const literaryBlock = p.body.match(/^#\s+Literary Half\s*$([\s\S]*)/m)?.[1] || "";
      bridge.push({
        slug: p.slug,
        pairId: p.frontmatter.pair_id || p.slug,
        travel: p.bridgeHalves.travel,
        literary: p.bridgeHalves.literary,
        travelSaveable: parseSaveableCard(travelBlock),
        literarySaveable: parseSaveableCard(literaryBlock),
        sourcePath: p.relPath,
      });
      continue;
    }
  }

  // Stable author ordering — canonical literary list, in order.
  const canonical = ["Borges", "Neruda", "Cortázar", "Paz", "Rulfo"];
  const authors: LearnAuthorGroup[] = [];
  for (const name of canonical) {
    if (atelierByAuthor.has(name)) {
      authors.push({ name, entries: atelierByAuthor.get(name)! });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    airport: { entries: airport, empty: EMPTY_HINTS.airport },
    borges: { authors, empty: EMPTY_HINTS.borges },
    bridge: { entries: bridge, empty: EMPTY_HINTS.bridge },
    errors,
  };
}
