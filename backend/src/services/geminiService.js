import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeInjuryWithGemini = async (tipoLesion, diasClub) => {
  const prompt = `Actúa como un médico especialista en medicina deportiva. 
  Un futbolista sufre de la siguiente lesión: "${tipoLesion}". 
  El club estima una recuperación de ${diasClub} días. 
  Por favor responde strictly en formato JSON con la siguiente estructura:
  {
    "tiempo_clinico_ia": <número entero estimado de días de recuperación según literatura médica>,
    "analisis_comparativo": "<explicación breve de 2 párrafos comparando el tiempo del club con el criterio clínico>"
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });

  // Parsear la respuesta JSON de Gemini (SCRUM-36)
  const text = response.text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch[0]);
};