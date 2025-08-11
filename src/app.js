import express from 'express';
import router from './routes/index.routes.js';
import userRouter from './routes/userRoutes.js';


const app = express();

// Rutas
app.use('/', router);
app.use('/users', userRouter);


export default app;