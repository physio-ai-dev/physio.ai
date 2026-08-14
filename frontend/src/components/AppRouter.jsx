import { Box, Container } from "@mui/material";
import Disclaimer from "./Disclaimer/Disclaimer";
import SearchForm from "./Search/SearchForm";
import ResultPanel from "./Search/ResultPanel";
import CreatePlayerPage from "./Players/CreatePlayerPage";
import RegisterPage from "./Auth/RegisterPage";
import PricingPage from "./Pricing/PricingPage";
import DashboardPage from "./Dashboard/DashboardPage";
import DashboardPanel from "./Dashboard/DashboardPanel";
import SearchHistoryPage from "./History/SearchHistoryPage";
import LoginPage from "./Auth/LoginPage";
import TopSearchedPage from "./Reports/TopSearchedPage";

export default function AppRouter({
  page,
  isLoggedIn,
  currentUser,
  searchQuery,
  setSearchQuery,
  loading,
  error,
  matchedPlayers,
  player,
  clinicalReport,
  calculatedAge,
  dashboardSelectedPlayer,
  formatBirthdate,
  renderLegibleReport,
  onSubmit,
  onSelectPlayer,
  onNavigateToCreate,
  onGoBack,
  onRegisterSuccess,
  onGoBackFromPricing,
  onResetDashboard,
  onSelectPlayerClinical,
  onSelectPlayerPerformance,
  onResetSearch,
  onBackToMatches,
  onLoginSuccess,
}) {
  const containerMaxWidth =
    page === "dashboard" || page === "top-searched" || page === "history"
      ? "lg"
      : "md";

  return (
    <Container
      maxWidth={containerMaxWidth}
      sx={{
        py: 6,
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {page === "create" ? (
        <CreatePlayerPage onGoBack={onGoBack} />
      ) : page === "register" ? (
        <RegisterPage
          onGoBack={onGoBack}
          onRegisterSuccess={onRegisterSuccess}
        />
      ) : page === "login" ? (
        <LoginPage onGoBack={onGoBack} onLoginSuccess={onLoginSuccess} />
      ) : page === "pricing" ? (
        <PricingPage onGoBack={onGoBackFromPricing} currentUser={currentUser} />
      ) : page === "dashboard" ? (
        <DashboardPage
          initialPlayer={dashboardSelectedPlayer}
          onResetPlayer={onResetDashboard}
        />
      ) : page === "top-searched" ? (
        <TopSearchedPage
          onSelectPlayerClinical={onSelectPlayerClinical}
          onSelectPlayerPerformance={onSelectPlayerPerformance}
        />
      ) : page === "history" ? (
        <SearchHistoryPage
          onSelectPlayerClinical={onSelectPlayerClinical}
          onSelectPlayerPerformance={onSelectPlayerPerformance}
        />
      ) : clinicalReport ? (
        <ResultPanel
          clinicalReport={clinicalReport}
          player={player}
          calculatedAge={calculatedAge}
          matchedPlayers={matchedPlayers}
          formatBirthdate={formatBirthdate}
          renderLegibleReport={renderLegibleReport}
          onBackToMatches={onBackToMatches}
          onReset={onResetSearch}
        />
      ) : (
        <>
          <Disclaimer />
          <SearchForm
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            loading={loading}
            error={error}
            matchedPlayers={matchedPlayers}
            player={player}
            onSubmit={onSubmit}
            onSelectPlayer={onSelectPlayer}
            onNavigateToCreate={onNavigateToCreate}
            isAdmin={currentUser?.role === "admin"}
          />
          {player && (
            <Box sx={{ mt: 2 }}>
              <DashboardPanel jugadorId={player.id} />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
