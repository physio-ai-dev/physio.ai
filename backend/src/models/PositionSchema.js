import { EntitySchema } from "typeorm";

const PositionSchema = new EntitySchema({
  name: "Position",
  tableName: "positions",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    name: {
      type: "varchar",
      length: 50,
      unique: true,
    },
  },
});

export default PositionSchema;
