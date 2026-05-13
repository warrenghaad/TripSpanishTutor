import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { z } from "zod";
import type { Frontmatter, GoldenSections, ParsedFile, VaultKind } from "./types";

export const VAULT_ROOT = path.resolve(process.cwd(), "VallartaVoxVault");
export const RESEARCH_DIR = path.join(VAULT_ROOT, "11_Research");
export const PACKS_DIR = path.join(VAULT_ROOT, "08_ProjectPacks");
export const CONSTITUTION_DIR = path.join(VAULT_ROOT, "01_Constitution");
export const WORDLENS_DIR = path.join(VAULT_ROOT, "05_WordLens");
export const GRAMMAR_DIR = path.join(VAULT_ROOT, "09_Grammar");

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

// --- Zod schemas, mirroring SPEC.md §3 ---

const KindSchema = z.enum([
  "airport-scenelet", "atelier-entry", "bridge-note",
  "vocab-pack", "grammar-note", "day-pack",
  "daily-prep", "daily-debrief", "wordlens-entry", "flashcard",
]);

const ModeSchema = z.enum(["airport", "atelier", "bridge"]).optional();

// YAML auto-parses `date: 2026-05-13` into a JS Date — coerce back to a
// YYYY-MM-DD string so downstream consumers always see a stable format.
const DateStringSchema = z.preprocess((v) => {
  if (v instanceof Date) {
    const y = v.getUTCFullYear();
    const m = String(v.getUTCMonth() + 1).padStart(2, "0");
    const d = String(v.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return v;
}, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"));

const BaseFrontmatterSchema = z.object({
  kind: KindSchema,
  date: DateStringSchema,
  locale: z.string().optional(),
  mode: ModeSchema,
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
  status: z.enum(["draft", "ready", "integrated"]).optional(),
  author: z.string().optional(),
  work: z.string().optional(),
  pair_id: z.string().optional(),
}).passthrough();

// Per-kind required-field refinements.
const FrontmatterSchema = BaseFrontmatterSchema.superRefine((fm, ctx) => {
  if (fm.kind === "atelier-entry" && !fm.author) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["author"], message: "atelier-entry requires `author`" });
  }
  if (fm.kind === "bridge-note" && !fm.pair_id) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pair_id"], message: "bridge-note requires `pair_id`" });
  }
});

export type ParseError = { file: string; message: string; line?: number; column?: number };

export class VaultLoadError extends Error {
  line?: number;
  constructor(public file: string, message: string, line?: number) {
    super(message);
    this.line = line;
  }
}

export function parseGoldenSections(body: string): GoldenSections {
  const out: GoldenSections = {};
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
  const travelMatch = body.match(/^#\s+Travel Half\s*$([\s\S]*?)(?=^#\s+Literary Half|$(?![\s\S]))/m);
  const litMatch = body.match(/^#\s+Literary Half\s*$([\s\S]*)/m);
  if (!travelMatch || !litMatch) return undefined;
  return {
    travel: parseGoldenSections(travelMatch[1]),
    literary: parseGoldenSections(litMatch[1]),
  };
}

/** Find the 1-based line number of a frontmatter key in the raw file content. */
function findFieldLine(raw: string, fieldPath: string[]): number | undefined {
  if (fieldPath.length === 0) return undefined;
  const key = String(fieldPath[0]);
  const lines = raw.split("\n");
  let inFrontmatter = false;
  let dashCount = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^---\s*$/.test(lines[i])) {
      dashCount++;
      inFrontmatter = dashCount === 1;
      if (dashCount >= 2) break;
      continue;
    }
    if (inFrontmatter) {
      const m = lines[i].match(/^([A-Za-z_][\w-]*)\s*:/);
      if (m && m[1] === key) return i + 1;
    }
  }
  return undefined;
}

function findFrontmatterStartLine(raw: string): number | undefined {
  const lines = raw.split("\n");
  return /^---\s*$/.test(lines[0] || "") ? 1 : undefined;
}

export async function parseFile(absPath: string): Promise<ParsedFile> {
  const raw = await fs.readFile(absPath, "utf8");
  let parsed: ReturnType<typeof matter>;
  try {
    parsed = matter(raw);
  } catch (e: any) {
    throw new VaultLoadError(absPath, `YAML parse error: ${e?.message || e}`, 1);
  }
  if (!parsed.data || Object.keys(parsed.data).length === 0) {
    throw new VaultLoadError(absPath, "Missing YAML frontmatter", 1);
  }

  // Apply alias before zod validation so aliased values don't trip the enum.
  let candidate: any = { ...parsed.data };
  if (candidate.kind && KIND_ALIASES[candidate.kind]) {
    const aliased = KIND_ALIASES[candidate.kind];
    candidate = { ...(aliased.extra || {}), ...candidate, kind: aliased.kind };
  }

  const result = FrontmatterSchema.safeParse(candidate);
  if (!result.success) {
    const issue = result.error.issues[0];
    const line = findFieldLine(raw, issue.path.map(String)) ?? findFrontmatterStartLine(raw);
    const fieldRef = issue.path.length ? ` (\`${issue.path.join(".")}\`)` : "";
    throw new VaultLoadError(absPath, `${issue.message}${fieldRef}`, line);
  }

  const fm = result.data as Frontmatter;
  const sections = parseGoldenSections(parsed.content);
  const bridgeHalves = fm.kind === "bridge-note" ? parseBridgeHalves(parsed.content) : undefined;
  const slug = path.basename(absPath, ".md");
  const relPath = path.relative(VAULT_ROOT, absPath);
  return { path: absPath, relPath, slug, frontmatter: fm, body: parsed.content.trim(), sections, bridgeHalves };
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

export async function loadResearchDate(date: string): Promise<{ parsed: ParsedFile[]; errors: ParseError[] }> {
  const dir = path.join(RESEARCH_DIR, date);
  const files = await listMarkdownRecursive(dir);
  const parsed: ParsedFile[] = [];
  const errors: ParseError[] = [];
  for (const f of files) {
    try {
      const p = await parseFile(f);
      if (p.frontmatter.status === "draft") continue;
      parsed.push(p);
    } catch (e: any) {
      const rel = path.relative(VAULT_ROOT, f);
      if (e instanceof VaultLoadError) {
        errors.push({ file: rel, message: e.message, line: e.line });
      } else {
        errors.push({ file: rel, message: e?.message || String(e) });
      }
    }
  }
  return { parsed, errors };
}

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

/** Recursively list md files under 11_Research/<date>/ — used by the integrated-source mover. */
export async function listResearchFilesForDate(date: string): Promise<string[]> {
  return listMarkdownRecursive(path.join(RESEARCH_DIR, date));
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
