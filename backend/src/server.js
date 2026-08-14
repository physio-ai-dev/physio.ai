import express from "express";
import cors from "cors";
import "dotenv/config";
import rateLimit from "express-rate-limit";
import AppDataSource, { initializeDatabaseAddons } from "./config/database.js";
import playerRoutes from "./routes/playerRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import {
  getPlayerStats,
  getPlayerPerformanceAIAnalysis,
} from "./controllers/dashboardController.js";
import { authenticateToken } from "./middleware/authMiddleware.js";

const app = express();

app.use(cors());
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: {
    ok: false,
    message: "Demasiadas peticiones. Por favor, intente de nuevo en un minuto.",
  },
});

app.use("/api/", apiLimiter);

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend Physio.AI funcionando correctamente",
  });
});

app.use("/api/players", playerRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stripe", stripeRoutes);

app.get("/api/stats", authenticateToken, getPlayerStats);
app.post("/api/analysis", authenticateToken, getPlayerPerformanceAIAnalysis);

app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.error("❌ Error interno:", err);
  }

  res.status(err.status || 500).json({
    ok: false,
    message: err.message || "Ocurrió un error interno en el servidor.",
  });
});
AppDataSource.initialize()
  .then(async () => {
    console.log("✅ Base de datos PostgreSQL conectada exitosamente");
    await initializeDatabaseAddons();
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error al conectar con la base de datos:", error);
    process.exit(1);
  });
