import React from "react";
import { Box, Typography, Divider } from "@mui/material";

export const renderLegibleReport = (text) => {
  if (!text) return null;

  const cleanText = text.replace(/\\n/g, "\n");
  const lines = cleanText.split("\n");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <Box key={idx} sx={{ height: 6 }} />;
        }

        if (
          trimmed.startsWith("-") ||
          trimmed.startsWith("*") ||
          /^\d+\./.test(trimmed)
        ) {
          const cleanLine = trimmed.replace(/^[-*\s]+|^\d+\.\s*/, "");
          const parts = cleanLine.split(/\*\*([\s\S]*?)\*\*/g);
          return (
            <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, pl: 2 }}>
              <span style={{ color: "#34d399", fontWeight: "bold", fontSize: "1.1rem", marginTop: "-3px" }}>
                •
              </span>
              <Typography variant="body2" sx={{ lineHeight: 1.8, color: "text.primary", fontSize: "0.95rem" }}>
                {parts.map((part, i) =>
                  i % 2 === 1 ? <strong key={i} style={{ fontWeight: 800 }}>{part}</strong> : part
                )}
              </Typography>
            </Box>
          );
        }

        if (trimmed.endsWith(":") || trimmed.startsWith("###") || trimmed.startsWith("#")) {
          const cleanHeader = trimmed.replace(/#/g, "").replace(/:$/, "").trim();
          const parts = cleanHeader.split(/\*\*([\s\S]*?)\*\*/g);
          return (
            <Box key={idx} sx={{ mt: 3, mb: 1.5 }}>
              {idx > 0 && <Divider sx={{ mb: 2, borderColor: "rgba(255, 255, 255, 0.05)" }} />}
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 900, color: "primary.light", letterSpacing: 0.8, textTransform: "uppercase", fontSize: "0.85rem" }}
              >
                {parts.map((part, i) => (i % 2 === 1 ? part : part))}
              </Typography>
            </Box>
          );
        }

        const parts = trimmed.split(/\*\*([\s\S]*?)\*\*/g);
        return (
          <Typography
            key={idx}
            variant="body2"
            sx={{ lineHeight: 1.8, mb: 0.5, color: "text.primary", fontSize: "0.96rem", textAlign: "justify" }}
          >
            {parts.map((part, i) =>
              i % 2 === 1 ? <strong key={i} style={{ fontWeight: 800 }}>{part}</strong> : part
            )}
          </Typography>
        );
      })}
    </Box>
  );
};

export const formatBirthdate = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dateStr;
};

export const calculateAge = (birthdateStr) => {
  if (!birthdateStr) return null;
  const parts = birthdateStr.split("-");
  if (parts.length !== 3) return null;

  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1;
  const birthDay = parseInt(parts[2], 10);

  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const monthDiff = today.getMonth() - birthMonth;

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
    age--;
  }
  return age;
};
