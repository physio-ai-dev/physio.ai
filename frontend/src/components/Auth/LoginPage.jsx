import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  ArrowBackIcon,
  LoginIcon,
  EmailIcon,
  LockIcon,
} from "../Common/Icons";
import { loginUser } from "../../api/authService";
import GlassCard from "../Common/Layout/GlassCard";
import ActionButton from "../Common/Buttons/ActionButton";
import PageTitle from "../Common/Typography/PageTitle";

export default function LoginPage({ onGoBack, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    try {
      await loginUser(email, password);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        maxWidth: "sm",
        mx: "auto",
        width: "100%",
        py: 2,
      }}
    >
      {/* Botón de regreso */}
      <Box>
        <ActionButton
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onGoBack}
          sx={{
            color: "text.secondary",
            textTransform: "none",
            fontWeight: 700,
            borderColor: "transparent",
            boxShadow: "none",
            bgcolor: "transparent",
            "&:hover": {
              borderColor: "rgba(255, 255, 255, 0.08)",
              bgcolor: "rgba(255, 255, 255, 0.02)",
              boxShadow: "none",
            }
          }}
        >
          Volver
        </ActionButton>
      </Box>

      <GlassCard>
        <Box sx={{ p: { xs: 4, sm: 5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
            <LoginIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <PageTitle
                title="Iniciar Sesión"
                subtitle="Ingresa tus credenciales para acceder a Physio.AI"
                sx={{ mb: 0 }}
              />
            </Box>
          </Box>

          {/* Mensajes de Alerta */}
          {error && (
            <Alert
              severity="error"
              variant="outlined"
              sx={{ mb: 4, borderRadius: 3 }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            {/* Correo Electrónico */}
            <TextField
              fullWidth
              label="Correo Electrónico *"
              name="email"
              type="email"
              placeholder="Ej. usuario@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: (
                    <EmailIcon sx={{ color: "text.secondary", mr: 1.5 }} />
                  ),
                }
              }}
            />

            {/* Contraseña */}
            <TextField
              fullWidth
              type="password"
              label="Contraseña *"
              name="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: (
                    <LockIcon sx={{ color: "text.secondary", mr: 1.5 }} />
                  ),
                }
              }}
            />

            <Divider sx={{ my: 2, borderColor: "rgba(255, 255, 255, 0.05)" }} />

            {/* Acciones */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <ActionButton
                variant="outlined"
                disabled={loading}
                onClick={onGoBack}
                sx={{
                  px: 3,
                  py: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  color: "text.secondary",
                  boxShadow: "none",
                  bgcolor: "transparent",
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    bgcolor: "rgba(255, 255, 255, 0.02)",
                    boxShadow: "none",
                  }
                }}
              >
                Cancelar
              </ActionButton>
              <ActionButton
                type="submit"
                disabled={loading}
                sx={{ px: 4, py: 1 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Ingresar"
                )}
              </ActionButton>
            </Box>
          </Box>
        </Box>
      </GlassCard>
    </Box>
  );
}
