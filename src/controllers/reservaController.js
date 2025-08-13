
import { ReservaService } from '../services/reservaServices.js';

const reservaService = new ReservaService();

export class ReservaController {
    async create(req, res) {
        try {
            const reserva = await reservaService.createReserva(req.body);
            res.status(201).json({
                success: true,
                message: 'Reserva creada exitosamente',
                data: reserva
            });
        } catch (error) {
            console.error('Error al crear reserva:', error);

            if (error.message.includes('no encontrado')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al crear la reserva'
            });
        }
    }

    async findAll(req, res) {
        try {
            const reservas = await reservaService.getReservas();

            res.json({
                success: true,
                message: 'Reservas obtenidas exitosamente',
                count: reservas.length,
                data: reservas
            });
        } catch (error) {
            console.error('Error al obtener reservas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener las reservas'
            });
        }
    }

    async findOne(req, res) {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de reserva inválido'
                });
            }

            const reserva = await reservaService.getReservaById(id);

            res.json({
                success: true,
                message: 'Reserva obtenida exitosamente',
                data: reserva
            });
        } catch (error) {
            console.error('Error al obtener reserva:', error);

            if (error.name === 'NotFoundError') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener la reserva'
            });
        }
    }

    async getByInquilino(req, res) {
        try {
            const inquilinoId = parseInt(req.params.inquilinoId);

            if (isNaN(inquilinoId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de inquilino inválido'
                });
            }

            const reservas = await reservaService.getReservasByInquilino(inquilinoId);

            res.json({
                success: true,
                message: 'Reservas del inquilino obtenidas exitosamente',
                count: reservas.length,
                data: reservas
            });
        } catch (error) {
            console.error('Error al obtener reservas del inquilino:', error);

            if (error.name === 'NotFoundError') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener las reservas del inquilino'
            });
        }
    }

    async getByPropiedad(req, res) {
        try {
            const propiedadId = parseInt(req.params.propiedadId);

            if (isNaN(propiedadId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de propiedad inválido'
                });
            }

            const reservas = await reservaService.getReservasByPropiedad(propiedadId);

            res.json({
                success: true,
                message: 'Reservas de la propiedad obtenidas exitosamente',
                count: reservas.length,
                data: reservas
            });
        } catch (error) {
            console.error('Error al obtener reservas de la propiedad:', error);

            if (error.name === 'NotFoundError') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener las reservas de la propiedad'
            });
        }
    }

    async getByPropietario(req, res) {
        try {
            const propietarioId = parseInt(req.params.propietarioId);

            if (isNaN(propietarioId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de propietario inválido'
                });
            }

            const reservas = await reservaService.getReservasByPropietario(propietarioId);

            res.json({
                success: true,
                message: 'Reservas del propietario obtenidas exitosamente',
                count: reservas.length,
                data: reservas
            });
        } catch (error) {
            console.error('Error al obtener reservas del propietario:', error);

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al obtener las reservas del propietario'
            });
        }
    }

    async update(req, res) {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de reserva inválido'
                });
            }

            const updatedReserva = await reservaService.updateReserva(id, req.body);

            res.json({
                success: true,
                message: 'Reserva actualizada exitosamente',
                data: updatedReserva
            });
        } catch (error) {
            console.error('Error al actualizar reserva:', error);

            if (error.name === 'NotFoundError') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al actualizar la reserva'
            });
        }
    }

    async remove(req, res) {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de reserva inválido'
                });
            }

            await reservaService.deleteReserva(id);

            res.status(204).send();
        } catch (error) {
            console.error('Error al eliminar reserva:', error);

            if (error.name === 'NotFoundError') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al eliminar la reserva'
            });
        }
    }

    async cambiarEstado(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { estado } = req.body;

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de reserva inválido'
                });
            }

            if (!estado) {
                return res.status(400).json({
                    success: false,
                    message: 'Estado requerido'
                });
            }

            const updatedReserva = await reservaService.cambiarEstadoReserva(id, estado);

            res.json({
                success: true,
                message: `Estado de reserva cambiado a ${estado}`,
                data: updatedReserva
            });
        } catch (error) {
            console.error('Error al cambiar estado:', error);

            if (error.name === 'NotFoundError') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor al cambiar el estado'
            });
        }
    }
}