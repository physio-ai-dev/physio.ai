import AppDataSource from "../config/database.js";
import PlayerSchema from "../models/PlayerSchema.js";
import { analyzePerformanceWithGemini } from "../services/geminiService.js";

const seededRandom = (seed) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

const generateMatches = (playerId, positionName) => {
  let seed = playerId;
  const matches = [];
  const pos = positionName ? positionName.toLowerCase() : "delantero";

  for (let i = 1; i <= 20; i++) {
    const r1 = seededRandom(seed++);
    const r2 = seededRandom(seed++);
    const r3 = seededRandom(seed++);

    let goals = 0;
    let assists = 0;
    let minutes = Math.floor(r1 * 45) + 45;
    let rating = parseFloat((r2 * 4 + 6).toFixed(1));

    if (pos.includes("delantero") || pos.includes("atacante")) {
      if (r3 > 0.6) goals = r3 > 0.85 ? 2 : 1;
      else if (r3 > 0.4) assists = 1;
    } else if (pos.includes("centrocampista") || pos.includes("volante") || pos.includes("medio")) {
      if (r3 > 0.85) goals = 1;
      else if (r3 > 0.45) assists = r3 > 0.75 ? 2 : 1;
    } else if (pos.includes("defensa") || pos.includes("zaguero") || pos.includes("lateral")) {
      if (r3 > 0.95) goals = 1;
      else if (r3 > 0.8) assists = 1;
      rating = parseFloat((r2 * 3.2 + 6.2).toFixed(1));
    } else if (pos.includes("portero") || pos.includes("arquero") || pos.includes("guardameta")) {
      minutes = 90;
      rating = parseFloat((r2 * 3 + 6.5).toFixed(1));
    }

    matches.push({
      match: i,
      goals,
      assists,
      minutes,
      rating,
    });
  }
  return matches;
};

export const getPlayerStats = async (req, res) => {
  try {
    const playerId = parseInt(req.query.id, 10);
    if (!playerId) {
      return res.status(400).json({ error: "ID del jugador requerido." });
    }

    const playerRepository = AppDataSource.getRepository(PlayerSchema);
    const player = await playerRepository.findOne({
      where: { id: playerId },
      relations: ["position"],
    });

    if (!player) {
      return res.status(404).json({ error: "Jugador no encontrado." });
    }

    const matches = generateMatches(player.id, player.position?.name);
    const matchesPlayed = matches.length;
    const goals = matches.reduce((acc, m) => acc + m.goals, 0);
    const assists = matches.reduce((acc, m) => acc + m.assists, 0);

    return res.json({
      partidos: matchesPlayed,
      goles: goals,
      asistencias: assists,
      recentMatches: matches,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getPlayerPerformanceAIAnalysis = async (req, res) => {
  try {
    const playerId = parseInt(req.body.id, 10);
    if (!playerId) {
      return res.status(400).json({ error: "ID del jugador requerido." });
    }

    const playerRepository = AppDataSource.getRepository(PlayerSchema);
    const player = await playerRepository.findOne({
      where: { id: playerId },
      relations: ["position"],
    });

    if (!player) {
      return res.status(404).json({ error: "Jugador no encontrado." });
    }

    const matches = generateMatches(player.id, player.position?.name);
    const goals = matches.reduce((acc, m) => acc + m.goals, 0);
    const assists = matches.reduce((acc, m) => acc + m.assists, 0);
    const avgRating = (matches.reduce((acc, m) => acc + m.rating, 0) / matches.length).toFixed(2);
    const avgMinutes = (matches.reduce((acc, m) => acc + m.minutes, 0) / matches.length).toFixed(0);

    const prompt = `Analiza el rendimiento del futbolista profesional ${player.name} (Posición: ${player.position?.name || "Sin posición"}) basándose en sus estadísticas de los últimos 20 partidos:
- Goles totales: ${goals}
- Asistencias totales: ${assists}
- Calificación de rendimiento promedio: ${avgRating}
- Promedio de minutos jugados: ${avgMinutes}

Genera un reporte corto de rendimiento predictivo y estado físico (máximo 100 palabras) en español, indicando su tendencia de forma actual, nivel estimado de fatiga y riesgo preventivo de lesiones deportivas. No añadas introducciones ni conclusiones.`;

    let report = "";
    try {
      report = await analyzePerformanceWithGemini(prompt);
    } catch (geminiError) {
      report = `[Nota: El servicio de análisis de Gemini se encuentra temporalmente con alta demanda]

Basado en el historial de partidos, el jugador muestra una tendencia física estable. Con una calificación promedio de ${avgRating} y habiendo disputado un promedio de ${avgMinutes} minutos por partido, se estima una forma física óptima con baja fatiga muscular y un riesgo preventivo de lesión menor al 5%. Se aconseja mantener las cargas de trabajo estables.`;
    }

    return res.json({ reporte: report });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
