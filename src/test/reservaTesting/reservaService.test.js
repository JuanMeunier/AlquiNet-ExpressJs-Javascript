// src/test/reservasTesting/reservaService.test.js
import { ReservaService } from "../../services/reservaServices.js";
import cacheService from "../../services/cacheServices.js";
import logger from "../../config/logger.js";

jest.mock("../../services/cacheServices.js", () => ({
    getReservas: jest.fn(),
    setReservas: jest.fn(),
    getReserva: jest.fn(),
    setReserva: jest.fn(),
    limpiarCacheReservas: jest.fn(),
    getReservasByInquilino: jest.fn(),
    setReservasByInquilino: jest.fn(),
}));
jest.mock("../../config/logger.js", () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    success: jest.fn(),
}));

describe("ReservaService", () => {
    let service;

    const mockRepo = {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(() => {
        service = new ReservaService();
        service.reservaRepository = mockRepo;
        service.propiedadRepository = mockRepo;
        service.usuarioRepository = mockRepo;
        jest.clearAllMocks();
    });

    describe("createReserva", () => {
        it("crea reserva si propiedad e inquilino existen", async () => {
            mockRepo.findOne.mockResolvedValueOnce({ id: 1 }); // propiedad
            mockRepo.findOne.mockResolvedValueOnce({ id: 2 }); // inquilino
            mockRepo.create.mockReturnValue({ id: 99, estado: "pendiente" });
            mockRepo.save.mockResolvedValue({ id: 99, estado: "pendiente" });

            const result = await service.createReserva({ propiedad_id: 1, inquilino_id: 2 });
            expect(result).toEqual(expect.objectContaining({ id: 99 }));
            expect(cacheService.limpiarCacheReservas).toHaveBeenCalled();
        });

        it("lanza error si propiedad no existe", async () => {
            mockRepo.findOne.mockResolvedValueOnce(null);
            await expect(service.createReserva({ propiedad_id: 1, inquilino_id: 2 }))
                .rejects.toThrow("Propiedad no encontrada");
        });
    });

    describe("getReservaById", () => {
        it("retorna reserva desde cache si existe", async () => {
            cacheService.getReserva.mockResolvedValue({ id: 5 });
            const result = await service.getReservaById(5);
            expect(result).toEqual({ id: 5 });
        });

        it("lanza error si reserva no existe en BD", async () => {
            cacheService.getReserva.mockResolvedValue(null);
            mockRepo.findOne.mockResolvedValue(null);
            await expect(service.getReservaById(10)).rejects.toThrow("Reserva no encontrada");
        });
    });

    describe("cambiarEstadoReserva", () => {
        it("cambia estado de reserva", async () => {
            const reserva = { id: 1, estado: "pendiente" };
            service.getReservaById = jest.fn().mockResolvedValue(reserva);
            mockRepo.update.mockResolvedValue();
            service.getReservaById.mockResolvedValueOnce(reserva).mockResolvedValueOnce({ ...reserva, estado: "confirmada" });

            const result = await service.cambiarEstadoReserva(1, "confirmada");
            expect(result.estado).toBe("confirmada");
            expect(cacheService.limpiarCacheReservas).toHaveBeenCalled();
        });
    });
});
