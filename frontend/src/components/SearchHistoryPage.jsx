import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip
} from "@mui/material";
import {
  OpenInNew as OpenInNewIcon,
  MedicalServices as MedicalServicesIcon,
  Dashboard as DashboardIcon
} from "@mui/icons-material";
import { api } from "../api/backend";

export default function SearchHistoryPage({ onSelectPlayerClinical, onSelectPlayerPerformance }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const cargarHistorial = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.obtenerHistorialBusquedas();
        if (res.status === "success" && Array.isArray(res.data)) {
          setHistory(res.data);
        } else {
          setHistory([]);
        }
      } catch (err) {
        setError(err.message || "Error al obtener el historial de búsquedas.");
      } finally {
        setLoading(false);
      }
    };

    cargarHistorial();
  }, []);

  const handleRowClick = (item) => {
    const player = {
      id: item.jugador_id,
      nombre: item.jugador_nombre,
      equipo: item.equipo,
    };
    if (item.tipo_buscador === "clinico") {
      if (onSelectPlayerClinical) onSelectPlayerClinical(player);
    } else {
      if (onSelectPlayerPerformance) onSelectPlayerPerformance(player);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: "-1px" }}>
          Historial de Búsquedas
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
          Revisa tus últimas consultas clínicas y de rendimiento deportivo. Haz clic en la acción de cualquier registro para cargarlo nuevamente.
        </Typography>
      </Box>

      {history.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          Aún no tienes búsquedas en tu historial. Realiza búsquedas clínicas o de rendimiento para verlas aquí.
        </Alert>
      ) : (
        <Card variant="outlined" sx={{ borderRadius: 4, bgcolor: "rgba(255, 255, 255, 0.01)" }}>
          <TableContainer>
            <Table sx={{ minWidth: 600 }}>
              <TableHead sx={{ bgcolor: "rgba(255, 255, 255, 0.02)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Futbolista</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Club / Equipo</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Tipo de Búsqueda</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Fecha / Hora</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800 }}>Cargar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((item) => (
                  <TableRow
                    key={item.id}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                      {item.jugador_nombre}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontWeight: 500 }}>
                      {item.equipo || "Sin equipo"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={item.tipo_buscador === "clinico" ? <MedicalServicesIcon sx={{ fontSize: "0.9rem !important" }} /> : <DashboardIcon sx={{ fontSize: "0.9rem !important" }} />}
                        label={item.tipo_buscador === "clinico" ? "Clínico" : "Rendimiento"}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          bgcolor: item.tipo_buscador === "clinico" ? "rgba(16, 185, 129, 0.1)" : "rgba(96, 165, 250, 0.1)",
                          color: item.tipo_buscador === "clinico" ? "#10b981" : "#60a5fa",
                          border: item.tipo_buscador === "clinico" ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(96, 165, 250, 0.2)"
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem", fontWeight: 500 }}>
                      {new Date(item.fecha_busqueda).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={`Ver en buscador ${item.tipo_buscador === "clinico" ? "clínico" : "de rendimiento"}`}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleRowClick(item)}
                          sx={{ bgcolor: "rgba(16, 185, 129, 0.05)", "&:hover": { bgcolor: "rgba(16, 185, 129, 0.15)" } }}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}
