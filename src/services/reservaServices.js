import { AppDataSource } from '../config/database.js';
import Reserva from '../entities/reserva.js';
import Propiedad from '../entities/propiedad.js';
import Usuario from '../entities/usuario.js';

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

            return await this.reservaRepository.save(newReserva);
        } catch (error) {
            throw error;
        }
    }

    async getReservas() {
        try {
            return await this.reservaRepository.find({
                relations: ['propiedad', 'inquilino'],
                order: { fecha_solicitud: 'DESC' }
            });
        } catch (error) {
            throw error;
        }
    }

    async getReservaById(id) {
        try {
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
        } catch (error) {
            throw error;
        }
    }

    async getReservasByInquilino(inquilinoId) {
        try {
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
        } catch (error) {
            throw error;
        }
    }

    async getReservasByPropiedad(propiedadId) {
        try {
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
        } catch (error) {
            throw error;
        }
    }

    async getReservasByPropietario(propietarioId) {
        try {
            return await this.reservaRepository
                .createQueryBuilder('reserva')
                .leftJoinAndSelect('reserva.propiedad', 'propiedad')
                .leftJoinAndSelect('reserva.inquilino', 'inquilino')
                .where('propiedad.propietario_id = :propietarioId', { propietarioId })
                .orderBy('reserva.fecha_solicitud', 'DESC')
                .getMany();
        } catch (error) {
            throw error;
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

            return await this.getReservaById(id);
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

            return await this.getReservaById(id);
        } catch (error) {
            throw error;
        }
    }
}