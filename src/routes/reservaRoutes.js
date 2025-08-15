import { Router } from 'express';
import { ReservaController } from '../controllers/reservaController.js';
import { validateDto } from '../middlewares/validateDto.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createReservationDto } from '../dtos/reserva/createReserva.dto.js';
import { updateReservationDto } from '../dtos/reserva/updateReserva.dto.js';
import { authorizeRoles } from '../middlewares/auth.middleware.js';

const reservaRouter = Router();
const reservaController = new ReservaController();

// Todas las rutas requieren autenticación
reservaRouter.use(authenticate);

reservaRouter.post('/', validateDto(createReservationDto), (req, res, next) => reservaController.create(req, res, next));
reservaRouter.get('/', (req, res, next) => reservaController.findAll(req, res, next));
reservaRouter.get('/:id', (req, res, next) => reservaController.findOne(req, res, next));
reservaRouter.get('/inquilino/:inquilinoId', (req, res, next) => reservaController.getByInquilino(req, res, next));
reservaRouter.get('/propiedad/:propiedadId', (req, res, next) => reservaController.getByPropiedad(req, res, next));
reservaRouter.get('/propietario/:propietarioId', (req, res, next) = reservaController.getByPropietario(req, res, next));
reservaRouter.put('/:id', validateDto(updateReservationDto), (req, res, next) => reservaController.update(req, res, next));
reservaRouter.patch('/:id/estado', (req, res, next) = reservaController.cambiarEstado(req, res, next));
reservaRouter.delete('/:id', (req, res, next) = reservaController.remove(req, res, next));

export default reservaRouter;
