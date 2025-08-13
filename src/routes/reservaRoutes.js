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
reservaRouter.post('/',
    validateDto(createReservationDto),
    (req, res) => reservaController.create(req, res)
);

// Obtener todas las reservas
reservaRouter.get('/', (req, res) => reservaController.findAll(req, res));

// Obtener reserva por ID
reservaRouter.get('/:id', (req, res) => reservaController.findOne(req, res));

// Obtener reservas por inquilino
reservaRouter.get('/inquilino/:inquilinoId', (req, res) => reservaController.getByInquilino(req, res));

// Obtener reservas por propiedad
reservaRouter.get('/propiedad/:propiedadId', (req, res) => reservaController.getByPropiedad(req, res));

// Obtener reservas por propietario
reservaRouter.get('/propietario/:propietarioId', (req, res) => reservaController.getByPropietario(req, res));

// Actualizar reserva
reservaRouter.put('/:id',
    validateDto(updateReservationDto),
    (req, res) => reservaController.update(req, res)
);

// Cambiar estado de reserva
reservaRouter.patch('/:id/estado', (req, res) => reservaController.cambiarEstado(req, res));

// Eliminar reserva
reservaRouter.delete('/:id', (req, res) => reservaController.remove(req, res));

export default reservaRouter;