import { UserController } from "../../controllers/userController.js";
import { UserService } from "../../services/userServices.js";

jest.mock("../../services/userServices.js"); // mockeamos el service

describe("UserController", () => {
    let controller;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        controller = new UserController();
        mockReq = { body: {}, params: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
    });

    test("create: debe devolver 201 y usuario creado", async () => {
        const fakeUser = { id: 1, email: "test@mail.com" };
        UserService.prototype.createUser.mockResolvedValue(fakeUser);

        mockReq.body = { email: "test@mail.com", contraseña: "1234" };
        await controller.create(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(fakeUser);
    });

    test("create: maneja error del service", async () => {
        UserService.prototype.createUser.mockRejectedValue(new Error("DB falla"));

        await controller.create(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ message: "Error al crear el usuario" });
    });

    test("findOne: devuelve 404 si no encuentra usuario", async () => {
        UserService.prototype.getUserById.mockResolvedValue(null);

        mockReq.params.id = "99";
        await controller.findOne(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(404);
        expect(mockRes.json).toHaveBeenCalledWith({ message: "Usuario no encontrado" });
    });

    test("remove: devuelve 204 si elimina usuario correctamente", async () => {
        UserService.prototype.deleteUser.mockResolvedValue(true);

        mockReq.params.id = "1";
        await controller.remove(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(204);
        expect(mockRes.send).toHaveBeenCalled();
    });

    test("remove: maneja error al eliminar", async () => {
        UserService.prototype.deleteUser.mockRejectedValue(new Error("DB falla"));

        mockReq.params.id = "1";
        await controller.remove(mockReq, mockRes);

        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.json).toHaveBeenCalledWith({ message: "Error al eliminar el usuario" });
    });
});
