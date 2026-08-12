import express from "express";
import cors from "cors";
import "dotenv/config";
import rateLimit from "express-rate-limit";
import AppDataSource from "./config/database.js";
import playerRoutes from "./routes/playerRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import { obtenerEstadisticas, obtenerAnalisisIA } from "./controllers/dashboardController.js";
import { authenticateToken } from "./middleware/authMiddleware.js";

const app = express();

app.use(cors());
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

// ==========================================
// SCRUM-89: Limitador de peticiones (Rate Limit)
// ==========================================
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // Máximo 10 peticiones por minuto por IP
  message: {
    ok: false,
    message: "Demasiadas peticiones. Por favor, intente de nuevo en un minuto.",
  },
});

// Aplica el límite a todas las rutas que empiezan con /api/
app.use("/api/", apiLimiter);

// Ruta de prueba de estado
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend Physio.AI funcionando correctamente",
  });
});

// Rutas principales
app.use("/api/players", playerRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stripe", stripeRoutes);

// Rutas del Dashboard
app.get("/api/stats", authenticateToken, obtenerEstadisticas);
app.post("/api/analysis", authenticateToken, obtenerAnalisisIA);

// ==========================================
// SCRUM-90 & 91: Manejador Global de Errores
// ==========================================
app.use((err, req, res, next) => {
  // Solo imprime la traza detallada en consola si no estás en producción
  if (process.env.NODE_ENV !== "production") {
    console.error("Error interno:", err);
  }

  // Respuesta limpia para el usuario sin exponer credenciales ni código interno
  res.status(err.status || 500).json({
    ok: false,
    message: err.message || "Ocurrió un error interno en el servidor.",
  });
});

// Inicialización de PostgreSQL y Servidor
AppDataSource.initialize()
  .then(() => {
    console.log("Base de datos PostgreSQL conectada exitosamente");
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error al conectar con la base de datos:", error);
    process.exit(1);
  });