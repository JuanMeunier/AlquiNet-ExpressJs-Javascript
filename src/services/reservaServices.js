import { AppDataSource } from '../config/database.js';
import Reserva from '../entities/reserva.js';
import Propiedad from '../entities/propiedad.js';
import Usuario from '../entities/usuario.js';
import cacheService from './cacheServices.js';
import logger from '../config/logger.js';

export class ReservaService {
    constructor() {
        this.reservaRepository = AppDataSource.getRepository(Reserva);
        this.propiedadRepository = AppDataSource.getRepository(Propiedad);
        this.usuarioRepository = AppDataSource.getRepository(Usuario);
    }

    async createReserva(data) {
        try {
            logger.info(`Creando nueva reserva para propiedad ${data.propiedad_id}`);

            // Verificar que la propiedad existe
            const propiedad = await this.propiedadRepository.findOne({
                where: { id: data.propiedad_id }
            });

            if (!propiedad) {
                logger.warn(`Propiedad ${data.propiedad_id} no encontrada para reserva`);
                throw new Error('Propiedad no encontrada');
            }

            // Verificar que el inquilino existe
            const inquilino = await this.usuarioRepository.findOne({
                where: { id: data.inquilino_id }
            });

            if (!inquilino) {
                logger.warn(`Inquilino ${data.inquilino_id} no encontrado para reserva`);
                throw new Error('Inquilino no encontrado');
            }

            const newReserva = this.reservaRepository.create({
                ...data,
                estado: 'pendiente',
                fecha_solicitud: new Date()
            });

            const savedReserva = await this.reservaRepository.save(newReserva);

            // Limpiar cache después de crear reserva
            await cacheService.limpiarCacheReservas();

            logger.success(`Reserva creada exitosamente con ID: ${savedReserva.id}`);
            return savedReserva;
        } catch (error) {
            logger.error('Error al crear reserva', error);
            throw error;
        }
    }

    async getReservas() {
        try {
            logger.info('Obteniendo lista de reservas');

            // Intentar obtener del cache primero
            const cachedReservas = await cacheService.getReservas();
            if (cachedReservas) {
                logger.info('Reservas obtenidas del cache');
                return cachedReservas;
            }

            // Si no está en cache, obtener de BD
            logger.info('Consultando reservas en base de datos');
            const reservas = await this.reservaRepository.find({
                relations: ['propiedad', 'inquilino'],
                order: { fecha_solicitud: 'DESC' }
            });

            // Guardar en cache
            await cacheService.setReservas(reservas);
            logger.success(`${reservas.length} reservas obtenidas exitosamente`);
            return reservas;
        } catch (error) {
            logger.error('Error al obtener reservas', error);

            // Fallback: intentar solo BD
            try {
                return await this.reservaRepository.find({
                    relations: ['propiedad', 'inquilino'],
                    order: { fecha_solicitud: 'DESC' }
                });
            } catch (dbError) {
                logger.error('Error también en consulta de base de datos', dbError);
                throw dbError;
            }
        }
    }

    async getReservaById(id) {
        try {
            logger.info(`Buscando reserva con ID: ${id}`);

            // Intentar obtener del cache primero
            const cachedReserva = await cacheService.getReserva(id);
            if (cachedReserva) {
                logger.info(`Reserva ${id} obtenida del cache`);
                return cachedReserva;
            }

            // Si no está en cache, obtener de BD
            const reserva = await this.reservaRepository.findOne({
                where: { id },
                relations: ['propiedad', 'inquilino']
            });

            if (!reserva) {
                logger.warn(`Reserva con ID ${id} no encontrada`);
                const error = new Error('Reserva no encontrada');
                error.name = 'NotFoundError';
                throw error;
            }

            // Guardar en cache
            await cacheService.setReserva(id, reserva);
            logger.success(`Reserva ${id} obtenida exitosamente`);
            return reserva;
        } catch (error) {
            if (error.name === 'NotFoundError') throw error;

            logger.error(`Error al buscar reserva ${id}`, error);
            throw error;
        }
    }

    async getReservasByInquilino(inquilinoId) {
        try {
            logger.info(`Obteniendo reservas del inquilino: ${inquilinoId}`);

            // Intentar obtener del cache primero
            const cachedReservas = await cacheService.getReservasByInquilino(inquilinoId);
            if (cachedReservas) {
                logger.info(`Reservas del inquilino ${inquilinoId} obtenidas del cache`);
                return cachedReservas;
            }

            // Verificar que el inquilino existe
            const inquilino = await this.usuarioRepository.findOne({
                where: { id: inquilinoId }
            });

            if (!inquilino) {
                logger.warn(`Inquilino ${inquilinoId} no encontrado`);
                const error = new Error('Inquilino no encontrado');
                error.name = 'NotFoundError';
                throw error;
            }

            // Si no está en cache, obtener de BD
            const reservas = await this.reservaRepository.find({
                where: { inquilino: { id: inquilinoId } },
                relations: ['propiedad'],
                order: { fecha_solicitud: 'DESC' }
            });

            // Guardar en cache
            await cacheService.setReservasByInquilino(inquilinoId, reservas);
            logger.success(`${reservas.length} reservas encontradas para inquilino ${inquilinoId}`);
            return reservas;
        } catch (error) {
            logger.error(`Error al obtener reservas del inquilino ${inquilinoId}`, error);
            throw error;
        }
    }

    async updateReserva(id, data) {
        try {
            logger.info(`Actualizando reserva ${id}`);

            const reserva = await this.getReservaById(id);

            if (!reserva) {
                const error = new Error('Reserva no encontrada');
                error.name = 'NotFoundError';
                throw error;
            }

            await this.reservaRepository.update(id, data);
            const updatedReserva = await this.getReservaById(id);

            // Limpiar cache después de actualizar
            await cacheService.limpiarCacheReservas();

            logger.success(`Reserva ${id} actualizada exitosamente`);
            return updatedReserva;
        } catch (error) {
            logger.error(`Error al actualizar reserva ${id}`, error);
            throw error;
        }
    }

    async deleteReserva(id) {
        try {
            logger.info(`Eliminando reserva ${id}`);

            const reserva = await this.getReservaById(id);

            if (!reserva) {
                const error = new Error('Reserva no encontrada');
                error.name = 'NotFoundError';
                throw error;
            }

            const result = await this.reservaRepository.delete(id);

            if (result.affected === 0) {
                const error = new Error('Reserva no encontrada');
                error.name = 'NotFoundError';
                throw error;
            }

            // Limpiar cache después de eliminar
            await cacheService.limpiarCacheReservas();

            logger.success(`Reserva ${id} eliminada exitosamente`);
            return { message: 'Reserva eliminada correctamente' };
        } catch (error) {
            logger.error(`Error al eliminar reserva ${id}`, error);
            throw error;
        }
    }

    async cambiarEstadoReserva(id, nuevoEstado) {
        try {
            logger.info(`Cambiando estado de reserva ${id} a: ${nuevoEstado}`);

            const reserva = await this.getReservaById(id);

            if (!reserva) {
                const error = new Error('Reserva no encontrada');
                error.name = 'NotFoundError';
                throw error;
            }

            await this.reservaRepository.update(id, { estado: nuevoEstado });
            const updatedReserva = await this.getReservaById(id);

            // Limpiar cache después de cambiar estado
            await cacheService.limpiarCacheReservas();

            logger.success(`Estado de reserva ${id} cambiado a: ${nuevoEstado}`);
            return updatedReserva;
        } catch (error) {
            logger.error(`Error al cambiar estado de reserva ${id}`, error);
            throw error;
        }
    }
}