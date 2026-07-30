import { EntitySchema } from "typeorm";

const LeagueSchema = new EntitySchema({
  name: "Liga",
  tableName: "ligas",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 100,
    },
    pais: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
  },
});

export default LeagueSchema;
