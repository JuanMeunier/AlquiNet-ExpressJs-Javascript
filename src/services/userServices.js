import { AppDataSource } from '../config/data-source.js';
import { User } from '../entities/User.js';
import bcrypt from 'bcrypt';

export class UserService {
  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async createUser(data) {
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(data.contraseña, 10);
    const newUser = this.userRepository.create({
      ...data,
      contraseña: hashedPassword,
      fecha_registro: new Date()
    });
    return await this.userRepository.save(newUser);
  }

  async getUsers() {
    return await this.userRepository.find();
  }

  async getUserById(id) {
    return await this.userRepository.findOneBy({ id });
  }

  async getPropiedadsByUserId(userId) {
    return await this.userRepository.find({
      where: { id: userId },
      relations: ['propiedades']
    });
  }

  async updateUser(id, data) {
    if (data.contraseña) {
      data.contraseña = await bcrypt.hash(data.contraseña, 10);
    }
    await this.userRepository.update(id, data);
    return await this.getUserById(id);
  }

  async deleteUser(id) {
    return await this.userRepository.delete(id);
  }
}