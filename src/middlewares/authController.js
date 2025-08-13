import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Usuario from '../entities/usuario.js' // tu EntitySchema
import AppDataSource from "../config/database.js"; // tu instancia de DataSource

const usuarioRepository = AppDataSource.getRepository(Usuario);

export const register = async (req, res) => {
    try {
        const { nombre, email, contraseña, rol } = req.body;

        const existingUser = await usuarioRepository.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        const hashedPassword = await bcrypt.hash(contraseña, 10);

        const newUser = usuarioRepository.create({
            nombre,
            email,
            contraseña: hashedPassword,
            rol
        });

        await usuarioRepository.save(newUser);

        res.status(201).json({ message: "Usuario registrado con éxito" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, contraseña } = req.body;

        const user = await usuarioRepository.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Usuario o contraseña incorrectos" });
        }

        const validPassword = await bcrypt.compare(contraseña, user.contraseña);
        if (!validPassword) {
            return res.status(400).json({ message: "Usuario o contraseña incorrectos" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
