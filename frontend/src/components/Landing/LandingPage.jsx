import { Box, AppBar, Toolbar, Typography } from "@mui/material";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { MedicalServicesIcon, ArrowForwardIcon } from "../Common/Icons";
import { darkTheme } from "../../Themes/theme.jsx";
import ActionButton from "../Common/Buttons/ActionButton";
import HeroSection from "./Sections/HeroSection";
import StatsSection from "./Sections/StatsSection";
import FeaturesSection from "./Sections/FeaturesSection";
import SocialProofSection from "./Sections/SocialProofSection";
import CtaBannerSection from "./Sections/CtaBannerSection";

/**
 * LandingPage — Orquestador de secciones de la página de inicio.
 * Toda la lógica visual está delegada a sus secciones atómicas.
 */
export default function LandingPage({ onStart, onRegister, onGoSearch }) {
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
        {/* Navbar */}
        <AppBar
          position="fixed"
          color="transparent"
          elevation={0}
          sx={{
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            bgcolor: "rgba(3, 7, 18, 0.75)",
            backdropFilter: "blur(20px)",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <MedicalServicesIcon
                color="primary"
                sx={{ fontSize: 26, filter: "drop-shadow(0 0 8px #10b98160)" }}
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

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <ActionButton
                variant="outlined"
                onClick={onRegister}
                sx={{
                  borderRadius: 3,
                  px: 2.5,
                  borderColor: "rgba(255, 255, 255, 0.12)",
                  color: "text.primary",
                  boxShadow: "none",
                  bgcolor: "transparent",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.22)",
                    bgcolor: "rgba(255,255,255,0.02)",
                    boxShadow: "none",
                  },
                }}
              >
                Registrarse
              </ActionButton>
              <ActionButton
                onClick={onStart}
                endIcon={<ArrowForwardIcon />}
                sx={{ borderRadius: 3, px: 2.5 }}
              >
                Iniciar Sesión
              </ActionButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Secciones */}
        <HeroSection onStart={onStart} onRegister={onRegister} onGoSearch={onGoSearch} />
        <StatsSection />
        <FeaturesSection />
        <SocialProofSection />
        <CtaBannerSection onRegister={onRegister} onGoSearch={onGoSearch} />

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 4,
            borderTop: "1px solid rgba(255, 255, 255, 0.05)",
            textAlign: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.5 }}>
            © {new Date().getFullYear()} Physio.AI — Sistema de Auditoría Clínica Inteligente para el Fútbol Profesional
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
