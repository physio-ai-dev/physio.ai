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
      nullable: true,
    },
    nombre: {
      type: "varchar",
      length: 150,
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
    estatura: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    valor_mercado: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    club: {
      target: "Club",
      type: "many-to-one",
      joinColumn: { name: "club_fk" },
      nullable: true,
    },
    posicion: {
      target: "Posicion",
      type: "many-to-one",
      joinColumn: { name: "posicion_fk" },
      nullable: true,
    },
  },
});

export default PlayerSchema;
