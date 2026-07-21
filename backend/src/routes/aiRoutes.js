import { Router } from "express";
import { analyzeInjury } from "../controllers/aiController.js";

const router = Router();

// Endpoint: POST /api/ai/analyze
router.post("/analyze", analyzeInjury);

export default router;