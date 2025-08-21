// tests/services/reseniaService.test.js
import { ReseniaService } from '../../services/reseniaServices.js';
import cacheService from '../../services/cacheServices.js';

describe('ReseniaService', () => {
    let reseniaService;
    let mockReseniaRepo;
    let mockPropiedadRepo;
    let mockUsuarioRepo;

    beforeEach(() => {
        mockReseniaRepo = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn()
        };

        mockPropiedadRepo = {
            findOne: jest.fn()
        };

        mockUsuarioRepo = {
            findOne: jest.fn()
        };

        reseniaService = new ReseniaService();
        reseniaService.reseniaRepository = mockReseniaRepo;
        reseniaService.propiedadRepository = mockPropiedadRepo;
        reseniaService.usuarioRepository = mockUsuarioRepo;
    });

    describe('createResenia', () => {
        it('debería crear una reseña correctamente', async () => {
            // Arrange
            const reseniaData = {
                inquilinoId: 1,
                propiedadId: 2,
                comentario: 'Excelente propiedad',
                puntaje: 5
            };

            const inquilino = { id: 1, nombre: 'Juan' };
            const propiedad = { id: 2, titulo: 'Casa Test' };
            const savedResenia = { id: 1, ...reseniaData, inquilino, propiedad };

            mockUsuarioRepo.findOne.mockResolvedValue(inquilino);
            mockPropiedadRepo.findOne.mockResolvedValue(propiedad);
            mockReseniaRepo.findOne.mockResolvedValue(null); // No existe reseña duplicada
            mockReseniaRepo.create.mockReturnValue(savedResenia);
            mockReseniaRepo.save.mockResolvedValue(savedResenia);

            // Act
            const result = await reseniaService.createResenia(reseniaData);

            // Assert
            expect(mockUsuarioRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(mockPropiedadRepo.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
            expect(mockReseniaRepo.findOne).toHaveBeenCalledWith({
                where: { inquilino: { id: 1 }, propiedad: { id: 2 } }
            });
            expect(mockReseniaRepo.create).toHaveBeenCalledWith({
                comentario: 'Excelente propiedad',
                puntaje: 5,
                inquilino,
                propiedad
            });
            expect(mockReseniaRepo.save).toHaveBeenCalled();
            expect(cacheService.limpiarCacheResenias).toHaveBeenCalled();
            expect(result).toEqual(savedResenia);
        });

        it('debería lanzar error si inquilino no existe', async () => {
            // Arrange
            const reseniaData = { inquilinoId: 999, propiedadId: 2, puntaje: 5 };

            mockUsuarioRepo.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(reseniaService.createResenia(reseniaData))
                .rejects.toThrow('Usuario (inquilino) con id 999 no encontrado');
        });

        it('debería lanzar error si propiedad no existe', async () => {
            // Arrange
            const reseniaData = { inquilinoId: 1, propiedadId: 999, puntaje: 5 };
            const inquilino = { id: 1, nombre: 'Juan' };

            mockUsuarioRepo.findOne.mockResolvedValue(inquilino);
            mockPropiedadRepo.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(reseniaService.createResenia(reseniaData))
                .rejects.toThrow('Propiedad con id 999 no encontrada');
        });

        it('debería lanzar error si ya existe una reseña del mismo inquilino para la propiedad', async () => {
            // Arrange
            const reseniaData = { inquilinoId: 1, propiedadId: 2, puntaje: 5 };
            const inquilino = { id: 1, nombre: 'Juan' };
            const propiedad = { id: 2, titulo: 'Casa Test' };
            const reseniaExistente = { id: 1, inquilino, propiedad };

            mockUsuarioRepo.findOne.mockResolvedValue(inquilino);
            mockPropiedadRepo.findOne.mockResolvedValue(propiedad);
            mockReseniaRepo.findOne.mockResolvedValue(reseniaExistente);

            // Act & Assert
            await expect(reseniaService.createResenia(reseniaData))
                .rejects.toThrow('El inquilino ya ha realizado una reseña para esta propiedad');
        });
    });

    describe('getAllResenias', () => {
        it('debería retornar reseñas del cache si están disponibles', async () => {
            // Arrange
            const cachedResenias = [
                { id: 1, puntaje: 5, comentario: 'Excelente' },
                { id: 2, puntaje: 4, comentario: 'Muy buena' }
            ];

            cacheService.getResenias.mockResolvedValue(cachedResenias);

            // Act
            const result = await reseniaService.getAllResenias();

            // Assert
            expect(cacheService.getResenias).toHaveBeenCalled();
            expect(mockReseniaRepo.find).not.toHaveBeenCalled();
            expect(result).toEqual(cachedResenias);
        });

        it('debería obtener reseñas de BD si no están en cache', async () => {
            // Arrange
            const resenias = [
                { id: 1, puntaje: 5, comentario: 'Excelente', inquilino: { id: 1 }, propiedad: { id: 2 } },
                { id: 2, puntaje: 4, comentario: 'Muy buena', inquilino: { id: 3 }, propiedad: { id: 4 } }
            ];

            cacheService.getResenias.mockResolvedValue(null);
            mockReseniaRepo.find.mockResolvedValue(resenias);

            // Act
            const result = await reseniaService.getAllResenias();

            // Assert
            expect(mockReseniaRepo.find).toHaveBeenCalledWith({
                relations: ['inquilino', 'propiedad'],
                order: { fecha: 'DESC' }
            });
            expect(cacheService.setResenias).toHaveBeenCalledWith(resenias);
            expect(result).toEqual(resenias);
        });

        it('debería usar fallback a BD si cache falla', async () => {
            // Arrange
            const resenias = [{ id: 1, puntaje: 5, comentario: 'Excelente' }];

            cacheService.getResenias.mockRejectedValue(new Error('Cache error'));
            mockReseniaRepo.find.mockResolvedValue(resenias);

            // Act
            const result = await reseniaService.getAllResenias();

            // Assert
            expect(result).toEqual(resenias);
        });
    });

    describe('getReseniasPorPropiedad', () => {
        it('debería retornar reseñas de la propiedad desde cache', async () => {
            // Arrange
            const resenias = [{ id: 1, puntaje: 5, comentario: 'Excelente' }];
            cacheService.getReseniasByPropiedad.mockResolvedValue(resenias);

            // Act
            const result = await reseniaService.getReseniasPorPropiedad(2);

            // Assert
            expect(cacheService.getReseniasByPropiedad).toHaveBeenCalledWith(2);
            expect(result).toEqual(resenias);
        });

        it('debería obtener reseñas de la propiedad desde BD', async () => {
            // Arrange
            const propiedad = { id: 2, titulo: 'Casa Test' };
            const resenias = [{ id: 1, puntaje: 5, comentario: 'Excelente', inquilino: { id: 1 } }];

            cacheService.getReseniasByPropiedad.mockResolvedValue(null);
            mockPropiedadRepo.findOne.mockResolvedValue(propiedad);
            mockReseniaRepo.find.mockResolvedValue(resenias);

            // Act
            const result = await reseniaService.getReseniasPorPropiedad(2);

            // Assert
            expect(mockPropiedadRepo.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
            expect(mockReseniaRepo.find).toHaveBeenCalledWith({
                where: { propiedad: { id: 2 } },
                relations: ['inquilino'],
                order: { fecha: 'DESC' }
            });
            expect(cacheService.setReseniasByPropiedad).toHaveBeenCalledWith(2, resenias);
            expect(result).toEqual(resenias);
        });

        it('debería lanzar error si propiedad no existe', async () => {
            // Arrange
            cacheService.getReseniasByPropiedad.mockResolvedValue(null);
            mockPropiedadRepo.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(reseniaService.getReseniasPorPropiedad(999))
                .rejects.toThrow('Propiedad con id 999 no encontrada');
        });
    });

    describe('getReseniasPorInquilino', () => {
        it('debería retornar reseñas del inquilino desde cache', async () => {
            // Arrange
            const resenias = [{ id: 1, puntaje: 5, comentario: 'Excelente' }];
            cacheService.getReseniasByInquilino.mockResolvedValue(resenias);

            // Act
            const result = await reseniaService.getReseniasPorInquilino(1);

            // Assert
            expect(cacheService.getReseniasByInquilino).toHaveBeenCalledWith(1);
            expect(result).toEqual(resenias);
        });

        it('debería obtener reseñas del inquilino desde BD', async () => {
            // Arrange
            const inquilino = { id: 1, nombre: 'Juan' };
            const resenias = [{ id: 1, puntaje: 5, comentario: 'Excelente', propiedad: { id: 2 } }];

            cacheService.getReseniasByInquilino.mockResolvedValue(null);
            mockUsuarioRepo.findOne.mockResolvedValue(inquilino);
            mockReseniaRepo.find.mockResolvedValue(resenias);

            // Act
            const result = await reseniaService.getReseniasPorInquilino(1);

            // Assert
            expect(mockUsuarioRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(mockReseniaRepo.find).toHaveBeenCalledWith({
                where: { inquilino: { id: 1 } },
                relations: ['propiedad'],
                order: { fecha: 'DESC' }
            });
            expect(cacheService.setReseniasByInquilino).toHaveBeenCalledWith(1, resenias);
            expect(result).toEqual(resenias);
        });

        it('debería lanzar error si inquilino no existe', async () => {
            // Arrange
            cacheService.getReseniasByInquilino.mockResolvedValue(null);
            mockUsuarioRepo.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(reseniaService.getReseniasPorInquilino(999))
                .rejects.toThrow('Usuario (inquilino) con id 999 no encontrado');
        });
    });

    describe('getReseniaById', () => {
        it('debería retornar reseña del cache si está disponible', async () => {
            // Arrange
            const cachedResenia = { id: 1, puntaje: 5, comentario: 'Excelente' };
            cacheService.getResenia.mockResolvedValue(cachedResenia);

            // Act
            const result = await reseniaService.getReseniaById(1);

            // Assert
            expect(cacheService.getResenia).toHaveBeenCalledWith(1);
            expect(result).toEqual(cachedResenia);
        });

        it('debería obtener reseña de BD si no está en cache', async () => {
            // Arrange
            const resenia = {
                id: 1,
                puntaje: 5,
                comentario: 'Excelente',
                inquilino: { id: 1 },
                propiedad: { id: 2 }
            };

            cacheService.getResenia.mockResolvedValue(null);
            mockReseniaRepo.findOne.mockResolvedValue(resenia);

            // Act
            const result = await reseniaService.getReseniaById(1);

            // Assert
            expect(mockReseniaRepo.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['inquilino', 'propiedad']
            });
            expect(cacheService.setResenia).toHaveBeenCalledWith(1, resenia);
            expect(result).toEqual(resenia);
        });

        it('debería lanzar error si reseña no existe', async () => {
            // Arrange
            cacheService.getResenia.mockResolvedValue(null);
            mockReseniaRepo.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(reseniaService.getReseniaById(999))
                .rejects.toThrow('Reseña con id 999 no encontrada');
        });

        it('debería usar fallback si cache falla', async () => {
            // Arrange
            const resenia = { id: 1, puntaje: 5, comentario: 'Excelente' };

            cacheService.getResenia.mockRejectedValue(new Error('Cache error'));
            mockReseniaRepo.findOne.mockResolvedValue(resenia);

            // Act
            const result = await reseniaService.getReseniaById(1);

            // Assert
            expect(result).toEqual(resenia);
        });

        it('debería lanzar error en fallback si reseña no existe', async () => {
            // Arrange
            cacheService.getResenia.mockRejectedValue(new Error('Cache error'));
            mockReseniaRepo.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(reseniaService.getReseniaById(999))
                .rejects.toThrow('Reseña con id 999 no encontrada');
        });
    });

    describe('updateResenia', () => {
        it('debería actualizar reseña correctamente', async () => {
            // Arrange
            const updateData = { comentario: 'Comentario actualizado', puntaje: 4 };
            const existingResenia = { id: 1, comentario: 'Comentario anterior', puntaje: 5 };
            const updatedResenia = { id: 1, ...updateData };

            mockReseniaRepo.findOne.mockResolvedValue(existingResenia);
            mockReseniaRepo.save.mockResolvedValue(updatedResenia);

            // Act
            const result = await reseniaService.updateResenia(1, updateData);

            // Assert
            expect(mockReseniaRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(mockReseniaRepo.save).toHaveBeenCalledWith({
                ...existingResenia,
                comentario: 'Comentario actualizado',
                puntaje: 4
            });
            expect(cacheService.limpiarCacheResenias).toHaveBeenCalled();
            expect(result).toEqual(updatedResenia);
        });

        it('debería actualizar solo los campos proporcionados', async () => {
            // Arrange
            const updateData = { comentario: 'Solo comentario' };
            const existingResenia = { id: 1, comentario: 'Comentario anterior', puntaje: 5 };
            const updatedResenia = { id: 1, comentario: 'Solo comentario', puntaje: 5 };

            mockReseniaRepo.findOne.mockResolvedValue(existingResenia);
            mockReseniaRepo.save.mockResolvedValue(updatedResenia);

            // Act
            const result = await reseniaService.updateResenia(1, updateData);

            // Assert
            expect(mockReseniaRepo.save).toHaveBeenCalledWith({
                ...existingResenia,
                comentario: 'Solo comentario'
            });
            expect(result).toEqual(updatedResenia);
        });

        it('debería lanzar error si reseña no existe', async () => {
            // Arrange
            const updateData = { comentario: 'Test' };
            mockReseniaRepo.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(reseniaService.updateResenia(999, updateData))
                .rejects.toThrow('Reseña con id 999 no encontrada');
        });
    });

    describe('deleteResenia', () => {
        it('debería eliminar reseña correctamente', async () => {
            // Arrange
            const existingResenia = { id: 1, comentario: 'Test', puntaje: 5 };
            const deletedResenia = { ...existingResenia };

            mockReseniaRepo.findOne.mockResolvedValue(existingResenia);
            mockReseniaRepo.remove.mockResolvedValue(deletedResenia);

            // Act
            const result = await reseniaService.deleteResenia(1);

            // Assert
            expect(mockReseniaRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(mockReseniaRepo.remove).toHaveBeenCalledWith(existingResenia);
            expect(cacheService.limpiarCacheResenias).toHaveBeenCalled();
            expect(result).toEqual(deletedResenia);
        });

        it('debería lanzar error si reseña no existe', async () => {
            // Arrange
            mockReseniaRepo.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(reseniaService.deleteResenia(999))
                .rejects.toThrow('Reseña con id 999 no encontrada');
        });
    });
});