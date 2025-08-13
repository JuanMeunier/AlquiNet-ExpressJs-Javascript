import { ReseniaService } from '../services/resenia.service.js';

export class ReseniaController {
    constructor() {
        this.reseniaService = new ReseniaService();
    }

    /** Crear reseña */
    async createResenia(req, res, next) {
        try {
            const { inquilinoId, propiedadId, comentario, puntaje } = req.body;
            const nuevaResenia = await this.reseniaService.createResenia({
                inquilinoId,
                propiedadId,
                comentario,
                puntaje
            });
            res.status(201).json(nuevaResenia);
        } catch (error) {
            next(error);
        }
    }

    /** Obtener todas las reseñas */
    async getAllResenias(req, res, next) {
        try {
            const resenias = await this.reseniaService.getAllResenias();
            res.json(resenias);
        } catch (error) {
            next(error);
        }
    }

    /** Obtener reseñas por propiedad */
    async getReseniasPorPropiedad(req, res, next) {
        try {
            const { propiedadId } = req.params;
            const resenias = await this.reseniaService.getReseniasPorPropiedad(Number(propiedadId));
            res.json(resenias);
        } catch (error) {
            next(error);
        }
    }

    /** Obtener reseñas por inquilino */
    async getReseniasPorInquilino(req, res, next) {
        try {
            const { inquilinoId } = req.params;
            const resenias = await this.reseniaService.getReseniasPorInquilino(Number(inquilinoId));
            res.json(resenias);
        } catch (error) {
            next(error);
        }
    }

    /** Obtener reseña por id */
    async getReseniaById(req, res, next) {
        try {
            const { id } = req.params;
            const resenia = await this.reseniaService.getReseniaById(Number(id));
            res.json(resenia);
        } catch (error) {
            next(error);
        }
    }

    /** Actualizar reseña */
    async updateResenia(req, res, next) {
        try {
            const { id } = req.params;
            const { comentario, puntaje } = req.body;
            const reseniaActualizada = await this.reseniaService.updateResenia(Number(id), { comentario, puntaje });
            res.json(reseniaActualizada);
        } catch (error) {
            next(error);
        }
    }

    /** Eliminar reseña */
    async deleteResenia(req, res, next) {
        try {
            const { id } = req.params;
            await this.reseniaService.deleteResenia(Number(id));
            res.status(204).send(); // 204 = No Content
        } catch (error) {
            next(error);
        }
    }
}
