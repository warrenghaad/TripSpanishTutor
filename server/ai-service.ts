import OpenAI from "openai";

const replitKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
const replitBase = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
const standardKey = process.env.OPENAI_API_KEY;

const apiKey = replitKey || standardKey;
const baseURL = replitKey ? replitBase : process.env.OPENAI_BASE_URL;

const aiMode = replitKey
  ? "replit-managed (AI_INTEGRATIONS_OPENAI_*)"
  : standardKey
  ? `standard OpenAI${baseURL ? ` (custom base: ${baseURL})` : ""}`
  : "DISABLED (no API key found)";

console.log(`[ai-service] mode: ${aiMode}`);

if (!apiKey) {
  console.warn(
    "[ai-service] No API key set. Provide AI_INTEGRATIONS_OPENAI_API_KEY (Replit) " +
    "or OPENAI_API_KEY (standard). All AI endpoints will fail until one is configured."
  );
}

const openai = new OpenAI({
  apiKey: apiKey || "missing-key-please-set-OPENAI_API_KEY",
  baseURL: baseURL || undefined,
});

export type GrammarFeedback = {
  corrected: string;
  corrections: { original: string; fixed: string; explanation: string }[];
  vocab: { word: string; translation: string }[];
};

export type TranslationResult = {
  translation: string;
  alternatives?: string[];
  localeNotes?: string[];
};

const localeDescriptions: Record<string, string> = {
  "neutral": "Use standard, textbook Spanish without any regional slang or colloquialisms.",
  "puerto-vallarta": "Use the Spanish spoken in Puerto Vallarta / Jalisco, Mexico. Incorporate local slang like 'güey', 'chido', 'neta', 'a toda madre', 'órale' where natural. Use Mexican Spanish grammar and expressions.",
  "mexico-city": "Use the Spanish spoken in Mexico City (chilango). Incorporate slang like 'chido', 'neta', 'órale', 'chamba', 'naco', 'padre' where natural. Use Mexican Spanish grammar and expressions.",
  "oaxaca": "Use the Spanish spoken in Oaxaca, Mexico. Incorporate regional expressions like 'mano', 'compa', and Oaxacan turns of phrase where natural. Use Mexican Spanish grammar.",
  "colombia": "Use Colombian Spanish. Incorporate Colombian slang like 'parcero/parce', 'bacano', 'chevere', '¿qué más?', 'listo', 'marica' (casual) where natural. Use 'usted' more commonly as Colombians do.",
  "argentina": "Use Argentine Rioplatense Spanish. Use 'vos' instead of 'tú' with voseo conjugations. Incorporate slang like 'che', 'boludo', 're', 'bárbaro', 'piola', 'morfar', 'laburo' where natural.",
  "spain": "Use Peninsular Spanish from Spain. Use 'vosotros' for plural you. Incorporate slang like 'tío/tía', 'vale', 'mola', 'guay', 'currar', 'flipar' where natural. Use 'z' and 'c' pronunciation hints.",
  "cuba": "Use Cuban Spanish. Incorporate Cuban slang like 'asere', '¿qué bolá?', 'dale', 'tremendo', 'jama', 'guagua' (bus) where natural. Use Cuban speech patterns.",
};

function getLocalePromptSegment(locale?: string): string {
  if (!locale) return "";
  if (locale === "neutral") {
    return `\n\nIMPORTANT LOCALE INSTRUCTION: ${localeDescriptions["neutral"]} Do not use any regional slang, colloquialisms, or informal expressions. Stick to universally understood, formal Spanish.`;
  }
  const desc = localeDescriptions[locale];
  if (!desc) return "";
  return `\n\nIMPORTANT LOCALE INSTRUCTION: ${desc}\nWhenever you use a locale-specific slang word or idiom, include a brief note explaining it (e.g., "'Chido' is Jalisco slang for 'cool'").`;
}

