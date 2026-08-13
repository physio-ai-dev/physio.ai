import React from "react";
import { Alert } from "@mui/material";

export default function ErrorAlert({ message, severity = "error", borderRadius = 3 }) {
  if (!message) return null;
  return (
    <Alert severity={severity} sx={{ borderRadius }}>
      {message}
    </Alert>
  );
}
