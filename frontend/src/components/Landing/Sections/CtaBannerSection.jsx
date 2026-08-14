import { Box, Container, Typography, Stack } from "@mui/material";
import { ArrowForwardIcon, RocketLaunchIcon } from "../../Common/Icons";
import ActionButton from "../../Common/Buttons/ActionButton";
import GradientText from "../../Common/Typography/GradientText";

export default function CtaBannerSection({ onRegister, onGoSearch }) {
  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="md">
        <Box
          sx={{
            position: "relative",
            borderRadius: 6,
            p: { xs: 5, md: 8 },
            textAlign: "center",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(56,189,248,0.08) 50%, rgba(129,140,248,0.1) 100%)",
            border: "1px solid rgba(16,185,129,0.2)",
            backdropFilter: "blur(20px)",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 30% 50%, rgba(16,185,129,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(129,140,248,0.12) 0%, transparent 60%)",
              pointerEvents: "none",
            },
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "rgba(16,185,129,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <RocketLaunchIcon sx={{ fontSize: 32, color: "primary.light" }} />
            </Box>

            <Typography
              variant="h3"
              fontWeight={900}
              sx={{
                fontSize: { xs: "1.8rem", md: "2.6rem" },
                letterSpacing: "-0.5px",
                mb: 2,
              }}
            >
              ¿Listo para transformar la{" "}
              <GradientText gradient="linear-gradient(90deg, #10b981, #818cf8)">
                gestión médica
              </GradientText>{" "}
              de tu club?
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mb: 4,
                maxWidth: 520,
                mx: "auto",
                lineHeight: 1.7,
                fontSize: "1.05rem",
              }}
            >
              Únete a los equipos que utilizan inteligencia artificial para
              tomar decisiones precisas y proteger el capital humano de sus
              plantillas.
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
              >
                <ActionButton
                  size="large"
                  onClick={onRegister}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    px: 4.5,
                    py: 1.7,
                    fontSize: "1rem",
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    boxShadow: "0 8px 30px rgba(16,185,129,0.35)",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 14px 40px rgba(16,185,129,0.5)",
                    },
                  }}
                >
                  Comenzar Gratis
                </ActionButton>

                <ActionButton
                  variant="outlined"
                  size="large"
                  onClick={onGoSearch}
                  sx={{
                    px: 4,
                    py: 1.7,
                    fontSize: "1rem",
                    borderColor: "rgba(255,255,255,0.15)",
                    color: "text.primary",
                    bgcolor: "rgba(255,255,255,0.03)",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: "rgba(16,185,129,0.4)",
                      bgcolor: "rgba(16,185,129,0.06)",
                      boxShadow: "none",
                    },
                  }}
                >
                  Ver Demo
                </ActionButton>
              </Stack>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
