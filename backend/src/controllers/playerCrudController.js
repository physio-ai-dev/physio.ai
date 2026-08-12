import AppDataSource from "../config/database.js";
import PlayerSchema from "../models/PlayerSchema.js";
import InjurySchema from "../models/InjurySchema.js";
import LeagueSchema from "../models/LeagueSchema.js";
import ClubSchema from "../models/ClubSchema.js";
import PositionSchema from "../models/PositionSchema.js";
import { analyzeInjuryWithGemini } from "../services/geminiService.js";

// Obtener repositorios
const playerRepository = AppDataSource.getRepository(PlayerSchema);
const injuryRepository = AppDataSource.getRepository(InjurySchema);

// 0. Obtener lista de ligas
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

// 0b. Obtener lista de posiciones
export const getPositions = async (req, res) => {
  try {
    const positionRepository = AppDataSource.getRepository(PositionSchema);
    const posiciones = await positionRepository.find({
      order: { id: "ASC" },
    });
    return res.json({
      status: "success",
      data: posiciones,
    });
  } catch (error) {
    console.error("Error al obtener posiciones:", error);
    return res.status(500).json({ error: error.message });
  }
};

// 0c. Obtener lista de clubes (opcionalmente filtrados por liga)
export const getClubs = async (req, res) => {
  try {
    const { leagueName } = req.query;
    const clubRepository = AppDataSource.getRepository(ClubSchema);

    let whereClause = {};
    if (leagueName) {
      whereClause = {
        liga: { nombre: leagueName },
      };
    }

    const clubes = await clubRepository.find({
      where: whereClause,
      relations: ["liga"],
      order: { nombre: "ASC" },
    });

    return res.json({
      status: "success",
      data: clubes,
    });
  } catch (error) {
    console.error("Error al obtener clubes:", error);
    return res.status(500).json({ error: error.message });
  }
};

// 1. Crear un futbolista local
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

    // Validación obligatoria según Criterios de Aceptación JIRA
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

    // 1. Resolver posición
    let dbPosition = await positionRepository.findOne({ where: { nombre: posicion } });
    if (!dbPosition) {
      dbPosition = await positionRepository.save(positionRepository.create({ nombre: posicion }));
    }

    // 2. Resolver Liga
    let dbLeague = await leagueRepository.findOne({ where: { nombre: liga || "Local / Otro" } });
    if (!dbLeague) {
      dbLeague = await leagueRepository.save(
        leagueRepository.create({ nombre: liga || "Local / Otro", pais: "Local" })
      );
    }

    // 3. Resolver Club
    let dbClub = await clubRepository.findOne({ where: { nombre: equipo } });
    if (!dbClub) {
      dbClub = await clubRepository.save(
        clubRepository.create({
          nombre: equipo,
          liga: dbLeague,
        })
      );
    }

    const nuevoJugador = playerRepository.create({
      api_id: null,
      nombre,
      club: dbClub,
      posicion: dbPosition,
      estatura,
      valor_mercado,
      foto_url: foto_url || null,
      fecha_nacimiento: fecha_nacimiento || null,
    });

    const jugadorGuardado = await playerRepository.save(nuevoJugador);

    return res.status(201).json({
      status: "success",
      message: "Futbolista creado localmente con éxito",
      data: {
        id: jugadorGuardado.id,
        nombre: jugadorGuardado.nombre,
        equipo: dbClub.nombre,
        posicion: dbPosition.nombre,
        liga: dbLeague.nombre,
        estatura: jugadorGuardado.estatura,
        valor_mercado: jugadorGuardado.valor_mercado,
        foto_url: jugadorGuardado.foto_url,
        fecha_nacimiento: jugadorGuardado.fecha_nacimiento,
      },
    });
  } catch (error) {
    console.error("Error al crear el futbolista:", error);
    return res.status(500).json({ error: error.message });
  }
};

