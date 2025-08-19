import { AppDataSource } from '../config/database.js';
import Reserva from '../entities/reserva.js';
import Propiedad from '../entities/propiedad.js';
import Usuario from '../entities/usuario.js';
import cacheService from './cacheServices.js';

export class ReservaService {
    constructor() {
        this.reservaRepository = AppDataSource.getRepository(Reserva);
        this.propiedadRepository = AppDataSource.getRepository(Propiedad);
        this.usuarioRepository = AppDataSource.getRepository(Usuario);
    }

    async createReserva(data) {
        try {
            // Verificar que la propiedad existe
            const propiedad = await this.propiedadRepository.findOne({
                where: { id: data.propiedad_id }
            });

            if (!propiedad) {
                throw new Error('Propiedad no encontrada');
            }

            // Verificar que el inquilino existe
            const inquilino = await this.usuarioRepository.findOne({
                where: { id: data.inquilino_id }
            });

            if (!inquilino) {
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

            return savedReserva;
        } catch (error) {
            throw error;
        }
    }

    async getReservas() {
        try {
            // Intentar obtener del cache primero
            const cachedReservas = await cacheService.getReservas();
            if (cachedReservas) {
                console.log('📦 Reservas obtenidas del cache');
                return cachedReservas;
            }

            // Si no está en cache, obtener de BD
            console.log('🔍 Consultando reservas en BD');
            const reservas = await this.reservaRepository.find({
                relations: ['propiedad', 'inquilino'],
                order: { fecha_solicitud: 'DESC' }
            });

            // Guardar en cache
            await cacheService.setReservas(reservas);

            return reservas;
        } catch (error) {
            console.error('❌ Error en getReservas:', error.message);
            return await this.reservaRepository.find({
                relations: ['propiedad', 'inquilino'],
                order: { fecha_solicitud: 'DESC' }
            });
        }
    }

    async getReservaById(id) {
        try {
            // Intentar obtener del cache primero
            const cachedReserva = await cacheService.getReserva(id);
            if (cachedReserva) {
                console.log(`📦 Reserva ${id} obtenida del cache`);
                return cachedReserva;
            }

            // Si no está en cache, obtener de BD
            console.log(`🔍 Consultando reserva ${id} en BD`);
            const reserva = await this.reservaRepository.findOne({
                where: { id },
                relations: ['propiedad', 'inquilino']
            });

            if (!reserva) {
                const error = new Error('Reserva no encontrada');
                error.name = 'NotFoundError';
                throw error;
            }

            // Guardar en cache
            await cacheService.setReserva(id, reserva);

            return reserva;
        } catch (error) {
            if (error.name === 'NotFoundError') throw error;

            console.error('❌ Error en getReservaById:', error.message);
            const reserva = await this.reservaRepository.findOne({
                where: { id },
                relations: ['propiedad', 'inquilino']
            });

            if (!reserva) {
                const error = new Error('Reserva no encontrada');
                error.name = 'NotFoundError';
                throw error;
            }

            return reserva;
        }
    }

    async getReservasByInquilino(inquilinoId) {
        try {
            // Intentar obtener del cache primero
            const cachedReservas = await cacheService.getReservasByInquilino(inquilinoId);
            if (cachedReservas) {
                console.log(`📦 Reservas del inquilino ${inquilinoId} obtenidas del cache`);
                return cachedReservas;
            }

            // Verificar que el inquilino existe
            const inquilino = await this.usuarioRepository.findOne({
                where: { id: inquilinoId }
            });

            if (!inquilino) {
                const error = new Error('Inquilino no encontrado');
                error.name = 'NotFoundError';
                throw error;
            }

            // Si no está en cache, obtener de BD
            console.log(`🔍 Consultando reservas del inquilino ${inquilinoId} en BD`);
            const reservas = await this.reservaRepository.find({
                where: { inquilino: { id: inquilinoId } },
                relations: ['propiedad'],
                order: { fecha_solicitud: 'DESC' }
            });

            // Guardar en cache
            await cacheService.setReservasByInquilino(inquilinoId, reservas);

            return reservas;
        } catch (error) {
            if (error.name === 'NotFoundError') throw error;

            console.error('❌ Error en getReservasByInquilino:', error.message);
            const inquilino = await this.usuarioRepository.findOne({
                where: { id: inquilinoId }
            });

            if (!inquilino) {
                const error = new Error('Inquilino no encontrado');
                error.name = 'NotFoundError';
                throw error;
            }

            return await this.reservaRepository.find({
                where: { inquilino: { id: inquilinoId } },
                relations: ['propiedad'],
                order: { fecha_solicitud: 'DESC' }
            });
        }
    }

    async getReservasByPropiedad(propiedadId) {
        try {
            // Intentar obtener del cache primero
            const cachedReservas = await cacheService.getReservasByPropiedad(propiedadId);
            if (cachedReservas) {
                console.log(`📦 Reservas de la propiedad ${propiedadId} obtenidas del cache`);
                return cachedReservas;
            }

            // Verificar que la propiedad existe
            const propiedad = await this.propiedadRepository.findOne({
                where: { id: propiedadId }
            });

            if (!propiedad) {
                const error = new Error('Propiedad no encontrada');
                error.name = 'NotFoundError';
                throw error;
            }

            // Si no está en cache, obtener de BD
            console.log(`🔍 Consultando reservas de la propiedad ${propiedadId} en BD`);
            const reservas = await this.reservaRepository.find({
                where: { propiedad: { id: propiedadId } },
                relations: ['inquilino'],
                order: { fecha_solicitud: 'DESC' }
            });

            // Guardar en cache
            await cacheService.setReservasByPropiedad(propiedadId, reservas);

            return reservas;
        } catch (error) {
            if (error.name === 'NotFoundError') throw error;

            console.error('❌ Error en getReservasByPropiedad:', error.message);
            const propiedad = await this.propiedadRepository.findOne({
                where: { id: propiedadId }
            });

            if (!propiedad) {
                const error = new Error('Propiedad no encontrada');
                error.name = 'NotFoundError';
                throw error;
            }

            return await this.reservaRepository.find({
                where: { propiedad: { id: propiedadId } },
                relations: ['inquilino'],
                order: { fecha_solicitud: 'DESC' }
            });
        }
    }

    async getReservasByPropietario(propietarioId) {
        try {
            // Intentar obtener del cache primero
            const cachedReservas = await cacheService.getReservasByPropietario(propietarioId);
            if (cachedReservas) {
                console.log(`📦 Reservas del propietario ${propietarioId} obtenidas del cache`);
                return cachedReservas;
            }

            // Si no está en cache, obtener de BD
            console.log(`🔍 Consultando reservas del propietario ${propietarioId} en BD`);
            const reservas = await this.reservaRepository
                .createQueryBuilder('reserva')
                .leftJoinAndSelect('reserva.propiedad', 'propiedad')
                .leftJoinAndSelect('reserva.inquilino', 'inquilino')
                .where('propiedad.propietario_id = :propietarioId', { propietarioId })
                .orderBy('reserva.fecha_solicitud', 'DESC')
                .getMany();

            // Guardar en cache
            await cacheService.setReservasByPropietario(propietarioId, reservas);

            return reservas;
        } catch (error) {
            console.error('❌ Error en getReservasByPropietario:', error.message);
            return await this.reservaRepository
                .createQueryBuilder('reserva')
                .leftJoinAndSelect('reserva.propiedad', 'propiedad')
                .leftJoinAndSelect('reserva.inquilino', 'inquilino')
                .where('propiedad.propietario_id = :propietarioId', { propietarioId })
                .orderBy('reserva.fecha_solicitud', 'DESC')
                .getMany();
        }
    }

    async updateReserva(id, data) {
        try {
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

            return updatedReserva;
        } catch (error) {
            throw error;
        }
    }

    async deleteReserva(id) {
        try {
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

            return { message: 'Reserva eliminada correctamente' };
        } catch (error) {
            throw error;
        }
    }

    async cambiarEstadoReserva(id, nuevoEstado) {
        try {
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

            return updatedReserva;
        } catch (error) {
            throw error;
        }
    }
}