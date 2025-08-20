import { AppDataSource } from '../config/database.js';
import Propiedad from '../entities/propiedad.js';
import Usuario from '../entities/usuario.js';
import cacheService from './cacheServices.js';
import logger from '../config/logger.js';

export class PropiedadService {
    constructor() {
        this.propiedadRepository = AppDataSource.getRepository(Propiedad);
        this.userRepository = AppDataSource.getRepository(Usuario);
    }

    async createPropiedad(data) {
        try {
            logger.info(`Creando nueva propiedad: ${data.titulo}`);

            const newPropiedad = this.propiedadRepository.create(data);
            const savedPropiedad = await this.propiedadRepository.save(newPropiedad);

            // Limpiar cache relacionado después de crear
            await cacheService.limpiarCachePropiedades();

            logger.success(`Propiedad creada exitosamente: ${savedPropiedad.titulo}`);
            return savedPropiedad;
        } catch (error) {
            logger.error('Error al crear propiedad', error);
            throw error;
        }
    }

    async getPropiedades() {
        try {
            logger.info('Obteniendo lista de propiedades');

            // Intentar obtener del cache primero
            const cachedPropiedades = await cacheService.getPropiedades();
            if (cachedPropiedades) {
                logger.info('Propiedades obtenidas del cache');
                return cachedPropiedades;
            }

            // Si no está en cache, obtener de BD
            logger.info('Consultando propiedades en base de datos');
            const propiedades = await this.propiedadRepository.find({
                relations: ['propietario']
            });

            // Guardar en cache
            await cacheService.setPropiedades(propiedades);
            logger.success(`${propiedades.length} propiedades obtenidas exitosamente`);
            return propiedades;
        } catch (error) {
            logger.error('Error al obtener propiedades', error);

            // Fallback: intentar solo BD
            try {
                return await this.propiedadRepository.find({ relations: ['propietario'] });
            } catch (dbError) {
                logger.error('Error también en consulta de base de datos', dbError);
                throw dbError;
            }
        }
    }

    async getPropiedadById(id) {
        try {
            logger.info(`Buscando propiedad con ID: ${id}`);

            // Intentar obtener del cache primero
            const cachedPropiedad = await cacheService.getPropiedad(id);
            if (cachedPropiedad) {
                logger.info(`Propiedad ${id} obtenida del cache`);
                return cachedPropiedad;
            }

            // Si no está en cache, obtener de BD
            const propiedad = await this.propiedadRepository.findOne({
                where: { id },
                relations: ['propietario']
            });

            if (!propiedad) {
                logger.warn(`Propiedad con ID ${id} no encontrada`);
                throw { status: 404, message: 'Propiedad no encontrada' };
            }

            // Guardar en cache
            await cacheService.setPropiedad(id, propiedad);
            logger.success(`Propiedad ${id} obtenida exitosamente: ${propiedad.titulo}`);
            return propiedad;
        } catch (error) {
            if (error.status === 404) throw error;

            logger.error(`Error al buscar propiedad ${id}`, error);
            throw error;
        }
    }

    async getPropiedadByUbicacion(ubicacion) {
        try {
            logger.info(`Buscando propiedades en: ${ubicacion}`);

            // Intentar obtener del cache primero
            const cachedPropiedades = await cacheService.getPropiedadesByUbicacion(ubicacion);
            if (cachedPropiedades) {
                logger.info(`Propiedades de ${ubicacion} obtenidas del cache`);
                return cachedPropiedades;
            }

            // Si no está en cache, obtener de BD
            const propiedades = await this.propiedadRepository.find({
                where: { ubicacion },
                relations: ['propietario']
            });

            // Guardar en cache
            await cacheService.setPropiedadesByUbicacion(ubicacion, propiedades);
            logger.success(`${propiedades.length} propiedades encontradas en ${ubicacion}`);
            return propiedades;
        } catch (error) {
            logger.error(`Error al buscar propiedades en ${ubicacion}`, error);
            throw error;
        }
    }

    async getPropiedadesByUserId(userId) {
        try {
            logger.info(`Buscando propiedades del usuario: ${userId}`);

            // Intentar obtener del cache primero
            const cachedPropiedades = await cacheService.getPropiedadesByUser(userId);
            if (cachedPropiedades) {
                logger.info(`Propiedades del usuario ${userId} obtenidas del cache`);
                return cachedPropiedades;
            }

            // Si no está en cache, obtener de BD
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['propiedades']
            });

            if (!user) {
                logger.warn(`Usuario con ID ${userId} no encontrado`);
                throw { status: 404, message: 'Usuario no encontrado' };
            }

            // Guardar en cache
            await cacheService.setPropiedadesByUser(userId, user.propiedades);
            logger.success(`${user.propiedades.length} propiedades encontradas para usuario ${userId}`);
            return user.propiedades;
        } catch (error) {
            logger.error(`Error al buscar propiedades del usuario ${userId}`, error);
            throw error;
        }
    }

    async updatePropiedad(id, data) {
        try {
            logger.info(`Actualizando propiedad ${id}`);

            await this.propiedadRepository.update(id, data);
            const updatedPropiedad = await this.getPropiedadById(id);

            // Limpiar cache relacionado después de actualizar
            await cacheService.limpiarCachePropiedades();

            logger.success(`Propiedad ${id} actualizada exitosamente`);
            return updatedPropiedad;
        } catch (error) {
            logger.error(`Error al actualizar propiedad ${id}`, error);
            throw error;
        }
    }

    async deletePropiedad(id) {
        try {
            logger.info(`Eliminando propiedad ${id}`);

            const result = await this.propiedadRepository.delete(id);

            if (result.affected === 0) {
                logger.warn(`Propiedad ${id} no encontrada para eliminar`);
                throw { status: 404, message: 'Propiedad no encontrada' };
            }

            // Limpiar cache relacionado después de eliminar
            await cacheService.limpiarCachePropiedades();

            logger.success(`Propiedad ${id} eliminada exitosamente`);
            return result;
        } catch (error) {
            logger.error(`Error al eliminar propiedad ${id}`, error);
            throw error;
        }
    }
}