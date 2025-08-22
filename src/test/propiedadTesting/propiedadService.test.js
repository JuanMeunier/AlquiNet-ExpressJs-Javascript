// tests/propiedadService.test.js
import { PropiedadService } from "../services/propiedadServices.js";
import cacheService from "../services/cacheServices.js";
import Propiedad from "../entities/propiedad.js";
import Usuario from "../entities/usuario.js";

// Mock repositories
const mockRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
});

jest.mock("../config/database.js", () => ({
    AppDataSource: {
        getRepository: jest.fn(() => mockRepository()),
    },
}));

jest.mock("../services/cacheServices.js");

describe("PropiedadService", () => {
    let service;
    let propiedadRepo;
    let userRepo;

    beforeEach(() => {
        service = new PropiedadService();
        propiedadRepo = service.propiedadRepository;
        userRepo = service.userRepository;
        jest.clearAllMocks();
    });

    test("createPropiedad guarda una nueva propiedad", async () => {
        const data = { titulo: "Depto Test" };
        propiedadRepo.create.mockReturnValue(data);
        propiedadRepo.save.mockResolvedValue({ id: 1, ...data });

        const result = await service.createPropiedad(data);
        expect(result.id).toBe(1);
        expect(cacheService.limpiarCachePropiedades).toHaveBeenCalled();
    });

    test("getPropiedades devuelve cache si existe", async () => {
        cacheService.getPropiedades.mockResolvedValue([{ id: 1, titulo: "Propiedad" }]);
        const result = await service.getPropiedades();
        expect(result).toHaveLength(1);
        expect(propiedadRepo.find).not.toHaveBeenCalled();
    });

    test("getPropiedadById lanza error si no existe", async () => {
        propiedadRepo.findOne.mockResolvedValue(null);
        await expect(service.getPropiedadById(1)).rejects.toEqual({ status: 404, message: 'Propiedad no encontrada' });
    });

    test("updatePropiedad llama a update y limpia cache", async () => {
        propiedadRepo.findOne.mockResolvedValue({ id: 1, titulo: "Antiguo" });
        propiedadRepo.update.mockResolvedValue({});
        service.getPropiedadById = jest.fn().mockResolvedValue({ id: 1, titulo: "Nuevo" });

        const result = await service.updatePropiedad(1, { titulo: "Nuevo" });
        expect(result.titulo).toBe("Nuevo");
        expect(cacheService.limpiarCachePropiedades).toHaveBeenCalled();
    });

    test("deletePropiedad lanza error si no existe", async () => {
        propiedadRepo.delete.mockResolvedValue({ affected: 0 });
        await expect(service.deletePropiedad(1)).rejects.toEqual({ status: 404, message: 'Propiedad no encontrada' });
    });
});