// 2. Obtener la lista de todos los futbolistas locales
export const getPlayers = async (req, res) => {
  try {
    const jugadores = await playerRepository.find({
      relations: ["club", "club.liga", "posicion"],
      order: { id: "DESC" },
    });

    const mapped = jugadores.map((p) => ({
      id: p.id,
      api_id: p.api_id,
      nombre: p.nombre,
      equipo: p.club?.nombre || "Equipo Desconocido",
      posicion: p.posicion?.nombre || "Sin Posición",
      foto_url: p.foto_url,
      fecha_nacimiento: p.fecha_nacimiento,
      liga: p.club?.liga?.nombre || "Liga Desconocida",
      estatura: p.estatura,
      valor_mercado: p.valor_mercado,
      created_at: p.created_at,
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

// 3. Obtener un futbolista por su ID (con sus lesiones)
export const getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;

    const jugador = await playerRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: ["club", "club.liga", "posicion"],
    });

    if (!jugador) {
      return res.status(404).json({ error: "Futbolista no encontrado." });
    }

    const lesiones = await injuryRepository.find({
      where: { jugador_id: jugador.id },
      order: { fecha_registro: "DESC" },
    });

    return res.json({
      status: "success",
      data: {
        id: jugador.id,
        api_id: jugador.api_id,
        nombre: jugador.nombre,
        equipo: jugador.club?.nombre || "Equipo Desconocido",
        posicion: jugador.posicion?.nombre || "Sin Posición",
        foto_url: jugador.foto_url,
        fecha_nacimiento: jugador.fecha_nacimiento,
        liga: jugador.club?.liga?.nombre || "Liga Desconocida",
        estatura: jugador.estatura,
        valor_mercado: jugador.valor_mercado,
        created_at: jugador.created_at,
        lesiones,
        reporte_ia: lesiones[0] || null,
      },
    });
  } catch (error) {
    console.error("Error al buscar el futbolista por ID:", error);
    return res.status(500).json({ error: error.message });
  }
};

// 4. Actualizar los datos de un futbolista
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

    const jugador = await playerRepository.findOne({
      where: { id: parseInt(id, 10) },
      relations: ["club", "club.liga", "posicion"],
    });

    if (!jugador) {
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

    // Resolver posición
    let dbPosition = await positionRepository.findOne({ where: { nombre: posicion } });
    if (!dbPosition) {
      dbPosition = await positionRepository.save(positionRepository.create({ nombre: posicion }));
    }

    // Resolver liga
    let dbLeague = await leagueRepository.findOne({ where: { nombre: liga || "Local / Otro" } });
    if (!dbLeague) {
      dbLeague = await leagueRepository.save(
        leagueRepository.create({ nombre: liga || "Local / Otro", pais: "Local" })
      );
    }

    // Resolver club
    let dbClub = await clubRepository.findOne({ where: { nombre: equipo } });
    if (!dbClub) {
      dbClub = await clubRepository.save(
        clubRepository.create({
          nombre: equipo,
          liga: dbLeague,
        })
      );
    }

    jugador.nombre = nombre;
    jugador.club = dbClub;
    jugador.posicion = dbPosition;
    jugador.estatura = estatura;
    jugador.valor_mercado = valor_mercado;
    if (foto_url !== undefined) jugador.foto_url = foto_url;
    if (fecha_nacimiento !== undefined) jugador.fecha_nacimiento = fecha_nacimiento;

    await playerRepository.save(jugador);

    return res.json({
      status: "success",
      message: "Futbolista actualizado con éxito",
      data: {
        id: jugador.id,
        nombre: jugador.nombre,
        equipo: dbClub.nombre,
        posicion: dbPosition.nombre,
        liga: dbLeague.nombre,
        estatura: jugador.estatura,
        valor_mercado: jugador.valor_mercado,
        foto_url: jugador.foto_url,
        fecha_nacimiento: jugador.fecha_nacimiento,
      },
    });
  } catch (error) {
    console.error("Error al actualizar el futbolista:", error);
    return res.status(500).json({ error: error.message });
  }
};

// 5. Eliminar un futbolista
export const deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;

    const jugador = await playerRepository.findOne({
      where: { id: parseInt(id, 10) },
    });

    if (!jugador) {
      return res.status(404).json({ error: "Futbolista no encontrado." });
    }

    await playerRepository.remove(jugador);

    return res.json({
      status: "success",
      message: "Futbolista eliminado con éxito de la base de datos local",
    });
  } catch (error) {
    console.error("Error al eliminar el futbolista:", error);
    return res.status(500).json({ error: error.message });
  }
};

// 6. Obtener reporte consolidado de lesiones desde la vista (SCRUM-53)
export const getInjuryReportSummary = async (req, res) => {
  try {
    const summary = await AppDataSource.query(`SELECT * FROM vista_resumen_lesiones;`);
    return res.json({
      status: "success",
      data: summary,
    });
  } catch (error) {
    console.error("Error al obtener reporte consolidado:", error);
    return res.status(500).json({ error: error.message });
  }
};

// 7. Calcular edad de un jugador usando la UDF de PostgreSQL (SCRUM-53)
export const getPlayerAge = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await AppDataSource.query(
      `SELECT calcular_edad(fecha_nacimiento) AS edad FROM jugadores WHERE id = $1;`,
      [parseInt(id, 10)]
    );
    if (result.length === 0) {
      return res.status(404).json({ error: "Futbolista no encontrado." });
    }
    return res.json({
      status: "success",
      edad: result[0].edad,
    });
  } catch (error) {
    console.error("Error al obtener edad del futbolista:", error);
    return res.status(500).json({ error: error.message });
  }
};

// 8. Obtener logs de auditoría (SCRUM-46)
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AppDataSource.query(
      "SELECT * FROM auditoria_datos ORDER BY fecha_evento DESC LIMIT 100;"
    );
    return res.json({
      status: "success",
      data: logs,
    });
  } catch (error) {
    console.error("Error al obtener logs de auditoría:", error);
    return res.status(500).json({ error: error.message });
  }
};

