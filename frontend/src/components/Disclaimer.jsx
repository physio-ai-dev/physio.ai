import { Box, Typography, Card, CardContent } from "@mui/material";
import { InfoOutlined as InfoIcon, WarningAmber as ShieldAlertIcon } from "@mui/icons-material";

export default function Disclaimer() {
  return (
    <>
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
    </>
  );
}
