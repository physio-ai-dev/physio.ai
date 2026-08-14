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
  searchPlayer: async (name) => {
    let userEmail = "";
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        userEmail = userObj.email || "";
      } catch (e) {}
    }
    const response = await fetch(
      `${BASE_URL}/players/search?name=${encodeURIComponent(name)}`,
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

  analyzeInjury: async (playerId, injuryType, estimatedDaysClub) => {
    const response = await fetch(`${BASE_URL}/ai/analyze`, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        playerId,
        injuryType,
        estimatedDaysClub: parseInt(estimatedDaysClub, 10),
      }),
    });

    if (!response.ok) {
      throw new Error("Error al procesar el análisis con Gemini.");
    }

    return response.json();
  },

  getLeagues: async () => {
    const response = await fetch(`${BASE_URL}/players/leagues`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener las ligas.");
    }
    return response.json();
  },

  createLocalPlayer: async (data) => {
    const response = await fetch(`${BASE_URL}/players`, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al registrar el futbolista.");
    }
    return response.json();
  },

  getPositions: async () => {
    const response = await fetch(`${BASE_URL}/players/positions`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener las posiciones.");
    }
    return response.json();
  },

  getClubs: async (leagueName) => {
    const url = leagueName
      ? `${BASE_URL}/players/clubs?leagueName=${encodeURIComponent(leagueName)}`
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

  registerUser: async (data) => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al realizar el registro de usuario.");
    }
    return response.json();
  },

  recordSelection: async (id, type = "clinico") => {
    let userEmail = "";
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        userEmail = userObj.email || "";
      } catch (e) {}
    }
    const response = await fetch(`${BASE_URL}/players/${id}/select?tipo=${type}`, {
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

  getClinicalReport: async (id) => {
    const response = await fetch(`${BASE_URL}/players/${id}/audit-report`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener el reporte clínico.");
    }
    return response.json();
  },

  createStripeSession: async () => {
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

  getPlayerStats: async (playerId) => {
    const response = await fetch(`${BASE_URL}/stats?id=${playerId}`, {
      method: "GET",
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener las estadísticas.");
    }
    return response.json();
  },

  getPlayerPerformanceAnalysis: async (playerId) => {
    const response = await fetch(`${BASE_URL}/analysis`, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ id: playerId }),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al generar el análisis de la IA.");
    }
    return response.json();
  },

  getTopSearched: async () => {
    const response = await fetch(`${BASE_URL}/players/reports/top-searched`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener el top de búsquedas.");
    }
    return response.json();
  },

  getPlayerDetails: async (id) => {
    const response = await fetch(`${BASE_URL}/players/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener los detalles del futbolista.");
    }
    return response.json();
  },

  getSearchHistory: async () => {
    const response = await fetch(`${BASE_URL}/players/history`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener el historial de búsquedas.");
    }
    return response.json();
  },

  getAdminMetrics: async () => {
    const response = await fetch(`${BASE_URL}/admin/metrics`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Error al obtener las métricas administrativas.");
    }
    return response.json();
  },
};