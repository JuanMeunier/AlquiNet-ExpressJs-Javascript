import { UserService } from "../../services/userServices.js";
import bcrypt from "bcrypt";
import cacheService from "../../services/cacheServices.js";
import { AppDataSource } from "../../config/database.js";

jest.mock("bcrypt");
jest.mock("../../services/cacheServices.js", () => ({
    limpiarCacheUsuarios: jest.fn(),
    limpiarCachePropiedades: jest.fn(),
    limpiarCacheReservas: jest.fn(),
    limpiarCacheResenias: jest.fn(),
    getUsuarios: jest.fn(),
    setUsuarios: jest.fn(),
    getUsuario: jest.fn(),
    setUsuario: jest.fn(),
    getPropiedadesByUser: jest.fn(),
    setPropiedadesByUser: jest.fn()
}));

describe("UserService", () => {
    let service;
    let mockRepo;

    beforeEach(() => {
        mockRepo = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        };
        AppDataSource.getRepository = jest.fn().mockReturnValue(mockRepo);

        service = new UserService();
    });

    test("createUser: crea usuario y limpia cache", async () => {
        const data = { email: "test@mail.com", contraseña: "1234" };
        bcrypt.hash.mockResolvedValue("hashed_pw");

        const fakeUser = { id: 1, email: "test@mail.com", contraseña: "hashed_pw" };
        mockRepo.create.mockReturnValue(fakeUser);
        mockRepo.save.mockResolvedValue(fakeUser);

        const result = await service.createUser(data);

        expect(bcrypt.hash).toHaveBeenCalledWith("1234", 10);
        expect(mockRepo.save).toHaveBeenCalledWith(fakeUser);
        expect(cacheService.limpiarCacheUsuarios).toHaveBeenCalled();
        expect(result).toEqual(fakeUser);
    });

    test("createUser: lanza error si falla bcrypt", async () => {
        bcrypt.hash.mockRejectedValue(new Error("hash falla"));

        await expect(service.createUser({ contraseña: "123" })).rejects.toThrow("hash falla");
    });

    test("getUsers: obtiene de BD si cache vacío", async () => {
        cacheService.getUsuarios.mockResolvedValue(null);
        const users = [{ id: 1 }, { id: 2 }];
        mockRepo.find.mockResolvedValue(users);

        const result = await service.getUsers();

        expect(mockRepo.find).toHaveBeenCalled();
        expect(cacheService.setUsuarios).toHaveBeenCalledWith(users);
        expect(result).toEqual(users);
    });

    test("deleteUser: borra y limpia caches", async () => {
        mockRepo.delete.mockResolvedValue({ affected: 1 });

        const result = await service.deleteUser(1);

        expect(mockRepo.delete).toHaveBeenCalledWith(1);
        expect(cacheService.limpiarCacheUsuarios).toHaveBeenCalled();
        expect(cacheService.limpiarCachePropiedades).toHaveBeenCalled();
        expect(result).toEqual({ affected: 1 });
    });

    test("deleteUser: lanza error si falla la DB", async () => {
        mockRepo.delete.mockRejectedValue(new Error("DB falla"));

        await expect(service.deleteUser(1)).rejects.toThrow("DB falla");
    });
});
