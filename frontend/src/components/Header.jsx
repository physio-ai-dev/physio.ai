import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  MedicalServices as MedicalServicesIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Dashboard as DashboardIcon,
  Paid as PaidIcon,
  BarChart as BarChartIcon,
  History as HistoryIcon,
} from "@mui/icons-material";

export default function Header({
  onLogoClick,
  onRegisterClick,
  onLoginClick,
  onLogout,
  isLoggedIn,
  user,
  onPricingClick,
  onSearchClick,
  onDashboardClick,
  onTopSearchedClick,
  onHistoryClick,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (callback) => {
    if (callback) callback();
    setDrawerOpen(false);
  };

  return (
    <>
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
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

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
                      bgcolor:
                        user?.subscription_tier === "premium"
                          ? "#f59e0b"
                          : "#6b7280",
                      fontSize: "0.95rem",
                      fontWeight: 800,
                    }}
                  >
                    {user?.username ? user.username[0].toUpperCase() : "U"}
                  </Avatar>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {user?.username || "Usuario"}
                    </Typography>
                    <Chip
                      label={
                        user?.subscription_tier === "premium"
                          ? "PRO"
                          : "Gratuito"
                      }
                      size="small"
                      sx={{
                        height: 16,
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        bgcolor:
                          user?.subscription_tier === "premium"
                            ? "rgba(245, 158, 11, 0.1)"
                            : "rgba(255, 255, 255, 0.05)",
                        color:
                          user?.subscription_tier === "premium"
                            ? "#fbbf24"
                            : "text.secondary",
                        border:
                          user?.subscription_tier === "premium"
                            ? "1px solid rgba(245, 158, 11, 0.3)"
                            : "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                    />
                  </Box>
                </Box>
                <IconButton
                  onClick={onLogout}
                  size="small"
                  sx={{ color: "error.main" }}
                >
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
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

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          sx: {
            width: 290,
            bgcolor: "rgba(10, 18, 36, 0.96)",
            backdropFilter: "blur(25px)",
            borderRight: "1px solid rgba(255, 255, 255, 0.07)",
            boxShadow: "10px 0 40px rgba(0, 0, 0, 0.6)",
            p: 3,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            mb: 1.5,
            mt: 2.5,
            ml: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <MedicalServicesIcon
              color="primary"
              sx={{ fontSize: 26, filter: "drop-shadow(0 0 6px #10b98160)" }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                letterSpacing: 1,
                background: "linear-gradient(90deg, #10b981, #34d399)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Navegación
            </Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            Physio.AI Control Panel
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.06)", my: 2 }} />

        <Box sx={{ flexGrow: 1 }}>
          <List
            sx={{ display: "flex", flexDirection: "column", gap: 2, px: 1.5 }}
          >
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(onSearchClick)}
                sx={{
                  borderRadius: 3.5,
                  px: 2,
                  py: 1.2,
                  border: "1px solid rgba(255, 255, 255, 0.02)",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: "rgba(16, 185, 129, 0.06)",
                    borderColor: "rgba(16, 185, 129, 0.2)",
                    transform: "translateX(4px)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: 2.5,
                    bgcolor: "rgba(16, 185, 129, 0.08)",
                    color: "#10b981",
                    mr: 2,
                  }}
                >
                  <SearchIcon fontSize="small" />
                </Box>
                <ListItemText
                  primary="Buscador Clínico"
                  primaryTypographyProps={{
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    color: "text.primary",
                  }}
                />
              </ListItemButton>
            </ListItem>

            {isLoggedIn && (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigation(onDashboardClick)}
                    sx={{
                      borderRadius: 3.5,
                      px: 2,
                      py: 1.2,
                      border: "1px solid rgba(255, 255, 255, 0.02)",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        bgcolor: "rgba(59, 130, 246, 0.06)",
                        borderColor: "rgba(59, 130, 246, 0.2)",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        borderRadius: 2.5,
                        bgcolor: "rgba(59, 130, 246, 0.08)",
                        color: "#3b82f6",
                        mr: 2,
                      }}
                    >
                      <DashboardIcon fontSize="small" />
                    </Box>
                    <ListItemText
                      primary="Dashboard Rendimiento"
                      primaryTypographyProps={{
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        color: "text.primary",
                      }}
                    />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigation(onTopSearchedClick)}
                    sx={{
                      borderRadius: 3.5,
                      px: 2,
                      py: 1.2,
                      border: "1px solid rgba(255, 255, 255, 0.02)",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        bgcolor: "rgba(245, 158, 11, 0.06)",
                        borderColor: "rgba(245, 158, 11, 0.2)",
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 36,
                        height: 36,
                        borderRadius: 2.5,
                        bgcolor: "rgba(245, 158, 11, 0.08)",
                        color: "#f59e0b",
                        mr: 2,
                      }}
                    >
                      <BarChartIcon fontSize="small" />
                    </Box>
                    <ListItemText
                      primary="Top Buscados"
                      primaryTypographyProps={{
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        color: "text.primary",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </>
            )}

            {onPricingClick && user?.subscription_tier !== "premium" && (
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(onPricingClick)}
                  sx={{
                    borderRadius: 3.5,
                    px: 2,
                    py: 1.2,
                    border: "1px solid rgba(255, 255, 255, 0.02)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: "rgba(167, 139, 250, 0.06)",
                      borderColor: "rgba(167, 139, 250, 0.2)",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: 2.5,
                      bgcolor: "rgba(167, 139, 250, 0.08)",
                      color: "#a78bfa",
                      mr: 2,
                    }}
                  >
                    <PaidIcon fontSize="small" />
                  </Box>
                  <ListItemText
                    primary="Planes de Precios"
                    primaryTypographyProps={{
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      color: "text.primary",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>

        {isLoggedIn && user?.subscription_tier === "premium" && (
          <Box sx={{ mt: "auto", pt: 2 }}>
            <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.06)", mb: 2 }} />
            <List sx={{ display: "flex", flexDirection: "column", px: 1.5 }}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(onHistoryClick)}
                  sx={{
                    borderRadius: 3.5,
                    px: 2,
                    py: 1.2,
                    bgcolor: "rgba(16, 185, 129, 0.04)",
                    border: "1px solid rgba(16, 185, 129, 0.15)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: "rgba(16, 185, 129, 0.08)",
                      borderColor: "rgba(16, 185, 129, 0.3)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: 2.5,
                      bgcolor: "rgba(16, 185, 129, 0.1)",
                      color: "#10b981",
                      mr: 2,
                    }}
                  >
                    <HistoryIcon fontSize="small" />
                  </Box>
                  <ListItemText
                    primary="Historial"
                    primaryTypographyProps={{
                      fontWeight: 900,
                      fontSize: "0.95rem",
                      color: "#10b981",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        )}
      </Drawer>
    </>
  );
}
