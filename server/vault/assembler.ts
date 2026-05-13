import path from "path";
import {
  loadResearchDate, loadLearnerProfileExcerpt, loadRecentWordlens, loadRecentGrammar,
} from "./loader";
import type {
  DailyPack, ParsedFile, AirportEntry, AtelierEntry, BridgeEntry,
  VocabPackEntry, GrammarNoteEntry,
} from "./types";

function titleFromSlug(slug: string): string {
  return slug.replace(/^[a-z]+-/, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseVocabPackBody(body: string): { front: string; back: string; note?: string }[] {
  // Each item: a "- **front:** … / **back:** … / **note:** …" group.
  const items: { front: string; back: string; note?: string }[] = [];
  // Split on blank lines.
  const blocks = body.split(/\n\s*\n/);
  for (const b of blocks) {
    const front = b.match(/\*\*front:\*\*\s*(.+)/i)?.[1]?.trim();
    const back = b.match(/\*\*back:\*\*\s*(.+)/i)?.[1]?.trim();
    const note = b.match(/\*\*note:\*\*\s*(.+)/i)?.[1]?.trim();
    if (front && back) items.push({ front, back, note });
  }
  return items;
}

export async function assembleDailyPack(date: string): Promise<DailyPack> {
  const { parsed, errors } = await loadResearchDate(date);
  const [profile, words, grammar] = await Promise.all([
    loadLearnerProfileExcerpt(),
    loadRecentWordlens(),
    loadRecentGrammar(),
  ]);

  const airport: AirportEntry[] = [];
  const atelier: AtelierEntry[] = [];
  const bridge: BridgeEntry[] = [];
  const vocab: VocabPackEntry[] = [];
  const grammarEntries: GrammarNoteEntry[] = [];
  const sources: DailyPack["sources"] = [];

  const recordSource = (p: ParsedFile) =>
    sources.push({ path: p.relPath, kind: p.frontmatter.kind, status: p.frontmatter.status || "ready" });

  for (const p of parsed) {
    switch (p.frontmatter.kind) {
      case "airport-scenelet":
        airport.push({
          slug: p.slug,
          title: titleFromSlug(p.slug),
          tags: p.frontmatter.tags || [],
          sections: p.sections,
          sourcePath: p.relPath,
        });
        recordSource(p);
        break;
      case "atelier-entry":
        atelier.push({
          slug: p.slug,
          author: p.frontmatter.author || "Unknown",
          work: p.frontmatter.work,
          title: titleFromSlug(p.slug),
          sections: p.sections,
          sourcePath: p.relPath,
        });
        recordSource(p);
        break;
      case "bridge-note":
        if (p.bridgeHalves) {
          bridge.push({
            slug: p.slug,
            pairId: p.frontmatter.pair_id || p.slug,
            travel: p.bridgeHalves.travel,
            literary: p.bridgeHalves.literary,
            sourcePath: p.relPath,
          });
          recordSource(p);
        } else {
          // Surface the structural failure rather than silently dropping.
          errors.push({
            file: p.relPath,
            message: "bridge-note missing required `# Travel Half` and/or `# Literary Half` sections",
          });
        }
        break;
      case "vocab-pack":
        vocab.push({
          slug: p.slug,
          items: parseVocabPackBody(p.body),
          sourcePath: p.relPath,
        });
        recordSource(p);
        break;
      case "grammar-note":
        grammarEntries.push({
          slug: p.slug,
          title: titleFromSlug(p.slug),
          sections: p.sections,
          sourcePath: p.relPath,
        });
        recordSource(p);
        break;
      default:
        // day-pack, daily-prep, etc. are discovered but not assembled into
        // typed sections of the rendered pack — intentionally not counted in `sources`.
        break;
    }
  }

  return {
    version: 1,
    date,
    generatedAt: new Date().toISOString(),
    personalization: {
      learnerProfileExcerpt: profile,
      recentWords: words,
      recentGrammar: grammar,
    },
    airport, atelier, bridge, vocab, grammar: grammarEntries,
    sources, errors,
  };
}
