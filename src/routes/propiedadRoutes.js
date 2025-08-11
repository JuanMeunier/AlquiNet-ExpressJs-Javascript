import { Router } from "express";
import { PropiedadController } from "../controllers/propiedadController";
import { validateDto } from '../middlewares/validateDto.js';
import createPropiedadDto from '../dtos/propiedad/createPropiedad.dto.js';
import updatePropiedadDto from '../dtos/propiedad/updatePropiedad.dto.js';

const propiedadRouter = Router();
const propiedadController = new PropiedadController();

// Crear propiedad
propiedadRouter.post('/', validateDto(createPropiedadDto), (req, res) => propiedadController.create(req, res));

// Listar todas las propiedades
propiedadRouter.get('/', (req, res) => propiedadController.findAll(req, res));

// Obtener propiedad por ID
propiedadRouter.get('/:id', (req, res) => propiedadController.findOne(req, res));

// Buscar propiedades por ubicación
propiedadRouter.get('/buscar', (req, res) => propiedadController.findByUbicacion(req, res));

// Obtener propiedades por ID de usuario
propiedadRouter.get('/usuario/:userId', (req, res) => propiedadController.getByUserId(req, res));

// Actualizar propiedad
propiedadRouter.put('/:id', validateDto(updatePropiedadDto), (req, res) => propiedadController.update(req, res));

// Eliminar propiedad
propiedadRouter.delete('/:id', (req, res) => propiedadController.remove(req, res));