import { AppDataSource } from '../config/database.js';
import Propiedad from '../entities/propiedad.js';
import Usuario from '../entities/usuario.js';
import cacheService from './cacheServices.js';

export class PropiedadService {
    constructor() {
        this.propiedadRepository = AppDataSource.getRepository(Propiedad);
        this.userRepository = AppDataSource.getRepository(Usuario);
    }

    async createPropiedad(data) {
        try {
            const newPropiedad = this.propiedadRepository.create(data);
            const savedPropiedad = await this.propiedadRepository.save(newPropiedad);

            // Limpiar cache relacionado después de crear
            await cacheService.limpiarCachePropiedades();

            return savedPropiedad;
        } catch (error) {
            throw error;
        }
    }

    async getPropiedades() {
        try {
            // Intentar obtener del cache primero
            const cachedPropiedades = await cacheService.getPropiedades();
            if (cachedPropiedades) {
                console.log('📦 Propiedades obtenidas del cache');
                return cachedPropiedades;
            }

            // Si no está en cache, obtener de BD
            console.log('🔍 Consultando propiedades en BD');
            const propiedades = await this.propiedadRepository.find({
                relations: ['propietario']
            });

            // Guardar en cache
            await cacheService.setPropiedades(propiedades);

            return propiedades;
        } catch (error) {
            // Si hay error con cache, al menos devolver los datos de BD
            console.error('❌ Error en getPropiedades:', error.message);
            return await this.propiedadRepository.find({ relations: ['propietario'] });
        }
    }

    async getPropiedadById(id) {
        try {
            // Intentar obtener del cache primero
            const cachedPropiedad = await cacheService.getPropiedad(id);
            if (cachedPropiedad) {
                console.log(`📦 Propiedad ${id} obtenida del cache`);
                return cachedPropiedad;
            }

            // Si no está en cache, obtener de BD
            console.log(`🔍 Consultando propiedad ${id} en BD`);
            const propiedad = await this.propiedadRepository.findOne({
                where: { id },
                relations: ['propietario']
            });

            if (!propiedad) {
                throw { status: 404, message: 'Propiedad no encontrada' };
            }

            // Guardar en cache
            await cacheService.setPropiedad(id, propiedad);

            return propiedad;
        } catch (error) {
            if (error.status === 404) throw error;

            // Si hay error con cache, intentar BD sin cache
            console.error('❌ Error en getPropiedadById:', error.message);
            const propiedad = await this.propiedadRepository.findOne({
                where: { id },
                relations: ['propietario']
            });

            if (!propiedad) {
                throw { status: 404, message: 'Propiedad no encontrada' };
            }

            return propiedad;
        }
    }

    async getPropiedadByUbicacion(ubicacion) {
        try {
            // Intentar obtener del cache primero
            const cachedPropiedades = await cacheService.getPropiedadesByUbicacion(ubicacion);
            if (cachedPropiedades) {
                console.log(`📦 Propiedades en ${ubicacion} obtenidas del cache`);
                return cachedPropiedades;
            }

            // Si no está en cache, obtener de BD
            console.log(`🔍 Consultando propiedades en ${ubicacion} en BD`);
            const propiedades = await this.propiedadRepository.find({
                where: { ubicacion },
                relations: ['propietario']
            });

            // Guardar en cache
            await cacheService.setPropiedadesByUbicacion(ubicacion, propiedades);

            return propiedades;
        } catch (error) {
            console.error('❌ Error en getPropiedadByUbicacion:', error.message);
            return await this.propiedadRepository.find({
                where: { ubicacion },
                relations: ['propietario']
            });
        }
    }

    async getPropiedadesByUserId(userId) {
        try {
            // Intentar obtener del cache primero
            const cachedPropiedades = await cacheService.getPropiedadesByUser(userId);
            if (cachedPropiedades) {
                console.log(`📦 Propiedades del usuario ${userId} obtenidas del cache`);
                return cachedPropiedades;
            }

            // Si no está en cache, obtener de BD
            console.log(`🔍 Consultando propiedades del usuario ${userId} en BD`);
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['propiedades']
            });

            if (!user) {
                throw { status: 404, message: 'Usuario no encontrado' };
            }

            // Guardar en cache
            await cacheService.setPropiedadesByUser(userId, user.propiedades);

            return user.propiedades;
        } catch (error) {
            if (error.status === 404) throw error;

            console.error('❌ Error en getPropiedadesByUserId:', error.message);
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['propiedades']
            });

            if (!user) {
                throw { status: 404, message: 'Usuario no encontrado' };
            }

            return user.propiedades;
        }
    }

    async updatePropiedad(id, data) {
        try {
            await this.propiedadRepository.update(id, data);
            const updatedPropiedad = await this.getPropiedadById(id);

            // Limpiar cache relacionado después de actualizar
            await cacheService.limpiarCachePropiedades();

            return updatedPropiedad;
        } catch (error) {
            throw error;
        }
    }

    async deletePropiedad(id) {
        try {
            const result = await this.propiedadRepository.delete(id);

            if (result.affected === 0) {
                throw { status: 404, message: 'Propiedad no encontrada' };
            }

            // Limpiar cache relacionado después de eliminar
            await cacheService.limpiarCachePropiedades();

            return result;
        } catch (error) {
            throw error;
        }
    }
}