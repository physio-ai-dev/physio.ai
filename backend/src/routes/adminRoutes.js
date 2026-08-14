import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/authMiddleware.js";
import AppDataSource from "../config/database.js";
import UserSchema from "../models/UserSchema.js";
import SearchSchema from "../models/SearchSchema.js";
import { MoreThanOrEqual } from "typeorm";

const router = Router();

router.get("/metrics", authenticateToken, requireRole(["admin"]), async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(UserSchema);
    const searchRepository = AppDataSource.getRepository(SearchSchema);

    // 1. Distribución de usuarios por plan/tier usando QueryBuilder de TypeORM
    const usersDistributionRaw = await userRepository
      .createQueryBuilder("user")
      .select("user.subscription_tier", "tier")
      .addSelect("COUNT(user.id)", "count")
      .groupBy("user.subscription_tier")
      .getRawMany();

    // 2. Conteo total de usuarios registrados usando API oficial de TypeORM Repository
    const totalUsers = await userRepository.count();

    // 3. Conteo de usuarios premium usando API oficial de TypeORM Repository
    const premiumCount = await userRepository.count({
      where: { subscription_tier: "premium" }
    });

    // 4. Consultas del buscador por día (últimos 30 días) usando QueryBuilder de TypeORM
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - 30);

    const dailySearchesRaw = await searchRepository
      .createQueryBuilder("search")
      .select("TO_CHAR(search.search_date, 'YYYY-MM-DD')", "date")
      .addSelect("COUNT(search.id)", "count")
      .where("search.search_date >= :limitDate", { limitDate })
      .groupBy("TO_CHAR(search.search_date, 'YYYY-MM-DD')")
      .orderBy("date", "ASC")
      .getRawMany();

    // 5. Ingresos mensuales proyectados ($5 por usuario premium)
    const monthlyIncomeProjections = [
      { month: "En-26", income: premiumCount * 5 * 0.8 },
      { month: "Feb-26", income: premiumCount * 5 * 0.9 },
      { month: "Mar-26", income: premiumCount * 5 }
    ];

    return res.json({
      status: "success",
      data: {
        totalUsers,
        premiumCount,
        usersDistribution: usersDistributionRaw.map(u => ({
          name: u.tier === "premium" ? "Pro (Premium)" : u.tier === "free" ? "Free" : "Invitado",
          value: parseInt(u.count, 10)
        })),
        dailySearches: dailySearchesRaw.map(s => ({
          date: s.date,
          count: parseInt(s.count, 10)
        })),
        incomeProjections: monthlyIncomeProjections
      }
    });
  } catch (error) {
    console.error("Error al obtener métricas de administrador:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
