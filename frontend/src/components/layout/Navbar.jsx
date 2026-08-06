import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backdropFilter: 'blur(16px)',
        bgcolor: 'rgba(3, 7, 18, 0.8)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Logo / Home link */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <MedicalServicesIcon sx={{ color: '#10b981', fontSize: 28 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                letterSpacing: 1.2,
                background: 'linear-gradient(90deg, #10b981, #34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Physio.AI
            </Typography>
          </Box>

          {/* Enlaces de navegación */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            {/* Botón Registrarse */}
            <Button
              variant="outlined"
              onClick={() => navigate('/register')}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: '#f8fafc',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '20px',
                px: 2.5,
                '&:hover': {
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                },
              }}
            >
              Registrarse
            </Button>

            {/* Botón Iniciar Sesión (Reemplaza a "Ingresar al Buscador") */}
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                bgcolor: '#10b981',
                color: '#030712',
                '&:hover': { bgcolor: '#34d399' },
                borderRadius: '20px',
                fontWeight: 700,
                textTransform: 'none',
                px: 2.5,
              }}
            >
              Iniciar Sesión
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}