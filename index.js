const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

function createMysqlConnection() {
  return mysql.createConnection({
    host: process.env.DB_HOST || 'mysql',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portainer'
  });
}

async function connectWithRetry(connection, retries = 5, delayMs = 5000) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      await new Promise((resolve, reject) => {
        connection.connect((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      console.log('Conexión exitosa a MySQL');
      return;
    } catch (err) {
      attempt++;
      console.error(`Error conectando a MySQL (intento ${attempt}/${retries}):`, err);
      if (attempt >= retries) {
        throw err;
      }
      console.log(`Reintentando en ${delayMs / 1000} segundos...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

const connection = createMysqlConnection();

(async () => {
  try {
    await connectWithRetry(connection, 10, 3000);

    app.get('/', (req, res) => {
      res.send('¡Hola mundo desde Express y MySQL!');
    });

    app.get('/usuarios', (req, res) => {
      const query = 'SELECT * FROM usuarios';
      connection.query(query, (error, results) => {
        if (error) {
          console.error('Error ejecutando la consulta:', error);
          return res.status(500).send('Error interno en el servidor');
        }
        res.json(results);
      });
    });

    app.listen(port, () => {
      console.log(`Servidor escuchando en http://localhost:${port}`);
    });

  } catch (error) {
    console.error('No se pudo conectar a MySQL tras varios reintentos:', error);
    process.exit(1);
  }
})();
