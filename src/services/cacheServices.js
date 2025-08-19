// src/services/cacheService.js
import { isRedisConnected, client } from "../config/reddis.js";

class CacheService {
    /**
     * Guardar datos en cache
     * @param {string} key - La clave para guardar
     * @param {any} data - Los datos a guardar
     * @param {number} seconds - Tiempo de vida en segundos (por defecto 1 hora)
     */

    async set(key, data, seconds = 3600) {
        // Si Redis no está conectado, no hacer nada
        if (!isRedisConnected()) {
            console.log('⚠️ Redis no conectado, saltando cache');
            return false;
        }

        try {
            // Convertir los datos a texto (JSON)
            const dataString = JSON.stringify(data);

            // Guardar en Redis con tiempo de expiración
            await client.setEx(key, seconds, dataString);

            console.log(`✅ Guardado en cache: ${key}`);
            return true;
        } catch (error) {
            console.error('❌ Error guardando en cache:', error.message);
            return false;
        }
    }

    /**
     * Obtener datos del cache
     * @param {string} key - La clave a buscar
     */
    async get(key) {
        if (!isRedisConnected()) {
            return null;
        }

        try {
            const data = await client.get(key);

            if (data) {
                console.log(`✅ Cache encontrado: ${key}`);
                // Convertir de texto a objeto
                return JSON.parse(data);
            } else {
                console.log(`❌ Cache no encontrado: ${key}`);
                return null;
            }
        } catch (error) {
            console.error('❌ Error obteniendo cache:', error.message);
            return null;
        }
    }

    /**
     * Eliminar datos del cache
     * @param {string} key - La clave a eliminar
     */
    async delete(key) {
        if (!isRedisConnected()) {
            return false;
        }

        try {
            await client.del(key);
            console.log(`🗑️ Cache eliminado: ${key}`);
            return true;
        } catch (error) {
            console.error('❌ Error eliminando cache:', error.message);
            return false;
        }
    }

    /**
     * Eliminar múltiples claves que coincidan con un patrón
     * @param {string} pattern - Patrón de búsqueda (ej: "propiedades:*")
     */
    async deletePattern(pattern) {
        if (!isRedisConnected()) {
            return false;
        }

        try {
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
                console.log(`🗑️ Cache eliminado por patrón: ${pattern} (${keys.length} claves)`);
            }
            return true;
        } catch (error) {
            console.error('❌ Error eliminando cache por patrón:', error.message);
            return false;
        }
    }

    // ===== MÉTODOS ESPECÍFICOS PARA NUESTRO SISTEMA =====

    /**
     * Cache para propiedades
     */
    async getPropiedades() {
        return await this.get('propiedades:todas');
    }

    async setPropiedades(propiedades) {
        return await this.set('propiedades:todas', propiedades, 1800); // 30 minutos
    }

    async getPropiedad(id) {
        return await this.get(`propiedad:${id}`);
    }

    async setPropiedad(id, propiedad) {
        return await this.set(`propiedad:${id}`, propiedad, 3600); // 1 hora
    }

    async getPropiedadesByUser(userId) {
        return await this.get(`propiedades:usuario:${userId}`);
    }

    async setPropiedadesByUser(userId, propiedades) {
        return await this.set(`propiedades:usuario:${userId}`, propiedades, 1800); // 30 minutos
    }

    async getPropiedadesByUbicacion(ubicacion) {
        return await this.get(`propiedades:ubicacion:${ubicacion}`);
    }

    async setPropiedadesByUbicacion(ubicacion, propiedades) {
        return await this.set(`propiedades:ubicacion:${ubicacion}`, propiedades, 1800); // 30 minutos
    }

    // Cuando se actualiza una propiedad, limpiar caches relacionados
    async limpiarCachePropiedades() {
        await this.deletePattern('propiedades:*');
        await this.deletePattern('propiedad:*');
        console.log('🧹 Cache de propiedades limpiado');
    }

    /**
     * Cache para usuarios
     */
    async getUsuarios() {
        return await this.get('usuarios:todos');
    }

    async setUsuarios(usuarios) {
        return await this.set('usuarios:todos', usuarios, 3600); // 1 hora
    }

    async getUsuario(id) {
        return await this.get(`usuario:${id}`);
    }

    async setUsuario(id, usuario) {
        return await this.set(`usuario:${id}`, usuario, 3600); // 1 hora
    }

    async limpiarCacheUsuarios() {
        await this.deletePattern('usuarios:*');
        await this.deletePattern('usuario:*');
        console.log('🧹 Cache de usuarios limpiado');
    }

    /**
     * Cache para reservas
     */
    async getReservas() {
        return await this.get('reservas:todas');
    }

    async setReservas(reservas) {
        return await this.set('reservas:todas', reservas, 300); // 5 minutos (cambian rápido)
    }

    async getReserva(id) {
        return await this.get(`reserva:${id}`);
    }

    async setReserva(id, reserva) {
        return await this.set(`reserva:${id}`, reserva, 600); // 10 minutos
    }

    async getReservasByInquilino(inquilinoId) {
        return await this.get(`reservas:inquilino:${inquilinoId}`);
    }

    async setReservasByInquilino(inquilinoId, reservas) {
        return await this.set(`reservas:inquilino:${inquilinoId}`, reservas, 300); // 5 minutos
    }

    async getReservasByPropiedad(propiedadId) {
        return await this.get(`reservas:propiedad:${propiedadId}`);
    }

    async setReservasByPropiedad(propiedadId, reservas) {
        return await this.set(`reservas:propiedad:${propiedadId}`, reservas, 300); // 5 minutos
    }

    async getReservasByPropietario(propietarioId) {
        return await this.get(`reservas:propietario:${propietarioId}`);
    }

    async setReservasByPropietario(propietarioId, reservas) {
        return await this.set(`reservas:propietario:${propietarioId}`, reservas, 300); // 5 minutos
    }

    async limpiarCacheReservas() {
        await this.deletePattern('reservas:*');
        await this.deletePattern('reserva:*');
        console.log('🧹 Cache de reservas limpiado');
    }

    /**
     * Cache para reseñas
     */
    async getResenias() {
        return await this.get('resenias:todas');
    }

    async setResenias(resenias) {
        return await this.set('resenias:todas', resenias, 1800); // 30 minutos
    }

    async getResenia(id) {
        return await this.get(`resenia:${id}`);
    }

    async setResenia(id, resenia) {
        return await this.set(`resenia:${id}`, resenia, 1800); // 30 minutos
    }

    async getReseniasByPropiedad(propiedadId) {
        return await this.get(`resenias:propiedad:${propiedadId}`);
    }

    async setReseniasByPropiedad(propiedadId, resenias) {
        return await this.set(`resenias:propiedad:${propiedadId}`, resenias, 1800); // 30 minutos
    }

    async getReseniasByInquilino(inquilinoId) {
        return await this.get(`resenias:inquilino:${inquilinoId}`);
    }

    async setReseniasByInquilino(inquilinoId, resenias) {
        return await this.set(`resenias:inquilino:${inquilinoId}`, resenias, 1800); // 30 minutos
    }

    async limpiarCacheResenias() {
        await this.deletePattern('resenias:*');
        await this.deletePattern('resenia:*');
        console.log('🧹 Cache de reseñas limpiado');
    }
}

// Crear una instancia y exportarla
const cacheService = new CacheService();
export default cacheService;