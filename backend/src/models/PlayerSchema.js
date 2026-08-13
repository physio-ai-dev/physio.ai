import { EntitySchema } from "typeorm";

const PlayerSchema = new EntitySchema({
  name: "Player",
  tableName: "players",
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
    name: {
      type: "varchar",
      length: 150,
    },
    photo_url: {
      type: "text",
      nullable: true,
    },
    birthdate: {
      type: "date",
      nullable: true,
    },
    height: {
      type: "varchar",
      length: 50,
      nullable: true,
    },
    market_value: {
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
      joinColumn: { name: "club_id" },
      nullable: true,
    },
    position: {
      target: "Position",
      type: "many-to-one",
      joinColumn: { name: "position_id" },
      nullable: true,
    },
  },
});

export default PlayerSchema;
