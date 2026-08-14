import { useState, useEffect } from "react";
import {
  Box,
  Divider,
  Alert
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { api } from "../../api/backend";
import LoadingSpinner from "../Common/Layout/LoadingSpinner";
import ErrorAlert from "../Common/Feedback/ErrorAlert";
import GlassCard from "../Common/Layout/GlassCard";
import PageTitle from "../Common/Typography/PageTitle";

export default function TopSearchedPage({ onSelectPlayerClinical, onSelectPlayerPerformance }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clinicoData, setClinicoData] = useState([]);
  const [rendimientoData, setRendimientoData] = useState([]);

  useEffect(() => {
    const loadTopSearched = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getTopSearched();
        if (res.status === "success" && res.data) {
          const mapData = (list) =>
            (list || []).map((item) => ({
              id: item.id,
              name: item.name,
              club: item.club || "Sin club",
              displayLabel: item.club ? `${item.name} (${item.club})` : `${item.name} (Sin club)`,
              busquedas: item.searchCount || 0,
            }));

          setClinicoData(mapData(res.data.clinico));
          setRendimientoData(mapData(res.data.rendimiento));
        }
      } catch (err) {
        setError(err.message || "Error al obtener el top de búsquedas.");
      } finally {
        setLoading(false);
      }
    };

    loadTopSearched();
  }, []);

  const handleBarClick = (item, type) => {
    if (!item || !item.payload) return;
    const player = {
      id: item.payload.id,
      nombre: item.payload.name,
      equipo: item.payload.club,
    };
    if (type === "clinico" && onSelectPlayerClinical) {
      onSelectPlayerClinical(player);
    } else if (type === "rendimiento" && onSelectPlayerPerformance) {
      onSelectPlayerPerformance(player);
    }
  };

  if (loading) {
    return <LoadingSpinner py={8} />;
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <PageTitle
        title="Top 10 Jugadores Más Buscados"
        subtitle="Análisis de popularidad consolidado en tiempo real. Haz clic en la barra de cualquier jugador para navegar de inmediato a su perfil."
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <GlassCard>
          <Box sx={{ p: 3 }}>
            <PageTitle title="Buscador Clínico" sx={{ mb: 2 }} />
            <Divider sx={{ mb: 3, borderColor: "rgba(255, 255, 255, 0.06)" }} />
            {clinicoData.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Aún no se registran búsquedas en el buscador clínico.
              </Alert>
            ) : (
              <Box sx={{ width: "100%", height: 450 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={clinicoData}
                    margin={{ top: 15, right: 5, left: -20, bottom: 95 }}
                  >
                    <defs>
                      <linearGradient id="gradClinico" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#047857" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                    <XAxis
                      dataKey="displayLabel"
                      tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 9, fontWeight: 700 }}
                      interval={0}
                      angle={-35}
                      textAnchor="end"
                    />
                    <YAxis allowDecimals={false} tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 10 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
                      contentStyle={{
                        backgroundColor: "rgba(11, 21, 40, 0.95)",
                        borderColor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: 8
                      }}
                    />
                    <Bar
                      dataKey="busquedas"
                      name="Búsquedas"
                      fill="url(#gradClinico)"
                      radius={[4, 4, 0, 0]}
                      onClick={(item) => handleBarClick(item, "clinico")}
                      style={{ cursor: "pointer" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Box>
        </GlassCard>

        <GlassCard>
          <Box sx={{ p: 3 }}>
            <PageTitle title="Buscador de Rendimiento" sx={{ mb: 2 }} />
            <Divider sx={{ mb: 3, borderColor: "rgba(255, 255, 255, 0.06)" }} />
            {rendimientoData.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 3 }}>
                Aún no se registran búsquedas en el buscador de rendimiento.
              </Alert>
            ) : (
              <Box sx={{ width: "100%", height: 450 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={rendimientoData}
                    margin={{ top: 15, right: 5, left: -20, bottom: 95 }}
                  >
                    <defs>
                      <linearGradient id="gradRendimiento" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.04)" />
                    <XAxis
                      dataKey="displayLabel"
                      tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 9, fontWeight: 700 }}
                      interval={0}
                      angle={-35}
                      textAnchor="end"
                    />
                    <YAxis allowDecimals={false} tick={{ fill: "rgba(255, 255, 255, 0.5)", fontSize: 10 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
                      contentStyle={{
                        backgroundColor: "rgba(11, 21, 40, 0.95)",
                        borderColor: "rgba(255, 255, 255, 0.08)",
                        borderRadius: 8
                      }}
                    />
                    <Bar
                      dataKey="busquedas"
                      name="Búsquedas"
                      fill="url(#gradRendimiento)"
                      radius={[4, 4, 0, 0]}
                      onClick={(item) => handleBarClick(item, "rendimiento")}
                      style={{ cursor: "pointer" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Box>
        </GlassCard>
      </Box>
    </Box>
  );
}
