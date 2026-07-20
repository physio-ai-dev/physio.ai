import { EntitySchema } from "typeorm";

const InjurySchema = new EntitySchema({
  name: "Lesion",
  tableName: "lesiones",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    jugador_id: {
      type: "int",
    },
    tipo_lesion: {
      type: "varchar",
      length: 255,
    },
    dias_estimados_club: {
      type: "int",
    },
    tiempo_clinico_ia: {
      type: "int",
      nullable: true,
    },
    analisis_comparativo: {
      type: "text",
      nullable: true,
    },
    estado: {
      type: "varchar",
      length: 50,
      default: "En Recuperación",
    },
    fecha_registro: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    jugador: {
      type: "many-to-one",
      target: "Jugador",
      joinColumn: { name: "jugador_id" },
      onDelete: "CASCADE",
    },
  },
});

export default InjurySchema;
