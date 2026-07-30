-- =======================================================
-- PASO 1: Crear la base de datos (Ejecutar conectado a la BD por defecto 'postgres')
-- =======================================================
-- CREATE DATABASE physio_ai;
-- =======================================================
-- PASO 2: Conectarse a la BD 'physio_db' y ejecutar el esquema:
-- =======================================================

DROP TABLE IF EXISTS lesiones CASCADE;
DROP TABLE IF EXISTS jugadores CASCADE;
DROP TABLE IF EXISTS clubes CASCADE;
DROP TABLE IF EXISTS posiciones CASCADE;
DROP TABLE IF EXISTS ligas CASCADE;

-- 1. POSICIONES (con CHECK constraint para restringir a los roles definidos)
CREATE TABLE posiciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    CONSTRAINT chk_posicion_nombre CHECK (nombre IN ('Arquero', 'Defensa', 'Mediocampista', 'Delantero'))
);

-- 2. LIGAS
CREATE TABLE ligas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    pais VARCHAR(100)
);

-- 3. CLUBES
CREATE TABLE clubes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    liga_fk INTEGER REFERENCES ligas(id) ON DELETE SET NULL
);

-- 4. JUGADORES
CREATE TABLE jugadores (
    id SERIAL PRIMARY KEY,
    api_id INTEGER UNIQUE,      -- El ID que provee la API de fútbol para evitar duplicados (opcional para local)
    nombre VARCHAR(150) NOT NULL,
    club_fk INTEGER REFERENCES clubes(id) ON DELETE SET NULL,
    posicion_fk INTEGER REFERENCES posiciones(id) ON DELETE SET NULL,
    foto_url TEXT,
    fecha_nacimiento VARCHAR(50),
    estatura VARCHAR(50),
    valor_mercado VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. LESIONES
CREATE TABLE lesiones (
    id SERIAL PRIMARY KEY,
    jugador_id INTEGER NOT NULL,
    tipo_lesion VARCHAR(255) NOT NULL,
    dias_estimados_club INTEGER NOT NULL,
    tiempo_clinico_ia INTEGER,        -- Días promedio en número entero devuelto por Gemini
    analisis_comparativo TEXT,        -- Informe de la IA
    estado VARCHAR(50) DEFAULT 'En Recuperación',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Llave foránea vinculada a jugadores. Si se borra el jugador, se borran sus lesiones.
    CONSTRAINT fk_jugador 
        FOREIGN KEY (jugador_id) 
        REFERENCES jugadores(id) 
        ON DELETE CASCADE
);

-- ÍNDICES DE RENDIMIENTO Y RELACIONES
CREATE INDEX idx_jugadores_api_id ON jugadores(api_id);
CREATE INDEX idx_lesiones_jugador_id ON lesiones(jugador_id);
CREATE INDEX idx_jugadores_club_fk ON jugadores(club_fk);
CREATE INDEX idx_clubes_liga_fk ON clubes(liga_fk);

-- Semilla de Posiciones por Defecto
INSERT INTO posiciones (nombre) VALUES 
('Arquero'),
('Defensa'),
('Mediocampista'),
('Delantero');

-- Semilla de Ligas Top por Defecto
INSERT INTO ligas (nombre, pais) VALUES 
('Premier League', 'Inglaterra'),
('LaLiga', 'España'),
('Serie A', 'Italia'),
('Bundesliga', 'Alemania'),
('Ligue 1', 'Francia');

-- ==========================================
-- UDF: Función para calcular edad (SCRUM-52)
-- ==========================================
CREATE OR REPLACE FUNCTION calcular_edad(fecha_nacimiento VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    fecha_date DATE;
    edad INTEGER;
BEGIN
    IF fecha_nacimiento IS NULL OR fecha_nacimiento = '' THEN
        RETURN NULL;
    END IF;
    
    BEGIN
        fecha_date := fecha_nacimiento::DATE;
    EXCEPTION WHEN OTHERS THEN
        RETURN NULL;
    END;
    
    edad := DATE_PART('year', AGE(CURRENT_DATE, fecha_date));
    RETURN edad;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- VISTA CONSOLIDADA DE LESIONES (SCRUM-51)
-- ==========================================
CREATE OR REPLACE VIEW vista_resumen_lesiones AS
SELECT 
    TO_CHAR(l.fecha_registro, 'YYYY-MM') AS mes,
    c.nombre AS club,
    p.nombre AS posicion,
    COUNT(l.id) AS total_lesiones,
    SUM(l.dias_estimados_club) AS total_dias_club,
    SUM(l.tiempo_clinico_ia) AS total_dias_ia
FROM lesiones l
JOIN jugadores j ON l.jugador_id = j.id
LEFT JOIN clubes c ON j.club_fk = c.id
LEFT JOIN posiciones p ON j.posicion_fk = p.id
GROUP BY TO_CHAR(l.fecha_registro, 'YYYY-MM'), c.nombre, p.nombre
ORDER BY mes DESC, total_lesiones DESC;