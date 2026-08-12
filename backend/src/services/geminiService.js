import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeInjuryWithGemini = async (tipoLesion, diasClub) => {
  const prompt = `Actúa como un médico especialista en medicina deportiva de alto rendimiento.
  Un futbolista profesional ha sufrido la siguiente lesión: "${tipoLesion}".
  El cuerpo médico del club estima un tiempo de recuperación de ${diasClub} días.
  Compara esta estimación con la literatura médica científica y emite tu criterio clínico.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          tiempo_clinico_ia: {
            type: "INTEGER",
            description: "Número estimado de días de recuperación en promedio según literatura médica.",
          },
          analisis_comparativo: {
            type: "STRING",
            description: "Análisis comparativo estructurado en formato Markdown. Debe incluir obligatoriamente subtítulos usando '###' (ej: '### Análisis de la Estimación', '### Justificación Fisiológica', '### Criterios e Hitos para el Alta') y listas con viñetas ('-') para detallar hitos, recomendaciones o riesgos de recaída.",
          },
        },
        required: ["tiempo_clinico_ia", "analisis_comparativo"],
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
