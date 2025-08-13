import { ReservaService } from '../services/reservaServices.js';

export class ReservaController {
    constructor() {
        this.reservaService = new ReservaService();
    }

    async create(req, res, next) {
        try {
            const reserva = await this.reservaService.createReserva(req.body);
            res.status(201).json({
                success: true,
                message: 'Reserva creada exitosamente',
                data: reserva
            });
        } catch (error) {
            next(error);
        }
    }

    async findAll(req, res, next) {
        try {
            const reservas = await this.reservaService.getReservas();
            res.json({
                success: true,
                message: 'Reservas obtenidas exitosamente',
                count: reservas.length,
                data: reservas
            });
        } catch (error) {
            next(error);
        }
    }

    async findOne(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) throw { status: 400, message: 'ID de reserva inválido' };

            const reserva = await this.reservaService.getReservaById(id);
            res.json({
                success: true,
                message: 'Reserva obtenida exitosamente',
                data: reserva
            });
        } catch (error) {
            next(error);
        }
    }

    async getByInquilino(req, res, next) {
        try {
            const inquilinoId = parseInt(req.params.inquilinoId);
            if (isNaN(inquilinoId)) throw { status: 400, message: 'ID de inquilino inválido' };

            const reservas = await this.reservaService.getReservasByInquilino(inquilinoId);
            res.json({
                success: true,
                message: 'Reservas del inquilino obtenidas exitosamente',
                count: reservas.length,
                data: reservas
            });
        } catch (error) {
            next(error);
        }
    }

    async getByPropiedad(req, res, next) {
        try {
            const propiedadId = parseInt(req.params.propiedadId);
            if (isNaN(propiedadId)) throw { status: 400, message: 'ID de propiedad inválido' };

            const reservas = await this.reservaService.getReservasByPropiedad(propiedadId);
            res.json({
                success: true,
                message: 'Reservas de la propiedad obtenidas exitosamente',
                count: reservas.length,
                data: reservas
            });
        } catch (error) {
            next(error);
        }
    }

    async getByPropietario(req, res, next) {
        try {
            const propietarioId = parseInt(req.params.propietarioId);
            if (isNaN(propietarioId)) throw { status: 400, message: 'ID de propietario inválido' };

            const reservas = await this.reservaService.getReservasByPropietario(propietarioId);
            res.json({
                success: true,
                message: 'Reservas del propietario obtenidas exitosamente',
                count: reservas.length,
                data: reservas
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) throw { status: 400, message: 'ID de reserva inválido' };

            const updatedReserva = await this.reservaService.updateReserva(id, req.body);
            res.json({
                success: true,
                message: 'Reserva actualizada exitosamente',
                data: updatedReserva
            });
        } catch (error) {
            next(error);
        }
    }

    async remove(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) throw { status: 400, message: 'ID de reserva inválido' };

            await this.reservaService.deleteReserva(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    async cambiarEstado(req, res, next) {
        try {
            const id = parseInt(req.params.id);
            const { estado } = req.body;
            if (isNaN(id)) throw { status: 400, message: 'ID de reserva inválido' };
            if (!estado) throw { status: 400, message: 'Estado requerido' };

            const updatedReserva = await this.reservaService.cambiarEstadoReserva(id, estado);
            res.json({
                success: true,
                message: `Estado de reserva cambiado a ${estado}`,
                data: updatedReserva
            });
        } catch (error) {
            next(error);
        }
    }
}