export async function analyzeSpanishText(
  text: string,
  tenseFocus: string,
  locale?: string
): Promise<GrammarFeedback> {
  const tenseDescriptions: Record<string, string> = {
    present: "presente (present tense) - describing current actions or states",
    past: "pretérito (preterite/past tense) - completed past actions",
    future: "futuro simple (simple future) - actions that will happen",
    conditional: "condicional simple (conditional) - expressing wishes, polite requests, or hypotheticals (e.g., 'me gustaría', 'querría')",
    conditional_perfect: "condicional perfecto (conditional perfect) - expressing what would have happened (e.g., 'habría ido', 'habría hecho')"
  };

  const tenseDesc = tenseDescriptions[tenseFocus] || tenseFocus;

  const localeSegment = getLocalePromptSegment(locale);

  const prompt = `You are a Spanish language tutor helping an English speaker practice Spanish.${localeSegment}

The student is focusing on practicing the ${tenseDesc}.

Student's mixed English/Spanish entry: "${text}"

The student may have written in a mix of English and Spanish. Your job:
1. RECOGNIZE any Spanish they used correctly - acknowledge what they got right
2. CORRECT any Spanish mistakes they made (wrong conjugation, spelling, grammar)
3. CONVERT any English words/phrases to Spanish, showing them what they could have said
4. Create a FULLY SPANISH version of their entry using the ${tenseDesc}
5. Provide a mini-lesson on verb conjugations they used or could use in this tense

For corrections, include:
- Spanish mistakes they made and how to fix them
- English phrases and their Spanish equivalents (as learning opportunities, not errors)

Respond in JSON format:
{
  "corrected": "The fully corrected ALL-SPANISH version of their entry",
  "corrections": [
    {
      "original": "what they wrote (English or incorrect Spanish)",
      "fixed": "correct Spanish version",
      "explanation": "Brief explanation - praise if they got it right, teach if it's new or corrected"
    }
  ],
  "vocab": [
    {
      "word": "Spanish word with article if noun",
      "translation": "English translation"
    }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful Spanish language tutor. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);
    return result as GrammarFeedback;
  } catch (error) {
    console.error("Error analyzing Spanish text:", error);
    throw new Error("Failed to analyze text");
  }
}

export async function chatWithAssistant(
  messages: { role: string; content: string }[],
  locale?: string
): Promise<string> {
  const localeSegment = getLocalePromptSegment(locale);

  const systemPrompt = `You are a friendly, encouraging Spanish language companion. Your name is "Vallarta Voz."
${localeSegment}
Your role:
- Help users learn travel Spanish with practical phrases
- Explain grammar concepts simply (especially verb tenses)
- Teach regional slang and cultural tips appropriate to the locale
- Practice conversations for real situations (taxis, hotels, restaurants, markets)
- Be warm, patient, and supportive — many learners have language anxiety

Always:
- Keep responses concise but helpful (2-4 sentences unless teaching something complex)
- Mix Spanish naturally into your responses with English translations
- Celebrate small wins and encourage practice
- Use simple vocabulary appropriate for beginners
- When using locale-specific slang, briefly explain the term

If asked to translate, provide the translation with a brief note on usage or grammar if helpful.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const content = completion.choices[0].message.content;
    return content || "Lo siento, I couldn't respond. Please try again!";
  } catch (error) {
    console.error("Error in chat:", error);
    throw new Error("Chat failed");
  }
}

export type WordLookupResult = {
  spanish: string;
  english: string;
  partOfSpeech: string;
  conjugations?: Record<string, Record<string, string>>;
  examples: string[];
  relatedWords: { spanish: string; english: string }[];
  localeNotes?: string[];
};

export type GrammarPattern = {
  pattern: string;
  tense: string;
  frequency: string;
  example: string;
  lesson: string;
};

export type TextExtractionResult = {
  words: {
    spanish: string;
    english: string;
    partOfSpeech: string;
    context: string;
  }[];
  grammarPatterns: GrammarPattern[];
};