// 9. Obtener top jugadores más buscados (SCRUM-46)
export const getTopSearched = async (req, res) => {
  try {
    await AppDataSource.query(
      "ALTER TABLE busquedas ADD COLUMN IF NOT EXISTS tipo_buscador VARCHAR(50) DEFAULT 'clinico';"
    );

    const topClinico = await AppDataSource.query(`
      SELECT j.id, j.nombre, c.nombre AS equipo, COUNT(*) AS cantidad_busquedas
      FROM busquedas b
      JOIN jugadores j ON j.id = b.jugador_id
      LEFT JOIN clubes c ON c.id = j.club_fk
      WHERE b.tipo_buscador = 'clinico'
      GROUP BY j.id, j.nombre, c.nombre
      ORDER BY cantidad_busquedas DESC
      LIMIT 10;
    `);

    const topRendimiento = await AppDataSource.query(`
      SELECT j.id, j.nombre, c.nombre AS equipo, COUNT(*) AS cantidad_busquedas
      FROM busquedas b
      JOIN jugadores j ON j.id = b.jugador_id
      LEFT JOIN clubes c ON c.id = j.club_fk
      WHERE b.tipo_buscador = 'rendimiento'
      GROUP BY j.id, j.nombre, c.nombre
      ORDER BY cantidad_busquedas DESC
      LIMIT 10;
    `);

    return res.json({
      status: "success",
      data: {
        clinico: topClinico,
        rendimiento: topRendimiento
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
    const tipoBuscador = tipo || "clinico";
    const userEmail = req.headers["x-user-email"];
    let usuarioId = 1;
    if (userEmail) {
      const userResult = await AppDataSource.query("SELECT id FROM usuarios WHERE email = $1 LIMIT 1;", [userEmail]);
      if (userResult.length > 0) {
        usuarioId = userResult[0].id;
      }
    }
    await AppDataSource.query(
      "INSERT INTO busquedas (usuario_id, jugador_id, tipo_buscador) VALUES ($1, $2, $3);",
      [usuarioId, parseInt(id, 10), tipoBuscador]
    );
    return res.json({ status: "success" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getOrGenerateAuditReport = async (req, res) => {
  try {
    const { id } = req.params;
    let lesion = await injuryRepository.findOne({
      where: { jugador_id: parseInt(id, 10) },
      order: { id: "DESC" }
    });
    if (!lesion) {
      const aiAnalysis = await analyzeInjuryWithGemini("Rotura fibrilar en el bíceps femoral (Isquiotibiales)", 21);
      lesion = injuryRepository.create({
        jugador_id: parseInt(id, 10),
        tipo_lesion: "Rotura fibrilar en el bíceps femoral (Isquiotibiales)",
        dias_estimados_club: 21,
        tiempo_clinico_ia: aiAnalysis.tiempo_clinico_ia || null,
        analisis_comparativo: aiAnalysis.analisis_comparativo || "",
        estado: "En Recuperación"
      });
      await injuryRepository.save(lesion);
    } else if (!lesion.analisis_comparativo || !lesion.analisis_comparativo.includes("###")) {
      const aiAnalysis = await analyzeInjuryWithGemini(lesion.tipo_lesion, lesion.dias_estimados_club);
      lesion.tiempo_clinico_ia = aiAnalysis.tiempo_clinico_ia || null;
      lesion.analisis_comparativo = aiAnalysis.analisis_comparativo || "";
      await injuryRepository.save(lesion);
    }
    return res.json({ status: "success", data: lesion });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getSearchHistory = async (req, res) => {
  try {
    await AppDataSource.query(`
      CREATE OR REPLACE VIEW vista_historial_busquedas AS
      SELECT
          b.id,
          b.usuario_id,
          u.email AS usuario_email,
          b.jugador_id,
          j.nombre AS jugador_nombre,
          c.nombre AS equipo,
          b.tipo_buscador,
          b.fecha_busqueda
      FROM busquedas b
      JOIN usuarios u ON u.id = b.usuario_id
      JOIN jugadores j ON j.id = b.jugador_id
      LEFT JOIN clubes c ON j.club_fk = c.id;
    `);

    const userEmail = req.user?.email || req.headers["x-user-email"];
    if (!userEmail) {
      return res.status(400).json({ error: "Email de usuario no especificado." });
    }

    const history = await AppDataSource.query(
      "SELECT * FROM vista_historial_busquedas WHERE usuario_email = $1 ORDER BY fecha_busqueda DESC LIMIT 50;",
      [userEmail]
    );

    return res.json({
      status: "success",
      data: history,
    });
  } catch (error) {
    console.error("Error al obtener historial de búsquedas:", error);
    return res.status(500).json({ error: error.message });
  }
};
