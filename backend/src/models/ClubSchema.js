import { EntitySchema } from "typeorm";

const ClubSchema = new EntitySchema({
  name: "Club",
  tableName: "clubs",
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
  },
  relations: {
    league: {
      target: "League",
      type: "many-to-one",
      joinColumn: { name: "league_id" },
      nullable: true,
    },
  },
});

export default ClubSchema;
