import { ReseniaController } from "../../controllers/reseniaController.js";
import { ReseniaService } from "../../services/reseniaServices.js";

jest.mock("../../services/reseniaServices.js");

describe("ReseniaController", () => {
    let controller;
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        controller = new ReseniaController();
        mockReq = { body: {}, params: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        mockNext = jest.fn();
    });

    describe("createResenia", () => {
        it("debería crear una reseña correctamente", async () => {
            const fakeResenia = { id: 1, comentario: "Muy buena", puntaje: 5 };
            mockReq.body = { inquilinoId: 1, propiedadId: 2, comentario: "Muy buena", puntaje: 5 };
            ReseniaService.prototype.createResenia.mockResolvedValue(fakeResenia);

            await controller.createResenia(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(fakeResenia);
        });

        it("debería llamar a next en caso de error", async () => {
            const fakeError = new Error("Error creando reseña");
            ReseniaService.prototype.createResenia.mockRejectedValue(fakeError);

            await controller.createResenia(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(fakeError);
        });
    });

    describe("getReseniaById", () => {
        it("debería devolver una reseña", async () => {
            const fakeResenia = { id: 10, comentario: "Genial" };
            mockReq.params.id = 10;
            ReseniaService.prototype.getReseniaById.mockResolvedValue(fakeResenia);

            await controller.getReseniaById(mockReq, mockRes, mockNext);

            expect(mockRes.json).toHaveBeenCalledWith(fakeResenia);
        });

        it("debería manejar error si la reseña no existe", async () => {
            const fakeError = new Error("Reseña no encontrada");
            mockReq.params.id = 99;
            ReseniaService.prototype.getReseniaById.mockRejectedValue(fakeError);

            await controller.getReseniaById(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(fakeError);
        });
    });
});
