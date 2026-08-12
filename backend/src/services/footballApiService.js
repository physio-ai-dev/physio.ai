import "dotenv/config";

// Función para buscar jugadores por nombre en la API externa
export const searchPlayerFromAPI = async (playerName, league, season = 2024) => {
  const apiKey = process.env.RAPIDAPI_KEY || process.env.FOOTBALL_API_KEY;

  if (!apiKey) {
    throw new Error("No se ha configurado la API Key en el archivo .env");
  }

  // Detecta si es RapidAPI o API-SPORTS directo
  const isRapidApi = Boolean(process.env.RAPIDAPI_KEY);
  const baseUrl = isRapidApi
    ? "https://api-football-v1.p.rapidapi.com/v3"
    : "https://v3.football.api-sports.io";

  const headers = isRapidApi
    ? {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host":
          process.env.RAPIDAPI_HOST || "api-football-v1.p.rapidapi.com",
      }
    : {
        "x-apisports-key": apiKey,
      };

  // Si no se especifica una liga, busca secuencialmente en las principales ligas:
  // 140 (LaLiga), 39 (Premier League), 135 (Serie A), 61 (Ligue 1), 2 (Champions League), 253 (MLS)
  const leaguesToSearch = league ? [league] : [140, 39, 135, 61, 2, 253];

  // Normalizar el nombre para quitar tildes/acentos (ej. "Julián" -> "Julian")
  const cleanName = playerName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  for (const leg of leaguesToSearch) {
    try {
      const url = `${baseUrl}/players?search=${encodeURIComponent(cleanName)}&league=${leg}&season=${season}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      if (!response.ok) continue;

      const data = await response.json();

      // Verificar si la API retornó errores internos (como límite de cuota superado)
      if (data.errors && (Array.isArray(data.errors) ? data.errors.length > 0 : Object.keys(data.errors).length > 0)) {
        const errorMsg = Array.isArray(data.errors) 
          ? data.errors.join(", ") 
          : Object.values(data.errors).join(", ");
        console.error(`Error de API-Football en liga ${leg}:`, errorMsg);
        throw new Error(`API de Fútbol: ${errorMsg}`);
      }

      if (data.response && data.response.length > 0) {
        console.log(`Jugador encontrado en la liga ${leg}`);
        return data.response;
      }
    } catch (err) {
      console.error(`Error consultando en la liga ${leg}:`, err);
      // Propagar el error de la API si es específico
      if (err.message.includes("API de Fútbol:")) {
        throw err;
      }
    }
  }

  return [];
};
