#!/usr/bin/env node
// Validate every JSON content pack inside the Vallarta Vox vault.
// Pure Node, no dependencies.

import { promises as fs } from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const VAULT_DIR = path.join(REPO_ROOT, "VallartaVoxVault");
const SCHEMA_PATH = path.join(VAULT_DIR, "12_Schemas/Templates/card.schema.json");

const REQUIRED_CARD_KEYS = ["id", "type", "title", "spanish", "english", "tags"];

async function walk(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, out);
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      out.push(full);
    }
  }
  return out;
}

async function loadSchema() {
  try {
    const raw = await fs.readFile(SCHEMA_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`✘ could not load schema at ${SCHEMA_PATH}: ${err.message}`);
    process.exit(1);
  }
}

function validatePack(pack, filePath, schema, errors) {
  const rel = path.relative(REPO_ROOT, filePath);

  if (!pack || typeof pack !== "object") {
    errors.push(`${rel}: top-level must be a JSON object`);
    return;
  }
  if (!Array.isArray(pack.cards)) {
    // skip non-pack json (e.g. config files), only flag if it looks pack-shaped
    if ("pack_id" in pack || "version" in pack) {
      errors.push(`${rel}: has pack metadata but missing \"cards\" array`);
    }
    return;
  }

  const allowedTypes = schema?.properties?.type?.enum ?? null;

  pack.cards.forEach((card, idx) => {
    const where = `${rel} [card ${idx}${card?.id ? ` "${card.id}"` : ""}]`;
    if (!card || typeof card !== "object") {
      errors.push(`${where}: card must be an object`);
      return;
    }
    for (const key of REQUIRED_CARD_KEYS) {
      if (!(key in card)) {
        errors.push(`${where}: missing required key "${key}"`);
      }
    }
    if (allowedTypes && card.type && !allowedTypes.includes(card.type)) {
      errors.push(`${where}: type "${card.type}" not in allowed enum [${allowedTypes.join(", ")}]`);
    }
    if (card.tags && !Array.isArray(card.tags)) {
      errors.push(`${where}: tags must be an array`);
    }
  });
}

async function main() {
  let files = [];
  try {
    files = await walk(VAULT_DIR);
  } catch (err) {
    console.error(`✘ could not scan vault at ${VAULT_DIR}: ${err.message}`);
    process.exit(1);
  }

  const schema = await loadSchema();
  const errors = [];
  let packCount = 0;
  let cardCount = 0;

  for (const file of files) {
    // Skip the schema itself.
    if (path.resolve(file) === path.resolve(SCHEMA_PATH)) continue;
    let raw;
    try {
      raw = await fs.readFile(file, "utf8");
    } catch (err) {
      errors.push(`${path.relative(REPO_ROOT, file)}: read error: ${err.message}`);
      continue;
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      errors.push(`${path.relative(REPO_ROOT, file)}: invalid JSON: ${err.message}`);
      continue;
    }
    if (Array.isArray(parsed?.cards)) {
      packCount += 1;
      cardCount += parsed.cards.length;
    }
    validatePack(parsed, file, schema, errors);
  }

  if (errors.length) {
    console.error(`✘ validation failed — ${errors.length} issue(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`✓ validated ${packCount} pack(s), ${cardCount} card(s)`);
}

main().catch((err) => {
  console.error(`✘ unexpected: ${err.stack || err.message}`);
  process.exit(1);
});
