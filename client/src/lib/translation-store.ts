import { idbDelete, idbGet, idbGetAll, idbPut } from "./idb";

export type LocalGrammarNote = { term: string; note: string };
export type LocalSuggestedTransform = { id: string; label: string };

export type LocalPackMatch = {
  kind: "translation" | "vocab" | "verb" | "phrase";
  text: string;
  confidence: "high" | "medium" | "low";
  detail?: string;
};

export type LocalTranslationCard = {
  id: number;
  localId: string;
  serverId?: number;
  createdAt: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  translatedText: string;
  literalText?: string;
  grammarNotes: LocalGrammarNote[];
  detectedVerbs: string[];
  detectedAdjectives: string[];
  detectedAdverbs: string[];
  suggestedTransforms: LocalSuggestedTransform[];
  tags: string[];
  saved: boolean;
  conversationId?: number | null;
  journalEntryId?: number | null;
  /** Direction the user originally chose (auto|en-es|es-en); replayed on retry. */
  originalDirection?: "auto" | "en-es" | "es-en";
  /** Mirror of seeded journal entry's text for fully-offline review. */
  journalArtifact?: { id: number; correctedText: string; createdAt: string } | null;
  /** Words actually saved to the vocabulary list (used for client-side dedupe). */
  savedVocabulary?: string[];
  status: "completed" | "queued_offline" | "failed";
  /** Free-form note attached to a queued offline card by the user. */
  queuedNote?: string;
  locale?: string | null;
  packMatches?: LocalPackMatch[];
};

const STORE = "kv";
const PREFIX = "tc:";

function genId(): number {
  return Date.now() + Math.floor(Math.random() * 1000);
}

export async function saveLocalCard(
  card: Omit<LocalTranslationCard, "localId" | "id" | "createdAt"> & { id?: number; createdAt?: string },
): Promise<LocalTranslationCard> {
  const id = card.id ?? genId();
  const localId = `${PREFIX}${id}`;
  const full: LocalTranslationCard = {
    ...card,
    id,
    localId,
    createdAt: card.createdAt ?? new Date().toISOString(),
  };
  await idbPut(STORE, full, localId);
  return full;
}

export async function listLocalCards(): Promise<LocalTranslationCard[]> {
  const all = await idbGetAll<LocalTranslationCard | undefined>(STORE);
  const cards = all.filter(
    (v): v is LocalTranslationCard =>
      !!v && typeof v === "object" && typeof v.localId === "string" && v.localId.startsWith(PREFIX),
  );
  return cards.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getLocalCard(id: number): Promise<LocalTranslationCard | undefined> {
  return await idbGet<LocalTranslationCard>(STORE, `${PREFIX}${id}`);
}

export async function updateLocalCard(
  id: number,
  patch: Partial<LocalTranslationCard>,
): Promise<LocalTranslationCard | undefined> {
  const existing = await getLocalCard(id);
  if (!existing) return undefined;
  const updated: LocalTranslationCard = { ...existing, ...patch };
  await idbPut(STORE, updated, existing.localId);
  return updated;
}

export async function deleteLocalCard(id: number): Promise<void> {
  await idbDelete(STORE, `${PREFIX}${id}`);
}

export async function listQueuedCards(): Promise<LocalTranslationCard[]> {
  const all = await listLocalCards();
  return all.filter((c) => c.status === "queued_offline");
}

// Local conversation thread mirror -----------------------------------------

const CONV_PREFIX = "conv:";

export type LocalChatMessage = { role: "user" | "assistant" | "system"; content: string; createdAt: string };

export type LocalChatThread = {
  localId: string;
  cardId: number;
  conversationId?: number;
  messages: LocalChatMessage[];
  updatedAt: string;
};

export async function loadLocalThread(cardId: number): Promise<LocalChatThread | undefined> {
  return await idbGet<LocalChatThread>(STORE, `${CONV_PREFIX}${cardId}`);
}

export async function saveLocalThread(
  thread: Omit<LocalChatThread, "localId" | "updatedAt"> & { updatedAt?: string },
): Promise<LocalChatThread> {
  const localId = `${CONV_PREFIX}${thread.cardId}`;
  const full: LocalChatThread = { ...thread, localId, updatedAt: thread.updatedAt ?? new Date().toISOString() };
  await idbPut(STORE, full, localId);
  return full;
}

// Local sentence-grower trail mirror ---------------------------------------

const GROW_PREFIX = "grow:";

export type LocalGrowStep = {
  layer: string;
  transformedText: string;
  translatedText: string;
  note: string;
  createdAt: string;
};

export type LocalGrowTrail = {
  localId: string;
  cardId: number;
  steps: LocalGrowStep[];
  updatedAt: string;
};

export async function loadLocalGrowTrail(cardId: number): Promise<LocalGrowTrail | undefined> {
  return await idbGet<LocalGrowTrail>(STORE, `${GROW_PREFIX}${cardId}`);
}

export async function saveLocalGrowTrail(cardId: number, steps: LocalGrowStep[]): Promise<LocalGrowTrail> {
  const localId = `${GROW_PREFIX}${cardId}`;
  const trail: LocalGrowTrail = { localId, cardId, steps, updatedAt: new Date().toISOString() };
  await idbPut(STORE, trail, localId);
  return trail;
}
