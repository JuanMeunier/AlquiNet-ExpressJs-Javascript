import { UserService } from "../services/userServices";

const userService = new UserService();

export class UserController {
    async create(req, res) {
        try {
            const user = await userService.createUser(req.body);
            res.status(201).json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al crear el usuario' });
        }
    }

    async findAll(req, res) {
        try {
            const users = await userService.getUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener los usuarios' });
        }
    }

    async findOne(req, res) {
        try {
            const user = await userService.getUserById(parseInt(req.params.id));
            if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener el usuario' });
        }
    }

    async getPropiedadesByUserId(req, res) {
        try {
            const propiedades = await userService.getPropiedadsByUserId(parseInt(req.params.id));
            if (!propiedades) return res.status(404).json({ message: 'Usuario no encontrado o sin propiedades' });
            res.json(propiedades);
        } catch (error) {
            res.status(500).json({ message: 'Error al obtener las propiedades del usuario' });
        }
    }

    async update(req, res) {
        try {
            const updatedUser = await userService.updateUser(parseInt(req.params.id), req.body);
            res.json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: 'Error al actualizar el usuario' });
        }
    }

    async remove(req, res) {
        try {
            await userService.deleteUser(parseInt(req.params.id));
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Error al eliminar el usuario' });
        }
    }
}
