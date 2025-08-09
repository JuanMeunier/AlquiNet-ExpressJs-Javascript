import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "Propiedad",
  tableName: "propiedades",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    titulo: {
      type: "varchar",
      length: 150
    },
    descripcion: {
      type: "text"
    },
    ubicacion: {
      type: "json" // provincia, ciudad, dirección
    },
    precio: {
      type: "decimal"
    },
    tipo: {
      type: "varchar",
      length: 50
    },
    disponibilidad: {
      type: "boolean",
      default: true
    },
    fecha_publicacion: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP"
    },
    imagenes: {
      type: "text",
      nullable: true
    }
  },
  relations: {
    propietario: {
      type: "many-to-one",
      target: "Usuario",
      joinColumn: { name: "propietario_id" },
      onDelete: "CASCADE"
    },
    reservas: {
      type: "one-to-many",
      target: "Reserva",
      inverseSide: "propiedad"
    },
    reseñas: {
      type: "one-to-many",
      target: "Reseña",
      inverseSide: "propiedad"
    }
  }
});
