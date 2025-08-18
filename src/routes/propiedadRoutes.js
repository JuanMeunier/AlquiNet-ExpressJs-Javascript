import { Router } from "express";
import { PropiedadController } from "../controllers/propiedadController.js";
import { validateDto } from '../middlewares/validateDto.js';
import { createPropertyDto } from '../dtos/propiedad/createPropiedad.dto.js';
import { updatePropertyDto } from '../dtos/propiedad/updatePropiedad.dto.js';
import { authorizeRoles, authenticate } from "../middlewares/auth.middleware.js";

const propiedadRouter = Router();
const propiedadController = new PropiedadController();

propiedadRouter.use(authenticate);

/**
 * @swagger
 * /api/propiedades:
 *   post:
 *     tags:
 *       - Propiedades
 *     summary: Crear una nueva propiedad
 *     description: Registra una nueva propiedad en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propietario_id
 *               - titulo
 *               - ubicacion
 *               - precio
 *               - tipo
 *             properties:
 *               propietario_id:
 *                 type: integer
 *                 example: 1
 *               titulo:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 100
 *                 example: "Hermoso departamento en el centro"
 *               descripcion:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Departamento luminoso de 2 ambientes con balcón"
 *               ubicacion:
 *                 type: object
 *                 required:
 *                   - provincia
 *                   - ciudad
 *                   - direccion
 *                 properties:
 *                   provincia:
 *                     type: string
 *                     example: "Buenos Aires"
 *                   ciudad:
 *                     type: string
 *                     example: "La Plata"
 *                   direccion:
 *                     type: string
 *                     example: "Av. 7 N° 1234"
 *               precio:
 *                 type: number
 *                 minimum: 0
 *                 example: 50000
 *               tipo:
 *                 type: string
 *                 enum: [casa, departamento, ph, otro]
 *                 example: "departamento"
 *               disponibilidad:
 *                 type: boolean
 *                 default: true
 *               imagenes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 example: ["https://ejemplo.com/imagen1.jpg"]
 *     responses:
 *       201:
 *         description: Propiedad creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Propiedad'
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 */
propiedadRouter.post(
    '/',
    validateDto(createPropertyDto),
    authorizeRoles('propietario'),
    (req, res, next) => propiedadController.create(req, res, next)
);

/**
 * @swagger
 * /api/propiedades:
 *   get:
 *     tags:
 *       - Propiedades
 *     summary: Obtener todas las propiedades
 *     description: Retorna una lista de todas las propiedades disponibles
 *     responses:
 *       200:
 *         description: Lista de propiedades obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Propiedad'
 *       500:
 *         description: Error interno del servidor
 */
propiedadRouter.get(
    '/',
    (req, res, next) => propiedadController.findAll(req, res, next)
);

/**
 * @swagger
 * /api/propiedades/{id}:
 *   get:
 *     tags:
 *       - Propiedades
 *     summary: Obtener propiedad por ID
 *     description: Retorna una propiedad específica por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la propiedad
 *     responses:
 *       200:
 *         description: Propiedad encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Propiedad'
 *       404:
 *         description: Propiedad no encontrada
 *       500:
 *         description: Error interno del servidor
 */
propiedadRouter.get(
    '/:id',
    (req, res, next) => propiedadController.findOne(req, res, next)
);

/**
 * @swagger
 * /api/propiedades/buscar:
 *   get:
 *     tags:
 *       - Propiedades
 *     summary: Buscar propiedades por ubicación
 *     description: Busca propiedades filtradas por ubicación
 *     parameters:
 *       - in: query
 *         name: ubicacion
 *         required: true
 *         schema:
 *           type: string
 *         description: Ubicación para filtrar las propiedades
 *         example: "Buenos Aires"
 *     responses:
 *       200:
 *         description: Propiedades encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Propiedad'
 *       500:
 *         description: Error interno del servidor
 */
propiedadRouter.get(
    '/buscar',
    (req, res, next) => propiedadController.findByUbicacion(req, res, next)
);

/**
 * @swagger
 * /api/propiedades/usuario/{userId}:
 *   get:
 *     tags:
 *       - Propiedades
 *     summary: Obtener propiedades de un usuario
 *     description: Retorna todas las propiedades de un usuario específico
 *     parameters:
 *       - in: path
 *         name: userId
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
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
propiedadRouter.get(
    '/usuario/:userId',
    (req, res, next) => propiedadController.getByUserId(req, res, next)
);

/**
 * @swagger
 * /api/propiedades/{id}:
 *   put:
 *     tags:
 *       - Propiedades
 *     summary: Actualizar propiedad
 *     description: Actualiza los datos de una propiedad existente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la propiedad
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 100
 *               descripcion:
 *                 type: string
 *                 maxLength: 1000
 *               ubicacion:
 *                 type: object
 *                 properties:
 *                   provincia:
 *                     type: string
 *                   ciudad:
 *                     type: string
 *                   direccion:
 *                     type: string
 *               precio:
 *                 type: number
 *                 minimum: 0
 *               tipo:
 *                 type: string
 *                 enum: [casa, departamento, ph, otro]
 *               disponibilidad:
 *                 type: boolean
 *               imagenes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *     responses:
 *       200:
 *         description: Propiedad actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Propiedad'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Propiedad no encontrada
 *       500:
 *         description: Error interno del servidor
 */
propiedadRouter.put(
    '/:id',
    validateDto(updatePropertyDto),
    authorizeRoles('propietario', 'admin'),
    (req, res, next) => propiedadController.update(req, res, next)
);

/**
 * @swagger
 * /api/propiedades/{id}:
 *   delete:
 *     tags:
 *       - Propiedades
 *     summary: Eliminar propiedad
 *     description: Elimina una propiedad del sistema
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la propiedad
 *     responses:
 *       204:
 *         description: Propiedad eliminada exitosamente
 *       404:
 *         description: Propiedad no encontrada
 *       500:
 *         description: Error interno del servidor
 */
propiedadRouter.delete(
    '/:id',
    authorizeRoles('propietario', 'admin'),
    (req, res, next) => propiedadController.remove(req, res, next)
);

export default propiedadRouter;