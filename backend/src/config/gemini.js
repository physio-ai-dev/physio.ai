import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ ALERTA: GEMINI_API_KEY no está configurada en el .env");
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");