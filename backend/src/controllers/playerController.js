import { ILike } from "typeorm";
import AppDataSource from "../config/database.js";
import PlayerSchema from "../models/PlayerSchema.js";
import InjurySchema from "../models/InjurySchema.js";
import { searchPlayerFromAPI } from "../services/footballApiService.js";
import { analyzeInjuryWithGemini } from "../services/geminiService.js";

export const searchPlayer = async (req, res) => {
  const { name } = req.query;

  try {
    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({
          status: "error",
          message: "El nombre del jugador es requerido.",
        });
    }

    const playerRepository = AppDataSource.getRepository(PlayerSchema);
    const injuryRepository = AppDataSource.getRepository(InjurySchema);

    // 1. Búsqueda local flexible por coincidencia parcial (Case Insensitive)
    let jugador = await playerRepository.findOne({
      where: { nombre: ILike(`%${name}%`) },
    });

    // 2. Si no existe en Postgres con ese nombre, consultamos la API Externa
    if (!jugador) {
      console.log(`🔍 Buscando a "${name}" en la API externa...`);
      const apiResponse = await searchPlayerFromAPI(name);

      if (!apiResponse || apiResponse.length === 0) {
        return res
          .status(404)
          .json({
            status: "error",
            message: "No se encontró ningún futbolista con ese nombre.",
          });
      }

      const datosApi = apiResponse[0];

      // Escudo definitivo: Validar por api_id antes de intentar el INSERT
      jugador = await playerRepository.findOne({
        where: { api_id: datosApi.player.id },
      });

      // Si realmente es un jugador nuevo en nuestro ecosistema, lo guardamos
      if (!jugador) {
        const nuevoJugador = playerRepository.create({
          api_id: datosApi.player.id,
          nombre: datosApi.player.name,
          equipo: datosApi.statistics?.[0]?.team?.name || "Desconocido",
          edad: datosApi.player.age || null,
          posicion: datosApi.statistics?.[0]?.games?.position || null,
          foto_url: datosApi.player.photo || null,
        });

        jugador = await playerRepository.save(nuevoJugador);
      }
    }

    // ==========================================
    // 🚀 AUTOMATIZACIÓN DE PARÁMETROS CLÍNICOS
    // ==========================================
    const tipoLesion = jugador.nombre.toLowerCase().includes("pedri")
      ? "Lesión en el recto anterior del muslo derecho"
      : "Esguince de tobillo grado II";

    const diasEstimadosClub = jugador.nombre.toLowerCase().includes("pedri")
      ? 35
      : 21;

    // 3. Consultar a Gemini Engine usando tu modelo configurado
    console.log(
      `🧠 Conectando con Gemini Engine para evaluar a: ${jugador.nombre}...`,
    );
    const resultadoIa = await analyzeInjuryWithGemini(
      tipoLesion,
      diasEstimadosClub,
    );

    // 4. Registrar la auditoría médica en Postgres
    const nuevaLesion = injuryRepository.create({
      jugador_id: jugador.id,
      tipo_lesion: tipoLesion,
      dias_estimados_club: diasEstimadosClub,
      tiempo_clinico_ia: resultadoIa.tiempo_clinico_ia,
      analisis_comparativo: resultadoIa.analisis_comparativo,
      estado: "En Recuperación",
    });

    await injuryRepository.save(nuevaLesion);

    // 5. Respuesta final estructurada hacia tu frontend
    return res.status(200).json({
      status: "success",
      count: 1,
      data: [
        {
          id: jugador.id,
          api_id: jugador.api_id,
          nombre: jugador.nombre,
          equipo: jugador.equipo,
          edad: jugador.edad,
          posicion: jugador.posicion,
          foto_url: jugador.foto_url,
          created_at: jugador.created_at,
          reporte_ia: {
            tipo_lesion: tipoLesion,
            dias_estimados_club: diasEstimadosClub,
            tiempo_clinico_ia: resultadoIa.tiempo_clinico_ia,
            analisis_comparativo: resultadoIa.analisis_comparativo,
          },
        },
      ],
    });
  } catch (error) {
    console.error("Error en el flujo automatizado del controlador:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};
