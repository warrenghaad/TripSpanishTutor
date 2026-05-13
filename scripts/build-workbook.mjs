#!/usr/bin/env node
// Build the workbook artifact: scan the vault for JSON packs, bundle them
// into dist/workbook/workbook_cards.json and dist/workbook/manifest.json.
// Pure Node, no dependencies.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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
  const scenePacks = [];
  const allScenelets = [];
  const allPhraseCards = [];

  for (const file of files) {
    const raw = await fs.readFile(file, "utf8");
    let pack;
    try {
      pack = JSON.parse(raw);
    } catch (err) {
      console.error(`✘ invalid JSON: ${path.relative(REPO_ROOT, file)}: ${err.message}`);
      process.exit(1);
    }
    const rel = path.relative(REPO_ROOT, file);

    // Shape A — card pack
    if (Array.isArray(pack?.cards)) {
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
        allCards.push({ pack_id: packMeta.pack_id, ...card });
        const t = card.type ?? "unknown";
        typeCounts[t] = (typeCounts[t] ?? 0) + 1;
      }
      continue;
    }

    // Shape B — scene pack
    if (Array.isArray(pack?.scenelets)) {
      const meta = {
        pack: pack.pack ?? path.basename(file, ".json"),
        vault_path: pack.vault_path ?? rel,
        source_file: rel,
        scenelet_count: pack.scenelets.length,
        phrase_card_count: Array.isArray(pack.phrase_cards) ? pack.phrase_cards.length : 0,
        has_authority_exchange: !!pack.authority_exchange,
        has_register_map: !!pack.register_map,
      };
      scenePacks.push(meta);
      for (const s of pack.scenelets) allScenelets.push({ pack: meta.pack, ...s });
      if (Array.isArray(pack.phrase_cards)) {
        for (const p of pack.phrase_cards) allPhraseCards.push({ pack: meta.pack, ...p });
      }
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
