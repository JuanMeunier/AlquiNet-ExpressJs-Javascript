import { AppDataSource } from '../config/database.js';
import Usuario from '../entities/usuario.js';
import bcrypt from 'bcrypt';
import cacheService from './cacheServices.js';

export class UserService {
  constructor() {
    this.userRepository = AppDataSource.getRepository(Usuario);
  }

  async createUser(data) {
    try {
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

      return savedUser;
    } catch (error) {
      throw error;
    }
  }

  async getUsers() {
    try {
      // Intentar obtener del cache primero
      const cachedUsers = await cacheService.getUsuarios();
      if (cachedUsers) {
        console.log('📦 Usuarios obtenidos del cache');
        return cachedUsers;
      }

      // Si no está en cache, obtener de BD
      console.log('🔍 Consultando usuarios en BD');
      const users = await this.userRepository.find();

      // Guardar en cache
      await cacheService.setUsuarios(users);

      return users;
    } catch (error) {
      console.error('❌ Error en getUsers:', error.message);
      return await this.userRepository.find();
    }
  }

  async getUserById(id) {
    try {
      // Intentar obtener del cache primero
      const cachedUser = await cacheService.getUsuario(id);
      if (cachedUser) {
        console.log(`📦 Usuario ${id} obtenido del cache`);
        return cachedUser;
      }

      // Si no está en cache, obtener de BD
      console.log(`🔍 Consultando usuario ${id} en BD`);
      const user = await this.userRepository.findOneBy({ id });

      if (user) {
        // Guardar en cache solo si se encontró el usuario
        await cacheService.setUsuario(id, user);
      }

      return user;
    } catch (error) {
      console.error('❌ Error en getUserById:', error.message);
      return await this.userRepository.findOneBy({ id });
    }
  }

  async getPropiedadsByUserId(userId) {
    try {
      // Para este método específico, intentamos obtener del cache de propiedades
      const cachedPropiedades = await cacheService.getPropiedadesByUser(userId);
      if (cachedPropiedades) {
        console.log(`📦 Propiedades del usuario ${userId} obtenidas del cache`);
        return [{ propiedades: cachedPropiedades }]; // Mantener formato original
      }

      // Si no está en cache, obtener de BD
      console.log(`🔍 Consultando propiedades del usuario ${userId} en BD`);
      const userWithPropiedades = await this.userRepository.find({
        where: { id: userId },
        relations: ['propiedades']
      });

      if (userWithPropiedades.length > 0 && userWithPropiedades[0].propiedades) {
        // Guardar en cache
        await cacheService.setPropiedadesByUser(userId, userWithPropiedades[0].propiedades);
      }

      return userWithPropiedades;
    } catch (error) {
      console.error('❌ Error en getPropiedadsByUserId:', error.message);
      return await this.userRepository.find({
        where: { id: userId },
        relations: ['propiedades']
      });
    }
  }

  async updateUser(id, data) {
    try {
      if (data.contraseña) {
        data.contraseña = await bcrypt.hash(data.contraseña, 10);
      }

      await this.userRepository.update(id, data);
      const updatedUser = await this.getUserById(id);

      // Limpiar cache después de actualizar
      await cacheService.limpiarCacheUsuarios();
      // También limpiar cache de propiedades si el usuario era propietario
      await cacheService.limpiarCachePropiedades();

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const result = await this.userRepository.delete(id);

      // Limpiar cache después de eliminar
      await cacheService.limpiarCacheUsuarios();
      // También limpiar cache de propiedades y reservas relacionadas
      await cacheService.limpiarCachePropiedades();
      await cacheService.limpiarCacheReservas();
      await cacheService.limpiarCacheResenias();

      return result;
    } catch (error) {
      throw error;
    }
  }
}