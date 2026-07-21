const BASE_URL = "http://localhost:4000/api";

export const api = {
  // 1. GET /api/players/search?name=...
  buscarJugador: async (nombre) => {
    const response = await fetch(
      `${BASE_URL}/players/search?name=${encodeURIComponent(nombre)}`,
    );
    if (!response.ok) throw new Error("Error al buscar el futbolista.");
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) return data[0];
    if (data && data.player) return data;
    throw new Error("No se encontró ningún futbolista con ese nombre.");
  },

  // 2. POST /api/ai/analyze
  analizarLesion: async (jugadorId, tipoLesion, diasClub) => {
    const response = await fetch(`${BASE_URL}/ai/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jugador_id: jugadorId,
        tipo_lesion: tipoLesion,
        dias_estimados_club: parseInt(diasClub, 10),
      }),
    });
    if (!response.ok)
      throw new Error("Error al procesar el análisis con Gemini.");
    return response.json();
  },
};
