// Runtime API base URL resolution.
//
// In a normal browser session the app is served from the same origin as the
// API, so an empty base ("") makes fetch calls hit relative paths and
// everything just works.
//
// When the app runs inside the Capacitor iOS shell the webview loads
// bundled HTML from `capacitor://localhost`, which has no backend. We need
// to point fetches at the deployed Replit URL. The chosen URL is stored in
// `@capacitor/preferences` under the key `apiBaseUrl` so it can be edited
// from the in-app Settings screen without rebuilding.
//
// `DEFAULT_API_BASE_URL` is the build-time fallback baked into the app —
// set it via the `VITE_DEFAULT_API_BASE_URL` env var at build time, or
// leave it blank to force the user to configure on first launch.

import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";

const DEFAULT_API_BASE_URL =
  (import.meta.env.VITE_DEFAULT_API_BASE_URL as string | undefined) || "";

const STORAGE_KEY = "apiBaseUrl";
const VAULT_KEY_STORAGE = "vaultApiKey";

let cached: string | null = null;
let cachedVaultKey: string | null = null;

function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

export async function getApiBaseUrl(): Promise<string> {
  if (cached !== null) return cached;
  if (!isNative()) {
    cached = "";
    return cached;
  }
  const { value } = await Preferences.get({ key: STORAGE_KEY });
  cached = value || DEFAULT_API_BASE_URL;
  return cached;
}

export async function setApiBaseUrl(url: string): Promise<void> {
  const trimmed = url.replace(/\/+$/, "");
  cached = trimmed;
  if (isNative()) {
    await Preferences.set({ key: STORAGE_KEY, value: trimmed });
  }
}

/**
 * Prefix a relative API path with the runtime base URL when running on
 * native. Web/dev keeps relative paths so the dev server proxy still works.
 */
export async function apiUrl(path: string): Promise<string> {
  if (/^https?:\/\//i.test(path)) return path;
  const base = await getApiBaseUrl();
  if (!base) return path;
  return base + (path.startsWith("/") ? path : "/" + path);
}

/** Synchronous variant for code paths that have already primed the cache. */
export function apiUrlSync(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (!cached) return path;
  return cached + (path.startsWith("/") ? path : "/" + path);
}

export function isCapacitorNative(): boolean {
  return isNative();
}

// Optional shared secret for the vault endpoints. When the backend has
// `VAULT_API_KEY` set, every /api/vault/* request must carry the matching
// `X-Vault-Key` header. Stored in Preferences so it persists across launches.
export async function getVaultApiKey(): Promise<string> {
  if (cachedVaultKey !== null) return cachedVaultKey;
  if (!isNative()) {
    cachedVaultKey = "";
    return cachedVaultKey;
  }
  const { value } = await Preferences.get({ key: VAULT_KEY_STORAGE });
  cachedVaultKey = value || "";
  return cachedVaultKey;
}

export async function setVaultApiKey(key: string): Promise<void> {
  cachedVaultKey = key;
  if (isNative()) {
    await Preferences.set({ key: VAULT_KEY_STORAGE, value: key });
  }
}

/** Build headers for vault requests, attaching the API key when set. */
export async function vaultHeaders(): Promise<Record<string, string>> {
  const key = await getVaultApiKey();
  return key ? { "X-Vault-Key": key } : {};
}
