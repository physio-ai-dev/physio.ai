import { AppBar, Toolbar, Box, Typography, Button } from "@mui/material";
import { MedicalServices as MedicalServicesIcon, Logout as LogoutIcon } from "@mui/icons-material";

export default function Header({
  onLogoClick,
  onRegisterClick,
  onLoginClick,
  onLogout,
  isLoggedIn,
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

          {isLoggedIn ? (
            /* Botón cuando el usuario TIENE sesión activa */
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={onLogout}
              sx={{
                borderRadius: 12,
                px: 2.5,
                py: 0.6,
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                borderWidth: "1.5px",
                "&:hover": {
                  borderWidth: "1.5px",
                },
              }}
            >
              Cerrar Sesión
            </Button>
          ) : (
            /* Botones cuando NO hay sesión activa */
            <>
              {onRegisterClick && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={onRegisterClick}
                  sx={{
                    borderRadius: 12,
                    px: 2.5,
                    py: 0.6,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    borderWidth: "1.5px",
                    "&:hover": {
                      borderWidth: "1.5px",
                    },
                  }}
                >
                  Crear Cuenta
                </Button>
              )}

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