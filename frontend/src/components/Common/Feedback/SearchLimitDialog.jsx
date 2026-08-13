import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import ActionButton from "../Buttons/ActionButton";

/**
 * SearchLimitDialog — Modal que se muestra cuando un usuario alcanza
 * el límite de búsquedas gratuitas diarias.
 */
export default function SearchLimitDialog({
  open,
  isLoggedIn,
  onClose,
  onLoginClick,
  onRegisterClick,
  onUpgradeClick,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: "rgba(11, 21, 40, 0.95)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 4,
          p: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 900, color: "primary.light" }}>
        Límite de Búsquedas Alcanzado
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: "text.secondary", fontWeight: 500 }}>
          {isLoggedIn
            ? "Has alcanzado el límite de 3 búsquedas diarias permitidas para tu cuenta gratuita. ¡Hazte PRO para obtener búsquedas ilimitadas!"
            : "Has alcanzado el límite de 3 búsquedas diarias permitidas para usuarios invitados. Registra una cuenta nueva o inicia sesión para continuar."}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ gap: 1.5, px: 3, pb: 2 }}>
        <ActionButton
          variant="outlined"
          onClick={onClose}
          sx={{
            borderRadius: 3,
            px: 3,
            borderColor: "rgba(255, 255, 255, 0.1)",
            color: "text.secondary",
            bgcolor: "transparent",
            boxShadow: "none",
            "&:hover": {
              borderColor: "rgba(255, 255, 255, 0.2)",
              bgcolor: "rgba(255, 255, 255, 0.02)",
              boxShadow: "none",
            },
          }}
        >
          Cerrar
        </ActionButton>

        {!isLoggedIn ? (
          <>
            <ActionButton
              variant="outlined"
              onClick={onLoginClick}
              sx={{
                borderRadius: 3,
                px: 3,
                borderColor: "rgba(16, 185, 129, 0.3)",
                color: "primary.main",
                bgcolor: "transparent",
                boxShadow: "none",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "rgba(16, 185, 129, 0.08)",
                  boxShadow: "none",
                },
              }}
            >
              Iniciar Sesión
            </ActionButton>
            <ActionButton
              onClick={onRegisterClick}
              sx={{ borderRadius: 3, px: 3 }}
            >
              Registrarse Gratis
            </ActionButton>
          </>
        ) : (
          <ActionButton onClick={onUpgradeClick} sx={{ borderRadius: 3, px: 3 }}>
            Explorar Premium
          </ActionButton>
        )}
      </DialogActions>
    </Dialog>
  );
}
