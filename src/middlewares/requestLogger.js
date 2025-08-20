// src/middlewares/requestLogger.js
import logger from '../config/logger.js';

// Middleware simple para loggear requests
export const requestLogger = (req, res, next) => {
    // Loggear la request
    logger.info(`${req.method} ${req.url}`);
    next();
};

// Middleware simple para errores
export const errorLogger = (err, req, res, next) => {
    logger.error(`Error en ${req.method} ${req.url}`, err);
    next(err);
};