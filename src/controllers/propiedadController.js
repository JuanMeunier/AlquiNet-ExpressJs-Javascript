import { PropiedadService } from "../services/propiedadServices";

const propiedadService = new PropiedadService();

export class PropiedadController {
    async create(req, res) {
        try {
            const propiedad = await propiedadService.createPropiedad(req.body);
            res.status(201).json(propiedad);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear la propiedad' });
        }
    }

    async findAll(req, res) {
        try {
            const propiedades = await propiedadService.getPropiedades();
            res.json(propiedades);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener las propiedades' });
        }
    }

    async findOne(req, res) {
        try {
            const propiedad = await propiedadService.getPropiedadById(parseInt(req.params.id));
            res.json(propiedad);
        } catch (error) {
            if (error.name === 'NotFoundError') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error al obtener la propiedad' });
        }
    }

    async findByUbicacion(req, res) {
        try {
            const propiedades = await propiedadService.getPropiedadByUbicacion(req.query.ubicacion);
            res.json(propiedades);
        } catch (error) {
            res.status(500).json({ message: 'Error al buscar propiedades por ubicación' });
        }
    }

    async getByUserId(req, res) {
        try {
            const propiedades = await propiedadService.getPropiedadesByUserId(parseInt(req.params.userId));
            res.json(propiedades);
        } catch (error) {
            if (error.name === 'NotFoundError') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error al obtener las propiedades del usuario' });
        }
    }

    async update(req, res) {
        try {
            const updatedPropiedad = await propiedadService.updatePropiedad(parseInt(req.params.id), req.body);
            res.json(updatedPropiedad);
        } catch (error) {
            if (error.name === 'NotFoundError') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error al actualizar la propiedad' });
        }
    }

    async remove(req, res) {
        try {
            await propiedadService.deletePropiedad(parseInt(req.params.id));
            res.status(204).send();
        } catch (error) {
            if (error.name === 'NotFoundError') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error al eliminar la propiedad' });
        }
    }
}