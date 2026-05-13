#!/usr/bin/env node
// Build the workbook artifact: scan the vault for JSON packs, bundle them
// into dist/workbook/workbook_cards.json and dist/workbook/manifest.json.
// Pure Node, no dependencies.

import { promises as fs } from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const VAULT_DIR = path.join(REPO_ROOT, "VallartaVoxVault");
const OUT_DIR = path.join(REPO_ROOT, "dist", "workbook");

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

async function main() {
  const files = await walk(VAULT_DIR);
  const packs = [];
  const allCards = [];
  const typeCounts = {};

  for (const file of files) {
    const raw = await fs.readFile(file, "utf8");
    let pack;
    try {
      pack = JSON.parse(raw);
    } catch (err) {
      console.error(`✘ invalid JSON: ${path.relative(REPO_ROOT, file)}: ${err.message}`);
      process.exit(1);
    }
    if (!Array.isArray(pack?.cards)) continue;

    const rel = path.relative(REPO_ROOT, file);
    const packMeta = {
      pack_id: pack.pack_id ?? path.basename(file, ".json"),
      title: pack.title ?? null,
      version: pack.version ?? null,
      vault_path: pack.vault_path ?? path.dirname(rel),
      source_file: rel,
      card_count: pack.cards.length,
    };
    packs.push(packMeta);

    for (const card of pack.cards) {
      allCards.push({
        pack_id: packMeta.pack_id,
        ...card,
      });
      const t = card.type ?? "unknown";
      typeCounts[t] = (typeCounts[t] ?? 0) + 1;
    }
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  const bundle = {
    generated_at: new Date().toISOString(),
    vault_path: path.relative(REPO_ROOT, VAULT_DIR),
    pack_count: packs.length,
    card_count: allCards.length,
    cards: allCards,
  };
  const manifest = {
    generated_at: bundle.generated_at,
    vault_path: bundle.vault_path,
    pack_count: packs.length,
    card_count: allCards.length,
    type_counts: typeCounts,
    packs,
  };

  await fs.writeFile(
    path.join(OUT_DIR, "workbook_cards.json"),
    JSON.stringify(bundle, null, 2) + "\n",
    "utf8"
  );
  await fs.writeFile(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8"
  );

  console.log(`✓ built ${allCards.length} card(s) from ${packs.length} pack(s)`);
  console.log(`  → ${path.relative(REPO_ROOT, path.join(OUT_DIR, "workbook_cards.json"))}`);
  console.log(`  → ${path.relative(REPO_ROOT, path.join(OUT_DIR, "manifest.json"))}`);
}

main().catch((err) => {
  console.error(`✘ build failed: ${err.stack || err.message}`);
  process.exit(1);
});
