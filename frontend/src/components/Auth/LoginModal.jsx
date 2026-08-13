import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Alert, Box } from "@mui/material";
import { loginUser } from "../../api/authService";
import ActionButton from "../Common/Buttons/ActionButton";

export default function LoginModal({ open, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await loginUser(email, password);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>Iniciar Sesión</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
          />
          <ActionButton type="submit" size="large" sx={{ mt: 1 }}>
            Ingresar
          </ActionButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
