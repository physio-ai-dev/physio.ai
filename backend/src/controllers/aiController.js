import AppDataSource from "../config/database.js";
import { estimateInjuryRecovery } from "../services/geminiService.js";

export const analyzeInjury = async (req, res) => {
  try {
    const { jugador_id, tipo_lesion, dias_estimados_club } = req.body;

    // Validación de campos requeridos
    if (!jugador_id || !tipo_lesion) {
      return res.status(400).json({
        error: "Los campos 'jugador_id' y 'tipo_lesion' son obligatorios.",
      });
    }

    // 1. Obtener el análisis de Gemini
    const aiAnalysis = await estimateInjuryRecovery({
      injury: tipo_lesion,
      diasEstimadosClub: dias_estimados_club,
    });

    // 2. Obtener el repositorio de la entidad 'Injury' / 'Lesion'
    const injuryRepository = AppDataSource.getRepository("InjurySchema"); 

    // 3. Crear el objeto para guardar en PostgreSQL
    const nuevaLesion = injuryRepository.create({
      jugador_id,
      tipo_lesion,
      dias_estimados_club: dias_estimados_club || null,
      estimacion_ia: aiAnalysis.estimatedTimeText || `${aiAnalysis.estimatedDaysMin}-${aiAnalysis.estimatedDaysMax} días`,
      resumen_medico: aiAnalysis.medicalSummary,
      gravedad: aiAnalysis.severity,
      fecha_registro: new Date(),
    });

    // 4. Guardar en la base de datos
    const lesionGuardada = await injuryRepository.save(nuevaLesion);

    return res.status(201).json({
      message: "Análisis procesado y guardado en la base de datos.",
      lesion: lesionGuardada,
      analisis_ia: aiAnalysis,
    });

  } catch (error) {
    console.error("Error en analyzeInjury:", error);
    return res.status(500).json({
      error: "Error interno del servidor al procesar el análisis.",
    });
  }
};