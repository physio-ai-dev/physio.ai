import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Divider,
  Grid,
  Button,
} from "@mui/material";
import {
  WarningAmber as ShieldAlertIcon,
  EventNote as EventIcon,
  AccessTime as ClockIcon,
  Psychology as BrainIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

export default function ResultPanel({
  resultadoFinal,
  jugador,
  edadCalculada,
  listaCoincidencias,
  formatBirthdate,
  renderLegibleReport,
  onBackToMatches,
  onReset,
}) {
  return (
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
                : ""}{" "}
              {jugador?.estatura ? `• ${jugador.estatura}` : ""}{" "}
              {jugador?.valor_mercado ? `• ${jugador.valor_mercado}` : ""}
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
              onClick={onBackToMatches}
              sx={{ color: "text.secondary", fontSize: "0.9rem" }}
            >
              Volver a coincidencias
            </Button>
          )}
          <Button
            onClick={onReset}
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
  );
}
