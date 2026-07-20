import { DataSource } from "typeorm";
import "dotenv/config";
import PlayerSchema from "../models/PlayerSchema.js";
import InjurySchema from "../models/InjurySchema.js";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [PlayerSchema, InjurySchema],
});

export default AppDataSource;
