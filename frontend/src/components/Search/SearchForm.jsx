import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import LoadingSpinner from "../Common/Layout/LoadingSpinner";
import ErrorAlert from "../Common/Feedback/ErrorAlert";
import GlassCard from "../Common/Layout/GlassCard";
import SearchInput from "../Common/Inputs/SearchInput";
import ActionButton from "../Common/Buttons/ActionButton";

export default function SearchForm({
  searchQuery,
  setSearchQuery,
  loading,
  error,
  matchedPlayers,
  player,
  onSubmit,
  onSelectPlayer,
  onNavigateToCreate,
  isAdmin,
}) {
  const [openMatched, setOpenMatched] = useState(false);

  useEffect(() => {
    if (matchedPlayers.length > 0) {
      setOpenMatched(true);
    } else {
      setOpenMatched(false);
    }
  }, [matchedPlayers]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        width: "100%",
      }}
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          display: "flex",
          gap: 1.5,
          width: "100%",
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <SearchInput
          placeholder="Ej: Vinicius Junior, Kylian Mbappe, Erling Haaland, Lamine Yamal..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={loading}
        />
        <ActionButton
          type="submit"
          disabled={loading}
          sx={{ px: 4 }}
        >
          {loading ? "Procesando..." : "Buscar"}
        </ActionButton>
      </Box>

      {/* Botón secundario para registrar jugador local */}
      {!loading && isAdmin && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <ActionButton
            variant="outlined"
            onClick={onNavigateToCreate}
            sx={{
              borderRadius: 4,
              px: 3,
              py: 1,
              borderColor: "rgba(16, 185, 129, 0.3)",
              bgcolor: "rgba(16, 185, 129, 0.02)",
              fontSize: "0.85rem",
              boxShadow: "none",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "rgba(16, 185, 129, 0.08)",
                boxShadow: "none",
              },
            }}
          >
            + Registrar Futbolista Local
          </ActionButton>
        </Box>
      )}

      {/* Loading Animation */}
      {loading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            my: 6,
          }}
        >
          <LoadingSpinner py={2} />
          <Typography
            variant="caption"
            color="primary"
            sx={{ fontWeight: 700 }}
          >
            Consultando base de datos y solicitando criterio médico a Gemini...
          </Typography>
        </Box>
      )}

      {/* Mensajes de Error */}
      <ErrorAlert message={error} sx={{ maxWidth: "600px", width: "100%", mx: "auto" }} />

      {/* SELECCIÓN DE COINCIDENCIAS (NOMBRE COMÚN) */}
      {matchedPlayers.length > 1 && !player && !loading && (
        <GlassCard
          sx={{
            p: 3,
            maxWidth: "600px",
            width: "100%",
            mx: "auto",
            bgcolor: "rgba(11, 21, 40, 0.3)",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ mb: 2, fontWeight: "bold", color: "primary.light" }}
          >
            🔍 Se encontraron {matchedPlayers.length} futbolistas con ese
            nombre. Selecciona el correcto:
          </Typography>
          <List>
            {matchedPlayers.map((item) => (
              <ListItem disablePadding key={item.id} sx={{ mb: 1.5 }}>
                <ListItemButton
                  onClick={() => onSelectPlayer(item)}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    bgcolor: "rgba(3, 7, 18, 0.4)",
                    "&:hover": { bgcolor: "rgba(16, 185, 129, 0.05)" },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={item.photoUrl || item.foto_url}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.name}
                    secondary={`${item.club} • ${item.position || "Fútbol profesional"}`}
                    primaryTypographyProps={{
                      fontWeight: 800,
                      fontSize: "0.95rem",
                    }}
                    secondaryTypographyProps={{
                      fontSize: "0.85rem",
                      color: "text.secondary",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </GlassCard>
      )}
    </Box>
  );
}
