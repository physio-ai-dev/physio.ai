import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Event as CalendarIcon,
} from "@mui/icons-material";
import { api } from "../api/backend";

export default function RegisterPage({ onGoBack, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
    dob: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { username, email, password, passwordConfirm, dob } = formData;

    // 1. Validaciones básicas en el cliente
    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !passwordConfirm.trim() ||
      !dob.trim()
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("El correo electrónico no tiene un formato válido.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== passwordConfirm) {
      setError("La contraseña y la confirmación no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.registrarUsuario(formData);

      if (response && response.status === "success") {
        setSuccess(
          "¡Cuenta creada con éxito! Serás redirigido en unos segundos...",
        );
        setFormData({
          username: "",
          email: "",
          password: "",
          passwordConfirm: "",
          dob: "",
        });

        // Esperar 2 segundos para mostrar el mensaje de éxito antes de regresar
        setTimeout(() => {
          if (onRegisterSuccess) {
            onRegisterSuccess();
          } else {
            onGoBack();
          }
        }, 2500);
      } else {
        throw new Error("No se pudo completar el registro.");
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

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 4, sm: 5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
            <PersonAddIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 950, letterSpacing: "-0.5px" }}
              >
                Registro
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500, mt: 0.5 }}
              >
                Regístrate para acceder a las auditorías personalizadas de
                Physio.AI
              </Typography>
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
          {success && (
            <Alert
              severity="success"
              variant="outlined"
              sx={{ mb: 4, borderRadius: 3 }}
            >
              {success}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            {/* Nombre de Usuario */}
            <TextField
              fullWidth
              label="Nombre de Usuario *"
              name="username"
              placeholder="Ej. cr7_fans"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <PersonIcon sx={{ color: "text.secondary", mr: 1.5 }} />
                ),
              }}
            />

            {/* Correo Electrónico */}
            <TextField
              fullWidth
              label="Correo Electrónico *"
              name="email"
              placeholder="Ej. ronaldo@correo.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <EmailIcon sx={{ color: "text.secondary", mr: 1.5 }} />
                ),
              }}
            />

            {/* Fecha de Nacimiento */}
            <TextField
              fullWidth
              type="date"
              label="Fecha de Nacimiento *"
              name="dob"
              InputLabelProps={{ shrink: true }}
              value={formData.dob}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <CalendarIcon sx={{ color: "text.secondary", mr: 1.5 }} />
                ),
              }}
            />

            {/* Contraseña */}
            <TextField
              fullWidth
              type="password"
              label="Contraseña *"
              name="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <LockIcon sx={{ color: "text.secondary", mr: 1.5 }} />
                ),
              }}
            />

            {/* Confirmación de Contraseña */}
            <TextField
              fullWidth
              type="password"
              label="Confirmar Contraseña *"
              name="passwordConfirm"
              placeholder="Repite tu contraseña"
              value={formData.passwordConfirm}
              onChange={handleChange}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <LockIcon sx={{ color: "text.secondary", mr: 1.5 }} />
                ),
              }}
            />

            <Divider sx={{ my: 2, borderColor: "rgba(255, 255, 255, 0.05)" }} />

            {/* Acciones */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                disabled={loading}
                onClick={onGoBack}
                sx={{ px: 3, py: 1, borderRadius: 3 }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ px: 4, py: 1, borderRadius: 3 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Registrarse"
                )}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
