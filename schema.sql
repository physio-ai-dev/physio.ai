-- =======================================================
-- STEP 1: Database creation schema
-- =======================================================

DROP TABLE IF EXISTS injuries CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS clubs CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS leagues CASCADE;
DROP TABLE IF EXISTS searches CASCADE;
DROP TABLE IF EXISTS top_searched_players CASCADE;
DROP TABLE IF EXISTS anonymous_search_limits CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. POSITIONS
CREATE TABLE positions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    CONSTRAINT chk_position_name CHECK (name IN ('Arquero', 'Defensa', 'Mediocampista', 'Delantero'))
);

-- 2. LEAGUES
CREATE TABLE leagues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(100)
);

-- 3. CLUBS
CREATE TABLE clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    league_id INTEGER REFERENCES leagues(id) ON DELETE SET NULL
);

-- 4. PLAYERS
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    api_id INTEGER UNIQUE,
    name VARCHAR(150) NOT NULL,
    club_id INTEGER REFERENCES clubs(id) ON DELETE SET NULL,
    position_id INTEGER REFERENCES positions(id) ON DELETE SET NULL,
    photo_url TEXT,
    birthdate DATE,
    height VARCHAR(50),
    market_value VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. INJURIES
CREATE TABLE injuries (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    injury_type VARCHAR(255) NOT NULL,
    estimated_days_club INTEGER NOT NULL,
    clinical_time_ai INTEGER,
    comparative_analysis TEXT,
    status VARCHAR(50) DEFAULT 'En Recuperación',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_player 
        FOREIGN KEY (player_id) 
        REFERENCES players(id) 
        ON DELETE CASCADE
);

-- INDEXES
CREATE INDEX idx_players_api_id ON players(api_id);
CREATE INDEX idx_injuries_player_id ON injuries(player_id);
CREATE INDEX idx_players_club_id ON players(club_id);
CREATE INDEX idx_clubs_league_id ON clubs(league_id);

-- Seeds
INSERT INTO positions (name) VALUES 
('Arquero'),
('Defensa'),
('Mediocampista'),
('Delantero');

INSERT INTO leagues (name, country) VALUES 
('Premier League', 'Inglaterra'),
('LaLiga', 'España'),
('Serie A', 'Italia'),
('Bundesliga', 'Alemania'),
('Ligue 1', 'Francia');

-- ==========================================
-- UDF: Calculate age
-- ==========================================
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

-- ==========================================
-- VIEW: Injury Summary
-- ==========================================
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

-- ==========================================
-- AUDIT MODULE
-- ==========================================
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

CREATE OR REPLACE TRIGGER trigger_audit_players
AFTER INSERT OR UPDATE OR DELETE ON players
FOR EACH ROW
EXECUTE FUNCTION log_audit_changes();

CREATE OR REPLACE TRIGGER trigger_audit_injuries
AFTER INSERT OR UPDATE OR DELETE ON injuries
FOR EACH ROW
EXECUTE FUNCTION log_audit_changes();

-- ==========================================
-- USERS & SEARCH LOG MODULE
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    subscription_tier VARCHAR(50) DEFAULT 'free',
    stripe_customer_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, email, password, dob, role, subscription_tier) 
VALUES ('Invitado', 'invitado@physio.ai', 'no-password-hash', '2000-01-01', 'invitado', 'free') 
ON CONFLICT (email) DO NOTHING;

CREATE TABLE IF NOT EXISTS searches (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    search_type VARCHAR(50) DEFAULT 'clinico',
    search_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS top_searched_players (
    player_id INTEGER PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    search_count INTEGER DEFAULT 1
);

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

CREATE OR REPLACE TRIGGER trigger_new_search
AFTER INSERT ON searches
FOR EACH ROW
EXECUTE FUNCTION update_top_searches();

CREATE TABLE anonymous_search_limits (
    identifier VARCHAR(255) PRIMARY KEY,
    quantity INTEGER DEFAULT 0,
    last_search DATE DEFAULT CURRENT_DATE
);

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

-- =======================================================
-- STEP 1.4: ADD AUDIT TRIGGER TO THIRD MAIN ENTITY (users)
-- =======================================================
CREATE OR REPLACE TRIGGER trigger_audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION log_audit_changes();

-- =======================================================
-- STEP 1.5: ADD SECOND COMPLEX BI VIEW (view_player_popularity_report)
-- =======================================================
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

-- =======================================================
-- STEP 1.6: RBAC SECURITY CONFIGURATION FOR physiodb_user
-- =======================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'physiodb_user') THEN
        -- IMPORTANTE: cambiar 'physiodb_pass' por el valor de PHYSIODB_PASSWORD en el .env antes de ejecutar en producción
        CREATE ROLE physiodb_user WITH LOGIN PASSWORD 'physiodb_pass';
    END IF;
END
$$;

-- Grant permissions to physiodb_user
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO physiodb_user;
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO physiodb_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO physiodb_user;