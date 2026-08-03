import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { api } from "./api/backend";
import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography, Divider } from "@mui/material";
import Header from "./components/Header";
import Disclaimer from "./components/Disclaimer";
import SearchForm from "./components/SearchForm";
import ResultPanel from "./components/ResultPanel";
import CreatePlayerPage from "./components/CreatePlayerPage";
import LandingPage from "./components/LandingPage";
import MainLayout from "./components/layout/MainLayout";

// Configuración de un tema oscuro de alta gama (Premium Dark Mode)
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#10b981", // Emerald Green
      light: "#34d399",
      dark: "#059669",
    },
    background: {
      default: "#030712", // Slate 950 ultra oscuro
      paper: "#0b1528", // Dark slate con toques azulados
    },
    text: {
      primary: "#f8fafc",
      secondary: "#94a3b8",
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: "none",
          fontWeight: 700,
          fontSize: "1rem",
          letterSpacing: "0.5px",
          boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.1)",
          "&:hover": {
            boxShadow: "0 6px 20px 0 rgba(16, 185, 129, 0.3)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: "1px solid rgba(255, 255, 255, 0.05)",
          backgroundColor: "#0b1528c0",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 18,
            backgroundColor: "rgba(3, 7, 18, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: "rgba(16, 185, 129, 0.5)",
            },
            "&.Mui-focused": {
              borderColor: "#10b981",
              boxShadow: "0 0 15px rgba(16, 185, 129, 0.25)",
            },
          },
        },
      },
    },
  },
});

// Función avanzada para renderizar el reporte médico línea por línea con alta legibilidad
const renderLegibleReport = (text) => {
  if (!text) return null;

  // Reemplazar saltos de línea escapados (\\n) por saltos reales (\n) por si vienen como texto plano
  const cleanText = text.replace(/\\n/g, "\n");

  // Dividir el texto en líneas y procesar de forma inteligente para mejorar el diseño
  const lines = cleanText.split("\n");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          // Espaciador para separar párrafos o listas
          return <Box key={idx} sx={{ height: 6 }} />;
        }

        // Caso A: Es una viñeta/lista (líneas que empiezan con "-", "*" o números como "1.")
        if (
          trimmed.startsWith("-") ||
          trimmed.startsWith("*") ||
          /^\d+\./.test(trimmed)
        ) {
          const cleanLine = trimmed.replace(/^[-*\s]+|^\d+\.\s*/, "");
          const parts = cleanLine.split(/\*\*([\s\S]*?)\*\*/g);
          return (
            <Box
              key={idx}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
                pl: 2,
              }}
            >
              <span
                style={{
                  color: "#34d399",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  marginTop: "-3px",
                }}
              >
                •
              </span>
              <Typography
                variant="body2"
                sx={{
                  lineHeight: 1.8,
                  color: "text.primary",
                  fontSize: "0.95rem",
                }}
              >
                {parts.map((part, i) =>
                  i % 2 === 1 ? (
                    <strong
                      key={i}
                      style={{ fontWeight: 800 }}
                    >
                      {part}
                    </strong>
                  ) : (
                    part
                  ),
                )}
              </Typography>
            </Box>
          );
        }

        // Caso B: Es un encabezado de sección (ej. Termina con dos puntos ":" o empieza con "###")
        if (
          trimmed.endsWith(":") ||
          trimmed.startsWith("###") ||
          trimmed.startsWith("#")
        ) {
          const cleanHeader = trimmed
            .replace(/#/g, "")
            .replace(/:$/, "")
            .trim();
          const parts = cleanHeader.split(/\*\*([\s\S]*?)\*\*/g);
          return (
            <Box key={idx} sx={{ mt: 3, mb: 1.5 }}>
              {idx > 0 && (
                <Divider
                  sx={{ mb: 2, borderColor: "rgba(255, 255, 255, 0.05)" }}
                />
              )}
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 900,
                  color: "primary.light",
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  fontSize: "0.85rem",
                }}
              >
                {parts.map((part, i) => (i % 2 === 1 ? part : part))}
              </Typography>
            </Box>
          );
        }

        // Caso C: Es un párrafo estándar
        const parts = trimmed.split(/\*\*([\s\S]*?)\*\*/g);
        return (
          <Typography
            key={idx}
            variant="body2"
            sx={{
              lineHeight: 1.8,
              mb: 0.5,
              color: "text.primary",
              fontSize: "0.96rem",
              textAlign: "justify",
            }}
          >
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} style={{ fontWeight: 800 }}>
                  {part}
                </strong>
              ) : (
                part
              ),
            )}
          </Typography>
        );
      })}
    </Box>
  );
};

