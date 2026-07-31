import React from 'react';
import { Box, Container, Typography } from '@mui/material';

/**
 * ============================================================================
 * SCRUM-61: Componente Global Footer
 * - Permanece fijo en la parte inferior, independiente de los cambios de ruta.
 * ============================================================================
 */
export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        mt: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        bgcolor: '#030712',
        textAlign: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Physio.AI — Sistema de Criterio Médico Deportivo y Auditoría IA.
        </Typography>
      </Container>
    </Box>
  );
}