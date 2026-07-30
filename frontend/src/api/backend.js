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

  // 3. GET /api/players/leagues (Obtener catálogo de ligas)
  obtenerLigas: async () => {
    const response = await fetch(`${BASE_URL}/players/leagues`);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener las ligas.");
    }
    return response.json();
  },

  // 4. POST /api/players (Crear futbolista local)
  crearJugadorLocal: async (datos) => {
    const response = await fetch(`${BASE_URL}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al registrar el futbolista.");
    }
    return response.json();
  },

  // 5. GET /api/players/positions (Obtener catálogo de posiciones)
  obtenerPosiciones: async () => {
    const response = await fetch(`${BASE_URL}/players/positions`);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener las posiciones.");
    }
    return response.json();
  },

  // 6. GET /api/players/clubs (Obtener catálogo de clubes, opcionalmente filtrados por liga)
  obtenerClubes: async (ligaNombre) => {
    const url = ligaNombre
      ? `${BASE_URL}/players/clubs?leagueName=${encodeURIComponent(ligaNombre)}`
      : `${BASE_URL}/players/clubs`;
    const response = await fetch(url);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener los clubes.");
    }
    return response.json();
  },
};
