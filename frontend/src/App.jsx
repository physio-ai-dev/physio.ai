import { useState, useEffect } from "react";
import { api } from "./api/backend";
import { isAuthenticated, logoutUser } from "./api/authService";
import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography, Divider } from "@mui/material";
import Header from "./components/Header";
import Disclaimer from "./components/Disclaimer";
import SearchForm from "./components/SearchForm";
import ResultPanel from "./components/ResultPanel";
import CreatePlayerPage from "./components/CreatePlayerPage";
import LandingPage from "./components/LandingPage";
import RegisterPage from "./components/RegisterPage";
import LoginModal from "./components/LoginModal";
import DashboardPanel from "./components/DashboardPanel";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    background: {
      default: "#030712",
      paper: "#0b1528",
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

const renderLegibleReport = (text) => {
  if (!text) return null;

  const cleanText = text.replace(/\\n/g, "\n");
  const lines = cleanText.split("\n");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <Box key={idx} sx={{ height: 6 }} />;
        }

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
                    <strong key={i} style={{ fontWeight: 800 }}>
                      {part}
                    </strong>
                  ) : (
                    part
                  )
                )}
              </Typography>
            </Box>
          );
        }

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
              )
            )}
          </Typography>
        );
      })}
    </Box>
  );
};

const formatBirthdate = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const calculateAge = (birthdateStr) => {
  if (!birthdateStr) return null;
  const parts = birthdateStr.split("-");
  if (parts.length !== 3) return null;

  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1;
  const birthDay = parseInt(parts[2], 10);

  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const monthDiff = today.getMonth() - birthMonth;

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
    age--;
  }
  return age;
};

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [page, setPage] = useState("search");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [listaCoincidencias, setListaCoincidencias] = useState([]);
  const [jugador, setJugador] = useState(null);
  const [resultadoFinal, setResultadoFinal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const logged = isAuthenticated();
    setIsLoggedIn(logged);
    if (logged) {
      setShowLanding(false);
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setShowLanding(true);
    setPage("search");
    setJugador(null);
    setResultadoFinal(null);
  };

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
        if (respuesta.data.length === 1) {
          seleccionarJugador(respuesta.data[0]);
        } else {
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
        {showLanding ? (
          /* Renderiza únicamente la Landing Page */
          <LandingPage
  onStart={() => setIsLoginOpen(true)}
  onRegister={() => {
    setShowLanding(false);
    setPage("register");
  }}
  onGoSearch={() => {
    setShowLanding(false);
    setPage("search");
  }}
/>
        ) : (
          /* Renderiza la app principal con el Header global */
          <>
            <Header
              onLogoClick={() => {
                if (isLoggedIn) {
                  setShowLanding(false);
                } else {
                  setShowLanding(true);
                }
                setPage("search");
              }}
              onRegisterClick={() => {
                setShowLanding(false);
                setPage("register");
              }}
              onLoginClick={() => setIsLoginOpen(true)}
              onLogout={handleLogout}
              isLoggedIn={isLoggedIn}
            />

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
                <CreatePlayerPage onGoBack={() => setPage("search")} />
              ) : page === "register" ? (
                <RegisterPage
                  onGoBack={() => {
                    if (!isLoggedIn) setShowLanding(true);
                    setPage("search");
                  }}
                  onRegisterSuccess={() => setPage("search")}
                />
              ) : resultadoFinal ? (
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
                <>
                  <Disclaimer />
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

                  {/* SCRUM-80 / SCRUM-83: Renderiza el Dashboard del Jugador cuando está seleccionado */}
                  {jugador && (
                    <Box sx={{ mt: 2 }}>
                      <DashboardPanel jugadorId={jugador.id} />
                    </Box>
                  )}
                </>
              )}
            </Container>
          </>
        )}

        <LoginModal
          open={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onSuccess={() => {
            setIsLoginOpen(false);
            setIsLoggedIn(true);
            setShowLanding(false);
            setPage("search");
          }}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;