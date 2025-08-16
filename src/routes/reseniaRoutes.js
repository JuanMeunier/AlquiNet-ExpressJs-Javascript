import { Router } from 'express';
import { ReseniaController } from '../controllers/reseniaController.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateDto } from '../middlewares/validateDto.js';
import { createReseniaDto } from '../dtos/resenia/createResenia.dto.js';
import { updateReseniaDto } from '../dtos/resenia/updateResenia.dto.js';

const router = Router();
const reseniaController = new ReseniaController();

router.use(authenticate);

/**
 * @swagger
 * /api/resenias:
 *   post:
 *     tags:
 *       - Reseñas
 *     summary: Crear una nueva reseña
 *     description: Crea una nueva reseña para una propiedad
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inquilino_id
 *               - propiedad_id
 *               - puntaje
 *             properties:
 *               inquilino_id:
 *                 type: integer
 *                 example: 1
 *               propiedad_id:
 *                 type: integer
 *                 example: 1
 *               puntaje:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               comentario:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Excelente propiedad, muy bien ubicada y cómoda"
 *               fecha:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Reseña creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resenia'
 *       400:
 *         description: Error de validación o reseña duplicada
 *       401:
 *         description: No autorizado - Token requerido
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', validateDto(createReseniaDto), (req, res, next) => reseniaController.createResenia(req, res, next));

/**
 * @swagger
 * /api/resenias:
 *   get:
 *     tags:
 *       - Reseñas
 *     summary: Obtener todas las reseñas
 *     description: Retorna una lista de todas las reseñas ordenadas por fecha (más recientes primero)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reseñas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resenia'
 *       401:
 *         description: No autorizado - Token requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', (req, res, next) => reseniaController.getAllResenias(req, res, next));

/**
 * @swagger
 * /api/resenias/{id}:
 *   get:
 *     tags:
 *       - Reseñas
 *     summary: Obtener reseña por ID
 *     description: Retorna una reseña específica por su ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la reseña
 *     responses:
 *       200:
 *         description: Reseña encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resenia'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reseña no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', (req, res, next) => reseniaController.getReseniaById(req, res, next));

/**
 * @swagger
 * /api/resenias/propiedad/{propiedadId}:
 *   get:
 *     tags:
 *       - Reseñas
 *     summary: Obtener reseñas por propiedad
 *     description: Retorna todas las reseñas de una propiedad específica
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
 *         description: Reseñas de la propiedad obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resenia'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Propiedad no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/propiedad/:propiedadId', (req, res, next) => reseniaController.getReseniasPorPropiedad(req, res, next));

/**
 * @swagger
 * /api/resenias/inquilino/{inquilinoId}:
 *   get:
 *     tags:
 *       - Reseñas
 *     summary: Obtener reseñas por inquilino
 *     description: Retorna todas las reseñas realizadas por un inquilino específico
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
 *         description: Reseñas del inquilino obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Resenia'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Inquilino no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/inquilino/:inquilinoId', (req, res, next) => reseniaController.getReseniasPorInquilino(req, res, next));

/**
 * @swagger
 * /api/resenias/{id}:
 *   put:
 *     tags:
 *       - Reseñas
 *     summary: Actualizar reseña
 *     description: Actualiza una reseña existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la reseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               puntaje:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comentario:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Reseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resenia'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reseña no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', validateDto(updateReseniaDto), (req, res, next) => reseniaController.updateResenia(req, res, next));

/**
 * @swagger
 * /api/resenias/{id}:
 *   delete:
 *     tags:
 *       - Reseñas
 *     summary: Eliminar reseña
 *     description: Elimina una reseña del sistema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la reseña
 *     responses:
 *       204:
 *         description: Reseña eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Reseña no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', (req, res, next) => reseniaController.deleteResenia(req, res, next));

export default router;