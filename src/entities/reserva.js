import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "Reserva",
  tableName: "reservas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    fecha_inicio: {
      type: "date"
    },
    fecha_fin: {
      type: "date"
    },
    estado: {
      type: "enum",
      enum: ["pendiente", "aceptada", "rechazada", "cancelada"],
      default: "pendiente"
    },
    fecha_solicitud: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP"
    }
  },
  relations: {
    propiedad: {
      type: "many-to-one",
      target: "Propiedad",
      joinColumn: { name: "propiedad_id" },
      onDelete: "CASCADE"
    },
    inquilino: {
      type: "many-to-one",
      target: "Usuario",
      joinColumn: { name: "inquilino_id" },
      onDelete: "CASCADE"
    }
  }
});
