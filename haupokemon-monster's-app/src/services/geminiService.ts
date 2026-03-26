import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getMonsterDescription = async (monsterName: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide a short, technical field journal description for a monster named "${monsterName}" in a monster hunting game. Keep it under 50 words.`,
  });
  return response.text;
};
