import { Router } from 'express';
import { ReseniaController } from '../controllers/reseniaController.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateDto } from '../middlewares/validateDto.js';
import { createReseniaDto } from '../dtos/resenia/createResenia.dto.js';
import { updateReseniaDto } from '../dtos/resenia/updateResenia.dto.js';
import { authorizeRoles } from '../middlewares/auth.middleware.js';

const reseniaRouter = Router();
const reseniaController = new ReseniaController();

reseniaRouter.use(authenticate);

reseniaRouter.post('/', validateDto(createReseniaDto), (req, res, next) => reseniaController.createResenia(req, res, next));
reseniaRouter.get('/', (req, res, next) => reseniaController.getAllResenias(req, res, next));
reseniaRouter.get('/:id', (req, res, next) => reseniaController.getReseniaById(req, res, next));
reseniaRouter.get('/propiedad/:propiedadId', (req, res, next) => reseniaController.getReseniasPorPropiedad(req, res, next));
reseniaRouter.get('/inquilino/:inquilinoId', (req, res, next) => reseniaController.getReseniasPorInquilino(req, res, next));
reseniaRouter.put('/:id', validateDto(updateReseniaDto), (req, res, next) => reseniaController.updateResenia(req, res, next));
reseniaRouter.delete('/:id', (req, res, next) => reseniaController.deleteResenia(req, res, next));

export default reseniaRouter;