// Formatea la fecha de nacimiento de YYYY-MM-DD a DD/MM/YYYY
const formatBirthdate = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

// Calcula la edad precisa al día de hoy basándose en la fecha de nacimiento (YYYY-MM-DD)
const calculateAge = (birthdateStr) => {
  if (!birthdateStr) return null;
  const parts = birthdateStr.split("-");
  if (parts.length !== 3) return null;

  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1; // Mes en JS es base 0
  const birthDay = parseInt(parts[2], 10);

  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const monthDiff = today.getMonth() - birthMonth;

  // Ajuste si aún no ha cumplido años este año
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
    age--;
  }
  return age;
};

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [page, setPage] = useState("search"); // "search" | "create"
  const [busqueda, setBusqueda] = useState("");
  const [listaCoincidencias, setListaCoincidencias] = useState([]);
  const [jugador, setJugador] = useState(null);
  const [resultadoFinal, setResultadoFinal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  const handleBuscarYAnalizar = async (e) => {
    e.preventDefault();
    if (!busqueda.trim()) return;

    setLoading(true);
    setError(null);
    setJugador(null);
    setResultadoFinal(null);
    setListaCoincidencias([]);

    try {
      const respuesta = await api.buscarJugador(busqueda);

      if (
        respuesta &&
        respuesta.status === "success" &&
        Array.isArray(respuesta.data) &&
        respuesta.data.length > 0
      ) {
        // Si hay una única coincidencia, la seleccionamos directamente
        if (respuesta.data.length === 1) {
          seleccionarJugador(respuesta.data[0]);
        } else {
          // Si hay varias, mostramos la lista para que el usuario seleccione la correcta
          setListaCoincidencias(respuesta.data);
        }
      } else {
        throw new Error("No se encontraron registros del futbolista.");
      }
    } catch (err) {
      setError(err.message || "Error al buscar el futbolista.");
    } finally {
      setLoading(false);
    }
  };

  const seleccionarJugador = (datosCompletos) => {
    setJugador({
      id: datosCompletos.id,
      nombre: datosCompletos.nombre,
      equipo: datosCompletos.equipo,
      foto: datosCompletos.foto_url,
      edad: datosCompletos.edad,
      fecha_nacimiento: datosCompletos.fecha_nacimiento,
      estatura: datosCompletos.estatura,
      valor_mercado: datosCompletos.valor_mercado,
    });
    setResultadoFinal(datosCompletos.reporte_ia);
    setListaCoincidencias([]);
  };

  // Calcular la edad de manera dinámica al renderizar
  const edadCalculada = jugador?.fecha_nacimiento
    ? calculateAge(jugador.fecha_nacimiento)
    : jugador?.edad;

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        }}
      >
        {/* Navbar */}
        <Header onLogoClick={() => setPage("search")} />

        {/* Contenido Principal */}
        <Container
          maxWidth="md"
          sx={{
            py: 6,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {page === "create" ? (
            /* Vista 1: Formulario de Alta Local */
            <CreatePlayerPage onGoBack={() => setPage("search")} />
          ) : resultadoFinal ? (
            /* Vista 2: PANEL DE RESULTADOS AUTOMÁTICO */
            <ResultPanel
              resultadoFinal={resultadoFinal}
              jugador={jugador}
              edadCalculada={edadCalculada}
              listaCoincidencias={listaCoincidencias}
              formatBirthdate={formatBirthdate}
              renderLegibleReport={renderLegibleReport}
              onBackToMatches={() => setJugador(null)}
              onReset={() => {
                setJugador(null);
                setResultadoFinal(null);
                setBusqueda("");
                setListaCoincidencias([]);
              }}
            />
          ) : (
            /* Vista 3: Formulario de Búsqueda y Resultados */
            <>
              {/* Cabecera / Propósito de la App */}
              <Disclaimer />

              {/* Formulario de Búsqueda y Resultados */}
              <SearchForm
                busqueda={busqueda}
                setBusqueda={setBusqueda}
                loading={loading}
                error={error}
                listaCoincidencias={listaCoincidencias}
                jugador={jugador}
                onSubmit={handleBuscarYAnalizar}
                onSelectPlayer={seleccionarJugador}
                onNavigateToCreate={() => setPage("create")}
              />
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
