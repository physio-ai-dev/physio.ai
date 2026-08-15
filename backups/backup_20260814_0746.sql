--
-- PostgreSQL database dump
--

\restrict U65ADI3aXneF8kbMQbKq5tAgWqEDg5KnjQriAtICtD9MpaVJEfZ9bgJbAcbIM0x

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: actualizar_top_busquedas(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_top_busquedas() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
        jugador_nombre VARCHAR(150);
    BEGIN
        SELECT nombre INTO jugador_nombre FROM jugadores WHERE id = NEW.jugador_id;
        
        INSERT INTO top_jugadores_buscados (jugador_id, nombre, cantidad_busquedas)
        VALUES (NEW.jugador_id, jugador_nombre, 1)
        ON CONFLICT (jugador_id) 
        DO UPDATE SET cantidad_busquedas = top_jugadores_buscados.cantidad_busquedas + 1;
        
        RETURN NEW;
    END;
    $$;


ALTER FUNCTION public.actualizar_top_busquedas() OWNER TO postgres;

--
-- Name: calcular_edad(character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calcular_edad(fecha_nacimiento character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
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
    $$;


ALTER FUNCTION public.calcular_edad(fecha_nacimiento character varying) OWNER TO postgres;

--
-- Name: calculate_age(date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_age(birthdate date) RETURNS integer
    LANGUAGE plpgsql
    AS $$
      DECLARE
          calculated_age INTEGER;
      BEGIN
          IF birthdate IS NULL THEN
              RETURN NULL;
          END IF;
          calculated_age := date_part('year', age(birthdate));
          RETURN calculated_age;
      END;
      $$;


ALTER FUNCTION public.calculate_age(birthdate date) OWNER TO postgres;

--
-- Name: log_audit_changes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_audit_changes() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
      $$;


ALTER FUNCTION public.log_audit_changes() OWNER TO postgres;

--
-- Name: log_auditoria_datos(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_auditoria_datos() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
        IF (TG_OP = 'INSERT') THEN
            INSERT INTO auditoria_datos (tabla_nombre, operacion, registro_id, valor_anterior, valor_nuevo)
            VALUES (TG_TABLE_NAME, TG_OP, NEW.id, NULL, to_jsonb(NEW));
            RETURN NEW;
        ELSIF (TG_OP = 'UPDATE') THEN
            INSERT INTO auditoria_datos (tabla_nombre, operacion, registro_id, valor_anterior, valor_nuevo)
            VALUES (TG_TABLE_NAME, TG_OP, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
            RETURN NEW;
        ELSIF (TG_OP = 'DELETE') THEN
            INSERT INTO auditoria_datos (tabla_nombre, operacion, registro_id, valor_anterior, valor_nuevo)
            VALUES (TG_TABLE_NAME, TG_OP, OLD.id, to_jsonb(OLD), NULL);
            RETURN OLD;
        END IF;
        RETURN NULL;
    END;
    $$;


ALTER FUNCTION public.log_auditoria_datos() OWNER TO postgres;

--
-- Name: update_top_searches(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_top_searches() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
      $$;


ALTER FUNCTION public.update_top_searches() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: anonymous_search_limits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.anonymous_search_limits (
    identifier character varying(255) NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    last_search date NOT NULL
);


ALTER TABLE public.anonymous_search_limits OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    table_name character varying(100) NOT NULL,
    operation character varying(20) NOT NULL,
    record_id integer NOT NULL,
    valor_anterior jsonb,
    valor_nuevo jsonb,
    user_email character varying(100) DEFAULT CURRENT_USER,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: auditoria_datos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditoria_datos (
    id integer NOT NULL,
    tabla_nombre character varying(100) NOT NULL,
    operacion character varying(20) NOT NULL,
    registro_id integer NOT NULL,
    valor_anterior jsonb,
    valor_nuevo jsonb,
    usuario character varying(100) DEFAULT CURRENT_USER,
    fecha_evento timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.auditoria_datos OWNER TO postgres;

--
-- Name: auditoria_datos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditoria_datos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditoria_datos_id_seq OWNER TO postgres;

--
-- Name: auditoria_datos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditoria_datos_id_seq OWNED BY public.auditoria_datos.id;


--
-- Name: busquedas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.busquedas (
    id integer NOT NULL,
    usuario_id integer,
    jugador_id integer,
    fecha_busqueda timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tipo_buscador character varying(50) DEFAULT 'clinico'::character varying
);


ALTER TABLE public.busquedas OWNER TO postgres;

--
-- Name: busquedas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.busquedas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.busquedas_id_seq OWNER TO postgres;

--
-- Name: busquedas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.busquedas_id_seq OWNED BY public.busquedas.id;


--
-- Name: clubes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clubes (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    liga_fk integer
);


ALTER TABLE public.clubes OWNER TO postgres;

--
-- Name: clubes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clubes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clubes_id_seq OWNER TO postgres;

--
-- Name: clubes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clubes_id_seq OWNED BY public.clubes.id;


--
-- Name: clubs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clubs (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    league_id integer
);


ALTER TABLE public.clubs OWNER TO postgres;

--
-- Name: clubs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clubs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clubs_id_seq OWNER TO postgres;

--
-- Name: clubs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clubs_id_seq OWNED BY public.clubs.id;


--
-- Name: injuries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.injuries (
    id integer NOT NULL,
    player_id integer NOT NULL,
    injury_type character varying(255) NOT NULL,
    estimated_days_club integer NOT NULL,
    clinical_time_ai integer,
    comparative_analysis text,
    status character varying(50) DEFAULT 'En Recuperación'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.injuries OWNER TO postgres;

--
-- Name: injuries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.injuries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.injuries_id_seq OWNER TO postgres;

--
-- Name: injuries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.injuries_id_seq OWNED BY public.injuries.id;


--
-- Name: jugadores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jugadores (
    id integer NOT NULL,
    api_id integer,
    nombre character varying(150) NOT NULL,
    club_fk integer,
    posicion_fk integer,
    foto_url text,
    fecha_nacimiento date,
    estatura character varying(50),
    valor_mercado character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.jugadores OWNER TO postgres;

--
-- Name: jugadores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jugadores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jugadores_id_seq OWNER TO postgres;

--
-- Name: jugadores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jugadores_id_seq OWNED BY public.jugadores.id;


--
-- Name: leagues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leagues (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    country character varying(100)
);


ALTER TABLE public.leagues OWNER TO postgres;

--
-- Name: leagues_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leagues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leagues_id_seq OWNER TO postgres;

--
-- Name: leagues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leagues_id_seq OWNED BY public.leagues.id;


--
-- Name: lesiones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lesiones (
    id integer NOT NULL,
    jugador_id integer NOT NULL,
    tipo_lesion character varying(255) NOT NULL,
    dias_estimados_club integer NOT NULL,
    tiempo_clinico_ia integer,
    analisis_comparativo text,
    estado character varying(50) DEFAULT 'En Recuperación'::character varying,
    fecha_registro timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.lesiones OWNER TO postgres;

--
-- Name: lesiones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lesiones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lesiones_id_seq OWNER TO postgres;

--
-- Name: lesiones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lesiones_id_seq OWNED BY public.lesiones.id;


--
-- Name: ligas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ligas (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    pais character varying(100)
);


ALTER TABLE public.ligas OWNER TO postgres;

--
-- Name: ligas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ligas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ligas_id_seq OWNER TO postgres;

--
-- Name: ligas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ligas_id_seq OWNED BY public.ligas.id;


--
-- Name: limite_busquedas_anonimas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.limite_busquedas_anonimas (
    identificador character varying(255) NOT NULL,
    cantidad integer DEFAULT 0,
    ultima_busqueda date DEFAULT CURRENT_DATE
);


ALTER TABLE public.limite_busquedas_anonimas OWNER TO postgres;

--
-- Name: players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.players (
    id integer NOT NULL,
    api_id integer,
    name character varying(150) NOT NULL,
    photo_url text,
    birthdate date,
    height character varying(50),
    market_value character varying(100),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    club_id integer,
    position_id integer
);


ALTER TABLE public.players OWNER TO postgres;

--
-- Name: players_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.players_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.players_id_seq OWNER TO postgres;

--
-- Name: players_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.players_id_seq OWNED BY public.players.id;


--
-- Name: posiciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.posiciones (
    id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    CONSTRAINT chk_posicion_nombre CHECK (((nombre)::text = ANY ((ARRAY['Arquero'::character varying, 'Defensa'::character varying, 'Mediocampista'::character varying, 'Delantero'::character varying])::text[])))
);


ALTER TABLE public.posiciones OWNER TO postgres;

--
-- Name: posiciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.posiciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.posiciones_id_seq OWNER TO postgres;

--
-- Name: posiciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.posiciones_id_seq OWNED BY public.posiciones.id;


--
-- Name: positions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.positions (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.positions OWNER TO postgres;

--
-- Name: positions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.positions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.positions_id_seq OWNER TO postgres;

--
-- Name: positions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.positions_id_seq OWNED BY public.positions.id;


--
-- Name: searches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.searches (
    id integer NOT NULL,
    user_id integer,
    player_id integer NOT NULL,
    search_type character varying(50) DEFAULT 'clinico'::character varying NOT NULL,
    search_date timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.searches OWNER TO postgres;

--
-- Name: searches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.searches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.searches_id_seq OWNER TO postgres;

--
-- Name: searches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.searches_id_seq OWNED BY public.searches.id;


--
-- Name: top_jugadores_buscados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.top_jugadores_buscados (
    jugador_id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    cantidad_busquedas integer DEFAULT 1
);


ALTER TABLE public.top_jugadores_buscados OWNER TO postgres;

--
-- Name: top_searched_players; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.top_searched_players (
    player_id integer NOT NULL,
    name character varying(150) NOT NULL,
    search_count integer DEFAULT 1
);


ALTER TABLE public.top_searched_players OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    dob date NOT NULL,
    role character varying(50) DEFAULT 'user'::character varying NOT NULL,
    subscription_tier character varying(50) DEFAULT 'free'::character varying NOT NULL,
    stripe_customer_id character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    dob date NOT NULL,
    rol character varying(50) DEFAULT 'usuario'::character varying,
    subscription_tier character varying(50) DEFAULT 'free'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    stripe_customer_id character varying(255)
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: view_injury_summary; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_injury_summary AS
 SELECT to_char(i.created_at, 'YYYY-MM'::text) AS month,
    c.name AS club,
    p.name AS "position",
    count(i.id) AS total_injuries,
    sum(i.estimated_days_club) AS total_days_club,
    sum(i.clinical_time_ai) AS total_days_ai
   FROM (((public.injuries i
     JOIN public.players pl ON ((i.player_id = pl.id)))
     LEFT JOIN public.clubs c ON ((pl.club_id = c.id)))
     LEFT JOIN public.positions p ON ((pl.position_id = p.id)))
  GROUP BY (to_char(i.created_at, 'YYYY-MM'::text)), c.name, p.name
  ORDER BY (to_char(i.created_at, 'YYYY-MM'::text)) DESC, (count(i.id)) DESC;


ALTER VIEW public.view_injury_summary OWNER TO postgres;

--
-- Name: view_player_popularity_report; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_player_popularity_report AS
 SELECT pl.id AS player_id,
    pl.name AS player_name,
    c.name AS club_name,
    pos.name AS position_name,
    count(s.id) AS total_searches,
    count(
        CASE
            WHEN ((s.search_type)::text = 'clinico'::text) THEN 1
            ELSE NULL::integer
        END) AS clinical_searches,
    count(
        CASE
            WHEN ((s.search_type)::text = 'rendimiento'::text) THEN 1
            ELSE NULL::integer
        END) AS performance_searches
   FROM (((public.players pl
     LEFT JOIN public.searches s ON ((s.player_id = pl.id)))
     LEFT JOIN public.clubs c ON ((pl.club_id = c.id)))
     LEFT JOIN public.positions pos ON ((pl.position_id = pos.id)))
  GROUP BY pl.id, pl.name, c.name, pos.name;


ALTER VIEW public.view_player_popularity_report OWNER TO postgres;

--
-- Name: view_search_history; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.view_search_history AS
 SELECT s.id,
    s.user_id,
    u.email AS user_email,
    s.player_id,
    pl.name AS player_name,
    c.name AS club_name,
    s.search_type,
    s.search_date
   FROM (((public.searches s
     JOIN public.users u ON ((u.id = s.user_id)))
     JOIN public.players pl ON ((pl.id = s.player_id)))
     LEFT JOIN public.clubs c ON ((pl.club_id = c.id)));


ALTER VIEW public.view_search_history OWNER TO postgres;

--
-- Name: vista_historial_busquedas; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_historial_busquedas AS
 SELECT b.id,
    b.usuario_id,
    u.email AS usuario_email,
    b.jugador_id,
    j.nombre AS jugador_nombre,
    c.nombre AS equipo,
    b.tipo_buscador,
    b.fecha_busqueda
   FROM (((public.busquedas b
     JOIN public.usuarios u ON ((u.id = b.usuario_id)))
     JOIN public.jugadores j ON ((j.id = b.jugador_id)))
     LEFT JOIN public.clubes c ON ((j.club_fk = c.id)));


ALTER VIEW public.vista_historial_busquedas OWNER TO postgres;

--
-- Name: vista_resumen_lesiones; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vista_resumen_lesiones AS
 SELECT to_char(l.fecha_registro, 'YYYY-MM'::text) AS mes,
    c.nombre AS club,
    p.nombre AS posicion,
    count(l.id) AS total_lesiones,
    sum(l.dias_estimados_club) AS total_dias_club,
    sum(l.tiempo_clinico_ia) AS total_dias_ia
   FROM (((public.lesiones l
     JOIN public.jugadores j ON ((l.jugador_id = j.id)))
     LEFT JOIN public.clubes c ON ((j.club_fk = c.id)))
     LEFT JOIN public.posiciones p ON ((j.posicion_fk = p.id)))
  GROUP BY (to_char(l.fecha_registro, 'YYYY-MM'::text)), c.nombre, p.nombre
  ORDER BY (to_char(l.fecha_registro, 'YYYY-MM'::text)) DESC, (count(l.id)) DESC;


ALTER VIEW public.vista_resumen_lesiones OWNER TO postgres;

--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: auditoria_datos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_datos ALTER COLUMN id SET DEFAULT nextval('public.auditoria_datos_id_seq'::regclass);


--
-- Name: busquedas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.busquedas ALTER COLUMN id SET DEFAULT nextval('public.busquedas_id_seq'::regclass);


--
-- Name: clubes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clubes ALTER COLUMN id SET DEFAULT nextval('public.clubes_id_seq'::regclass);


--
-- Name: clubs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clubs ALTER COLUMN id SET DEFAULT nextval('public.clubs_id_seq'::regclass);


--
-- Name: injuries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.injuries ALTER COLUMN id SET DEFAULT nextval('public.injuries_id_seq'::regclass);


--
-- Name: jugadores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jugadores ALTER COLUMN id SET DEFAULT nextval('public.jugadores_id_seq'::regclass);


--
-- Name: leagues id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leagues ALTER COLUMN id SET DEFAULT nextval('public.leagues_id_seq'::regclass);


--
-- Name: lesiones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesiones ALTER COLUMN id SET DEFAULT nextval('public.lesiones_id_seq'::regclass);


--
-- Name: ligas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ligas ALTER COLUMN id SET DEFAULT nextval('public.ligas_id_seq'::regclass);


--
-- Name: players id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players ALTER COLUMN id SET DEFAULT nextval('public.players_id_seq'::regclass);


--
-- Name: posiciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posiciones ALTER COLUMN id SET DEFAULT nextval('public.posiciones_id_seq'::regclass);


--
-- Name: positions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions ALTER COLUMN id SET DEFAULT nextval('public.positions_id_seq'::regclass);


--
-- Name: searches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.searches ALTER COLUMN id SET DEFAULT nextval('public.searches_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: anonymous_search_limits; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.anonymous_search_limits (identifier, quantity, last_search) FROM stdin;
jrulloa@puce.edu.ec	3	2026-08-10
::1	3	2026-08-12
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, table_name, operation, record_id, valor_anterior, valor_nuevo, user_email, created_at) FROM stdin;
1	players	INSERT	12	\N	{"id": 12, "name": "G. Kobel", "api_id": 25282, "height": "195", "club_id": 7, "birthdate": "1997-12-06", "photo_url": "https://media.api-sports.io/football/players/25282.png", "created_at": "2026-08-13T21:46:19.00868", "position_id": 1, "market_value": "No disponible"}	postgres	2026-08-13 21:46:19.00868
2	injuries	INSERT	9	\N	{"id": 9, "status": "En Recuperación", "player_id": 12, "created_at": "2026-08-13T21:46:31.943858", "injury_type": "Rotura fibrilar en el bíceps femoral (Isquiotibiales)", "clinical_time_ai": null, "estimated_days_club": 21, "comparative_analysis": ""}	postgres	2026-08-13 21:46:31.943858
3	injuries	UPDATE	9	{"id": 9, "status": "En Recuperación", "player_id": 12, "created_at": "2026-08-13T21:46:31.943858", "injury_type": "Rotura fibrilar en el bíceps femoral (Isquiotibiales)", "clinical_time_ai": null, "estimated_days_club": 21, "comparative_analysis": ""}	{"id": 9, "status": "En Recuperación", "player_id": 12, "created_at": "2026-08-13T21:46:31.943858", "injury_type": "Rotura fibrilar en el bíceps femoral (Isquiotibiales)", "clinical_time_ai": null, "estimated_days_club": 21, "comparative_analysis": "### Análisis de la Estimación\\nLa estimación de 21 días propuesta por el cuerpo médico del club es clínicamente coherente con una rotura fibrilar de Grado I (leve) o una afectación miofascial mínima del bíceps femoral. Sin embargo, la literatura científica del Grupo de Estudio de Lesiones de la UEFA y diversos consensos de medicina deportiva sitúan el tiempo medio de retorno a la competición (Return to Play - RTP) para lesiones estructurales de isquiotibiales entre los 24 y 28 días. Un plazo de 21 días resulta optimista y sitúa al futbolista en el límite inferior de seguridad biológica, incrementando el riesgo de recaída si no se gestiona de forma individualizada.\\n\\n### Justificación Fisiológica\\nEl músculo bíceps femoral es biarticular y se somete a una enorme fuerza excéntrica durante la fase de oscilación tardía del sprint en el fútbol. Su proceso de curación sigue fases biológicas inalterables:\\n- **Fase destructiva e inflamatoria (días 1 a 3):** Caracterizada por hematoma, necrosis de las fibras lesionadas y una respuesta inflamatoria celular.\\n- **Fase de reparación (días 4 a 14):** Proliferación de células satélite, mioblastos y producción de una cicatriz de tejido conectivo rica en colágeno tipo III (inicialmente débil).\\n- **Fase de remodelación (días 14 en adelante):** Transición del colágeno al tipo I, orientación de las fibras según las líneas de tensión mecánica y maduración de la unión miotendinosa. Intentar acelerar el alta antes de que finalice la fase de remodelación expone al tejido a fallar ante fuerzas de cizallamiento excéntrico.\\n\\n### Criterios e Hitos para el Alta\\nPara mitigar el riesgo de recidiva, que en el bíceps femoral ronda el 15-30% en el fútbol de élite, el jugador debe superar obligatoriamente los siguientes criterios:\\n- Ausencia absoluta de dolor a la palpación y en pruebas de estiramiento pasivo e isométrico.\\n- Simetría en pruebas de fuerza excéntrica (evaluada por dinamometría) con un déficit inferior al 10% respecto a la extremidad contralateral.\\n- Recuperación completa del rango de movimiento (ROM) en flexión de cadera y extensión de rodilla.\\n- Superación de test funcionales de carrera con progresión de aceleración y desaceleración hasta alcanzar velocidad de sprint máxima (>95% de su registro histórico).\\n- Completar al menos 3 a 5 sesiones completas de entrenamiento colectivo integrado (con contacto y situaciones reales de juego) sin síntomas reportados."}	postgres	2026-08-13 21:46:45.529494
4	players	INSERT	13	\N	{"id": 13, "name": "Raphinha", "api_id": 1496, "height": "176", "club_id": 2, "birthdate": "1996-12-14", "photo_url": "https://media.api-sports.io/football/players/1496.png", "created_at": "2026-08-13T21:46:53.05181", "position_id": 4, "market_value": "No disponible"}	postgres	2026-08-13 21:46:53.05181
5	players	INSERT	14	\N	{"id": 14, "name": "Marcos Llorente", "api_id": 753, "height": "183", "club_id": 8, "birthdate": "1995-01-30", "photo_url": "https://media.api-sports.io/football/players/753.png", "created_at": "2026-08-13T21:47:53.205858", "position_id": 3, "market_value": "No disponible"}	postgres	2026-08-13 21:47:53.205858
6	players	INSERT	15	\N	{"id": 15, "name": "Diego Llorente", "api_id": 47302, "height": "186", "club_id": 9, "birthdate": "1993-08-16", "photo_url": "https://media.api-sports.io/football/players/47302.png", "created_at": "2026-08-13T21:47:53.290464", "position_id": 2, "market_value": "No disponible"}	postgres	2026-08-13 21:47:53.290464
7	players	INSERT	16	\N	{"id": 16, "name": "Leo Román", "api_id": 179139, "height": "189", "club_id": 10, "birthdate": "2000-07-06", "photo_url": "https://media.api-sports.io/football/players/179139.png", "created_at": "2026-08-13T21:49:00.401744", "position_id": 1, "market_value": "No disponible"}	postgres	2026-08-13 21:49:00.401744
8	players	INSERT	17	\N	{"id": 17, "name": "Marc Cucurella", "api_id": 47380, "height": "174", "club_id": 11, "birthdate": "1998-07-22", "photo_url": "https://media.api-sports.io/football/players/47380.png", "created_at": "2026-08-13T21:53:19.484631", "position_id": 2, "market_value": "No disponible"}	postgres	2026-08-13 21:53:19.484631
9	players	INSERT	18	\N	{"id": 18, "name": "Pedro Porro", "api_id": 47519, "height": "173", "club_id": 12, "birthdate": "1999-09-13", "photo_url": "https://media.api-sports.io/football/players/47519.png", "created_at": "2026-08-13T21:54:00.76178", "position_id": 2, "market_value": "No disponible"}	postgres	2026-08-13 21:54:00.76178
10	injuries	INSERT	10	\N	{"id": 10, "status": "En Recuperación", "player_id": 18, "created_at": "2026-08-13T21:54:20.888484", "injury_type": "Rotura fibrilar en el bíceps femoral (Isquiotibiales)", "clinical_time_ai": null, "estimated_days_club": 21, "comparative_analysis": ""}	postgres	2026-08-13 21:54:20.888484
11	injuries	UPDATE	10	{"id": 10, "status": "En Recuperación", "player_id": 18, "created_at": "2026-08-13T21:54:20.888484", "injury_type": "Rotura fibrilar en el bíceps femoral (Isquiotibiales)", "clinical_time_ai": null, "estimated_days_club": 21, "comparative_analysis": ""}	{"id": 10, "status": "En Recuperación", "player_id": 18, "created_at": "2026-08-13T21:54:20.888484", "injury_type": "Rotura fibrilar en el bíceps femoral (Isquiotibiales)", "clinical_time_ai": null, "estimated_days_club": 21, "comparative_analysis": "### Análisis de la Estimación\\\\nLa estimación de 21 días (3 semanas) propuesta por el club es clínicamente viable pero optimista, correspondiendo típicamente a una rotura fibrilar de Grado I o II leve según la clasificación de Múnich. La literatura científica de medicina deportiva, incluyendo los consensos del UEFA Elite Club Injury Study, establece un rango promedio de recuperación de 18 a 28 días (media de 24 días) para lesiones estructurales del bíceps femoral. Un retorno a los 21 días exige un abordaje biológico perfecto, ya que acelerar los plazos sin respetar los tiempos de consolidación celular eleva drásticamente el riesgo de re-rotura.\\\\n\\\\n### Justificación Fisiológica\\\\nEl bíceps femoral es la porción de los isquiotibiales con mayor tasa de lesión en el fútbol debido a su arquitectura muscular (fibras largas, alta densidad de fibras tipo II) y su acción biarticular. Durante la fase de oscilación tardía del sprint, experimenta una contracción excéntrica extrema para desacelerar la tibia. Fisiológicamente, el tejido cicatrizal derivado de la rotura fibrilar requiere de al menos 14 a 21 días solo para completar la fase de proliferación y comenzar la fase de remodelación del colágeno (reemplazo de colágeno tipo III por tipo I, más resistente). Acortar este proceso expone al futbolista a una cicatriz inmadura incapaz de tolerar las fuerzas de cizallamiento de la carrera de alta intensidad.\\\\n\\\\n### Criterios e Hitos para el Alta\\\\nPara mitigar el riesgo de recidiva, el alta médica y deportiva no debe basarse únicamente en el tiempo transcurrido, sino en criterios funcionales y objetivos:\\\\n- **Resolución sintomática completa:** Ausencia total de dolor a la palpación localizada y en el test de estiramiento pasivo (Askling H-test).\\\\n- **Restablecimiento de la fuerza excéntrica:** Simetría de fuerza excéntrica en dinamometría (p. ej., test de NordBord) con una diferencia menor al 10% respecto a la pierna sana.\\\\n- **Flexibilidad simétrica:** Rango de movimiento pasivo y activo en flexo-extensión de cadera y rodilla equivalente al miembro contralateral.\\\\n- **Tolerancia al esfuerzo de alta intensidad:** Capacidad para completar sesiones de carrera a velocidad máxima (>95% de la velocidad pico del jugador) y cambios de dirección sin aprensión ni molestias.\\\\n- **Control neuromuscular:** Éxito en pruebas de saltabilidad y estabilidad lumbo-pélvica (core) bajo fatiga acumulada."}	postgres	2026-08-13 21:54:33.581321
12	players	INSERT	19	\N	{"id": 19, "name": "N. Woltemade", "api_id": 158054, "height": "198", "club_id": 13, "birthdate": "2002-02-14", "photo_url": "https://media.api-sports.io/football/players/158054.png", "created_at": "2026-08-13T21:54:50.846553", "position_id": 4, "market_value": "No disponible"}	postgres	2026-08-13 21:54:50.846553
13	players	INSERT	20	\N	{"id": 20, "name": "J. Rodríguez", "api_id": 517, "height": "180", "club_id": 14, "birthdate": "1991-07-12", "photo_url": "https://media.api-sports.io/football/players/517.png", "created_at": "2026-08-13T22:45:27.833175", "position_id": 3, "market_value": "No disponible"}	postgres	2026-08-13 22:45:27.833175
14	players	INSERT	21	\N	{"id": 21, "name": "R. Rodríguez", "api_id": 1631, "height": "182", "club_id": 9, "birthdate": "1992-08-25", "photo_url": "https://media.api-sports.io/football/players/1631.png", "created_at": "2026-08-13T22:45:27.85668", "position_id": 2, "market_value": "No disponible"}	postgres	2026-08-13 22:45:27.85668
15	players	INSERT	22	\N	{"id": 22, "name": "G. Rodríguez", "api_id": 2476, "height": "185", "club_id": 9, "birthdate": "1994-04-12", "photo_url": "https://media.api-sports.io/football/players/2476.png", "created_at": "2026-08-13T22:45:27.87192", "position_id": 3, "market_value": "No disponible"}	postgres	2026-08-13 22:45:27.87192
16	players	INSERT	23	\N	{"id": 23, "name": "Dani Rodríguez", "api_id": 46742, "height": "178", "club_id": 10, "birthdate": "1988-06-06", "photo_url": "https://media.api-sports.io/football/players/46742.png", "created_at": "2026-08-13T22:45:27.88466", "position_id": 3, "market_value": "No disponible"}	postgres	2026-08-13 22:45:27.88466
17	players	INSERT	24	\N	{"id": 24, "name": "Óscar Rodríguez", "api_id": 47416, "height": "174 cm", "club_id": 15, "birthdate": "1998-06-28", "photo_url": "https://media.api-sports.io/football/players/47416.png", "created_at": "2026-08-13T22:45:27.899615", "position_id": 3, "market_value": "No disponible"}	postgres	2026-08-13 22:45:27.899615
18	players	INSERT	25	\N	{"id": 25, "name": "Kirian Rodríguez", "api_id": 70315, "height": "180 cm", "club_id": 16, "birthdate": "1996-03-05", "photo_url": "https://media.api-sports.io/football/players/70315.png", "created_at": "2026-08-13T22:45:27.912559", "position_id": 3, "market_value": "No disponible"}	postgres	2026-08-13 22:45:27.912559
19	players	INSERT	26	\N	{"id": 26, "name": "Rodrigo Riquelme", "api_id": 136117, "height": "173", "club_id": 8, "birthdate": "2000-04-02", "photo_url": "https://media.api-sports.io/football/players/136117.png", "created_at": "2026-08-13T22:45:27.92439", "position_id": 3, "market_value": "No disponible"}	postgres	2026-08-13 22:45:27.92439
20	players	INSERT	27	\N	{"id": 27, "name": "Rodri", "api_id": 185477, "height": "168 cm", "club_id": 9, "birthdate": "2000-05-16", "photo_url": "https://media.api-sports.io/football/players/185477.png", "created_at": "2026-08-13T22:45:27.937275", "position_id": 3, "market_value": "No disponible"}	postgres	2026-08-13 22:45:27.937275
21	players	INSERT	28	\N	{"id": 28, "name": "Miguel Rodríguez", "api_id": 192434, "height": "179", "club_id": 17, "birthdate": "2003-04-29", "photo_url": "https://media.api-sports.io/football/players/192434.png", "created_at": "2026-08-13T22:45:27.950162", "position_id": 4, "market_value": "No disponible"}	postgres	2026-08-13 22:45:27.950162
22	players	INSERT	29	\N	{"id": 29, "name": "Damián Rodríguez", "api_id": 286796, "height": "180", "club_id": 17, "birthdate": "2003-03-17", "photo_url": "https://media.api-sports.io/football/players/286796.png", "created_at": "2026-08-13T22:45:27.965836", "position_id": 3, "market_value": "No disponible"}	postgres	2026-08-13 22:45:27.965836
23	players	INSERT	30	\N	{"id": 30, "name": "Víctor Rodríguez", "api_id": 301732, "height": "188 cm", "club_id": 18, "birthdate": "2003-03-05", "photo_url": "https://media.api-sports.io/football/players/301732.png", "created_at": "2026-08-13T22:45:27.979465", "position_id": 2, "market_value": "No disponible"}	postgres	2026-08-13 22:45:27.979465
24	players	INSERT	31	\N	{"id": 31, "name": "Fer Rodríguez", "api_id": 325491, "height": "182 cm", "club_id": 18, "birthdate": "2002-11-06", "photo_url": "https://media.api-sports.io/football/players/325491.png", "created_at": "2026-08-13T22:45:27.991008", "position_id": 3, "market_value": "No disponible"}	postgres	2026-08-13 22:45:27.991008
25	players	INSERT	32	\N	{"id": 32, "name": "Rodrigo Abajas", "api_id": 327496, "height": "186 cm", "club_id": 18, "birthdate": "2003-05-12", "photo_url": "https://media.api-sports.io/football/players/327496.png", "created_at": "2026-08-13T22:45:28.004996", "position_id": 2, "market_value": "No disponible"}	postgres	2026-08-13 22:45:28.004996
26	players	INSERT	33	\N	{"id": 33, "name": "Mikel Rodríguez", "api_id": 332645, "height": "175 cm", "club_id": 19, "birthdate": "2002-04-03", "photo_url": "https://media.api-sports.io/football/players/332645.png", "created_at": "2026-08-13T22:45:28.017883", "position_id": 3, "market_value": "No disponible"}	postgres	2026-08-13 22:45:28.017883
27	players	INSERT	34	\N	{"id": 34, "name": "Á. Rodríguez", "api_id": 343202, "height": "192", "club_id": 3, "birthdate": "2004-07-14", "photo_url": "https://media.api-sports.io/football/players/343202.png", "created_at": "2026-08-13T22:45:28.030326", "position_id": 4, "market_value": "No disponible"}	postgres	2026-08-13 22:45:28.030326
28	players	INSERT	35	\N	{"id": 35, "name": "Dani Rodríguez", "api_id": 371912, "height": "Sin estatura", "club_id": 2, "birthdate": "2005-08-09", "photo_url": "https://media.api-sports.io/football/players/371912.png", "created_at": "2026-08-13T22:45:28.056011", "position_id": 4, "market_value": "No disponible"}	postgres	2026-08-13 22:45:28.056011
29	players	INSERT	36	\N	{"id": 36, "name": "Javi Rodríguez", "api_id": 384135, "height": "178", "club_id": 17, "birthdate": "2003-06-26", "photo_url": "https://media.api-sports.io/football/players/384135.png", "created_at": "2026-08-13T22:45:28.107311", "position_id": 2, "market_value": "No disponible"}	postgres	2026-08-13 22:45:28.107311
30	players	INSERT	37	\N	{"id": 37, "name": "Jesús Rodríguez", "api_id": 443162, "height": "185", "club_id": 9, "birthdate": "2005-11-21", "photo_url": "https://media.api-sports.io/football/players/443162.png", "created_at": "2026-08-13T22:45:28.161561", "position_id": 4, "market_value": "No disponible"}	postgres	2026-08-13 22:45:28.161561
31	players	INSERT	38	\N	{"id": 38, "name": "Arturo Rodríguez", "api_id": 522649, "height": "Sin estatura", "club_id": 16, "birthdate": "2006-08-05", "photo_url": "https://media.api-sports.io/football/players/522649.png", "created_at": "2026-08-13T22:45:28.192977", "position_id": 4, "market_value": "No disponible"}	postgres	2026-08-13 22:45:28.192977
32	users	UPDATE	3	{"id": 3, "dob": "1999-11-11", "role": "user", "email": "test@puce.edu.ec", "password": "$2a$10$h/JDjej3IdIlQnr7AMF4auEYW0uLqqmrK6awX3qiOS4pUrs1.JS6G", "username": "testuser", "created_at": "2026-08-11T22:36:53.917107", "updated_at": "2026-08-11T22:36:53.917107", "subscription_tier": "free", "stripe_customer_id": null}	{"id": 3, "dob": "1999-11-11", "role": "admin", "email": "test@puce.edu.ec", "password": "$2a$10$h/JDjej3IdIlQnr7AMF4auEYW0uLqqmrK6awX3qiOS4pUrs1.JS6G", "username": "testuser", "created_at": "2026-08-11T22:36:53.917107", "updated_at": "2026-08-13T23:21:20.349772", "subscription_tier": "free", "stripe_customer_id": null}	postgres	2026-08-13 23:21:20.349772
33	users	UPDATE	2	{"id": 2, "dob": "2004-11-29", "role": "user", "email": "jrulloa@puce.edu.ec", "password": "$2a$10$P2qbmpCjwQKkdsLggJEOMO29mcc9yoCwrS8TMxRQtzqHvUceY1grG", "username": "Rafael Ulloa", "created_at": "2026-08-10T18:48:40.286194", "updated_at": "2026-08-10T20:15:39.882755", "subscription_tier": "premium", "stripe_customer_id": "cus_V39fTrtdJtSzT6"}	{"id": 2, "dob": "2004-11-29", "role": "admin", "email": "jrulloa@puce.edu.ec", "password": "$2a$10$P2qbmpCjwQKkdsLggJEOMO29mcc9yoCwrS8TMxRQtzqHvUceY1grG", "username": "Rafael Ulloa", "created_at": "2026-08-10T18:48:40.286194", "updated_at": "2026-08-13T23:23:34.13483", "subscription_tier": "premium", "stripe_customer_id": "cus_V39fTrtdJtSzT6"}	postgres	2026-08-13 23:23:34.13483
\.


--
-- Data for Name: auditoria_datos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditoria_datos (id, tabla_nombre, operacion, registro_id, valor_anterior, valor_nuevo, usuario, fecha_evento) FROM stdin;
1	jugadores	INSERT	5	\N	{"id": 5, "api_id": null, "nombre": "Dean Huijsen", "club_fk": 1, "estatura": "196 cm", "foto_url": null, "created_at": "2026-08-03T22:17:40.101119", "posicion_fk": 2, "valor_mercado": "60 M EUR", "fecha_nacimiento": "2005-04-14"}	postgres	2026-08-03 22:17:40.101119
2	lesiones	INSERT	5	\N	{"id": 5, "estado": "En Recuperación", "jugador_id": 5, "tipo_lesion": "Rotura fibrilar en el bíceps femoral (Isquiotibiales)", "fecha_registro": "2026-08-03T22:18:13.850831", "tiempo_clinico_ia": 24, "dias_estimados_club": 21, "analisis_comparativo": "### Análisis de la Estimación\\n\\nLa estimación de 21 días (3 semanas) propuesta por el cuerpo médico del club es optimista pero clínicamente viable, siempre y cuando se trate de una lesión miofascial de grado I o grado II leve (clasificación British Athletics o Múnich). Según el estudio epidemiológico de lesiones de la UEFA (Ekstrand et al.), el tiempo medio de retorno al juego (RTP) para lesiones de isquiotibiales oscila entre los 14 y 28 días. Sin embargo, el bíceps femoral es el músculo con la tasa de recidiva más alta en el fútbol profesional (entre el 12% y el 30%). Un enfoque rígidamente cronológico de 21 días puede ser peligroso si no se priorizan los criterios funcionales sobre los temporales.\\n\\n### Justificación Fisiológica\\n\\nEl bíceps femoral, debido a su arquitectura biarticular y alta proporción de fibras de contracción rápida (tipo II), sufre una gran tensión excéntrica durante la fase terminal de la oscilación y la desaceleración del esprint. El proceso de curación biológica del tejido muscular consta de tres fases superpuestas: inflamatoria (1-5 días), proliferativa/reparación (fase donde se genera la cicatriz de colágeno, días 3-21) y remodelación (del día 14 en adelante). A los 21 días, el tejido cicatrizal aún se encuentra en una fase de transición estructural donde el colágeno tipo III (débil) está siendo reemplazado por colágeno tipo I (resistente). Someter al tejido a demandas de alta velocidad antes de que se complete este reordenamiento biomecánico es el principal factor de riesgo para una re-rotura.\\n\\n### Criterios e Hitos para el Alta\\n\\nEl alta médica y deportiva no debe otorgarse por el simple transcurso de los 21 días, sino tras superar de forma objetiva los siguientes hitos:\\n\\n- **Ausencia de dolor**: Negativo en la palpación clínica y en los test de contracción isométrica resistida en diferentes ángulos de flexión de rodilla (90º y 30º).\\n- **Restauración de la flexibilidad**: Simetría completa en el test de elevación de pierna recta activa (ASLR) y test de Kendall, con una diferencia menor al 10% respecto a la pierna contralateral.\\n- **Simetría de fuerza excéntrica**: Evaluación mediante dinamometría electromecánica o plataformas de fuerza (como el test NordBord), exigiendo un déficit de fuerza inferior al 10% en comparación con la pierna sana.\\n- **Exposición progresiva al esprint**: Capacidad de alcanzar y mantener velocidades superiores al 95% de la velocidad máxima individual registrada por GPS, sin aprensión ni dolor.\\n- **Readaptación específica y tolerancia al entrenamiento**: Superar con éxito al menos 3 a 5 sesiones completas de entrenamiento con el grupo, que incluyan situaciones reales de juego (toma de decisiones, aceleraciones, deceleraciones y cambios de dirección metabólicamente exigentes)."}	postgres	2026-08-03 22:18:13.850831
3	jugadores	INSERT	6	\N	{"id": 6, "api_id": null, "nombre": "Jugador Prueba Auditoria", "club_fk": null, "estatura": "180 cm", "foto_url": null, "created_at": "2026-08-03T22:22:41.550512", "posicion_fk": null, "valor_mercado": "10M EUR", "fecha_nacimiento": "1995-05-15"}	postgres	2026-08-03 22:22:41.550512
4	jugadores	UPDATE	6	{"id": 6, "api_id": null, "nombre": "Jugador Prueba Auditoria", "club_fk": null, "estatura": "180 cm", "foto_url": null, "created_at": "2026-08-03T22:22:41.550512", "posicion_fk": null, "valor_mercado": "10M EUR", "fecha_nacimiento": "1995-05-15"}	{"id": 6, "api_id": null, "nombre": "Jugador Prueba Auditoria Modificado", "club_fk": null, "estatura": "180 cm", "foto_url": null, "created_at": "2026-08-03T22:22:41.550512", "posicion_fk": null, "valor_mercado": "10M EUR", "fecha_nacimiento": "1995-05-15"}	postgres	2026-08-03 22:22:41.55798
5	jugadores	DELETE	6	{"id": 6, "api_id": null, "nombre": "Jugador Prueba Auditoria Modificado", "club_fk": null, "estatura": "180 cm", "foto_url": null, "created_at": "2026-08-03T22:22:41.550512", "posicion_fk": null, "valor_mercado": "10M EUR", "fecha_nacimiento": "1995-05-15"}	\N	postgres	2026-08-03 22:22:41.563373
6	jugadores	INSERT	7	\N	{"id": 7, "api_id": 278, "nombre": "Kylian Mbappé", "club_fk": 3, "estatura": "178", "foto_url": "https://media.api-sports.io/football/players/278.png", "created_at": "2026-08-10T19:04:04.7642", "posicion_fk": 4, "valor_mercado": "No disponible", "fecha_nacimiento": "1998-12-20"}	postgres	2026-08-10 19:04:04.7642
7	lesiones	INSERT	6	\N	{"id": 6, "estado": "En Recuperación", "jugador_id": 7, "tipo_lesion": "Rotura fibrilar en el bíceps femoral (Isquiotibiales)", "fecha_registro": "2026-08-10T19:04:17.18427", "tiempo_clinico_ia": 25, "dias_estimados_club": 21, "analisis_comparativo": "### Análisis de la Estimación\\nLa estimación de 21 días (3 semanas) propuesta por el cuerpo médico del club es físicamente viable para una rotura fibrilar de grado de menor consideración (Grado I o II leve). No obstante, de acuerdo con la literatura científica de medicina deportiva de alto rendimiento (como los estudios epidemiológicos de la UEFA dirigidos por Ekstrand), el tiempo medio de retorno a la competición para lesiones en el bíceps femoral oscila entre los 24 y 28 días. Proponer 25 días como media clínica de la IA ofrece un margen de seguridad óptimo para mitigar el elevado riesgo de recaída asociado a esta musculatura.\\n\\n### Justificación Fisiológica\\nEl bíceps femoral (especialmente la porción larga) es el músculo que experimenta mayor elongación y contracción excéntrica extrema durante la fase de oscilación tardía del sprint.\\n- **Cicatrización del tejido:** En los primeros 14 a 18 días, el tejido cicatrizal está compuesto mayoritariamente por colágeno tipo III, el cual carece de la resistencia tensional necesaria. La transición y alineación de fibras hacia colágeno tipo I requiere estímulos mecánicos progresivos que se consolidan a partir de la tercera semana.\\n- **Déficit de fuerza latente:** La ausencia de dolor clínico suele preceder a la recuperación de la fuerza excéntrica óptima, lo que induce a altas tasas de recidiva (cercanas al 30%) si se autoriza el retorno prematuro a los 21 días sin una maduración del tejido adecuada.\\n\\n### Criterios e Hitos para el Alta\\nPara mitigar el riesgo de recaída, el futbolista profesional debe superar estrictos criterios funcionales antes de recibir el alta competitiva:\\n- **Ausencia de dolor:** Palpación clínica completamente indolora y test de Askling (H-test) negativo.\\n- **Simetría de fuerza excéntrica:** Simetría bilateral con un déficit inferior al 10% respecto a la extremidad contralateral, evaluado mediante dinamometría electromecánica o plataforma NordBord.\\n- **Exposición al sprint de alta intensidad:** Capacidad de alcanzar más del 95% de su velocidad máxima individual monitorizada por GPS de forma repetida y sin aprensión.\\n- **Readaptación funcional:** Completar al menos 3 a 5 sesiones de entrenamiento grupal completo a máxima intensidad (Return to Play activo)."}	postgres	2026-08-10 19:04:17.18427
8	jugadores	INSERT	8	\N	{"id": 8, "api_id": 296667, "nombre": "Gavi", "club_fk": 2, "estatura": "174", "foto_url": "https://media.api-sports.io/football/players/296667.png", "created_at": "2026-08-11T20:49:52.336978", "posicion_fk": 3, "valor_mercado": "No disponible", "fecha_nacimiento": "2004-08-05"}	postgres	2026-08-11 20:49:52.336978
9	lesiones	INSERT	7	\N	{"id": 7, "estado": "En Recuperación", "jugador_id": 8, "tipo_lesion": "Rotura fibrilar en el bíceps femoral (Isquiotibiales)", "fecha_registro": "2026-08-11T20:50:06.319098", "tiempo_clinico_ia": 28, "dias_estimados_club": 21, "analisis_comparativo": "### Análisis de la Estimación\\n\\nLa estimación de 21 días (3 semanas) propuesta por el cuerpo médico del club se sitúa en el límite inferior de lo recomendado por la literatura científica para una rotura fibrilar de Grado II en el bíceps femoral. En el ámbito del fútbol profesional, los estudios epidemiológicos de la UEFA indican que el tiempo medio de baja para este tipo de lesiones oscila entre los 18 y los 28 días. No obstante, el bíceps femoral es el músculo con mayor tasa de recidiva en el fútbol (entre un 15% y un 30%), ocurriendo la mayoría de las recaídas dentro de las primeras dos semanas tras el retorno a la competición. Por tanto, fijar un alta estricta a los 21 días sin una progresión funcional individualizada incrementa exponencialmente el riesgo de recaída.\\n\\n### Justificación Fisiológica\\n\\nEl bíceps femoral es un músculo biarticular expuesto a una gran tensión excéntrica durante la fase de oscilación tardía del sprint. La reparación del tejido muscular sigue una secuencia biológica inalterable:\\n\\n- **Fase de destrucción y reparación temprana (Días 1 a 7):** Necrosis celular, reacción inflamatoria y formación del hematoma, seguida de la activación de células satélite.\\n- **Fase de remodelación e integración (Días 7 a 21):** Producción y deposición de colágeno tipo III, que progresivamente se sustituye por colágeno tipo I, mecánicamente más fuerte. A los 21 días, la cicatriz es altamente celular y aún carece de la elasticidad y la orientación óptima de sus fibras frente a cargas máximas.\\n- **Maduración del tejido contráctil (Días 21 en adelante):** Fase crítica donde la cicatrización colágena debe recuperar su capacidad de transmisión de fuerzas mecánicas sin romperse.\\n\\n### Criterios e Hitos para el Alta\\n\\nPara mitigar el riesgo de recidiva y asegurar un retorno seguro (Return to Play), el deportista debe superar de forma secuencial y objetiva los siguientes hitos:\\n\\n- **Criterio Clínico:** Ausencia de dolor a la palpación directa del vientre muscular y en los tests de estiramiento pasivo.\\n- **Criterio de Fuerza Simétrica:** Restauración de la fuerza excéntrica en flexión de rodilla, con un déficit menor al 10% respecto a la extremidad contralateral mediante test de NordBord o dinamometría electromecánica.\\n- **Flexibilidad:** Rango de movimiento (ROM) completo y simétrico en la flexión de cadera con rodilla extendida (test de elevación de pierna recta).\\n- **Hitos de Campo Progregisvos:** Tolerancia óptima a la carrera lineal a alta velocidad (>95% de la velocidad máxima registrada por GPS) y capacidad de realizar aceleraciones y deceleraciones multidireccionales sin sintomatología.\\n- **Criterio Neuromuscular:** Control lumbopélvico (core) estable durante gestos de alta demanda excéntrica, evitando patrones compensatorios de fatiga."}	postgres	2026-08-11 20:50:06.319098
10	jugadores	INSERT	9	\N	{"id": 9, "api_id": 349232, "nombre": "A. Dembélé", "club_fk": 4, "estatura": "185", "foto_url": "https://media.api-sports.io/football/players/349232.png", "created_at": "2026-08-11T21:09:15.559993", "posicion_fk": 2, "valor_mercado": "No disponible", "fecha_nacimiento": "2004-01-05"}	postgres	2026-08-11 21:09:15.559993
11	lesiones	INSERT	8	\N	{"id": 8, "estado": "En Recuperación", "jugador_id": 9, "tipo_lesion": "Rotura fibrilar en el bíceps femoral (Isquiotibiales)", "fecha_registro": "2026-08-11T21:09:42.094394", "tiempo_clinico_ia": 24, "dias_estimados_club": 21, "analisis_comparativo": "### Análisis de la Estimación\\\\nLa estimación de 21 días (3 semanas) propuesta por el club es optimista pero viable en el fútbol profesional de élite. Sin embargo, la literatura científica y los datos del UEFA Elite Club Injury Study sitúan el retorno medio a la competición para una rotura fibrilar de isquiotibiales (grado II) entre los 21 y 28 días. Reducir el tiempo a menos de 24 días incrementa significativamente el riesgo de recidiva, el cual se sitúa históricamente entre el 15% y el 20% en esta musculatura.\\\\n\\\\n### Justificación Fisiológica\\\\n- **Fases de cicatrización:** La fase de reparación tisular y depósito de colágeno ocurre entre los días 7 y 21. Intentar competir antes de que la fase de remodelación esté avanzada compromete la integridad de la cicatriz.\\\\n- **Solicitación excéntrica:** El bíceps femoral experimenta su pico de tensión de forma excéntrica durante la desaceleración y la zancada terminal del sprint. Una cicatriz inmadura no tolerará estas fuerzas cizallantes, provocando una re-rotura en la unión miotendinosa.\\\\n\\\\n### Criterios e Hitos para el Alta\\\\n- **Ausencia de sintomatología:** Dolor cero a la palpación y en la contracción isométrica máxima contra resistencia.\\\\n- **Simetría de fuerza excéntrica:** Déficit de fuerza menor al 10% en comparación con la pierna contralateral, validado objetivamente mediante dinamometría o test de NordBord.\\\\n- **Flexibilidad normalizada:** Rango de movimiento activo simétrico en el test de elevación de pierna recta (SLR) o extensión activa de rodilla.\\\\n- **Gesto deportivo específico:** Superación sin restricciones de un protocolo de campo progresivo que incluya sprints a máxima intensidad, aceleraciones, desaceleraciones y cambios de dirección.\\\\n- **Control ecográfico:** Evidencia ecográfica o por resonancia magnética de una cicatrización sólida y organizada, libre de fibrosis desorganizada o áreas residuales de hematoma."}	postgres	2026-08-11 21:09:42.094394
12	jugadores	INSERT	10	\N	{"id": 10, "api_id": 217, "nombre": "Lautaro Martínez", "club_fk": 5, "estatura": "174", "foto_url": "https://media.api-sports.io/football/players/217.png", "created_at": "2026-08-11T21:39:30.394737", "posicion_fk": 4, "valor_mercado": "No disponible", "fecha_nacimiento": "1997-08-22"}	postgres	2026-08-11 21:39:30.394737
13	jugadores	INSERT	11	\N	{"id": 11, "api_id": 1100, "nombre": "E. Haaland", "club_fk": 6, "estatura": "195", "foto_url": "https://media.api-sports.io/football/players/1100.png", "created_at": "2026-08-11T22:33:07.148126", "posicion_fk": 4, "valor_mercado": "No disponible", "fecha_nacimiento": "2000-07-21"}	postgres	2026-08-11 22:33:07.148126
\.


--
-- Data for Name: busquedas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.busquedas (id, usuario_id, jugador_id, fecha_busqueda, tipo_buscador) FROM stdin;
1	1	7	2026-08-10 19:04:04.92299	clinico
2	1	7	2026-08-10 19:04:09.555849	clinico
3	1	2	2026-08-10 19:04:34.622689	clinico
4	1	7	2026-08-10 19:05:00.444304	clinico
5	2	2	2026-08-10 19:06:30.169389	clinico
6	2	3	2026-08-10 19:28:14.326185	clinico
7	2	7	2026-08-10 19:44:32.847005	clinico
8	2	3	2026-08-10 19:44:44.181965	clinico
9	1	2	2026-08-11 20:42:20.707054	clinico
10	1	1	2026-08-11 20:49:40.76396	clinico
11	1	8	2026-08-11 20:49:52.417537	clinico
12	2	8	2026-08-11 20:50:00.173167	clinico
13	2	8	2026-08-11 20:50:01.040131	clinico
14	2	8	2026-08-11 20:50:01.519684	clinico
15	2	8	2026-08-11 20:50:02.13519	clinico
16	2	8	2026-08-11 20:50:02.659192	clinico
17	2	8	2026-08-11 20:50:03.114288	clinico
18	2	8	2026-08-11 20:50:03.780502	clinico
19	2	7	2026-08-11 21:02:56.206451	clinico
20	2	7	2026-08-11 21:03:34.406191	clinico
21	2	7	2026-08-11 21:03:55.43114	clinico
22	2	7	2026-08-11 21:03:57.15822	clinico
23	2	2	2026-08-11 21:05:13.26712	clinico
24	2	7	2026-08-11 21:07:25.633067	clinico
25	2	2	2026-08-11 21:08:23.665239	clinico
26	2	9	2026-08-11 21:09:15.617344	clinico
27	2	3	2026-08-11 21:10:22.297228	clinico
28	2	3	2026-08-11 21:11:22.120597	clinico
29	2	3	2026-08-11 21:12:11.779268	clinico
30	2	3	2026-08-11 21:14:24.266527	clinico
31	2	3	2026-08-11 21:14:47.853285	clinico
32	2	3	2026-08-11 21:16:06.945205	clinico
33	2	3	2026-08-11 21:16:43.86629	clinico
34	2	2	2026-08-11 21:31:50.305882	clinico
35	2	3	2026-08-11 21:37:36.707209	clinico
36	2	7	2026-08-11 21:37:41.057466	clinico
37	2	8	2026-08-11 21:37:48.381952	clinico
38	2	2	2026-08-11 21:37:53.087643	clinico
39	2	1	2026-08-11 21:37:56.988514	clinico
40	2	3	2026-08-11 21:38:02.973867	clinico
41	2	2	2026-08-11 21:39:15.321281	rendimiento
42	2	10	2026-08-11 21:39:31.231748	rendimiento
43	2	3	2026-08-11 21:40:02.001175	clinico
44	2	3	2026-08-11 21:40:10.282405	clinico
45	2	3	2026-08-11 21:40:38.902252	clinico
46	2	3	2026-08-11 22:11:42.747646	clinico
47	2	3	2026-08-11 22:32:55.13315	clinico
48	2	11	2026-08-11 22:33:08.171891	rendimiento
49	2	3	2026-08-11 22:33:41.679185	clinico
50	2	11	2026-08-12 16:35:49.028596	rendimiento
51	2	3	2026-08-12 16:37:16.876313	clinico
52	2	2	2026-08-12 16:38:20.818987	clinico
53	2	2	2026-08-12 16:40:28.778753	clinico
54	2	2	2026-08-12 16:48:22.959391	clinico
\.


--
-- Data for Name: clubes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clubes (id, nombre, liga_fk) FROM stdin;
1	Real Madrid CF	2
2	Barcelona	6
3	Real Madrid	6
4	Torino	3
5	Inter	3
6	Manchester City	1
\.


--
-- Data for Name: clubs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clubs (id, name, league_id) FROM stdin;
1	Real Madrid CF	2
2	Barcelona	6
3	Real Madrid	6
4	Torino	3
5	Inter	3
6	Manchester City	1
7	Borussia Dortmund	7
8	Atletico Madrid	6
9	Real Betis	6
10	Mallorca	6
11	Chelsea	1
12	Tottenham	1
13	VfB Stuttgart	7
14	Rayo Vallecano	6
15	Getafe	6
16	Las Palmas	6
17	Celta Vigo	6
18	Leganes	6
19	Real Sociedad	6
\.


--
-- Data for Name: injuries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.injuries (id, player_id, injury_type, estimated_days_club, clinical_time_ai, comparative_analysis, status, created_at) FROM stdin;
1	1	Rotura fibrilar en el bíceps femoral (Isquiotibiales)	21	28	### Análisis de la Estimación\\nLa estimación de 21 días (3 semanas) propuesta por el cuerpo médico del club es sumamente optimista y se alinea con una lesión de grado I (microrotura o elongación). Sin embargo, si la clasificación ecográfica o por resonancia magnética confirma una rotura fibrilar real (grado II), la literatura científica especializada en fútbol profesional (como los estudios de la UEFA Elite Club Injury Study) establece un tiempo de baja promedio de 28 a 35 días. Reducir este periodo a 21 días en un futbolista de élite incrementa drásticamente el riesgo de una recaída precoz, la cual suele presentar peor pronóstico y un tiempo de recuperación duplicado.\\n\\n### Justificación Fisiológica\\nEl bíceps femoral (especialmente la cabeza larga) experimenta tensiones excéntricas extremas durante la fase de oscilación tardía y el contacto inicial del sprint. El proceso de reparación tisular sigue tiempos biológicos estrictos:\\n- **Fase de proliferación (días 3-14):** Se forma un puente de colágeno tipo III, caracterizado por ser débil y desorganizado.\\n- **Fase de remodelación (días 14-28 en adelante):** El colágeno tipo III se sustituye gradualmente por colágeno tipo I, que es mecánicamente más fuerte y se orienta en paralelo a las fibras musculares mediante carga progresiva.\\nSometer la cicatriz a contracciones excéntricas máximas a los 21 días supone exponer un tejido aún inmaduro y mecánicamente vulnerable a fuerzas de cizallamiento críticas.\\n\\n### Criterios e Hitos para el Alta\\nEl alta médica y deportiva no debe basarse en un criterio cronológico rígido, sino en el cumplimiento de los siguientes hitos funcionales y clínicos:\\n- **Ausencia de sintomatología:** Dolor cero a la palpación y en test de contracción isométrica e inclinación excéntrica.\\n- **Simetría de fuerza:** Diferencia de fuerza inferior al 10% respecto a la extremidad contralateral sana, evaluada mediante dinamometría isométrica (p. ej., test de rampa) y excéntrica (p. ej., sistema NordBord).\\n- **Flexibilidad recuperada:** Simetría completa en el test de elevación de pierna recta (Straight Leg Raise) y en el test de extensión activa de rodilla.\\n- **Readaptación en campo superada:** Tolerancia al sprint de alta intensidad (>95% de la velocidad máxima registrada por GPS) y capacidad para realizar frenadas y giros multidireccionales sin aprensión.\\n- **Evidencia ecográfica:** Confirmación de la correcta alineación de las fibras en la zona de la cicatriz y resolución total del edema perifocal.	En Recuperación	2026-07-29 23:17:11.628691
2	2	Rotura fibrilar en el bíceps femoral (Isquiotibiales)	21	28	### Análisis de la Estimación\nLa estimación de 21 días (3 semanas) propuesta por el cuerpo médico del club es sumamente optimista y se sitúa en el límite inferior de recuperación para una rotura fibrilar (típicamente clasificada como Grado II de isquiotibiales). De acuerdo con la literatura científica actual y los datos del UEFA Elite Club Injury Study, el tiempo promedio para el retorno seguro a la competición (Return to Play) oscila entre los 25 y 32 días. Un retorno prematuro a los 21 días, sin haber consolidado las fases de remodelación tisular, incrementa exponencialmente el riesgo de recidiva, la cual se asocia a periodos de baja significativamente más prolongados.\n\n### Justificación Fisiológica\nEl bíceps femoral es el músculo de los isquiotibiales que sufre mayor tensión excéntrica durante la fase de oscilación tardía del sprint en el fútbol. Su proceso de curación fisiológica demanda plazos biológicos estrictos:\n- **Fase de reparación (días 7 a 21)**: Durante este periodo se sintetiza un puente de colágeno inmaduro (tipo III) para cerrar la brecha de la rotura fibrilar. Este tejido aún carece de la alineación y la fuerza tensil necesarias.\n- **Fase de remodelación (a partir del día 21)**: El colágeno tipo III comienza a ser sustituido por colágeno tipo I, más fuerte y orientado según las líneas de fuerza del músculo. Someter al bíceps femoral a demandas biomecánicas de alta velocidad antes del día 28 interrumpe esta alineación crítica, dejando una cicatriz rígida y vulnerable.\n- **Déficit neuromuscular**: La inhibición muscular refleja post-lesión altera los patrones de activación, reduciendo la capacidad de absorber energía excéntrica si no se completa la fase final de readaptación.\n\n### Criterios e Hitos para el Alta\nPara mitigar el riesgo de recaída, el alta médica y deportiva debe regirse por hitos funcionales y de fuerza, superando el mero criterio cronológico de los 21 días:\n- **Hito de Fuerza**: Restablecimiento de la fuerza excéntrica de isquiotibiales mediante dinamometría electromecánica (ej. test NordBord) con un déficit bilateral inferior al 10% y un ratio isquiotibiales/cuádriceps óptimo.\n- **Hito de Flexibilidad y Dolor**: Rango de movimiento completo (ROM) y simétrico en flexión de cadera y extensión de rodilla, con ausencia total de dolor a la palpación y en el test de estiramiento pasivo (Askling H-test).\n- **Hito de Rendimiento GPS**: Tolerancia completa a esfuerzos de sprint de alta intensidad, alcanzando de manera progresiva y controlada el >95% de la velocidad máxima registrada previamente por GPS.\n- **Hito de Exposición Grupal**: Completar satisfactoriamente un mínimo de 3 a 5 sesiones de entrenamiento técnico-táctico al mismo ritmo que el grupo, simulando situaciones reales de juego y fatiga.	En Recuperación	2026-07-29 23:23:56.920056
3	3	Rotura fibrilar en el bíceps femoral (Isquiotibiales)	21	28	### Análisis de la Estimación\nLa estimación de 21 días (3 semanas) propuesta por el cuerpo médico es adecuada únicamente si se trata de una rotura de Grado I (leve) o Grado II de extensión mínima. Sin embargo, la literatura científica de élite (como los estudios del Grupo de Estudio de Lesiones de la UEFA por Jan Ekstrand) sitúa la media de recuperación para una rotura fibrilar del bíceps femoral en un promedio de 25 a 28 días para el retorno seguro a la competición (Return to Play). Un retorno prematuro a los 21 días sin cumplir criterios funcionales estrictos eleva exponencialmente el riesgo de recidiva, que en el bíceps femoral oscila entre el 15% y el 30% y suele ser más severa que la lesión inicial.\n\n### Justificación Fisiológica\nEl bíceps femoral es el músculo biarticular más comúnmente lesionado en futbolistas debido a su alta demanda de contracción excéntrica durante la fase final de la oscilación en la carrera a alta velocidad (sprint). La fisiología de la cicatrización muscular sigue un patrón temporal inalterable:\n- **Fase de proliferación (días 7 a 21):** Se forma un tejido cicatrizal de colágeno tipo III, caracterizado por ser desorganizado y mecánicamente débil frente a fuerzas de cizallamiento.\n- **Fase de remodelación (a partir del día 21):** El colágeno tipo III comienza a ser reemplazado por colágeno tipo I, mucho más resistente, orientando sus fibras según las líneas de fuerza del músculo. Someter al tejido a la máxima velocidad antes del día 28 interrumpe esta alineación, provocando fallas en la interfaz cicatriz-fibra muscular.\n\n### Criterios e Hitos para el Alta\nEl alta competitiva no debe determinarse por el calendario, sino por la consecución de los siguientes hitos funcionales:\n- Ausencia absoluta de dolor a la palpación del tendón y vientre muscular del bíceps femoral.\n- Fuerza excéntrica simétrica (asimetría menor al 10% en comparación con la pierna contralateral) evaluada mediante dinamometría isocinética o pruebas en plataformas de fuerza (como el test NordBord).\n- Simetría de flexibilidad en el test de elevación de pierna recta (Active Straight Leg Raise) con una diferencia menor a 5 grados respecto al miembro sano.\n- Tolerancia óptima al sprint de alta velocidad, alcanzando de manera progresiva y sin sintomatología el >95% de la velocidad máxima registrada previamente por GPS.\n- Completar al menos 3 a 5 sesiones consecutivas de entrenamiento con el grupo principal al mismo volumen e intensidad que sus compañeros.	En Recuperación	2026-07-29 23:25:15.518346
4	4	Rotura fibrilar en el bíceps femoral (Isquiotibiales)	21	25	### Análisis de la Estimación\nLa estimación de 21 días propuesta por el cuerpo médico es sumamente optimista y se alinea con una recuperación acelerada de una rotura grado I (leve). Sin embargo, según la evidencia científica actual, incluyendo los estudios epidemiológicos del UEFA Elite Club Injury Study, el tiempo medio de retorno a la competición para lesiones estructurales del bíceps femoral (especialmente si hay afectación de la unión miotendinosa) oscila entre los 24 y 28 días. Recortar los plazos biológicos a 21 días expone al futbolista profesional a una tasa de recidiva que puede alcanzar el 15-20%, complicando severamente el pronóstico de la temporada.\n\n### Justificación Fisiológica\nEl bíceps femoral es un músculo predominantemente biarticular con alta proporción de fibras rápidas tipo II, sometido a fuerzas de cizallamiento excéntrico extremas durante la fase de desaceleración y el sprint máximo. Su curación exige procesos cronológicos estrictos:\n- Fase de destrucción e inflamación (días 1 a 5): se forma el hematoma y se produce la quimiotaxis.\n- Fase de reparación (días 5 a 21): se deposita colágeno tipo III, mecánicamente inmaduro y altamente vulnerable a la tracción excéntrica rápida.\n- Fase de remodelación (a partir del día 21): sustitución por colágeno tipo I, alineación de fibras y restauración de la capacidad de absorción de energía. Iniciar sprints máximos antes de que finalice esta fase de remodelación aumenta críticamente el riesgo de re-rotura en la cicatriz inmadura.\n\n### Criterios e Hitos para el Alta\nEl alta médica y deportiva (Return to Play) no debe determinarse por calendario, sino por el cumplimiento estricto de hitos funcionales cuantificables:\n- Ausencia absoluta de dolor a la palpación, al estiramiento pasivo y durante la contracción isométrica/excéntrica máxima.\n- Simetría de fuerza isométrica y excéntrica de isquiotibiales (déficit inferior al 10% en comparación con la pierna sana) evaluada preferiblemente mediante dinamometría isocinética o tecnología NordBord.\n- Ratio de fuerza excéntrica isquiotibiales/cuádriceps (I:Q) dentro de parámetros fisiológicos (>0.6).\n- Completar una progresión de carrera y gestos técnicos sin restricciones, demostrando tolerancia absoluta a sprints de alta intensidad (>95% de la velocidad máxima del jugador) y frenazos bruscos.\n- Confirmación ecográfica o por resonancia magnética de una cicatrización sólida y alineada, sin signos de edema residual severo.	En Recuperación	2026-07-29 23:36:58.077359
5	5	Rotura fibrilar en el bíceps femoral (Isquiotibiales)	21	24	### Análisis de la Estimación\n\nLa estimación de 21 días (3 semanas) propuesta por el cuerpo médico del club es optimista pero clínicamente viable, siempre y cuando se trate de una lesión miofascial de grado I o grado II leve (clasificación British Athletics o Múnich). Según el estudio epidemiológico de lesiones de la UEFA (Ekstrand et al.), el tiempo medio de retorno al juego (RTP) para lesiones de isquiotibiales oscila entre los 14 y 28 días. Sin embargo, el bíceps femoral es el músculo con la tasa de recidiva más alta en el fútbol profesional (entre el 12% y el 30%). Un enfoque rígidamente cronológico de 21 días puede ser peligroso si no se priorizan los criterios funcionales sobre los temporales.\n\n### Justificación Fisiológica\n\nEl bíceps femoral, debido a su arquitectura biarticular y alta proporción de fibras de contracción rápida (tipo II), sufre una gran tensión excéntrica durante la fase terminal de la oscilación y la desaceleración del esprint. El proceso de curación biológica del tejido muscular consta de tres fases superpuestas: inflamatoria (1-5 días), proliferativa/reparación (fase donde se genera la cicatriz de colágeno, días 3-21) y remodelación (del día 14 en adelante). A los 21 días, el tejido cicatrizal aún se encuentra en una fase de transición estructural donde el colágeno tipo III (débil) está siendo reemplazado por colágeno tipo I (resistente). Someter al tejido a demandas de alta velocidad antes de que se complete este reordenamiento biomecánico es el principal factor de riesgo para una re-rotura.\n\n### Criterios e Hitos para el Alta\n\nEl alta médica y deportiva no debe otorgarse por el simple transcurso de los 21 días, sino tras superar de forma objetiva los siguientes hitos:\n\n- **Ausencia de dolor**: Negativo en la palpación clínica y en los test de contracción isométrica resistida en diferentes ángulos de flexión de rodilla (90º y 30º).\n- **Restauración de la flexibilidad**: Simetría completa en el test de elevación de pierna recta activa (ASLR) y test de Kendall, con una diferencia menor al 10% respecto a la pierna contralateral.\n- **Simetría de fuerza excéntrica**: Evaluación mediante dinamometría electromecánica o plataformas de fuerza (como el test NordBord), exigiendo un déficit de fuerza inferior al 10% en comparación con la pierna sana.\n- **Exposición progresiva al esprint**: Capacidad de alcanzar y mantener velocidades superiores al 95% de la velocidad máxima individual registrada por GPS, sin aprensión ni dolor.\n- **Readaptación específica y tolerancia al entrenamiento**: Superar con éxito al menos 3 a 5 sesiones completas de entrenamiento con el grupo, que incluyan situaciones reales de juego (toma de decisiones, aceleraciones, deceleraciones y cambios de dirección metabólicamente exigentes).	En Recuperación	2026-08-03 22:18:13.850831
6	7	Rotura fibrilar en el bíceps femoral (Isquiotibiales)	21	25	### Análisis de la Estimación\nLa estimación de 21 días (3 semanas) propuesta por el cuerpo médico del club es físicamente viable para una rotura fibrilar de grado de menor consideración (Grado I o II leve). No obstante, de acuerdo con la literatura científica de medicina deportiva de alto rendimiento (como los estudios epidemiológicos de la UEFA dirigidos por Ekstrand), el tiempo medio de retorno a la competición para lesiones en el bíceps femoral oscila entre los 24 y 28 días. Proponer 25 días como media clínica de la IA ofrece un margen de seguridad óptimo para mitigar el elevado riesgo de recaída asociado a esta musculatura.\n\n### Justificación Fisiológica\nEl bíceps femoral (especialmente la porción larga) es el músculo que experimenta mayor elongación y contracción excéntrica extrema durante la fase de oscilación tardía del sprint.\n- **Cicatrización del tejido:** En los primeros 14 a 18 días, el tejido cicatrizal está compuesto mayoritariamente por colágeno tipo III, el cual carece de la resistencia tensional necesaria. La transición y alineación de fibras hacia colágeno tipo I requiere estímulos mecánicos progresivos que se consolidan a partir de la tercera semana.\n- **Déficit de fuerza latente:** La ausencia de dolor clínico suele preceder a la recuperación de la fuerza excéntrica óptima, lo que induce a altas tasas de recidiva (cercanas al 30%) si se autoriza el retorno prematuro a los 21 días sin una maduración del tejido adecuada.\n\n### Criterios e Hitos para el Alta\nPara mitigar el riesgo de recaída, el futbolista profesional debe superar estrictos criterios funcionales antes de recibir el alta competitiva:\n- **Ausencia de dolor:** Palpación clínica completamente indolora y test de Askling (H-test) negativo.\n- **Simetría de fuerza excéntrica:** Simetría bilateral con un déficit inferior al 10% respecto a la extremidad contralateral, evaluado mediante dinamometría electromecánica o plataforma NordBord.\n- **Exposición al sprint de alta intensidad:** Capacidad de alcanzar más del 95% de su velocidad máxima individual monitorizada por GPS de forma repetida y sin aprensión.\n- **Readaptación funcional:** Completar al menos 3 a 5 sesiones de entrenamiento grupal completo a máxima intensidad (Return to Play activo).	En Recuperación	2026-08-10 19:04:17.18427
7	8	Rotura fibrilar en el bíceps femoral (Isquiotibiales)	21	28	### Análisis de la Estimación\n\nLa estimación de 21 días (3 semanas) propuesta por el cuerpo médico del club se sitúa en el límite inferior de lo recomendado por la literatura científica para una rotura fibrilar de Grado II en el bíceps femoral. En el ámbito del fútbol profesional, los estudios epidemiológicos de la UEFA indican que el tiempo medio de baja para este tipo de lesiones oscila entre los 18 y los 28 días. No obstante, el bíceps femoral es el músculo con mayor tasa de recidiva en el fútbol (entre un 15% y un 30%), ocurriendo la mayoría de las recaídas dentro de las primeras dos semanas tras el retorno a la competición. Por tanto, fijar un alta estricta a los 21 días sin una progresión funcional individualizada incrementa exponencialmente el riesgo de recaída.\n\n### Justificación Fisiológica\n\nEl bíceps femoral es un músculo biarticular expuesto a una gran tensión excéntrica durante la fase de oscilación tardía del sprint. La reparación del tejido muscular sigue una secuencia biológica inalterable:\n\n- **Fase de destrucción y reparación temprana (Días 1 a 7):** Necrosis celular, reacción inflamatoria y formación del hematoma, seguida de la activación de células satélite.\n- **Fase de remodelación e integración (Días 7 a 21):** Producción y deposición de colágeno tipo III, que progresivamente se sustituye por colágeno tipo I, mecánicamente más fuerte. A los 21 días, la cicatriz es altamente celular y aún carece de la elasticidad y la orientación óptima de sus fibras frente a cargas máximas.\n- **Maduración del tejido contráctil (Días 21 en adelante):** Fase crítica donde la cicatrización colágena debe recuperar su capacidad de transmisión de fuerzas mecánicas sin romperse.\n\n### Criterios e Hitos para el Alta\n\nPara mitigar el riesgo de recidiva y asegurar un retorno seguro (Return to Play), el deportista debe superar de forma secuencial y objetiva los siguientes hitos:\n\n- **Criterio Clínico:** Ausencia de dolor a la palpación directa del vientre muscular y en los tests de estiramiento pasivo.\n- **Criterio de Fuerza Simétrica:** Restauración de la fuerza excéntrica en flexión de rodilla, con un déficit menor al 10% respecto a la extremidad contralateral mediante test de NordBord o dinamometría electromecánica.\n- **Flexibilidad:** Rango de movimiento (ROM) completo y simétrico en la flexión de cadera con rodilla extendida (test de elevación de pierna recta).\n- **Hitos de Campo Progregisvos:** Tolerancia óptima a la carrera lineal a alta velocidad (>95% de la velocidad máxima registrada por GPS) y capacidad de realizar aceleraciones y deceleraciones multidireccionales sin sintomatología.\n- **Criterio Neuromuscular:** Control lumbopélvico (core) estable durante gestos de alta demanda excéntrica, evitando patrones compensatorios de fatiga.	En Recuperación	2026-08-11 20:50:06.319098
8	9	Rotura fibrilar en el bíceps femoral (Isquiotibiales)	21	24	### Análisis de la Estimación\\nLa estimación de 21 días (3 semanas) propuesta por el club es optimista pero viable en el fútbol profesional de élite. Sin embargo, la literatura científica y los datos del UEFA Elite Club Injury Study sitúan el retorno medio a la competición para una rotura fibrilar de isquiotibiales (grado II) entre los 21 y 28 días. Reducir el tiempo a menos de 24 días incrementa significativamente el riesgo de recidiva, el cual se sitúa históricamente entre el 15% y el 20% en esta musculatura.\\n\\n### Justificación Fisiológica\\n- **Fases de cicatrización:** La fase de reparación tisular y depósito de colágeno ocurre entre los días 7 y 21. Intentar competir antes de que la fase de remodelación esté avanzada compromete la integridad de la cicatriz.\\n- **Solicitación excéntrica:** El bíceps femoral experimenta su pico de tensión de forma excéntrica durante la desaceleración y la zancada terminal del sprint. Una cicatriz inmadura no tolerará estas fuerzas cizallantes, provocando una re-rotura en la unión miotendinosa.\\n\\n### Criterios e Hitos para el Alta\\n- **Ausencia de sintomatología:** Dolor cero a la palpación y en la contracción isométrica máxima contra resistencia.\\n- **Simetría de fuerza excéntrica:** Déficit de fuerza menor al 10% en comparación con la pierna contralateral, validado objetivamente mediante dinamometría o test de NordBord.\\n- **Flexibilidad normalizada:** Rango de movimiento activo simétrico en el test de elevación de pierna recta (SLR) o extensión activa de rodilla.\\n- **Gesto deportivo específico:** Superación sin restricciones de un protocolo de campo progresivo que incluya sprints a máxima intensidad, aceleraciones, desaceleraciones y cambios de dirección.\\n- **Control ecográfico:** Evidencia ecográfica o por resonancia magnética de una cicatrización sólida y organizada, libre de fibrosis desorganizada o áreas residuales de hematoma.	En Recuperación	2026-08-11 21:09:42.094394
9	12	Rotura fibrilar en el bíceps femoral (Isquiotibiales)	21	\N	### Análisis de la Estimación\nLa estimación de 21 días propuesta por el cuerpo médico del club es clínicamente coherente con una rotura fibrilar de Grado I (leve) o una afectación miofascial mínima del bíceps femoral. Sin embargo, la literatura científica del Grupo de Estudio de Lesiones de la UEFA y diversos consensos de medicina deportiva sitúan el tiempo medio de retorno a la competición (Return to Play - RTP) para lesiones estructurales de isquiotibiales entre los 24 y 28 días. Un plazo de 21 días resulta optimista y sitúa al futbolista en el límite inferior de seguridad biológica, incrementando el riesgo de recaída si no se gestiona de forma individualizada.\n\n### Justificación Fisiológica\nEl músculo bíceps femoral es biarticular y se somete a una enorme fuerza excéntrica durante la fase de oscilación tardía del sprint en el fútbol. Su proceso de curación sigue fases biológicas inalterables:\n- **Fase destructiva e inflamatoria (días 1 a 3):** Caracterizada por hematoma, necrosis de las fibras lesionadas y una respuesta inflamatoria celular.\n- **Fase de reparación (días 4 a 14):** Proliferación de células satélite, mioblastos y producción de una cicatriz de tejido conectivo rica en colágeno tipo III (inicialmente débil).\n- **Fase de remodelación (días 14 en adelante):** Transición del colágeno al tipo I, orientación de las fibras según las líneas de tensión mecánica y maduración de la unión miotendinosa. Intentar acelerar el alta antes de que finalice la fase de remodelación expone al tejido a fallar ante fuerzas de cizallamiento excéntrico.\n\n### Criterios e Hitos para el Alta\nPara mitigar el riesgo de recidiva, que en el bíceps femoral ronda el 15-30% en el fútbol de élite, el jugador debe superar obligatoriamente los siguientes criterios:\n- Ausencia absoluta de dolor a la palpación y en pruebas de estiramiento pasivo e isométrico.\n- Simetría en pruebas de fuerza excéntrica (evaluada por dinamometría) con un déficit inferior al 10% respecto a la extremidad contralateral.\n- Recuperación completa del rango de movimiento (ROM) en flexión de cadera y extensión de rodilla.\n- Superación de test funcionales de carrera con progresión de aceleración y desaceleración hasta alcanzar velocidad de sprint máxima (>95% de su registro histórico).\n- Completar al menos 3 a 5 sesiones completas de entrenamiento colectivo integrado (con contacto y situaciones reales de juego) sin síntomas reportados.	En Recuperación	2026-08-13 21:46:31.943858
10	18	Rotura fibrilar en el bíceps femoral (Isquiotibiales)	21	\N	### Análisis de la Estimación\\nLa estimación de 21 días (3 semanas) propuesta por el club es clínicamente viable pero optimista, correspondiendo típicamente a una rotura fibrilar de Grado I o II leve según la clasificación de Múnich. La literatura científica de medicina deportiva, incluyendo los consensos del UEFA Elite Club Injury Study, establece un rango promedio de recuperación de 18 a 28 días (media de 24 días) para lesiones estructurales del bíceps femoral. Un retorno a los 21 días exige un abordaje biológico perfecto, ya que acelerar los plazos sin respetar los tiempos de consolidación celular eleva drásticamente el riesgo de re-rotura.\\n\\n### Justificación Fisiológica\\nEl bíceps femoral es la porción de los isquiotibiales con mayor tasa de lesión en el fútbol debido a su arquitectura muscular (fibras largas, alta densidad de fibras tipo II) y su acción biarticular. Durante la fase de oscilación tardía del sprint, experimenta una contracción excéntrica extrema para desacelerar la tibia. Fisiológicamente, el tejido cicatrizal derivado de la rotura fibrilar requiere de al menos 14 a 21 días solo para completar la fase de proliferación y comenzar la fase de remodelación del colágeno (reemplazo de colágeno tipo III por tipo I, más resistente). Acortar este proceso expone al futbolista a una cicatriz inmadura incapaz de tolerar las fuerzas de cizallamiento de la carrera de alta intensidad.\\n\\n### Criterios e Hitos para el Alta\\nPara mitigar el riesgo de recidiva, el alta médica y deportiva no debe basarse únicamente en el tiempo transcurrido, sino en criterios funcionales y objetivos:\\n- **Resolución sintomática completa:** Ausencia total de dolor a la palpación localizada y en el test de estiramiento pasivo (Askling H-test).\\n- **Restablecimiento de la fuerza excéntrica:** Simetría de fuerza excéntrica en dinamometría (p. ej., test de NordBord) con una diferencia menor al 10% respecto a la pierna sana.\\n- **Flexibilidad simétrica:** Rango de movimiento pasivo y activo en flexo-extensión de cadera y rodilla equivalente al miembro contralateral.\\n- **Tolerancia al esfuerzo de alta intensidad:** Capacidad para completar sesiones de carrera a velocidad máxima (>95% de la velocidad pico del jugador) y cambios de dirección sin aprensión ni molestias.\\n- **Control neuromuscular:** Éxito en pruebas de saltabilidad y estabilidad lumbo-pélvica (core) bajo fatiga acumulada.	En Recuperación	2026-08-13 21:54:20.888484
\.


--
-- Data for Name: jugadores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jugadores (id, api_id, nombre, club_fk, posicion_fk, foto_url, fecha_nacimiento, estatura, valor_mercado, created_at) FROM stdin;
1	\N	Vinicius Junior	1	4	\N	2000-07-12	176	120000000	2026-07-29 23:16:18.093542
2	386828	Lamine Yamal	2	4	https://media.api-sports.io/football/players/386828.png	2007-07-13	179	No disponible	2026-07-29 23:23:43.361967
3	133609	Pedri	2	3	https://media.api-sports.io/football/players/133609.png	2002-11-25	174	No disponible	2026-07-29 23:24:58.76713
4	\N	Fermin Lopez	2	3	\N	2003-05-11	175 cm	120000000 EUR	2026-07-29 23:36:37.584243
5	\N	Dean Huijsen	1	2	\N	2005-04-14	196 cm	60 M EUR	2026-08-03 22:17:40.101119
7	278	Kylian Mbappé	3	4	https://media.api-sports.io/football/players/278.png	1998-12-20	178	No disponible	2026-08-10 19:04:04.7642
8	296667	Gavi	2	3	https://media.api-sports.io/football/players/296667.png	2004-08-05	174	No disponible	2026-08-11 20:49:52.336978
9	349232	A. Dembélé	4	2	https://media.api-sports.io/football/players/349232.png	2004-01-05	185	No disponible	2026-08-11 21:09:15.559993
10	217	Lautaro Martínez	5	4	https://media.api-sports.io/football/players/217.png	1997-08-22	174	No disponible	2026-08-11 21:39:30.394737
11	1100	E. Haaland	6	4	https://media.api-sports.io/football/players/1100.png	2000-07-21	195	No disponible	2026-08-11 22:33:07.148126
\.


--
-- Data for Name: leagues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leagues (id, name, country) FROM stdin;
1	Premier League	Inglaterra
2	LaLiga	España
3	Serie A	Italia
4	Bundesliga	Alemania
5	Ligue 1	Francia
6	La Liga	Importado
7	UEFA Champions League	Importado
\.


--
-- Data for Name: lesiones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lesiones (id, jugador_id, tipo_lesion, dias_estimados_club, tiempo_clinico_ia, analisis_comparativo, estado, fecha_registro) FROM stdin;
1	1	Rotura fibrilar en el bíceps femoral (Isquiotibiales)	21	28	### Análisis de la Estimación\\nLa estimación de 21 días (3 semanas) propuesta por el cuerpo médico del club es sumamente optimista y se alinea con una lesión de grado I (microrotura o elongación). Sin embargo, si la clasificación ecográfica o por resonancia magnética confirma una rotura fibrilar real (grado II), la literatura científica especializada en fútbol profesional (como los estudios de la UEFA Elite Club Injury Study) establece un tiempo de baja promedio de 28 a 35 días. Reducir este periodo a 21 días en un futbolista de élite incrementa drásticamente el riesgo de una recaída precoz, la cual suele presentar peor pronóstico y un tiempo de recuperación duplicado.\\n\\n### Justificación Fisiológica\\nEl bíceps femoral (especialmente la cabeza larga) experimenta tensiones excéntricas extremas durante la fase de oscilación tardía y el contacto inicial del sprint. El proceso de reparación tisular sigue tiempos biológicos estrictos:\\n- **Fase de proliferación (días 3-14):** Se forma un puente de colágeno tipo III, caracterizado por ser débil y desorganizado.\\n- **Fase de remodelación (días 14-28 en adelante):** El colágeno tipo III se sustituye gradualmente por colágeno tipo I, que es mecánicamente más fuerte y se orienta en paralelo a las fibras musculares mediante carga progresiva.\\nSometer la cicatriz a contracciones excéntricas máximas a los 21 días supone exponer un tejido aún inmaduro y mecánicamente vulnerable a fuerzas de cizallamiento críticas.\\n\\n### Criterios e Hitos para el Alta\\nEl alta médica y deportiva no debe basarse en un criterio cronológico rígido, sino en el cumplimiento de los siguientes hitos funcionales y clínicos:\\n- **Ausencia de sintomatología:** Dolor cero a la palpación y en test de contracción isométrica e inclinación excéntrica.\\n- **Simetría de fuerza:** Diferencia de fuerza inferior al 10% respecto a la extremidad contralateral sana, evaluada mediante dinamometría isométrica (p. ej., test de rampa) y excéntrica (p. ej., sistema NordBord).\\n- **Flexibilidad recuperada:** Simetría completa en el test de elevación de pierna recta (Straight Leg Raise) y en el test de extensión activa de rodilla.\\n- **Readaptación en campo superada:** Tolerancia al sprint de alta intensidad (>95% de la velocidad máxima registrada por GPS) y capacidad para realizar frenadas y giros multidireccionales sin aprensión.\\n- **Evidencia ecográfica:** Confirmación de la correcta alineación de las fibras en la zona de la cicatriz y resolución total del edema perifocal.	En Recuperación	2026-07-29 23:17:11.628691
2	2	Rotura fibrilar en el bíceps femoral (Isquiotibiales)	21	28	### Análisis de la Estimación\nLa estimación de 21 días (3 semanas) propuesta por el cuerpo médico del club es sumamente optimista y se sitúa en el límite inferior de recuperación para una rotura fibrilar (típicamente clasificada como Grado II de isquiotibiales). De acuerdo con la literatura científica actual y los datos del UEFA Elite Club Injury Study, el tiempo promedio para el retorno seguro a la competición (Return to Play) oscila entre los 25 y 32 días. Un retorno prematuro a los 21 días, sin haber consolidado las fases de remodelación tisular, incrementa exponencialmente el riesgo de recidiva, la cual se asocia a periodos de baja significativamente más prolongados.\n\n### Justificación Fisiológica\nEl bíceps femoral es el músculo de los isquiotibiales que sufre mayor tensión excéntrica durante la fase de oscilación tardía del sprint en el fútbol. Su proceso de curación fisiológica demanda plazos biológicos estrictos:\n- **Fase de reparación (días 7 a 21)**: Durante este periodo se sintetiza un puente de colágeno inmaduro (tipo III) para cerrar la brecha de la rotura fibrilar. Este tejido aún carece de la alineación y la fuerza tensil necesarias.\n- **Fase de remodelación (a partir del día 21)**: El colágeno tipo III comienza a ser sustituido por colágeno tipo I, más fuerte y orientado según las líneas de fuerza del músculo. Someter al bíceps femoral a demandas biomecánicas de alta velocidad antes del día 28 interrumpe esta alineación crítica, dejando una cicatriz rígida y vulnerable.\n- **Déficit neuromuscular**: La inhibición muscular refleja post-lesión altera los patrones de activación, reduciendo la capacidad de absorber energía excéntrica si no se completa la fase final de readaptación.\n\n### Criterios e Hitos para el Alta\nPara mitigar el riesgo de recaída, el alta médica y deportiva debe regirse por hitos funcionales y de fuerza, superando el mero criterio cronológico de los 21 días:\n- **Hito de Fuerza**: Restablecimiento de la fuerza excéntrica de isquiotibiales mediante dinamometría electromecánica (ej. test NordBord) con un déficit bilateral inferior al 10% y un ratio isquiotibiales/cuádriceps óptimo.\n- **Hito de Flexibilidad y Dolor**: Rango de movimiento completo (ROM) y simétrico en flexión de cadera y extensión de rodilla, con ausencia total de dolor a la palpación y en el test de estiramiento pasivo (Askling H-test).\n- **Hito de Rendimiento GPS**: Tolerancia completa a esfuerzos de sprint de alta intensidad, alcanzando de manera progresiva y controlada el >95% de la velocidad máxima registrada previamente por GPS.\n- **Hito de Exposición Grupal**: Completar satisfactoriamente un mínimo de 3 a 5 sesiones de entrenamiento técnico-táctico al mismo ritmo que el grupo, simulando situaciones reales de juego y fatiga.	En Recuperación	2026-07-29 23:23:56.920056
3	3	Rotura fibrilar en el bíceps femoral (Isquiotibiales)	21	28	### Análisis de la Estimación\nLa estimación de 21 días (3 semanas) propuesta por el cuerpo médico es adecuada únicamente si se trata de una rotura de Grado I (leve) o Grado II de extensión mínima. Sin embargo, la literatura científica de élite (como los estudios del Grupo de Estudio de Lesiones de la UEFA por Jan Ekstrand) sitúa la media de recuperación para una rotura fibrilar del bíceps femoral en un promedio de 25 a 28 días para el retorno seguro a la competición (Return to Play). Un retorno prematuro a los 21 días sin cumplir criterios funcionales estrictos eleva exponencialmente el riesgo de recidiva, que en el bíceps femoral oscila entre el 15% y el 30% y suele ser más severa que la lesión inicial.\n\n### Justificación Fisiológica\nEl bíceps femoral es el músculo biarticular más comúnmente lesionado en futbolistas debido a su alta demanda de contracción excéntrica durante la fase final de la oscilación en la carrera a alta velocidad (sprint). La fisiología de la cicatrización muscular sigue un patrón temporal inalterable:\n- **Fase de proliferación (días 7 a 21):** Se forma un tejido cicatrizal de colágeno tipo III, caracterizado por ser desorganizado y mecánicamente débil frente a fuerzas de cizallamiento.\n- **Fase de remodelación (a partir del día 21):** El colágeno tipo III comienza a ser reemplazado por colágeno tipo I, mucho más resistente, orientando sus fibras según las líneas de fuerza del músculo. Someter al tejido a la máxima velocidad antes del día 28 interrumpe esta alineación, provocando fallas en la interfaz cicatriz-fibra muscular.\n\n### Criterios e Hitos para el Alta\nEl alta competitiva no debe determinarse por el calendario, sino por la consecución de los siguientes hitos funcionales:\n- Ausencia absoluta de dolor a la palpación del tendón y vientre muscular del bíceps femoral.\n- Fuerza excéntrica simétrica (asimetría menor al 10% en comparación con la pierna contralateral) evaluada mediante dinamometría isocinética o pruebas en plataformas de fuerza (como el test NordBord).\n- Simetría de flexibilidad en el test de elevación de pierna recta (Active Straight Leg Raise) con una diferencia menor a 5 grados respecto al miembro sano.\n- Tolerancia óptima al sprint de alta velocidad, alcanzando de manera progresiva y sin sintomatología el >95% de la velocidad máxima registrada previamente por GPS.\n- Completar al menos 3 a 5 sesiones consecutivas de entrenamiento con el grupo principal al mismo volumen e intensidad que sus compañeros.	En Recuperación	2026-07-29 23:25:15.518346
4	4	Rotura fibrilar en el bíceps femoral (Isquiotibiales)	21	25	### Análisis de la Estimación\nLa estimación de 21 días propuesta por el cuerpo médico es sumamente optimista y se alinea con una recuperación acelerada de una rotura grado I (leve). Sin embargo, según la evidencia científica actual, incluyendo los estudios epidemiológicos del UEFA Elite Club Injury Study, el tiempo medio de retorno a la competición para lesiones estructurales del bíceps femoral (especialmente si hay afectación de la unión miotendinosa) oscila entre los 24 y 28 días. Recortar los plazos biológicos a 21 días expone al futbolista profesional a una tasa de recidiva que puede alcanzar el 15-20%, complicando severamente el pronóstico de la temporada.\n\n### Justificación Fisiológica\nEl bíceps femoral es un músculo predominantemente biarticular con alta proporción de fibras rápidas tipo II, sometido a fuerzas de cizallamiento excéntrico extremas durante la fase de desaceleración y el sprint máximo. Su curación exige procesos cronológicos estrictos:\n- Fase de destrucción e inflamación (días 1 a 5): se forma el hematoma y se produce la quimiotaxis.\n- Fase de reparación (días 5 a 21): se deposita colágeno tipo III, mecánicamente inmaduro y altamente vulnerable a la tracción excéntrica rápida.\n- Fase de remodelación (a partir del día 21): sustitución por colágeno tipo I, alineación de fibras y restauración de la capacidad de absorción de energía. Iniciar sprints máximos antes de que finalice esta fase de remodelación aumenta críticamente el riesgo de re-rotura en la cicatriz inmadura.\n\n### Criterios e Hitos para el Alta\nEl alta médica y deportiva (Return to Play) no debe determinarse por calendario, sino por el cumplimiento estricto de hitos funcionales cuantificables:\n- Ausencia absoluta de dolor a la palpación, al estiramiento pasivo y durante la contracción isométrica/excéntrica máxima.\n- Simetría de fuerza isométrica y excéntrica de isquiotibiales (déficit inferior al 10% en comparación con la pierna sana) evaluada preferiblemente mediante dinamometría isocinética o tecnología NordBord.\n- Ratio de fuerza excéntrica isquiotibiales/cuádriceps (I:Q) dentro de parámetros fisiológicos (>0.6).\n- Completar una progresión de carrera y gestos técnicos sin restricciones, demostrando tolerancia absoluta a sprints de alta intensidad (>95% de la velocidad máxima del jugador) y frenazos bruscos.\n- Confirmación ecográfica o por resonancia magnética de una cicatrización sólida y alineada, sin signos de edema residual severo.	En Recuperación	2026-07-29 23:36:58.077359
5	5	Rotura fibrilar en el bíceps femoral (Isquiotibiales)	21	24	### Análisis de la Estimación\n\nLa estimación de 21 días (3 semanas) propuesta por el cuerpo médico del club es optimista pero clínicamente viable, siempre y cuando se trate de una lesión miofascial de grado I o grado II leve (clasificación British Athletics o Múnich). Según el estudio epidemiológico de lesiones de la UEFA (Ekstrand et al.), el tiempo medio de retorno al juego (RTP) para lesiones de isquiotibiales oscila entre los 14 y 28 días. Sin embargo, el bíceps femoral es el músculo con la tasa de recidiva más alta en el fútbol profesional (entre el 12% y el 30%). Un enfoque rígidamente cronológico de 21 días puede ser peligroso si no se priorizan los criterios funcionales sobre los temporales.\n\n### Justificación Fisiológica\n\nEl bíceps femoral, debido a su arquitectura biarticular y alta proporción de fibras de contracción rápida (tipo II), sufre una gran tensión excéntrica durante la fase terminal de la oscilación y la desaceleración del esprint. El proceso de curación biológica del tejido muscular consta de tres fases superpuestas: inflamatoria (1-5 días), proliferativa/reparación (fase donde se genera la cicatriz de colágeno, días 3-21) y remodelación (del día 14 en adelante). A los 21 días, el tejido cicatrizal aún se encuentra en una fase de transición estructural donde el colágeno tipo III (débil) está siendo reemplazado por colágeno tipo I (resistente). Someter al tejido a demandas de alta velocidad antes de que se complete este reordenamiento biomecánico es el principal factor de riesgo para una re-rotura.\n\n### Criterios e Hitos para el Alta\n\nEl alta médica y deportiva no debe otorgarse por el simple transcurso de los 21 días, sino tras superar de forma objetiva los siguientes hitos:\n\n- **Ausencia de dolor**: Negativo en la palpación clínica y en los test de contracción isométrica resistida en diferentes ángulos de flexión de rodilla (90º y 30º).\n- **Restauración de la flexibilidad**: Simetría completa en el test de elevación de pierna recta activa (ASLR) y test de Kendall, con una diferencia menor al 10% respecto a la pierna contralateral.\n- **Simetría de fuerza excéntrica**: Evaluación mediante dinamometría electromecánica o plataformas de fuerza (como el test NordBord), exigiendo un déficit de fuerza inferior al 10% en comparación con la pierna sana.\n- **Exposición progresiva al esprint**: Capacidad de alcanzar y mantener velocidades superiores al 95% de la velocidad máxima individual registrada por GPS, sin aprensión ni dolor.\n- **Readaptación específica y tolerancia al entrenamiento**: Superar con éxito al menos 3 a 5 sesiones completas de entrenamiento con el grupo, que incluyan situaciones reales de juego (toma de decisiones, aceleraciones, deceleraciones y cambios de dirección metabólicamente exigentes).	En Recuperación	2026-08-03 22:18:13.850831
6	7	Rotura fibrilar en el bíceps femoral (Isquiotibiales)	21	25	### Análisis de la Estimación\nLa estimación de 21 días (3 semanas) propuesta por el cuerpo médico del club es físicamente viable para una rotura fibrilar de grado de menor consideración (Grado I o II leve). No obstante, de acuerdo con la literatura científica de medicina deportiva de alto rendimiento (como los estudios epidemiológicos de la UEFA dirigidos por Ekstrand), el tiempo medio de retorno a la competición para lesiones en el bíceps femoral oscila entre los 24 y 28 días. Proponer 25 días como media clínica de la IA ofrece un margen de seguridad óptimo para mitigar el elevado riesgo de recaída asociado a esta musculatura.\n\n### Justificación Fisiológica\nEl bíceps femoral (especialmente la porción larga) es el músculo que experimenta mayor elongación y contracción excéntrica extrema durante la fase de oscilación tardía del sprint.\n- **Cicatrización del tejido:** En los primeros 14 a 18 días, el tejido cicatrizal está compuesto mayoritariamente por colágeno tipo III, el cual carece de la resistencia tensional necesaria. La transición y alineación de fibras hacia colágeno tipo I requiere estímulos mecánicos progresivos que se consolidan a partir de la tercera semana.\n- **Déficit de fuerza latente:** La ausencia de dolor clínico suele preceder a la recuperación de la fuerza excéntrica óptima, lo que induce a altas tasas de recidiva (cercanas al 30%) si se autoriza el retorno prematuro a los 21 días sin una maduración del tejido adecuada.\n\n### Criterios e Hitos para el Alta\nPara mitigar el riesgo de recaída, el futbolista profesional debe superar estrictos criterios funcionales antes de recibir el alta competitiva:\n- **Ausencia de dolor:** Palpación clínica completamente indolora y test de Askling (H-test) negativo.\n- **Simetría de fuerza excéntrica:** Simetría bilateral con un déficit inferior al 10% respecto a la extremidad contralateral, evaluado mediante dinamometría electromecánica o plataforma NordBord.\n- **Exposición al sprint de alta intensidad:** Capacidad de alcanzar más del 95% de su velocidad máxima individual monitorizada por GPS de forma repetida y sin aprensión.\n- **Readaptación funcional:** Completar al menos 3 a 5 sesiones de entrenamiento grupal completo a máxima intensidad (Return to Play activo).	En Recuperación	2026-08-10 19:04:17.18427
7	8	Rotura fibrilar en el bíceps femoral (Isquiotibiales)	21	28	### Análisis de la Estimación\n\nLa estimación de 21 días (3 semanas) propuesta por el cuerpo médico del club se sitúa en el límite inferior de lo recomendado por la literatura científica para una rotura fibrilar de Grado II en el bíceps femoral. En el ámbito del fútbol profesional, los estudios epidemiológicos de la UEFA indican que el tiempo medio de baja para este tipo de lesiones oscila entre los 18 y los 28 días. No obstante, el bíceps femoral es el músculo con mayor tasa de recidiva en el fútbol (entre un 15% y un 30%), ocurriendo la mayoría de las recaídas dentro de las primeras dos semanas tras el retorno a la competición. Por tanto, fijar un alta estricta a los 21 días sin una progresión funcional individualizada incrementa exponencialmente el riesgo de recaída.\n\n### Justificación Fisiológica\n\nEl bíceps femoral es un músculo biarticular expuesto a una gran tensión excéntrica durante la fase de oscilación tardía del sprint. La reparación del tejido muscular sigue una secuencia biológica inalterable:\n\n- **Fase de destrucción y reparación temprana (Días 1 a 7):** Necrosis celular, reacción inflamatoria y formación del hematoma, seguida de la activación de células satélite.\n- **Fase de remodelación e integración (Días 7 a 21):** Producción y deposición de colágeno tipo III, que progresivamente se sustituye por colágeno tipo I, mecánicamente más fuerte. A los 21 días, la cicatriz es altamente celular y aún carece de la elasticidad y la orientación óptima de sus fibras frente a cargas máximas.\n- **Maduración del tejido contráctil (Días 21 en adelante):** Fase crítica donde la cicatrización colágena debe recuperar su capacidad de transmisión de fuerzas mecánicas sin romperse.\n\n### Criterios e Hitos para el Alta\n\nPara mitigar el riesgo de recidiva y asegurar un retorno seguro (Return to Play), el deportista debe superar de forma secuencial y objetiva los siguientes hitos:\n\n- **Criterio Clínico:** Ausencia de dolor a la palpación directa del vientre muscular y en los tests de estiramiento pasivo.\n- **Criterio de Fuerza Simétrica:** Restauración de la fuerza excéntrica en flexión de rodilla, con un déficit menor al 10% respecto a la extremidad contralateral mediante test de NordBord o dinamometría electromecánica.\n- **Flexibilidad:** Rango de movimiento (ROM) completo y simétrico en la flexión de cadera con rodilla extendida (test de elevación de pierna recta).\n- **Hitos de Campo Progregisvos:** Tolerancia óptima a la carrera lineal a alta velocidad (>95% de la velocidad máxima registrada por GPS) y capacidad de realizar aceleraciones y deceleraciones multidireccionales sin sintomatología.\n- **Criterio Neuromuscular:** Control lumbopélvico (core) estable durante gestos de alta demanda excéntrica, evitando patrones compensatorios de fatiga.	En Recuperación	2026-08-11 20:50:06.319098
8	9	Rotura fibrilar en el bíceps femoral (Isquiotibiales)	21	24	### Análisis de la Estimación\\nLa estimación de 21 días (3 semanas) propuesta por el club es optimista pero viable en el fútbol profesional de élite. Sin embargo, la literatura científica y los datos del UEFA Elite Club Injury Study sitúan el retorno medio a la competición para una rotura fibrilar de isquiotibiales (grado II) entre los 21 y 28 días. Reducir el tiempo a menos de 24 días incrementa significativamente el riesgo de recidiva, el cual se sitúa históricamente entre el 15% y el 20% en esta musculatura.\\n\\n### Justificación Fisiológica\\n- **Fases de cicatrización:** La fase de reparación tisular y depósito de colágeno ocurre entre los días 7 y 21. Intentar competir antes de que la fase de remodelación esté avanzada compromete la integridad de la cicatriz.\\n- **Solicitación excéntrica:** El bíceps femoral experimenta su pico de tensión de forma excéntrica durante la desaceleración y la zancada terminal del sprint. Una cicatriz inmadura no tolerará estas fuerzas cizallantes, provocando una re-rotura en la unión miotendinosa.\\n\\n### Criterios e Hitos para el Alta\\n- **Ausencia de sintomatología:** Dolor cero a la palpación y en la contracción isométrica máxima contra resistencia.\\n- **Simetría de fuerza excéntrica:** Déficit de fuerza menor al 10% en comparación con la pierna contralateral, validado objetivamente mediante dinamometría o test de NordBord.\\n- **Flexibilidad normalizada:** Rango de movimiento activo simétrico en el test de elevación de pierna recta (SLR) o extensión activa de rodilla.\\n- **Gesto deportivo específico:** Superación sin restricciones de un protocolo de campo progresivo que incluya sprints a máxima intensidad, aceleraciones, desaceleraciones y cambios de dirección.\\n- **Control ecográfico:** Evidencia ecográfica o por resonancia magnética de una cicatrización sólida y organizada, libre de fibrosis desorganizada o áreas residuales de hematoma.	En Recuperación	2026-08-11 21:09:42.094394
\.


--
-- Data for Name: ligas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ligas (id, nombre, pais) FROM stdin;
1	Premier League	Inglaterra
2	LaLiga	España
3	Serie A	Italia
4	Bundesliga	Alemania
5	Ligue 1	Francia
6	La Liga	Importado
\.


--
-- Data for Name: limite_busquedas_anonimas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.limite_busquedas_anonimas (identificador, cantidad, ultima_busqueda) FROM stdin;
jrulloa@puce.edu.ec	3	2026-08-10
::1	3	2026-08-12
\.


--
-- Data for Name: players; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.players (id, api_id, name, photo_url, birthdate, height, market_value, created_at, club_id, position_id) FROM stdin;
1	\N	Vinicius Junior	\N	2000-07-12	176	120000000	2026-07-29 23:16:18.093542	1	4
2	386828	Lamine Yamal	https://media.api-sports.io/football/players/386828.png	2007-07-13	179	No disponible	2026-07-29 23:23:43.361967	2	4
3	133609	Pedri	https://media.api-sports.io/football/players/133609.png	2002-11-25	174	No disponible	2026-07-29 23:24:58.76713	2	3
4	\N	Fermin Lopez	\N	2003-05-11	175 cm	120000000 EUR	2026-07-29 23:36:37.584243	2	3
5	\N	Dean Huijsen	\N	2005-04-14	196 cm	60 M EUR	2026-08-03 22:17:40.101119	1	2
7	278	Kylian Mbappé	https://media.api-sports.io/football/players/278.png	1998-12-20	178	No disponible	2026-08-10 19:04:04.7642	3	4
8	296667	Gavi	https://media.api-sports.io/football/players/296667.png	2004-08-05	174	No disponible	2026-08-11 20:49:52.336978	2	3
9	349232	A. Dembélé	https://media.api-sports.io/football/players/349232.png	2004-01-05	185	No disponible	2026-08-11 21:09:15.559993	4	2
10	217	Lautaro Martínez	https://media.api-sports.io/football/players/217.png	1997-08-22	174	No disponible	2026-08-11 21:39:30.394737	5	4
11	1100	E. Haaland	https://media.api-sports.io/football/players/1100.png	2000-07-21	195	No disponible	2026-08-11 22:33:07.148126	6	4
12	25282	G. Kobel	https://media.api-sports.io/football/players/25282.png	1997-12-06	195	No disponible	2026-08-13 21:46:19.00868	7	1
13	1496	Raphinha	https://media.api-sports.io/football/players/1496.png	1996-12-14	176	No disponible	2026-08-13 21:46:53.05181	2	4
14	753	Marcos Llorente	https://media.api-sports.io/football/players/753.png	1995-01-30	183	No disponible	2026-08-13 21:47:53.205858	8	3
15	47302	Diego Llorente	https://media.api-sports.io/football/players/47302.png	1993-08-16	186	No disponible	2026-08-13 21:47:53.290464	9	2
16	179139	Leo Román	https://media.api-sports.io/football/players/179139.png	2000-07-06	189	No disponible	2026-08-13 21:49:00.401744	10	1
17	47380	Marc Cucurella	https://media.api-sports.io/football/players/47380.png	1998-07-22	174	No disponible	2026-08-13 21:53:19.484631	11	2
18	47519	Pedro Porro	https://media.api-sports.io/football/players/47519.png	1999-09-13	173	No disponible	2026-08-13 21:54:00.76178	12	2
19	158054	N. Woltemade	https://media.api-sports.io/football/players/158054.png	2002-02-14	198	No disponible	2026-08-13 21:54:50.846553	13	4
20	517	J. Rodríguez	https://media.api-sports.io/football/players/517.png	1991-07-12	180	No disponible	2026-08-13 22:45:27.833175	14	3
21	1631	R. Rodríguez	https://media.api-sports.io/football/players/1631.png	1992-08-25	182	No disponible	2026-08-13 22:45:27.85668	9	2
22	2476	G. Rodríguez	https://media.api-sports.io/football/players/2476.png	1994-04-12	185	No disponible	2026-08-13 22:45:27.87192	9	3
23	46742	Dani Rodríguez	https://media.api-sports.io/football/players/46742.png	1988-06-06	178	No disponible	2026-08-13 22:45:27.88466	10	3
24	47416	Óscar Rodríguez	https://media.api-sports.io/football/players/47416.png	1998-06-28	174 cm	No disponible	2026-08-13 22:45:27.899615	15	3
25	70315	Kirian Rodríguez	https://media.api-sports.io/football/players/70315.png	1996-03-05	180 cm	No disponible	2026-08-13 22:45:27.912559	16	3
26	136117	Rodrigo Riquelme	https://media.api-sports.io/football/players/136117.png	2000-04-02	173	No disponible	2026-08-13 22:45:27.92439	8	3
27	185477	Rodri	https://media.api-sports.io/football/players/185477.png	2000-05-16	168 cm	No disponible	2026-08-13 22:45:27.937275	9	3
28	192434	Miguel Rodríguez	https://media.api-sports.io/football/players/192434.png	2003-04-29	179	No disponible	2026-08-13 22:45:27.950162	17	4
29	286796	Damián Rodríguez	https://media.api-sports.io/football/players/286796.png	2003-03-17	180	No disponible	2026-08-13 22:45:27.965836	17	3
30	301732	Víctor Rodríguez	https://media.api-sports.io/football/players/301732.png	2003-03-05	188 cm	No disponible	2026-08-13 22:45:27.979465	18	2
31	325491	Fer Rodríguez	https://media.api-sports.io/football/players/325491.png	2002-11-06	182 cm	No disponible	2026-08-13 22:45:27.991008	18	3
32	327496	Rodrigo Abajas	https://media.api-sports.io/football/players/327496.png	2003-05-12	186 cm	No disponible	2026-08-13 22:45:28.004996	18	2
33	332645	Mikel Rodríguez	https://media.api-sports.io/football/players/332645.png	2002-04-03	175 cm	No disponible	2026-08-13 22:45:28.017883	19	3
34	343202	Á. Rodríguez	https://media.api-sports.io/football/players/343202.png	2004-07-14	192	No disponible	2026-08-13 22:45:28.030326	3	4
35	371912	Dani Rodríguez	https://media.api-sports.io/football/players/371912.png	2005-08-09	Sin estatura	No disponible	2026-08-13 22:45:28.056011	2	4
36	384135	Javi Rodríguez	https://media.api-sports.io/football/players/384135.png	2003-06-26	178	No disponible	2026-08-13 22:45:28.107311	17	2
37	443162	Jesús Rodríguez	https://media.api-sports.io/football/players/443162.png	2005-11-21	185	No disponible	2026-08-13 22:45:28.161561	9	4
38	522649	Arturo Rodríguez	https://media.api-sports.io/football/players/522649.png	2006-08-05	Sin estatura	No disponible	2026-08-13 22:45:28.192977	16	4
\.


--
-- Data for Name: posiciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.posiciones (id, nombre) FROM stdin;
1	Arquero
2	Defensa
3	Mediocampista
4	Delantero
\.


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.positions (id, name) FROM stdin;
1	Arquero
2	Defensa
3	Mediocampista
4	Delantero
\.


--
-- Data for Name: searches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.searches (id, user_id, player_id, search_type, search_date) FROM stdin;
1	1	7	clinico	2026-08-10 19:04:04.92299
2	1	7	clinico	2026-08-10 19:04:09.555849
3	1	2	clinico	2026-08-10 19:04:34.622689
4	1	7	clinico	2026-08-10 19:05:00.444304
5	2	2	clinico	2026-08-10 19:06:30.169389
6	2	3	clinico	2026-08-10 19:28:14.326185
7	2	7	clinico	2026-08-10 19:44:32.847005
8	2	3	clinico	2026-08-10 19:44:44.181965
9	1	2	clinico	2026-08-11 20:42:20.707054
10	1	1	clinico	2026-08-11 20:49:40.76396
11	1	8	clinico	2026-08-11 20:49:52.417537
12	2	8	clinico	2026-08-11 20:50:00.173167
13	2	8	clinico	2026-08-11 20:50:01.040131
14	2	8	clinico	2026-08-11 20:50:01.519684
15	2	8	clinico	2026-08-11 20:50:02.13519
16	2	8	clinico	2026-08-11 20:50:02.659192
17	2	8	clinico	2026-08-11 20:50:03.114288
18	2	8	clinico	2026-08-11 20:50:03.780502
19	2	7	clinico	2026-08-11 21:02:56.206451
20	2	7	clinico	2026-08-11 21:03:34.406191
21	2	7	clinico	2026-08-11 21:03:55.43114
22	2	7	clinico	2026-08-11 21:03:57.15822
23	2	2	clinico	2026-08-11 21:05:13.26712
24	2	7	clinico	2026-08-11 21:07:25.633067
25	2	2	clinico	2026-08-11 21:08:23.665239
26	2	9	clinico	2026-08-11 21:09:15.617344
27	2	3	clinico	2026-08-11 21:10:22.297228
28	2	3	clinico	2026-08-11 21:11:22.120597
29	2	3	clinico	2026-08-11 21:12:11.779268
30	2	3	clinico	2026-08-11 21:14:24.266527
31	2	3	clinico	2026-08-11 21:14:47.853285
32	2	3	clinico	2026-08-11 21:16:06.945205
33	2	3	clinico	2026-08-11 21:16:43.86629
34	2	2	clinico	2026-08-11 21:31:50.305882
35	2	3	clinico	2026-08-11 21:37:36.707209
36	2	7	clinico	2026-08-11 21:37:41.057466
37	2	8	clinico	2026-08-11 21:37:48.381952
38	2	2	clinico	2026-08-11 21:37:53.087643
39	2	1	clinico	2026-08-11 21:37:56.988514
40	2	3	clinico	2026-08-11 21:38:02.973867
41	2	2	rendimiento	2026-08-11 21:39:15.321281
42	2	10	rendimiento	2026-08-11 21:39:31.231748
43	2	3	clinico	2026-08-11 21:40:02.001175
44	2	3	clinico	2026-08-11 21:40:10.282405
45	2	3	clinico	2026-08-11 21:40:38.902252
46	2	3	clinico	2026-08-11 22:11:42.747646
47	2	3	clinico	2026-08-11 22:32:55.13315
48	2	11	rendimiento	2026-08-11 22:33:08.171891
49	2	3	clinico	2026-08-11 22:33:41.679185
50	2	11	rendimiento	2026-08-12 16:35:49.028596
51	2	3	clinico	2026-08-12 16:37:16.876313
52	2	2	clinico	2026-08-12 16:38:20.818987
53	2	2	clinico	2026-08-12 16:40:28.778753
54	2	2	clinico	2026-08-12 16:48:22.959391
55	2	12	clinico	2026-08-13 21:46:19.051544
56	2	12	clinico	2026-08-13 21:46:24.703478
57	2	12	clinico	2026-08-13 21:46:25.91892
58	2	14	rendimiento	2026-08-13 21:47:54.676974
59	2	16	rendimiento	2026-08-13 21:49:01.736036
60	2	17	rendimiento	2026-08-13 21:53:21.064506
61	2	18	clinico	2026-08-13 21:54:00.793783
62	2	18	clinico	2026-08-13 21:54:19.246014
63	2	18	clinico	2026-08-13 21:54:20.293274
64	2	1	clinico	2026-08-13 21:54:22.762358
65	2	18	clinico	2026-08-13 21:54:31.85034
66	2	19	rendimiento	2026-08-13 21:54:53.834323
\.


--
-- Data for Name: top_jugadores_buscados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.top_jugadores_buscados (jugador_id, nombre, cantidad_busquedas) FROM stdin;
5	Dean Huijsen	2
9	A. Dembélé	1
7	Kylian Mbappé	10
8	Gavi	9
1	Vinicius Junior	2
10	Lautaro Martínez	1
11	E. Haaland	2
3	Pedri	18
2	Lamine Yamal	12
\.


--
-- Data for Name: top_searched_players; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.top_searched_players (player_id, name, search_count) FROM stdin;
5	Dean Huijsen	2
9	A. Dembélé	1
7	Kylian Mbappé	10
8	Gavi	9
10	Lautaro Martínez	1
11	E. Haaland	2
3	Pedri	18
2	Lamine Yamal	12
12	G. Kobel	3
14	Marcos Llorente	1
16	Leo Román	1
17	Marc Cucurella	1
1	Vinicius Junior	3
18	Pedro Porro	4
19	N. Woltemade	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, dob, role, subscription_tier, stripe_customer_id, created_at, updated_at) FROM stdin;
1	Invitado	invitado@physio.ai	no-password-hash	2000-01-01	invitado	free	\N	2026-08-10 18:09:03.811005	2026-08-10 18:09:03.811005
3	testuser	test@puce.edu.ec	$2a$10$h/JDjej3IdIlQnr7AMF4auEYW0uLqqmrK6awX3qiOS4pUrs1.JS6G	1999-11-11	admin	free	\N	2026-08-11 22:36:53.917107	2026-08-13 23:21:20.349772
2	Rafael Ulloa	jrulloa@puce.edu.ec	$2a$10$P2qbmpCjwQKkdsLggJEOMO29mcc9yoCwrS8TMxRQtzqHvUceY1grG	2004-11-29	admin	premium	cus_V39fTrtdJtSzT6	2026-08-10 18:48:40.286194	2026-08-13 23:23:34.13483
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, username, email, password, dob, rol, subscription_tier, created_at, updated_at, stripe_customer_id) FROM stdin;
1	Invitado	invitado@physio.ai	no-password-hash	2000-01-01	invitado	free	2026-08-10 18:09:03.811005	2026-08-10 18:09:03.811005	\N
3	testuser	test@puce.edu.ec	$2a$10$h/JDjej3IdIlQnr7AMF4auEYW0uLqqmrK6awX3qiOS4pUrs1.JS6G	1999-11-11	usuario	free	2026-08-11 22:36:53.917107	2026-08-11 22:36:53.917107	\N
2	Rafael Ulloa	jrulloa@puce.edu.ec	$2a$10$P2qbmpCjwQKkdsLggJEOMO29mcc9yoCwrS8TMxRQtzqHvUceY1grG	2004-11-29	admin	premium	2026-08-10 18:48:40.286194	2026-08-10 20:15:39.882755	cus_V39fTrtdJtSzT6
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 33, true);


--
-- Name: auditoria_datos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditoria_datos_id_seq', 13, true);


--
-- Name: busquedas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.busquedas_id_seq', 54, true);


--
-- Name: clubes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clubes_id_seq', 6, true);


--
-- Name: clubs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clubs_id_seq', 19, true);


--
-- Name: injuries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.injuries_id_seq', 10, true);


--
-- Name: jugadores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jugadores_id_seq', 11, true);


--
-- Name: leagues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leagues_id_seq', 7, true);


--
-- Name: lesiones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lesiones_id_seq', 8, true);


--
-- Name: ligas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ligas_id_seq', 6, true);


--
-- Name: players_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.players_id_seq', 38, true);


--
-- Name: posiciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.posiciones_id_seq', 4, true);


--
-- Name: positions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.positions_id_seq', 5, false);


--
-- Name: searches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.searches_id_seq', 66, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, false);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 3, true);


--
-- Name: positions PK_17e4e62ccd5749b289ae3fae6f3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT "PK_17e4e62ccd5749b289ae3fae6f3" PRIMARY KEY (id);


--
-- Name: leagues PK_2275e1e3e32e9223298c3a0b514; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leagues
    ADD CONSTRAINT "PK_2275e1e3e32e9223298c3a0b514" PRIMARY KEY (id);


--
-- Name: searches PK_60a4e082658af4c8834c23f6fad; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.searches
    ADD CONSTRAINT "PK_60a4e082658af4c8834c23f6fad" PRIMARY KEY (id);


--
-- Name: injuries PK_7fee0e9dfd99db4c3205fd7601e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.injuries
    ADD CONSTRAINT "PK_7fee0e9dfd99db4c3205fd7601e" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: clubs PK_bb09bd0c8d5238aeaa8f86ee0d4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT "PK_bb09bd0c8d5238aeaa8f86ee0d4" PRIMARY KEY (id);


--
-- Name: anonymous_search_limits PK_c1de5fb18a734bb6814c389cc3c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.anonymous_search_limits
    ADD CONSTRAINT "PK_c1de5fb18a734bb6814c389cc3c" PRIMARY KEY (identifier);


--
-- Name: players PK_de22b8fdeee0c33ab55ae71da3b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY (id);


--
-- Name: leagues UQ_1aa854560091fd99ebdadddda73; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leagues
    ADD CONSTRAINT "UQ_1aa854560091fd99ebdadddda73" UNIQUE (name);


--
-- Name: positions UQ_5c70dc5aa01e351730e4ffc929c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT "UQ_5c70dc5aa01e351730e4ffc929c" UNIQUE (name);


--
-- Name: clubs UQ_5faeec2f663968ba35f61fe46d6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT "UQ_5faeec2f663968ba35f61fe46d6" UNIQUE (name);


--
-- Name: users UQ_5ffbe395603641c29e8ce9b4c97; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_5ffbe395603641c29e8ce9b4c97" UNIQUE (stripe_customer_id);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: players UQ_a2145793e09f6afd071d6bf375f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT "UQ_a2145793e09f6afd071d6bf375f" UNIQUE (api_id);


--
-- Name: users UQ_fe0bb3f6520ee0469504521e710; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE (username);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: auditoria_datos auditoria_datos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_datos
    ADD CONSTRAINT auditoria_datos_pkey PRIMARY KEY (id);


--
-- Name: busquedas busquedas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.busquedas
    ADD CONSTRAINT busquedas_pkey PRIMARY KEY (id);


--
-- Name: clubes clubes_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clubes
    ADD CONSTRAINT clubes_nombre_key UNIQUE (nombre);


--
-- Name: clubes clubes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clubes
    ADD CONSTRAINT clubes_pkey PRIMARY KEY (id);


--
-- Name: jugadores jugadores_api_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jugadores
    ADD CONSTRAINT jugadores_api_id_key UNIQUE (api_id);


--
-- Name: jugadores jugadores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jugadores
    ADD CONSTRAINT jugadores_pkey PRIMARY KEY (id);


--
-- Name: lesiones lesiones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesiones
    ADD CONSTRAINT lesiones_pkey PRIMARY KEY (id);


--
-- Name: ligas ligas_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ligas
    ADD CONSTRAINT ligas_nombre_key UNIQUE (nombre);


--
-- Name: ligas ligas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ligas
    ADD CONSTRAINT ligas_pkey PRIMARY KEY (id);


--
-- Name: limite_busquedas_anonimas limite_busquedas_anonimas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.limite_busquedas_anonimas
    ADD CONSTRAINT limite_busquedas_anonimas_pkey PRIMARY KEY (identificador);


--
-- Name: posiciones posiciones_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posiciones
    ADD CONSTRAINT posiciones_nombre_key UNIQUE (nombre);


--
-- Name: posiciones posiciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.posiciones
    ADD CONSTRAINT posiciones_pkey PRIMARY KEY (id);


--
-- Name: top_jugadores_buscados top_jugadores_buscados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.top_jugadores_buscados
    ADD CONSTRAINT top_jugadores_buscados_pkey PRIMARY KEY (jugador_id);


--
-- Name: top_searched_players top_searched_players_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.top_searched_players
    ADD CONSTRAINT top_searched_players_pkey PRIMARY KEY (player_id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_stripe_customer_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_stripe_customer_id_key UNIQUE (stripe_customer_id);


--
-- Name: usuarios usuarios_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_username_key UNIQUE (username);


--
-- Name: idx_clubes_liga_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_clubes_liga_fk ON public.clubes USING btree (liga_fk);


--
-- Name: idx_jugadores_api_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jugadores_api_id ON public.jugadores USING btree (api_id);


--
-- Name: idx_jugadores_club_fk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jugadores_club_fk ON public.jugadores USING btree (club_fk);


--
-- Name: idx_lesiones_jugador_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lesiones_jugador_id ON public.lesiones USING btree (jugador_id);


--
-- Name: injuries trigger_audit_injuries; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_audit_injuries AFTER INSERT OR DELETE OR UPDATE ON public.injuries FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();


--
-- Name: players trigger_audit_players; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_audit_players AFTER INSERT OR DELETE OR UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();


--
-- Name: users trigger_audit_users; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_audit_users AFTER INSERT OR DELETE OR UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.log_audit_changes();


--
-- Name: jugadores trigger_auditoria_jugadores; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_auditoria_jugadores AFTER INSERT OR DELETE OR UPDATE ON public.jugadores FOR EACH ROW EXECUTE FUNCTION public.log_auditoria_datos();


--
-- Name: lesiones trigger_auditoria_lesiones; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_auditoria_lesiones AFTER INSERT OR DELETE OR UPDATE ON public.lesiones FOR EACH ROW EXECUTE FUNCTION public.log_auditoria_datos();


--
-- Name: searches trigger_new_search; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_new_search AFTER INSERT ON public.searches FOR EACH ROW EXECUTE FUNCTION public.update_top_searches();


--
-- Name: busquedas trigger_nueva_busqueda; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_nueva_busqueda AFTER INSERT ON public.busquedas FOR EACH ROW EXECUTE FUNCTION public.actualizar_top_busquedas();


--
-- Name: clubs FK_09af11f5bab8cc44db2f20c159f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT "FK_09af11f5bab8cc44db2f20c159f" FOREIGN KEY (league_id) REFERENCES public.leagues(id);


--
-- Name: searches FK_6ac608eea7118625ef50f895403; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.searches
    ADD CONSTRAINT "FK_6ac608eea7118625ef50f895403" FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;


--
-- Name: searches FK_709618ab684de7a747afe0ba84b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.searches
    ADD CONSTRAINT "FK_709618ab684de7a747afe0ba84b" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: players FK_a5426cbe2c827e9ec511b3d00a5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT "FK_a5426cbe2c827e9ec511b3d00a5" FOREIGN KEY (club_id) REFERENCES public.clubs(id);


--
-- Name: players FK_c09a5363edf0cf11e28e311a8e0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.players
    ADD CONSTRAINT "FK_c09a5363edf0cf11e28e311a8e0" FOREIGN KEY (position_id) REFERENCES public.positions(id);


--
-- Name: injuries FK_d168998070d708fdf6062bb8f4d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.injuries
    ADD CONSTRAINT "FK_d168998070d708fdf6062bb8f4d" FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE;


--
-- Name: busquedas busquedas_jugador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.busquedas
    ADD CONSTRAINT busquedas_jugador_id_fkey FOREIGN KEY (jugador_id) REFERENCES public.jugadores(id) ON DELETE CASCADE;


--
-- Name: busquedas busquedas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.busquedas
    ADD CONSTRAINT busquedas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: clubes clubes_liga_fk_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clubes
    ADD CONSTRAINT clubes_liga_fk_fkey FOREIGN KEY (liga_fk) REFERENCES public.ligas(id) ON DELETE SET NULL;


--
-- Name: lesiones fk_jugador; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lesiones
    ADD CONSTRAINT fk_jugador FOREIGN KEY (jugador_id) REFERENCES public.jugadores(id) ON DELETE CASCADE;


--
-- Name: jugadores jugadores_club_fk_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jugadores
    ADD CONSTRAINT jugadores_club_fk_fkey FOREIGN KEY (club_fk) REFERENCES public.clubes(id) ON DELETE SET NULL;


--
-- Name: jugadores jugadores_posicion_fk_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jugadores
    ADD CONSTRAINT jugadores_posicion_fk_fkey FOREIGN KEY (posicion_fk) REFERENCES public.posiciones(id) ON DELETE SET NULL;


--
-- Name: top_jugadores_buscados top_jugadores_buscados_jugador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.top_jugadores_buscados
    ADD CONSTRAINT top_jugadores_buscados_jugador_id_fkey FOREIGN KEY (jugador_id) REFERENCES public.jugadores(id) ON DELETE CASCADE;


--
-- Name: FUNCTION actualizar_top_busquedas(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.actualizar_top_busquedas() TO physiodb_user;


--
-- Name: FUNCTION calcular_edad(fecha_nacimiento character varying); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calcular_edad(fecha_nacimiento character varying) TO physiodb_user;


--
-- Name: FUNCTION calculate_age(birthdate date); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calculate_age(birthdate date) TO physiodb_user;


--
-- Name: FUNCTION log_audit_changes(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.log_audit_changes() TO physiodb_user;


--
-- Name: FUNCTION log_auditoria_datos(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.log_auditoria_datos() TO physiodb_user;


--
-- Name: FUNCTION update_top_searches(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_top_searches() TO physiodb_user;


--
-- Name: TABLE anonymous_search_limits; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.anonymous_search_limits TO physiodb_user;


--
-- Name: TABLE audit_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.audit_logs TO physiodb_user;


--
-- Name: SEQUENCE audit_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.audit_logs_id_seq TO physiodb_user;


--
-- Name: TABLE auditoria_datos; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.auditoria_datos TO physiodb_user;


--
-- Name: SEQUENCE auditoria_datos_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.auditoria_datos_id_seq TO physiodb_user;


--
-- Name: TABLE busquedas; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.busquedas TO physiodb_user;


--
-- Name: SEQUENCE busquedas_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.busquedas_id_seq TO physiodb_user;


--
-- Name: TABLE clubes; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.clubes TO physiodb_user;


--
-- Name: SEQUENCE clubes_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.clubes_id_seq TO physiodb_user;


--
-- Name: TABLE clubs; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.clubs TO physiodb_user;


--
-- Name: SEQUENCE clubs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.clubs_id_seq TO physiodb_user;


--
-- Name: TABLE injuries; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.injuries TO physiodb_user;


--
-- Name: SEQUENCE injuries_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.injuries_id_seq TO physiodb_user;


--
-- Name: TABLE jugadores; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.jugadores TO physiodb_user;


--
-- Name: SEQUENCE jugadores_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.jugadores_id_seq TO physiodb_user;


--
-- Name: TABLE leagues; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.leagues TO physiodb_user;


--
-- Name: SEQUENCE leagues_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.leagues_id_seq TO physiodb_user;


--
-- Name: TABLE lesiones; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.lesiones TO physiodb_user;


--
-- Name: SEQUENCE lesiones_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.lesiones_id_seq TO physiodb_user;


--
-- Name: TABLE ligas; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.ligas TO physiodb_user;


--
-- Name: SEQUENCE ligas_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.ligas_id_seq TO physiodb_user;


--
-- Name: TABLE limite_busquedas_anonimas; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.limite_busquedas_anonimas TO physiodb_user;


--
-- Name: TABLE players; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.players TO physiodb_user;


--
-- Name: SEQUENCE players_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.players_id_seq TO physiodb_user;


--
-- Name: TABLE posiciones; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.posiciones TO physiodb_user;


--
-- Name: SEQUENCE posiciones_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.posiciones_id_seq TO physiodb_user;


--
-- Name: TABLE positions; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.positions TO physiodb_user;


--
-- Name: SEQUENCE positions_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.positions_id_seq TO physiodb_user;


--
-- Name: TABLE searches; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.searches TO physiodb_user;


--
-- Name: SEQUENCE searches_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.searches_id_seq TO physiodb_user;


--
-- Name: TABLE top_jugadores_buscados; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.top_jugadores_buscados TO physiodb_user;


--
-- Name: TABLE top_searched_players; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.top_searched_players TO physiodb_user;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.users TO physiodb_user;


--
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.users_id_seq TO physiodb_user;


--
-- Name: TABLE usuarios; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.usuarios TO physiodb_user;


--
-- Name: SEQUENCE usuarios_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.usuarios_id_seq TO physiodb_user;


--
-- Name: TABLE view_injury_summary; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.view_injury_summary TO physiodb_user;


--
-- Name: TABLE view_player_popularity_report; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.view_player_popularity_report TO physiodb_user;


--
-- Name: TABLE view_search_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.view_search_history TO physiodb_user;


--
-- Name: TABLE vista_historial_busquedas; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.vista_historial_busquedas TO physiodb_user;


--
-- Name: TABLE vista_resumen_lesiones; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.vista_resumen_lesiones TO physiodb_user;


--
-- PostgreSQL database dump complete
--

\unrestrict U65ADI3aXneF8kbMQbKq5tAgWqEDg5KnjQriAtICtD9MpaVJEfZ9bgJbAcbIM0x

