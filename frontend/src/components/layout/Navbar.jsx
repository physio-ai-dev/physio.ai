import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

/**
 * ============================================================================
 * SCRUM-61: Componente Global Navbar
 * - Aislado para que no interfiera con los cambios de vista/rutas.
 * ============================================================================
 */
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
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button color="inherit" component={Link} to="/">
              Inicio
            </Button>
            
            {/* Navegación a la app/buscador */}
            <Button
              variant="contained"
              onClick={() => navigate('/app')}
              sx={{
                bgcolor: '#10b981',
                '&:hover': { bgcolor: '#059669' },
                borderRadius: 3,
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              Ir al Buscador
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}