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
import MedicalServices from "@mui/icons-material/MedicalServices";
import {
  Search as SearchIcon,
  LocalActivity as ActivityIcon,
  AccessTime as ClockIcon,
  Psychology as BrainIcon,
  WarningAmber as ShieldAlertIcon,
} from "@mui/icons-material";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#10b981" },
    background: { default: "#020617", paper: "#0f172a" },
    text: { primary: "#f8fafc", secondary: "#94a3b8" },
  },
});

function App() {
  const [busqueda, setBusqueda] = useState("");
  const [jugador, setJugador] = useState(null);
  const [resultadoFinal, setResultadoFinal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBuscarYAnalizar = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) return;

    setLoading(true);
    setError(null);
    setJugador(null);
    setResultadoFinal(null);

    try {
      // Hace una sola petición que resuelve todo en el backend
      const respuesta = await api.buscarJugador(busqueda);

      if (
        respuesta.status === "success" &&
        respuesta.data &&
        respuesta.data.length > 0
      ) {
        const datosCompletos = respuesta.data[0];

        // Guardamos los datos del perfil
        setJugador({
          id: datosCompletos.id,
          nombre: datosCompletos.nombre,
          equipo: datosCompletos.equipo,
          foto: datosCompletos.foto_url,
        });

        // Guardamos los datos clínicos generados por Gemini y Postgres directamente
        setResultadoFinal(datosCompletos.reporte_ia);
      } else {
        throw new Error("No se encontraron registros del futbolista.");
      }
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
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <MedicalServices color="primary" />
              <Typography
                variant="h6"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                Physio.AI
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Contenedor de la UI */}
        <Container
          maxWidth="md"
          sx={{
            flexGrow: 1,
            py: 6,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 800, mb: 1 }}
            >
              Buscador Clínico de Lesiones
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Análisis automatizado: Detección de reportes médicos mediante IA
            </Typography>
          </Box>

          {/* Buscador Único */}
          <Box
            component="form"
            onSubmit={handleBuscarYAnalizar}
            sx={{
              display: "flex",
              gap: 2,
              maxWidth: "600px",
              width: "100%",
              mx: "auto",
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Escribe el nombre del futbolista (Ej. Pedri)..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                  ),
                },
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
              sx={{
                borderRadius: 3,
                px: 4,
                fontWeight: "bold",
                color: "#020617",
              }}
            >
              {loading ? "Procesando..." : "Buscar"}
            </Button>
          </Box>

          {/* Spinner de Carga de Procesos Combinados */}
          {loading && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "center",
                justifyContent: "center",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                my: 6,
              }}
            >
              <CircularProgress color="primary" />
              <Typography
                variant="caption"
                color="primary"
                sx={{ fontWeight: "bold", trackingWide: 1 }}
              >
                Extrayendo datos de la API, indexando en Postgres y consultando
                a Gemini Engine...
              </Typography>
            </Box>
          )}

          {/* Error */}
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

          {/* PANEL DE RESULTADOS AUTOMÁTICO */}
          {resultadoFinal && !loading && (
            <Card
              variant="outlined"
              sx={{
                borderRadius: 4,
                borderColor: "#334155",
                bgcolor: "#0f172a",
                boxShadow: 6,
                mt: 2,
              }}
            >
              <CardContent
                sx={{ display: "flex", flexDirection: "column", gap: 4, p: 4 }}
              >
                {/* Cabecera del Perfil Encontrado */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    src={jugador?.foto}
                    sx={{ width: 64, height: 64, border: "2px solid #475569" }}
                  />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                      {jugador?.nombre}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textTransform: "uppercase", fontWeight: "bold" }}
                    >
                      {jugador?.equipo}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: "#334155" }} />

                {/* Grid con la información clínica obtenida */}
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
                          alignItems: "center",
                          gap: 1,
                          color: "#f43f5e",
                          mb: 1,
                        }}
                      >
                        <ShieldAlertIcon fontSize="small" />
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: "bold" }}
                        >
                          LESIÓN DETECTADA
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
                          alignItems: "center",
                          gap: 1,
                          color: "#fbbf24",
                          mb: 1,
                        }}
                      >
                        <ClockIcon fontSize="small" />
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: "bold" }}
                        >
                          REPORTE DIAS CLUB
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
                          alignItems: "center",
                          gap: 1,
                          color: "#10b981",
                          mb: 1,
                        }}
                      >
                        <BrainIcon fontSize="small" />
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: "bold" }}
                        >
                          PROMEDIO IA GEMINI
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        {resultadoFinal.tiempo_clinico_ia || "Calculando..."}{" "}
                        días
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Componente del Dictamen del Modelo de Lenguaje */}
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
                      alignItems: "center",
                      gap: 1,
                      color: "#10b981",
                      mb: 1.5,
                    }}
                  >
                    <BrainIcon />
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      DICTAMEN CLÍNICO COMPARATIVO
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ lineHeight: 1.7, whiteSpace: "pre-line" }}
                  >
                    {resultadoFinal.analisis_comparativo ||
                      "Esperando respuesta del servicio de inteligencia artificial..."}
                  </Typography>
                </Box>

                <Button
                  onClick={() => {
                    setJugador(null);
                    setResultadoFinal(null);
                    setBusqueda("");
                  }}
                  sx={{
                    color: "text.secondary",
                    textTransform: "none",
                    textDecoration: "underline",
                    mx: "auto",
                  }}
                >
                  Buscar otro futbolista
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
