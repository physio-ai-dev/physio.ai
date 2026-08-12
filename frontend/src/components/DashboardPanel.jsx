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
} from "@mui/material";
import { api } from "../api/backend";

export default function DashboardPanel({ jugadorId }) {
  // SCRUM-82: Estados de carga, error y datos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [analisis, setAnalisis] = useState("");

  // SCRUM-83: Pruebas de integración consumiendo ambas APIs al montar el componente
  useEffect(() => {
    const cargarDatosDashboard = async () => {
      if (!jugadorId) return;
      setLoading(true);
      setError(null);

      try {
        // Ejecuta ambas peticiones en paralelo
        const [dataStats, dataIA] = await Promise.all([
          api.obtenerEstadisticas(jugadorId),
          api.obtenerAnalisisIA(jugadorId),
        ]);

        setStats(dataStats);
        setAnalisis(dataIA.reporte || dataIA.resultado);
      } catch (err) {
        setError(err.message || "Error de conexión con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatosDashboard();
  }, [jugadorId]);

  // SCRUM-82: Renderizado visual cuando está cargando
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // SCRUM-82: Renderizado visual cuando ocurre un error de conexión
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, my: 2 }}>
      {/* SCRUM-80: Tabla de Estadísticas Numéricas */}
      {stats && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ color: "primary.light", mb: 2, fontWeight: 700 }}>
              Estadísticas Temporada
            </Typography>
            <TableContainer component={Paper} sx={{ bgcolor: "rgba(3, 7, 18, 0.4)" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "text.secondary", fontWeight: 700 }}>Métrica</TableCell>
                    <TableCell align="right" sx={{ color: "text.secondary", fontWeight: 700 }}>
                      Valor
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ color: "text.primary" }}>Partidos Jugados</TableCell>
                    <TableCell align="right" sx={{ color: "primary.main", fontWeight: 800 }}>
                      {stats.partidos ?? 0}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ color: "text.primary" }}>Goles</TableCell>
                    <TableCell align="right" sx={{ color: "primary.main", fontWeight: 800 }}>
                      {stats.goles ?? 0}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ color: "text.primary" }}>Asistencias</TableCell>
                    <TableCell align="right" sx={{ color: "primary.main", fontWeight: 800 }}>
                      {stats.asistencias ?? 0}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* SCRUM-80: Panel del Análisis Predictivo de la IA */}
      {analisis && (
        <Card sx={{ border: "1px solid rgba(16, 185, 129, 0.3)" }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: "primary.light", mb: 1, fontWeight: 700 }}>
              Análisis Predictivo IA
            </Typography>
            <Divider sx={{ mb: 2, borderColor: "rgba(255, 255, 255, 0.08)" }} />
            <Typography variant="body2" sx={{ lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {analisis}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}