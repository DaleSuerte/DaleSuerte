/****************************************
 * server.js (con MySQL en lugar de MongoDB)
 ****************************************/
const express = require('express');
const mysql = require('mysql2/promise');  // 1) Importamos mysql2 con soporte promesas

const app = express();
const PORT = process.env.PORT || 3000;

// 2) Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3) Configurar conexión (pool) a MySQL
// Reemplaza los valores con los que uses en tu entorno
const pool = mysql.createPool({
  host: 'localhost',       // o la IP/host de tu servidor MySQL
  user: 'root',            // tu usuario
  password: '123456',      // tu contraseña
  database: 'mi_basedatos' // la base de datos que creaste
});

// 4) Ruta de prueba
app.get('/', async (req, res) => {
  res.send('Servidor Express con MySQL funcionando.');
});

// 5) Crear un nuevo pedido
app.post('/api/pedidos', async (req, res) => {
  try {
    const { mandalas, correoCliente, total } = req.body;
    
    // Asegurarnos de que tengamos datos requeridos
    if (!mandalas || !correoCliente || total == null) {
      return res.status(400).json({ mensaje: 'Faltan datos del pedido.' });
    }

    // Insertamos el pedido en la tabla pedidos
    // Notar que "mandalas" es un array, lo convertiremos a string (p.ej: "101,102,103")
    const mandalasString = Array.isArray(mandalas) ? mandalas.join(',') : mandalas;

    const sql = `
      INSERT INTO pedidos (mandalas, correoCliente, total)
      VALUES (?, ?, ?)
    `;
    const [resultado] = await pool.query(sql, [mandalasString, correoCliente, total]);

    // resultado.insertId nos da el ID auto-increment del nuevo registro
    const nuevoPedidoID = resultado.insertId;

    // Respondemos al cliente
    res.status(201).json({
      mensaje: 'Pedido creado correctamente',
      pedido: {
        id: nuevoPedidoID,
        mandalas: mandalasString,
        correoCliente,
        total
      }
    });

  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// 6) Listar todos los pedidos (GET)
app.get('/api/pedidos', async (req, res) => {
  try {
    const sql = 'SELECT * FROM pedidos ORDER BY fecha DESC';
    const [filas] = await pool.query(sql); // filas es un array con los registros

    // Podrías convertir "mandalas" de string a array antes de enviar
    const pedidos = filas.map(fila => {
      return {
        id: fila.id,
        mandalas: fila.mandalas ? fila.mandalas.split(',') : [],
        correoCliente: fila.correoCliente,
        total: parseFloat(fila.total),
        fecha: fila.fecha
      };
    });

    res.json(pedidos);

  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

// 7) Arrancar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
