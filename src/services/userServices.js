import { AppDataSource } from '../config/database.js';
import Usuario from '../entities/usuario.js';
import bcrypt from 'bcrypt';
import cacheService from './cacheServices.js';
import logger from '../config/logger.js';

export class UserService {
  constructor() {
    this.userRepository = AppDataSource.getRepository(Usuario);
  }

  async createUser(data) {
    try {
      logger.info(`Creando nuevo usuario: ${data.email}`);

      // Hashear contraseña
      const hashedPassword = await bcrypt.hash(data.contraseña, 10);
      const newUser = this.userRepository.create({
        ...data,
        contraseña: hashedPassword,
        fecha_registro: new Date()
      });

      const savedUser = await this.userRepository.save(newUser);

      // Limpiar cache después de crear usuario
      await cacheService.limpiarCacheUsuarios();

      logger.success(`Usuario creado exitosamente: ${savedUser.email}`);
      return savedUser;
    } catch (error) {
      logger.error('Error al crear usuario', error);
      throw error;
    }
  }

  async getUsers() {
    try {
      logger.info('Obteniendo lista de usuarios');

      // Intentar obtener del cache primero
      const cachedUsers = await cacheService.getUsuarios();
      if (cachedUsers) {
        logger.info('Usuarios obtenidos del cache');
        return cachedUsers;
      }

      // Si no está en cache, obtener de BD
      logger.info('Consultando usuarios en base de datos');
      const users = await this.userRepository.find();

      // Guardar en cache
      await cacheService.setUsuarios(users);
      logger.success(`${users.length} usuarios obtenidos exitosamente`);
      return users;
    } catch (error) {
      logger.error('Error al obtener usuarios', error);

      // Fallback: intentar solo BD
      try {
        return await this.userRepository.find();
      } catch (dbError) {
        logger.error('Error también en consulta de base de datos', dbError);
        throw dbError;
      }
    }
  }

  async getUserById(id) {
    try {
      logger.info(`Buscando usuario con ID: ${id}`);

      // Intentar obtener del cache primero
      const cachedUser = await cacheService.getUsuario(id);
      if (cachedUser) {
        logger.info(`Usuario ${id} obtenido del cache`);
        return cachedUser;
      }

      // Si no está en cache, obtener de BD
      const user = await this.userRepository.findOneBy({ id });

      if (user) {
        // Guardar en cache solo si se encontró el usuario
        await cacheService.setUsuario(id, user);
        logger.success(`Usuario ${id} obtenido exitosamente: ${user.email}`);
      } else {
        logger.warn(`Usuario con ID ${id} no encontrado`);
      }

      return user;
    } catch (error) {
      logger.error(`Error al buscar usuario ${id}`, error);

      // Fallback: intentar solo BD
      try {
        return await this.userRepository.findOneBy({ id });
      } catch (dbError) {
        logger.error('Error también en consulta de base de datos', dbError);
        throw dbError;
      }
    }
  }

  async getPropiedadsByUserId(userId) {
    try {
      logger.info(`Obteniendo propiedades del usuario: ${userId}`);

      // Para este método específico, intentamos obtener del cache de propiedades
      const cachedPropiedades = await cacheService.getPropiedadesByUser(userId);
      if (cachedPropiedades) {
        logger.info(`Propiedades del usuario ${userId} obtenidas del cache`);
        return [{ propiedades: cachedPropiedades }]; // Mantener formato original
      }

      // Si no está en cache, obtener de BD
      const userWithPropiedades = await this.userRepository.find({
        where: { id: userId },
        relations: ['propiedades']
      });

      if (userWithPropiedades.length > 0 && userWithPropiedades[0].propiedades) {
        // Guardar en cache
        await cacheService.setPropiedadesByUser(userId, userWithPropiedades[0].propiedades);
        logger.success(`${userWithPropiedades[0].propiedades.length} propiedades obtenidas para usuario ${userId}`);
      }

      return userWithPropiedades;
    } catch (error) {
      logger.error(`Error al obtener propiedades del usuario ${userId}`, error);

      // Fallback: intentar solo BD
      try {
        return await this.userRepository.find({
          where: { id: userId },
          relations: ['propiedades']
        });
      } catch (dbError) {
        logger.error('Error también en consulta de base de datos', dbError);
        throw dbError;
      }
    }
  }

  async updateUser(id, data) {
    try {
      logger.info(`Actualizando usuario ${id}`);

      if (data.contraseña) {
        data.contraseña = await bcrypt.hash(data.contraseña, 10);
        logger.info('Contraseña actualizada y hasheada');
      }

      await this.userRepository.update(id, data);
      const updatedUser = await this.getUserById(id);

      // Limpiar cache después de actualizar
      await cacheService.limpiarCacheUsuarios();
      // También limpiar cache de propiedades si el usuario era propietario
      await cacheService.limpiarCachePropiedades();

      logger.success(`Usuario ${id} actualizado exitosamente`);
      return updatedUser;
    } catch (error) {
      logger.error(`Error al actualizar usuario ${id}`, error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      logger.info(`Eliminando usuario ${id}`);

      const result = await this.userRepository.delete(id);

      // Limpiar cache después de eliminar
      await cacheService.limpiarCacheUsuarios();
      // También limpiar cache de propiedades y reservas relacionadas
      await cacheService.limpiarCachePropiedades();
      await cacheService.limpiarCacheReservas();
      await cacheService.limpiarCacheResenias();

      logger.success(`Usuario ${id} eliminado exitosamente`);
      return result;
    } catch (error) {
      logger.error(`Error al eliminar usuario ${id}`, error);
      throw error;
    }
  }
}