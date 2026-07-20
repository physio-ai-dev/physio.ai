import AppDataSource from "../config/database.js";
import PlayerSchema from "../models/PlayerSchema.js";
import { searchPlayerFromAPI } from "../services/footballApiService.js";

export const searchPlayer = async (req, res) => {
  try {
    const { name, league, season } = req.query;

    if (!name) {
      return res
        .status(400)
        .json({ error: "El parámetro de búsqueda 'name' es requerido" });
    }

    // 1. Consultar la API externa de fútbol (por defecto Liga Española = 140, Temporada = 2024)
    const apiResults = await searchPlayerFromAPI(name, league, season || 2024);

    if (!apiResults || apiResults.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron futbolistas con ese nombre" });
    }

    const playerRepository = AppDataSource.getRepository(PlayerSchema);
    const savedPlayers = [];

    // 2. Procesar y guardar los resultados encontrados
    for (const item of apiResults) {
      const apiPlayer = item.player;
      const apiStats = item.statistics[0] || {};

      let player = await playerRepository.findOne({
        where: { api_id: apiPlayer.id },
      });

      if (!player) {
        player = playerRepository.create({
          api_id: apiPlayer.id,
          nombre: apiPlayer.name,
          equipo: apiStats.team?.name || "Equipo Desconocido",
          edad: apiPlayer.age || null,
          posicion: apiStats.games?.position || "Sin Posición",
          foto_url: apiPlayer.photo || null,
        });

        await playerRepository.save(player);
      } else if (apiPlayer.photo && !player.foto_url) {
        // Actualizar foto si no la tenía
        player.foto_url = apiPlayer.photo;
        await playerRepository.save(player);
      }

      savedPlayers.push(player);
    }

    return res.json({
      status: "success",
      count: savedPlayers.length,
      data: savedPlayers,
    });
  } catch (error) {
    console.error("Error en searchPlayer:", error);
    return res.status(500).json({ error: error.message });
  }
};
