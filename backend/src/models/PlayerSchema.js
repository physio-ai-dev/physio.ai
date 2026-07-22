import { EntitySchema } from "typeorm";

const PlayerSchema = new EntitySchema({
  name: "Jugador",
  tableName: "jugadores",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    api_id: {
      type: "int",
      unique: true,
    },
    nombre: {
      type: "varchar",
      length: 150,
    },
    equipo: {
      type: "varchar",
      length: 150,
    },
    edad: {
      type: "smallint",
      nullable: true,
    },
    posicion: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    foto_url: {
      type: "text",
      nullable: true,
    },
    fecha_nacimiento: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    liga: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
});

export default PlayerSchema;
