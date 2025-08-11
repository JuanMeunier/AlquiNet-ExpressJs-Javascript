import Joi from 'joi';

export const updateReservationDto = Joi.object({
    fecha_inicio: Joi.date().optional(),
    fecha_fin: Joi.date().greater(Joi.ref('fecha_inicio')).optional(),
    estado: Joi.string().valid('pendiente', 'aceptada', 'rechazada', 'cancelada').optional()
});