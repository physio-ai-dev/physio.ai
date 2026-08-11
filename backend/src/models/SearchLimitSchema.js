import { EntitySchema } from "typeorm";

const SearchLimitSchema = new EntitySchema({
  name: "SearchLimit",
  tableName: "limite_busquedas_anonimas",
  columns: {
    identificador: {
      type: "varchar",
      length: 255,
      primary: true,
    },
    cantidad: {
      type: "int",
      default: 0,
    },
    ultima_busqueda: {
      type: "date",
    },
  },
});

export default SearchLimitSchema;
