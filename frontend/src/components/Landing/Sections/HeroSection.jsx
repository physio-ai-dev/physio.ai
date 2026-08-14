import { Box, Container, Typography, Stack, Chip } from "@mui/material";
import {
  AutoAwesomeIcon,
  ArrowForwardIcon,
  PersonAddIcon,
} from "../../Common/Icons";
import ActionButton from "../../Common/Buttons/ActionButton";
import GradientText from "../../Common/Typography/GradientText";

export default function HeroSection({ onStart, onRegister, onGoSearch }) {
  return (
    <Box
      sx={{
        position: "relative",
        pt: { xs: 10, md: 14 },
        pb: { xs: 8, md: 12 },
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "600px",
          background:
            "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.12) 0%, rgba(56, 189, 248, 0.06) 40%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={4} alignItems="center" textAlign="center">
          <Chip
            icon={
              <AutoAwesomeIcon
                sx={{
                  fontSize: "1rem !important",
                  color: "#10b981 !important",
                }}
              />
            }
            label="Powered by Gemini AI · Medicina Deportiva de Precisión"
            variant="outlined"
            sx={{
              px: 1.5,
              py: 2.5,
              borderRadius: 6,
              bgcolor: "rgba(16, 185, 129, 0.06)",
              borderColor: "rgba(16, 185, 129, 0.25)",
              color: "primary.light",
              fontWeight: 600,
              fontSize: "0.82rem",
              letterSpacing: 0.3,
            }}
          />

          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2.6rem", sm: "3.8rem", md: "5rem" },
              lineHeight: 1.1,
              maxWidth: "950px",
              letterSpacing: "-2px",
            }}
          >
            La IA que audita{" "}
            <GradientText gradient="linear-gradient(90deg, #10b981 0%, #38bdf8 60%, #818cf8 100%)">
              lesiones
            </GradientText>{" "}
            en el fútbol profesional
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              maxWidth: "760px",
              fontWeight: 400,
              lineHeight: 1.7,
              fontSize: { xs: "1rem", sm: "1.15rem" },
            }}
          >
            Physio.AI contrasta los diagnósticos oficiales de los clubes con el
            criterio clínico sustentado por IA, generando reportes de auditoría
            médica en segundos. Escalable, institucional y listo para operar en
            cualquier liga del mundo.
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} pt={2}>
            <ActionButton
              size="large"
              onClick={onGoSearch || onStart}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 4.5,
                py: 1.8,
                fontSize: "1.05rem",
                background: "linear-gradient(135deg, #10b981, #059669)",
                boxShadow: "0 8px 30px rgba(16, 185, 129, 0.35)",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 14px 40px rgba(16, 185, 129, 0.5)",
                  background: "linear-gradient(135deg, #34d399, #10b981)",
                },
              }}
            >
              Ingresar al Buscador Clínico
            </ActionButton>

            <ActionButton
              variant="outlined"
              size="large"
              onClick={onRegister}
              startIcon={<PersonAddIcon />}
              sx={{
                px: 4,
                py: 1.8,
                fontSize: "1.05rem",
                borderColor: "rgba(255, 255, 255, 0.15)",
                color: "text.primary",
                bgcolor: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(8px)",
                boxShadow: "none",
                "&:hover": {
                  borderColor: "rgba(16, 185, 129, 0.5)",
                  bgcolor: "rgba(16, 185, 129, 0.06)",
                  boxShadow: "none",
                },
              }}
            >
              Registrarse Gratis
            </ActionButton>
          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ opacity: 0.6 }}
          >
            Sin tarjeta de crédito · 3 análisis gratuitos al día · Cancela
            cuando quieras
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
