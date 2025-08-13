import { PropiedadService } from "../services/propiedadServices.js";

export class PropiedadController {
    constructor() {
        this.propiedadService = new PropiedadService();
    }

    async create(req, res, next) {
        try {
            const propiedad = await this.propiedadService.createPropiedad(req.body);
            res.status(201).json(propiedad);
        } catch (error) {
            next(error);
        }
    }

    async findAll(req, res, next) {
        try {
            const propiedades = await this.propiedadService.getPropiedades();
            res.json(propiedades);
        } catch (error) {
            next(error);
        }
    }

    async findOne(req, res, next) {
        try {
            const propiedad = await this.propiedadService.getPropiedadById(parseInt(req.params.id));
            res.json(propiedad);
        } catch (error) {
            next(error);
        }
    }

    async findByUbicacion(req, res, next) {
        try {
            const propiedades = await this.propiedadService.getPropiedadByUbicacion(req.query.ubicacion);
            res.json(propiedades);
        } catch (error) {
            next(error);
        }
    }

    async getByUserId(req, res, next) {
        try {
            const propiedades = await this.propiedadService.getPropiedadesByUserId(parseInt(req.params.userId));
            res.json(propiedades);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const updatedPropiedad = await this.propiedadService.updatePropiedad(
                parseInt(req.params.id),
                req.body
            );
            res.json(updatedPropiedad);
        } catch (error) {
            next(error);
        }
    }

    async remove(req, res, next) {
        try {
            await this.propiedadService.deletePropiedad(parseInt(req.params.id));
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
