import AppDataSource from "../config/database.js";
import PlayerSchema from "../models/PlayerSchema.js";
import InjurySchema from "../models/InjurySchema.js";
import { searchPlayerFromAPI } from "../services/footballApiService.js";
import { analyzeInjuryWithGemini } from "../services/geminiService.js";

export const searchPlayer = async (req, res) => {
  try {
    const { name, league, season } = req.query;

    if (!name) {
      return res
        .status(400)
        .json({ error: "El parámetro de búsqueda 'name' es requerido" });
    }

    const playerRepository = AppDataSource.getRepository(PlayerSchema);
    const injuryRepository = AppDataSource.getRepository(InjurySchema);

    // 🚨 OPTIMIZACIÓN DE CUOTA: Buscar en la base de datos local primero (usando ILIKE para evitar sensibilidad a acentos/mayúsculas)
    // Limpiamos acentos de la búsqueda local si es posible, pero ILIKE es la forma estándar.
    const cleanSearchName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Consultamos por coincidencia parcial en nombre
    const localPlayers = await playerRepository.createQueryBuilder("player")
      .where("player.nombre ILIKE :name", { name: `%${cleanSearchName}%` })
      .getMany();

    if (localPlayers && localPlayers.length > 0) {
      console.log(`✅ Jugador(es) encontrado(s) en la base de datos local (Modo Caché)!`);
      const savedPlayers = [];

      for (const player of localPlayers) {
        let lesiones = await injuryRepository.find({
          where: { jugador_id: player.id },
          order: { fecha_registro: "DESC" },
        });

        // Si tiene lesiones, pero el reporte clínico es antiguo (sin títulos Markdown '###'), lo regeneramos
        const necesitaActualizar = lesiones.length > 0 && !lesiones[0].analisis_comparativo.includes("###");

        if (lesiones.length === 0 || necesitaActualizar) {
          const lesionPorDefecto = lesiones.length > 0 ? lesiones[0].tipo_lesion : "Rotura fibrilar en el bíceps femoral (Isquiotibiales)";
          const diasClubPorDefecto = lesiones.length > 0 ? lesiones[0].dias_estimados_club : 21;

          try {
            const aiAnalysis = await analyzeInjuryWithGemini(lesionPorDefecto, diasClubPorDefecto);

            if (necesitaActualizar) {
              const lesionExistente = lesiones[0];
              lesionExistente.tiempo_clinico_ia = aiAnalysis.tiempo_clinico_ia || null;
              lesionExistente.analisis_comparativo = aiAnalysis.analisis_comparativo || "";
              await injuryRepository.save(lesionExistente);
            } else {
              const nuevaLesion = injuryRepository.create({
                jugador_id: player.id,
                tipo_lesion: lesionPorDefecto,
                dias_estimados_club: diasClubPorDefecto,
                tiempo_clinico_ia: aiAnalysis.tiempo_clinico_ia || null,
                analisis_comparativo: aiAnalysis.analisis_comparativo || "",
                estado: "En Recuperación",
              });

              const lesionGuardada = await injuryRepository.save(nuevaLesion);
              lesiones = [lesionGuardada];
            }
          } catch (geminiError) {
            console.error("Error al generar/actualizar análisis de Gemini:", geminiError);
          }
        }

        savedPlayers.push({
          id: player.id,
          api_id: player.api_id,
          nombre: player.nombre,
          equipo: player.equipo,
          edad: player.edad,
          posicion: player.posicion,
          foto_url: player.foto_url,
          fecha_nacimiento: player.fecha_nacimiento,
          created_at: player.created_at,
          lesiones,
          reporte_ia: lesiones[0] || null,
        });
      }

      return res.json({
        status: "success",
        count: savedPlayers.length,
        data: savedPlayers,
      });
    }

    // 2. Si no está en caché, llamar a la API externa de fútbol
    console.log(`🌐 Jugador no encontrado en BD. Consultando API-Football...`);
    const apiResults = await searchPlayerFromAPI(name, league, season || 2024);

    if (!apiResults || apiResults.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron futbolistas con ese nombre" });
    }

    const savedPlayers = [];

    // 3. Procesar y guardar los resultados encontrados
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
          fecha_nacimiento: apiPlayer.birth?.date || null,
          liga: apiStats.league?.name || "Liga Desconocida",
        });

        await playerRepository.save(player);
      } else {
        let updated = false;
        if (apiPlayer.photo && !player.foto_url) {
          player.foto_url = apiPlayer.photo;
          updated = true;
        }
        if (apiPlayer.birth?.date && !player.fecha_nacimiento) {
          player.fecha_nacimiento = apiPlayer.birth.date;
          updated = true;
        }
        if (apiStats.league?.name && !player.liga) {
          player.liga = apiStats.league.name;
          updated = true;
        }
        if (updated) {
          await playerRepository.save(player);
        }
      }

      // Obtener el historial de lesiones en la BD
      let lesiones = await injuryRepository.find({
        where: { jugador_id: player.id },
        order: { fecha_registro: "DESC" },
      });

      // Si el jugador es nuevo y no tiene lesiones, creamos una por defecto
      if (lesiones.length === 0) {
        const lesionPorDefecto = "Rotura fibrilar en el bíceps femoral (Isquiotibiales)";
        const diasClubPorDefecto = 21;

        try {
          const aiAnalysis = await analyzeInjuryWithGemini(lesionPorDefecto, diasClubPorDefecto);

          const nuevaLesion = injuryRepository.create({
            jugador_id: player.id,
            tipo_lesion: lesionPorDefecto,
            dias_estimados_club: diasClubPorDefecto,
            tiempo_clinico_ia: aiAnalysis.tiempo_clinico_ia || null,
            analisis_comparativo: aiAnalysis.analisis_comparativo || "",
            estado: "En Recuperación",
          });

          const lesionGuardada = await injuryRepository.save(nuevaLesion);
          lesiones = [lesionGuardada];
        } catch (geminiError) {
          console.error("Error al generar análisis automático de Gemini:", geminiError);
        }
      }

      savedPlayers.push({
        id: player.id,
        api_id: player.api_id,
        nombre: player.nombre,
        equipo: player.equipo,
        edad: player.edad,
        posicion: player.posicion,
        foto_url: player.foto_url,
        fecha_nacimiento: player.fecha_nacimiento,
        created_at: player.created_at,
        lesiones,
        reporte_ia: lesiones[0] || null,
      });
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
