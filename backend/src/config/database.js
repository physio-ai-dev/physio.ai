import { DataSource } from "typeorm";
import "dotenv/config";
import PlayerSchema from "../models/PlayerSchema.js";
import InjurySchema from "../models/InjurySchema.js";
import LeagueSchema from "../models/LeagueSchema.js";
import ClubSchema from "../models/ClubSchema.js";
import PositionSchema from "../models/PositionSchema.js";
import UserSchema from "../models/UserSchema.js";
import SearchLimitSchema from "../models/SearchLimitSchema.js";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [
    PlayerSchema,
    InjurySchema,
    LeagueSchema,
    ClubSchema,
    PositionSchema,
    UserSchema,
    SearchLimitSchema,
  ],
});

export default AppDataSource;
