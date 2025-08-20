import { AppDataSource } from '../config/database.js';
import Propiedad from '../entities/propiedad.js';
import Usuario from '../entities/usuario.js';
import Resenia from '../entities/resenia.js';
import cacheService from './cacheServices.js';
import logger from '../config/logger.js';

export class ReseniaService {
  constructor() {
    this.propiedadRepository = AppDataSource.getRepository(Propiedad);
    this.usuarioRepository = AppDataSource.getRepository(Usuario);
    this.reseniaRepository = AppDataSource.getRepository(Resenia);
  }

  async createResenia({ inquilinoId, propiedadId, comentario, puntaje }) {
    try {
      logger.info(`Creando nueva reseña para propiedad ${propiedadId} por inquilino ${inquilinoId}`);

      // Verificar existencia del inquilino
      const inquilino = await this.usuarioRepository.findOne({ where: { id: inquilinoId } });
      if (!inquilino) {
        logger.warn(`Inquilino ${inquilinoId} no encontrado para crear reseña`);
        throw new Error(`Usuario (inquilino) con id ${inquilinoId} no encontrado`);
      }

      // Verificar existencia de la propiedad
      const propiedad = await this.propiedadRepository.findOne({ where: { id: propiedadId } });
      if (!propiedad) {
        logger.warn(`Propiedad ${propiedadId} no encontrada para crear reseña`);
        throw new Error(`Propiedad con id ${propiedadId} no encontrada`);
      }

      // Evitar reseña duplicada
      const reseñaExistente = await this.reseniaRepository.findOne({
        where: { inquilino: { id: inquilinoId }, propiedad: { id: propiedadId } }
      });
      if (reseñaExistente) {
        logger.warn(`Intento de crear reseña duplicada - Inquilino ${inquilinoId}, Propiedad ${propiedadId}`);
        throw new Error("El inquilino ya ha realizado una reseña para esta propiedad");
      }

      // Crear reseña
      const nuevaResenia = this.reseniaRepository.create({
        comentario,
        puntaje,
        inquilino,
        propiedad
      });

      // Guardar en BD
      const savedResenia = await this.reseniaRepository.save(nuevaResenia);

      // Limpiar cache después de crear reseña
      await cacheService.limpiarCacheResenias();

      logger.success(`Reseña creada exitosamente con ID: ${savedResenia.id} (Puntaje: ${puntaje})`);
      return savedResenia;
    } catch (error) {
      logger.error('Error al crear reseña', error);
      throw error;
    }
  }

  /** Obtener todas las reseñas con info de inquilino y propiedad */
  async getAllResenias() {
    try {
      logger.info('Obteniendo lista de todas las reseñas');

      // Intentar obtener del cache primero
      const cachedResenias = await cacheService.getResenias();
      if (cachedResenias) {
        logger.info('Reseñas obtenidas del cache');
        return cachedResenias;
      }

      // Si no está en cache, obtener de BD
      logger.info('Consultando reseñas en base de datos');
      const resenias = await this.reseniaRepository.find({
        relations: ['inquilino', 'propiedad'],
        order: { fecha: 'DESC' } // Las más recientes primero
      });

      // Guardar en cache
      await cacheService.setResenias(resenias);

      logger.success(`${resenias.length} reseñas obtenidas exitosamente`);
      return resenias;
    } catch (error) {
      logger.error('Error al obtener todas las reseñas', error);

      // Fallback: intentar solo BD
      try {
        return await this.reseniaRepository.find({
          relations: ['inquilino', 'propiedad'],
          order: { fecha: 'DESC' }
        });
      } catch (dbError) {
        logger.error('Error también en consulta de base de datos', dbError);
        throw dbError;
      }
    }
  }

  /** Obtener reseñas de una propiedad específica */
  async getReseniasPorPropiedad(propiedadId) {
    try {
      logger.info(`Obteniendo reseñas de la propiedad: ${propiedadId}`);

      // Intentar obtener del cache primero
      const cachedResenias = await cacheService.getReseniasByPropiedad(propiedadId);
      if (cachedResenias) {
        logger.info(`Reseñas de la propiedad ${propiedadId} obtenidas del cache`);
        return cachedResenias;
      }

      // Verificar que la propiedad existe
      const propiedad = await this.propiedadRepository.findOne({ where: { id: propiedadId } });
      if (!propiedad) {
        logger.warn(`Propiedad ${propiedadId} no encontrada`);
        throw new Error(`Propiedad con id ${propiedadId} no encontrada`);
      }

      // Si no está en cache, obtener de BD
      const resenias = await this.reseniaRepository.find({
        where: { propiedad: { id: propiedadId } },
        relations: ['inquilino'],
        order: { fecha: 'DESC' }
      });

      // Guardar en cache
      await cacheService.setReseniasByPropiedad(propiedadId, resenias);

      logger.success(`${resenias.length} reseñas encontradas para propiedad ${propiedadId}`);
      return resenias;
    } catch (error) {
      logger.error(`Error al obtener reseñas de propiedad ${propiedadId}`, error);
      if (error.message.includes('no encontrada')) throw error;

      // Fallback: intentar solo BD
      try {
        return await this.reseniaRepository.find({
          where: { propiedad: { id: propiedadId } },
          relations: ['inquilino'],
          order: { fecha: 'DESC' }
        });
      } catch (dbError) {
        logger.error('Error también en consulta de base de datos', dbError);
        throw dbError;
      }
    }
  }

