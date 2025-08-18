// src/middlewares/rateLimiter.js
import { client, isRedisConnected } from '../config/redis.js';

/**
 * Crear un rate limiter simple
 * @param {number} maxRequests - Máximo número de requests
 * @param {number} windowMinutes - Ventana de tiempo en minutos
 */
function createRateLimiter(maxRequests = 100, windowMinutes = 15) {

    return async (req, res, next) => {
        // Si Redis no está conectado, permitir todas las requests
        if (!isRedisConnected()) {
            console.log('⚠️ Redis no conectado, saltando rate limiting');
            return next();
        }

        try {
            // Obtener la IP del usuario
            const userIP = req.ip || req.connection.remoteAddress;

            // Crear una clave única para esta IP
            const key = `rate_limit:${userIP}`;

            // Verificar cuántas requests ha hecho
            const current = await client.get(key);
            const currentCount = current ? parseInt(current) : 0;

            // Si ya excedió el límite
            if (currentCount >= maxRequests) {
                return res.status(429).json({
                    success: false,
                    message: `Demasiadas solicitudes. Límite: ${maxRequests} por ${windowMinutes} minutos`,
                    limite: maxRequests,
                    tiempo_espera_minutos: windowMinutes
                });
            }

            // Incrementar el contador
            if (currentCount === 0) {
                // Primera request, establecer el contador con expiración
                await client.setEx(key, windowMinutes * 60, 1);
            } else {
                // Incrementar el contador existente
                await client.incr(key);
            }

            // Agregar headers informativos
            res.set({
                'X-RateLimit-Limit': maxRequests,
                'X-RateLimit-Remaining': maxRequests - (currentCount + 1),
                'X-RateLimit-Reset': new Date(Date.now() + (windowMinutes * 60 * 1000))
            });

            console.log(`🚦 Rate limit - IP: ${userIP}, Requests: ${currentCount + 1}/${maxRequests}`);

            next();
        } catch (error) {
            console.error('❌ Error en rate limiting:', error.message);
            // En caso de error, permitir la request
            next();
        }
    };
}

// Rate limiters predefinidos para diferentes casos

// Rate limiter general - 100 requests por 15 minutos
export const generalLimiter = createRateLimiter(100, 15);

// Rate limiter estricto para login - 5 intentos por 15 minutos
export const authLimiter = createRateLimiter(5, 15);

// Rate limiter para creación de contenido - 20 por hora
export const createLimiter = createRateLimiter(20, 60);

// Exportar la función para crear limiters personalizados
export { createRateLimiter };