const BASE_URL = "http://localhost:4000/api";

export const api = {
  // 1. Buscar o registrar jugador
  buscarJugador: async (nombre) => {
    const response = await fetch(
      `${BASE_URL}/players/search?name=${encodeURIComponent(nombre)}`,
    );

    if (!response.ok) {
      throw new Error("Error en el servidor al buscar el futbolista.");
    }

    const data = await response.json();

    // Si el backend responde con un array vacío o un objeto nulo
    if (!data || (Array.isArray(data) && data.length === 0)) {
      throw new Error("No se encontró ningún futbolista con ese nombre.");
    }

    // Retornamos la data cruda. Si es un array, enviamos el primer elemento.
    if (Array.isArray(data)) {
      return data[0];
    }

    return data;
  },

  // 2. Enviar la lesión a la IA
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

    return response.json();
  },
};
