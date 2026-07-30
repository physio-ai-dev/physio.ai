import { useState } from "react";
import LandingPage from './components/LandingPage';
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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Paper,
} from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import {
  Search as SearchIcon,
  AccessTime as ClockIcon,
  Psychology as BrainIcon,
  WarningAmber as ShieldAlertIcon,
  InfoOutlined as InfoIcon,
  EventNote as EventIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

// Configuración de un tema oscuro de alta gama (Premium Dark Mode)
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#10b981", // Emerald Green
      light: "#34d399",
      dark: "#059669",
    },
    background: {
      default: "#030712", // Slate 950 ultra oscuro
      paper: "#0b1528", // Dark slate con toques azulados
    },
    text: {
      primary: "#f8fafc",
      secondary: "#94a3b8",
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: "none",
          fontWeight: 700,
          fontSize: "1rem",
          letterSpacing: "0.5px",
          boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.1)",
          "&:hover": {
            boxShadow: "0 6px 20px 0 rgba(16, 185, 129, 0.3)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: "1px solid rgba(255, 255, 255, 0.05)",
          backgroundColor: "#0b1528c0",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 18,
            backgroundColor: "rgba(3, 7, 18, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: "rgba(16, 185, 129, 0.5)",
            },
            "&.Mui-focused": {
              borderColor: "#10b981",
              boxShadow: "0 0 15px rgba(16, 185, 129, 0.25)",
            },
          },
        },
      },
    },
  },
});

// Función avanzada para renderizar el reporte médico línea por línea con alta legibilidad
const renderLegibleReport = (text) => {
  if (!text) return null;

  // Dividir el texto en líneas y procesar de forma inteligente para mejorar el diseño
  const lines = text.split("\n");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          // Espaciador para separar párrafos o listas
          return <Box key={idx} sx={{ height: 6 }} />;
        }

        // Caso A: Es una viñeta/lista (líneas que empiezan con "-", "*" o números como "1.")
        if (
          trimmed.startsWith("-") ||
          trimmed.startsWith("*") ||
          /^\d+\./.test(trimmed)
        ) {
          const cleanLine = trimmed.replace(/^[-*\s]+|^\d+\.\s*/, "");
          const parts = cleanLine.split(/\*\*([\s\S]*?)\*\*/g);
          return (
            <Box
              key={idx}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                pl: 2,
              }}
            >
              <span
                style={{
                  color: "#34d399",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  marginTop: "-3px",
                }}
              >
                •
              </span>
              <Typography
                variant="body2"
                sx={{
                  lineHeight: 1.8,
                  color: "text.primary",
                  fontSize: "0.95rem",
                }}
              >
                {parts.map((part, i) =>
                  i % 2 === 1 ? (
                    <strong
                      key={i}
                      style={{ color: "#34d399", fontWeight: 700 }}
                    >
                      {part}
                    </strong>
                  ) : (
                    part
                  ),
                )}
              </Typography>
            </Box>
          );
        }

        // Caso B: Es un encabezado de sección (ej. Termina con dos puntos ":" o empieza con "###")
        if (
          trimmed.endsWith(":") ||
          trimmed.startsWith("###") ||
          trimmed.startsWith("#")
        ) {
          const cleanHeader = trimmed
            .replace(/#/g, "")
            .replace(/:$/, "")
            .trim();
          const parts = cleanHeader.split(/\*\*([\s\S]*?)\*\*/g);
          return (
            <Box key={idx} sx={{ mt: 3, mb: 1.5 }}>
              {idx > 0 && (
                <Divider
                  sx={{ mb: 2, borderColor: "rgba(255, 255, 255, 0.05)" }}
                />
              )}
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 900,
                  color: "primary.light",
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  fontSize: "0.85rem",
                }}
              >
                {parts.map((part, i) => (i % 2 === 1 ? part : part))}
              </Typography>
            </Box>
          );
        }

        // Caso C: Es un párrafo estándar
        const parts = trimmed.split(/\*\*([\s\S]*?)\*\*/g);
        return (
          <Typography
            key={idx}
            variant="body2"
            sx={{
              lineHeight: 1.8,
              mb: 0.5,
              color: "text.primary",
              fontSize: "0.96rem",
              textAlign: "justify",
            }}
          >
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} style={{ color: "#34d399", fontWeight: 700 }}>
                  {part}
                </strong>
              ) : (
                part
              ),
            )}
          </Typography>
        );
      })}
    </Box>
  );
};

// Formatea la fecha de nacimiento de YYYY-MM-DD a DD/MM/YYYY
const formatBirthdate = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

