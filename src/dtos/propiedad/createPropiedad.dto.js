import Joi from 'joi';

export const createPropertyDto = Joi.object({
  propietario_id: Joi.number().integer().required(),
  titulo: Joi.string().min(5).max(100).required(),
  descripcion: Joi.string().max(1000).optional(),
  ubicacion: Joi.object({
    provincia: Joi.string().required(),
    ciudad: Joi.string().required(),
    direccion: Joi.string().required()
  }).required(),
  precio: Joi.number().positive().required(),
  tipo: Joi.string().valid('casa', 'departamento', 'ph', 'otro').required(),
  disponibilidad: Joi.boolean().default(true),
  fecha_publicacion: Joi.date().optional(),
  imagenes: Joi.array().items(Joi.string().uri()).optional()
});