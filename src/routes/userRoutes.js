import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { validateDto } from '../middlewares/validateDto.js';
import { createUserDto } from '../dtos/usuario/createUser.dto.js';
import { updateUserDto } from '../dtos/usuario/updateUser.dto.js';
import { authorizeRoles } from '../middlewares/auth.middleware.js';

const userRouter = Router();
const userController = new UserController();


userRouter.post('/', validateDto(createUserDto), (req, res) => userController.create(req, res));
userRouter.get('/', (req, res) => userController.findAll(req, res));
userRouter.get('/:id', (req, res) => userController.findOne(req, res));
userRouter.get('/:id/propiedades', (req, res) => userController.getPropiedadesByUserId(req, res));
userRouter.put('/:id', validateDto(updateUserDto), (req, res) => userController.update(req, res));
userRouter.delete('/:id', (req, res) => userController.remove(req, res));

export default userRouter;