import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Divider,
  Stack
} from "@mui/material";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { api } from "../../api/backend";
import LoadingSpinner from "../Common/Layout/LoadingSpinner";
import ErrorAlert from "../Common/Feedback/ErrorAlert";
import GlassCard from "../Common/Layout/GlassCard";
import PageTitle from "../Common/Typography/PageTitle";

const COLORS = ["#10b981", "#38bdf8", "#818cf8", "#f59e0b", "#fb7185"];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getAdminMetrics();
        if (res.status === "success" && res.data) {
          setMetrics(res.data);
        }
      } catch (err) {
        setError(err.message || "Error al obtener métricas del negocio.");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) return <LoadingSpinner py={8} />;
  if (error) return <ErrorAlert message={error} />;
  if (!metrics) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <PageTitle
        title="Panel Analítico Ejecutivo"
        subtitle="Adopción de usuarios, visualización de ingresos y actividad en tiempo real de Physio.AI."
      />

      {/* KPI Cards Rediseñadas - No copian a KpiCounter/TopBuscados. Tienen estilo de bloque de negocios premium */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <GlassCard sx={{ p: 4, position: "relative", overflow: "hidden", "&:hover": { borderColor: "rgba(56, 189, 248, 0.4)" }, transition: "all 0.3s" }}>
            <Box sx={{ position: "absolute", top: 0, right: 0, width: 90, height: 90, background: "radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)" }} />
            <Typography variant="overline" sx={{ color: "rgba(255, 255, 255, 0.4)", fontWeight: 700, letterSpacing: 1.5 }}>
              Comunidad
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 950, color: "#38bdf8", mt: 1, letterSpacing: "-1.5px" }}>
              {metrics.totalUsers}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: "0.85rem", fontWeight: 500 }}>
              Usuarios registrados en la plataforma
            </Typography>
          </GlassCard>
        </Grid>

        <Grid item xs={12} sm={4}>
          <GlassCard sx={{ p: 4, position: "relative", overflow: "hidden", "&:hover": { borderColor: "rgba(16, 185, 129, 0.4)" }, transition: "all 0.3s" }}>
            <Box sx={{ position: "absolute", top: 0, right: 0, width: 90, height: 90, background: "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)" }} />
            <Typography variant="overline" sx={{ color: "rgba(255, 255, 255, 0.4)", fontWeight: 700, letterSpacing: 1.5 }}>
              Adopción Comercial
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 950, color: "#10b981", mt: 1, letterSpacing: "-1.5px" }}>
              {metrics.premiumCount}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: "0.85rem", fontWeight: 500 }}>
              Suscripciones activas de plan PRO
            </Typography>
          </GlassCard>
        </Grid>

        <Grid item xs={12} sm={4}>
          <GlassCard sx={{ p: 4, position: "relative", overflow: "hidden", "&:hover": { borderColor: "rgba(251, 113, 133, 0.4)" }, transition: "all 0.3s" }}>
            <Box sx={{ position: "absolute", top: 0, right: 0, width: 90, height: 90, background: "radial-gradient(circle, rgba(251, 113, 133, 0.08) 0%, transparent 70%)" }} />
            <Typography variant="overline" sx={{ color: "rgba(255, 255, 255, 0.4)", fontWeight: 700, letterSpacing: 1.5 }}>
              Ingresos Mensuales
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 950, color: "#fb7185", mt: 1, letterSpacing: "-1.5px" }}>
              ${metrics.premiumCount * 5} <Typography component="span" variant="h5" color="text.secondary" sx={{ fontWeight: 800 }}>USD</Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: "0.85rem", fontWeight: 500 }}>
              Recurrencia estimada actual
            </Typography>
          </GlassCard>
        </Grid>
      </Grid>

      {/* Gráfico de Monetización e Ingresos */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <GlassCard>
            <Box sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={850} mb={0.5}>
                Proyecciones e Ingresos Históricos
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mb={4}>
                Historial de facturación estimado según periodicidad mensual
              </Typography>
              <Box sx={{ width: "100%", height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.incomeProjections}>
                    <defs>
                      <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb7185" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                    <XAxis dataKey="month" tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 11, fontWeight: 600 }} />
                    <YAxis tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(11, 21, 40, 0.95)",
                        borderColor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: 12,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                      }}
                    />
                    <Area type="monotone" dataKey="income" name="Facturado (USD)" stroke="#fb7185" fillOpacity={1} fill="url(#gradIncome)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </GlassCard>
        </Grid>

        {/* Distribución de Usuarios (Donut) */}
        <Grid item xs={12} md={4}>
          <GlassCard sx={{ height: "100%" }}>
            <Box sx={{ p: 4, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h6" fontWeight={850} mb={0.5}>
                  Suscripciones por Plan
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={3}>
                  Segmentación porcentual de la base de datos
                </Typography>
              </Box>
              <Box sx={{ width: "100%", height: 200, display: "flex", justifyContent: "center", alignItems: "center", my: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.usersDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {metrics.usersDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(11, 21, 40, 0.95)",
                        borderColor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Stack direction="row" flexWrap="wrap" gap={2} justifyContent="center">
                {metrics.usersDistribution.map((entry, index) => (
                  <Box key={entry.name} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: COLORS[index % COLORS.length] }} />
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      {entry.name} ({entry.value})
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </GlassCard>
        </Grid>
      </Grid>

      {/* Volumen temporal de búsquedas */}
      <GlassCard>
        <Box sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={850} mb={0.5}>
            Consultas Diarias Realizadas
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={4}>
            Volumen temporal de análisis ejecutados en los últimos 30 días
          </Typography>
          <Box sx={{ width: "100%", height: 320 }}>
            {metrics.dailySearches.length === 0 ? (
              <Box sx={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography color="text.secondary" fontWeight={500}>Sin búsquedas registradas en los últimos 30 días.</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.dailySearches}>
                  <defs>
                    <linearGradient id="gradDailySearches" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                  <XAxis dataKey="date" tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 10, fontWeight: 600 }} />
                  <YAxis allowDecimals={false} tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 11 }} />
                  <Tooltip
                    cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
                    contentStyle={{
                      backgroundColor: "rgba(11, 21, 40, 0.95)",
                      borderColor: "rgba(255, 255, 255, 0.08)",
                      borderRadius: 12,
                    }}
                  />
                  <Bar dataKey="count" name="Búsquedas" fill="url(#gradDailySearches)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </Box>
      </GlassCard>
    </Box>
  );
}
