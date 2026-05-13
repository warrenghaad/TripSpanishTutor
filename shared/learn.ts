export type GoldenSections = {
  meaning?: string;
  literal?: string;
  natural?: string;
  grammarSkeleton?: string;
  practiceMove?: string;
  saveableCard?: string;
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

export type LearnEmptyHint = { template: string; folder: string; message: string };

export type LearnAuthorGroup = { name: string; entries: AtelierEntry[] };

export type LearnModes = {
  generatedAt: string;
  airport: { entries: AirportEntry[]; empty: LearnEmptyHint };
  atelier: { authors: LearnAuthorGroup[]; empty: LearnEmptyHint };
  bridge: { entries: BridgeEntry[]; empty: LearnEmptyHint };
  errors: { file: string; message: string; line?: number; column?: number }[];
};
