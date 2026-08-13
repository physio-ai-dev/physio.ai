import { useState, useEffect } from "react";
import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Tooltip,
  Alert
} from "@mui/material";
import {
  OpenInNew as OpenInNewIcon,
  MedicalServices as MedicalServicesIcon,
  Dashboard as DashboardIcon
} from "@mui/icons-material";
import { api } from "../../api/backend";
import LoadingSpinner from "../Common/Layout/LoadingSpinner";
import ErrorAlert from "../Common/Feedback/ErrorAlert";
import GlassCard from "../Common/Layout/GlassCard";
import PageTitle from "../Common/Typography/PageTitle";

export default function SearchHistoryPage({ onSelectPlayerClinical, onSelectPlayerPerformance }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getSearchHistory();
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

    loadHistory();
  }, []);

  const handleRowClick = (item) => {
    const player = {
      id: item.playerId,
      nombre: item.playerName,
      equipo: item.clubName,
    };
    if (item.searchType === "clinico") {
      if (onSelectPlayerClinical) onSelectPlayerClinical(player);
    } else {
      if (onSelectPlayerPerformance) onSelectPlayerPerformance(player);
    }
  };

  if (loading) {
    return <LoadingSpinner py={8} />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <PageTitle
        title="Historial de Búsquedas"
        subtitle="Revisa tus últimas consultas clínicas y de rendimiento deportivo. Haz clic en la acción de cualquier registro para cargarlo nuevamente."
      />

      {history.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          Aún no tienes búsquedas en tu historial. Realiza búsquedas clínicas o de rendimiento para verlas aquí.
        </Alert>
      ) : (
        <GlassCard>
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
                      {item.playerName}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontWeight: 500 }}>
                      {item.clubName || "Sin equipo"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={item.searchType === "clinico" ? <MedicalServicesIcon sx={{ fontSize: "0.9rem !important" }} /> : <DashboardIcon sx={{ fontSize: "0.9rem !important" }} />}
                        label={item.searchType === "clinico" ? "Clínico" : "Rendimiento"}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          bgcolor: item.searchType === "clinico" ? "rgba(16, 185, 129, 0.1)" : "rgba(96, 165, 250, 0.1)",
                          color: item.searchType === "clinico" ? "#10b981" : "#60a5fa",
                          border: item.searchType === "clinico" ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(96, 165, 250, 0.2)"
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem", fontWeight: 500 }}>
                      {new Date(item.searchDate).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={`Ver en buscador ${item.searchType === "clinico" ? "clínico" : "de rendimiento"}`}>
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
        </GlassCard>
      )}
    </Box>
  );
}
