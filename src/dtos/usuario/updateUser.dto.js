import Joi from 'joi';

export const updateUserDto = Joi.object({
    nombre: Joi.string().min(3).max(50).optional(),
    email: Joi.string().email().optional(),
    contraseña: Joi.string().min(6).optional(),
    rol: Joi.string().valid('admin', 'propietario', 'inquilino').optional(),
    estado_cuenta: Joi.string().valid('activo', 'inactivo', 'suspendido').optional()
});