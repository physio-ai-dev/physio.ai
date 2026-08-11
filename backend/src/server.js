import express from "express";
import cors from "cors";
import "dotenv/config";
import AppDataSource from "./config/database.js";
import playerRoutes from "./routes/playerRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";

const app = express();

app.use(cors());
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

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

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Base de datos PostgreSQL conectada exitosamente");
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error al conectar con la base de datos:", error);
    process.exit(1);
  });
