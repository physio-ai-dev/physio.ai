import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeInjuryWithGemini = async (injuryType, clubDays) => {
  const prompt = `Actúa como un médico especialista en medicina deportiva de alto rendimiento.
  Un futbolista profesional ha sufrido la siguiente lesión: "${injuryType}".
  El cuerpo médico del club estima un tiempo de recuperación de ${clubDays} días.
  Compara esta estimación con la literatura médica científica y emite tu criterio clínico.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          clinical_time_ai: {
            type: "INTEGER",
            description: "Número estimado de días de recuperación en promedio según literatura médica.",
          },
          comparative_analysis: {
            type: "STRING",
            description: "Análisis comparativo estructurado en formato Markdown. Debe incluir obligatoriamente subtítulos usando '###' (ej: '### Análisis de la Estimación', '### Justificación Fisiológica', '### Criterios e Hitos para el Alta') y listas con viñetas ('-') para detallar hitos, recomendaciones o riesgos de recaída.",
          },
        },
        required: ["clinical_time_ai", "comparative_analysis"],
      },
    },
  });

  return JSON.parse(response.text);
};

export const analyzePerformanceWithGemini = async (prompt) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });
  return response.text;
};
