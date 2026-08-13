import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  FormControl,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { api } from "../../api/backend";
import LoadingSpinner from "../Common/Layout/LoadingSpinner";
import ErrorAlert from "../Common/Feedback/ErrorAlert";
import GlassCard from "../Common/Layout/GlassCard";

export default function DashboardPanel({ jugadorId }) {
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingIA, setLoadingIA] = useState(true);
  const [errorStats, setErrorStats] = useState(null);
  const [errorIA, setErrorIA] = useState(null);
  const [stats, setStats] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [range, setRange] = useState(10);

  useEffect(() => {
    if (!jugadorId) return;

    const loadStats = async () => {
      setLoadingStats(true);
      setErrorStats(null);
      try {
        const dataStats = await api.getPlayerStats(jugadorId);
        setStats(dataStats);
      } catch (err) {
        setErrorStats(err.message || "Error al cargar las estadísticas.");
      } finally {
        setLoadingStats(false);
      }
    };

    const loadIAAnalysis = async () => {
      setLoadingIA(true);
      setErrorIA(null);
      try {
        const dataIA = await api.getPlayerPerformanceAnalysis(jugadorId);
        setAnalysis(dataIA.reporte || dataIA.resultado || "");
      } catch (err) {
        setErrorIA(err.message || "Error al generar el análisis de IA.");
      } finally {
        setLoadingIA(false);
      }
    };

    loadStats();
    loadIAAnalysis();
  }, [jugadorId]);

  const matches = stats?.recentMatches || [];
  const filteredMatches = range === "all" ? matches : matches.slice(-range);

  const totalGoles = filteredMatches.reduce((acc, m) => acc + (m.goals || 0), 0);
  const totalAsistencias = filteredMatches.reduce((acc, m) => acc + (m.assists || 0), 0);
  const avgRating =
    filteredMatches.length > 0
      ? (filteredMatches.reduce((acc, m) => acc + (m.rating || 0), 0) / filteredMatches.length).toFixed(2)
      : 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, my: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.5px" }}>
          Dashboard de Rendimiento
        </Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            sx={{
              borderRadius: 3,
              bgcolor: "rgba(255, 255, 255, 0.02)",
              fontWeight: 700,
              fontSize: "0.85rem",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <MenuItem value={5}>Últimos 5 partidos</MenuItem>
            <MenuItem value={10}>Últimos 10 partidos</MenuItem>
            <MenuItem value="all">Todos los partidos</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Panel Resumen de Estadísticas */}
        <Grid item xs={12} md={4}>
          <GlassCard sx={{ height: "100%" }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ color: "primary.light", mb: 2, fontWeight: 800 }}>
                Resumen de Rendimiento
              </Typography>
              {loadingStats ? (
                <LoadingSpinner py={4} />
              ) : errorStats ? (
                <ErrorAlert message={errorStats} />
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ bgcolor: "transparent" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: "text.secondary", fontWeight: 700, borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Métrica</TableCell>
                        <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 700, borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Valor</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Partidos</TableCell>
                        <TableCell align="right" sx={{ color: "primary.main", fontWeight: 800, borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                          {filteredMatches.length || stats?.partidos || 0}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Goles</TableCell>
                        <TableCell align="right" sx={{ color: "primary.main", fontWeight: 800, borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                          {totalGoles || stats?.goles || 0}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>Asistencias</TableCell>
                        <TableCell align="right" sx={{ color: "primary.main", fontWeight: 800, borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                          {totalAsistencias || stats?.asistencias || 0}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ borderBottom: "none" }}>Calificación Promedio</TableCell>
                        <TableCell align="right" sx={{ color: "primary.main", fontWeight: 800, borderBottom: "none" }}>
                          {avgRating}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </GlassCard>
        </Grid>

        {/* Gráfico de Tendencia */}
        <Grid item xs={12} md={8}>
          <GlassCard sx={{ height: "100%" }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ color: "primary.light", mb: 2, fontWeight: 800 }}>
                Tendencia de Calificación
              </Typography>
              {loadingStats ? (
                <LoadingSpinner py={4} />
              ) : (
                <Box sx={{ width: "100%", height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredMatches} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="match" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                      <YAxis domain={[5, 10]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "rgba(11, 21, 40, 0.95)", borderColor: "rgba(255,255,255,0.08)", borderRadius: 8 }}
                        labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                      />
                      <Line type="monotone" dataKey="rating" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Box>
          </GlassCard>
        </Grid>

        {/* Gráfico de Goles y Asistencias */}
        <Grid item xs={12} md={6}>
          <GlassCard>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ color: "primary.light", mb: 2, fontWeight: 800 }}>
                Goles y Asistencias por Partido
              </Typography>
              {loadingStats ? (
                <LoadingSpinner py={4} />
              ) : (
                <Box sx={{ width: "100%", height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredMatches} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="match" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                      <YAxis allowDecimals={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "rgba(11, 21, 40, 0.95)", borderColor: "rgba(255,255,255,0.08)", borderRadius: 8 }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="goals" name="Goles" fill="#10b981" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="assists" name="Asistencias" fill="#60a5fa" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Box>
          </GlassCard>
        </Grid>

        {/* Panel del Análisis Predictivo de la IA */}
        <Grid item xs={12} md={6}>
          <GlassCard sx={{ height: "100%", border: "1px solid rgba(16, 185, 129, 0.25)", bgcolor: "rgba(16, 185, 129, 0.01)" }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ color: "primary.light", mb: 1, fontWeight: 800 }}>
                Análisis Predictivo IA
              </Typography>
              <Divider sx={{ mb: 2, borderColor: "rgba(255, 255, 255, 0.05)" }} />
              {loadingIA ? (
                <LoadingSpinner py={4} />
              ) : errorIA ? (
                <ErrorAlert message={errorIA} />
              ) : (
                <Typography variant="body2" sx={{ lineHeight: 1.8, whiteSpace: "pre-line", color: "text.secondary", fontWeight: 500 }}>
                  {analysis || "No hay información disponible de la IA para este futbolista."}
                </Typography>
              )}
            </Box>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
