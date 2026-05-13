import chokidar from "chokidar";
import { RESEARCH_DIR } from "./loader";
import { syncAllDailyPacks } from "./sync";
import { log } from "../index";

let timer: NodeJS.Timeout | null = null;
let running = false;

function debounceSync() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(async () => {
    if (running) return;
    running = true;
    try {
      const report = await syncAllDailyPacks();
      log(`vault sync: built=${report.built} updated=${report.updated} skipped=${report.skipped} errors=${report.errors.length}`, "vault");
    } catch (e: any) {
      log(`vault sync error: ${e?.message || e}`, "vault");
    } finally {
      running = false;
    }
  }, 500);
}

export function startVaultWatcher(): void {
  log("watching VallartaVoxVault/11_Research/ for changes", "vault");
  const watcher = chokidar.watch(RESEARCH_DIR, {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
  });
  watcher.on("add", debounceSync);
  watcher.on("change", debounceSync);
  watcher.on("unlink", debounceSync);
}

export async function runBootSync(): Promise<void> {
  try {
    const report = await syncAllDailyPacks();
    log(`vault boot sync: built=${report.built} updated=${report.updated} skipped=${report.skipped} errors=${report.errors.length}`, "vault");
  } catch (e: any) {
    log(`vault boot sync error: ${e?.message || e}`, "vault");
  }
}
