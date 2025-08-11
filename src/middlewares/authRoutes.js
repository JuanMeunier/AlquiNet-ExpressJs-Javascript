import { Router } from 'express';
import { login, register } from '../controllers/auth.controller.js';
import { validateDto } from './validateDto.js';

const authRoutes = Router();

authRoutes.post('/register', validateDto, register);
authRoutes.post('/login', validateDto, login);

export default router;
