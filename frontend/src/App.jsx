import { useState, useEffect } from "react";
import { api } from "./api/backend";
import { isAuthenticated, logoutUser } from "./api/authService";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import Header from "./components/Header";
import LandingPage from "./components/Landing/LandingPage";
import AppRouter from "./components/AppRouter";
import SearchLimitDialog from "./components/Common/Feedback/SearchLimitDialog";
import { darkTheme } from "./Themes/Theme.jsx";
import {
  renderLegibleReport,
  formatBirthdate,
  calculateAge,
} from "./utils/helpers.jsx";

function App() {
  // ── Navegación ────────────────────────────────────────────────────────────
  const [showLanding, setShowLanding] = useState(true);
  const [page, setPage] = useState("search");

  // ── Autenticación ─────────────────────────────────────────────────────────
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // ── Búsqueda Clínica ──────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [matchedPlayers, setMatchedPlayers] = useState([]);
  const [player, setPlayer] = useState(null);
  const [clinicalReport, setClinicalReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Dashboard ─────────────────────────────────────────────────────────────
  const [dashboardSelectedPlayer, setDashboardSelectedPlayer] = useState(null);

  // ── Límite de búsquedas ───────────────────────────────────────────────────
  const [isLimitOpen, setIsLimitOpen] = useState(false);

  // ── Inicialización: sesión y estado de pago Stripe ───────────────────────
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

    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
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
      alert(
        "¡Suscripción PRO activada con éxito! Disfruta de búsquedas ilimitadas.",
      );
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === "cancel") {
      alert(
        "El pago fue cancelado. Puedes adquirir el plan PRO en cualquier momento.",
      );
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // ── Handlers de autenticación ─────────────────────────────────────────────
  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowLanding(true);
    setPage("search");
    setPlayer(null);
    setClinicalReport(null);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLanding(false);
    setPage("search");
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (e) {}
    }
  };

  // ── Handlers de búsqueda clínica ──────────────────────────────────────────
  const selectPlayer = async (fullData) => {
    setLoading(true);
    setError(null);
    try {
      api.recordSelection(fullData.id, "clinico").catch(console.error);
      const resReport = await api.getClinicalReport(fullData.id);
      setPlayer({
        id: fullData.id,
        name: fullData.name,
        club: fullData.club,
        photoUrl: fullData.photoUrl,
        birthdate: fullData.birthdate,
        height: fullData.height,
        marketValue: fullData.marketValue,
      });
      setClinicalReport(resReport.data);
      setMatchedPlayers([]);
    } catch (err) {
      setError(err.message || "Error al generar el diagnóstico de la lesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchAndAnalyze = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setPlayer(null);
    setClinicalReport(null);
    setMatchedPlayers([]);
    try {
      const response = await api.searchPlayer(searchQuery);
      if (
        response?.status === "success" &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        if (response.data.length === 1) {
          selectPlayer(response.data[0]);
        } else {
          setMatchedPlayers(response.data);
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

  // ── Handler para navegar a perfil clínico desde otras páginas ─────────────
  const handleSelectPlayerClinical = async (p) => {
    setLoading(true);
    setError(null);
    try {
      api.recordSelection(p.id, "clinico").catch(console.error);
      const resDetails = await api.getPlayerDetails(p.id);
      const playerData = resDetails.data;
      const resReport = await api.getClinicalReport(p.id);
      setPlayer({
        id: playerData.id,
        name: playerData.name,
        club: playerData.club,
        photoUrl: playerData.photoUrl,
        birthdate: playerData.birthdate,
        height: playerData.height,
        marketValue: playerData.marketValue,
      });
      setClinicalReport(resReport.data);
      setPage("search");
    } catch (err) {
      setError(err.message || "Error al abrir el perfil clínico.");
      setPage("search");
    } finally {
      setLoading(false);
    }
  };

  // ── Handler para navegar a perfil de rendimiento desde otras páginas ──────
  const handleSelectPlayerPerformance = async (p) => {
    setLoading(true);
    setError(null);
    try {
      const resDetails = await api.getPlayerDetails(p.id);
      const playerData = resDetails.data;
      setDashboardSelectedPlayer({
        id: playerData.id,
        name: playerData.name,
        club: playerData.club,
        photoUrl: playerData.photoUrl,
      });
      setPage("dashboard");
    } catch (err) {
      setError(err.message || "Error al abrir el perfil de rendimiento.");
    } finally {
      setLoading(false);
    }
  };

  const calculatedAge = player?.birthdate
    ? calculateAge(player.birthdate)
    : null;

  // ── Render ────────────────────────────────────────────────────────────────
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
            onStart={() => {
              setShowLanding(false);
              setPage("login");
            }}
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
                if (!isLoggedIn) setShowLanding(true);
                setPage("search");
                setPlayer(null);
                setClinicalReport(null);
              }}
              onRegisterClick={() => {
                setShowLanding(false);
                setPage("register");
              }}
              onLoginClick={() => {
                setShowLanding(false);
                setPage("login");
              }}
              onLogout={handleLogout}
              isLoggedIn={isLoggedIn}
              user={currentUser}
              onPricingClick={() => {
                setShowLanding(false);
                setPage("pricing");
              }}
              onSearchClick={() => {
                setShowLanding(false);
                setPage("search");
                setPlayer(null);
                setClinicalReport(null);
              }}
              onDashboardClick={() => {
                setShowLanding(false);
                setPage("dashboard");
              }}
              onTopSearchedClick={() => {
                setShowLanding(false);
                setPage("top-searched");
              }}
              onHistoryClick={() => {
                setShowLanding(false);
                setPage("history");
              }}
            />

            <AppRouter
              page={page}
              isLoggedIn={isLoggedIn}
              currentUser={currentUser}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              loading={loading}
              error={error}
              matchedPlayers={matchedPlayers}
              player={player}
              clinicalReport={clinicalReport}
              calculatedAge={calculatedAge}
              dashboardSelectedPlayer={dashboardSelectedPlayer}
              formatBirthdate={formatBirthdate}
              renderLegibleReport={renderLegibleReport}
              onSubmit={handleSearchAndAnalyze}
              onSelectPlayer={selectPlayer}
              onNavigateToCreate={() => setPage("create")}
              onGoBack={() => {
                if (!isLoggedIn) setShowLanding(true);
                setPage("search");
              }}
              onRegisterSuccess={() => setPage("search")}
              onGoBackFromPricing={() => {
                if (!isLoggedIn) setShowLanding(true);
                setPage("search");
              }}
              onResetDashboard={() => setDashboardSelectedPlayer(null)}
              onSelectPlayerClinical={handleSelectPlayerClinical}
              onSelectPlayerPerformance={handleSelectPlayerPerformance}
              onLoginSuccess={handleLoginSuccess}
              onResetSearch={() => {
                setPlayer(null);
                setClinicalReport(null);
                setSearchQuery("");
                setMatchedPlayers([]);
              }}
              onBackToMatches={() => setPlayer(null)}
            />
          </>
        )}



        <SearchLimitDialog
          open={isLimitOpen}
          isLoggedIn={isLoggedIn}
          onClose={() => setIsLimitOpen(false)}
          onLoginClick={() => {
            setIsLimitOpen(false);
            setShowLanding(false);
            setPage("login");
          }}
          onRegisterClick={() => {
            setIsLimitOpen(false);
            setShowLanding(false);
            setPage("register");
          }}
          onUpgradeClick={() => {
            setIsLimitOpen(false);
            setShowLanding(false);
            setPage("pricing");
          }}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;
