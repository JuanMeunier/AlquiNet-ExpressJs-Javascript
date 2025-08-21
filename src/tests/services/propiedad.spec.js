// tests/services/propiedadService.test.js
import { PropiedadService } from '../../services/propiedadServices.js';
import cacheService from '../../services/cacheServices.js';

describe('PropiedadService', () => {
    let propiedadService;
    let mockPropiedadRepo;
    let mockUserRepo;

    beforeEach(() => {
        // Mock repositories
        mockPropiedadRepo = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        };

        mockUserRepo = {
            findOne: jest.fn()
        };

        // Mock AppDataSource
        jest.doMock('../../src/config/database.js', () => ({
            AppDataSource: {
                getRepository: jest.fn((entity) => {
                    if (entity.name === 'Propiedad') return mockPropiedadRepo;
                    if (entity.name === 'Usuario') return mockUserRepo;
                })
            }
        }));

        propiedadService = new PropiedadService();
        propiedadService.propiedadRepository = mockPropiedadRepo;
        propiedadService.userRepository = mockUserRepo;
    });

    describe('createPropiedad', () => {
        it('debería crear una propiedad correctamente', async () => {
            // Arrange
            const propiedadData = {
                titulo: 'Casa en el centro',
                descripcion: 'Hermosa casa',
                ubicacion: { ciudad: 'Buenos Aires', provincia: 'Buenos Aires' },
                precio: 100000,
                tipo: 'casa',
                propietario_id: 1
            };

            const savedPropiedad = { id: 1, ...propiedadData };

            mockPropiedadRepo.create.mockReturnValue(propiedadData);
            mockPropiedadRepo.save.mockResolvedValue(savedPropiedad);

            // Act
            const result = await propiedadService.createPropiedad(propiedadData);

            // Assert
            expect(mockPropiedadRepo.create).toHaveBeenCalledWith(propiedadData);
            expect(mockPropiedadRepo.save).toHaveBeenCalledWith(propiedadData);
            expect(cacheService.limpiarCachePropiedades).toHaveBeenCalled();
            expect(result).toEqual(savedPropiedad);
        });

        it('debería manejar errores al crear propiedad', async () => {
            // Arrange
            const propiedadData = { titulo: 'Test' };
            const error = new Error('Database error');

            mockPropiedadRepo.create.mockReturnValue(propiedadData);
            mockPropiedadRepo.save.mockRejectedValue(error);

            // Act & Assert
            await expect(propiedadService.createPropiedad(propiedadData))
                .rejects.toThrow('Database error');
        });
    });

    describe('getPropiedades', () => {
        it('debería retornar propiedades del cache si están disponibles', async () => {
            // Arrange
            const cachedPropiedades = [
                { id: 1, titulo: 'Propiedad 1' },
                { id: 2, titulo: 'Propiedad 2' }
            ];

            cacheService.getPropiedades.mockResolvedValue(cachedPropiedades);

            // Act
            const result = await propiedadService.getPropiedades();

            // Assert
            expect(cacheService.getPropiedades).toHaveBeenCalled();
            expect(mockPropiedadRepo.find).not.toHaveBeenCalled();
            expect(result).toEqual(cachedPropiedades);
        });

        it('debería obtener propiedades de BD si no están en cache', async () => {
            // Arrange
            const propiedades = [
                { id: 1, titulo: 'Propiedad 1', propietario: { id: 1 } },
                { id: 2, titulo: 'Propiedad 2', propietario: { id: 2 } }
            ];

            cacheService.getPropiedades.mockResolvedValue(null);
            mockPropiedadRepo.find.mockResolvedValue(propiedades);

            // Act
            const result = await propiedadService.getPropiedades();

            // Assert
            expect(cacheService.getPropiedades).toHaveBeenCalled();
            expect(mockPropiedadRepo.find).toHaveBeenCalledWith({
                relations: ['propietario']
            });
            expect(cacheService.setPropiedades).toHaveBeenCalledWith(propiedades);
            expect(result).toEqual(propiedades);
        });

        it('debería usar fallback a BD si cache falla', async () => {
            // Arrange
            const propiedades = [{ id: 1, titulo: 'Propiedad 1' }];

            cacheService.getPropiedades.mockRejectedValue(new Error('Cache error'));
            mockPropiedadRepo.find.mockResolvedValue(propiedades);

            // Act
            const result = await propiedadService.getPropiedades();

            // Assert
            expect(result).toEqual(propiedades);
        });
    });

    describe('getPropiedadById', () => {
        it('debería retornar propiedad del cache si está disponible', async () => {
            // Arrange
            const cachedPropiedad = { id: 1, titulo: 'Propiedad 1' };
            cacheService.getPropiedad.mockResolvedValue(cachedPropiedad);

            // Act
            const result = await propiedadService.getPropiedadById(1);

            // Assert
            expect(cacheService.getPropiedad).toHaveBeenCalledWith(1);
            expect(result).toEqual(cachedPropiedad);
        });

        it('debería obtener propiedad de BD si no está en cache', async () => {
            // Arrange
            const propiedad = { id: 1, titulo: 'Propiedad 1', propietario: { id: 1 } };

            cacheService.getPropiedad.mockResolvedValue(null);
            mockPropiedadRepo.findOne.mockResolvedValue(propiedad);

            // Act
            const result = await propiedadService.getPropiedadById(1);

            // Assert
            expect(mockPropiedadRepo.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['propietario']
            });
            expect(cacheService.setPropiedad).toHaveBeenCalledWith(1, propiedad);
            expect(result).toEqual(propiedad);
        });

        it('debería lanzar error 404 si propiedad no existe', async () => {
            // Arrange
            cacheService.getPropiedad.mockResolvedValue(null);
            mockPropiedadRepo.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(propiedadService.getPropiedadById(999))
                .rejects.toEqual({ status: 404, message: 'Propiedad no encontrada' });
        });
    });

    describe('getPropiedadesByUserId', () => {
        it('debería retornar propiedades del usuario desde cache', async () => {
            // Arrange
            const propiedades = [{ id: 1, titulo: 'Propiedad 1' }];
            cacheService.getPropiedadesByUser.mockResolvedValue(propiedades);

            // Act
            const result = await propiedadService.getPropiedadesByUserId(1);

            // Assert
            expect(cacheService.getPropiedadesByUser).toHaveBeenCalledWith(1);
            expect(result).toEqual(propiedades);
        });

        it('debería obtener propiedades del usuario desde BD', async () => {
            // Arrange
            const user = {
                id: 1,
                propiedades: [{ id: 1, titulo: 'Propiedad 1' }]
            };

            cacheService.getPropiedadesByUser.mockResolvedValue(null);
            mockUserRepo.findOne.mockResolvedValue(user);

            // Act
            const result = await propiedadService.getPropiedadesByUserId(1);

            // Assert
            expect(mockUserRepo.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['propiedades']
            });
            expect(cacheService.setPropiedadesByUser).toHaveBeenCalledWith(1, user.propiedades);
            expect(result).toEqual(user.propiedades);
        });

        it('debería lanzar error si usuario no existe', async () => {
            // Arrange
            cacheService.getPropiedadesByUser.mockResolvedValue(null);
            mockUserRepo.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(propiedadService.getPropiedadesByUserId(999))
                .rejects.toEqual({ status: 404, message: 'Usuario no encontrado' });
        });
    });

    describe('updatePropiedad', () => {
        it('debería actualizar propiedad correctamente', async () => {
            // Arrange
            const updateData = { titulo: 'Título actualizado' };
            const updatedPropiedad = { id: 1, ...updateData };

            mockPropiedadRepo.update.mockResolvedValue({ affected: 1 });

            // Mock getPropiedadById para simular la propiedad actualizada
            jest.spyOn(propiedadService, 'getPropiedadById')
                .mockResolvedValue(updatedPropiedad);

            // Act
            const result = await propiedadService.updatePropiedad(1, updateData);

            // Assert
            expect(mockPropiedadRepo.update).toHaveBeenCalledWith(1, updateData);
            expect(cacheService.limpiarCachePropiedades).toHaveBeenCalled();
            expect(result).toEqual(updatedPropiedad);
        });
    });

    describe('deletePropiedad', () => {
        it('debería eliminar propiedad correctamente', async () => {
            // Arrange
            mockPropiedadRepo.delete.mockResolvedValue({ affected: 1 });

            // Act
            const result = await propiedadService.deletePropiedad(1);

            // Assert
            expect(mockPropiedadRepo.delete).toHaveBeenCalledWith(1);
            expect(cacheService.limpiarCachePropiedades).toHaveBeenCalled();
            expect(result).toEqual({ affected: 1 });
        });

        it('debería lanzar error si propiedad no existe', async () => {
            // Arrange
            mockPropiedadRepo.delete.mockResolvedValue({ affected: 0 });

            // Act & Assert
            await expect(propiedadService.deletePropiedad(999))
                .rejects.toEqual({ status: 404, message: 'Propiedad no encontrada' });
        });
    });
});