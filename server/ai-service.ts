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
