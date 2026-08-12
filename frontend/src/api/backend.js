const BASE_URL = "http://localhost:4000/api";

const getHeaders = (extraHeaders = {}) => {
  const token = localStorage.getItem("token") || "";
  const headers = { ...extraHeaders };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  buscarJugador: async (nombre) => {
    let userEmail = "";
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        userEmail = userObj.email || "";
      } catch (e) {}
    }
    const response = await fetch(
      `${BASE_URL}/players/search?name=${encodeURIComponent(nombre)}`,
      {
        headers: getHeaders({
          "x-user-email": userEmail,
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al buscar el futbolista.");
    }

    return response.json();
  },

  analizarLesion: async (jugadorId, tipoLesion, diasClub) => {
    const response = await fetch(`${BASE_URL}/ai/analyze`, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
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

  obtenerLigas: async () => {
    const response = await fetch(`${BASE_URL}/players/leagues`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener las ligas.");
    }
    return response.json();
  },

  crearJugadorLocal: async (datos) => {
    const response = await fetch(`${BASE_URL}/players`, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(datos),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al registrar el futbolista.");
    }
    return response.json();
  },

  obtenerPosiciones: async () => {
    const response = await fetch(`${BASE_URL}/players/positions`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener las posiciones.");
    }
    return response.json();
  },

  obtenerClubes: async (ligaNombre) => {
    const url = ligaNombre
      ? `${BASE_URL}/players/clubs?leagueName=${encodeURIComponent(ligaNombre)}`
      : `${BASE_URL}/players/clubs`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener los clubes.");
    }
    return response.json();
  },

  registrarUsuario: async (datos) => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al realizar el registro de usuario.");
    }
    return response.json();
  },

  registrarSeleccion: async (id, tipo = "clinico") => {
    let userEmail = "";
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        userEmail = userObj.email || "";
      } catch (e) {}
    }
    const response = await fetch(`${BASE_URL}/players/${id}/select?tipo=${tipo}`, {
      method: "POST",
      headers: getHeaders({
        "x-user-email": userEmail,
      }),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al registrar selección.");
    }
    return response.json();
  },

  obtenerReporteClinico: async (id) => {
    const response = await fetch(`${BASE_URL}/players/${id}/audit-report`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener el reporte clínico.");
    }
    return response.json();
  },

  crearSesionStripe: async () => {
    const response = await fetch(`${BASE_URL}/stripe/create-checkout-session`, {
      method: "POST",
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al iniciar sesión de pago con Stripe.");
    }
    return response.json();
  },

  obtenerEstadisticas: async (jugadorId) => {
    const response = await fetch(`${BASE_URL}/stats?id=${jugadorId}`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener las estadísticas.");
    }
    return response.json();
  },

  obtenerAnalisisIA: async (jugadorId) => {
    const response = await fetch(`${BASE_URL}/analysis`, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ id: jugadorId }),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al generar el análisis de la IA.");
    }
    return response.json();
  },

  obtenerTopBuscados: async () => {
    const response = await fetch(`${BASE_URL}/players/reports/top-searched`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener el top de búsquedas.");
    }
    return response.json();
  },

  obtenerDetallesJugador: async (id) => {
    const response = await fetch(`${BASE_URL}/players/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener los detalles del futbolista.");
    }
    return response.json();
  },

  obtenerHistorialBusquedas: async () => {
    const response = await fetch(`${BASE_URL}/players/history`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener el historial de búsquedas.");
    }
    return response.json();
  },
};