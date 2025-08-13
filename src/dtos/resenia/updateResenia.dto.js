import Joi from 'joi';

export const updateReseniaDto = Joi.object({
    puntaje: Joi.number().integer().min(1).max(5).optional(),
    comentario: Joi.string().max(500).optional()
});