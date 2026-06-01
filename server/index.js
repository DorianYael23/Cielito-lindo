import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";


// --- IMPORTACIONES PARA SERVIR EL CLIENTE ---
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuracion
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

// --- CONFIGURACIÓN DE PATHS PARA ES MODULES ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

// --- SERVIR LOS ARCHIVOS ESTÁTICOS DE REACT ---
app.use(express.static(path.join(__dirname, 'dist')));

// --- RATE LIMITING ---
// Limita el login a 10 intentos cada 15 minutos por IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: { message: "Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limita el registro a 20 peticiones por hora por IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20,
  message: { message: "Demasiadas solicitudes de registro. Intenta de nuevo en 1 hora." },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- MIDDLEWARES DE AUTENTICACIÓN ---
const autenticarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.usuario = usuario;
    next();
  });
};

const esAdmin = (req, res, next) => {
  if (req.usuario.rol !== "admin") {
    return res
      .status(403)
      .json({ message: "Acceso denegado. Se requiere rol de administrador." });
  }
  next();
};

// --- RUTAS DE API ---

// Productos
app.get("/api/productos", async (req, res) => {
  try {
    const [productos] = await pool.query("SELECT * FROM productos");
    res.json(productos);
  } catch (error) {
    console.log("Error al obtener productos:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Registro (solo admins pueden crear usuarios)
app.post("/api/register", autenticarToken, esAdmin, registerLimiter, async (req, res) => {
  const { nombre_usuario, contrasena, rol } = req.body;

  if (!nombre_usuario || !contrasena || !rol) {
    return res
      .status(400)
      .json({ message: "Nombre, contraseña y rol son obligatorios" });
  }
  if (rol !== "admin" && rol !== "empleado") {
    return res
      .status(400)
      .json({ message: "Rol inválido. Debe ser 'admin' o 'empleado'." });
  }

  try {
    const contrasena_hash = await bcrypt.hash(contrasena, 10);

    await pool.query(
      "INSERT INTO usuarios (nombre_usuario, contrasena_hash, rol) VALUES (?,?,?)",
      [nombre_usuario, contrasena_hash, rol]
    );

    res.status(201).json({ message: "Usuario registrado con exito" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "El nombre de usuario ya existe" });
    }
    console.error("Error al registrar usuario:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Login
app.post("/api/login", loginLimiter, async (req, res) => {
  const { nombre_usuario, contrasena } = req.body;

  if (!nombre_usuario || !contrasena) {
    return res
      .status(400)
      .json({ message: "El nombre de usuario y la contraseña son obligatorios" });
  }

  try {
    const [usuarios] = await pool.query(
      "SELECT * FROM usuarios WHERE nombre_usuario = ?",
      [nombre_usuario]
    );

    if (usuarios.length === 0) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const usuario = usuarios[0];

    const esContrasenaCorrecta = await bcrypt.compare(
      contrasena,
      usuario.contrasena_hash
    );

    if (!esContrasenaCorrecta) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        rol: usuario.rol,
        nombre: usuario.nombre_usuario,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login exitoso",
      token: token,
      rol: usuario.rol,
    });
  } catch (error) {
    console.error("Error en el login", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ventas
app.post("/api/ventas", autenticarToken, async (req, res) => {
  const { carrito, total } = req.body;
  const id_usuario = req.usuario.id;

  if (!carrito || !total || carrito.length === 0) {
    return res.status(400).json({ message: "Datos de venta inválidos." });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [ventaResult] = await connection.query(
      "INSERT INTO ventas (id_usuario, total) VALUES (?, ?)",
      [id_usuario, total]
    );

    const id_venta = ventaResult.insertId;

    const detalleValues = carrito.map((item) => [
      id_venta,
      item.id,
      item.cantidad,
      item.precio,
    ]);

    await connection.query(
      "INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario) VALUES ?",
      [detalleValues]
    );

    await connection.commit();

    res.status(201).json({ message: "Venta registrada con éxito", id_venta: id_venta });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error al registrar venta:", error.message);
    res.status(500).json({ message: "Error interno al registrar la venta" });
  } finally {
    if (connection) connection.release();
  }
});

// Reportes - Ventas del día
app.get("/api/reportes/ventas-dia", autenticarToken, esAdmin, async (req, res) => {
  try {
    const [resumen] = await pool.query(
      "SELECT SUM(total) as total_dia, COUNT(id) as num_ventas FROM ventas WHERE DATE(fecha) = CURDATE()"
    );

    const [listaVentas] = await pool.query(
      `SELECT v.id, v.fecha, v.total, u.nombre_usuario 
      FROM ventas v
      JOIN usuarios u ON v.id_usuario = u.id
      WHERE DATE(v.fecha) = CURDATE()
      ORDER BY v.fecha DESC`
    );

    res.json({
      resumen: resumen[0],
      ventas: listaVentas,
    });
  } catch (error) {
    console.error("Error al generar reporte:", error.message);
    res.status(500).json({ message: "Error interno al generar el reporte" });
  }
});

// Reportes - Productos más vendidos
app.get("/api/reportes/productos-mas-vendidos", autenticarToken, esAdmin, async (req, res) => {
  try {
    const [productosVendidos] = await pool.query(
      `SELECT
         p.nombre,
         SUM(dv.cantidad) AS total_vendido
       FROM detalle_venta dv
       JOIN productos p ON dv.id_producto = p.id
       JOIN ventas v ON dv.id_venta = v.id
       WHERE DATE(v.fecha) = CURDATE()
       GROUP BY p.nombre
       ORDER BY total_vendido DESC
       LIMIT 10`
    );
    res.json(productosVendidos);
  } catch (error) {
    console.error("Error al generar reporte de productos:", error.message);
    res.status(500).json({ message: "Error interno al generar el reporte de productos" });
  }
});

// CRUD Productos
app.get("/api/productos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [producto] = await pool.query("SELECT * FROM productos WHERE id = ?", [id]);

    if (producto.length === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json(producto[0]);
  } catch (error) {
    console.error("Error al obtener producto:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.post("/api/productos", autenticarToken, esAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen_url } = req.body;

    if (!nombre || !precio) {
      return res.status(400).json({ message: "El nombre y el precio son obligatorios" });
    }

    const [result] = await pool.query(
      "INSERT INTO productos (nombre, descripcion, precio, imagen_url) VALUES (?,?,?,?)",
      [nombre, descripcion, precio, imagen_url || null]
    );

    res.status(201).json({ message: "Producto creado con exito", id: result.insertId });
  } catch (error) {
    console.error("Error al crear producto:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.put("/api/productos/:id", autenticarToken, esAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, imagen_url } = req.body;

    if (!nombre || !precio) {
      return res.status(400).json({ message: "El nombre y el precio son obligatorios" });
    }

    const [result] = await pool.query(
      "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, imagen_url = ? WHERE id = ?",
      [nombre, descripcion, precio, imagen_url || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json({ message: "Producto actualizado con exito" });
  } catch (error) {
    console.error("Error al actualizar producto:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.delete("/api/productos/:id", autenticarToken, esAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [ventas] = await pool.query(
      "SELECT id FROM detalle_venta WHERE id_producto = ?",
      [id]
    );

    if (ventas.length > 0) {
      return res.status(409).json({
        message: "No se puede eliminar el producto ya estan en ventas pasadas",
      });
    }

    const [result] = await pool.query("DELETE FROM productos WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json({ message: "Producto eliminado con exito" });
  } catch (error) {
    console.error("Error al eliminar producto:", error.message);
    res.status(500).json({ message: "Error interno del servicio" });
  }
});

// CRUD Usuarios
app.get("/api/usuarios", autenticarToken, esAdmin, async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      "SELECT id, nombre_usuario, rol FROM usuarios"
    );
    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.put("/api/usuarios/:id", autenticarToken, esAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_usuario, contrasena, rol } = req.body;

    if (!nombre_usuario || !rol) {
      return res.status(400).json({ message: "Nombre de usuario y rol son obligatorios" });
    }
    if (rol !== "admin" && rol !== "empleado") {
      return res.status(400).json({ message: "Rol inválido." });
    }

    if (contrasena) {
      const contrasena_hash = await bcrypt.hash(contrasena, 10);
      await pool.query(
        "UPDATE usuarios SET nombre_usuario = ?, contrasena_hash = ?, rol = ? WHERE id = ?",
        [nombre_usuario, contrasena_hash, rol, id]
      );
    } else {
      await pool.query(
        "UPDATE usuarios SET nombre_usuario = ?, rol = ? WHERE id = ?",
        [nombre_usuario, rol, id]
      );
    }

    res.json({ message: "Usuario actualizado con éxito" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "El nombre de usuario ya existe" });
    }
    console.error("Error al actualizar usuario:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.delete("/api/usuarios/:id", autenticarToken, esAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(req.usuario.id) === Number(id)) {
      return res.status(400).json({
        message: "No puedes eliminar tu propia cuenta de administrador.",
      });
    }

    const [ventas] = await pool.query(
      "SELECT id FROM ventas WHERE id_usuario = ?",
      [id]
    );
    if (ventas.length > 0) {
      return res.status(409).json({
        message: "No se puede eliminar: El usuario tiene ventas registradas.",
      });
    }

    const [result] = await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error.message);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// --- CATCH-ALL PARA REACT ROUTER ---
app.get('*path', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});