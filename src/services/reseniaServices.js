import AppDataSource from '../config/database.js';
import Propiedad from '../entities/propiedad.js';
import Usuario from '../entities/usuario.js';
import Resenia from '../entities/resenia.js';
import { NotFoundError } from '../errors/NotFoundError.js'

export class ReseniaService {
  constructor() {
    this.propiedadRepository = AppDataSource.getRepository(Propiedad)
    this.usuarioRepository = AppDataSource.getRepository(Usuario)
    this.reseniaRepository = AppDataSource.getRepository(Resenia)
  }

  async createResenia({ inquilinoId, propiedadId, comentario, puntaje }) {
    // Verificar existencia del inquilino
    const inquilino = await this.usuarioRepository.findOne({ where: { id: inquilinoId } });
    if (!inquilino) throw new NotFoundError(`Usuario (inquilino) con id ${inquilinoId} no encontrado`);

    // Verificar existencia de la propiedad
    const propiedad = await this.propiedadRepository.findOne({ where: { id: propiedadId } });
    if (!propiedad) throw new NotFoundError(`Propiedad con id ${propiedadId} no encontrada`);

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
    return await this.reseniaRepository.save(nuevaResenia);
  }

  /** Obtener todas las reseñas con info de inquilino y propiedad */
  async getAllResenias() {
    return await this.reseniaRepository.find({
      relations: ['inquilino', 'propiedad'],
      order: { fecha: 'DESC' } // Las más recientes primero
    });
  }

  /** Obtener reseñas de una propiedad específica */
  async getReseniasPorPropiedad(propiedadId) {
    const propiedad = await this.propiedadRepository.findOne({ where: { id: propiedadId } });
    if (!propiedad) throw new NotFoundError(`Propiedad con id ${propiedadId} no encontrada`);

    return await this.reseniaRepository.find({
      where: { propiedad: { id: propiedadId } },
      relations: ['inquilino'],
      order: { fecha: 'DESC' }
    });
  }

  /** Obtener reseñas de un inquilino específico */
  async getReseniasPorInquilino(inquilinoId) {
    const inquilino = await this.usuarioRepository.findOne({ where: { id: inquilinoId } });
    if (!inquilino) throw new NotFoundError(`Usuario (inquilino) con id ${inquilinoId} no encontrado`);

    return await this.reseniaRepository.find({
      where: { inquilino: { id: inquilinoId } },
      relations: ['propiedad'],
      order: { fecha: 'DESC' }
    });
  }

  /** Obtener una reseña por id */
  async getReseniaById(reseniaId) {
    const resenia = await this.reseniaRepository.findOne({
      where: { id: reseniaId },
      relations: ['inquilino', 'propiedad']
    });
    if (!resenia) throw new NotFoundError(`Reseña con id ${reseniaId} no encontrada`);
    return resenia;
  }

  /** Actualizar reseña */
  async updateResenia(reseniaId, { comentario, puntaje }) {
    const resenia = await this.reseniaRepository.findOne({ where: { id: reseniaId } });
    if (!resenia) throw new NotFoundError(`Reseña con id ${reseniaId} no encontrada`);

    if (comentario !== undefined) resenia.comentario = comentario;
    if (puntaje !== undefined) resenia.puntaje = puntaje;

    return await this.reseniaRepository.save(resenia);
  }

  /** Eliminar reseña */
  async deleteResenia(reseniaId) {
    const resenia = await this.reseniaRepository.findOne({ where: { id: reseniaId } });
    if (!resenia) throw new NotFoundError(`Reseña con id ${reseniaId} no encontrada`);

    return await this.reseniaRepository.remove(resenia);
  }


}
