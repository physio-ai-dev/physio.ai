import React from "react";
import { Box, CircularProgress } from "@mui/material";

export default function LoadingSpinner({ color = "primary", py = 8 }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py }}>
      <CircularProgress color={color} />
    </Box>
  );
}
