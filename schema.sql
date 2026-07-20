-- =======================================================
-- PASO 1: Crear la base de datos (Ejecutar conectado a la BD por defecto 'postgres')
-- =======================================================
-- CREATE DATABASE physio_ai;
-- =======================================================
-- PASO 2: Conectarse a la BD 'physio_db' y ejecutar el esquema:
-- =======================================================

DROP TABLE IF EXISTS lesiones CASCADE;
DROP TABLE IF EXISTS jugadores CASCADE;

-- JUGADORES
CREATE TABLE jugadores (
    id SERIAL PRIMARY KEY,
    api_id INTEGER UNIQUE NOT NULL,      -- El ID que provee la API de fútbol para evitar duplicados
    nombre VARCHAR(150) NOT NULL,
    equipo VARCHAR(150) NOT NULL,
    edad SMALLINT,
    posicion VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LESIONES
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

-- ÍNDICES DE RENDIMIENTO
CREATE INDEX idx_jugadores_api_id ON jugadores(api_id);
CREATE INDEX idx_lesiones_jugador_id ON lesiones(jugador_id);