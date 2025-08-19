import express from 'express';
import userRouter from './routes/userRoutes.js';
import propiedadRouter from './routes/propiedadRoutes.js';
import reservaRouter from './routes/reservaRoutes.js';
import reseniaRouter from './routes/reseniaRoutes.js';
import authRoutes from './middlewares/authRoutes.js';
import { specs, swaggerUi } from './config/swagger.js';
import { generalLimiter, authLimiter } from './middlewares/rateLimiter.js';



const app = express();


// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Doc
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AlquiNet API Documentation',
    customfavIcon: '/favicon.ico'
}));

// Rate limiting global - aplicar a todas las rutas
app.use(generalLimiter);// Rate limiting global - aplicar a todas las rutas


// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenido a AlquiNet API',
        version: '1.0.0',
        documentation: '/api-docs',
        endpoints: {
            auth: '/auth',
            users: '/users',
            propiedades: '/api/propiedades',
            reservas: '/api/reservas',
            resenias: '/api/resenias'
        }
    });
});



// Rutas
app.use('/users', userRouter);
app.use('/api/propiedades', propiedadRouter);
app.use('/api/reservas', reservaRouter);
app.use('/api/resenias', reseniaRouter);
app.use('/auth', authLimiter, authRoutes);

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