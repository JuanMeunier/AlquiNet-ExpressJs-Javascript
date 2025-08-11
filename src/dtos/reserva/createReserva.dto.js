import Joi from 'joi';

export const createReviewDto = Joi.object({
    inquilino_id: Joi.number().integer().required(),
    propiedad_id: Joi.number().integer().required(),
    puntaje: Joi.number().integer().min(1).max(5).required(),
    comentario: Joi.string().max(500).optional(),
    fecha: Joi.date().optional()
});