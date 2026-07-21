# 🚀 Guía de Integración y Arquitectura del Proyecto — Physio.AI (MVP-01)

Este documento sirve como la **hoja de ruta técnica** para que todos los integrantes del equipo puedan integrar sus componentes de forma cohesiva, manteniendo la misma arquitectura y estándares de Git.

---

## 📐 1. Convenciones Estándar de Git y Commits

Para mantener un historial limpio, integrado con Jira y libre de conflictos en `main`, todo el equipo debe seguir estas reglas:

### 🌿 Nombre de Ramas (Branching)

Crear siempre una rama a partir de `main` antes de comenzar una tarea:

```text
feature/MVP-01-<nombre_desarrollador>-<descripcion_corta>
```

**Ejemplos**:

- `feature/MVP-01-rafael-backend-api`
- `feature/MVP-01-cristhofer-gemini-ia`
- `feature/MVP-01-salon-frontend-ui`

### 💬 Mensaje de Commit (Sintaxis Estándar)

```text
<tipo>: [MVP-01] [<NombreDev>] <TASKS_JIRA>: <Descripción corta>
```

- `<tipo>`: `feat` (nueva característica), `fix` (corrección), `docs` (documentación), `style` (estilos).

**Ejemplos**:

- `feat: [MVP-01] [Rafael] SCRUM-29: Conexion a API de futbol y busqueda de jugadores`
- `feat: [MVP-01] [Cristhofer] SCRUM-33: Integracion SDK Gemini 3.5 Flash y prompt de lesiones`
- `feat: [MVP-01] [SALON CT] SCRUM-37: Componente Buscador y Panel de Resultados en React`

---

## 🏗️ 2. Arquitectura General del Sistema

```
[React Frontend (SALON CT)] ➔ GET /api/players/search?name=... ➔ [Express Backend (Rafael)]
                                                                     │
                                                   ┌─────────────────┼─────────────────┐
                                                   ▼                 ▼                 ▼
                                            [(PostgreSQL)]   [API-Football]    [Gemini 3.5 Flash (Cristhofer)]
```

---

## 📦 3. Lo que ya está construido (Construido por Rafael)

El backend de Express y la base de datos PostgreSQL ya están completamente configurados y operativos.

### 🗄️ Base de Datos (PostgreSQL + TypeORM)

- **Tabla `jugadores`**: `id`, `api_id`, `nombre`, `equipo`, `edad`, `posicion`, `foto_url`, `created_at`.
- **Tabla `lesiones`**: `id`, `jugador_id`, `tipo_lesion`, `dias_estimados_club`, `tiempo_clinico_ia`, `analisis_comparativo`, `estado`, `fecha_registro`.

### 🛣️ Endpoints disponibles en Express (Puerto 4000):

1. `GET /api/health`: Verificación de salud del servidor.
2. `GET /api/players/search?name=<nombre>&league=<opcional>`:
   - Busca al jugador en la API real de fútbol (con fallback automático entre LaLiga, Premier League, Serie A, Ligue 1 y Champions).
   - Registra o actualiza automáticamente el jugador en la base de datos PostgreSQL.
   - Retorna un arreglo `data: [...]` con las coincidencias (incluyendo fotos y escudos).

---

## 🤖 4. Guía de Tareas para Cristhofer (HU SCRUM-33: Integración Gemini IA)

### 🎯 Objetivo:

Crear la lógica en el backend de Express para enviar a Gemini 3.5 Flash el tipo de lesión del futbolista y obtener una estimación clínica en días e informe comparativo.

### 📝 Pasos a seguir por Cristhofer:

1. **Instalar el SDK oficial de Google Gen AI**:

   ```bash
   cd backend
   npm install @google/genai
   ```

2. **Agregar la API Key a `backend/.env`**:

   ```env
   GEMINI_API_KEY=tu_clave_de_gemini_aqui
   ```

3. **Crear `backend/src/services/geminiService.js` (SCRUM-34 y SCRUM-35)**:
   - Configurar la llamada a Gemini 3.5 Flash pasándole un prompt estructurado:

   ```javascript
   import { GoogleGenAI } from "@google/genai";
   import "dotenv/config";

   const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

   export const analyzeInjuryWithGemini = async (tipoLesion, diasClub) => {
     const prompt = `Actúa como un médico especialista en medicina deportiva. 
     Un futbolista sufre de la siguiente lesión: "${tipoLesion}". 
     El club estima una recuperación de ${diasClub} días. 
     Por favor responde strictly en formato JSON con la siguiente estructura:
     {
       "tiempo_clinico_ia": <número entero estimado de días de recuperación según literatura médica>,
       "analisis_comparativo": "<explicación breve de 2 párrafos comparando el tiempo del club con el criterio clínico>"
     }`;

     const response = await ai.models.generateContent({
       model: "gemini-3.5-flash",
       contents: prompt,
     });

     // Parsear la respuesta JSON de Gemini (SCRUM-36)
     const text = response.text;
     const jsonMatch = text.match(/\{[\s\S]*\}/);
     return JSON.parse(jsonMatch[0]);
   };
   ```

