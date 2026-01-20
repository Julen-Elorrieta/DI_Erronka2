// Simple backend Express para login con MySQL y datos de JSON
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: '10.5.104.100',
  user: 'eloruser',
  password: '',
  database: 'elordb',
  port: 3307,
});

connection.connect((err) => {
  if (err) {
    console.error('Error conectando a MySQL:', err);
  } else {
    console.log('Conectado a MySQL correctamente');
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  connection.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'DB error' });
      }
      if (results && results.length > 0) {
        // Usuario y contraseña correctos
        res.json({ success: true });
      } else {
        // Usuario o contraseña incorrectos
        res.json({ success: false });
      }
    }
  );
});


app.get('/centers', (req, res) => {
    const type = req.query.type;
    if (type === 'filters') {
        axios.get('http://10.5.104.100/ikastetxeak.json').then(response => {
            const data = response.data.CENTROS;
            const titularidades = [...new Set(data.map(r => r.DTITUC))];
            const territorios = [...new Set(data.map(r => r.DTERRC))];
            res.json({ titularidades, territorios });
        }).catch(() => {
            res.status(500).json({ error: 'Error fetching data' });
        });
    } else if (type === 'municipios') {
        const territorio = req.query.territorio;
        axios.get('http://10.5.104.100/ikastetxeak.json').then(response => {
            const data = response.data.CENTROS;
            let municipios = data.map(r => r.DMUNIC);
            if (territorio) {
                municipios = data.filter(r => r.DTERRC === territorio).map(r => r.DMUNIC);
            }
            res.json([...new Set(municipios)]);
        }).catch(() => {
            res.status(500).json({ error: 'Error fetching data' });
        });
    } else if (type === 'meetings') {
        connection.query('SELECT * FROM reuniones', (err, results) => {
            if (err) {
                return res.status(500).json({ success: false, error: 'DB error' });
            }
            res.json(results);
        });
    } else {
        // Default: centers
        axios.get('http://10.5.104.100/ikastetxeak.json').then(response => {
            let data = response.data.CENTROS;
            if (req.query.titularidad) data = data.filter(r => r.DTITUC === req.query.titularidad);
            if (req.query.territorio) data = data.filter(r => r.DTERRC === req.query.territorio);
            if (req.query.municipio) data = data.filter(r => r.DMUNIC === req.query.municipio);
            res.json(data); // <-- Ahora devuelve un array directamente
        }).catch(() => {
            res.status(500).json({ error: 'Error fetching data' });
        });
    }
});

app.get('/users', (_req, res) => {
    connection.query('SELECT * FROM users', (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'DB error' });
        }
        res.json(results);
    });
});


app.delete('/deleteUser/:username', (req, res) => {
    const username = req.params.username;
    connection.query('DELETE FROM users WHERE username = ?', [username], (err) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'DB error' });
        }
        res.json({ success: true });
    });
});

app.put('/updateUser/:username', (req, res) => {
    const username = req.params.username;
    const updates = req.body;
    connection.query('UPDATE users SET ? WHERE username = ?', [updates, username], (err) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'DB error' });
        }
        res.json({ success: true });
    });
});

app.get('/meetings', (_req, res) => {
    connection.query('SELECT COUNT(*) AS count FROM reuniones', (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'DB error' });
        }
        res.json({ count: results[0].count });
    });
});

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
