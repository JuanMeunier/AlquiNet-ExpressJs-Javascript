import Joi from 'joi';

export const createReservationDto = Joi.object({
  propiedad_id: Joi.number().integer().required(),
  inquilino_id: Joi.number().integer().required(),
  fecha_inicio: Joi.date().required(),
  fecha_fin: Joi.date().greater(Joi.ref('fecha_inicio')).required(),
  estado: Joi.string().valid('pendiente', 'aceptada', 'rechazada', 'cancelada').default('pendiente'),
  fecha_solicitud: Joi.date().optional()
});
