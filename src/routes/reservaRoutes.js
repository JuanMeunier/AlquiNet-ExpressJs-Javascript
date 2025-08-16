import { Router } from 'express';
import { ReservaController } from '../controllers/reservaController.js';
import { validateDto } from '../middlewares/validateDto.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createReservationDto } from '../dtos/reserva/createReserva.dto.js';
import { updateReservationDto } from '../dtos/reserva/updateReserva.dto.js';

const reservaRouter = Router();
const reservaController = new ReservaController();

// Todas las rutas requieren autenticación
reservaRouter.use(authenticate);

/**
 * @swagger
 * /api/reservas:
 *   post:
 *     tags:
 *       - Reservas
 *     summary: Crear una nueva reserva
 *     description: Crea una nueva reserva para una propiedad
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propiedad_id
 *               - inquilino_id
 *               - fecha_inicio
 *               - fecha_fin
 *             properties:
 *               propiedad_id:
 *                 type: integer
 *                 example: 1
 *               inquilino_id:
 *                 type: integer
 *                 example: 2
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-01"
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-31"
 *               estado:
 *                 type: string
 *                 enum: [pendiente, aceptada, rechazada, cancelada]
 *                 default: "pendiente"
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado - Token requerido
 *       500:
 *         description: Error interno del servidor
 */
reservaRouter.post(
    '/',
    validateDto(createReservationDto),
    (req, res, next) => reservaController.create(req, res, next)
);

/**
 * @swagger
 * /api/reservas:
 *   get:
 *     tags:
 *       - Reservas
 *     summary: Obtener todas las reservas
 *     description: Retorna una lista de todas las reservas
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reservas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: No autorizado - Token requerido
 *       500:
 *         description: Error interno del servidor
 */
reservaRouter.get('/', (req, res, next) => reservaController.findAll(req, res, next));

/**
 * @swagger
 * /api/reservas/{id}:
 *   get:
 *     tags:
 *       - Reservas
 *     summary: Obtener reserva por ID
 *     description: Retorna una reserva específica por su ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la reserva
 *     responses:
 *       200:
 *         description: Reserva encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: ID de reserva inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reserva no encontrada
 *       500:
 *         description: Error interno del servidor
 */
reservaRouter.get('/:id', (req, res, next) => reservaController.findOne(req, res, next));

/**
 * @swagger
 * /api/reservas/inquilino/{inquilinoId}:
 *   get:
 *     tags:
 *       - Reservas
 *     summary: Obtener reservas por inquilino
 *     description: Retorna todas las reservas de un inquilino específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inquilinoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del inquilino
 *     responses:
 *       200:
 *         description: Reservas del inquilino obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: ID de inquilino inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Inquilino no encontrado
 *       500:
 *         description: Error interno del servidor
 */
reservaRouter.get('/inquilino/:inquilinoId', (req, res, next) =>
    reservaController.getByInquilino(req, res, next)
);

/**
 * @swagger
 * /api/reservas/propiedad/{propiedadId}:
 *   get:
 *     tags:
 *       - Reservas
 *     summary: Obtener reservas por propiedad
 *     description: Retorna todas las reservas de una propiedad específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propiedadId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la propiedad
 *     responses:
 *       200:
 *         description: Reservas de la propiedad obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: ID de propiedad inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Propiedad no encontrada
 *       500:
 *         description: Error interno del servidor
 */
reservaRouter.get('/propiedad/:propiedadId', (req, res, next) =>
    reservaController.getByPropiedad(req, res, next)
);

/**
 * @swagger
 * /api/reservas/propietario/{propietarioId}:
 *   get:
 *     tags:
 *       - Reservas
 *     summary: Obtener reservas por propietario
 *     description: Retorna todas las reservas de las propiedades de un propietario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propietarioId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del propietario
 *     responses:
 *       200:
 *         description: Reservas del propietario obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: ID de propietario inválido
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
reservaRouter.get('/propietario/:propietarioId', (req, res, next) =>
    reservaController.getByPropietario(req, res, next)
);

/**
 * @swagger
 * /api/reservas/{id}:
 *   put:
 *     tags:
 *       - Reservas
 *     summary: Actualizar reserva
 *     description: Actualiza los datos de una reserva existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha_inicio:
 *                 type: string
 *                 format: date
 *               fecha_fin:
 *                 type: string
 *                 format: date
 *               estado:
 *                 type: string
 *                 enum: [pendiente, aceptada, rechazada, cancelada]
 *     responses:
 *       200:
 *         description: Reserva actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reserva no encontrada
 *       500:
 *         description: Error interno del servidor
 */
reservaRouter.put(
    '/:id',
    validateDto(updateReservationDto),
    (req, res, next) => reservaController.update(req, res, next)
);

/**
 * @swagger
 * /api/reservas/{id}/estado:
 *   patch:
 *     tags:
 *       - Reservas
 *     summary: Cambiar estado de reserva
 *     description: Cambia el estado de una reserva específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la reserva
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pendiente, aceptada, rechazada, cancelada]
 *                 example: "aceptada"
 *     responses:
 *       200:
 *         description: Estado de reserva cambiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Estado requerido o ID inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reserva no encontrada
 *       500:
 *         description: Error interno del servidor
 */
reservaRouter.patch('/:id/estado', (req, res, next) =>
    reservaController.cambiarEstado(req, res, next)
);

/**
 * @swagger
 * /api/reservas/{id}:
 *   delete:
 *     tags:
 *       - Reservas
 *     summary: Eliminar reserva
 *     description: Elimina una reserva del sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la reserva
 *     responses:
 *       204:
 *         description: Reserva eliminada exitosamente
 *       400:
 *         description: ID de reserva inválido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reserva no encontrada
 *       500:
 *         description: Error interno del servidor
 */
reservaRouter.delete('/:id', (req, res, next) =>
    reservaController.remove(req, res, next)
);

export default reservaRouter;