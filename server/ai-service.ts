import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export type GrammarFeedback = {
  corrected: string;
  corrections: { original: string; fixed: string; explanation: string }[];
  vocab: { word: string; translation: string }[];
};

export type TranslationResult = {
  translation: string;
  alternatives?: string[];
};

export async function analyzeSpanishText(
  text: string,
  tenseFocus: string
): Promise<GrammarFeedback> {
  const tenseDescriptions: Record<string, string> = {
    present: "presente (present tense) - describing current actions or states",
    past: "pretérito (preterite/past tense) - completed past actions",
    future: "futuro simple (simple future) - actions that will happen",
    conditional: "condicional simple (conditional) - expressing wishes, polite requests, or hypotheticals (e.g., 'me gustaría', 'querría')",
    conditional_perfect: "condicional perfecto (conditional perfect) - expressing what would have happened (e.g., 'habría ido', 'habría hecho')"
  };

  const tenseDesc = tenseDescriptions[tenseFocus] || tenseFocus;

  const prompt = `You are a Spanish language tutor helping an English speaker practice Spanish for travel in Mexico.

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
  messages: { role: string; content: string }[]
): Promise<string> {
  const systemPrompt = `You are a friendly, encouraging Spanish language companion for Puerto Vallarta travel. Your name is "Vallarta Voz."

Your role:
- Help users learn travel Spanish with practical phrases
- Explain grammar concepts simply (especially verb tenses)
- Teach Mexican Spanish slang and cultural tips
- Practice conversations for real situations (taxis, hotels, restaurants, markets)
- Be warm, patient, and supportive — many learners have language anxiety

Always:
- Keep responses concise but helpful (2-4 sentences unless teaching something complex)
- Mix Spanish naturally into your responses with English translations
- Celebrate small wins and encourage practice
- Use simple vocabulary appropriate for beginners

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

export async function lookupWord(word: string): Promise<WordLookupResult> {
  const prompt = `Look up the word "${word}" (it could be English or Spanish).

Provide:
1. The Spanish word and English translation
2. Part of speech (noun, verb, adjective, adverb, phrase)
3. If it's a verb, provide full conjugation tables for: presente, pretérito, imperfecto, futuro, condicional
   - For each tense, provide: yo, tú, él/ella, nosotros, ellos/ustedes
4. 2-3 example sentences using the word (in Spanish with English translation)
5. 3-4 related words that a traveler would find useful

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
  "relatedWords": [{ "spanish": "...", "english": "..." }, ...]
}

If the word is not a verb, omit the conjugations field.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a Spanish-English dictionary specialized in Mexican Spanish for travelers. Always respond with valid JSON only." },
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
    };
  } catch (error) {
    console.error("Error looking up word:", error);
    throw new Error("Word lookup failed");
  }
}

export async function extractVocabulary(text: string): Promise<TextExtractionResult> {
  const prompt = `Analyze this text for a Spanish learner. The text may be in English, Spanish, or mixed.

Text:
"""
${text.substring(0, 3000)}
"""

Do two things:

1. VOCABULARY: Extract up to 20 of the most useful words and phrases for a Spanish learner traveling in Mexico. For each word:
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

export async function translateText(
  text: string,
  targetLang: string,
  preset: string,
  soften: boolean
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

  const prompt = `Translate the following text ${targetLang === "es" ? "from English to Spanish" : "from Spanish to English"}.

${presetInstructions[preset] || presetInstructions.general}
${softenNote}

Text: "${text}"

Respond in JSON format:
{
  "translation": "The translated text",
  ${soften ? '"alternatives": ["Alternative phrasing 1", "Alternative phrasing 2"]' : ''}
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional translator specializing in Mexican Spanish. Always respond with valid JSON only."
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
    return result as TranslationResult;
  } catch (error) {
    console.error("Error translating:", error);
    throw new Error("Translation failed");
  }
}
