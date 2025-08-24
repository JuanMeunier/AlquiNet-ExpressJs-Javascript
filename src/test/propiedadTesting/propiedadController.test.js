// tests/propiedadController.test.js
import { PropiedadController } from "../../controllers/propiedadController.js";

describe("PropiedadController", () => {
    let controller;
    let mockService;
    let req;
    let res;
    let next;

    beforeEach(() => {
        mockService = {
            createPropiedad: jest.fn(),
            getPropiedades: jest.fn(),
            getPropiedadById: jest.fn(),
            getPropiedadByUbicacion: jest.fn(),
            getPropiedadesByUserId: jest.fn(),
            updatePropiedad: jest.fn(),
            deletePropiedad: jest.fn(),
        };

        controller = new PropiedadController();
        controller.propiedadService = mockService;

        req = { body: {}, params: {}, query: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn(), send: jest.fn() };
        next = jest.fn();
    });

    test("create responde con 201 y la propiedad", async () => {
        mockService.createPropiedad.mockResolvedValue({ id: 1, titulo: "Depto" });
        await controller.create(req, res, next);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ id: 1, titulo: "Depto" });
    });

    test("findAll responde con lista de propiedades", async () => {
        mockService.getPropiedades.mockResolvedValue([{ id: 1 }]);
        await controller.findAll(req, res, next);
        expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    test("findOne llama a service con parseInt del id", async () => {
        req.params.id = "5";
        mockService.getPropiedadById.mockResolvedValue({ id: 5 });
        await controller.findOne(req, res, next);
        expect(mockService.getPropiedadById).toHaveBeenCalledWith(5);
    });

    test("remove responde con 204", async () => {
        req.params.id = "1";
        await controller.remove(req, res, next);
        expect(mockService.deletePropiedad).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(204);
    });
});