// Calcula la edad precisa al día de hoy basándose en la fecha de nacimiento (YYYY-MM-DD)
const calculateAge = (birthdateStr) => {
  if (!birthdateStr) return null;
  const parts = birthdateStr.split("-");
  if (parts.length !== 3) return null;

  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1; // Mes en JS es base 0
  const birthDay = parseInt(parts[2], 10);

  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const monthDiff = today.getMonth() - birthMonth;

  // Ajuste si aún no ha cumplido años este año
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
    age--;
  }
  return age;
};

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [listaCoincidencias, setListaCoincidencias] = useState([]);
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
    setListaCoincidencias([]);

    try {
      const respuesta = await api.buscarJugador(busqueda);

      if (
        respuesta &&
        respuesta.status === "success" &&
        Array.isArray(respuesta.data) &&
        respuesta.data.length > 0
      ) {
        // Si hay una única coincidencia, la seleccionamos directamente
        if (respuesta.data.length === 1) {
          seleccionarJugador(respuesta.data[0]);
        } else {
          // Si hay varias, mostramos la lista para que el usuario seleccione la correcta
          setListaCoincidencias(respuesta.data);
        }
      } else {
        throw new Error("No se encontraron registros del futbolista.");
      }
    } catch (err) {
      setError(err.message || "Error al buscar el futbolista.");
    } finally {
      setLoading(false);
    }
  };

  const seleccionarJugador = (datosCompletos) => {
    setJugador({
      id: datosCompletos.id,
      nombre: datosCompletos.nombre,
      equipo: datosCompletos.equipo,
      foto: datosCompletos.foto_url,
      edad: datosCompletos.edad,
      fecha_nacimiento: datosCompletos.fecha_nacimiento,
    });
    setResultadoFinal(datosCompletos.reporte_ia);
    setListaCoincidencias([]);
  };

  // Calcular la edad de manera dinámica al renderizar
  const edadCalculada = jugador?.fecha_nacimiento
    ? calculateAge(jugador.fecha_nacimiento)
    : jugador?.edad;

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        }}
      >
        {/* Navbar */}
        <AppBar
          position="static"
          color="transparent"
          elevation={0}
          sx={{
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            bgcolor: "rgba(11, 21, 40, 0.5)",
            backdropFilter: "blur(16px)",
          }}
        >
          <Toolbar>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexGrow: 1,
              }}
            >
              <MedicalServicesIcon
                color="primary"
                sx={{ fontSize: 26, filter: "drop-shadow(0 0 8px #10b98160)" }}
              />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 900,
                  letterSpacing: 1.5,
                  background: "linear-gradient(90deg, #10b981, #34d399)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Physio.AI
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              Football Injury Companion
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Contenido Principal */}
        <Container
          maxWidth="md"
          sx={{
            py: 6,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {/* Cabecera / Propósito de la App */}
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 900, mb: 1.5, letterSpacing: "-1px" }}
            >
              Buscador Clínico de Lesiones
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: "600px",
                mx: "auto",
                fontSize: "1.05rem",
                lineHeight: 1.6,
              }}
            >
              Evalúa y compara el tiempo de baja estimado por los clubes frente
              al criterio clínico de la literatura médica generado mediante
              Inteligencia Artificial.
            </Typography>
          </Box>

          {/* PANEL DE INFORMACIÓN Y DISCLAIMER */}
          <Card
            variant="outlined"
            sx={{
              bgcolor: "rgba(30, 41, 59, 0.2)",
              borderColor: "rgba(255, 255, 255, 0.04)",
            }}
          >
            <CardContent
              sx={{ display: "flex", flexDirection: "column", gap: 2, p: 3 }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  color: "primary.light",
                }}
              >
                <InfoIcon fontSize="small" />
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, letterSpacing: 0.5 }}
                >
                  PROPÓSITO DEL PROGRAMA Y ADVERTENCIA CLÍNICA
                </Typography>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                Esta plataforma tiene como objetivo contrastar de manera
                informativa los plazos de recuperación oficiales provistos por
                los clubes de fútbol con la literatura médica generalizada. Los
                cuerpos médicos de cada club cuentan con información
                privilegiada de la cual la IA carece.
              </Typography>

              <Box
                sx={{
                  p: 2,
                  bgcolor: "rgba(245, 158, 11, 0.05)",
                  border: "1px solid rgba(245, 158, 11, 0.15)",
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                }}
              >
                <ShieldAlertIcon color="warning" sx={{ mt: 0.2 }} />
                <Box>
                  <Typography
                    variant="caption"
                    color="warning.main"
                    sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}
                  >
                    DISCLAIMER
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", lineHeight: 1.5 }}
                  >
                    La API de Gemini cuenta con una fecha límite de
                    entrenamiento y no está actualizada con el estado de salud
                    actual de los jugadores. Las estimaciones de la IA son
                    basadas en literatura científica estándar y no constituyen
                    consejo médico profesional.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Formulario de Búsqueda */}
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
              placeholder="Busca un futbolista (Ej. Lamine Yamal, Kylian Mbappe)..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ px: 4 }}
            >
              {loading ? "Procesando..." : "Buscar"}
            </Button>
          </Box>

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
                      onClick={() => seleccionarJugador(player)}
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

          {/* PANEL DE RESULTADOS AUTOMÁTICO */}
          {resultadoFinal && !loading && (
            <Card variant="outlined">
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  p: { xs: 3, sm: 5 },
                }}
              >
                {/* Cabecera del Perfil Encontrado con Edad y Fecha de Nacimiento limpia */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                  <Avatar
                    src={jugador?.foto}
                    sx={{
                      width: 72,
                      height: 72,
                      border: "2px solid #10b981",
                      boxShadow: "0 0 15px rgba(16, 185, 129, 0.3)",
                    }}
                  />
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 900, letterSpacing: "-0.5px" }}
                    >
                      {jugador?.nombre}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        textTransform: "uppercase",
                        fontWeight: 700,
                        letterSpacing: 0.5,
                      }}
                    >
                      {jugador?.equipo}{" "}
                      {edadCalculada ? `• ${edadCalculada} años` : ""}{" "}
                      {jugador?.fecha_nacimiento
                        ? `• ${formatBirthdate(jugador.fecha_nacimiento)}`
                        : ""}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.08)" }} />

                {/* Grid comparativa en formato 2x2 */}
                <Grid container spacing={3}>
                  {/* FILA 1: LESIÓN Y FECHA */}

                  {/* Lesión Detectada */}
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        bgcolor: "rgba(244, 63, 94, 0.05)",
                        border: "1px solid rgba(244, 63, 94, 0.15)",
                        p: 2.5,
                        borderRadius: 4,
                        height: "100%",
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
                          sx={{ fontWeight: 800, letterSpacing: 0.5 }}
                        >
                          LESIÓN DETECTADA
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 800, textTransform: "capitalize" }}
                      >
                        {resultadoFinal.tipo_lesion}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Fecha de Lesión */}
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        bgcolor: "rgba(56, 189, 248, 0.05)",
                        border: "1px solid rgba(56, 189, 248, 0.15)",
                        p: 2.5,
                        borderRadius: 4,
                        height: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: "#38bdf8",
                          mb: 1,
                        }}
                      >
                        <EventIcon fontSize="small" />
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, letterSpacing: 0.5 }}
                        >
                          FECHA DE LESIÓN
                        </Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 800, color: "#38bdf8" }}
                      >
                        {resultadoFinal.fecha_registro
                          ? new Date(
                              resultadoFinal.fecha_registro,
                            ).toLocaleDateString("es-ES")
                          : "N/D"}
                      </Typography>
                    </Box>
                  </Grid>

                  {/* FILA 2: ESTIMACIÓN CLUB Y ESTIMACIÓN IA */}

                  {/* Reporte Días Club */}
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        bgcolor: "rgba(245, 158, 11, 0.05)",
                        border: "1px solid rgba(245, 158, 11, 0.15)",
                        p: 2.5,
                        borderRadius: 4,
                        height: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: "#f59e0b",
                          mb: 1,
                        }}
                      >
                        <ClockIcon fontSize="small" />
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, letterSpacing: 0.5 }}
                        >
                          ESTIMACIÓN CLUB
                        </Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 800, color: "#fbbf24" }}
                      >
                        {resultadoFinal.dias_estimados_club} días
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Promedio IA Gemini */}
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        bgcolor: "rgba(16, 185, 129, 0.05)",
                        border: "1px solid rgba(16, 185, 129, 0.15)",
                        p: 2.5,
                        borderRadius: 4,
                        height: "100%",
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
                          sx={{ fontWeight: 800, letterSpacing: 0.5 }}
                        >
                          CRITERIO CLÍNICO IA
                        </Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 800, color: "#34d399" }}
                      >
                        {resultadoFinal.tiempo_clinico_ia || "N/D"} días
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Dictamen Clínico de la IA */}
                <Box
                  sx={{
                    bgcolor: "rgba(2, 6, 23, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    p: 4,
                    borderRadius: 4,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    <BrainIcon
                      color="primary"
                      sx={{ filter: "drop-shadow(0 0 4px #10b98140)" }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        color: "primary.light",
                        letterSpacing: 0.5,
                      }}
                    >
                      DICTAMEN CLÍNICO COMPARATIVO (GEMINI)
                    </Typography>
                  </Box>

                  {/* Renderizado de Dictamen Estructurado y Altamente Legible */}
                  <Box>
                    {renderLegibleReport(resultadoFinal.analisis_comparativo)}
                  </Box>
                </Box>

                {/* Botón de volver a buscar / volver a la lista */}
                <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
                  {listaCoincidencias.length > 0 && (
                    <Button
                      startIcon={<ArrowBackIcon />}
                      onClick={() => setJugador(null)}
                      sx={{ color: "text.secondary", fontSize: "0.9rem" }}
                    >
                      Volver a coincidencias
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      setJugador(null);
                      setResultadoFinal(null);
                      setBusqueda("");
                      setListaCoincidencias([]);
                    }}
                    sx={{
                      color: "text.secondary",
                      textDecoration: "underline",
                      fontSize: "0.9rem",
                    }}
                  >
                    Buscar otro futbolista
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
