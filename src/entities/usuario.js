import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "Usuario",
  tableName: "usuarios",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    nombre: {
      type: "varchar",
      length: 100
    },
    email: {
      type: "varchar",
      unique: true
    },
    contraseña: {
      type: "varchar"
    },
    rol: {
      type: "enum",
      enum: ["admin", "propietario", "inquilino"],
      default: "inquilino"
    },
    fecha_registro: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP"
    },
    estado_cuenta: {
      type: "boolean",
      default: true
    }
  },
  relations: {
    propiedades: {
      type: "one-to-many",
      target: "Propiedad",
      inverseSide: "propietario"
    },
    reservas: {
      type: "one-to-many",
      target: "Reserva",
      inverseSide: "inquilino"
    },
    reseñas: {
      type: "one-to-many",
      target: "Reseña",
      inverseSide: "inquilino"
    }
  }
});