export async function lookupWord(word: string, direction?: string, locale?: string): Promise<WordLookupResult> {
  const directionHint = direction === "es-en"
    ? `The user typed "${word}" in Spanish. Provide its English translation and full Spanish details.`
    : direction === "en-es"
    ? `The user typed "${word}" in English. Provide its Spanish translation and full Spanish details.`
    : `The user typed "${word}" (it could be English or Spanish). Determine the language and provide the translation.`;

  const localeSegment = getLocalePromptSegment(locale);

  const prompt = `${directionHint}
${localeSegment}

Provide:
1. The Spanish word and English translation
2. Part of speech (noun, verb, adjective, adverb, phrase)
3. If it's a verb, provide full conjugation tables for: presente, pretérito, imperfecto, futuro, condicional
   - For each tense, provide: yo, tú, él/ella, nosotros, ellos/ustedes
4. 2-3 example sentences using the word (in Spanish with English translation), using locale-appropriate phrasing
5. 3-4 related words that a traveler would find useful, including any locale-specific synonyms or slang equivalents

Respond in JSON:
{
  "spanish": "the Spanish word (infinitive if verb)",
  "english": "English translation",
  "partOfSpeech": "verb|noun|adjective|adverb|phrase",
  "conjugations": {
    "presente": { "yo": "...", "tú": "...", "él": "...", "nosotros": "...", "ellos": "..." },
    "pretérito": { ... },
    "imperfecto": { ... },
    "futuro": { ... },
    "condicional": { ... }
  },
  "examples": ["Spanish sentence — English translation", ...],
  "relatedWords": [{ "spanish": "...", "english": "..." }, ...],
  "localeNotes": ["Brief note for each locale-specific slang/idiom used in examples or related words, e.g. \\"'Che' is Argentine slang used as a friendly interjection\\". Return empty array if no locale-specific terms were used."]
}

If the word is not a verb, omit the conjugations field.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `You are a Spanish-English dictionary specialized in ${locale && locale !== "neutral" ? "regional" : "general"} Spanish for travelers. Always respond with valid JSON only.` },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No response");
    const parsed = JSON.parse(content);
    return {
      spanish: parsed.spanish || "",
      english: parsed.english || "",
      partOfSpeech: parsed.partOfSpeech || "unknown",
      conjugations: parsed.conjugations || undefined,
      examples: Array.isArray(parsed.examples) ? parsed.examples : [],
      relatedWords: Array.isArray(parsed.relatedWords) ? parsed.relatedWords : [],
      localeNotes: Array.isArray(parsed.localeNotes) ? parsed.localeNotes.filter((n: string) => n && n.length > 0) : undefined,
    };
  } catch (error) {
    console.error("Error looking up word:", error);
    throw new Error("Word lookup failed");
  }
}

export async function extractVocabulary(text: string, locale?: string): Promise<TextExtractionResult> {
  const localeSegment = getLocalePromptSegment(locale);

  const prompt = `Analyze this text for a Spanish learner. The text may be in English, Spanish, or mixed.
${localeSegment}

Text:
"""
${text.substring(0, 3000)}
"""

Do two things:

1. VOCABULARY: Extract up to 20 of the most useful words and phrases for a Spanish learner. For each word:
   - The Spanish word (infinitive if verb, with article if noun)
   - English translation
   - Part of speech
   - A short context phrase showing usage

2. GRAMMAR PATTERNS: Identify up to 8 grammar patterns in the text — verb tenses used, sentence structures, common phrases, or recurring patterns. For each pattern:
   - Name the pattern (e.g., "present tense descriptions", "conditional wishes", "past narration")
   - Which tense it uses
   - How frequently it appears (e.g., "5 times", "throughout")
   - One example from the text
   - A brief lesson explaining how this pattern works in Spanish

Respond in JSON:
{
  "words": [
    {
      "spanish": "Spanish word",
      "english": "English translation",
      "partOfSpeech": "verb|noun|adjective|adverb|phrase",
      "context": "Short phrase showing how it was used"
    }
  ],
  "grammarPatterns": [
    {
      "pattern": "Name of the pattern",
      "tense": "Which tense",
      "frequency": "How often it appears",
      "example": "Example from the text",
      "lesson": "Brief explanation of how this works in Spanish"
    }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a vocabulary extraction tool for Spanish learners. Focus on practical, travel-useful words. Always respond with valid JSON only." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No response");
    const parsed = JSON.parse(content);
    return {
      words: Array.isArray(parsed.words) ? parsed.words : [],
      grammarPatterns: Array.isArray(parsed.grammarPatterns) ? parsed.grammarPatterns : [],
    };
  } catch (error) {
    console.error("Error extracting vocabulary:", error);
    throw new Error("Vocabulary extraction failed");
  }
}

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

