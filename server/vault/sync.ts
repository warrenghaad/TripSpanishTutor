import { listResearchDates } from "./loader";
import { assembleDailyPack } from "./assembler";
import { writeDailyPackFile, moveIntegratedSources } from "./writer";
import { storage } from "../storage";
import type { SyncReport } from "./types";

/** Build / refresh day-packs for every dated folder under 11_Research/. */
export async function syncAllDailyPacks(): Promise<SyncReport> {
  const dates = await listResearchDates();
  const report: SyncReport = { built: 0, updated: 0, skipped: 0, errors: [], dates };
  for (const date of dates) {
    try {
      const pack = await assembleDailyPack(date);
      const totalEntries = pack.airport.length + pack.atelier.length + pack.bridge.length + pack.vocab.length + pack.grammar.length;
      if (totalEntries === 0 && pack.errors.length === 0) {
        report.skipped++;
        continue;
      }
      const result = await writeDailyPackFile(pack);
      if (result === "built") report.built++; else report.updated++;
      report.errors.push(...pack.errors);
      await moveIntegratedSources(date);
      try {
        const json = JSON.stringify(pack);
        await storage.recordPackManifest({
          locale: "vault-daily",
          scope: { date, sources: pack.sources.length, kind: "vault-daily-pack" },
          sizeBytes: json.length,
          version: pack.version,
        });
      } catch (manifestErr: any) {
        report.errors.push({ file: `manifest:${date}`, message: manifestErr?.message || String(manifestErr) });
      }
    } catch (e: any) {
      report.errors.push({ file: date, message: e?.message || String(e) });
    }
  }
  return report;
}
