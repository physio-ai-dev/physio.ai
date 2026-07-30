import { EntitySchema } from "typeorm";

const ClubSchema = new EntitySchema({
  name: "Club",
  tableName: "clubes",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    nombre: {
      type: "varchar",
      length: 100,
      unique: true,
    },
  },
  relations: {
    liga: {
      target: "Liga",
      type: "many-to-one",
      joinColumn: { name: "liga_fk" },
      nullable: true,
    },
  },
});

export default ClubSchema;
