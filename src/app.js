import express from 'express';
import router from './routes/index.routes.js';
import logger from './middlewares/logger.middleware.js';

const app = express();

// Middleware para manejar JSON
app.use(express.json());

// Middleware de ejemplo para logs
app.use(logger);

// Rutas
app.use('/', router);

export default app;