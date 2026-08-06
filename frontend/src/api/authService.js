const API_URL = "http://localhost:4000/api/auth";

// INICIO DE SESIÓN
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al iniciar sesión");
  }

  // Guardar Token JWT en el almacenamiento local
  if (data.token) {
    localStorage.setItem("token", data.token);
  }

  // Opcional: Guardar datos básicos del usuario si el backend los retorna
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
};

// CIERRE DE SESIÓN Y VERIFICACIÓN

// Destruye el token JWT y los datos de usuario del almacenamiento local
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Obtiene el token guardado para peticiones HTTP autenticadas
export const getToken = () => {
  return localStorage.getItem("token");
};

// Obtiene la información del usuario en sesión
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Comprueba si el usuario tiene una sesión activa
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  // Validación básica de expiración si el token es JWT standard
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp && payload.exp * 1000 < Date.now();
    
    if (isExpired) {
      logoutUser();
      return false;
    }
    return true;
  } catch {
    // Si no es un JWT con 3 partes estándar, valida simplemente la presencia del string
    return true;
  }
};