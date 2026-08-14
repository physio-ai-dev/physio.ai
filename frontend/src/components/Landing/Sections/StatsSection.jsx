import { Box, Container, Grid, Divider } from "@mui/material";
import KpiCounter from "../../Common/Feedback/KpiCounter";

const STATS = [
  { value: 94,   suffix: "%",  label: "Precisión del modelo IA",          color: "#10b981" },
  { value: 3.2,  suffix: "×",  label: "Reducción del margen de error vs. criterio del club", color: "#38bdf8" },
  { value: 2400, suffix: "+",  label: "Reportes clínicos procesados",      color: "#818cf8" },
  { value: 180,  suffix: "+",  label: "Clubes y ligas monitoreados",       color: "#f59e0b" },
];

export default function StatsSection() {
  return (
    <Box
      sx={{
        py: { xs: 6, md: 8 },
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        bgcolor: "rgba(11, 21, 40, 0.5)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={2} alignItems="center">
          {STATS.map((stat, i) => (
            <Grid item xs={6} md={3} key={stat.label}>
              <Box sx={{ px: { md: 2 }, py: { xs: 2, md: 0 } }}>
                <KpiCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  color={stat.color}
                />
              </Box>
              {i < STATS.length - 1 && (
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    display: { xs: "none", md: "block" },
                    borderColor: "rgba(255,255,255,0.06)",
                    position: "absolute",
                  }}
                />
              )}
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
