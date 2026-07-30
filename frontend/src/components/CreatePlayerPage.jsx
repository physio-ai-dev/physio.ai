import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  InputAdornment,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  SportsSoccer as SoccerIcon,
  Badge as BadgeIcon,
  Straighten as RulerIcon,
  AttachMoney as MoneyIcon,
  Event as CalendarIcon,
  CloudUpload as UploadIcon,
} from "@mui/icons-material";
import { api } from "../api/backend";

export default function CreatePlayerPage({ onGoBack }) {
  const [formData, setFormData] = useState({
    nombre: "",
    equipo: "",
    posicion: "",
    estatura: "",
    valor_mercado: "",
    fecha_nacimiento: "",
    liga: "",
  });

  const [ligas, setLigas] = useState([]);
  const [posiciones, setPosiciones] = useState([]);
  const [clubes, setClubes] = useState([]);
  const [loadingLigas, setLoadingLigas] = useState(true);
  const [loadingPosiciones, setLoadingPosiciones] = useState(true);
  const [loadingClubes, setLoadingClubes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 1. Cargar ligas y posiciones dinámicas desde la base de datos
  useEffect(() => {
    const fetchLigas = async () => {
      try {
        const res = await api.obtenerLigas();
        if (res && res.status === "success" && Array.isArray(res.data)) {
          setLigas(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, liga: res.data[0].nombre }));
          }
        }
      } catch (err) {
        console.error("Error al cargar catálogo de ligas:", err);
        setError("No se pudo conectar con el catálogo de ligas.");
      } finally {
        setLoadingLigas(false);
      }
    };

    const fetchPosiciones = async () => {
      try {
        const res = await api.obtenerPosiciones();
        if (res && res.status === "success" && Array.isArray(res.data)) {
          setPosiciones(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, posicion: res.data[0].nombre }));
          }
        }
      } catch (err) {
        console.error("Error al cargar catálogo de posiciones:", err);
        setError("No se pudo conectar con el catálogo de posiciones.");
      } finally {
        setLoadingPosiciones(false);
      }
    };

    fetchLigas();
    fetchPosiciones();
  }, []);

  // 2. Cargar clubes filtrados por la liga seleccionada
  useEffect(() => {
    if (!formData.liga) return;

    const fetchClubes = async () => {
      setLoadingClubes(true);
      try {
        const res = await api.obtenerClubes(formData.liga);
        if (res && res.status === "success" && Array.isArray(res.data)) {
          setClubes(res.data);
          if (res.data.length > 0) {
            // Pre-seleccionar el primer club de la lista
            setFormData((prev) => ({ ...prev, equipo: res.data[0].nombre }));
          } else {
            setFormData((prev) => ({ ...prev, equipo: "" }));
          }
        }
      } catch (err) {
        console.error("Error al cargar clubes de la liga:", err);
      } finally {
        setLoadingClubes(false);
      }
    };

    fetchClubes();
  }, [formData.liga]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { nombre, equipo, posicion, estatura, valor_mercado, liga, fecha_nacimiento } = formData;
    if (
      !nombre.trim() ||
      !equipo.trim() ||
      !posicion.trim() ||
      !estatura.trim() ||
      !valor_mercado.trim() ||
      !liga.trim() ||
      !fecha_nacimiento.trim()
    ) {
      setError("Todos los campos obligatorios (*) deben ser completados.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.crearJugadorLocal({
        ...formData,
        estatura: `${estatura} cm`,
        valor_mercado: `${valor_mercado} EUR`,
        foto_url: null, // Campo de foto nulo por defecto
      });

      if (response && response.status === "success") {
        setSuccess(
          `¡Jugador "${response.data.nombre}" registrado localmente con éxito! Ya puedes buscarlo por su nombre.`
        );
        setFormData({
          nombre: "",
          equipo: clubes.length > 0 ? clubes[0].nombre : "",
          posicion: posiciones.length > 0 ? posiciones[0].nombre : "",
          estatura: "",
          valor_mercado: "",
          fecha_nacimiento: "",
          liga: ligas.length > 0 ? ligas[0].nombre : "",
        });
      } else {
        throw new Error("No se pudo completar el registro.");
      }
    } catch (err) {
      setError(err.message || "Error al conectar con el servidor backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        maxWidth: "md",
        mx: "auto",
        width: "100%",
      }}
    >
      {/* Botón de regreso */}
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onGoBack}
          sx={{ color: "text.secondary", textTransform: "none", fontWeight: 700 }}
        >
          Volver al Buscador
        </Button>
      </Box>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 4, sm: 5, md: 6 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 6 }}>
            <PersonAddIcon color="primary" sx={{ fontSize: 38 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 950, letterSpacing: "-0.5px" }}>
                Registrar Futbolista Local
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mt: 0.5 }}>
                Completa los datos del futbolista para darlo de alta en la base de datos de Physio.AI
              </Typography>
            </Box>
          </Box>

          {/* Alertas */}
          {error && (
            <Alert severity="error" variant="outlined" sx={{ mb: 5, borderRadius: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" variant="outlined" sx={{ mb: 5, borderRadius: 3 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Sección de Campos de Datos (Izquierda y Centro) */}
              <Grid item xs={12} md={8}>
                <Grid container spacing={4}>
                  {/* Columna 1: Datos Personales (Nombre, Nacimiento con calendario, Estatura en CM) */}
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 900,
                        color: "primary.light",
                        mb: 3.5,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      Datos Personales
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <TextField
                        fullWidth
                        label="Nombre Completo *"
                        name="nombre"
                        placeholder="Ej. Cristiano Ronaldo"
                        value={formData.nombre}
                        onChange={handleChange}
                        disabled={loading}
                        InputProps={{
                          startAdornment: <PersonIcon sx={{ color: "text.secondary", mr: 1.5 }} />,
                        }}
                      />
                      
                      {/* Componente de Calendario Nativo */}
                      <TextField
                        fullWidth
                        type="date"
                        label="Fecha de Nacimiento *"
                        name="fecha_nacimiento"
                        InputLabelProps={{ shrink: true }}
                        value={formData.fecha_nacimiento}
                        onChange={handleChange}
                        disabled={loading}
                        InputProps={{
                          startAdornment: <CalendarIcon sx={{ color: "text.secondary", mr: 1.5 }} />,
                        }}
                      />

                      {/* Estatura en Centímetros (CM) */}
                      <TextField
                        fullWidth
                        type="number"
                        label="Estatura *"
                        name="estatura"
                        placeholder="Ej. 187"
                        value={formData.estatura}
                        onChange={handleChange}
                        disabled={loading}
                        inputProps={{ min: 50, max: 250 }}
                        InputProps={{
                          startAdornment: <RulerIcon sx={{ color: "text.secondary", mr: 1.5 }} />,
                          endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Columna 2: Datos Deportivos (Liga, Club condicional, Posición, Valor en Euros) */}
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 900,
                        color: "primary.light",
                        mb: 3.5,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      Datos Deportivos
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      
                      {/* Select Dropdown para Ligas */}
                      <FormControl fullWidth disabled={loading || loadingLigas}>
                        <InputLabel id="liga-label">Liga *</InputLabel>
                        <Select
                          labelId="liga-label"
                          name="liga"
                          value={formData.liga}
                          onChange={handleChange}
                          label="Liga *"
                        >
                          {loadingLigas ? (
                            <MenuItem value="">
                              <CircularProgress size={16} sx={{ mr: 1 }} /> Cargando ligas...
                            </MenuItem>
                          ) : (
                            ligas.map((league) => (
                              <MenuItem key={league.id} value={league.nombre}>
                                {league.nombre} {league.pais ? `(${league.pais})` : ""}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>

                      {/* Select Dropdown para Clubes (Filtrados por la Liga seleccionada) */}
                      <FormControl fullWidth disabled={loading || loadingClubes || loadingLigas}>
                        <InputLabel id="club-label">Equipo / Club *</InputLabel>
                        <Select
                          labelId="club-label"
                          name="equipo"
                          value={formData.equipo}
                          onChange={handleChange}
                          label="Equipo / Club *"
                        >
                          {loadingClubes ? (
                            <MenuItem value="">
                              <CircularProgress size={16} sx={{ mr: 1 }} /> Cargando clubes...
                            </MenuItem>
                          ) : clubes.length === 0 ? (
                            <MenuItem value="">
                              No hay clubes (agrégalos en PGadmin)
                            </MenuItem>
                          ) : (
                            clubes.map((club) => (
                              <MenuItem key={club.id} value={club.nombre}>
                                {club.nombre}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>

                      {/* Select Dropdown para Posiciones */}
                      <FormControl fullWidth disabled={loading || loadingPosiciones}>
                        <InputLabel id="posicion-label">Posición *</InputLabel>
                        <Select
                          labelId="posicion-label"
                          name="posicion"
                          value={formData.posicion}
                          onChange={handleChange}
                          label="Posición *"
                        >
                          {loadingPosiciones ? (
                            <MenuItem value="">
                              <CircularProgress size={16} sx={{ mr: 1 }} /> Cargando posiciones...
                            </MenuItem>
                          ) : (
                            posiciones.map((pos) => (
                              <MenuItem key={pos.id} value={pos.nombre}>
                                {pos.nombre}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>

                      {/* Valor de Mercado en Euros (€) */}
                      <TextField
                        fullWidth
                        label="Valor de Mercado *"
                        name="valor_mercado"
                        placeholder="Ej. 15M, 800K"
                        value={formData.valor_mercado}
                        onChange={handleChange}
                        disabled={loading}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">€</InputAdornment>,
                          endAdornment: <InputAdornment position="end">EUR</InputAdornment>,
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              {/* Sección Derecha: Caja Estilizada de Carga de Imagen */}
              <Grid item xs={12} md={4}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 900,
                    color: "primary.light",
                    mb: 3.5,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Foto Perfil
                </Typography>
                
                <Paper
                  variant="outlined"
                  sx={{
                    height: "calc(100% - 48px)",
                    minHeight: 250,
                    border: "2px dashed rgba(16, 185, 129, 0.25)",
                    borderRadius: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 4,
                    bgcolor: "rgba(16, 185, 129, 0.01)",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "rgba(16, 185, 129, 0.04)",
                      boxShadow: "0 0 15px rgba(16, 185, 129, 0.1)",
                    },
                  }}
                >
                  <UploadIcon color="primary" sx={{ fontSize: 44, mb: 2, opacity: 0.8 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
                    Cargar Imagen del Jugador
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", px: 2, lineHeight: 1.4 }}>
                    Arrastra una imagen aquí o haz clic para examinar archivos.
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5, fontSize: "0.7rem", opacity: 0.6 }}>
                    Soporta PNG, JPG o JPEG (Máx. 5MB)
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ my: 6, borderColor: "rgba(255, 255, 255, 0.05)" }} />

            {/* Acciones */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 3 }}>
              <Button
                variant="outlined"
                color="inherit"
                disabled={loading}
                onClick={onGoBack}
                sx={{ px: 4, py: 1.2, borderRadius: 3 }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || loadingLigas || loadingPosiciones || loadingClubes}
                sx={{ px: 6, py: 1.2, borderRadius: 3 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Guardar Futbolista"
                )}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
