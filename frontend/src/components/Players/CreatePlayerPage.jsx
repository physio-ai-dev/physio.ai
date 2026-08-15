import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
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
  Straighten as RulerIcon,
  CalendarMonth as CalendarIcon,
  CloudUpload as UploadIcon,
} from "@mui/icons-material";
import { api } from "../../api/backend";
import LoadingSpinner from "../Common/Layout/LoadingSpinner";
import ErrorAlert from "../Common/Feedback/ErrorAlert";
import GlassCard from "../Common/Layout/GlassCard";
import ActionButton from "../Common/Buttons/ActionButton";
import PageTitle from "../Common/Typography/PageTitle";

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

  const [leagues, setLeagues] = useState([]);
  const [positions, setPositions] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);
  const [loadingPositions, setLoadingPositions] = useState(true);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // 1. Cargar ligas y posiciones dinámicas desde la base de datos
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const res = await api.getLeagues();
        if (res && res.status === "success" && Array.isArray(res.data)) {
          setLeagues(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, liga: res.data[0].name }));
          }
        }
      } catch (err) {
        console.error("Error al cargar catálogo de ligas:", err);
        setError("No se pudo conectar con el catálogo de ligas.");
      } finally {
        setLoadingLeagues(false);
      }
    };

    const fetchPositions = async () => {
      try {
        const res = await api.getPositions();
        if (res && res.status === "success" && Array.isArray(res.data)) {
          setPositions(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, posicion: res.data[0].name }));
          }
        }
      } catch (err) {
        console.error("Error al cargar catálogo de posiciones:", err);
        setError("No se pudo conectar con el catálogo de posiciones.");
      } finally {
        setLoadingPositions(false);
      }
    };

    fetchLeagues();
    fetchPositions();
  }, []);

  // 2. Cargar clubes filtrados por la liga seleccionada
  useEffect(() => {
    if (!formData.liga) return;

    const fetchClubs = async () => {
      setLoadingClubs(true);
      try {
        const res = await api.getClubs(formData.liga);
        if (res && res.status === "success" && Array.isArray(res.data)) {
          setClubs(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, equipo: res.data[0].name }));
          } else {
            setFormData((prev) => ({ ...prev, equipo: "" }));
          }
        }
      } catch (err) {
        console.error("Error al cargar clubes de la liga:", err);
      } finally {
        setLoadingClubs(false);
      }
    };

    fetchClubs();
  }, [formData.liga]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const {
      nombre,
      equipo,
      posicion,
      estatura,
      valor_mercado,
      liga,
      fecha_nacimiento,
    } = formData;
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
      const response = await api.createLocalPlayer({
        ...formData,
        estatura: `${estatura} cm`,
        valor_mercado: `${valor_mercado} EUR`,
        foto_url: null, // Campo de foto nulo por defecto
      });

      if (response && response.status === "success") {
        setSuccess(
          `¡Jugador "${response.data.name || response.data.nombre}" registrado localmente con éxito! Ya puedes buscarlo por su nombre.`,
        );
        setFormData({
          nombre: "",
          equipo: clubs.length > 0 ? clubs[0].name : "",
          posicion: positions.length > 0 ? positions[0].name : "",
          estatura: "",
          valor_mercado: "",
          fecha_nacimiento: "",
          liga: leagues.length > 0 ? leagues[0].name : "",
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
        <ActionButton
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onGoBack}
          sx={{
            color: "text.secondary",
            textTransform: "none",
            fontWeight: 700,
            borderColor: "transparent",
            boxShadow: "none",
            bgcolor: "transparent",
            "&:hover": {
              borderColor: "rgba(255, 255, 255, 0.08)",
              bgcolor: "rgba(255, 255, 255, 0.02)",
              boxShadow: "none",
            },
          }}
        >
          Volver al Buscador
        </ActionButton>
      </Box>

      <GlassCard>
        <Box sx={{ p: { xs: 4, sm: 5, md: 6 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 6 }}>
            <PersonAddIcon color="primary" sx={{ fontSize: 38 }} />
            <Box>
              <PageTitle
                title="Registrar Futbolista Local"
                subtitle="Completa los datos del futbolista para darlo de alta en la base de datos de Physio.AI"
                sx={{ mb: 0 }}
              />
            </Box>
          </Box>

          {/* Alertas */}
          <ErrorAlert message={error} sx={{ mb: 5 }} />
          {success && (
            <Alert
              severity="success"
              variant="outlined"
              sx={{ mb: 5, borderRadius: 3 }}
            >
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
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 4 }}
                    >
                      <TextField
                        fullWidth
                        label="Nombre Completo *"
                        name="nombre"
                        placeholder="Ej. Leo Messi"
                        value={formData.nombre}
                        onChange={handleChange}
                        disabled={loading}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <PersonIcon
                                sx={{ color: "text.secondary", mr: 1.5 }}
                              />
                            ),
                          },
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
                        slotProps={{
                          input: {
                            startAdornment: (
                              <CalendarIcon
                                sx={{ color: "text.secondary", mr: 1.5 }}
                              />
                            ),
                          },
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
                        slotProps={{
                          input: {
                            startAdornment: (
                              <RulerIcon
                                sx={{ color: "text.secondary", mr: 1.5 }}
                              />
                            ),
                            endAdornment: (
                              <InputAdornment position="end">cm</InputAdornment>
                            ),
                          },
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
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 4 }}
                    >
                      {/* Select Dropdown para Ligas */}
                      <FormControl
                        fullWidth
                        disabled={loading || loadingLeagues}
                      >
                        <InputLabel id="liga-label">Liga *</InputLabel>
                        <Select
                          labelId="liga-label"
                          name="liga"
                          value={formData.liga}
                          onChange={handleChange}
                          label="Liga *"
                        >
                          {loadingLeagues ? (
                            <MenuItem value="">
                              <CircularProgress size={16} sx={{ mr: 1 }} />{" "}
                              Cargando ligas...
                            </MenuItem>
                          ) : (
                            leagues.map((league) => (
                              <MenuItem key={league.id} value={league.name}>
                                {league.name}{" "}
                                {league.country ? `(${league.country})` : ""}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>

                      {/* Select Dropdown para Clubes (Filtrados por la Liga seleccionada) */}
                      <FormControl
                        fullWidth
                        disabled={loading || loadingClubs || loadingLeagues}
                      >
                        <InputLabel id="club-label">Equipo / Club *</InputLabel>
                        <Select
                          labelId="club-label"
                          name="equipo"
                          value={formData.equipo}
                          onChange={handleChange}
                          label="Equipo / Club *"
                        >
                          {loadingClubs ? (
                            <MenuItem value="">
                              <CircularProgress size={16} sx={{ mr: 1 }} />{" "}
                              Cargando clubes...
                            </MenuItem>
                          ) : clubs.length === 0 ? (
                            <MenuItem value="">
                              No hay clubes (agrégalos en PGadmin)
                            </MenuItem>
                          ) : (
                            clubs.map((club) => (
                              <MenuItem key={club.id} value={club.name}>
                                {club.name}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>

                      {/* Select Dropdown para Posiciones */}
                      <FormControl
                        fullWidth
                        disabled={loading || loadingPositions}
                      >
                        <InputLabel id="posicion-label">Posición *</InputLabel>
                        <Select
                          labelId="posicion-label"
                          name="posicion"
                          value={formData.posicion}
                          onChange={handleChange}
                          label="Posición *"
                        >
                          {loadingPositions ? (
                            <MenuItem value="">
                              <CircularProgress size={16} sx={{ mr: 1 }} />{" "}
                              Cargando posiciones...
                            </MenuItem>
                          ) : (
                            positions.map((pos) => (
                              <MenuItem key={pos.id} value={pos.name}>
                                {pos.name}
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
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                €
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                EUR
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              {/* Caja de Imagen */}
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
                  <UploadIcon
                    color="primary"
                    sx={{ fontSize: 44, mb: 2, opacity: 0.8 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
                  >
                    Cargar Imagen del Jugador
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", px: 2, lineHeight: 1.4 }}
                  >
                    Arrastra una imagen aquí o haz clic para examinar archivos.
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mt: 1.5,
                      fontSize: "0.7rem",
                      opacity: 0.6,
                    }}
                  >
                    Soporta PNG, JPG o JPEG (Máx. 5MB)
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Divider sx={{ my: 6, borderColor: "rgba(255, 255, 255, 0.05)" }} />

            {/* Acciones */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 3 }}>
              <ActionButton
                variant="outlined"
                disabled={loading}
                onClick={onGoBack}
                sx={{
                  px: 4,
                  py: 1.2,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  color: "text.secondary",
                  boxShadow: "none",
                  bgcolor: "transparent",
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    bgcolor: "rgba(255, 255, 255, 0.02)",
                    boxShadow: "none",
                  },
                }}
              >
                Cancelar
              </ActionButton>
              <ActionButton
                type="submit"
                disabled={
                  loading || loadingLeagues || loadingPositions || loadingClubs
                }
                sx={{ px: 6, py: 1.2 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Guardar Futbolista"
                )}
              </ActionButton>
            </Box>
          </Box>
        </Box>
      </GlassCard>
    </Box>
  );
}
