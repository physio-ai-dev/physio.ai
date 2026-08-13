import { EntitySchema } from "typeorm";

const SearchLimitSchema = new EntitySchema({
  name: "SearchLimit",
  tableName: "anonymous_search_limits",
  columns: {
    identifier: {
      type: "varchar",
      length: 255,
      primary: true,
    },
    quantity: {
      type: "int",
      default: 0,
    },
    last_search: {
      type: "date",
    },
  },
});

export default SearchLimitSchema;
