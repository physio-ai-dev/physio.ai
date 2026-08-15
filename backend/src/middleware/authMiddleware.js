import jwt from "jsonwebtoken";
import UserSchema from "../models/UserSchema.js";
import AppDataSource from "../config/database.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token de acceso requerido." });
  }

  const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro";

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: "Token inválido o expirado." });
    }
    req.user = user;
    next();
  });
};

export const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado." });
    }

    const userRepository = AppDataSource.getRepository(UserSchema);
    const dbUser = await userRepository.findOne({ where: { id: req.user.id } });

    const roleToCheck = dbUser ? dbUser.role : req.user.role;
    const tierToCheck = dbUser ? dbUser.subscription_tier : req.user.subscription_tier;

    const hasRole = allowedRoles.includes(roleToCheck);
    const hasPremium = allowedRoles.includes("premium") && tierToCheck === "premium";

    if (hasRole || hasPremium) {
      return next();
    }

    return res.status(403).json({ error: "Acceso denegado: permisos insuficientes." });
  };
};
