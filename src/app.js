import express from 'express';
import router from './routes/index.routes.js';
import userRouter from './routes/userRoutes.js';
import authRoutes from './middlewares/authRoutes.js';


const app = express();

// Rutas
app.use('/', router);
app.use('/users', userRouter);
app.use('/auth', authRoutes);

export default app;