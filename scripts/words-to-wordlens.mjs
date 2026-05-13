#!/usr/bin/env node
// Convert a CSV/TSV of Spanish words into WordLens markdown notes.
// Pure Node, no dependencies. Matches LLM Output Contract §3 (word_lens_entry).
//
// Usage:
//   node scripts/words-to-wordlens.mjs <path>            # read from file
//   node scripts/words-to-wordlens.mjs                   # read from stdin
//   node scripts/words-to-wordlens.mjs <path> --force    # overwrite existing
//   node scripts/words-to-wordlens.mjs <path> --dry-run  # show plan, write nothing
//
// Input columns (header row required, comma or tab separated):
//   spanish          required
//   english          required
//   lemma            optional, defaults to slugified `spanish`
//   part_of_speech   optional (noun | verb | adj | adv | phrase | interjection | particle)
//   register         optional (neutral | formal | informal_mx | informal_rio | slang | literary | poetic)
//   region           optional (mexico | latam | spain | rioplatense | chile | ...)
//   difficulty       optional (a1 | a2 | b1 | b2 | c1 | c2)
//   source_context   optional ("heard at PVR airport", etc.)
//   notes            optional (single line, becomes the Natural use body)

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORDLENS_DIR = path.join(REPO_ROOT, "VallartaVoxVault", "05_WordLens");

const args = process.argv.slice(2);
const force = args.includes("--force");
const dryRun = args.includes("--dry-run");
const positional = args.filter((a) => !a.startsWith("--"));
const inputPath = positional[0] ?? null;

async function readInput() {
  if (inputPath) return await fs.readFile(inputPath, "utf8");
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function parseRow(line, sep) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; continue; }
      if (ch === '"') { inQuotes = false; continue; }
      cur += ch;
    } else {
      if (ch === '"') { inQuotes = true; continue; }
      if (ch === sep) { out.push(cur); cur = ""; continue; }
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function parseTable(raw) {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const sep = lines[0].includes("\t") ? "\t" : ",";
  const headers = parseRow(lines[0], sep).map((h) => h.toLowerCase());
  const rows = lines.slice(1).map((l) => {
    const cells = parseRow(l, sep);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = cells[i] ?? ""; });
    return obj;
  });
  return { headers, rows };
}

function slug(s) {
  return s.toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[¿?¡!.,;:'"]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function pad(n) { return String(n).padStart(2, "0"); }

function timestamp(d = new Date()) {
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

function isoDate(d = new Date()) {
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

function renderNote(row) {
  const rawLemma = (row.lemma?.trim() || row.spanish).trim();
  const fileSlug = slug(rawLemma);
  if (!fileSlug) {
    throw new Error(`could not derive a safe filename slug from lemma "${rawLemma}"`);
  }
  // Defense in depth: ensure no directory traversal slipped through slug().
  if (fileSlug.includes("/") || fileSlug.includes("\\") || fileSlug.startsWith(".")) {
    throw new Error(`refusing unsafe filename slug "${fileSlug}" for lemma "${rawLemma}"`);
  }
  const today = isoDate();
  const ts = timestamp();
  const id = `vv-word-${ts}-${randomBytes(2).toString("hex")}`;
  const tags = ["vallarta-vox", "wordlens", "flashcards"];
  const fm = [
    "---",
    `id: ${id}`,
    "type: word_lens_entry",
    "status: active",
    `created: ${today}`,
    `updated: ${today}`,
    `spanish: ${quote(row.spanish)}`,
    `english: ${quote(row.english)}`,
    `lemma: ${quote(rawLemma)}`,
    `part_of_speech: ${quote(row.part_of_speech || "")}`,
    `register: ${quote(row.register || "")}`,
    `region: ${quote(row.region || "")}`,
    `difficulty: ${quote(row.difficulty || "")}`,
    `source_context: ${quote(row.source_context || "")}`,
    "related_words: []",
    "synonyms: []",
    "antonyms: []",
    "phrases: []",
    "grammar_notes: []",
    "etymology:",
    "related_trails: []",
    "tags:",
    ...tags.map((t) => `  - ${t}`),
    "---",
    "",
  ].join("\n");

  const body = [
    `# WordLens: ${row.spanish}`,
    "",
    "## Meaning",
    "",
    row.english,
    "",
    "## Natural use",
    "",
    row.notes?.trim() || "How people actually use it.",
    "",
    "## Register",
    "",
    row.register || "Formal, neutral, warm, slang, poetic, regional, etc.",
    "",
    "## Examples",
    "",
    "| Spanish | English function | Context |",
    "|---|---|---|",
    "|  |  |  |",
    "",
    "## Grammar",
    "",
    "What pattern does this teach?",
    "",
    "## Etymology / associations",
    "",
    "Optional.",
    "",
    "## Nearby doors",
    "",
    "-",
    "",
    "## Flashcards",
    "",
    "<!-- Spaced Repetition plugin reads `front::back` lines because the note carries the `flashcards` tag. -->",
    "",
    `${row.spanish}::${row.english}`,
    "",
  ].join("\n");

  return { lemma: fileSlug, content: fm + body };
}

function quote(v) {
  if (v == null || v === "") return '""';
  const s = String(v);
  if (/[:#"'\n,&*?{}\[\]|]/.test(s) || s.startsWith(" ") || s.endsWith(" ")) {
    return '"' + s.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
  }
  return s;
}

async function main() {
  const raw = await readInput();
  const { headers, rows } = parseTable(raw);

  if (!headers.includes("spanish") || !headers.includes("english")) {
    console.error("✘ input must have at least `spanish` and `english` columns");
    console.error(`  got headers: [${headers.join(", ")}]`);
    process.exit(1);
  }

  if (!dryRun) await fs.mkdir(WORDLENS_DIR, { recursive: true });

  let written = 0;
  let skipped = 0;
  const errors = [];

  for (const row of rows) {
    if (!row.spanish || !row.english) {
      errors.push(`skipping row with missing spanish/english: ${JSON.stringify(row)}`);
      continue;
    }
    let note;
    try { note = renderNote(row); } catch (err) {
      errors.push(err.message);
      continue;
    }
    const filePath = path.join(WORDLENS_DIR, `${note.lemma}.md`);
    const rel = path.relative(REPO_ROOT, filePath);
    let exists = false;
    try { await fs.access(filePath); exists = true; } catch {}

    if (exists && !force) {
      console.log(`= ${rel} (exists, skipped — use --force to overwrite)`);
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`+ ${rel} (dry-run)`);
      written++;
      continue;
    }

    await fs.writeFile(filePath, note.content, "utf8");
    console.log(`+ ${rel}`);
    written++;
  }

  console.log("---");
  console.log(`wrote: ${written}  skipped: ${skipped}  errors: ${errors.length}`);
  if (errors.length) {
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`✘ ${err.stack || err.message}`);
  process.exit(1);
});
