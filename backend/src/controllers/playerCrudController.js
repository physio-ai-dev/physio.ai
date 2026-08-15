import AppDataSource from "../config/database.js";
import PlayerSchema from "../models/PlayerSchema.js";
import InjurySchema from "../models/InjurySchema.js";
import LeagueSchema from "../models/LeagueSchema.js";
import ClubSchema from "../models/ClubSchema.js";
import PositionSchema from "../models/PositionSchema.js";
import UserSchema from "../models/UserSchema.js";
import SearchSchema from "../models/SearchSchema.js";
import { analyzeInjuryWithGemini } from "../services/geminiService.js";

const playerRepository = AppDataSource.getRepository(PlayerSchema);
const injuryRepository = AppDataSource.getRepository(InjurySchema);

export const getLeagues = async (req, res) => {
  try {
    const leagueRepository = AppDataSource.getRepository(LeagueSchema);
    const leagues = await leagueRepository.find({
      order: { id: "ASC" },
    });
    return res.json({
      status: "success",
      data: leagues,
    });
  } catch (error) {
    console.error("Error al obtener ligas:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getPositions = async (req, res) => {
  try {
    const positionRepository = AppDataSource.getRepository(PositionSchema);
    const positions = await positionRepository.find({
      order: { id: "ASC" },
    });
    return res.json({
      status: "success",
      data: positions,
    });
  } catch (error) {
    console.error("Error al obtener posiciones:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getClubs = async (req, res) => {
  try {
    const { leagueName } = req.query;
    const clubRepository = AppDataSource.getRepository(ClubSchema);

    let whereClause = {};
    if (leagueName) {
      whereClause = {
        league: { name: leagueName },
      };
    }

    const clubs = await clubRepository.find({
      where: whereClause,
      relations: ["league"],
      order: { name: "ASC" },
    });

    return res.json({
      status: "success",
      data: clubs,
    });
  } catch (error) {
    console.error("Error al obtener clubes:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const createPlayer = async (req, res) => {
  try {
    const {
      nombre,
      equipo,
      posicion,
      estatura,
      valor_mercado,
      foto_url,
      fecha_nacimiento,
      liga,
    } = req.body;

    if (
      !nombre ||
      !equipo ||
      !posicion ||
      !estatura ||
      !valor_mercado
    ) {
      return res.status(400).json({
        error:
          "Los campos nombre, equipo, posicion, estatura y valor_mercado son estrictamente requeridos.",
      });
    }

    const clubRepository = AppDataSource.getRepository(ClubSchema);
    const positionRepository = AppDataSource.getRepository(PositionSchema);
    const leagueRepository = AppDataSource.getRepository(LeagueSchema);

    let dbPosition = await positionRepository.findOne({ where: { name: posicion } });
    if (!dbPosition) {
      dbPosition = await positionRepository.save(positionRepository.create({ name: posicion }));
    }

    let dbLeague = await leagueRepository.findOne({ where: { name: liga || "Local / Otro" } });
    if (!dbLeague) {
      dbLeague = await leagueRepository.save(
        leagueRepository.create({ name: liga || "Local / Otro", country: "Local" })
      );
    }

    let dbClub = await clubRepository.findOne({ where: { name: equipo } });
    if (!dbClub) {
      dbClub = await clubRepository.save(
        clubRepository.create({
          name: equipo,
          league: dbLeague,
        })
      );
    }

    const newPlayer = playerRepository.create({
      api_id: null,
      name: nombre,
      club: dbClub,
      position: dbPosition,
      height: estatura,
      market_value: valor_mercado,
      photo_url: foto_url || null,
      birthdate: fecha_nacimiento || null,
    });

    const savedPlayer = await playerRepository.save(newPlayer);

    return res.status(201).json({
      status: "success",
      message: "Futbolista creado localmente con éxito",
      data: {
        id: savedPlayer.id,
        nombre: savedPlayer.name,
        equipo: dbClub.name,
        posicion: dbPosition.name,
        liga: dbLeague.name,
        estatura: savedPlayer.height,
        valor_mercado: savedPlayer.market_value,
        foto_url: savedPlayer.photo_url,
        fecha_nacimiento: savedPlayer.birthdate,
      },
    });
  } catch (error) {
    console.error("Error al crear el futbolista:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getPlayers = async (req, res) => {
  try {
    const players = await playerRepository.find({
      relations: ["club", "club.league", "position"],
      order: { id: "DESC" },
    });

    const mapped = players.map((p) => ({
      id: p.id,
      apiId: p.api_id,
      name: p.name,
      club: p.club?.name || "Equipo Desconocido",
      position: p.position?.name || "Sin Posición",
      photoUrl: p.photo_url,
      birthdate: p.birthdate,
      league: p.club?.league?.name || "Liga Desconocida",
      height: p.height,
      marketValue: p.market_value,
      createdAt: p.created_at,
    }));

    return res.json({
      status: "success",
      count: mapped.length,
      data: mapped,
    });
  } catch (error) {
    console.error("Error al listar futbolistas:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;

    const player = await playerRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: ["club", "club.league", "position"],
    });

    if (!player) {
      return res.status(404).json({ error: "Futbolista no encontrado." });
    }

    const injuries = await injuryRepository.find({
      where: { player_id: player.id },
      order: { created_at: "DESC" },
    });

    const mappedInjuries = injuries.map((i) => ({
      id: i.id,
      playerId: i.player_id,
      injuryType: i.injury_type,
      estimatedDaysClub: i.estimated_days_club,
      clinicalTimeAi: i.clinical_time_ai,
      comparativeAnalysis: i.comparative_analysis,
      status: i.status,
      createdAt: i.created_at,
    }));

    return res.json({
      status: "success",
      data: {
        id: player.id,
        apiId: player.api_id,
        name: player.name,
        club: player.club?.name || "Equipo Desconocido",
        position: player.position?.name || "Sin Posición",
        photoUrl: player.photo_url,
        birthdate: player.birthdate,
        league: player.club?.league?.name || "Liga Desconocida",
        height: player.height,
        marketValue: player.market_value,
        createdAt: player.created_at,
        injuries: mappedInjuries,
        aiReport: mappedInjuries[0] || null,
      },
    });
  } catch (error) {
    console.error("Error al buscar el futbolista por ID:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      equipo,
      posicion,
      estatura,
      valor_mercado,
      foto_url,
      fecha_nacimiento,
      liga,
    } = req.body;

    const player = await playerRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: ["club", "club.league", "position"],
    });

    if (!player) {
      return res.status(404).json({ error: "Futbolista no encontrado." });
    }

    if (
      !nombre ||
      !equipo ||
      !posicion ||
      !estatura ||
      !valor_mercado
    ) {
      return res.status(400).json({
        error:
          "Los campos nombre, equipo, posicion, estatura y valor_mercado son requeridos para actualizar.",
      });
    }

    const clubRepository = AppDataSource.getRepository(ClubSchema);
    const positionRepository = AppDataSource.getRepository(PositionSchema);
    const leagueRepository = AppDataSource.getRepository(LeagueSchema);

    let dbPosition = await positionRepository.findOne({ where: { name: posicion } });
    if (!dbPosition) {
      dbPosition = await positionRepository.save(positionRepository.create({ name: posicion }));
    }

    let dbLeague = await leagueRepository.findOne({ where: { name: liga || "Local / Otro" } });
    if (!dbLeague) {
      dbLeague = await leagueRepository.save(
        leagueRepository.create({ name: liga || "Local / Otro", country: "Local" })
      );
    }

    let dbClub = await clubRepository.findOne({ where: { name: equipo } });
    if (!dbClub) {
      dbClub = await clubRepository.save(
        clubRepository.create({
          name: equipo,
          league: dbLeague,
        })
      );
    }

    player.name = nombre;
    player.club = dbClub;
    player.position = dbPosition;
    player.height = estatura;
    player.market_value = valor_mercado;
    if (foto_url !== undefined) player.photo_url = foto_url;
    if (fecha_nacimiento !== undefined) player.birthdate = fecha_nacimiento;

    await playerRepository.save(player);

    return res.json({
      status: "success",
      message: "Futbolista actualizado con éxito",
      data: {
        id: player.id,
        nombre: player.name,
        equipo: dbClub.name,
        posicion: dbPosition.name,
        liga: dbLeague.name,
        estatura: player.height,
        valor_mercado: player.market_value,
        foto_url: player.photo_url,
        fecha_nacimiento: player.birthdate,
      },
    });
  } catch (error) {
    console.error("Error al actualizar el futbolista:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;

    const player = await playerRepository.findOne({
      where: { id: parseInt(id, 10) },
    });

    if (!player) {
      return res.status(404).json({ error: "Futbolista no encontrado." });
    }

    await playerRepository.remove(player);

    return res.json({
      status: "success",
      message: "Futbolista eliminado con éxito de la base de datos local",
    });
  } catch (error) {
    console.error("Error al eliminar el futbolista:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getInjuryReportSummary = async (req, res) => {
  try {
    const summary = await AppDataSource.query(`SELECT * FROM view_injury_summary;`);
    return res.json({
      status: "success",
      data: summary,
    });
  } catch (error) {
    console.error("Error al obtener reporte consolidado:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getPlayerAge = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await AppDataSource.query(
      `SELECT calculate_age(birthdate) AS age FROM players WHERE id = $1;`,
      [parseInt(id, 10)]
    );
    if (result.length === 0) {
      return res.status(404).json({ error: "Futbolista no encontrado." });
    }
    return res.json({
      status: "success",
      edad: result[0].age,
    });
  } catch (error) {
    console.error("Error al obtener edad del futbolista:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AppDataSource.query(
      "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100;"
    );
    return res.json({
      status: "success",
      data: logs.map((l) => ({
        id: l.id,
        tableName: l.table_name,
        operation: l.operation,
        recordId: l.record_id,
        oldValue: l.old_value,
        newValue: l.new_value,
        userEmail: l.user_email,
        createdAt: l.created_at,
      })),
    });
  } catch (error) {
    console.error("Error al obtener logs de auditoría:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getTopSearched = async (req, res) => {
  try {
    const searchRepository = AppDataSource.getRepository(SearchSchema);

    const topClinical = await searchRepository.createQueryBuilder("search")
      .leftJoin("search.player", "player")
      .leftJoin("player.club", "club")
      .select([
        "player.id AS id",
        "player.name AS name",
        "club.name AS club_name",
        "COUNT(search.id) AS search_count"
      ])
      .where("search.search_type = :type", { type: "clinico" })
      .groupBy("player.id")
      .addGroupBy("player.name")
      .addGroupBy("club.name")
      .orderBy("search_count", "DESC")
      .limit(10)
      .getRawMany();

    const topPerformance = await searchRepository.createQueryBuilder("search")
      .leftJoin("search.player", "player")
      .leftJoin("player.club", "club")
      .select([
        "player.id AS id",
        "player.name AS name",
        "club.name AS club_name",
        "COUNT(search.id) AS search_count"
      ])
      .where("search.search_type = :type", { type: "rendimiento" })
      .groupBy("player.id")
      .addGroupBy("player.name")
      .addGroupBy("club.name")
      .orderBy("search_count", "DESC")
      .limit(10)
      .getRawMany();

    return res.json({
      status: "success",
      data: {
        clinico: topClinical.map((tc) => ({
          id: tc.id,
          name: tc.name,
          club: tc.club_name,
          searchCount: parseInt(tc.search_count, 10),
        })),
        rendimiento: topPerformance.map((tp) => ({
          id: tp.id,
          name: tp.name,
          club: tp.club_name,
          searchCount: parseInt(tp.search_count, 10),
        })),
      }
    });
  } catch (error) {
    console.error("Error al obtener top búsquedas:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const recordPlayerSelection = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo } = req.query;
    const searchType = tipo || "clinico";
    const userEmail = req.headers["x-user-email"];

    const searchRepository = AppDataSource.getRepository(SearchSchema);
    const userRepository = AppDataSource.getRepository(UserSchema);
    const player = await playerRepository.findOne({ where: { id: parseInt(id, 10) } });

    if (!player) {
      return res.status(404).json({ error: "Futbolista no encontrado." });
    }

    let user = null;
    if (userEmail) {
      user = await userRepository.findOne({ where: { email: userEmail } });
    }

    const newSearch = searchRepository.create({
      user,
      player,
      search_type: searchType,
    });
    await searchRepository.save(newSearch);

    return res.json({ status: "success" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getOrGenerateAuditReport = async (req, res) => {
  try {
    const { id } = req.params;
    let injury = await injuryRepository.findOne({
      where: { player_id: parseInt(id, 10) },
      order: { id: "DESC" }
    });

    if (!injury) {
      const aiAnalysis = await analyzeInjuryWithGemini("Rotura fibrilar en el bíceps femoral (Isquiotibiales)", 21);
      injury = injuryRepository.create({
        player_id: parseInt(id, 10),
        injury_type: "Rotura fibrilar en el bíceps femoral (Isquiotibiales)",
        estimated_days_club: 21,
        clinical_time_ai: aiAnalysis.tiempo_clinico_ia || null,
        comparative_analysis: aiAnalysis.analisis_comparativo || "",
        status: "En Recuperación"
      });
      await injuryRepository.save(injury);
    } else if (!injury.comparative_analysis || !injury.comparative_analysis.includes("###")) {
      const aiAnalysis = await analyzeInjuryWithGemini(injury.injury_type, injury.estimated_days_club);
      injury.clinical_time_ai = aiAnalysis.tiempo_clinico_ia || null;
      injury.comparative_analysis = aiAnalysis.comparative_analysis || "";
      await injuryRepository.save(injury);
    }

    return res.json({
      status: "success",
      data: {
        id: injury.id,
        jugador_id: injury.player_id,
        tipo_lesion: injury.injury_type,
        dias_estimados_club: injury.estimated_days_club,
        tiempo_clinico_ia: injury.clinical_time_ai,
        analisis_comparativo: injury.comparative_analysis,
        estado: injury.status,
        fecha_registro: injury.created_at,
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getSearchHistory = async (req, res) => {
  try {
    const userEmail = req.user?.email || req.headers["x-user-email"];
    if (!userEmail) {
      return res.status(400).json({ error: "Email de usuario no especificado." });
    }

    const isAdmin = req.user?.role === "admin";
    let history;

    if (isAdmin) {
      history = await AppDataSource.query(
        "SELECT * FROM view_search_history ORDER BY search_date DESC LIMIT 100;"
      );
    } else {
      history = await AppDataSource.query(
        "SELECT * FROM view_search_history WHERE user_email = $1 ORDER BY search_date DESC LIMIT 50;",
        [userEmail]
      );
    }

    return res.json({
      status: "success",
      data: history.map((h) => ({
        id: h.id,
        usuario_id: h.user_id,
        usuario_email: h.user_email,
        jugador_id: h.player_id,
        jugador_nombre: h.player_name,
        equipo: h.club_name,
        tipo_buscador: h.search_type,
        fecha_busqueda: h.search_date,
      })),
    });
  } catch (error) {
    console.error("Error al obtener historial de búsquedas:", error);
    return res.status(500).json({ error: error.message });
  }
};
