import { AppBar, Toolbar, Box, Typography, Button, Avatar, Chip, IconButton } from "@mui/material";
import {
  MedicalServices as MedicalServicesIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

export default function Header({
  onLogoClick,
  onRegisterClick,
  onLoginClick,
  onLogout,
  isLoggedIn,
  user,
  onPricingClick,
}) {
  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        bgcolor: "rgba(11, 21, 40, 0.5)",
        backdropFilter: "blur(16px)",
      }}
    >
      <Toolbar>
        <Box
          onClick={onLogoClick}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexGrow: 1,
            cursor: onLogoClick ? "pointer" : "default",
          }}
        >
          <MedicalServicesIcon
            color="primary"
            sx={{ fontSize: 26, filter: "drop-shadow(0 0 8px #10b98160)" }}
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 900,
              letterSpacing: 1.5,
              background: "linear-gradient(90deg, #10b981, #34d399)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Physio.AI
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              letterSpacing: 0.5,
              display: { xs: "none", sm: "block" },
              mr: 1,
            }}
          >
            Football Injury Companion
          </Typography>

          {onPricingClick && user?.subscription_tier !== "premium" && (
            <Button
              color="inherit"
              size="small"
              onClick={onPricingClick}
              sx={{ textTransform: "none", fontWeight: 700, opacity: 0.85 }}
            >
              Planes
            </Button>
          )}

          {isLoggedIn ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: user?.subscription_tier === "premium" ? "#f59e0b" : "#6b7280",
                    fontSize: "0.95rem",
                    fontWeight: 800,
                  }}
                >
                  {user?.username ? user.username[0].toUpperCase() : "U"}
                </Avatar>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {user?.username || "Usuario"}
                  </Typography>
                  <Chip
                    label={user?.subscription_tier === "premium" ? "PRO" : "Gratuito"}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      bgcolor: user?.subscription_tier === "premium" ? "rgba(245, 158, 11, 0.1)" : "rgba(255, 255, 255, 0.05)",
                      color: user?.subscription_tier === "premium" ? "#fbbf24" : "text.secondary",
                      border: user?.subscription_tier === "premium" ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  />
                </Box>
              </Box>
              <IconButton onClick={onLogout} size="small" sx={{ color: "error.main" }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            /* Botones cuando NO hay sesión activa */
            <>
              {onLoginClick && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={onLoginClick}
                  sx={{
                    borderRadius: 12,
                    px: 2.5,
                    py: 0.6,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  Iniciar Sesión
                </Button>
              )}
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
