import fs from "fs/promises";
import path from "path";
import {
  PACKS_DIR, RESEARCH_DIR, VAULT_ROOT, parseFile,
} from "./loader";
import type { AirportEntry, AtelierEntry, BridgeEntry, ParsedFile } from "./types";

const ATELIER_DIR = path.join(VAULT_ROOT, "06_Atelier");

export type LearnAuthorGroup = {
  name: string;
  entries: AtelierEntry[];
};

export type LearnEmptyHint = {
  template: string;
  folder: string;
  message: string;
};

export type LearnModes = {
  generatedAt: string;
  airport: { entries: AirportEntry[]; empty: LearnEmptyHint };
  borges: { authors: LearnAuthorGroup[]; empty: LearnEmptyHint };
  bridge: { entries: BridgeEntry[]; empty: LearnEmptyHint };
  errors: { file: string; message: string; line?: number }[];
};

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
      try {
        const p = await parseFile(f);
        if (p.frontmatter.status === "draft") continue;
        parsed.push(p);
      } catch (e: any) {
        errors.push({
          file: path.relative(VAULT_ROOT, f),
          message: e?.message || String(e),
          line: e?.line,
        });
      }
    }
  }
  return { parsed, errors };
}

function authorFromAtelierPath(relPath: string, fmAuthor?: string): string {
  if (fmAuthor) return fmAuthor;
  // 06_Atelier/<Author>/...
  const parts = relPath.split(path.sep);
  if (parts[0] === "06_Atelier" && parts[1]) return parts[1];
  return "Unknown";
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
        sourcePath: p.relPath,
      });
      continue;
    }
    if (kind === "atelier-entry") {
      const author = authorFromAtelierPath(p.relPath, p.frontmatter.author);
      const entry: AtelierEntry = {
        slug: p.slug,
        author,
        work: p.frontmatter.work,
        title: titleFromSlug(p.slug),
        sections: p.sections,
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
      bridge.push({
        slug: p.slug,
        pairId: p.frontmatter.pair_id || p.slug,
        travel: p.bridgeHalves.travel,
        literary: p.bridgeHalves.literary,
        sourcePath: p.relPath,
      });
      continue;
    }
  }

  // Stable author ordering: known canonical first, others alphabetical.
  const canonical = ["Borges", "Neruda", "Cortazar", "Cortázar", "Paz", "Rulfo"];
  const authors: LearnAuthorGroup[] = [];
  for (const name of canonical) {
    if (atelierByAuthor.has(name)) {
      authors.push({ name, entries: atelierByAuthor.get(name)! });
      atelierByAuthor.delete(name);
    }
  }
  const remaining = Array.from(atelierByAuthor.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [name, entries] of remaining) {
    authors.push({ name, entries });
  }

  return {
    generatedAt: new Date().toISOString(),
    airport: { entries: airport, empty: EMPTY_HINTS.airport },
    borges: { authors, empty: EMPTY_HINTS.borges },
    bridge: { entries: bridge, empty: EMPTY_HINTS.bridge },
    errors,
  };
}
