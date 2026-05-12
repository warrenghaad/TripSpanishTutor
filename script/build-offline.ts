/**
 * Builds the static client bundle only (no server).
 * Output: dist/public/ — host this directory on any static host
 * (Netlify, Cloudflare Pages, GitHub Pages, plain nginx, etc.) and
 * the PWA + service worker will serve the app shell offline.
 *
 * Note: Without a backend, the AI endpoints (chat/translate/lookup/etc)
 * will not work, BUT a previously-built Trip Pack stored in IndexedDB
 * will still answer queries via the offline resolver. To use this for a
 * truly disconnected device, build the pack online once first, then
 * deploy this static bundle.
 */
import { build as viteBuild } from "vite";
import { rm, writeFile } from "fs/promises";

async function main() {
  await rm("dist/public", { recursive: true, force: true });
  console.log("Building static client bundle for offline hosting…");
  await viteBuild();
  await writeFile(
    "dist/public/OFFLINE_README.txt",
    [
      "Vallarta Voz — offline static bundle",
      "",
      "Host this directory on any static host. The PWA will install and the",
      "service worker will cache the app shell so it works without a network.",
      "",
      "AI endpoints require a backend; without one, all assistance comes from",
      "the user's locally-saved Trip Pack (built once while online).",
      "",
      "Set OPENAI_API_KEY (or AI_INTEGRATIONS_OPENAI_API_KEY for Replit) on the",
      "server side if you also deploy `dist/index.cjs`.",
    ].join("\n"),
  );
  console.log("Done. Output: dist/public/");
}
main().catch((e) => { console.error(e); process.exit(1); });
