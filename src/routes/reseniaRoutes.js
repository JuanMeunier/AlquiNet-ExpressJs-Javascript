import { Router } from 'express';
import { ReseniaController } from '../controllers/reseniaController.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateDto } from '../middlewares/validateDto.js';
import { createReseniaDto } from '../dtos/resenia/createResenia.dto.js';
import { updateReseniaDto } from '../dtos/resenia/updateResenia.dto.js';

const router = Router();
const reseniaController = new ReseniaController();

router.use(authenticate);

router.post('/', validateDto(createReseniaDto), (req, res, next) => reseniaController.createResenia(req, res, next));
router.get('/', (req, res, next) => reseniaController.getAllResenias(req, res, next));
router.get('/:id', (req, res, next) => reseniaController.getReseniaById(req, res, next));
router.get('/propiedad/:propiedadId', (req, res, next) => reseniaController.getReseniasPorPropiedad(req, res, next));
router.get('/inquilino/:inquilinoId', (req, res, next) => reseniaController.getReseniasPorInquilino(req, res, next));
router.put('/:id', validateDto(updateReseniaDto), (req, res, next) => reseniaController.updateResenia(req, res, next));
router.delete('/:id', (req, res, next) => reseniaController.deleteResenia(req, res, next));

export default router;
