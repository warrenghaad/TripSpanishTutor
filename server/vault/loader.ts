import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import type { Frontmatter, GoldenSections, ParsedFile, VaultKind } from "./types";

export const VAULT_ROOT = path.resolve(process.cwd(), "VallartaVoxVault");
export const RESEARCH_DIR = path.join(VAULT_ROOT, "11_Research");
export const PACKS_DIR = path.join(VAULT_ROOT, "08_ProjectPacks");
export const CONSTITUTION_DIR = path.join(VAULT_ROOT, "01_Constitution");
export const WORDLENS_DIR = path.join(VAULT_ROOT, "05_WordLens");
export const GRAMMAR_DIR = path.join(VAULT_ROOT, "09_Grammar");

const ALLOWED_KINDS: VaultKind[] = [
  "airport-scenelet", "atelier-entry", "bridge-note",
  "vocab-pack", "grammar-note", "day-pack",
  "daily-prep", "daily-debrief", "wordlens-entry", "flashcard",
];

const KIND_ALIASES: Record<string, { kind: VaultKind; extra?: Partial<Frontmatter> }> = {
  "borges-line": { kind: "atelier-entry", extra: { author: "Borges" } },
};

const SECTION_KEYS: { heading: string; key: keyof GoldenSections }[] = [
  { heading: "Meaning", key: "meaning" },
  { heading: "Literal", key: "literal" },
  { heading: "Natural", key: "natural" },
  { heading: "Grammar Skeleton", key: "grammarSkeleton" },
  { heading: "Practice Move", key: "practiceMove" },
  { heading: "Saveable Card", key: "saveableCard" },
];

export class VaultLoadError extends Error {
  constructor(public file: string, message: string) {
    super(message);
  }
}

export function parseGoldenSections(body: string): GoldenSections {
  const out: GoldenSections = {};
  // Split body into "## heading" chunks. Anything before the first ## is dropped.
  const parts = body.split(/^##\s+/m);
  for (const part of parts.slice(1)) {
    const nl = part.indexOf("\n");
    if (nl < 0) continue;
    const heading = part.slice(0, nl).trim();
    const content = part.slice(nl + 1).trim();
    const match = SECTION_KEYS.find((s) => s.heading.toLowerCase() === heading.toLowerCase());
    if (match) out[match.key] = content;
  }
  return out;
}

function parseBridgeHalves(body: string): { travel: GoldenSections; literary: GoldenSections } | undefined {
  const travelMatch = body.match(/^#\s+Travel Half\s*$([\s\S]*?)(?=^#\s+Literary Half|\Z)/m);
  const litMatch = body.match(/^#\s+Literary Half\s*$([\s\S]*)/m);
  if (!travelMatch || !litMatch) return undefined;
  return {
    travel: parseGoldenSections(travelMatch[1]),
    literary: parseGoldenSections(litMatch[1]),
  };
}

function validateFrontmatter(fm: any, file: string): Frontmatter {
  if (!fm || typeof fm !== "object") {
    throw new VaultLoadError(file, "Missing YAML frontmatter");
  }
  let kind = fm.kind;
  if (!kind) throw new VaultLoadError(file, "Missing required field `kind`");
  // Apply alias.
  let extra: Partial<Frontmatter> = {};
  if (KIND_ALIASES[kind]) {
    extra = KIND_ALIASES[kind].extra || {};
    kind = KIND_ALIASES[kind].kind;
  }
  if (!ALLOWED_KINDS.includes(kind)) {
    throw new VaultLoadError(file, `Unknown kind: ${kind}`);
  }
  if (!fm.date) throw new VaultLoadError(file, "Missing required field `date`");

  const merged: Frontmatter = { ...extra, ...fm, kind };

  // Per-kind required checks.
  if (kind === "atelier-entry" && !merged.author) {
    throw new VaultLoadError(file, "atelier-entry requires `author`");
  }
  if (kind === "bridge-note" && !merged.pair_id) {
    throw new VaultLoadError(file, "bridge-note requires `pair_id`");
  }
  return merged;
}

export async function parseFile(absPath: string): Promise<ParsedFile> {
  const raw = await fs.readFile(absPath, "utf8");
  const { data, content } = matter(raw);
  const fm = validateFrontmatter(data, absPath);
  const sections = parseGoldenSections(content);
  const bridgeHalves = fm.kind === "bridge-note" ? parseBridgeHalves(content) : undefined;
  const slug = path.basename(absPath, ".md");
  const relPath = path.relative(VAULT_ROOT, absPath);
  return { path: absPath, relPath, slug, frontmatter: fm, body: content.trim(), sections, bridgeHalves };
}

async function listMarkdownRecursive(dir: string): Promise<string[]> {
  let entries: import("fs").Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await listMarkdownRecursive(full)));
    else if (e.isFile() && e.name.endsWith(".md") && !e.name.startsWith(".")) out.push(full);
  }
  return out;
}

/** Returns parsed files plus per-file errors (never throws). */
export async function loadResearchDate(date: string): Promise<{ parsed: ParsedFile[]; errors: { file: string; message: string }[] }> {
  const dir = path.join(RESEARCH_DIR, date);
  const files = await listMarkdownRecursive(dir);
  const parsed: ParsedFile[] = [];
  const errors: { file: string; message: string }[] = [];
  for (const f of files) {
    try {
      const p = await parseFile(f);
      if (p.frontmatter.status === "draft") continue;
      parsed.push(p);
    } catch (e: any) {
      errors.push({ file: path.relative(VAULT_ROOT, f), message: e?.message || String(e) });
    }
  }
  return { parsed, errors };
}

/** All YYYY-MM-DD subfolders under 11_Research/. */
export async function listResearchDates(): Promise<string[]> {
  let entries: import("fs").Dirent[];
  try {
    entries = await fs.readdir(RESEARCH_DIR, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((e) => e.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(e.name))
    .map((e) => e.name)
    .sort();
}

export async function loadLearnerProfileExcerpt(maxChars = 600): Promise<string> {
  try {
    const raw = await fs.readFile(path.join(CONSTITUTION_DIR, "learner-profile.md"), "utf8");
    const { content } = matter(raw);
    const trimmed = content.trim();
    return trimmed.length > maxChars ? trimmed.slice(0, maxChars).trim() + "…" : trimmed;
  } catch {
    return "";
  }
}

export async function loadRecentWordlens(limit = 8): Promise<{ word: string; gloss?: string }[]> {
  const files = await listMarkdownRecursive(WORDLENS_DIR);
  const items: { word: string; gloss?: string; date: string }[] = [];
  for (const f of files.slice(-limit * 2)) {
    try {
      const raw = await fs.readFile(f, "utf8");
      const { data } = matter(raw);
      const word = data.word || data.front || path.basename(f, ".md");
      items.push({ word, gloss: data.back || data.gloss, date: data.date || "" });
    } catch { /* ignore */ }
  }
  return items.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, limit).map(({ word, gloss }) => ({ word, gloss }));
}

export async function loadRecentGrammar(limit = 4): Promise<{ title: string }[]> {
  const files = await listMarkdownRecursive(GRAMMAR_DIR);
  const items: { title: string; date: string }[] = [];
  for (const f of files) {
    try {
      const raw = await fs.readFile(f, "utf8");
      const { data } = matter(raw);
      items.push({ title: data.title || path.basename(f, ".md"), date: data.date || "" });
    } catch { /* ignore */ }
  }
  return items.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, limit).map(({ title }) => ({ title }));
}
