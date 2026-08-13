import { EntitySchema } from "typeorm";

const SearchSchema = new EntitySchema({
  name: "Search",
  tableName: "searches",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    user_id: {
      type: "int",
      nullable: true,
    },
    player_id: {
      type: "int",
    },
    search_type: {
      type: "varchar",
      length: 50,
      default: "clinico",
    },
    search_date: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
      onDelete: "CASCADE",
      nullable: true,
    },
    player: {
      type: "many-to-one",
      target: "Player",
      joinColumn: { name: "player_id" },
      onDelete: "CASCADE",
    },
  },
});

export default SearchSchema;
