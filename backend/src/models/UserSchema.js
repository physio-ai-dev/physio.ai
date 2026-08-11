import { EntitySchema } from "typeorm";

const UserSchema = new EntitySchema({
  name: "Usuario",
  tableName: "usuarios",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    username: {
      type: "varchar",
      length: 100,
      unique: true,
      nullable: false,
    },
    email: {
      type: "varchar",
      length: 255,
      unique: true,
      nullable: false,
    },
    password: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    dob: {
      type: "date",
      nullable: false,
    },
    rol: {
      type: "varchar",
      length: 50,
      default: "usuario",
    },
    subscription_tier: {
      type: "varchar",
      length: 50,
      default: "free",
    },
    stripe_customer_id: {
      type: "varchar",
      length: 255,
      nullable: true,
      unique: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
    },
    updated_at: {
      type: "timestamp",
      updateDate: true,
    },
  },
});

export default UserSchema;