export async function buildTripPack(
  locale: string,
  interests: string[],
  size: "small" | "medium" | "large" = "medium",
): Promise<TripPack> {
  const localeSegment = getLocalePromptSegment(locale);
  const counts = {
    small: { trans: 40, vocab: 60, situations: 6, slang: 12, verbs: 10 },
    medium: { trans: 80, vocab: 120, situations: 10, slang: 20, verbs: 18 },
    large: { trans: 150, vocab: 200, situations: 14, slang: 30, verbs: 25 },
  }[size];

  const prompt = `Build an offline Spanish "trip pack" for a traveler.
${localeSegment}

Traveler interests: ${interests.length ? interests.join(", ") : "general travel"}.

Generate a self-contained JSON intelligence pack the traveler can use OFFLINE when no network is available. Pack should be optimized for the most likely things this traveler will say, ask, or look up.

Include:
1. PERSONA BRIEF (1-2 sentences) — a compact description of how the offline assistant should sound (tone, locale).
2. TRANSLATIONS (${counts.trans} entries) — the most frequent phrases a traveler would need both directions, tagged by topic.
3. VOCABULARY (${counts.vocab} entries) — top words by frequency for the interests above + universal travel needs (food, beach, transit, money, medical, emergencies, lodging, greetings).
4. SITUATIONS (${counts.situations} entries) — named real-world scenarios with 5-8 ready-to-use phrase pairs each (taxi, restaurant, hotel check-in, pharmacy, beach rental, market haggling, lost item, asking directions, emergency, ordering coffee, art gallery, music venue).
5. SLANG (${counts.slang} entries) — locale-specific terms with meaning + usage example.
6. VERBS (${counts.verbs} entries) — most common verbs with full conjugations (presente, pretérito, imperfecto, futuro, condicional × yo/tú/él/nosotros/ellos).

Respond in JSON:
{
  "personaBrief": "...",
  "translations": [{ "en": "...", "es": "...", "topic": "food|beach|transit|money|medical|lodging|greetings|emergency|general" }],
  "vocabulary": [{ "spanish": "...", "english": "...", "partOfSpeech": "...", "topic": "..." }],
  "situations": [{ "name": "...", "phrases": [{ "es": "...", "en": "..." }] }],
  "slang": [{ "term": "...", "meaning": "...", "usage": "..." }],
  "verbs": [{ "spanish": "infinitive", "english": "...", "conjugations": { "presente": {"yo":"...","tú":"...","él":"...","nosotros":"...","ellos":"..."}, "pretérito": {...}, "imperfecto": {...}, "futuro": {...}, "condicional": {...} } }]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a precision travel-Spanish curator. Always respond with valid JSON only. Be exhaustive within the requested counts." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });
    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No response");
    const parsed = JSON.parse(content);
    return {
      version: 1,
      locale,
      scope: { interests, size },
      generatedAt: new Date().toISOString(),
      personaBrief: parsed.personaBrief || "",
      translations: Array.isArray(parsed.translations) ? parsed.translations : [],
      vocabulary: Array.isArray(parsed.vocabulary) ? parsed.vocabulary : [],
      situations: Array.isArray(parsed.situations) ? parsed.situations : [],
      slang: Array.isArray(parsed.slang) ? parsed.slang : [],
      verbs: Array.isArray(parsed.verbs) ? parsed.verbs : [],
    };
  } catch (error) {
    console.error("Error building trip pack:", error);
    throw new Error("Failed to build trip pack");
  }
}

export type TrailSummary = { summary: string; bullets: string[] };
export async function summarizeTrail(
  trailName: string,
  nodes: { kind: string; label: string; payload: unknown }[],
  locale?: string,
): Promise<TrailSummary> {
  const localeSegment = getLocalePromptSegment(locale);
  const compact = nodes.slice(0, 30).map((n, i) => `${i + 1}. [${n.kind}] ${n.label}`).join("\n");
  const prompt = `Summarize this Spanish-learning exploration trail named "${trailName}".
${localeSegment}

Trail steps:
${compact}

Respond in JSON:
{
  "summary": "2-3 sentence narrative paragraph of what was explored and learned",
  "bullets": ["concise bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5"]
}`;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You summarize learning trails. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });
    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No response");
    const parsed = JSON.parse(content);
    return {
      summary: parsed.summary || "",
      bullets: Array.isArray(parsed.bullets) ? parsed.bullets : [],
    };
  } catch (error) {
    console.error("Error summarizing trail:", error);
    throw new Error("Failed to summarize trail");
  }
}

export type NearbyDoor = { kind: string; label: string; seed: string; reason: string };
export async function nearbyDoors(
  trailName: string,
  nodes: { kind: string; label: string }[],
  locale?: string,
): Promise<NearbyDoor[]> {
  const localeSegment = getLocalePromptSegment(locale);
  const compact = nodes.slice(-15).map((n) => `[${n.kind}] ${n.label}`).join("\n");
  const prompt = `Given this recent exploration trail "${trailName}", suggest 6-8 "nearby doors" — natural next things to explore that branch from where the user is.
${localeSegment}

Recent steps:
${compact}

Each door should be one of: lookup (a Spanish word to look up), translation (a phrase to translate), grammar (a tense or grammar concept), situation (a scenario to practice), question (a curiosity to ask the chatbot).

Respond in JSON:
{
  "doors": [{ "kind": "lookup|translation|grammar|situation|question", "label": "short user-facing label", "seed": "the actual word/phrase/topic to feed into that tool", "reason": "1 sentence on why this is relevant" }]
}`;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You suggest learning paths. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No response");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed.doors) ? parsed.doors : [];
  } catch (error) {
    console.error("Error generating doors:", error);
    throw new Error("Failed to suggest doors");
  }
}

export type RichTranslation = {
  translatedText: string;
  literalText?: string;
  grammarNotes: { term: string; note: string }[];
  detectedVerbs: string[];
  detectedAdjectives: string[];
  detectedAdverbs: string[];
  suggestedTransforms: { id: string; label: string }[];
  /** Resolved language of the user's input, especially relevant for auto-detect. */
  resolvedSourceLanguage: "en" | "es";
  /** Resolved target language. */
  resolvedTargetLanguage: "en" | "es";
};

export async function translateRich(
  text: string,
  direction: "en-es" | "es-en" | "auto",
  locale?: string,
): Promise<RichTranslation> {
  const localeSegment = getLocalePromptSegment(locale);
  const dirInstr =
    direction === "en-es"
      ? "The user wrote English. Translate naturally to Spanish."
      : direction === "es-en"
      ? "The user wrote Spanish. Translate naturally to English."
      : "Auto-detect the language. If Spanish, translate to English. If English, translate to Spanish. If mixed, translate the whole thing into the target language (Spanish if mostly English, English if mostly Spanish).";

  const prompt = `You are a Spanish/English translator who also acts as a quick grammar coach.
${localeSegment}

${dirInstr}

User text:
"""
${text}
"""

Return strict JSON:
{
  "translatedText": "natural translation",
  "literalText": "literal/word-for-word version (only include if meaningfully different from natural; otherwise empty string)",
  "grammarNotes": [{ "term": "the Spanish word or pattern", "note": "1 short sentence on what it does grammatically" }],
  "detectedVerbs": ["spanish infinitive of every verb in the SPANISH side"],
  "detectedAdjectives": ["adjectives in the SPANISH side, lemma form"],
  "detectedAdverbs": ["adverbs in the SPANISH side"],
  "suggestedTransforms": [
    { "id": "past", "label": "Make it past tense" },
    { "id": "future", "label": "Make it future tense" },
    { "id": "casual", "label": "Make it more casual" },
    { "id": "poetic", "label": "Make it more poetic" }
  ],
  "resolvedSourceLanguage": "en or es — the language of the user's input you actually translated FROM",
  "resolvedTargetLanguage": "en or es — the language you translated INTO"
}`;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a precise translator and grammar coach. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });
    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No response");
    const parsed = JSON.parse(content);
    // Resolve direction: trust the model's self-report when given, otherwise
    // derive from the user's chosen direction so an EN→ES card never gets
    // labelled as ES→EN by accident.
    const normalizeLang = (v: unknown): "en" | "es" | null => {
      const s = typeof v === "string" ? v.trim().toLowerCase() : "";
      if (s === "en" || s.startsWith("eng")) return "en";
      if (s === "es" || s.startsWith("spa") || s === "español") return "es";
      return null;
    };
    const fallbackSrc: "en" | "es" =
      direction === "es-en" ? "es" : direction === "en-es" ? "en" : "en";
    const fallbackTgt: "en" | "es" =
      direction === "es-en" ? "en" : direction === "en-es" ? "es" : "es";
    const resolvedSourceLanguage =
      normalizeLang(parsed.resolvedSourceLanguage) ?? fallbackSrc;
    let resolvedTargetLanguage =
      normalizeLang(parsed.resolvedTargetLanguage) ?? fallbackTgt;
    // The two must differ; if the model returned the same on both, flip target.
    if (resolvedTargetLanguage === resolvedSourceLanguage) {
      resolvedTargetLanguage = resolvedSourceLanguage === "en" ? "es" : "en";
    }
    return {
      translatedText: parsed.translatedText || "",
      literalText: parsed.literalText || undefined,
      grammarNotes: Array.isArray(parsed.grammarNotes) ? parsed.grammarNotes : [],
      detectedVerbs: Array.isArray(parsed.detectedVerbs) ? parsed.detectedVerbs : [],
      detectedAdjectives: Array.isArray(parsed.detectedAdjectives) ? parsed.detectedAdjectives : [],
      detectedAdverbs: Array.isArray(parsed.detectedAdverbs) ? parsed.detectedAdverbs : [],
      suggestedTransforms: Array.isArray(parsed.suggestedTransforms) && parsed.suggestedTransforms.length
        ? parsed.suggestedTransforms
        : [
            { id: "past", label: "Make it past tense" },
            { id: "future", label: "Make it future tense" },
            { id: "casual", label: "Make it more casual" },
            { id: "poetic", label: "Make it more poetic" },
          ],
      resolvedSourceLanguage,
      resolvedTargetLanguage,
    };
  } catch (e) {
    console.error("translateRich failed:", e);
    throw new Error("Rich translation failed");
  }
}

export type SentenceTransformResult = {
  transformedText: string;
  translatedText: string;
  note: string;
};

export async function transformSentence(
  card: { sourceText: string; translatedText: string; sourceLanguage?: string | null; targetLanguage: string },
  transform: string,
  locale?: string,
): Promise<SentenceTransformResult> {
  const localeSegment = getLocalePromptSegment(locale);
  // Identify which side of the card actually holds the Spanish text. For
  // EN→ES cards the Spanish is `translatedText`; for ES→EN cards it is
  // `sourceText`. Operating on the wrong side would tense-shift English.
  const spanishIsSource = card.sourceLanguage === "es" || card.targetLanguage === "en";
  const spanishText = spanishIsSource ? card.sourceText : card.translatedText;
  const englishText = spanishIsSource ? card.translatedText : card.sourceText;
  const layerInstructions: Record<string, string> = {
    past: "Rewrite the Spanish sentence in the past tense (pretérito or imperfecto, choose what's natural).",
    future: "Rewrite the Spanish sentence in the future tense (use ir + a + infinitive AND simple future, pick the more natural one).",
    casual: "Rewrite the Spanish sentence in a more casual, conversational register, using locale-appropriate informalisms.",
    poetic: "Rewrite the Spanish sentence in a more poetic, evocative register.",
    subject: "Expand by making the subject richer and more specific.",
    verb: "Expand by adding a more vivid or precise verb (or stacking verbs).",
    object: "Expand by adding or enriching the object.",
    adjective: "Expand by adding one descriptive adjective that fits naturally.",
    adverb: "Expand by adding one adverb that adds nuance.",
    place: "Expand by adding a place phrase (en…, a…, hacia…).",
    time: "Expand by adding a time phrase (cuando…, ayer, mañana, mientras…).",
    reason: "Expand by adding a reason clause (porque…, ya que…, para…).",
    reflection: "Add a short reflective second clause that comments on the meaning.",
  };
  const instr = layerInstructions[transform] || `Apply this transformation: ${transform}`;
  const prompt = `Transform this Spanish sentence.
${localeSegment}

English meaning: "${englishText}"
Spanish: "${spanishText}"

Task: ${instr}

Return JSON:
{
  "transformedText": "the new Spanish sentence",
  "translatedText": "natural English translation of it",
  "note": "1 sentence explaining what changed grammatically"
}`;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You transform Spanish sentences for a learner. JSON only." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });
    const content = completion.choices[0].message.content;
    if (!content) throw new Error("no response");
    const parsed = JSON.parse(content);
    return {
      transformedText: parsed.transformedText || "",
      translatedText: parsed.translatedText || "",
      note: parsed.note || "",
    };
  } catch (e) {
    console.error("transformSentence failed:", e);
    throw new Error("Sentence transform failed");
  }
}

export type SeededCardForPrompt = {
  sourceText: string;
  translatedText: string;
  literalText?: string | null;
  grammarNotes?: { term: string; note: string }[] | null;
};

export function buildSeededSystemPrompt(
  card: SeededCardForPrompt,
  locale?: string,
): string {
  const localeSegment = getLocalePromptSegment(locale);
  const notes = Array.isArray(card.grammarNotes)
    ? card.grammarNotes.map((g) => `- ${g.term}: ${g.note}`).join("\n")
    : "";
  return `You are Vallarta Voz, a warm Spanish learning companion.
${localeSegment}

The user is studying this specific sentence right now:
- Original: "${card.sourceText}"
- Translation: "${card.translatedText}"
${card.literalText ? `- Literal: "${card.literalText}"` : ""}
${notes ? `Grammar notes already shown:\n${notes}` : ""}

Your first response MUST reference this sentence directly (don't start from zero). Help the user explore it: explain a verb, suggest a transformation, ask if they want to try a variation, or invite a related sentence. Keep it short, warm, encouraging, and practical.`;
}

export async function seededChatReply(
  card: SeededCardForPrompt,
  messages: { role: string; content: string }[],
  locale?: string,
): Promise<string> {
  const system = buildSeededSystemPrompt(card, locale);
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      ],
      temperature: 0.8,
      max_tokens: 400,
    });
    return completion.choices[0].message.content || "Lo siento, didn't catch that — try again?";
  } catch (e) {
    console.error("seededChatReply failed:", e);
    throw new Error("Seeded chat failed");
  }
}

