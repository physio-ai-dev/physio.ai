import { Router } from "express";
import { searchPlayer } from "../controllers/playerController.js";
import {
  createPlayer,
  getPlayers,
  getPlayerById,
  updatePlayer,
  deletePlayer,
  getLeagues,
  getPositions,
  getClubs,
  getInjuryReportSummary,
  getPlayerAge,
  getAuditLogs,
  getTopSearched,
} from "../controllers/playerCrudController.js";

const router = Router();

// Buscador unificado (API externa + Caché local)
router.get("/search", searchPlayer);

// Catálogo de Ligas
router.get("/leagues", getLeagues);

// Catálogo de Posiciones
router.get("/positions", getPositions);

// Catálogo de Clubes (para filtrado dinámico)
router.get("/clubs", getClubs);

// Reportes Consolidados (SCRUM-53)
router.get("/reports/summary", getInjuryReportSummary);
router.get("/reports/audit", getAuditLogs);
router.get("/reports/top-searched", getTopSearched);
router.get("/:id/age", getPlayerAge);

// Rutas de CRUD Local de futbolistas (SCRUM-44)
router.post("/", createPlayer);
router.get("/", getPlayers);
router.get("/:id", getPlayerById);
router.put("/:id", updatePlayer);
router.delete("/:id", deletePlayer);

export default router;
