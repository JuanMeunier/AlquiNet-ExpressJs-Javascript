import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { validateDto } from '../middlewares/validateDto.js';
import createUserDto from '../dtos/usuario/createUser.dto.js';
import updateUserDto from '../dtos/usuario/updateUser.dto.js';

const userRouter = Router();
const userController = new UserController();

// Crear usuario
userRouter.post('/', validateDto(createUserDto), (req, res) => userController.create(req, res));

// Listar todos
userRouter.get('/', (req, res) => userController.findAll(req, res));

// Obtener por ID
userRouter.get('/:id', (req, res) => userController.findOne(req, res));

// Obtener propiedades por ID de usuario
userRouter.get('/:id/propiedades', (req, res) => userController.getPropiedadesByUserId(req, res));

// Actualizar usuario
userRouter.put('/:id', validateDto(updateUserDto), (req, res) => userController.update(req, res));

// Eliminar usuario
userRouter.delete('/:id', (req, res) => userController.remove(req, res));

export default userRouter;