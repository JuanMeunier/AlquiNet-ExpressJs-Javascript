// src/test/reservasTesting/reservaController.test.js
import { ReservaController } from "../../controllers/reservaController.js";
import { ReservaService } from "../../services/reservaServices.js";

jest.mock("../../services/reservaServices.js");

describe("ReservaController", () => {
    let controller;
    let req, res, next;

    beforeEach(() => {
        controller = new ReservaController();
        req = { params: {}, body: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
        next = jest.fn();
    });

    describe("create", () => {
        it("crea una reserva exitosamente", async () => {
            const fakeReserva = { id: 1, estado: "pendiente" };
            ReservaService.prototype.createReserva.mockResolvedValue(fakeReserva);

            req.body = { propiedad_id: 1, inquilino_id: 2 };
            await controller.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, data: fakeReserva })
            );
        });

        it("maneja error al crear reserva", async () => {
            ReservaService.prototype.createReserva.mockRejectedValue(new Error("Error en BD"));
            await controller.create(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe("findOne", () => {
        it("lanza error si el id es inválido", async () => {
            req.params.id = "abc";
            await controller.findOne(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
        });

        it("retorna reserva si existe", async () => {
            const reserva = { id: 5 };
            ReservaService.prototype.getReservaById.mockResolvedValue(reserva);
            req.params.id = "5";

            await controller.findOne(req, res, next);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, data: reserva })
            );
        });
    });

    describe("cambiarEstado", () => {
        it("falla si falta estado", async () => {
            req.params.id = "1";
            req.body = {};
            await controller.cambiarEstado(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
        });

        it("cambia el estado correctamente", async () => {
            const reserva = { id: 1, estado: "confirmada" };
            ReservaService.prototype.cambiarEstadoReserva.mockResolvedValue(reserva);

            req.params.id = "1";
            req.body = { estado: "confirmada" };
            await controller.cambiarEstado(req, res, next);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: true, data: reserva })
            );
        });
    });
});
