// Read-only vault browser endpoints.
//
// The iOS app needs to surface the Obsidian vault as a navigable read-only
// tree (folders + markdown files). Two endpoints back this:
//
//   GET /api/vault/tree
//     Returns the full directory tree under VAULT_ROOT as a nested JSON
//     structure. Built once at boot and cached; rebuilt on chokidar events.
//
//   GET /api/vault/file?path=<relPath>
//     Returns the raw markdown contents of a single file. The `path` is
//     resolved relative to VAULT_ROOT and rejected if it escapes the root
//     (path-traversal safety).
//
// Both endpoints are read-only. There is no write endpoint here — the
// vault is authoritative on disk and edited via Obsidian, not the app.

import fs from "fs/promises";
import path from "path";
import chokidar from "chokidar";
import { VAULT_ROOT } from "./loader";

export type VaultNode =
  | { type: "dir"; name: string; path: string; children: VaultNode[] }
  | { type: "file"; name: string; path: string; size: number };

let cached: VaultNode | null = null;
let inflight: Promise<VaultNode> | null = null;

async function buildTree(rootAbs: string, rel = ""): Promise<VaultNode> {
  const abs = path.join(rootAbs, rel);
  let entries: import("fs").Dirent[];
  try {
    entries = await fs.readdir(abs, { withFileTypes: true });
  } catch {
    entries = [];
  }
  const children: VaultNode[] = [];
  for (const e of entries) {
    if (e.name.startsWith(".")) continue; // skip dotfiles (.obsidian, .git, etc.)
    const childRel = rel ? path.join(rel, e.name) : e.name;
    if (e.isDirectory()) {
      children.push(await buildTree(rootAbs, childRel));
    } else if (e.isFile()) {
      // Vault is markdown-first; surface .md only to keep the browser focused.
      if (!e.name.endsWith(".md")) continue;
      const stat = await fs.stat(path.join(abs, e.name));
      children.push({
        type: "file",
        name: e.name,
        path: childRel,
        size: stat.size,
      });
    }
  }
  // Sort: directories first, then files; alpha within each group.
  children.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return {
    type: "dir",
    name: rel ? path.basename(rel) : "VallartaVoxVault",
    path: rel,
    children,
  };
}

export async function getVaultTree(): Promise<VaultNode> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = buildTree(VAULT_ROOT).then((t) => {
    cached = t;
    inflight = null;
    return t;
  });
  return inflight;
}

export async function primeVaultBrowserCache(): Promise<void> {
  cached = await buildTree(VAULT_ROOT);
}

export function watchVaultBrowser(onUpdate?: () => void): () => Promise<void> {
  const watcher = chokidar.watch(VAULT_ROOT, {
    ignoreInitial: true,
    ignored: /(^|[\\/])\../, // dotfiles
    depth: 99,
  });
  let timer: NodeJS.Timeout | null = null;
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      cached = await buildTree(VAULT_ROOT);
      onUpdate?.();
    }, 250);
  };
  watcher.on("add", schedule).on("unlink", schedule)
         .on("addDir", schedule).on("unlinkDir", schedule);
  return async () => {
    if (timer) clearTimeout(timer);
    await watcher.close();
  };
}

/**
 * Resolve a vault-relative path to an absolute filesystem path, rejecting
 * any path that escapes VAULT_ROOT. Returns null if the path is unsafe or
 * does not resolve to a regular file.
 */
export async function resolveVaultFile(relPath: string): Promise<string | null> {
  if (!relPath) return null;
  // Block obviously hostile inputs early.
  if (relPath.includes("\0")) return null;
  const normalized = path.normalize(relPath);
  if (normalized.startsWith("..") || path.isAbsolute(normalized)) return null;
  const abs = path.resolve(VAULT_ROOT, normalized);
  // Final check: the resolved path must stay under VAULT_ROOT.
  const root = path.resolve(VAULT_ROOT);
  if (abs !== root && !abs.startsWith(root + path.sep)) return null;
  // Resolve symlinks too — a symlink inside the vault could otherwise
  // point at /etc/passwd. realpath both sides and re-check containment.
  let real: string;
  let realRoot: string;
  try {
    real = await fs.realpath(abs);
    realRoot = await fs.realpath(root);
  } catch {
    return null;
  }
  if (real !== realRoot && !real.startsWith(realRoot + path.sep)) return null;
  try {
    const stat = await fs.stat(real);
    if (!stat.isFile()) return null;
  } catch {
    return null;
  }
  return real;
}
