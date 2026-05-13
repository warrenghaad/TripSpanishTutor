export type VaultMode = "airport" | "atelier" | "bridge";

export type VaultKind =
  | "airport-scenelet"
  | "atelier-entry"
  | "bridge-note"
  | "vocab-pack"
  | "grammar-note"
  | "day-pack"
  | "daily-prep"
  | "daily-debrief"
  | "wordlens-entry"
  | "flashcard";

export type Frontmatter = {
  kind: VaultKind;
  date: string;
  locale?: string;
  mode?: VaultMode;
  tags?: string[];
  source?: string;
  status?: "draft" | "ready" | "integrated";
  author?: string;
  work?: string;
  pair_id?: string;
  [k: string]: any;
};

export type GoldenSections = {
  meaning?: string;
  literal?: string;
  natural?: string;
  grammarSkeleton?: string;
  practiceMove?: string;
  saveableCard?: string;
};

export type ParsedFile = {
  path: string;
  relPath: string;
  slug: string;
  frontmatter: Frontmatter;
  body: string;
  sections: GoldenSections;
  bridgeHalves?: { travel: GoldenSections; literary: GoldenSections };
};

export type SaveableCard = {
  front?: string;
  back?: string;
  note?: string;
};

export type AirportEntry = {
  slug: string;
  title: string;
  tags: string[];
  sections: GoldenSections;
  saveable?: SaveableCard;
  sourcePath: string;
};

export type AtelierEntry = {
  slug: string;
  author: string;
  work?: string;
  title: string;
  /** Lead text above the first `## Meaning` heading — typically the quoted literary line. */
  excerpt?: string;
  sections: GoldenSections;
  saveable?: SaveableCard;
  sourcePath: string;
};

export type BridgeEntry = {
  slug: string;
  pairId: string;
  travel: GoldenSections;
  literary: GoldenSections;
  travelSaveable?: SaveableCard;
  literarySaveable?: SaveableCard;
  sourcePath: string;
};

export type VocabPackEntry = {
  slug: string;
  items: { front: string; back: string; note?: string }[];
  sourcePath: string;
};

export type GrammarNoteEntry = {
  slug: string;
  title: string;
  sections: GoldenSections;
  sourcePath: string;
};

export type DailyPack = {
  version: 1;
  date: string;
  generatedAt: string;
  personalization: {
    learnerProfileExcerpt: string;
    recentWords: { word: string; gloss?: string }[];
    recentGrammar: { title: string }[];
  };
  airport: AirportEntry[];
  atelier: AtelierEntry[];
  bridge: BridgeEntry[];
  vocab: VocabPackEntry[];
  grammar: GrammarNoteEntry[];
  sources: { path: string; kind: VaultKind; status: string }[];
  errors: { file: string; message: string; line?: number; column?: number }[];
};

export type SyncReport = {
  built: number;
  updated: number;
  skipped: number;
  errors: { file: string; message: string; line?: number; column?: number }[];
  dates: string[];
};
