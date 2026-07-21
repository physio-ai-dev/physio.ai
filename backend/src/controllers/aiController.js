import { analyzeInjuryWithGemini } from "../services/geminiService.js";
// Importa aquí tu repositorio o modelo de base de datos para registrar la auditoría si es necesario

export const analyzeInjury = async (req, res) => {
  const { jugador_id, tipo_lesion, dias_estimados_club } = req.body;

  try {
    if (!jugador_id || !tipo_lesion || !dias_estimados_club) {
      return res
        .status(400)
        .json({ status: "error", message: "Faltan parámetros requeridos." });
    }

    // Ejecuta el servicio que acabamos de configurar
    const resultadoIa = await analyzeInjuryWithGemini(
      tipo_lesion,
      dias_estimados_club,
    );

    // Armando la respuesta exacta que tu frontend mapea para la rúbrica
    const respuestaFinal = {
      jugador_id,
      tipo_lesion,
      dias_estimados_club,
      tiempo_clinico_ia: resultadoIa.tiempo_clinico_ia,
      analisis_comparativo: resultadoIa.analisis_comparativo,
    };

    // OPCIONAL: Guarda aquí en tu base de datos con TypeORM antes de responder
    // await reporteRepository.save(respuestaFinal);

    return res.status(200).json(respuestaFinal);
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
