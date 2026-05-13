// Build-time snapshot of the Obsidian vault.
//
// Produces `client/public/vault-snapshot.json` so the bundled iOS app can
// browse the vault offline. Vite copies anything in `client/public/` into
// `dist/public/` verbatim, and `npm run cap:sync` then folds that into
// `ios/App/App/public/` for the .ipa.
//
// Snapshot shape mirrors the runtime `/api/vault/tree` + `/api/vault/file`
// endpoints so the client can swap between snapshot and live without
// changing types:
//
//   { generatedAt, tree: VaultNode, files: { [relPath]: contents } }
//
// Run via `npm run snapshot:vault` (also chained into `npm run build`).

import fs from "fs/promises";
import path from "path";

const VAULT_ROOT = path.resolve("VallartaVoxVault");
const OUT_FILE = path.resolve("client/public/vault-snapshot.json");

type VaultNode =
  | { type: "dir"; name: string; path: string; children: VaultNode[] }
  | { type: "file"; name: string; path: string; size: number };

async function buildTree(rel = ""): Promise<VaultNode> {
  const abs = path.join(VAULT_ROOT, rel);
  let entries: import("fs").Dirent[];
  try {
    entries = await fs.readdir(abs, { withFileTypes: true });
  } catch {
    entries = [];
  }
  const children: VaultNode[] = [];
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const childRel = rel ? path.join(rel, e.name) : e.name;
    if (e.isDirectory()) {
      children.push(await buildTree(childRel));
    } else if (e.isFile() && e.name.endsWith(".md")) {
      const stat = await fs.stat(path.join(abs, e.name));
      children.push({ type: "file", name: e.name, path: childRel, size: stat.size });
    }
  }
  children.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return { type: "dir", name: rel ? path.basename(rel) : "VallartaVoxVault", path: rel, children };
}

function collectFiles(node: VaultNode, out: string[]): void {
  if (node.type === "file") out.push(node.path);
  else for (const c of node.children) collectFiles(c, out);
}

async function main() {
  const tree = await buildTree();
  const paths: string[] = [];
  collectFiles(tree, paths);
  const files: Record<string, string> = {};
  for (const p of paths) {
    files[p] = await fs.readFile(path.join(VAULT_ROOT, p), "utf-8");
  }
  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  const snapshot = {
    generatedAt: new Date().toISOString(),
    tree,
    files,
  };
  await fs.writeFile(OUT_FILE, JSON.stringify(snapshot));
  const sizeKb = (Buffer.byteLength(JSON.stringify(snapshot)) / 1024).toFixed(1);
  console.log(`vault snapshot: ${paths.length} files, ${sizeKb} KB → ${path.relative(process.cwd(), OUT_FILE)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
