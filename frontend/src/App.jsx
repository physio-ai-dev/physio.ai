import { useState } from "react";
import { api } from "./api/backend";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  Grid,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  LocalActivity as ActivityIcon,
  AccessTime as ClockIcon,
  Psychology as BrainIcon,
  WarningAmber as ShieldAlertIcon,
} from "@mui/icons-material";

// Configuración de un tema oscuro Premium
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#10b981" }, // Emerald verde
    background: { default: "#020617", paper: "#0f172a" }, // Slate 950 y Slate 900
    text: { primary: "#f8fafc", secondary: "#94a3b8" },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [busqueda, setBusqueda] = useState("");
  const [jugador, setJugador] = useState(null);
  const [lesionInput, setLesionInput] = useState("");
  const [diasClubInput, setDiasClubInput] = useState("");
  const [resultadoFinal, setResultadoFinal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBuscarJugador = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) return;

    setLoading(true);
    setError(null);
    setJugador(null);
    setResultadoFinal(null);

    try {
      const data = await api.buscarJugador(busqueda);
      const infoJugador = data.player
        ? {
            id: data.player.id,
            nombre: data.player.name,
            equipo: data.statistics[0]?.team?.name || "Desconocido",
            foto: data.player.photo,
          }
        : data;
      setJugador(infoJugador);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalizarLesion = async (e) => {
    e.preventDefault();
    if (!lesionInput.trim() || !diasClubInput) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.analizarLesion(
        jugador.id,
        lesionInput,
        diasClubInput,
      );
      setResultadoFinal(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        {/* Navbar */}
        <AppBar
          position="static"
          color="transparent"
          elevation={0}
          sx={{
            borderBottom: "1px solid #334155",
            bgcolor: "#0f172a80",
            backdropFilter: "blur(8px)",
          }}
        >
          <Toolbar sx={{ justifyContent: "between" }}>
            <Box
              sx={{ display: "flex", itemsCenter: true, gap: 1, flexGrow: 1 }}
            >
              <ActivityIcon color="primary" />
              <Typography
                variant="h6"
                component="div"
                sx={{ fontWeight: "bold", trackingWide: 1 }}
              >
                Physio.AI
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{
                fontMono: true,
                color: "text.secondary",
                bgcolor: "#1e293b",
                px: 2,
                py: 0.5,
                borderRadius: 4,
                border: "1px solid #334155",
              }}
            >
              PUCE TEC • Integrador
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Contenido Principal */}
        <Container
          maxLength="md"
          sx={{
            flexGrow: 1,
            py: 6,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <Box sx={{ textAlignment: "center", mb: 2 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 800, mb: 1 }}
            >
              Buscador Clínico de Lesiones
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Validación del diagnóstico médico vs Criterio de IA
            </Typography>
          </Box>

          {/* Formulario 1: Buscador */}
          <Box
            component="form"
            onSubmit={handleBuscarJugador}
            sx={{
              display: "flex",
              gap: 2,
              maxW: "600px",
              width: "100%",
              mx: "auto",
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar futbolista (Ej. Vinícius Júnior)..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: "#0f172a",
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ borderRadius: 3, px: 4, fontWeight: "bold" }}
            >
              Buscar
            </Button>
          </Box>

          {/* Spinner Global */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          )}

          {/* Alertas de Error */}
          {error && (
            <Alert
              severity="error"
              variant="outlined"
              sx={{
                maxW: "600px",
                width: "100%",
                mx: "auto",
                borderRadius: 3,
                borderColor: "#ef444450",
                color: "#f87171",
              }}
            >
              {error}
            </Alert>
          )}

          {/* Formulario 2: Registro de Lesión */}
          {jugador && !resultadoFinal && !loading && (
            <Card
              variant="outlined"
              sx={{
                borderRadius: 4,
                borderColor: "#334155",
                p: 1,
                maxW: "600px",
                width: "100%",
                mx: "auto",
              }}
            >
              <CardContent
                sx={{ display: "flex", flexDirection: "column", gap: 3 }}
              >
                <Box sx={{ display: "flex", itemsCenter: true, gap: 2 }}>
                  <Avatar
                    src={jugador.foto}
                    sx={{ width: 56, height: 56, border: "2px solid #475569" }}
                  />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {jugador.nombre}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {jugador.equipo}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: "#334155" }} />

                <Box
                  component="form"
                  onSubmit={handleAnalizarLesion}
                  sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                >
                  <Typography
                    variant="subtitle2"
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                  >
                    Registrar Reporte Médico
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label="Tipo de lesión"
                        placeholder="Ej. Rotura de menisco"
                        value={lesionInput}
                        onChange={(e) => setLesionInput(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        type="number"
                        label="Días estimados por el club"
                        value={diasClubInput}
                        onChange={(e) => setDiasClubInput(e.target.value)}
                      />
                    </Grid>
                  </Grid>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ py: 1.5, fontWeight: "bold", borderRadius: 2 }}
                  >
                    Generar Análisis Comparativo
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* PANEL DE RESULTADOS FINAL RÚBRICA */}
          {resultadoFinal && !loading && (
            <Card
              variant="outlined"
              sx={{ borderRadius: 4, borderColor: "#334155", boxShadow: 6 }}
            >
              <CardContent
                sx={{ display: "flex", flexDirection: "column", gap: 4, p: 4 }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    {jugador?.nombre}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textTransform: "uppercase", trackingWide: 1 }}
                  >
                    {jugador?.equipo}
                  </Typography>
                </Box>

                {/* Grid Mapeado al Schema de TypeORM */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        bgcolor: "#02061750",
                        border: "1px solid #334155",
                        p: 2,
                        borderRadius: 3,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          itemsCenter: true,
                          gap: 1,
                          color: "#f43f5e",
                          mb: 1,
                        }}
                      >
                        <ShieldAlertIcon fontSize="small" />
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: "bold", uppercase: true }}
                        >
                          Lesión Actual
                        </Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", textTransform: "capitalize" }}
                      >
                        {resultadoFinal.tipo_lesion}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        bgcolor: "#02061750",
                        border: "1px solid #334155",
                        p: 2,
                        borderRadius: 3,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          itemsCenter: true,
                          gap: 1,
                          color: "#fbbf24",
                          mb: 1,
                        }}
                      >
                        <ClockIcon fontSize="small" />
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: "bold", uppercase: true }}
                        >
                          Estimación Club
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {resultadoFinal.dias_estimados_club} días
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        bgcolor: "#02061750",
                        border: "1px solid #334155",
                        p: 2,
                        borderRadius: 3,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          itemsCenter: true,
                          gap: 1,
                          color: "#10b981",
                          mb: 1,
                        }}
                      >
                        <BrainIcon fontSize="small" />
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: "bold", uppercase: true }}
                        >
                          Promedio Clínico IA
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {resultadoFinal.tiempo_clinico_ia} días
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Dictamen Clínico de la IA */}
                <Box
                  sx={{
                    bgcolor: "#02061740",
                    border: "1px solid #1e293b",
                    p: 3,
                    borderRadius: 3,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      itemsCenter: true,
                      gap: 1,
                      color: "#10b981",
                      mb: 1.5,
                    }}
                  >
                    <BrainIcon />
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: "bold", uppercase: true }}
                    >
                      Dictamen Clínico (Gemini Engine)
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ lineHeight: 1.7, whitespace: "pre-line" }}
                  >
                    {resultadoFinal.analisis_comparativo}
                  </Typography>
                </Box>

                <Button
                  onClick={() => {
                    setJugador(null);
                    setResultadoFinal(null);
                    setBusqueda("");
                    setLesionInput("");
                    setDiasClubInput("");
                  }}
                  sx={{
                    color: "text.secondary",
                    textTransform: "none",
                    textDecoration: "underline",
                    mx: "auto",
                  }}
                >
                  Realizar una nueva consulta
                </Button>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
