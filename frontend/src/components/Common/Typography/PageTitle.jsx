import React from "react";
import { Box, Typography } from "@mui/material";

export default function PageTitle({ title, subtitle, sx = {} }) {
  return (
    <Box sx={{ mb: 1, ...sx }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 900,
          mb: 1,
          letterSpacing: "-1px",
          color: "text.primary",
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
