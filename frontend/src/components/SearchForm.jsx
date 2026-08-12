import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  InputAdornment,
} from "@mui/material";
import { Search as SearchIcon, Person as PersonIcon } from "@mui/icons-material";

export default function SearchForm({
  busqueda,
  setBusqueda,
  loading,
  error,
  listaCoincidencias,
  jugador,
  onSubmit,
  onSelectPlayer,
  onNavigateToCreate,
  isAdmin,
}) {
  const [openCoincidencias, setOpenCoincidencias] = useState(false);

  useEffect(() => {
    if (listaCoincidencias.length > 0) {
      setOpenCoincidencias(true);
    } else {
      setOpenCoincidencias(false);
    }
  }, [listaCoincidencias]);

  const handleCloseCoincidencias = () => {
    setOpenCoincidencias(false);
  };

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
        <TextField
          fullWidth
          placeholder="Ej: Lamine Yamal..."
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
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
          sx={{ px: 4 }}
        >
          {loading ? "Procesando..." : "Buscar"}
        </Button>
      </Box>

      {/* Botón secundario para registrar jugador local */}
      {!loading && isAdmin && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={onNavigateToCreate}
            sx={{
              borderRadius: 4,
              px: 3,
              py: 1,
              borderColor: "rgba(16, 185, 129, 0.3)",
              bgcolor: "rgba(16, 185, 129, 0.02)",
              fontSize: "0.85rem",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: "rgba(16, 185, 129, 0.08)",
              }
            }}
          >
            + Registrar Futbolista Local
          </Button>
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
          <CircularProgress color="primary" size={50} />
          <Typography
            variant="caption"
            color="primary"
            sx={{ fontWeight: 700 }}
          >
            Consultando base de datos y solicitando criterio médico a
            Gemini...
          </Typography>
        </Box>
      )}

      {/* Mensajes de Error */}
      {error && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{
            maxWidth: "600px",
            width: "100%",
            mx: "auto",
            borderRadius: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {/* SELECCIÓN DE COINCIDENCIAS (NOMBRE COMÚN) */}
      {listaCoincidencias.length > 1 && !jugador && !loading && (
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 4,
            maxWidth: "600px",
            width: "100%",
            mx: "auto",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            bgcolor: "rgba(11, 21, 40, 0.3)",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ mb: 2, fontWeight: "bold", color: "primary.light" }}
          >
            🔍 Se encontraron {listaCoincidencias.length} futbolistas con
            ese nombre. Selecciona el correcto:
          </Typography>
          <List>
            {listaCoincidencias.map((player) => (
              <ListItem disablePadding key={player.id} sx={{ mb: 1.5 }}>
                <ListItemButton
                  onClick={() => onSelectPlayer(player)}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    bgcolor: "rgba(3, 7, 18, 0.4)",
                    "&:hover": { bgcolor: "rgba(16, 185, 129, 0.05)" },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar src={player.foto_url}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={player.nombre}
                    secondary={`${player.equipo} • ${player.posicion || "Fútbol profesional"}`}
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
        </Paper>
      )}
    </Box>
  );
}
