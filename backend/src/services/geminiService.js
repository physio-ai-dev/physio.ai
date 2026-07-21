import { GoogleGenAI } from "@google/genai";

// Inicializa el SDK usando la variable de entorno
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Genera un dictamen médico deportivo usando Gemini 2.5 Flash
 * @param {string} tipoLesion - Tipo de lesión (Ej. Rotura de menisco)
 * @param {number} diasClub - Días de baja estimados por el staff médico del club
 */
export const analyzeInjuryWithGemini = async (tipoLesion, diasClub) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "Falta la variable de entorno GEMINI_API_KEY en el backend.",
      );
    }

    const prompt = `Eres un experto de élite en medicina deportiva y fisioterapia de futbolistas de alto rendimiento que trabaja para clubes de la UEFA Champions League. 
  Analiza de forma concisa pero rigurosa el siguiente reporte médico preliminar:
  
  - **Tipo de Lesión:** ${tipoLesion}
  - **Días de baja estimados por el club:** ${diasClub} días.

  Genera un dictamen clínico comparativo estructurado estrictamente en tres secciones breves. Usa viñetas limpias y evita explicaciones genéricas:

  ### 1. Fisiopatología de la Lesión
  * Explica brevemente el mecanismo anatómico/fisiológico de la lesión (fibras, tendones o articulaciones afectadas) en el contexto de las demandas biomecánicas de un futbolista profesional (desaceleraciones, giros, sprints).

  ### 2. Evaluación Crítica del Plazo (${diasClub} días)
  * Clasifica el plazo del club explícitamente como: [REALISTA], [OPTIMISTA] o [MUY CONSERVADOR].
  * Argumenta tu clasificación basándote en los tiempos promedio de la literatura médica moderna y el riesgo de recaída si se acelera el proceso.

  ### 3. Protocolo de Readaptación en Campo
  * Detalla 3 fases clave para el regreso seguro al césped (Return to Play - RTP): terapia/fisioterapia inicial, fortalecimiento funcional específico y plazos seguros para la reincorporación al grupo.

  ---
  IMPORTANTE: Finaliza tu respuesta incluyendo de forma exacta y obligatoria la siguiente línea en una línea nueva al final de todo el texto, estimando objetivamente el número entero de días según tu criterio médico:
  [PROMEDIO_IA: X]`;

    // Llamada oficial al modelo recomendado para tareas generales y rápidas
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });

    const textoAnalisis = response.text;

    // Expresión regular para extraer el número de días del marcador [PROMEDIO_IA: X]
    const match = textoAnalisis.match(/\[PROMEDIO_IA:\s*(\d+)\]/);
    let tiempoClinicoIa = Math.round(Number(diasClub) * 1.1); // Respaldo matemático por si el regex falla

    if (match && match[1]) {
      tiempoClinicoIa = parseInt(match[1], 10);
    }

    // Limpiamos el marcador del texto final para que la interfaz se vea impecable
    const analisisLimpio = textoAnalisis
      .replace(/\[PROMEDIO_IA:\s*\d+\]/, "")
      .trim();

    return {
      analisis_comparativo: analisisLimpio,
      tiempo_clinico_ia: tiempoClinicoIa,
    };
  } catch (error) {
    console.error("Error crítico en la conexión con Gemini Engine:", error);
    throw new Error(
      `Fallo en el servicio de Inteligencia Artificial: ${error.message}`,
    );
  }
};
