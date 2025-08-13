import AppDataSource from '../config/database.js';
import Propiedad from '../entities/propiedad.js';
import Usuario from '../entities/usuario.js';
import { NotFoundError } from '../errors/NotFoundError.js';

export class PropiedadService {
    constructor() {
        this.propiedadRepository = AppDataSource.getRepository(Propiedad);
        this.userRepository = AppDataSource.getRepository(Usuario);
    }

    async createPropiedad(data) {
        const newPropiedad = this.propiedadRepository.create(data);
        return await this.propiedadRepository.save(newPropiedad);
    }

    async getPropiedades() {
        return await this.propiedadRepository.find({ relations: ['usuario'] });
    }

    async getPropiedadById(id) {
        const propiedad = await this.propiedadRepository.findOne({
            where: { id },
            relations: ['usuario']
        });
        if (!propiedad) throw new NotFoundError('Propiedad no encontrada');
        return propiedad;
    }

    async getPropiedadByUbicacion(ubicacion) {
        return await this.propiedadRepository.find({
            where: { ubicacion },
            relations: ['usuario']
        });

    }

    async getPropiedadesByUserId(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['propiedades']
        });
        if (!user) throw new NotFoundError('Usuario no encontrado');
        return user.propiedades;
    }

    async updatePropiedad(id, data) {
        await this.propiedadRepository.update(id, data);
        return await this.getPropiedadById(id);
    }

    async deletePropiedad(id) {
        const result = await this.propiedadRepository.delete(id);
        if (result.affected === 0) throw new NotFoundError('Propiedad no encontrada');
    }
}
