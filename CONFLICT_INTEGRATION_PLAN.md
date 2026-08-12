# 📐 Análisis de Conflicto e Integración: `main` vs `Naranjo-SCRUM`

Este documento analiza los conflictos arquitectónicos y de características entre la rama de producción (`main`) y la rama de trabajo `Naranjo-SCRUM`, proponiendo una hoja de ruta para una fusión limpia y sin pérdida de código.

---

## 🔍 1. Comparativa de Ramas y Diferencias

### 📂 Rama Principal (`main` / Nuestro Estado Actual)
*   **Arquitectura**: Componentes modulares y reutilizables bajo `frontend/src/components/`:
    *   `Header.jsx`: Barra de navegación.
    *   `Disclaimer.jsx`: Alertas de propósito y advertencia médica.
    *   `SearchForm.jsx`: Campo de búsqueda y lista de coincidencias.
    *   `ResultPanel.jsx`: Visualización del grid comparativo 2x2 y renderizado del reporte estructurado.
    *   `CreatePlayerPage.jsx`: Vista premium de alta local de futbolista con:
        *   Filtros dinámicos de clubes condicionados por la liga seleccionada.
        *   Inputs numéricos con adornos (`cm`, `€` / `EUR`).
        *   Calendario nativo para la fecha de nacimiento.
*   **Correcciones críticas**: Resolución de bugs de importación (`Typography` y `Divider` no definidos) y del bucle circular de TypeORM (`lesiones` de uno a muchos removido del lado de `PlayerSchema`).

### 🌿 Rama de Trabajo (`Naranjo-SCRUM`)
*   **Arquitectura**: Monolítica. Todo el diseño y las secciones (Navbar, Buscador, Resultados) están declarados **en línea** dentro de un único archivo `App.jsx` de 931 líneas.
*   **Nueva Característica**: Introduce la **`LandingPage.jsx`** como pantalla inicial de la aplicación, controlada por el estado reactivo `showLanding`.
*   **Ausencias**: No incluye la pantalla de alta local (`CreatePlayerPage.jsx`), las validaciones de estatura/moneda, ni las correcciones de estabilidad en TypeORM y React.

---

## ⚡ 2. El Conflicto de Fusión (Merge Conflict)

Si realizas una fusión automática (`git merge`):
1.  **Pérdida de Modularidad**: Git intentará fusionar un archivo monolítico con un archivo modular corto. Esto generará grandes conflictos de fusión textuales en `App.jsx`.
2.  **Pérdida de Código**: Si se acepta la versión de `App.jsx` de Naranjo para solucionar los conflictos, se perderá la pantalla de creación local de futbolistas y las correcciones de bugs, regresando al diseño no modular.

---

## 🗺️ 3. Plan de Fusión Recomendado (Paso a Paso)

Para lograr una integración limpia, debemos preservar la modularidad de `main` e incorporar ordenadamente el componente `LandingPage` de Naranjo:

### Paso 1: Copiar el Componente de la Landing
Asegurar que el archivo de la Landing Page de Naranjo esté ubicado en la ruta correcta de componentes modulares:
- Ubicación destino: `frontend/src/components/LandingPage.jsx`

### Paso 2: Modificar nuestro `App.jsx` Modular
Editar el archivo `App.jsx` limpio en `main` para integrar el estado de la landing:

```javascript
import { useState } from "react";
import LandingPage from "./components/LandingPage"; // 1. Importar la Landing
// ... otros componentes importados ...

function App() {
  const [showLanding, setShowLanding] = useState(true); // 2. Estado de control
  // ... otros estados existentes ...

  // 3. Render condicional inicial
  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  // 4. Render normal de la aplicación modular
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
        {/* ... Header, Container y ruteo de vistas modulares ... */}
      </Box>
    </ThemeProvider>
  );
}
```

### Paso 3: Confirmar y Probar Localmente
Ejecutar la compilación del frontend para asegurar que no existan errores de importación y que el flujo interactivo (Landing $\rightarrow$ Buscador $\rightarrow$ Crear Jugador) funcione en armonía:
```bash
cd frontend
npm run build
```
