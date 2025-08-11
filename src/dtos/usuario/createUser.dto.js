import Joi from 'joi';

export const createUserDto = Joi.object({
    nombre: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    contraseña: Joi.string().min(6).required(),
    rol: Joi.string().valid('admin', 'propietario', 'inquilino').required(),
    fecha_registro: Joi.date().optional(),
    estado_cuenta: Joi.string().valid('activo', 'inactivo', 'suspendido').optional()
});