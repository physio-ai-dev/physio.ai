import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
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
import { api } from "../api/backend";

export default function DashboardPanel({ jugadorId }) {
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingIA, setLoadingIA] = useState(true);
  const [errorStats, setErrorStats] = useState(null);
  const [errorIA, setErrorIA] = useState(null);
  const [stats, setStats] = useState(null);
  const [analisis, setAnalisis] = useState("");
  const [range, setRange] = useState(10);

  useEffect(() => {
    if (!jugadorId) return;

    // 1. Petición independiente de Estadísticas
    const cargarEstadisticas = async () => {
      setLoadingStats(true);
      setErrorStats(null);
      try {
        const dataStats = await api.obtenerEstadisticas(jugadorId);
        setStats(dataStats);
      } catch (err) {
        setErrorStats(err.message || "Error al cargar las estadísticas.");
      } finally {
        setLoadingStats(false);
      }
    };

    // 2. Petición independiente de Análisis IA
    const cargarAnalisisIA = async () => {
      setLoadingIA(true);
      setErrorIA(null);
      try {
        const dataIA = await api.obtenerAnalisisIA(jugadorId);
        setAnalisis(dataIA.reporte || dataIA.resultado || "");
      } catch (err) {
        setErrorIA(err.message || "Error al generar el análisis de IA.");
      } finally {
        setLoadingIA(false);
      }
    };

    cargarEstadisticas();
    cargarAnalisisIA();
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
          <Card variant="outlined" sx={{ height: "100%", borderRadius: 4, bgcolor: "rgba(255, 255, 255, 0.01)" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ color: "primary.light", mb: 2, fontWeight: 800 }}>
                Resumen de Rendimiento
              </Typography>
              {loadingStats ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={28} color="primary" />
                </Box>
              ) : errorStats ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>{errorStats}</Alert>
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
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Tendencia */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ height: "100%", borderRadius: 4, bgcolor: "rgba(255, 255, 255, 0.01)" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ color: "primary.light", mb: 2, fontWeight: 800 }}>
                Tendencia de Calificación
              </Typography>
              {loadingStats ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={28} color="primary" />
                </Box>
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
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de Goles y Asistencias */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ borderRadius: 4, bgcolor: "rgba(255, 255, 255, 0.01)" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ color: "primary.light", mb: 2, fontWeight: 800 }}>
                Goles y Asistencias por Partido
              </Typography>
              {loadingStats ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={28} color="primary" />
                </Box>
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
            </CardContent>
          </Card>
        </Grid>

        {/* Panel del Análisis Predictivo de la IA */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: "100%", border: "1px solid rgba(16, 185, 129, 0.25)", borderRadius: 4, bgcolor: "rgba(16, 185, 129, 0.01)" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ color: "primary.light", mb: 1, fontWeight: 800 }}>
                Análisis Predictivo IA
              </Typography>
              <Divider sx={{ mb: 2, borderColor: "rgba(255, 255, 255, 0.05)" }} />
              {loadingIA ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={28} color="primary" />
                </Box>
              ) : errorIA ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>{errorIA}</Alert>
              ) : (
                <Typography variant="body2" sx={{ lineHeight: 1.8, whiteSpace: "pre-line", color: "text.secondary", fontWeight: 500 }}>
                  {analisis || "No hay información disponible de la IA para este futbolista."}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}