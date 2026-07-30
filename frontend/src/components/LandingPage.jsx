import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  AppBar,
  Toolbar,
  Stack,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

// Configuración de tema oscuro alineada a la consistencia visual del sistema
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    background: {
      default: "#030712",
      paper: "#0b1528",
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
        },
      },
    },
  },
});

export default function LandingPage({ onStart }) {
  
  /* ==========================================================================
     SCRUM-57: Datos de los bloques informativos inferiores (Características Premium)
     - Auditoría médica por IA
     - Analíticas avanzadas
     - Control de suscripciones
     ========================================================================== */
  const caracteristicasPremium = [
    {
      icono: <PsychologyIcon sx={{ fontSize: 36, color: "#10b981" }} />,
      titulo: "Auditoría Médica por IA",
      descripcion:
        "Análisis clínico avanzado potenciado por Gemini que contrasta los tiempos de recuperación oficiales con la literatura médica especializada.",
    },
    {
      icono: <AnalyticsIcon sx={{ fontSize: 36, color: "#38bdf8" }} />,
      titulo: "Analíticas Avanzadas",
      descripcion:
        "Métricas comparativas en tiempo real sobre el historial de lesiones, tiempos de baja y estimaciones de recuperabilidad.",
    },
    {
      icono: <CardMembershipIcon sx={{ fontSize: 36, color: "#f59e0b" }} />,
      titulo: "Control de Suscripciones",
      descripcion:
        "Gestión flexible de accesos institucionales para equipos médicos, analistas deportivos y consultores de rendimiento.",
    },
  ];

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
          overflowX: "hidden",
        }}
      >
        {/* Navbar Principal */}
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
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <MedicalServicesIcon
                color="primary"
                sx={{ fontSize: 28, filter: "drop-shadow(0 0 8px #10b98160)" }}
              />
              <Typography
                variant="h6"
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

            {/* ==========================================================================
               SCRUM-56 (Acceso rápido desde Navbar): Botón CTA secundario con transición
               ========================================================================== */}
            <Button
              variant="contained"
              color="primary"
              onClick={onStart}
              endIcon={<ArrowForwardIcon />}
              sx={{
                boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.2)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Transición suave
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px 0 rgba(16, 185, 129, 0.4)",
                },
              }}
            >
              Ingresar al Buscador
            </Button>
          </Toolbar>
        </AppBar>

        {/* ==========================================================================
           SCRUM-55: Sección Hero minimalista de alto impacto visual.
           Explica la propuesta de valor de Physio.AI sin exigir autenticación.
           ========================================================================== */}
        <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: 8 }}>
          <Stack spacing={4} alignItems="center" textAlign="center">
            
            {/* Elemento gráfico de la propuesta de valor */}
            <Chip
              icon={<AutoAwesomeIcon sx={{ fontSize: "1rem !important" }} />}
              label="Inteligencia Artificial Aplicada a la Medicina Deportiva"
              variant="outlined"
              color="primary"
              sx={{
                px: 1,
                py: 2.5,
                borderRadius: 5,
                bgcolor: "rgba(16, 185, 129, 0.05)",
                borderColor: "rgba(16, 185, 129, 0.2)",
                fontWeight: 600,
              }}
            />

            {/* Título de alto impacto visual */}
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.2rem" },
                lineHeight: 1.15,
                maxWidth: "900px",
                letterSpacing: "-1.5px",
              }}
            >
              Auditoría Clínica Inteligente para el{" "}
              <Box
                component="span"
                sx={{
                  background: "linear-gradient(90deg, #10b981, #38bdf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Fútbol Profesional
              </Box>
            </Typography>

            {/* Descripción clara del valor ofrecido */}
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                maxWidth: "720px",
                fontWeight: 400,
                lineHeight: 1.6,
                fontSize: { xs: "1rem", sm: "1.2rem" },
              }}
            >
              Plataforma institucional diseñada para evaluar diagnósticos y contrastar
              los tiempos de recuperación oficiales emitidos por los clubes frente
              al criterio clínico sustentado por IA.
            </Typography>

            {/* ==========================================================================
               SCRUM-56: Botón principal de Call to Action (CTA)
               Implementa efectos de transición suave y redirige al buscador/dashboard.
               ========================================================================== */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={onStart} // Función que conmuta la vista al buscador clínico
                endIcon={<ArrowForwardIcon />}
                sx={{
                  px: 4,
                  py: 1.8,
                  fontSize: "1.1rem",
                  boxShadow: "0 8px 25px 0 rgba(16, 185, 129, 0.3)",
                  // Efectos de transición requeridos en SCRUM-56
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-3px)", // Elevación suave
                    boxShadow: "0 12px 30px 0 rgba(16, 185, 129, 0.5)",
                    bgcolor: "primary.light",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                }}
              >
                Ingresar al Buscador Clínico
              </Button>
            </Stack>
          </Stack>
        </Container>

        {/* ==========================================================================
           SCRUM-57: Maquetación de bloques informativos inferiores.
           Destaca las características premium: Auditoría médica por IA, Analíticas 
           avanzadas y Control de suscripciones.
           ========================================================================== */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Grid container spacing={4}>
            {caracteristicasPremium.map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    borderRadius: 5,
                    bgcolor: "#0b1528c0",
                    borderColor: "rgba(255, 255, 255, 0.06)",
                    backdropFilter: "blur(20px)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      borderColor: "rgba(16, 185, 129, 0.4)",
                      boxShadow: "0 12px 30px rgba(0, 0, 0, 0.4)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ mb: 2.5 }}>{item.icono}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                      {item.titulo}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7, fontSize: "0.95rem" }}
                    >
                      {item.descripcion}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            mt: "auto",
            py: 4,
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            textAlign: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} Physio.AI — Sistema de Auditoría y Criterio Médico Deportivo
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}