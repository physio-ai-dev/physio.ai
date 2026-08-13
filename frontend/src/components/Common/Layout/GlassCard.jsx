import React from "react";
import { Card } from "@mui/material";

export default function GlassCard({ children, sx = {}, ...props }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        bgcolor: "rgba(255, 255, 255, 0.01)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(20px)",
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
}
