import express from 'express';
import router from './routes/index.routes.js';
import userRouter from './routes/userRoutes.js';
import authRoutes from './middlewares/authRoutes.js';


const app = express();

// Rutas
app.use('/', router);
app.use('/users', userRouter);
app.use('/auth', authRoutes);

// Middlewares de Errores Globales
app.use((err, req, res, next) => {
    console.error(err);

    if (err.name === 'NotFoundError') {
        return res.status(404).json({ success: false, message: err.message });
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: err.message, details: err.details });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

export default app;