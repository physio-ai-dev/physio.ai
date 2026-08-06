export const loginUser = async (email, password) => {
  const response = await fetch("http://localhost:4000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al iniciar sesión");
  }

  // Guardar el Token JWT en el navegador
  localStorage.setItem("token", data.token);
  return data;
};