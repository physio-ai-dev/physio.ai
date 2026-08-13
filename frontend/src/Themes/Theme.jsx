import { createTheme } from "@mui/material";

export const darkTheme = createTheme({
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
