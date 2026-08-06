import AppDataSource from "../config/database.js";
import UserSchema from "../models/UserSchema.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const { username, email, password, passwordConfirm, dob } = req.body;

    // 1. Validar que todos los campos requeridos estén presentes
    if (!username || !email || !password || !passwordConfirm || !dob) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios: username, email, password, passwordConfirm, dob.",
      });
    }

    // 2. Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "El correo electrónico no tiene un formato válido.",
      });
    }

    // 3. Validar longitud de contraseña (mínimo 6 caracteres)
    if (password.length < 6) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 6 caracteres.",
      });
    }

    // 4. Validar coincidencia de contraseña y confirmación
    if (password !== passwordConfirm) {
      return res.status(400).json({
        error: "La contraseña y la confirmación no coinciden.",
      });
    }

    const userRepository = AppDataSource.getRepository(UserSchema);

    // 5. Verificar si el correo electrónico ya está registrado
    const existingUserByEmail = await userRepository.findOne({
      where: { email },
    });

    if (existingUserByEmail) {
      return res.status(409).json({
        error: "El correo electrónico ya está registrado.",
      });
    }

    // 6. Verificar si el nombre de usuario ya está registrado
    const existingUserByUsername = await userRepository.findOne({
      where: { username },
    });

    if (existingUserByUsername) {
      return res.status(409).json({
        error: "El nombre de usuario ya está registrado.",
      });
    }

    // 7. Encriptar la contraseña (hashing con bcryptjs)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 8. Crear y guardar el nuevo usuario
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
