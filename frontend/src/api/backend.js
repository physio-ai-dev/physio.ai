const BASE_URL = "http://localhost:4000/api";

export const api = {
  // 1. GET /api/players/search?name=...
  buscarJugador: async (nombre) => {
    const response = await fetch(
      `${BASE_URL}/players/search?name=${encodeURIComponent(nombre)}`,
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al buscar el futbolista.");
    }

    return response.json(); // Retorna el JSON crudo del backend
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

    if (!response.ok) {
      throw new Error("Error al procesar el análisis con Gemini.");
    }

    const data = await response.json();
    return data.lesion;
  },
};
