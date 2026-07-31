import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * ============================================================================
 * SCRUM-58: Layout Maestro y Preparación de Diseño
 * - Mantiene Navbar y Footer fijos.
 * - <Outlet /> renderiza las vistas dinámicas (/ y /app) sin saltos visuales toscos.
 * ============================================================================
 */
export default function MainLayout() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: '#030712',
        color: '#f8fafc',
      }}
    >
      {/* SCRUM-61: Navbar Fijo */}
      <Navbar />

      {/* Área de Contenido Variable */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      {/* SCRUM-61: Footer Fijo */}
      <Footer />
    </Box>
  );
}