import { EntitySchema } from "typeorm";

const PositionSchema = new EntitySchema({
  name: "Posicion",
  tableName: "posiciones",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 50,
      unique: true,
    },
  },
});

export default PositionSchema;
