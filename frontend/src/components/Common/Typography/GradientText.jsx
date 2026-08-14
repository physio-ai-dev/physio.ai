import { Box } from "@mui/material";

/**
 * GradientText — Texto con gradiente reutilizable.
 * @param {string} gradient - Valor CSS para background (default: verde → azul cielo)
 */
export default function GradientText({ children, gradient, sx = {}, component = "span" }) {
  return (
    <Box
      component={component}
      sx={{
        background: gradient || "linear-gradient(90deg, #10b981, #38bdf8)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        display: "inline",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
