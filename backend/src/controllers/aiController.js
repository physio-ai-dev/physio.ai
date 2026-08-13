import { analyzeInjuryWithGemini } from "../services/geminiService.js";

export const analyzeInjury = async (req, res) => {
  const { playerId, injuryType, estimatedDaysClub } = req.body;

  try {
    if (!playerId || !injuryType || !estimatedDaysClub) {
      return res
        .status(400)
        .json({ status: "error", message: "Faltan parámetros requeridos." });
    }

    const aiResult = await analyzeInjuryWithGemini(
      injuryType,
      estimatedDaysClub
    );

    const finalResponse = {
      playerId,
      injuryType,
      estimatedDaysClub,
      clinicalTimeAi: aiResult.clinical_time_ai,
      comparativeAnalysis: aiResult.comparative_analysis,
    };

    return res.status(200).json(finalResponse);
  } catch (error) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
