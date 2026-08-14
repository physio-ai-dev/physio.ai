import { useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";

/**
 * KpiCounter — Contador animado con número final, sufijo y label.
 * Usa IntersectionObserver para disparar la animación al entrar en viewport.
 */
export default function KpiCounter({ value, suffix = "", label, color = "#10b981", duration = 1800 }) {
  const [count, setCount] = useState(0);
  const [triggered, setTriggered] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTriggered(true); },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!triggered) return;
    const numericValue = parseFloat(value);
    const steps = 60;
    const stepTime = duration / steps;
    let current = 0;
    const increment = numericValue / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(parseFloat(current.toFixed(1)));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [triggered, value, duration]);

  const displayValue = Number.isInteger(parseFloat(value))
    ? Math.round(count)
    : count.toFixed(1);

  return (
    <Box ref={ref} sx={{ textAlign: "center" }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 900,
          fontSize: { xs: "2.2rem", md: "3rem" },
          color,
          letterSpacing: "-1px",
          lineHeight: 1,
        }}
      >
        {displayValue}{suffix}
      </Typography>
      <Typography
        variant="body2"
        sx={{ mt: 1, color: "text.secondary", fontWeight: 500, fontSize: "0.9rem" }}
      >
        {label}
      </Typography>
    </Box>
  );
}
