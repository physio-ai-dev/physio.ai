import { EntitySchema } from "typeorm";

const LeagueSchema = new EntitySchema({
  name: "League",
  tableName: "leagues",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    name: {
      type: "varchar",
      length: 100,
      unique: true,
    },
    country: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
  },
});

export default LeagueSchema;
