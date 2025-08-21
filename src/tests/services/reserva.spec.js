// tests/services/reservaService.test.js
import { ReservaService } from '../../services/reservaServices.js';
import cacheService from '../../services/cacheServices.js';

describe('ReservaService', () => {
    let reservaService;
    let mockReservaRepo;
    let mockPropiedadRepo;
    let mockUsuarioRepo;

    beforeEach(() => {
        mockReservaRepo = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        };

        mockPropiedadRepo = {
            findOne: jest.fn()
        };

        mockUsuarioRepo = {
            findOne: jest.fn()
        };

        reservaService = new ReservaService();
        reservaService.reservaRepository = mockReservaRepo;
        reservaService.propiedadRepository = mockPropiedadRepo;
        reservaService.usuarioRepository = mockUsuarioRepo;
    });

    describe('createReserva', () => {
        it('debería crear una reserva correctamente', async () => {
            // Arrange
            const reservaData = {
                propiedad_id: 1,
                inquilino_id: 2,
                fecha_inicio: '2024-12-01',
                fecha_fin: '2024-12-31'
            };

            const propiedad = { id: 1, titulo: 'Casa Test' };
            const inquilino = { id: 2, nombre: 'Juan' };
            const savedReserva = {
                id: 1,
                ...reservaData,
                estado: 'pendiente',
                fecha_solicitud: expect.any(Date)
            };

            mockPropiedadRepo.findOne.mockResolvedValue(propiedad);
            mockUsuarioRepo.findOne.mockResolvedValue(inquilino);
            mockReservaRepo.create.mockReturnValue(savedReserva);
            mockReservaRepo.save.mockResolvedValue(savedReserva);

            // Act
            const result = await reservaService.createReserva(reservaData);

            // Assert
            expect(mockPropiedadRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(mockUsuarioRepo.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
            expect(mockReservaRepo.create).toHaveBeenCalledWith({
                ...reservaData,
                estado: 'pendiente',
                fecha_solicitud: expect.any(Date)
            });
            expect(mockReservaRepo.save).toHaveBeenCalled();
            expect(cacheService.limpiarCacheReservas).toHaveBeenCalled();
            expect(result).toEqual(savedReserva);
        });

        it('debería lanzar error si propiedad no existe', async () => {
            // Arrange
            const reservaData = { propiedad_id: 999, inquilino_id: 2 };

            mockPropiedadRepo.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(reservaService.createReserva(reservaData))
                .rejects.toThrow('Propiedad no encontrada');
        });

        it('debería lanzar error si inquilino no existe', async () => {
            // Arrange
            const reservaData = { propiedad_id: 1, inquilino_id: 999 };
            const propiedad = { id: 1, titulo: 'Casa Test' };

            mockPropiedadRepo.findOne.mockResolvedValue(propiedad);
            mockUsuarioRepo.findOne.mockResolvedValue(null);

            // Act & Assert
            await expect(reservaService.createReserva(reservaData))
                .rejects.toThrow('Inquilino no encontrado');
        });
    });

    describe('getReservas', () => {
        it('debería retornar reservas del cache si están disponibles', async () => {
            // Arrange
            const cachedReservas = [
                { id: 1, estado: 'pendiente', propiedad: { id: 1 } },
                { id: 2, estado: 'aceptada', propiedad: { id: 2 } }
            ];

            cacheService.getReservas.mockResolvedValue(cachedReservas);

            // Act
            const result = await reservaService.getReservas();

            // Assert
            expect(cacheService.getReservas).toHaveBeenCalled();
            expect(mockReservaRepo.find).not.toHaveBeenCalled();
            expect(result).toEqual(cachedReservas);
        });

        it('debería obtener reservas de BD si no están en cache', async () => {
            // Arrange
            const reservas = [
                { id: 1, estado: 'pendiente', propiedad: { id: 1 }, inquilino: { id: 2 } },
                { id: 2, estado: 'aceptada', propiedad: { id: 2 }, inquilino: { id: 3 } }
            ];

            cacheService.getReservas.mockResolvedValue(null);
            mockReservaRepo.find.mockResolvedValue(reservas);

            // Act
            const result = await reservaService.getReservas();

            // Assert
            expect(mockReservaRepo.find).toHaveBeenCalledWith({
                relations: ['propiedad', 'inquilino'],
                order: { fecha_solicitud: 'DESC' }
            });
            expect(cacheService.setReservas).toHaveBeenCalledWith(reservas);
            expect(result).toEqual(reservas);
        });

        it('debería usar fallback a BD si cache falla', async () => {
            // Arrange
            const reservas = [{ id: 1, estado: 'pendiente' }];

            cacheService.getReservas.mockRejectedValue(new Error('Cache error'));
            mockReservaRepo.find.mockResolvedValue(reservas);

            // Act
            const result = await reservaService.getReservas();

            // Assert
            expect(result).toEqual(reservas);
        });
    });

    describe('getReservaById', () => {
        it('debería retornar reserva del cache si está disponible', async () => {
            // Arrange
            const cachedReserva = { id: 1, estado: 'pendiente', propiedad: { id: 1 } };
            cacheService.getReserva.mockResolvedValue(cachedReserva);

            // Act
            const result = await reservaService.getReservaById(1);

            // Assert
            expect(cacheService.getReserva).toHaveBeenCalledWith(1);
            expect(result).toEqual(cachedReserva);
        });

        it('debería obtener reserva de BD si no está en cache', async () => {
            // Arrange
            const reserva = { id: 1, estado: 'pendiente', propiedad: { id: 1 }, inquilino: { id: 2 } };

            cacheService.getReserva.mockResolvedValue(null);
            mockReservaRepo.findOne.mockResolvedValue(reserva);

            // Act
            const result = await reservaService.getReservaById(1);

            // Assert
            expect(mockReservaRepo.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['propiedad', 'inquilino']
            });
            expect(cacheService.setReserva).toHaveBeenCalledWith(1, reserva);
            expect(result).toEqual(reserva);
        });

        it('debería lanzar error NotFoundError si reserva no existe', async () => {
            // Arrange
            cacheService.getReserva.mockResolvedValue(null);
            mockReservaRepo.findOne.mockResolvedValue(null);

            // Act & Assert
            try {
                await reservaService.getReservaById(999);
            } catch (error) {
                expect(error.message).toBe('Reserva no encontrada');
                expect(error.name).toBe('NotFoundError');
            }
        });
    });

    describe('getReservasByInquilino', () => {
        it('debería retornar reservas del inquilino desde cache', async () => {
            // Arrange
            const reservas = [{ id: 1, estado: 'pendiente' }];
            cacheService.getReservasByInquilino.mockResolvedValue(reservas);

            // Act
            const result = await reservaService.getReservasByInquilino(2);

            // Assert
            expect(cacheService.getReservasByInquilino).toHaveBeenCalledWith(2);
            expect(result).toEqual(reservas);
        });

        it('debería obtener reservas del inquilino desde BD', async () => {
            // Arrange
            const inquilino = { id: 2, nombre: 'Juan' };
            const reservas = [{ id: 1, estado: 'pendiente', propiedad: { id: 1 } }];

            cacheService.getReservasByInquilino.mockResolvedValue(null);
            mockUsuarioRepo.findOne.mockResolvedValue(inquilino);
            mockReservaRepo.find.mockResolvedValue(reservas);

            // Act
            const result = await reservaService.getReservasByInquilino(2);

            // Assert
            expect(mockUsuarioRepo.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
            expect(mockReservaRepo.find).toHaveBeenCalledWith({
                where: { inquilino: { id: 2 } },
                relations: ['propiedad'],
                order: { fecha_solicitud: 'DESC' }
            });
            expect(cacheService.setReservasByInquilino).toHaveBeenCalledWith(2, reservas);
            expect(result).toEqual(reservas);
        });

        it('debería lanzar error si inquilino no existe', async () => {
            // Arrange
            cacheService.getReservasByInquilino.mockResolvedValue(null);
            mockUsuarioRepo.findOne.mockResolvedValue(null);

            // Act & Assert
            try {
                await reservaService.getReservasByInquilino(999);
            } catch (error) {
                expect(error.message).toBe('Inquilino no encontrado');
                expect(error.name).toBe('NotFoundError');
            }
        });
    });

    describe('updateReserva', () => {
        it('debería actualizar reserva correctamente', async () => {
            // Arrange
            const updateData = { estado: 'aceptada' };
            const existingReserva = { id: 1, estado: 'pendiente' };
            const updatedReserva = { id: 1, estado: 'aceptada' };

            jest.spyOn(reservaService, 'getReservaById')
                .mockResolvedValueOnce(existingReserva) // primera llamada para verificar existencia
                .mockResolvedValueOnce(updatedReserva); // segunda llamada para retornar actualizada

            mockReservaRepo.update.mockResolvedValue({ affected: 1 });

            // Act
            const result = await reservaService.updateReserva(1, updateData);

            // Assert
            expect(mockReservaRepo.update).toHaveBeenCalledWith(1, updateData);
            expect(cacheService.limpiarCacheReservas).toHaveBeenCalled();
            expect(result).toEqual(updatedReserva);
        });
    });

    describe('deleteReserva', () => {
        it('debería eliminar reserva correctamente', async () => {
            // Arrange
            const existingReserva = { id: 1, estado: 'pendiente' };

            jest.spyOn(reservaService, 'getReservaById')
                .mockResolvedValue(existingReserva);
            mockReservaRepo.delete.mockResolvedValue({ affected: 1 });

            // Act
            const result = await reservaService.deleteReserva(1);

            // Assert
            expect(mockReservaRepo.delete).toHaveBeenCalledWith(1);
            expect(cacheService.limpiarCacheReservas).toHaveBeenCalled();
            expect(result).toEqual({ message: 'Reserva eliminada correctamente' });
        });

        it('debería lanzar error si no se eliminó ninguna reserva', async () => {
            // Arrange
            const existingReserva = { id: 1, estado: 'pendiente' };

            jest.spyOn(reservaService, 'getReservaById')
                .mockResolvedValue(existingReserva);
            mockReservaRepo.delete.mockResolvedValue({ affected: 0 });

            // Act & Assert
            try {
                await reservaService.deleteReserva(1);
            } catch (error) {
                expect(error.message).toBe('Reserva no encontrada');
                expect(error.name).toBe('NotFoundError');
            }
        });
    });

    describe('cambiarEstadoReserva', () => {
        it('debería cambiar estado de reserva correctamente', async () => {
            // Arrange
            const existingReserva = { id: 1, estado: 'pendiente' };
            const updatedReserva = { id: 1, estado: 'aceptada' };

            jest.spyOn(reservaService, 'getReservaById')
                .mockResolvedValueOnce(existingReserva) // primera llamada para verificar existencia
                .mockResolvedValueOnce(updatedReserva); // segunda llamada para retornar actualizada

            mockReservaRepo.update.mockResolvedValue({ affected: 1 });

            // Act
            const result = await reservaService.cambiarEstadoReserva(1, 'aceptada');

            // Assert
            expect(mockReservaRepo.update).toHaveBeenCalledWith(1, { estado: 'aceptada' });
            expect(cacheService.limpiarCacheReservas).toHaveBeenCalled();
            expect(result).toEqual(updatedReserva);
        });
    });
});