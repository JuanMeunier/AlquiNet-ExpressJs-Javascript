import { Router } from 'express';
import { ReservaController } from '../controllers/reservaController.js';
import { validateDto } from '../middlewares/validateDto.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createReservationDto } from '../dtos/resenia/createResenia.dto.js';
import { updateReservationDto } from '../dtos/resenia/updateResenia.dto.js';

const reservaRouter = Router();
const reservaController = new ReservaController();

// Todas las rutas requieren autenticación
reservaRouter.use(authenticate);

// Crear reserva
reservaRouter.post(
    '/',
    validateDto(createReservationDto),
    (req, res, next) => reservaController.create(req, res, next)
);

// Obtener todas las reservas
reservaRouter.get('/', (req, res, next) => reservaController.findAll(req, res, next));

// Obtener reserva por ID
reservaRouter.get('/:id', (req, res, next) => reservaController.findOne(req, res, next));

// Obtener reservas por inquilino
reservaRouter.get('/inquilino/:inquilinoId', (req, res, next) =>
    reservaController.getByInquilino(req, res, next)
);

// Obtener reservas por propiedad
reservaRouter.get('/propiedad/:propiedadId', (req, res, next) =>
    reservaController.getByPropiedad(req, res, next)
);

// Obtener reservas por propietario
reservaRouter.get('/propietario/:propietarioId', (req, res, next) =>
    reservaController.getByPropietario(req, res, next)
);

// Actualizar reserva
reservaRouter.put(
    '/:id',
    validateDto(updateReservationDto),
    (req, res, next) => reservaController.update(req, res, next)
);

// Cambiar estado de reserva
reservaRouter.patch('/:id/estado', (req, res, next) =>
    reservaController.cambiarEstado(req, res, next)
);

// Eliminar reserva
reservaRouter.delete('/:id', (req, res, next) =>
    reservaController.remove(req, res, next)
);

export default reservaRouter;
