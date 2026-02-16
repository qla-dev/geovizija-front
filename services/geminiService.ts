import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Fallback for safety, though env is expected

export const getArticleSummary = async (content: string): Promise<string> => {
  if (!apiKey) {
    return "API ključ nije dostupan. Molimo konfigurirajte API_KEY.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-3-flash-preview';
    const prompt = `Sažmi ovaj članak u 2-3 informativne rečenice na hrvatskom jeziku, ističući ključne ekološke činjenice. Zvuči kao znanstveni urednik:\n\n${content}`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Nije moguće generirati sažetak.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Došlo je do pogreške pri generiranju sažetka. Pokušajte ponovno kasnije.";
  }
};