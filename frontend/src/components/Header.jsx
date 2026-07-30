import { AppBar, Toolbar, Box, Typography } from "@mui/material";
import { MedicalServices as MedicalServicesIcon } from "@mui/icons-material";

export default function Header({ onLogoClick }) {
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
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            letterSpacing: 0.5,
          }}
        >
          Football Injury Companion
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
