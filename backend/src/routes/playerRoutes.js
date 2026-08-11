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
  recordPlayerSelection,
  getOrGenerateAuditReport,
} from "../controllers/playerCrudController.js";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

// Buscador unificado (API externa + Caché local)
router.get("/search", searchPlayer);

// Catálogo de Ligas
router.get("/leagues", getLeagues);

// Catálogo de Posiciones
router.get("/positions", getPositions);

// Catálogo de Clubes (para filtrado dinámico)
router.get("/clubs", getClubs);

router.get("/reports/summary", authenticateToken, requireRole(["administrador", "auditor", "premium"]), getInjuryReportSummary);
router.get("/reports/audit", authenticateToken, requireRole(["administrador", "auditor"]), getAuditLogs);
router.get("/reports/top-searched", authenticateToken, requireRole(["administrador", "auditor", "usuario", "premium"]), getTopSearched);
router.get("/:id/age", getPlayerAge);
router.post("/:id/select", recordPlayerSelection);
router.get("/:id/audit-report", getOrGenerateAuditReport);

// Rutas de CRUD Local de futbolistas (SCRUM-44)
router.post("/", createPlayer);
router.get("/", getPlayers);
router.get("/:id", getPlayerById);
router.put("/:id", updatePlayer);
router.delete("/:id", deletePlayer);

export default router;
