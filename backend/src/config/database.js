import { DataSource } from "typeorm";
import "dotenv/config";
import PlayerSchema from "../models/PlayerSchema.js";
import InjurySchema from "../models/InjurySchema.js";
import LeagueSchema from "../models/LeagueSchema.js";
import ClubSchema from "../models/ClubSchema.js";
import PositionSchema from "../models/PositionSchema.js";
import UserSchema from "../models/UserSchema.js";
import SearchLimitSchema from "../models/SearchLimitSchema.js";
import SearchSchema from "../models/SearchSchema.js";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  synchronize: true,
  logging: process.env.NODE_ENV === "development",
  entities: [
    PlayerSchema,
    InjurySchema,
    LeagueSchema,
    ClubSchema,
    PositionSchema,
    UserSchema,
    SearchLimitSchema,
    SearchSchema,
  ],
});

export const initializeDatabaseAddons = async () => {
  try {
    const checkTableExists = async (tableName) => {
      const res = await AppDataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tableName]);
      return res[0]?.exists;
    };

    const isNewTableEmpty = async (tableName) => {
      const res = await AppDataSource.query(`SELECT COUNT(*) FROM "${tableName}";`);
      return parseInt(res[0]?.count, 10) === 0;
    };

    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
          id SERIAL PRIMARY KEY,
          table_name VARCHAR(100) NOT NULL,
          operation VARCHAR(20) NOT NULL,
          record_id INTEGER NOT NULL,
          valor_anterior JSONB,
          valor_nuevo JSONB,
          user_email VARCHAR(100) DEFAULT CURRENT_USER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await AppDataSource.query(`
      CREATE TABLE IF NOT EXISTS top_searched_players (
          player_id INTEGER PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          search_count INTEGER DEFAULT 1
      );
    `);

    if (await checkTableExists("posiciones") && await isNewTableEmpty("positions")) {
      await AppDataSource.query(`
        INSERT INTO positions (id, name)
        SELECT id, nombre FROM posiciones
        ON CONFLICT (id) DO NOTHING;
      `);
      await AppDataSource.query(`SELECT setval('positions_id_seq', COALESCE((SELECT MAX(id) FROM positions), 0) + 1, false);`);
    } else if (await isNewTableEmpty("positions")) {
      await AppDataSource.query(`
        INSERT INTO positions (name) VALUES 
        ('Arquero'), ('Defensa'), ('Mediocampista'), ('Delantero')
        ON CONFLICT (name) DO NOTHING;
      `);
    }

    if (await checkTableExists("ligas") && await isNewTableEmpty("leagues")) {
      await AppDataSource.query(`
        INSERT INTO leagues (id, name, country)
        SELECT id, nombre, pais FROM ligas
        ON CONFLICT (id) DO NOTHING;
      `);
      await AppDataSource.query(`SELECT setval('leagues_id_seq', COALESCE((SELECT MAX(id) FROM leagues), 0) + 1, false);`);
    } else if (await isNewTableEmpty("leagues")) {
      await AppDataSource.query(`
        INSERT INTO leagues (name, country) VALUES 
        ('Premier League', 'Inglaterra'),
        ('LaLiga', 'España'),
        ('Serie A', 'Italia'),
        ('Bundesliga', 'Alemania'),
        ('Ligue 1', 'Francia')
        ON CONFLICT (name) DO NOTHING;
      `);
    }

    if (await checkTableExists("clubes") && await isNewTableEmpty("clubs")) {
      await AppDataSource.query(`
        INSERT INTO clubs (id, name, league_id)
        SELECT id, nombre, liga_fk FROM clubes
        ON CONFLICT (id) DO NOTHING;
      `);
      await AppDataSource.query(`SELECT setval('clubs_id_seq', COALESCE((SELECT MAX(id) FROM clubs), 0) + 1, false);`);
    }

    if (await checkTableExists("jugadores") && await isNewTableEmpty("players")) {
      await AppDataSource.query(`
        INSERT INTO players (id, api_id, name, photo_url, birthdate, height, market_value, created_at, club_id, position_id)
        SELECT id, api_id, nombre, foto_url, fecha_nacimiento, estatura, valor_mercado, created_at, club_fk, posicion_fk FROM jugadores
        ON CONFLICT (id) DO NOTHING;
      `);
      await AppDataSource.query(`SELECT setval('players_id_seq', COALESCE((SELECT MAX(id) FROM players), 0) + 1, false);`);
    }

    if (await checkTableExists("lesiones") && await isNewTableEmpty("injuries")) {
      await AppDataSource.query(`
        INSERT INTO injuries (id, player_id, injury_type, estimated_days_club, clinical_time_ai, comparative_analysis, status, created_at)
        SELECT id, jugador_id, tipo_lesion, dias_estimados_club, tiempo_clinico_ia, analisis_comparativo, estado, fecha_registro FROM lesiones
        ON CONFLICT (id) DO NOTHING;
      `);
      await AppDataSource.query(`SELECT setval('injuries_id_seq', COALESCE((SELECT MAX(id) FROM injuries), 0) + 1, false);`);
    }

    if (await checkTableExists("usuarios") && await isNewTableEmpty("users")) {
      await AppDataSource.query(`
        INSERT INTO users (id, username, email, password, dob, role, subscription_tier, stripe_customer_id, created_at, updated_at)
        SELECT id, username, email, password, dob, rol, subscription_tier, stripe_customer_id, created_at, updated_at FROM usuarios
        ON CONFLICT (id) DO NOTHING;
      `);
      await AppDataSource.query(`SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);`);
    }

    await AppDataSource.query(`UPDATE users SET role = 'admin' WHERE role = 'administrador';`);
    await AppDataSource.query(`UPDATE users SET role = 'user' WHERE role = 'usuario';`);

    if (await checkTableExists("limite_busquedas_anonimas") && await isNewTableEmpty("anonymous_search_limits")) {
      await AppDataSource.query(`
        INSERT INTO anonymous_search_limits (identifier, quantity, last_search)
        SELECT identificador, cantidad, ultima_busqueda FROM limite_busquedas_anonimas
        ON CONFLICT (identifier) DO NOTHING;
      `);
    }

    if (await checkTableExists("busquedas") && await isNewTableEmpty("searches")) {
      await AppDataSource.query(`
        INSERT INTO searches (id, user_id, player_id, search_type, search_date)
        SELECT id, usuario_id, jugador_id, COALESCE(tipo_buscador, 'clinico'), fecha_busqueda FROM busquedas
        ON CONFLICT (id) DO NOTHING;
      `);
      await AppDataSource.query(`SELECT setval('searches_id_seq', COALESCE((SELECT MAX(id) FROM searches), 0) + 1, false);`);
    }

    if (await checkTableExists("top_jugadores_buscados") && await isNewTableEmpty("top_searched_players")) {
      await AppDataSource.query(`
        INSERT INTO top_searched_players (player_id, name, search_count)
        SELECT jugador_id, nombre, cantidad_busquedas FROM top_jugadores_buscados
        ON CONFLICT (player_id) DO NOTHING;
      `);
    }

    await AppDataSource.query(`
      CREATE OR REPLACE FUNCTION calculate_age(birthdate DATE)
      RETURNS INTEGER AS $$
      DECLARE
          calculated_age INTEGER;
      BEGIN
          IF birthdate IS NULL THEN
              RETURN NULL;
          END IF;
          calculated_age := date_part('year', age(birthdate));
          RETURN calculated_age;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await AppDataSource.query(`
      CREATE OR REPLACE VIEW view_injury_summary AS
      SELECT 
          TO_CHAR(i.created_at, 'YYYY-MM') AS month,
          c.name AS club,
          p.name AS position,
          COUNT(i.id) AS total_injuries,
          SUM(i.estimated_days_club) AS total_days_club,
          SUM(i.clinical_time_ai) AS total_days_ai
      FROM injuries i
      JOIN players pl ON i.player_id = pl.id
      LEFT JOIN clubs c ON pl.club_id = c.id
      LEFT JOIN positions p ON pl.position_id = p.id
      GROUP BY TO_CHAR(i.created_at, 'YYYY-MM'), c.name, p.name
      ORDER BY month DESC, total_injuries DESC;
    `);

    await AppDataSource.query(`
      CREATE OR REPLACE VIEW view_search_history AS
      SELECT
          s.id,
          s.user_id,
          u.email AS user_email,
          s.player_id,
          pl.name AS player_name,
          c.name AS club_name,
          s.search_type,
          s.search_date
      FROM searches s
      JOIN users u ON u.id = s.user_id
      JOIN players pl ON pl.id = s.player_id
      LEFT JOIN clubs c ON pl.club_id = c.id;
    `);

    await AppDataSource.query(`
      CREATE OR REPLACE FUNCTION update_top_searches()
      RETURNS TRIGGER AS $$
      DECLARE
          player_name VARCHAR(150);
      BEGIN
          SELECT name INTO player_name FROM players WHERE id = NEW.player_id;
          
          INSERT INTO top_searched_players (player_id, name, search_count)
          VALUES (NEW.player_id, player_name, 1)
          ON CONFLICT (player_id) 
          DO UPDATE SET search_count = top_searched_players.search_count + 1;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await AppDataSource.query(`DROP TRIGGER IF EXISTS trigger_new_search ON searches;`);
    await AppDataSource.query(`
      CREATE TRIGGER trigger_new_search
      AFTER INSERT ON searches
      FOR EACH ROW
      EXECUTE FUNCTION update_top_searches();
    `);

    // ─── 1.4 AUDIT: Trigger en tercera entidad principal (users) ───────────────
    await AppDataSource.query(`
      CREATE OR REPLACE FUNCTION log_audit_changes()
      RETURNS TRIGGER AS $$
      BEGIN
          IF (TG_OP = 'INSERT') THEN
              INSERT INTO audit_logs (table_name, operation, record_id, valor_anterior, valor_nuevo)
              VALUES (TG_TABLE_NAME, TG_OP, NEW.id, NULL, to_jsonb(NEW));
              RETURN NEW;
          ELSIF (TG_OP = 'UPDATE') THEN
              INSERT INTO audit_logs (table_name, operation, record_id, valor_anterior, valor_nuevo)
              VALUES (TG_TABLE_NAME, TG_OP, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
              RETURN NEW;
          ELSIF (TG_OP = 'DELETE') THEN
              INSERT INTO audit_logs (table_name, operation, record_id, valor_anterior, valor_nuevo)
              VALUES (TG_TABLE_NAME, TG_OP, OLD.id, to_jsonb(OLD), NULL);
              RETURN OLD;
          END IF;
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await AppDataSource.query(`DROP TRIGGER IF EXISTS trigger_audit_players ON players;`);
    await AppDataSource.query(`
      CREATE TRIGGER trigger_audit_players
      AFTER INSERT OR UPDATE OR DELETE ON players
      FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
    `);

    await AppDataSource.query(`DROP TRIGGER IF EXISTS trigger_audit_injuries ON injuries;`);
    await AppDataSource.query(`
      CREATE TRIGGER trigger_audit_injuries
      AFTER INSERT OR UPDATE OR DELETE ON injuries
      FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
    `);

    await AppDataSource.query(`DROP TRIGGER IF EXISTS trigger_audit_users ON users;`);
    await AppDataSource.query(`
      CREATE TRIGGER trigger_audit_users
      AFTER INSERT OR UPDATE OR DELETE ON users
      FOR EACH ROW EXECUTE FUNCTION log_audit_changes();
    `);

    // ─── 1.5 BI: Segunda vista analítica compleja ────────────────────────────
    await AppDataSource.query(`
      CREATE OR REPLACE VIEW view_player_popularity_report AS
      SELECT 
          pl.id AS player_id,
          pl.name AS player_name,
          c.name AS club_name,
          pos.name AS position_name,
          COUNT(s.id) AS total_searches,
          COUNT(CASE WHEN s.search_type = 'clinico' THEN 1 END) AS clinical_searches,
          COUNT(CASE WHEN s.search_type = 'rendimiento' THEN 1 END) AS performance_searches
      FROM players pl
      LEFT JOIN searches s ON s.player_id = pl.id
      LEFT JOIN clubs c ON pl.club_id = c.id
      LEFT JOIN positions pos ON pl.position_id = pos.id
      GROUP BY pl.id, pl.name, c.name, pos.name;
    `);

    // ─── 1.6 RBAC: Crear usuario physiodb_user con mínimo privilegio ─────────
    await AppDataSource.query(`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'physiodb_user') THEN
              CREATE ROLE physiodb_user WITH LOGIN PASSWORD '${process.env.PHYSIODB_PASSWORD || "physiodb_pass"}';
          END IF;
      END
      $$;
    `);
    await AppDataSource.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO physiodb_user;`);
    await AppDataSource.query(`GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO physiodb_user;`);
    await AppDataSource.query(`GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO physiodb_user;`);

    console.log("✅ Auto-migración e inicialización de esquemas en inglés finalizada.");
  } catch (error) {
    console.error("❌ Fallo en la inicialización/migración de base de datos:", error);
  }
};

export default AppDataSource;
