// tests/services/userService.test.js
import { UserService } from '../../services/userServices.js';
import bcrypt from 'bcrypt';
import cacheService from '../../services/cacheServices.js';

describe('UserService', () => {
    let userService;
    let mockUserRepo;

    beforeEach(() => {
        mockUserRepo = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        };

        userService = new UserService();
        userService.userRepository = mockUserRepo;
    });

    describe('createUser', () => {
        it('debería crear un usuario correctamente', async () => {
            // Arrange
            const userData = {
                nombre: 'Juan Pérez',
                email: 'juan@example.com',
                contraseña: 'password123',
                rol: 'inquilino'
            };

            const expectedUser = {
                ...userData,
                contraseña: 'hashedPassword',
                fecha_registro: expect.any(Date)
            };

            const savedUser = { id: 1, ...expectedUser };

            mockUserRepo.create.mockReturnValue(expectedUser);
            mockUserRepo.save.mockResolvedValue(savedUser);
            bcrypt.hash.mockResolvedValue('hashedPassword');

            // Act
            const result = await userService.createUser(userData);

            // Assert
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(mockUserRepo.create).toHaveBeenCalledWith(expectedUser);
            expect(mockUserRepo.save).toHaveBeenCalledWith(expectedUser);
            expect(cacheService.limpiarCacheUsuarios).toHaveBeenCalled();
            expect(result).toEqual(savedUser);
        });

        it('debería manejar errores al crear usuario', async () => {
            // Arrange
            const userData = { nombre: 'Test', email: 'test@test.com', contraseña: 'test' };
            const error = new Error('Database error');

            bcrypt.hash.mockResolvedValue('hashedPassword');
            mockUserRepo.create.mockReturnValue(userData);
            mockUserRepo.save.mockRejectedValue(error);

            // Act & Assert
            await expect(userService.createUser(userData))
                .rejects.toThrow('Database error');
        });
    });

    describe('getUsers', () => {
        it('debería retornar usuarios del cache si están disponibles', async () => {
            // Arrange
            const cachedUsers = [
                { id: 1, nombre: 'Usuario 1', email: 'user1@test.com' },
                { id: 2, nombre: 'Usuario 2', email: 'user2@test.com' }
            ];

            cacheService.getUsuarios.mockResolvedValue(cachedUsers);

            // Act
            const result = await userService.getUsers();

            // Assert
            expect(cacheService.getUsuarios).toHaveBeenCalled();
            expect(mockUserRepo.find).not.toHaveBeenCalled();
            expect(result).toEqual(cachedUsers);
        });

        it('debería obtener usuarios de BD si no están en cache', async () => {
            // Arrange
            const users = [
                { id: 1, nombre: 'Usuario 1', email: 'user1@test.com' },
                { id: 2, nombre: 'Usuario 2', email: 'user2@test.com' }
            ];

            cacheService.getUsuarios.mockResolvedValue(null);
            mockUserRepo.find.mockResolvedValue(users);

            // Act
            const result = await userService.getUsers();

            // Assert
            expect(cacheService.getUsuarios).toHaveBeenCalled();
            expect(mockUserRepo.find).toHaveBeenCalled();
            expect(cacheService.setUsuarios).toHaveBeenCalledWith(users);
            expect(result).toEqual(users);
        });

        it('debería usar fallback a BD si cache falla', async () => {
            // Arrange
            const users = [{ id: 1, nombre: 'Usuario 1' }];

            cacheService.getUsuarios.mockRejectedValue(new Error('Cache error'));
            mockUserRepo.find.mockResolvedValue(users);

            // Act
            const result = await userService.getUsers();

            // Assert
            expect(result).toEqual(users);
        });
    });

    describe('getUserById', () => {
        it('debería retornar usuario del cache si está disponible', async () => {
            // Arrange
            const cachedUser = { id: 1, nombre: 'Usuario 1', email: 'user1@test.com' };
            cacheService.getUsuario.mockResolvedValue(cachedUser);

            // Act
            const result = await userService.getUserById(1);

            // Assert
            expect(cacheService.getUsuario).toHaveBeenCalledWith(1);
            expect(mockUserRepo.findOneBy).not.toHaveBeenCalled();
            expect(result).toEqual(cachedUser);
        });

        it('debería obtener usuario de BD si no está en cache', async () => {
            // Arrange
            const user = { id: 1, nombre: 'Usuario 1', email: 'user1@test.com' };

            cacheService.getUsuario.mockResolvedValue(null);
            mockUserRepo.findOneBy.mockResolvedValue(user);

            // Act
            const result = await userService.getUserById(1);

            // Assert
            expect(mockUserRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
            expect(cacheService.setUsuario).toHaveBeenCalledWith(1, user);
            expect(result).toEqual(user);
        });

        it('debería retornar null si usuario no existe', async () => {
            // Arrange
            cacheService.getUsuario.mockResolvedValue(null);
            mockUserRepo.findOneBy.mockResolvedValue(null);

            // Act
            const result = await userService.getUserById(999);

            // Assert
            expect(result).toBeNull();
        });

        it('debería usar fallback si cache falla', async () => {
            // Arrange
            const user = { id: 1, nombre: 'Usuario 1' };

            cacheService.getUsuario.mockRejectedValue(new Error('Cache error'));
            mockUserRepo.findOneBy.mockResolvedValue(user);

            // Act
            const result = await userService.getUserById(1);

            // Assert
            expect(result).toEqual(user);
        });
    });

    describe('updateUser', () => {
        it('debería actualizar usuario correctamente', async () => {
            // Arrange
            const updateData = { nombre: 'Nombre actualizado' };
            const updatedUser = { id: 1, ...updateData };

            mockUserRepo.update.mockResolvedValue({ affected: 1 });

            // Mock getUserById
            jest.spyOn(userService, 'getUserById')
                .mockResolvedValue(updatedUser);

            // Act
            const result = await userService.updateUser(1, updateData);

            // Assert
            expect(mockUserRepo.update).toHaveBeenCalledWith(1, updateData);
            expect(cacheService.limpiarCacheUsuarios).toHaveBeenCalled();
            expect(cacheService.limpiarCachePropiedades).toHaveBeenCalled();
            expect(result).toEqual(updatedUser);
        });

        it('debería hashear contraseña al actualizar', async () => {
            // Arrange
            const updateData = { contraseña: 'newPassword' };
            const hashedData = { contraseña: 'hashedPassword' };
            const updatedUser = { id: 1, ...hashedData };

            bcrypt.hash.mockResolvedValue('hashedPassword');
            mockUserRepo.update.mockResolvedValue({ affected: 1 });

            jest.spyOn(userService, 'getUserById')
                .mockResolvedValue(updatedUser);

            // Act
            const result = await userService.updateUser(1, updateData);

            // Assert
            expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
            expect(mockUserRepo.update).toHaveBeenCalledWith(1, hashedData);
            expect(result).toEqual(updatedUser);
        });
    });

    describe('deleteUser', () => {
        it('debería eliminar usuario correctamente', async () => {
            // Arrange
            mockUserRepo.delete.mockResolvedValue({ affected: 1 });

            // Act
            const result = await userService.deleteUser(1);

            // Assert
            expect(mockUserRepo.delete).toHaveBeenCalledWith(1);
            expect(cacheService.limpiarCacheUsuarios).toHaveBeenCalled();
            expect(cacheService.limpiarCachePropiedades).toHaveBeenCalled();
            expect(cacheService.limpiarCacheReservas).toHaveBeenCalled();
            expect(cacheService.limpiarCacheResenias).toHaveBeenCalled();
            expect(result).toEqual({ affected: 1 });
        });
    });

    describe('getPropiedadsByUserId', () => {
        it('debería retornar propiedades del usuario desde cache', async () => {
            // Arrange
            const propiedades = [{ id: 1, titulo: 'Propiedad 1' }];
            cacheService.getPropiedadesByUser.mockResolvedValue(propiedades);

            // Act
            const result = await userService.getPropiedadsByUserId(1);

            // Assert
            expect(cacheService.getPropiedadesByUser).toHaveBeenCalledWith(1);
            expect(result).toEqual([{ propiedades: propiedades }]);
        });

        it('debería obtener propiedades del usuario desde BD', async () => {
            // Arrange
            const userWithPropiedades = [{
                id: 1,
                propiedades: [{ id: 1, titulo: 'Propiedad 1' }]
            }];

            cacheService.getPropiedadesByUser.mockResolvedValue(null);
            mockUserRepo.find.mockResolvedValue(userWithPropiedades);

            // Act
            const result = await userService.getPropiedadsByUserId(1);

            // Assert
            expect(mockUserRepo.find).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['propiedades']
            });
            expect(cacheService.setPropiedadesByUser).toHaveBeenCalledWith(
                1,
                userWithPropiedades[0].propiedades
            );
            expect(result).toEqual(userWithPropiedades);
        });

        it('debería usar fallback si cache falla', async () => {
            // Arrange
            const userWithPropiedades = [{ id: 1, propiedades: [] }];

            cacheService.getPropiedadesByUser.mockRejectedValue(new Error('Cache error'));
            mockUserRepo.find.mockResolvedValue(userWithPropiedades);

            // Act
            const result = await userService.getPropiedadsByUserId(1);

            // Assert
            expect(result).toEqual(userWithPropiedades);
        });
    });
});