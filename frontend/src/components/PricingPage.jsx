import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Check as CheckIcon,
  Star as StarIcon,
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { api } from "../api/backend";

export default function PricingPage({ onGoBack, currentUser }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.crearSesionStripe();
      if (res && res.url) {
        window.location.href = res.url;
      } else {
        throw new Error("No se pudo obtener el portal de pago.");
      }
    } catch (err) {
      setError(err.message || "Error al conectar con la pasarela de pago.");
    } finally {
      setLoading(false);
    }
  };

  const isPremium = currentUser?.subscription_tier === "premium";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        width: "100%",
        py: 2,
      }}
    >
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onGoBack}
          sx={{
            color: "text.secondary",
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Volver
        </Button>
      </Box>

      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 950, letterSpacing: "-1px", mb: 1 }}
        >
          Planes de Suscripción
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ fontWeight: 500, maxWidth: "md", mx: "auto" }}
        >
          Desbloquea auditorías completas, reportes clínicos por inteligencia
          artificial y consultas ilimitadas para tus futbolistas.
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{ borderRadius: 3, maxWidth: "md", mx: "auto", width: "100%" }}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3} justifyContent="center" alignItems="stretch">
        <Grid item xs={12} md={4}>
          <Card
            variant="outlined"
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              bgcolor: "rgba(255, 255, 255, 0.01)",
              borderColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 4,
            }}
          >
            <CardContent sx={{ p: 4, flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Gratuito
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", mb: 3 }}>
                <Typography variant="h3" sx={{ fontWeight: 900 }}>
                  $0
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1, fontWeight: 700 }}
                >
                  / mes
                </Typography>
              </Box>
              <List spacing={1}>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="3 búsquedas diarias de futbolistas"
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: 600,
                    }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Ficha médica básica del jugador"
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: 600,
                    }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Soporte estándar"
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: 600,
                    }}
                  />
                </ListItem>
              </List>
            </CardContent>
            <CardActions sx={{ p: 4, pt: 0 }}>
              <Button
                fullWidth
                variant="outlined"
                disabled
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  py: 1.2,
                }}
              >
                {!isPremium ? "Plan Actual" : "Bajar a Gratis"}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            variant="outlined"
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              bgcolor: "rgba(16, 185, 129, 0.03)",
              borderColor: "rgba(16, 185, 129, 0.2)",
              borderRadius: 4,
              position: "relative",
              boxShadow: "0 8px 32px rgba(16, 185, 129, 0.08)",
            }}
          >
            <Chip
              label="Recomendado"
              color="primary"
              size="small"
              icon={<StarIcon style={{ fontSize: 14 }} />}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                fontWeight: 800,
                fontSize: "0.75rem",
                px: 1,
              }}
            />
            <CardContent sx={{ p: 4, flexGrow: 1 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, mb: 1, color: "primary.light" }}
              >
                PRO
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", mb: 3 }}>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 900, color: "primary.light" }}
                >
                  $4.99
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1, fontWeight: 700 }}
                >
                  / mes
                </Typography>
              </Box>
              <List spacing={1}>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Búsquedas ilimitadas de futbolistas"
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: 600,
                    }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Dictámenes clínicos detallados por Gemini"
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: 600,
                    }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Acceso a reportes médicos avanzados"
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: 600,
                    }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Soporte prioritario 24/7"
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: 600,
                    }}
                  />
                </ListItem>
              </List>
            </CardContent>
            <CardActions sx={{ p: 4, pt: 0 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleUpgrade}
                disabled={loading || isPremium}
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  py: 1.2,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : isPremium ? (
                  "Plan Activo"
                ) : (
                  "Adquirir Premium"
                )}
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            variant="outlined"
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              bgcolor: "rgba(255, 255, 255, 0.01)",
              borderColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: 4,
              opacity: 0.5,
            }}
          >
            <CardContent sx={{ p: 4, flexGrow: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Ultra
                </Typography>
                <Chip
                  label="Próximamente"
                  size="small"
                  variant="outlined"
                  sx={{ height: 18, fontSize: "0.65rem", fontWeight: 800 }}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "baseline", mb: 3 }}>
                <Typography variant="h3" sx={{ fontWeight: 900 }}>
                  $9.99
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1, fontWeight: 700 }}
                >
                  / mes
                </Typography>
              </Box>
              <List spacing={1}>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <LockIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Integración directa con APIs externas"
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: 600,
                    }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <LockIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Predicción automática de lesiones futuras"
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: 600,
                    }}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <LockIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Exportación a PDFs clínicos oficiales"
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: 600,
                    }}
                  />
                </ListItem>
              </List>
            </CardContent>
            <CardActions sx={{ p: 4, pt: 0 }}>
              <Button
                fullWidth
                variant="outlined"
                disabled
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  py: 1.2,
                }}
              >
                No Disponible
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
