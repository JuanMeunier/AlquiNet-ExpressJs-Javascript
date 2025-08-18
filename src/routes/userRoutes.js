import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { validateDto } from '../middlewares/validateDto.js';
import { createUserDto } from '../dtos/usuario/createUser.dto.js';
import { updateUserDto } from '../dtos/usuario/updateUser.dto.js';
import { authorizeRoles, authenticate } from '../middlewares/auth.middleware.js';


const userRouter = Router();
const userController = new UserController();

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: Crear un nuevo usuario
 *     description: Crea un nuevo usuario en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - contraseña
 *               - rol
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: "María García"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "maria@email.com"
 *               contraseña:
 *                 type: string
 *                 minLength: 6
 *                 example: "password123"
 *               rol:
 *                 type: string
 *                 enum: [admin, propietario, inquilino]
 *                 example: "propietario"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 */
userRouter.post('/', validateDto(createUserDto), (req, res) => userController.create(req, res));

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener todos los usuarios
 *     description: Retorna una lista de todos los usuarios registrados
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       500:
 *         description: Error interno del servidor
 */
userRouter.get('/', authorizeRoles('admin'), (req, res) => userController.findAll(req, res));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener usuario por ID
 *     description: Retorna un usuario específico por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
userRouter.get('/:id', authorizeRoles('admin'), (req, res) => userController.findOne(req, res));

/**
 * @swagger
 * /users/{id}/propiedades:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Obtener propiedades de un usuario
 *     description: Retorna todas las propiedades asociadas a un usuario específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del usuario
 *     responses:
 *       200:
 *         description: Propiedades del usuario obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Propiedad'
 *       404:
 *         description: Usuario no encontrado o sin propiedades
 *       500:
 *         description: Error interno del servidor
 */
userRouter.get('/:id/propiedades', authorizeRoles('admin'), (req, res) => userController.getPropiedadesByUserId(req, res));

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags:
 *       - Usuarios
 *     summary: Actualizar usuario
 *     description: Actualiza los datos de un usuario existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               contraseña:
 *                 type: string
 *                 minLength: 6
 *               rol:
 *                 type: string
 *                 enum: [admin, propietario, inquilino]
 *               estado_cuenta:
 *                 type: string
 *                 enum: [activo, inactivo, suspendido]
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
userRouter.put('/:id', validateDto(updateUserDto), (req, res) => userController.update(req, res));

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags:
 *       - Usuarios
 *     summary: Eliminar usuario
 *     description: Elimina un usuario del sistema
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del usuario
 *     responses:
 *       204:
 *         description: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
userRouter.delete('/:id', authorizeRoles('admin'), (req, res) => userController.remove(req, res));

export default userRouter;