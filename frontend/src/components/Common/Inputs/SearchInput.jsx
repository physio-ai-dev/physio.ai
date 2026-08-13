import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

export default function SearchInput({ value, onChange, placeholder = "Buscar...", disabled = false, sx = {}, ...props }) {
  return (
    <TextField
      fullWidth
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "text.secondary" }} />
            </InputAdornment>
          ),
          sx: {
            borderRadius: 4,
            bgcolor: "rgba(255, 255, 255, 0.02)",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255, 255, 255, 0.08)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255, 255, 255, 0.15)",
            },
          },
        },
      }}
      sx={{ ...sx }}
      {...props}
    />
  );
}
