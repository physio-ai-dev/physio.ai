import {
  Box,
  Container,
  Grid,
  Typography,
  Avatar,
  Stack,
  Chip,
} from "@mui/material";
import {
  FormatQuoteIcon,
  EmojiEventsIcon,
  SearchIcon,
  PsychologyIcon,
  AssessmentIcon,
  ArrowForwardIcon,
} from "../../Common/Icons";
import GlassCard from "../../Common/Layout/GlassCard";
import GradientText from "../../Common/Typography/GradientText";

const LEAGUES = [
  { name: "Premier League", country: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#38bdf8" },
  { name: "LaLiga", country: "🇪🇸", color: "#f59e0b" },
  { name: "Serie A", country: "🇮🇹", color: "#10b981" },
  { name: "Bundesliga", country: "🇩🇪", color: "#fb7185" },
  { name: "Ligue 1", country: "🇫🇷", color: "#818cf8" },
];

const TESTIMONIALS = [
  {
    quote:
      "Physio.AI nos permitió detectar discrepancias de hasta 3 semanas entre el parte médico oficial y la estimación de la IA. Hoy es parte de nuestro protocolo estándar de evaluación.",
    name: "Dr. Carlos Méndez",
    role: "Director Médico · Club Atlético Monterrey",
    initials: "CM",
    color: "#10b981",
  },
  {
    quote:
      "La plataforma integra analítica deportiva y criterio clínico en un solo flujo. Para nuestro departamento de scouting es invaluable antes de negociar una transferencia.",
    name: "Sofía Larrea",
    role: "Analista de Rendimiento · FC Internacional",
    initials: "SL",
    color: "#38bdf8",
  },
];

const FLOW_STEPS = [
  { icon: <SearchIcon />, label: "Búsqueda", desc: "Nombre del jugador" },
  {
    icon: <PsychologyIcon />,
    label: "Análisis IA",
    desc: "Gemini procesa el historial",
  },
  {
    icon: <AssessmentIcon />,
    label: "Reporte Clínico",
    desc: "Diagnóstico + auditoría",
  },
];

export default function SocialProofSection() {
  return (
    <Box sx={{ bgcolor: "rgba(11, 21, 40, 0.4)", py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Stack spacing={{ xs: 12, md: 16 }}>
          <Box textAlign="center">
            <Typography
              variant="overline"
              sx={{
                color: "text.secondary",
                letterSpacing: 2,
                fontWeight: 600,
              }}
            >
              Datos de jugadores de las principales ligas del mundo
            </Typography>
            <Stack
              direction="row"
              flexWrap="wrap"
              justifyContent="center"
              gap={0.75}
              mt={3}
            >
              {LEAGUES.map((league) => (
                <Chip
                  key={league.name}
                  label={`${league.country} ${league.name}`}
                  variant="outlined"
                  sx={{
                    px: 1.2,
                    py: 2.2,
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    borderColor: `${league.color}44`,
                    color: league.color,
                    bgcolor: `${league.color}0a`,
                    "&:hover": { bgcolor: `${league.color}18` },
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </Stack>
          </Box>

          <Box textAlign="center">
            <Typography variant="h5" fontWeight={800} mb={4}>
              Cómo funciona en{" "}
              <GradientText gradient="linear-gradient(90deg, #10b981, #818cf8)">
                3 pasos
              </GradientText>
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="stretch"
              justifyContent="center"
            >
              {FLOW_STEPS.map((step, i) => (
                <Stack
                  key={step.label}
                  direction={{ xs: "column", sm: "row" }}
                  alignItems="center"
                  spacing={2}
                  sx={{ flex: 1 }}
                >
                  <GlassCard
                    sx={{
                      px: 3,
                      py: 4,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                      minHeight: 190,
                      textAlign: "center",
                      borderColor: "rgba(16,185,129,0.15)",
                      "&:hover": {
                        borderColor: "rgba(16,185,129,0.4)",
                        transform: "translateY(-4px)",
                      },
                      transition: "all 0.3s",
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        bgcolor: "rgba(16,185,129,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                        color: "primary.light",
                      }}
                    >
                      {step.icon}
                    </Box>
                    <Typography
                      fontWeight={800}
                      fontSize="0.95rem"
                      sx={{ mb: 0.5 }}
                    >
                      {step.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ m: 0 }}
                    >
                      {step.desc}
                    </Typography>
                  </GlassCard>
                  {i < FLOW_STEPS.length - 1 && (
                    <ArrowForwardIcon
                      sx={{
                        color: "primary.main",
                        opacity: 0.5,
                        display: { xs: "none", sm: "block" },
                      }}
                    />
                  )}
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="h5" fontWeight={800} textAlign="center" mb={6}>
              Lo que dicen los <GradientText>profesionales</GradientText>
            </Typography>
            <Grid container spacing={3}>
              {TESTIMONIALS.map((t) => (
                <Grid item xs={12} md={6} key={t.name}>
                  <GlassCard
                    sx={{
                      height: "100%",
                      transition: "all 0.3s",
                      "&:hover": {
                        borderColor: `${t.color}44`,
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <Box sx={{ p: 4 }}>
                      <FormatQuoteIcon
                        sx={{
                          fontSize: 36,
                          color: t.color,
                          opacity: 0.7,
                          mb: 1,
                        }}
                      />
                      <Typography
                        variant="body1"
                        sx={{
                          lineHeight: 1.8,
                          color: "text.secondary",
                          mb: 3,
                          fontStyle: "italic",
                        }}
                      >
                        "{t.quote}"
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar
                          sx={{
                            bgcolor: `${t.color}22`,
                            color: t.color,
                            fontWeight: 900,
                            border: `2px solid ${t.color}44`,
                          }}
                        >
                          {t.initials}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={800} fontSize="0.95rem">
                            {t.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t.role}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </GlassCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
