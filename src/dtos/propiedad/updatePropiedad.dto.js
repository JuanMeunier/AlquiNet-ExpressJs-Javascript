import Joi from 'joi';

export const updatePropertyDto = Joi.object({
  titulo: Joi.string().min(5).max(100).optional(),
  descripcion: Joi.string().max(1000).optional(),
  ubicacion: Joi.object({
    provincia: Joi.string().optional(),
    ciudad: Joi.string().optional(),
    direccion: Joi.string().optional()
  }).optional(),
  precio: Joi.number().positive().optional(),
  tipo: Joi.string().valid('casa', 'departamento', 'ph', 'otro').optional(),
  disponibilidad: Joi.boolean().optional(),
  imagenes: Joi.array().items(Joi.string().uri()).optional()
});