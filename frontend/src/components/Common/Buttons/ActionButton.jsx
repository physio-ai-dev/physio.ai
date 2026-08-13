import React from "react";
import { Button } from "@mui/material";

export default function ActionButton({ children, sx = {}, ...props }) {
  return (
    <Button
      variant="contained"
      color="primary"
      sx={{
        borderRadius: 4,
        px: 4,
        py: 1.2,
        fontWeight: 800,
        textTransform: "none",
        boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.15)",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 6px 20px 0 rgba(16, 185, 129, 0.3)",
        },
        "&:active": {
          transform: "translateY(0)",
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
