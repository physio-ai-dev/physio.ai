import { Router } from "express";
import { searchPlayer } from "../controllers/playerController.js";

const router = Router();

// GET /api/players/search?name=...
router.get("/search", searchPlayer);

export default router;
