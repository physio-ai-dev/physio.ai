import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment
} from "@mui/material";
import { Search as SearchIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { api } from "../api/backend";
import DashboardPanel from "./DashboardPanel";

export default function DashboardPage({ initialPlayer, onResetPlayer }) {
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [listaCoincidencias, setListaCoincidencias] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(initialPlayer || null);

  useEffect(() => {
    if (initialPlayer) {
      setSelectedPlayer(initialPlayer);
    }
  }, [initialPlayer]);

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) return;

    setLoading(true);
    setError(null);
    setSelectedPlayer(null);
    setListaCoincidencias([]);

    try {
      const res = await api.buscarJugador(busqueda);
      if (res.data && res.data.length > 0) {
        setListaCoincidencias(res.data);
      } else {
        setError("No se encontraron futbolistas con ese nombre.");
      }
    } catch (err) {
      setError(err.message || "Error al buscar el futbolista.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (player) => {
    api.registrarSeleccion(player.id, "rendimiento").catch(console.error);
    setSelectedPlayer(player);
    setListaCoincidencias([]);
    setBusqueda("");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {selectedPlayer ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSelectedPlayer(null);
                if (onResetPlayer) onResetPlayer();
              }}
              startIcon={<ArrowBackIcon />}
              sx={{ borderRadius: 3, textTransform: "none", fontWeight: 700 }}
            >
              Buscar otro jugador
            </Button>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                src={selectedPlayer.foto_url || selectedPlayer.foto}
                sx={{ width: 40, height: 40, border: "1px solid #10b981" }}
              />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {selectedPlayer.nombre}
              </Typography>
            </Box>
          </Box>
          <DashboardPanel jugadorId={selectedPlayer.id} />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 4 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: "-1px" }}>
              Buscador de Rendimiento
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
              Consulta estadísticas de partidos y proyecciones de lesiones asistidas por IA.
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleBuscar}
            sx={{
              width: "100%",
              maxWidth: 500,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              placeholder="Escribe el nombre de un futbolista..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 4,
                    bgcolor: "rgba(255, 255, 255, 0.02)",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.08)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(255, 255, 255, 0.15)",
                    },
                  },
                },
              }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              sx={{ borderRadius: 4, py: 1.2, textTransform: "none", fontWeight: 800 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Buscar Estadísticas"}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ width: "100%", maxWidth: 500, borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          {listaCoincidencias.length > 0 && (
            <Paper
              variant="outlined"
              sx={{
                width: "100%",
                maxWidth: 500,
                borderRadius: 4,
                bgcolor: "rgba(11, 21, 40, 0.5)",
                backdropFilter: "blur(10px)",
                borderColor: "rgba(255, 255, 255, 0.06)",
                overflow: "hidden",
              }}
            >
              <List disablePadding>
                {listaCoincidencias.map((player) => (
                  <ListItemButton
                    key={player.id}
                    onClick={() => handleSelect(player)}
                    sx={{
                      py: 1.5,
                      px: 2.5,
                      borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                      "&:last-child": { borderBottom: "none" },
                    }}
                  >
                    <Avatar
                      src={player.foto_url || player.foto}
                      sx={{ mr: 2, width: 36, height: 36, border: "1px solid rgba(255, 255, 255, 0.1)" }}
                    />
                    <ListItemText
                      primary={player.nombre}
                      secondary={`${player.equipo} • ${player.posicion}`}
                      primaryTypographyProps={{ fontWeight: 700, fontSize: "0.9rem" }}
                      secondaryTypographyProps={{ fontSize: "0.75rem", color: "text.secondary" }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
}
