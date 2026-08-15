# Physio.AI — Plataforma de Auditoría y Analítica Médica Deportiva

Physio.AI es una plataforma institucional diseñada para contrastar y auditar los reportes oficiales de lesiones emitidos por los clubes de fútbol profesional frente a un criterio clínico automatizado y sustentado por Inteligencia Artificial (Gemini AI). Permite mitigar riesgos en transferencias de futbolistas y optimizar la toma de decisiones directivas mediante análisis de rendimiento y paneles de analítica financiera.

---

## 🛠️ Requisitos de Entorno y Versiones

Asegúrate de contar con el siguiente software instalado con sus versiones recomendadas para asegurar compatibilidad:

- **Node.js**: `v24.16.0` (o superior)
- **npm**: `11.13.0` (o superior)
- **PostgreSQL**: `17` (o superior)

### Dependencias Principales

**Backend**:
- Express `^5.2.1`
- TypeORM `^0.3.20`
- PostgreSQL Driver (`pg`) `^8.11.3`
- `@google/genai` `^2.13.0`
- Stripe `^22.5.0`, JWT `^9.0.3`
- bcryptjs `^2.4.3`

**Frontend**:
- React `^19.2.7`
- Material-UI (MUI) `^9.2.0`
- Recharts `^3.10.1`
- Vite `^8.1.1`

---

## 📂 Estructura de Archivos del Proyecto

La arquitectura del sistema sigue un enfoque modular y limpio:

```text
physio.ai/
├── ADRs/                     # Registros de Decisiones de Arquitectura (ADRs en inglés)
├── backend/                  # Servidor de API REST y persistencia
│   ├── src/
│   │   ├── config/           # Configuración de base de datos (PostgreSQL/TypeORM)
│   │   ├── controllers/      # Controladores de la API (Autenticación, Buscador, Auditoría)
│   │   ├── middleware/       # Middlewares de seguridad (Validación JWT, Roles RBAC)
│   │   ├── models/           # Esquemas de Entidades de TypeORM (User, Player, Injury, etc.)
│   │   ├── routes/           # Enrutadores de Express (Rutas de administración, jugadores, pagos)
│   │   ├── services/         # Integraciones externas (Gemini AI, Football API)
│   │   └── server.js         # Entrypoint y configuración global de Express
│   ├── .env.example          # Plantilla de variables de entorno para backend
│   └── package.json          # Dependencias y scripts del backend
│
├── frontend/                 # Interfaz de usuario Single Page Application (SPA)
│   ├── src/
│   │   ├── api/              # Cliente HTTP y llamadas a la API
│   │   ├── components/       # Componentes visuales organizados por módulos
│   │   │   ├── Admin/        # Panel Analítico Ejecutivo para administradores
│   │   │   ├── Auth/         # Pantallas de Login y Registro de usuarios
│   │   │   ├── Common/       # Componentes globales reutilizables (Botones, Iconos, Layouts)
│   │   │   ├── Dashboard/    # Dashboard de rendimiento de jugadores
│   │   │   ├── History/      # Historial de búsquedas (filtrado/global auditable)
│   │   │   └── Landing/      # Landing Page modular del sistema
│   │   ├── Themes/           # Configuración del tema premium oscuro de Material-UI
│   │   ├── utils/            # Funciones de utilidad y formateo
│   │   ├── App.jsx           # Componente principal y gestor de estado global
│   │   └── AppRouter.jsx     # Orquestador del enrutamiento basado en estados
│   └── package.json          # Dependencias y scripts del frontend
│
└── schema.sql                # Respaldo DDL del esquema de base de datos relacional
```

---

## 🚀 Guía de Instalación y Uso

### 1. Clonar el repositorio y configurar variables de entorno

Crea un archivo llamado `.env` dentro de la carpeta `backend/` basándote en la plantilla de `.env.example`:

```bash
# Variables del Backend
PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario_postgres
DB_PASSWORD=tu_contraseña_postgres
DB_NAME=physio_ai
JWT_SECRET=secreto_seguro_jwt
GEMINI_API_KEY=tu_token_de_gemini
CLIENT_URL=http://localhost:5173
```

### 2. Configuración e inicialización del Backend

Accede a la carpeta de backend, instala las dependencias y arranca el servidor en modo desarrollo:

```bash
cd backend
npm install
npm run dev
```

_El backend levantará el servidor en http://localhost:4000. Creará automáticamente el esquema de tablas en PostgreSQL al iniciar._

### 3. Configuración e inicialización del Frontend

Abre otra terminal, accede a la carpeta de frontend, instala las dependencias e inicia el servidor de Vite:

```bash
cd frontend
npm install
npm run dev
```

_El frontend estará disponible en http://localhost:5173 (o en el puerto secundario disponible en consola)._

---

## 👥 Roles de Usuario y Guía de Uso

1. **Invitado / Sin Registro**: Puede navegar la landing page y usar el buscador clínico de forma limitada.
2. **Usuario Registrado (Gratuito)**: Registrándose desde el formulario de acceso, tiene un límite diario de 3 consultas.
3. **Usuario PRO (Premium)**: Adquiriendo una membresía virtual (procesada por Stripe Checkout), desbloquea búsquedas ilimitadas, el dashboard de rendimiento físico y el historial de consultas personales.
4. **Administrador (Admin)**: Usuario con privilegios elevados. Cuenta con:
   - **Panel Analítico**: Gráficos interactivos en tiempo real con la tasa de adopción de usuarios, volumen de tráfico de consultas y proyecciones de facturación mensual.
   - **Historial Global**: Visualización de todas las consultas realizadas en el sistema con columnas de auditoría que revelan qué usuario realizó cada búsqueda.