  /** Obtener reseñas de un inquilino específico */
  async getReseniasPorInquilino(inquilinoId) {
    try {
      logger.info(`Obteniendo reseñas del inquilino: ${inquilinoId}`);

      // Intentar obtener del cache primero
      const cachedResenias = await cacheService.getReseniasByInquilino(inquilinoId);
      if (cachedResenias) {
        logger.info(`Reseñas del inquilino ${inquilinoId} obtenidas del cache`);
        return cachedResenias;
      }

      // Verificar que el inquilino existe
      const inquilino = await this.usuarioRepository.findOne({ where: { id: inquilinoId } });
      if (!inquilino) {
        logger.warn(`Inquilino ${inquilinoId} no encontrado`);
        throw new Error(`Usuario (inquilino) con id ${inquilinoId} no encontrado`);
      }

      // Si no está en cache, obtener de BD
      const resenias = await this.reseniaRepository.find({
        where: { inquilino: { id: inquilinoId } },
        relations: ['propiedad'],
        order: { fecha: 'DESC' }
      });

      // Guardar en cache
      await cacheService.setReseniasByInquilino(inquilinoId, resenias);

      logger.success(`${resenias.length} reseñas encontradas para inquilino ${inquilinoId}`);
      return resenias;
    } catch (error) {
      logger.error(`Error al obtener reseñas del inquilino ${inquilinoId}`, error);
      if (error.message.includes('no encontrado')) throw error;

      // Fallback: intentar solo BD
      try {
        return await this.reseniaRepository.find({
          where: { inquilino: { id: inquilinoId } },
          relations: ['propiedad'],
          order: { fecha: 'DESC' }
        });
      } catch (dbError) {
        logger.error('Error también en consulta de base de datos', dbError);
        throw dbError;
      }
    }
  }

  /** Obtener una reseña por id */
  async getReseniaById(reseniaId) {
    try {
      logger.info(`Buscando reseña con ID: ${reseniaId}`);

      // Intentar obtener del cache primero
      const cachedResenia = await cacheService.getResenia(reseniaId);
      if (cachedResenia) {
        logger.info(`Reseña ${reseniaId} obtenida del cache`);
        return cachedResenia;
      }

      // Si no está en cache, obtener de BD
      const resenia = await this.reseniaRepository.findOne({
        where: { id: reseniaId },
        relations: ['inquilino', 'propiedad']
      });

      if (!resenia) {
        logger.warn(`Reseña ${reseniaId} no encontrada`);
        throw new Error(`Reseña con id ${reseniaId} no encontrada`);
      }

      // Guardar en cache
      await cacheService.setResenia(reseniaId, resenia);

      logger.success(`Reseña ${reseniaId} obtenida exitosamente`);
      return resenia;
    } catch (error) {
      logger.error(`Error al buscar reseña ${reseniaId}`, error);
      if (error.message.includes('no encontrada')) throw error;

      // Fallback: intentar solo BD
      try {
        const resenia = await this.reseniaRepository.findOne({
          where: { id: reseniaId },
          relations: ['inquilino', 'propiedad']
        });

        if (!resenia) throw new Error(`Reseña con id ${reseniaId} no encontrada`);
        return resenia;
      } catch (dbError) {
        logger.error('Error también en consulta de base de datos', dbError);
        throw dbError;
      }
    }
  }

  /** Actualizar reseña */
  async updateResenia(reseniaId, { comentario, puntaje }) {
    try {
      logger.info(`Actualizando reseña ${reseniaId}`);

      const resenia = await this.reseniaRepository.findOne({ where: { id: reseniaId } });
      if (!resenia) {
        logger.warn(`Reseña ${reseniaId} no encontrada para actualizar`);
        throw new Error(`Reseña con id ${reseniaId} no encontrada`);
      }

      if (comentario !== undefined) resenia.comentario = comentario;
      if (puntaje !== undefined) resenia.puntaje = puntaje;

      const updatedResenia = await this.reseniaRepository.save(resenia);

      // Limpiar cache después de actualizar
      await cacheService.limpiarCacheResenias();

      logger.success(`Reseña ${reseniaId} actualizada exitosamente`);
      return updatedResenia;
    } catch (error) {
      logger.error(`Error al actualizar reseña ${reseniaId}`, error);
      throw error;
    }
  }

  /** Eliminar reseña */
  async deleteResenia(reseniaId) {
    try {
      logger.info(`Eliminando reseña ${reseniaId}`);

      const resenia = await this.reseniaRepository.findOne({ where: { id: reseniaId } });
      if (!resenia) {
        logger.warn(`Reseña ${reseniaId} no encontrada para eliminar`);
        throw new Error(`Reseña con id ${reseniaId} no encontrada`);
      }

      const deletedResenia = await this.reseniaRepository.remove(resenia);

      // Limpiar cache después de eliminar
      await cacheService.limpiarCacheResenias();

      logger.success(`Reseña ${reseniaId} eliminada exitosamente`);
      return deletedResenia;
    } catch (error) {
      logger.error(`Error al eliminar reseña ${reseniaId}`, error);
      throw error;
    }
  }
}