import { Router } from "express";
import { PropiedadController } from "../controllers/propiedadController.js";
import { validateDto } from '../middlewares/validateDto.js';
import { createPropertyDto } from '../dtos/propiedad/createPropiedad.dto.js';
import { updatePropertyDto } from '../dtos/propiedad/updatePropiedad.dto.js';
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from '../middlewares/auth.middleware.js';

const propiedadRouter = Router();
const propiedadController = new PropiedadController();

propiedadRouter.use(authenticate);


// Crear propiedad
propiedadRouter.post(
    '/',
    validateDto(createPropertyDto),
    (req, res, next) => propiedadController.create(req, res, next)
);

// Listar todas las propiedades
propiedadRouter.get('/', (req, res, next) => propiedadController.findAll(req, res, next));

// Obtener propiedad por ID
propiedadRouter.get('/:id', (req, res, next) => propiedadController.findOne(req, res, next));

// Buscar propiedades por ubicación
propiedadRouter.get('/buscar', (req, res, next) => propiedadController.findByUbicacion(req, res, next));

// Obtener propiedades por ID de usuario
propiedadRouter.get('/usuario/:userId', (req, res, next) => propiedadController.getByUserId(req, res, next));

// Actualizar propiedad
propiedadRouter.put('/:id', validateDto(updatePropertyDto), (req, res, next) => propiedadController.update(req, res, next));

// Eliminar propiedad
propiedadRouter.delete('/:id', (req, res, next) => propiedadController.remove(req, res, next));

export default propiedadRouter;
