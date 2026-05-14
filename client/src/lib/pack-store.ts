import { idbDelete, idbGet, idbGetAll, idbPut } from "./idb";

export type TripPack = {
  version: number;
  locale: string;
  scope: { interests: string[]; size: string };
  generatedAt: string;
  personaBrief: string;
  translations: { en: string; es: string; topic: string }[];
  vocabulary: { spanish: string; english: string; partOfSpeech: string; topic: string }[];
  situations: { name: string; phrases: { es: string; en: string }[] }[];
  slang: { term: string; meaning: string; usage: string }[];
  verbs: { spanish: string; english: string; conjugations: Record<string, Record<string, string>> }[];
};

type StoredPack = TripPack & { id: string };

const ACTIVE_KEY = "active-pack-id";

export async function savePack(pack: TripPack): Promise<StoredPack> {
  const id = `${pack.locale}-${Date.now()}`;
  const stored: StoredPack = { ...pack, id };
  await idbPut("packs", stored);
  await idbPut("kv", id, ACTIVE_KEY);
  return stored;
}

export async function listPacks(): Promise<StoredPack[]> {
  return await idbGetAll<StoredPack>("packs");
}

export async function getActivePack(): Promise<StoredPack | undefined> {
  const id = await idbGet<string>("kv", ACTIVE_KEY);
  if (!id) return undefined;
  return await idbGet<StoredPack>("packs", id);
}

export async function setActivePack(id: string): Promise<void> {
  await idbPut("kv", id, ACTIVE_KEY);
}

export async function removePack(id: string): Promise<void> {
  await idbDelete("packs", id);
  const active = await idbGet<string>("kv", ACTIVE_KEY);
  if (active === id) await idbDelete("kv", ACTIVE_KEY);
}

// ---- offline answer resolver --------------------------------------------

export type PackAnswer = {
  source: "pack";
  confidence: "high" | "medium" | "low";
  text: string;
  details?: any;
};

function norm(s: string) {
  return s.toLowerCase().trim().replace(/[¿?¡!.,;:]/g, "");
}

export function lookupInPack(pack: TripPack, query: string): PackAnswer | undefined {
  const q = norm(query);
  if (!q) return undefined;

  const exactTrans = pack.translations.find(
    (t) => norm(t.en) === q || norm(t.es) === q
  );
  if (exactTrans) {
    return {
      source: "pack",
      confidence: "high",
      text: norm(exactTrans.en) === q ? exactTrans.es : exactTrans.en,
      details: exactTrans,
    };
  }

  const exactVocab = pack.vocabulary.find(
    (v) => norm(v.spanish) === q || norm(v.english) === q
  );
  if (exactVocab) {
    return {
      source: "pack",
      confidence: "high",
      text: norm(exactVocab.spanish) === q ? exactVocab.english : exactVocab.spanish,
      details: exactVocab,
    };
  }

  const verb = pack.verbs.find((v) => norm(v.spanish) === q || norm(v.english) === q);
  if (verb) {
    return {
      source: "pack",
      confidence: "high",
      text: `${verb.spanish} — ${verb.english} (full conjugation in pack)`,
      details: verb,
    };
  }

  const partialTrans = pack.translations.find(
    (t) => norm(t.en).includes(q) || norm(t.es).includes(q)
  );
  if (partialTrans) {
    return {
      source: "pack",
      confidence: "medium",
      text: `Closest match in pack: "${partialTrans.es}" — "${partialTrans.en}"`,
      details: partialTrans,
    };
  }

  const partialVocab = pack.vocabulary.find(
    (v) => norm(v.spanish).includes(q) || norm(v.english).includes(q)
  );
  if (partialVocab) {
    return {
      source: "pack",
      confidence: "low",
      text: `${partialVocab.spanish} — ${partialVocab.english}`,
      details: partialVocab,
    };
  }

  return undefined;
}
