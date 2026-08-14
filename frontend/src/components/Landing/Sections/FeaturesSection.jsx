import { Box, Container, Grid, Typography } from "@mui/material";
import {
  PsychologyIcon,
  AnalyticsIcon,
  CardMembershipIcon,
  SecurityIcon,
  HistoryIcon,
  TrendingUpIcon,
} from "../../Common/Icons";
import GlassCard from "../../Common/Layout/GlassCard";
import GradientText from "../../Common/Typography/GradientText";

const FEATURES = [
  {
    icon: <PsychologyIcon sx={{ fontSize: 38, color: "#10b981" }} />,
    title: "Auditoría Médica por IA",
    description:
      "Análisis clínico avanzado potenciado por Gemini que contrasta los tiempos de recuperación oficiales con la literatura médica especializada.",
    accent: "#10b981",
  },
  {
    icon: <AnalyticsIcon sx={{ fontSize: 38, color: "#38bdf8" }} />,
    title: "Analíticas Avanzadas",
    description:
      "Métricas comparativas en tiempo real sobre el historial de lesiones, tiempos de baja y estimaciones de recuperabilidad por posición y club.",
    accent: "#38bdf8",
  },
  {
    icon: <CardMembershipIcon sx={{ fontSize: 38, color: "#f59e0b" }} />,
    title: "Modelo Freemium Escalable",
    description:
      "Acceso gratuito con límite diario y plan PRO para equipos médicos, analistas deportivos y consultores de rendimiento institucional.",
    accent: "#f59e0b",
  },
  {
    icon: <HistoryIcon sx={{ fontSize: 38, color: "#fb7185" }} />,
    title: "Historial Completo de Búsquedas",
    description:
      "Registro persistente de todos los análisis realizados por usuario, con acceso al perfil clínico y de rendimiento desde el historial.",
    accent: "#fb7185",
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 38, color: "#34d399" }} />,
    title: "Reportería e Inteligencia de Negocio",
    description:
      "Vistas analíticas que consolidan datos de lesiones, búsquedas y jugadores para la toma de decisiones basada en evidencia.",
    accent: "#34d399",
  },
];

export default function FeaturesSection() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>

      <Box textAlign="center" mb={{ xs: 8, md: 12 }}>
        <Typography
          variant="overline"
          sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 2 }}
        >
          Plataforma completa
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            mt: 1,
            mb: 2.5,
            fontSize: { xs: "1.9rem", md: "2.6rem" },
            letterSpacing: "-0.5px",
          }}
        >
          Todo lo que necesita un{" "}
          <GradientText>equipo médico de élite</GradientText>
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {FEATURES.map((feature) => (
          <Grid item xs={12} sm={6} md={4} key={feature.title}>
            <GlassCard
              sx={{
                height: "100%",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-6px)",
                  borderColor: `${feature.accent}44`,
                  boxShadow: `0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px ${feature.accent}22`,
                },
              }}
            >
              <Box sx={{ p: 4 }}>
                <Box
                  sx={{
                    mb: 2.5,
                    width: 60,
                    height: 60,
                    borderRadius: 3,
                    bgcolor: `${feature.accent}14`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.75, fontSize: "0.93rem" }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </GlassCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
