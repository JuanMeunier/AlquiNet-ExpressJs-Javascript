import { AppDataSource } from '../config/database.js';
import Propiedad from '../entities/propiedad.js';
import Usuario from '../entities/usuario.js';
import Resenia from '../entities/resenia.js';
import cacheService from './cacheServices.js';

export class ReseniaService {
  constructor() {
    this.propiedadRepository = AppDataSource.getRepository(Propiedad);
    this.usuarioRepository = AppDataSource.getRepository(Usuario);
    this.reseniaRepository = AppDataSource.getRepository(Resenia);
  }

  async createResenia({ inquilinoId, propiedadId, comentario, puntaje }) {
    try {
      // Verificar existencia del inquilino
      const inquilino = await this.usuarioRepository.findOne({ where: { id: inquilinoId } });
      if (!inquilino) throw new Error(`Usuario (inquilino) con id ${inquilinoId} no encontrado`);

      // Verificar existencia de la propiedad
      const propiedad = await this.propiedadRepository.findOne({ where: { id: propiedadId } });
      if (!propiedad) throw new Error(`Propiedad con id ${propiedadId} no encontrada`);

      // Evitar reseña duplicada
      const reseñaExistente = await this.reseniaRepository.findOne({
        where: { inquilino: { id: inquilinoId }, propiedad: { id: propiedadId } }
      });
      if (reseñaExistente) throw new Error("El inquilino ya ha realizado una reseña para esta propiedad");

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

      return savedResenia;
    } catch (error) {
      throw error;
    }
  }

  /** Obtener todas las reseñas con info de inquilino y propiedad */
  async getAllResenias() {
    try {
      // Intentar obtener del cache primero
      const cachedResenias = await cacheService.getResenias();
      if (cachedResenias) {
        console.log('📦 Reseñas obtenidas del cache');
        return cachedResenias;
      }

      // Si no está en cache, obtener de BD
      console.log('🔍 Consultando reseñas en BD');
      const resenias = await this.reseniaRepository.find({
        relations: ['inquilino', 'propiedad'],
        order: { fecha: 'DESC' } // Las más recientes primero
      });

      // Guardar en cache
      await cacheService.setResenias(resenias);

      return resenias;
    } catch (error) {
      console.error('❌ Error en getAllResenias:', error.message);
      return await this.reseniaRepository.find({
        relations: ['inquilino', 'propiedad'],
        order: { fecha: 'DESC' }
      });
    }
  }

  /** Obtener reseñas de una propiedad específica */
  async getReseniasPorPropiedad(propiedadId) {
    try {
      // Intentar obtener del cache primero
      const cachedResenias = await cacheService.getReseniasByPropiedad(propiedadId);
      if (cachedResenias) {
        console.log(`📦 Reseñas de la propiedad ${propiedadId} obtenidas del cache`);
        return cachedResenias;
      }

      // Verificar que la propiedad existe
      const propiedad = await this.propiedadRepository.findOne({ where: { id: propiedadId } });
      if (!propiedad) throw new Error(`Propiedad con id ${propiedadId} no encontrada`);

      // Si no está en cache, obtener de BD
      console.log(`🔍 Consultando reseñas de la propiedad ${propiedadId} en BD`);
      const resenias = await this.reseniaRepository.find({
        where: { propiedad: { id: propiedadId } },
        relations: ['inquilino'],
        order: { fecha: 'DESC' }
      });

      // Guardar en cache
      await cacheService.setReseniasByPropiedad(propiedadId, resenias);

      return resenias;
    } catch (error) {
      console.error('❌ Error en getReseniasPorPropiedad:', error.message);
      if (error.message.includes('no encontrada')) throw error;

      return await this.reseniaRepository.find({
        where: { propiedad: { id: propiedadId } },
        relations: ['inquilino'],
        order: { fecha: 'DESC' }
      });
    }
  }

  /** Obtener reseñas de un inquilino específico */
  async getReseniasPorInquilino(inquilinoId) {
    try {
      // Intentar obtener del cache primero
      const cachedResenias = await cacheService.getReseniasByInquilino(inquilinoId);
      if (cachedResenias) {
        console.log(`📦 Reseñas del inquilino ${inquilinoId} obtenidas del cache`);
        return cachedResenias;
      }

      // Verificar que el inquilino existe
      const inquilino = await this.usuarioRepository.findOne({ where: { id: inquilinoId } });
      if (!inquilino) throw new Error(`Usuario (inquilino) con id ${inquilinoId} no encontrado`);

      // Si no está en cache, obtener de BD
      console.log(`🔍 Consultando reseñas del inquilino ${inquilinoId} en BD`);
      const resenias = await this.reseniaRepository.find({
        where: { inquilino: { id: inquilinoId } },
        relations: ['propiedad'],
        order: { fecha: 'DESC' }
      });

      // Guardar en cache
      await cacheService.setReseniasByInquilino(inquilinoId, resenias);

      return resenias;
    } catch (error) {
      console.error('❌ Error en getReseniasPorInquilino:', error.message);
      if (error.message.includes('no encontrado')) throw error;

      return await this.reseniaRepository.find({
        where: { inquilino: { id: inquilinoId } },
        relations: ['propiedad'],
        order: { fecha: 'DESC' }
      });
    }
  }

  /** Obtener una reseña por id */
  async getReseniaById(reseniaId) {
    try {
      // Intentar obtener del cache primero
      const cachedResenia = await cacheService.getResenia(reseniaId);
      if (cachedResenia) {
        console.log(`📦 Reseña ${reseniaId} obtenida del cache`);
        return cachedResenia;
      }

      // Si no está en cache, obtener de BD
      console.log(`🔍 Consultando reseña ${reseniaId} en BD`);
      const resenia = await this.reseniaRepository.findOne({
        where: { id: reseniaId },
        relations: ['inquilino', 'propiedad']
      });

      if (!resenia) throw new Error(`Reseña con id ${reseniaId} no encontrada`);

      // Guardar en cache
      await cacheService.setResenia(reseniaId, resenia);

      return resenia;
    } catch (error) {
      console.error('❌ Error en getReseniaById:', error.message);
      if (error.message.includes('no encontrada')) throw error;

      const resenia = await this.reseniaRepository.findOne({
        where: { id: reseniaId },
        relations: ['inquilino', 'propiedad']
      });

      if (!resenia) throw new Error(`Reseña con id ${reseniaId} no encontrada`);

      return resenia;
    }
  }

  /** Actualizar reseña */
  async updateResenia(reseniaId, { comentario, puntaje }) {
    try {
      const resenia = await this.reseniaRepository.findOne({ where: { id: reseniaId } });
      if (!resenia) throw new Error(`Reseña con id ${reseniaId} no encontrada`);

      if (comentario !== undefined) resenia.comentario = comentario;
      if (puntaje !== undefined) resenia.puntaje = puntaje;

      const updatedResenia = await this.reseniaRepository.save(resenia);

      // Limpiar cache después de actualizar
      await cacheService.limpiarCacheResenias();

      return updatedResenia;
    } catch (error) {
      throw error;
    }
  }

  /** Eliminar reseña */
  async deleteResenia(reseniaId) {
    try {
      const resenia = await this.reseniaRepository.findOne({ where: { id: reseniaId } });
      if (!resenia) throw new Error(`Reseña con id ${reseniaId} no encontrada`);

      const deletedResenia = await this.reseniaRepository.remove(resenia);

      // Limpiar cache después de eliminar
      await cacheService.limpiarCacheResenias();

      return deletedResenia;
    } catch (error) {
      throw error;
    }
  }
}