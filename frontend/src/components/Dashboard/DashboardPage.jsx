import { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { api } from "../../api/backend";
import DashboardPanel from "./DashboardPanel";
import LoadingSpinner from "../Common/Layout/LoadingSpinner";
import ErrorAlert from "../Common/Feedback/ErrorAlert";
import GlassCard from "../Common/Layout/GlassCard";
import SearchInput from "../Common/Inputs/SearchInput";
import ActionButton from "../Common/Buttons/ActionButton";
import PageTitle from "../Common/Typography/PageTitle";

export default function DashboardPage({ initialPlayer, onResetPlayer }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matchedPlayers, setMatchedPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(initialPlayer || null);

  useEffect(() => {
    if (initialPlayer) {
      setSelectedPlayer(initialPlayer);
    }
  }, [initialPlayer]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setSelectedPlayer(null);
    setMatchedPlayers([]);

    try {
      const res = await api.searchPlayer(searchQuery);
      if (res.data && res.data.length > 0) {
        setMatchedPlayers(res.data);
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
    api.recordSelection(player.id, "rendimiento").catch(console.error);
    setSelectedPlayer(player);
    setMatchedPlayers([]);
    setSearchQuery("");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {selectedPlayer ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ActionButton
              variant="outlined"
              size="small"
              onClick={() => {
                setSelectedPlayer(null);
                if (onResetPlayer) onResetPlayer();
              }}
              startIcon={<ArrowBackIcon />}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 0.8,
                bgcolor: "transparent",
                color: "primary.main",
                borderColor: "rgba(16, 185, 129, 0.3)",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "rgba(16, 185, 129, 0.08)",
                  borderColor: "primary.main",
                  boxShadow: "none",
                }
              }}
            >
              Buscar otro jugador
            </ActionButton>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                src={selectedPlayer.photoUrl || selectedPlayer.foto_url || selectedPlayer.foto}
                sx={{ width: 40, height: 40, border: "1px solid #10b981" }}
              />
              <PageTitle
                title={selectedPlayer.name || selectedPlayer.nombre}
                sx={{ mb: 0 }}
              />
            </Box>
          </Box>
          <DashboardPanel jugadorId={selectedPlayer.id} />
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 4 }}>
          <Box sx={{ textAlign: "center" }}>
            <PageTitle
              title="Buscador de Rendimiento"
              subtitle="Consulta estadísticas de partidos y proyecciones de lesiones asistidas por IA."
            />
          </Box>

          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              width: "100%",
              maxWidth: 500,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <SearchInput
              placeholder="Escribe el nombre de un futbolista..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
            />
            <ActionButton
              fullWidth
              type="submit"
              disabled={loading}
            >
              Buscar Estadísticas
            </ActionButton>
          </Box>

          <ErrorAlert message={error} sx={{ width: "100%", maxWidth: 500 }} />

          {matchedPlayers.length > 0 && (
            <GlassCard
              sx={{
                width: "100%",
                maxWidth: 500,
                bgcolor: "rgba(11, 21, 40, 0.5)",
                overflow: "hidden",
              }}
            >
              <List disablePadding>
                {matchedPlayers.map((player) => (
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
                      src={player.photoUrl || player.foto_url || player.foto}
                      sx={{ mr: 2, width: 36, height: 36, border: "1px solid rgba(255, 255, 255, 0.1)" }}
                    />
                    <ListItemText
                      primary={player.name}
                      secondary={`${player.club} • ${player.position}`}
                      primaryTypographyProps={{ fontWeight: 700, fontSize: "0.9rem" }}
                      secondaryTypographyProps={{ fontSize: "0.75rem", color: "text.secondary" }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </GlassCard>
          )}
        </Box>
      )}
    </Box>
  );
}
