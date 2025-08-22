import { ReseniaService } from "../../services/reseniaServices.js";
import cacheService from "../../services/cacheServices.js";
import logger from "../../config/logger.js";

jest.mock("../../services/cacheServices.js");
jest.mock("../../config/logger.js", () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    success: jest.fn()
}));

describe("ReseniaService", () => {
    let service;
    let mockReseniaRepo, mockUsuarioRepo, mockPropiedadRepo;

    beforeEach(() => {
        service = new ReseniaService();

        // Mock repositorios
        mockReseniaRepo = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            remove: jest.fn()
        };
        mockUsuarioRepo = { findOne: jest.fn() };
        mockPropiedadRepo = { findOne: jest.fn() };

        service.reseniaRepository = mockReseniaRepo;
        service.usuarioRepository = mockUsuarioRepo;
        service.propiedadRepository = mockPropiedadRepo;
    });

    describe("createResenia", () => {
        it("debería crear una reseña si todo es válido", async () => {
            const fakeInquilino = { id: 1 };
            const fakePropiedad = { id: 2 };
            const fakeResenia = { id: 100, comentario: "Excelente", puntaje: 5 };

            mockUsuarioRepo.findOne.mockResolvedValue(fakeInquilino);
            mockPropiedadRepo.findOne.mockResolvedValue(fakePropiedad);
            mockReseniaRepo.findOne.mockResolvedValue(null); // No hay duplicada
            mockReseniaRepo.create.mockReturnValue(fakeResenia);
            mockReseniaRepo.save.mockResolvedValue(fakeResenia);

            const result = await service.createResenia({
                inquilinoId: 1,
                propiedadId: 2,
                comentario: "Excelente",
                puntaje: 5
            });

            expect(result).toEqual(fakeResenia);
            expect(cacheService.limpiarCacheResenias).toHaveBeenCalled();
        });

        it("debería lanzar error si el inquilino no existe", async () => {
            mockUsuarioRepo.findOne.mockResolvedValue(null);

            await expect(
                service.createResenia({ inquilinoId: 99, propiedadId: 1, comentario: "Mal", puntaje: 2 })
            ).rejects.toThrow("Usuario (inquilino) con id 99 no encontrado");
        });

        it("debería lanzar error si ya existe una reseña duplicada", async () => {
            const fakeInquilino = { id: 1 };
            const fakePropiedad = { id: 2 };
            const fakeResenia = { id: 123 };

            mockUsuarioRepo.findOne.mockResolvedValue(fakeInquilino);
            mockPropiedadRepo.findOne.mockResolvedValue(fakePropiedad);
            mockReseniaRepo.findOne.mockResolvedValue(fakeResenia);

            await expect(
                service.createResenia({ inquilinoId: 1, propiedadId: 2, comentario: "Duplicada", puntaje: 3 })
            ).rejects.toThrow("El inquilino ya ha realizado una reseña para esta propiedad");
        });
    });

    describe("getReseniaById", () => {
        it("debería devolver la reseña si existe", async () => {
            const fakeResenia = { id: 50, comentario: "Muy buena" };
            cacheService.getResenia.mockResolvedValue(null);
            mockReseniaRepo.findOne.mockResolvedValue(fakeResenia);

            const result = await service.getReseniaById(50);

            expect(result).toEqual(fakeResenia);
            expect(cacheService.setResenia).toHaveBeenCalledWith(50, fakeResenia);
        });

        it("debería lanzar error si no existe la reseña", async () => {
            cacheService.getResenia.mockResolvedValue(null);
            mockReseniaRepo.findOne.mockResolvedValue(null);

            await expect(service.getReseniaById(1234)).rejects.toThrow("Reseña con id 1234 no encontrada");
        });
    });
});