export async function translateText(
  text: string,
  targetLang: string,
  preset: string,
  soften: boolean,
  locale?: string
): Promise<TranslationResult> {
  const presetInstructions: Record<string, string> = {
    general: "Translate naturally and accurately.",
    journal: "Use gentle, reflective first-person phrasing suitable for journaling. Keep the tone warm and self-compassionate.",
    travel: "Use practical travel phrases common in Mexico. Be direct and polite.",
    arts: "Use vocabulary appropriate for art galleries, museums, music venues, and cultural events."
  };

  const softenNote = soften 
    ? "\nAlso provide 1-2 'mindful alternatives' — softer, more self-compassionate phrasings that acknowledge feelings without harsh self-judgment. For example, 'I failed' → 'I'm learning and growing.'"
    : "";

  const localeSegment = getLocalePromptSegment(locale);

  const prompt = `Translate the following text ${targetLang === "es" ? "from English to Spanish" : "from Spanish to English"}.

${presetInstructions[preset] || presetInstructions.general}
${softenNote}
${localeSegment}

Text: "${text}"

Respond in JSON format:
{
  "translation": "The translated text",
  ${soften ? '"alternatives": ["Alternative phrasing 1", "Alternative phrasing 2"],' : ''}
  "localeNotes": ["Brief note for each locale-specific slang/idiom used, e.g. \\"'Chido' is Jalisco slang for 'cool'\\". Return empty array if no locale-specific terms were used."]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional translator specializing in ${locale && locale !== "neutral" ? "regional" : "general"} Spanish. Always respond with valid JSON only.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);
    return {
      translation: result.translation || "",
      alternatives: result.alternatives,
      localeNotes: Array.isArray(result.localeNotes) ? result.localeNotes.filter((n: string) => n && n.length > 0) : undefined,
    };
  } catch (error) {
    console.error("Error translating:", error);
    throw new Error("Translation failed");
  }
}
