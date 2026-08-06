import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken"; // <-- NUEVO: Importamos jsonwebtoken
import "dotenv/config";
import AppDataSource from "./config/database.js";
import playerRoutes from "./routes/playerRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
// Ya no importamos authRoutes porque lo haremos directo aquí

const app = express();

app.use(cors());
app.use(express.json());

// Health check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend Physio.AI funcionando correctamente",
  });
});

app.use("/api/players", playerRoutes);
app.use("/api/ai", aiRoutes);

// INICIO DE SESIÓN Y TOKENS

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  // 1. Validar si el correo y la clave son correctos
  if (email !== "admin@physio.ai" || password !== "123456") {
    return res.status(401).json({ message: "Credenciales incorrectas" });
  }

  // 2. Generar el Token JWT
  const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro";
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "24h" });

  // 3. Enviar el token al frontend
  return res.json({ status: "success", token });
});
// =======================================================

// Init PostgreSQL, Server
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