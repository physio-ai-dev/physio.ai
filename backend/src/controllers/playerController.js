import AppDataSource from "../config/database.js";
import PlayerSchema from "../models/PlayerSchema.js";
import InjurySchema from "../models/InjurySchema.js";
import ClubSchema from "../models/ClubSchema.js";
import PositionSchema from "../models/PositionSchema.js";
import LeagueSchema from "../models/LeagueSchema.js";
import { searchPlayerFromAPI } from "../services/footballApiService.js";
import { analyzeInjuryWithGemini } from "../services/geminiService.js";
import { ILike } from "typeorm";

// Helper para resolver relaciones dinámicas basadas en nombres de texto plano
async function resolveRelations(teamName, positionName, leagueName) {
  const clubRepository = AppDataSource.getRepository(ClubSchema);
  const positionRepository = AppDataSource.getRepository(PositionSchema);
  const leagueRepository = AppDataSource.getRepository(LeagueSchema);

  // 1. Resolver posición y mapear a los 4 permitidos por el CHECK constraint
  let resolvedPositionName = "Defensa"; // Fallback por defecto
  const pLower = (positionName || "").toLowerCase();
  
  if (pLower.includes("goalkeeper") || pLower.includes("arquero") || pLower.includes("portero")) {
    resolvedPositionName = "Arquero";
  } else if (pLower.includes("defender") || pLower.includes("defensa") || pLower.includes("central") || pLower.includes("lateral")) {
    resolvedPositionName = "Defensa";
  } else if (pLower.includes("midfielder") || pLower.includes("medio") || pLower.includes("volante") || pLower.includes("centrocampista")) {
    resolvedPositionName = "Mediocampista";
  } else if (pLower.includes("attacker") || pLower.includes("forward") || pLower.includes("delantero") || pLower.includes("extremo") || pLower.includes("punta")) {
    resolvedPositionName = "Delantero";
  }

  let dbPosition = await positionRepository.findOne({ where: { nombre: resolvedPositionName } });
  if (!dbPosition) {
    dbPosition = await positionRepository.save(positionRepository.create({ nombre: resolvedPositionName }));
  }

  // 2. Resolver Liga
  const resolvedLeagueName = leagueName || "Local / Otro";
  let dbLeague = await leagueRepository.findOne({ where: { nombre: resolvedLeagueName } });
  if (!dbLeague) {
    dbLeague = await leagueRepository.save(leagueRepository.create({ nombre: resolvedLeagueName, pais: "Importado" }));
  }

  // 3. Resolver Club
  const resolvedClubName = teamName || "Club Desconocido";
  let dbClub = await clubRepository.findOne({ where: { nombre: resolvedClubName }, relations: ["liga"] });
  if (!dbClub) {
    dbClub = await clubRepository.save(clubRepository.create({
      nombre: resolvedClubName,
      liga: dbLeague,
    }));
  } else if (!dbClub.liga || dbClub.liga.id !== dbLeague.id) {
    dbClub.liga = dbLeague;
    await clubRepository.save(dbClub);
  }

  return { dbClub, dbPosition };
}

// Registrar búsqueda en historial (para alimentar el trigger de top búsquedas)
async function registrarBusqueda(savedPlayers) {
  try {
    const db = AppDataSource;
    const userResult = await db.query("SELECT id FROM usuarios WHERE nombre = 'Invitado' LIMIT 1;");
    const usuarioId = userResult.length > 0 ? userResult[0].id : 1;

    for (const player of savedPlayers) {
      await db.query(
        "INSERT INTO busquedas (usuario_id, jugador_id) VALUES ($1, $2);",
        [usuarioId, player.id]
      );
    }
  } catch (err) {
    console.error("Error al registrar historial de búsqueda:", err);
  }
}

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

    // 🚨 OPTIMIZACIÓN: Buscar localmente primero
    const cleanSearchName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const localPlayers = await playerRepository.createQueryBuilder("player")
      .leftJoinAndSelect("player.club", "club")
      .leftJoinAndSelect("club.liga", "liga")
      .leftJoinAndSelect("player.posicion", "posicion")
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
          equipo: player.club?.nombre || "Equipo Desconocido",
          posicion: player.posicion?.nombre || "Sin Posición",
          foto_url: player.foto_url,
          fecha_nacimiento: player.fecha_nacimiento,
          liga: player.club?.liga?.nombre || "Liga Desconocida",
          estatura: player.estatura || "Sin estatura",
          valor_mercado: player.valor_mercado || "No disponible",
          created_at: player.created_at,
          lesiones,
          reporte_ia: lesiones[0] || null,
        });
      }

      // Registrar búsqueda en historial
      await registrarBusqueda(savedPlayers);

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
        relations: ["club", "club.liga", "posicion"],
      });

      // Resolver relaciones estructuradas
      const { dbClub, dbPosition } = await resolveRelations(
        apiStats.team?.name,
        apiStats.games?.position,
        apiStats.league?.name
      );

      if (!player) {
        player = playerRepository.create({
          api_id: apiPlayer.id,
          nombre: apiPlayer.name,
          club: dbClub,
          posicion: dbPosition,
          foto_url: apiPlayer.photo || null,
          fecha_nacimiento: apiPlayer.birth?.date || null,
          estatura: apiPlayer.height || "Sin estatura",
          valor_mercado: "No disponible",
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
        if (dbClub && (!player.club || player.club.id !== dbClub.id)) {
          player.club = dbClub;
          updated = true;
        }
        if (dbPosition && (!player.posicion || player.posicion.id !== dbPosition.id)) {
          player.posicion = dbPosition;
          updated = true;
        }
        if (apiPlayer.height && !player.estatura) {
          player.estatura = apiPlayer.height;
          updated = true;
        }
        if (!player.valor_mercado) {
          player.valor_mercado = "No disponible";
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
        equipo: player.club?.nombre || "Equipo Desconocido",
        posicion: player.posicion?.nombre || "Sin Posición",
        foto_url: player.foto_url,
        fecha_nacimiento: player.fecha_nacimiento,
        liga: player.club?.liga?.nombre || "Liga Desconocida",
        estatura: player.estatura || "Sin estatura",
        valor_mercado: player.valor_mercado || "No disponible",
        created_at: player.created_at,
        lesiones,
        reporte_ia: lesiones[0] || null,
      });
    }

    // Registrar búsqueda en historial
    await registrarBusqueda(savedPlayers);

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