4. **Crear la ruta y controlador en Express**:
   - Crear `backend/src/controllers/aiController.js` y `backend/src/routes/aiRoutes.js`.
   - Endpoint: `POST /api/ai/analyze` recibiendo `{ jugador_id, tipo_lesion, dias_estimados_club }`.
   - Guardar/actualizar la lesión en la tabla `lesiones` de PostgreSQL.
   - Registrar la ruta en `server.js`: `app.use("/api/ai", aiRoutes);`.

---

## 🎨 5. Guía de Tareas para SALON CT (HU SCRUM-37: Interfaz Frontend React)

### 🎯 Objetivo:

Crear la interfaz de usuario en React que permita buscar futbolistas y mostrar el panel con sus fotos, datos y comparación de lesiones entre el club y la IA.

### 📝 Pasos a seguir por SALON CT:

1. **Estructura recomendada en `frontend/src/`**:
   - `src/components/SearchBar.jsx` (SCRUM-38)
   - `src/components/PlayerCard.jsx` (SCRUM-39)
   - `src/components/InjuryAnalysisPanel.jsx` (SCRUM-39)
   - `src/services/api.js` (SCRUM-40)

2. **Crear el cliente API `frontend/src/services/api.js` (SCRUM-40)**:

   ```javascript
   const API_BASE_URL = "http://localhost:4000/api";

   export const searchPlayers = async (name) => {
     const res = await fetch(
       `${API_BASE_URL}/players/search?name=${encodeURIComponent(name)}`,
     );
     if (!res.ok) throw new Error("Error en la búsqueda");
     const data = await res.json();
     return data.data; // Retorna arreglo de futbolistas
   };

   export const analyzeInjury = async (injuryData) => {
     const res = await fetch(`${API_BASE_URL}/ai/analyze`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(injuryData),
     });
     return res.json();
   };
   ```

3. **Componente `SearchBar.jsx` (SCRUM-38)**:
   - Input de texto con botón de búsqueda que llama a `searchPlayers(query)`.
   - Muestra un desplegable con las coincidencias de jugadores devueltas por el backend.

4. **Componente `PlayerCard.jsx` / `InjuryAnalysisPanel.jsx` (SCRUM-39)**:
   - Muestra la foto del jugador (`player.foto_url`), nombre, equipo y posición.
   - Renderiza un gráfico o tarjetas comparando:
     - ⏱️ **Días estimación del Club** (ej. 21 días)
     - 🤖 **Días estimación clínica Gemini IA** (ej. 30 días)
     - 📝 **Informe de la IA**: Renderiza el texto de `analisis_comparativo`.

---

## 🔄 6. Flujo End-to-End de Integración Completa

```text
[1. Usuario en React] ➔ Escribe "Pedri" en SearchBar.jsx
         ↓
[2. GET /api/players/search?name=Fermin] ➔ Express busca en API-Football y guarda en PostgreSQL.
         ↓
[3. React rinde el PlayerCard] ➔ Muestra la foto de Fermín López, equipo y datos.
         ↓
[4. Evento / POST /api/ai/analyze] ➔ Gemini IA evalúa la lesión y devuelve el JSON médico.
         ↓
[5. React rinde InjuryAnalysisPanel] ➔ Muestra el informe comparativo y días de recuperación.
```

# 🖥️ Lo que ve el usuario en pantalla (Paso a Paso):

## Pantalla Principal (Buscador):

Ve una barra de búsqueda moderna donde escribe el nombre del futbolista (ej: "Fermín López" o "Julián Álvarez").
Sugerencias / Coincidencias:

Al escribir, se despliega una tarjeta con la foto oficial del jugador, el escudo de su equipo, su edad y su posición.
Panel de Diagnóstico Médico (El resultado final): Al hacer clic en el jugador, la pantalla muestra una vista limpia dividida en 3 secciones:

## 👤 Ficha del Jugador: Foto, Nombre, Equipo y Posición.

## 📊 Tarjetas Comparativas de Tiempos:

## 🏥 Tiempo estimado por el Club: 21 días

## 🤖 Tiempo estimado por Gemini IA (Criterio Clínico): 30 días

## 🩺 Informe Médico de la IA: Un texto estructurado donde Gemini 3.5 Flash explica científicamente la lesión y por qué el criterio clínico difiere o coincide con el tiempo del club.

## 🌟 En resumen:

Toda la complejidad técnica que construiste en el backend (PostgreSQL, APIs de fútbol y Gemini IA) se transforma en una sola pantalla interactiva e intuitiva para el usuario final.

---

Con este documento todo el equipo sabe exactamente qué construir, qué endpoints utilizar y cómo mantener el código 100% compatible e integrado
