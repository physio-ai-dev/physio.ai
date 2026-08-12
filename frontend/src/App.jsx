import { useState, useEffect } from "react";
import { api } from "./api/backend";
import { isAuthenticated, logoutUser } from "./api/authService";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import Header from "./components/Header";
import Disclaimer from "./components/Disclaimer";
import SearchForm from "./components/SearchForm";
import ResultPanel from "./components/ResultPanel";
import CreatePlayerPage from "./components/CreatePlayerPage";
import LandingPage from "./components/LandingPage";
import RegisterPage from "./components/RegisterPage";
import PricingPage from "./components/PricingPage";
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
                  ),
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
              ),
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
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
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
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (e) {}
      }
    }

    const queryParams = new URLSearchParams(window.location.search);
    const paymentStatus = queryParams.get("payment");
    if (paymentStatus === "success") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          userObj.subscription_tier = "premium";
          localStorage.setItem("user", JSON.stringify(userObj));
          setCurrentUser(userObj);
        } catch (e) {}
      }
      setPaymentMessage("¡Suscripción PRO activada con éxito! Disfruta de búsquedas ilimitadas.");
      setPaymentDialogOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === "cancel") {
      setPaymentMessage("El pago fue cancelado. Puedes adquirir el plan PRO en cualquier momento.");
      setPaymentDialogOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setCurrentUser(null);
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
      if (
        err.message.includes("límite") ||
        err.message.includes("429") ||
        err.message.includes("limit_reached")
      ) {
        setIsLimitOpen(true);
      } else {
        setError(err.message || "Error al buscar el futbolista.");
      }
    } finally {
      setLoading(false);
    }
  };

  const seleccionarJugador = async (datosCompletos) => {
    setLoading(true);
    setError(null);
    try {
      api.registrarSeleccion(datosCompletos.id).catch(console.error);
      const resReport = await api.obtenerReporteClinico(datosCompletos.id);
      const reportData = resReport.data;
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
      setResultadoFinal(reportData);
      setListaCoincidencias([]);
    } catch (err) {
      setError(err.message || "Error al generar el diagnóstico de la lesión.");
    } finally {
      setLoading(false);
    }
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
          <LandingPage
            onStart={() => setShowLanding(false)}
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
              user={currentUser}
              onPricingClick={() => {
                setShowLanding(false);
                setPage("pricing");
              }}
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
              ) : page === "pricing" ? (
                <PricingPage
                  onGoBack={() => {
                    if (!isLoggedIn) setShowLanding(true);
                    setPage("search");
                  }}
                  currentUser={currentUser}
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
            const userStr = localStorage.getItem("user");
            if (userStr) {
              try {
                setCurrentUser(JSON.parse(userStr));
              } catch (e) {}
            }
          }}
        />

        <Dialog
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          PaperProps={{
            sx: {
              bgcolor: "rgba(11, 21, 40, 0.95)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 4,
              p: 2,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 900, color: "primary.light" }}>
            Información de Pago
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: "text.secondary", fontWeight: 500 }}>
              {paymentMessage}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ gap: 1.5, px: 3, pb: 2 }}>
            <Button variant="contained" color="primary" onClick={() => setPaymentDialogOpen(false)} sx={{ borderRadius: 3, px: 3 }}>
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={isLimitOpen}
          onClose={() => setIsLimitOpen(false)}
          PaperProps={{
            sx: {
              bgcolor: "rgba(11, 21, 40, 0.95)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 4,
              p: 2,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 900, color: "primary.light" }}>
            Límite de Búsquedas Alcanzado
          </DialogTitle>
          <DialogContent>
            <DialogContentText
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              {isLoggedIn
                ? "Has alcanzado el límite de 3 búsquedas diarias permitidas para tu cuenta gratuita. ¡Hazte PRO para obtener búsquedas ilimitadas!"
                : "Has alcanzado el límite de 3 búsquedas diarias permitidas para usuarios invitados. Registra una cuenta nueva o inicia sesión para continuar."}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ gap: 1.5, px: 3, pb: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setIsLimitOpen(false)}
              sx={{ borderRadius: 3, px: 3 }}
            >
              Cerrar
            </Button>
            {!isLoggedIn ? (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    setIsLimitOpen(false);
                    setIsLoginOpen(true);
                  }}
                  sx={{ borderRadius: 3, px: 3 }}
                >
                  Iniciar Sesión
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    setIsLimitOpen(false);
                    setShowLanding(false);
                    setPage("register");
                  }}
                  sx={{ borderRadius: 3, px: 3 }}
                >
                  Registrarse Gratis
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setIsLimitOpen(false);
                  setShowLanding(false);
                  setPage("pricing");
                }}
                sx={{ borderRadius: 3, px: 3 }}
              >
                Explorar Premium
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;
