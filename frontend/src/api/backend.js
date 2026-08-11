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

  registrarSeleccion: async (id) => {
    let userEmail = "";
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        userEmail = userObj.email || "";
      } catch (e) {}
    }
    const response = await fetch(`${BASE_URL}/players/${id}/select`, {
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
};
