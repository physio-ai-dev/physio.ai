import AppDataSource from "../config/database.js";
import UserSchema from "../models/UserSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { username, email, password, passwordConfirm, dob } = req.body;

    if (!username || !email || !password || !passwordConfirm || !dob) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios: username, email, password, passwordConfirm, dob.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "El correo electrónico no tiene un formato válido.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 6 caracteres.",
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        error: "La contraseña y la confirmación no coinciden.",
      });
    }

    const userRepository = AppDataSource.getRepository(UserSchema);

    const existingUserByEmail = await userRepository.findOne({
      where: { email },
    });

    if (existingUserByEmail) {
      return res.status(409).json({
        error: "El correo electrónico ya está registrado.",
      });
    }

    const existingUserByUsername = await userRepository.findOne({
      where: { username },
    });

    if (existingUserByUsername) {
      return res.status(409).json({
        error: "El nombre de usuario ya está registrado.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = userRepository.create({
      username,
      email,
      password: hashedPassword,
      dob,
    });

    await userRepository.save(newUser);

    return res.status(201).json({
      status: "success",
      message: "Usuario registrado con éxito.",
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        dob: newUser.dob,
        created_at: newUser.created_at,
      },
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({
      error: "Ocurrió un error en el servidor al procesar el registro.",
      details: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña requeridos." });
    }

    const userRepository = AppDataSource.getRepository(UserSchema);
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Credenciales incorrectas." });
    }

    const JWT_SECRET = process.env.JWT_SECRET || "secreto_super_seguro";
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, subscription_tier: user.subscription_tier },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return res.json({
      status: "success",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        subscription_tier: user.subscription_tier
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
