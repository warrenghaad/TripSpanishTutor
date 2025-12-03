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
  const prompt = `You are a Spanish language tutor helping an English speaker practice Spanish for travel in Mexico.

The student is focusing on practicing the ${tenseFocus} tense.

Student's text: "${text}"

Please:
1. Correct any grammar mistakes, especially related to verb conjugations in the ${tenseFocus} tense
2. Provide a polished Spanish version
3. Identify specific corrections made (original phrase → corrected phrase with explanation)
4. Extract 3-5 new vocabulary words from the corrected text that would be useful for travel

Respond in JSON format:
{
  "corrected": "The fully corrected Spanish text",
  "corrections": [
    {
      "original": "incorrect phrase",
      "fixed": "corrected phrase",
      "explanation": "Brief explanation of the grammar rule"
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
