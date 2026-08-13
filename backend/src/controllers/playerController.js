import AppDataSource from "../config/database.js";
import PlayerSchema from "../models/PlayerSchema.js";
import InjurySchema from "../models/InjurySchema.js";
import ClubSchema from "../models/ClubSchema.js";
import PositionSchema from "../models/PositionSchema.js";
import LeagueSchema from "../models/LeagueSchema.js";
import UserSchema from "../models/UserSchema.js";
import SearchLimitSchema from "../models/SearchLimitSchema.js";
import { searchPlayerFromAPI } from "../services/footballApiService.js";

async function resolveRelations(teamName, positionName, leagueName) {
  const clubRepository = AppDataSource.getRepository(ClubSchema);
  const positionRepository = AppDataSource.getRepository(PositionSchema);
  const leagueRepository = AppDataSource.getRepository(LeagueSchema);

  let resolvedPositionName = "Defensa";
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

  let dbPosition = await positionRepository.findOne({ where: { name: resolvedPositionName } });
  if (!dbPosition) {
    dbPosition = await positionRepository.save(positionRepository.create({ name: resolvedPositionName }));
  }

  const resolvedLeagueName = leagueName || "Local / Otro";
  let dbLeague = await leagueRepository.findOne({ where: { name: resolvedLeagueName } });
  if (!dbLeague) {
    dbLeague = await leagueRepository.save(leagueRepository.create({ name: resolvedLeagueName, country: "Importado" }));
  }

  const resolvedClubName = teamName || "Club Desconocido";
  let dbClub = await clubRepository.findOne({ where: { name: resolvedClubName }, relations: ["league"] });
  if (!dbClub) {
    dbClub = await clubRepository.save(clubRepository.create({
      name: resolvedClubName,
      league: dbLeague,
    }));
  } else if (!dbClub.league || dbClub.league.id !== dbLeague.id) {
    dbClub.league = dbLeague;
    await clubRepository.save(dbClub);
  }

  return { dbClub, dbPosition };
}

export const searchPlayer = async (req, res) => {
  try {
    const { name, league, season } = req.query;

    if (!name) {
      return res.status(400).json({ error: "El parámetro de búsqueda 'name' es requerido" });
    }

    const userEmail = req.headers["x-user-email"];
    let isPremium = false;
    let identifier = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";

    if (userEmail) {
      const userRepository = AppDataSource.getRepository(UserSchema);
      const user = await userRepository.findOne({ where: { email: userEmail } });
      if (user) {
        identifier = user.email;
        if (user.subscription_tier === "premium") {
          isPremium = true;
        }
      }
    }

    if (!isPremium) {
      const limitRepository = AppDataSource.getRepository(SearchLimitSchema);
      const today = new Date().toISOString().split("T")[0];
      let limitLog = await limitRepository.findOne({ where: { identifier } });

      if (limitLog) {
        if (limitLog.last_search === today && limitLog.quantity >= 3) {
          return res.status(429).json({
            status: "limit_reached",
            error: "Has alcanzado el límite de 3 búsquedas gratuitas por día."
          });
        }
        limitLog.quantity = limitLog.last_search === today ? limitLog.quantity + 1 : 1;
        limitLog.last_search = today;
        await limitRepository.save(limitLog);
      } else {
        await limitRepository.save(limitRepository.create({
          identifier,
          quantity: 1,
          last_search: today
        }));
      }
    }

    const playerRepository = AppDataSource.getRepository(PlayerSchema);
    const injuryRepository = AppDataSource.getRepository(InjurySchema);

    const cleanSearchName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    const localPlayers = await playerRepository.createQueryBuilder("player")
      .leftJoinAndSelect("player.club", "club")
      .leftJoinAndSelect("club.league", "league")
      .leftJoinAndSelect("player.position", "position")
      .where("player.name ILIKE :name", { name: `%${cleanSearchName}%` })
      .getMany();

    if (localPlayers && localPlayers.length > 0) {
      const savedPlayers = [];

      for (const player of localPlayers) {
        const injuries = await injuryRepository.find({
          where: { player_id: player.id },
          order: { id: "DESC" },
        });

        savedPlayers.push({
          id: player.id,
          apiId: player.api_id,
          name: player.name,
          club: player.club?.name || "Equipo Desconocido",
          position: player.position?.name || "Sin Posición",
          photoUrl: player.photo_url,
          birthdate: player.birthdate,
          league: player.club?.league?.name || "Liga Desconocida",
          height: player.height || "Sin estatura",
          marketValue: player.market_value || "No disponible",
          createdAt: player.created_at,
          injuries: injuries,
          aiReport: injuries[0] || null,
        });
      }

      return res.json({
        status: "success",
        count: savedPlayers.length,
        data: savedPlayers,
      });
    }

    const apiResults = await searchPlayerFromAPI(name, league, season || 2024);

    if (!apiResults || apiResults.length === 0) {
      return res.status(404).json({ error: "No se encontraron futbolistas con ese nombre" });
    }

    const savedPlayers = [];

    for (const item of apiResults) {
      const apiPlayer = item.player;
      const apiStats = item.statistics[0] || {};

      let player = await playerRepository.findOne({
        where: { api_id: apiPlayer.id },
        relations: ["club", "club.league", "position"],
      });

      const { dbClub, dbPosition } = await resolveRelations(
        apiStats.team?.name,
        apiStats.games?.position,
        apiStats.league?.name
      );

      if (!player) {
        player = playerRepository.create({
          api_id: apiPlayer.id,
          name: apiPlayer.name,
          club: dbClub,
          position: dbPosition,
          photo_url: apiPlayer.photo || null,
          birthdate: apiPlayer.birth?.date || null,
          height: apiPlayer.height || "Sin estatura",
          market_value: "No disponible",
        });

        await playerRepository.save(player);
      } else {
        let updated = false;
        if (apiPlayer.photo && !player.photo_url) {
          player.photo_url = apiPlayer.photo;
          updated = true;
        }
        if (apiPlayer.birth?.date && !player.birthdate) {
          player.birthdate = apiPlayer.birth.date;
          updated = true;
        }
        if (dbClub && (!player.club || player.club.id !== dbClub.id)) {
          player.club = dbClub;
          updated = true;
        }
        if (dbPosition && (!player.position || player.position.id !== dbPosition.id)) {
          player.position = dbPosition;
          updated = true;
        }
        if (apiPlayer.height && !player.height) {
          player.height = apiPlayer.height;
          updated = true;
        }
        if (!player.market_value) {
          player.market_value = "No disponible";
          updated = true;
        }
        if (updated) {
          await playerRepository.save(player);
        }
      }

      const injuries = await injuryRepository.find({
        where: { player_id: player.id },
        order: { id: "DESC" },
      });

      savedPlayers.push({
        id: player.id,
        apiId: player.api_id,
        name: player.name,
        club: player.club?.name || "Equipo Desconocido",
        position: player.position?.name || "Sin Posición",
        photoUrl: player.photo_url,
        birthdate: player.birthdate,
        league: player.club?.league?.name || "Liga Desconocida",
        height: player.height || "Sin estatura",
        marketValue: player.market_value || "No disponible",
        createdAt: player.created_at,
        injuries: injuries,
        aiReport: injuries[0] || null,
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
