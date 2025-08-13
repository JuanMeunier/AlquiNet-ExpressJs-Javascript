import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "Resenia",
  tableName: "reseñas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    puntaje: {
      type: "int"
    },
    comentario: {
      type: "text"
    },
    fecha: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP"
    }
  },
  relations: {
    inquilino: {
      type: "many-to-one",
      target: "Usuario",
      joinColumn: { name: "inquilino_id" },
      onDelete: "CASCADE"
    },
    propiedad: {
      type: "many-to-one",
      target: "Propiedad",
      joinColumn: { name: "propiedad_id" },
      onDelete: "CASCADE"
    }
  }
});
