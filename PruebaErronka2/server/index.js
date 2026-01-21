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
  const {
    username,
    password
  } = req.body;
  connection.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'DB error'
        });
      }
      if (results && results.length > 0) {
        res.json({
          success: true
        });
      } else {
        res.json({
          success: false
        });
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
      res.json({
        titularidades,
        territorios
      });
    }).catch(() => {
      res.status(500).json({
        error: 'Error fetching data'
      });
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
      res.status(500).json({
        error: 'Error fetching data'
      });
    });
  } else if (type === 'meetings') {
    connection.query('SELECT * FROM reuniones ORDER BY fecha DESC', (err, results) => {
      if (err) {
        console.error('Error fetching meetings:', err);
        return res.status(500).json({
          success: false,
          error: 'DB error'
        });
      }
      const mappedResults = results.map(reunion => ({
        ...reunion,
        estado: reunion.estado_eus || reunion.estado || 'pendiente'
      }));
      res.json(mappedResults);
    });
  } else {
    // Default: centers
    axios.get('http://10.5.104.100/ikastetxeak.json').then(response => {
      let data = response.data.CENTROS;
      if (req.query.titularidad) data = data.filter(r => r.DTITUC === req.query.titularidad);
      if (req.query.territorio) data = data.filter(r => r.DTERRC === req.query.territorio);
      if (req.query.municipio) data = data.filter(r => r.DMUNIC === req.query.municipio);
      res.json(data);
    }).catch(() => {
      res.status(500).json({
        error: 'Error fetching data'
      });
    });
  }
});

app.get('/users', (_req, res) => {
  connection.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'DB error'
      });
    }
    res.json(results);
  });
});

app.put('/updateUser/:id', (req, res) => {
  const userId = req.params.id;
  const userData = req.body;
  connection.query('UPDATE users SET ? WHERE id = ?', [userData, userId], (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'DB error'
      });
    }
    res.json({
      success: true
    });
  });
});

app.delete('/deleteUser/:username', (req, res) => {
  const username = req.params.username;
  connection.query('DELETE FROM users WHERE username = ?', [username], (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'DB error'
      });
    }
    res.json({
      success: true
    });
  });
});

app.get('/filterUserByRole', (req, res) => {
  const tipoId = req.query.tipo_id;
  let query = 'SELECT * FROM users';
  const params = [];
  if (tipoId) {
    query += ' WHERE tipo_id = ?';
    params.push(tipoId);
  }
  connection.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'DB error'
      });
    }
    res.json(results);
  });
});


// ✅ ACTUALIZAR ESTADO DE REUNIÓN
// Columna en BD: estado_eus (ENUM: 'pendiente', 'aceptada', 'denegada', 'conflicto')
app.put('/updateMeeting/:id', (req, res) => {
  const meetingId = req.params.id;
  const nuevoEstado = req.body.estado;

  console.log('=== UPDATE MEETING ===');
  console.log('ID recibido:', meetingId);
  console.log('Nuevo estado recibido:', nuevoEstado);


  // SEGUNDO: Actualizar usando la columna estado_eus
  const query = 'UPDATE reuniones SET estado = ? WHERE id_reunion = ?';

  connection.query(query, [nuevoEstado, meetingId], (err2, result) => {
    if (err2) {
      console.error('ERROR en UPDATE:', err2);
      return res.status(500).json({
        success: false,
        error: 'Error en base de datos',
        details: err2.message
      });
    }
  });
});

app.get('/countMeetings', (_req, res) => {
  connection.query('SELECT COUNT(*) AS count FROM reuniones', (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'DB error'
      });
    }
    res.json({
      count: results[0].count
    });
  });
});

app.get('/countUsers', (_req, res) => {
  connection.query('SELECT COUNT(*) AS count FROM users WHERE tipo_id = 4', (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'DB error'
      });
    }
    res.json({
      count: results[0].count
    });
  });
});

app.get('/countTeachers', (_req, res) => {
  connection.query('SELECT COUNT(*) AS count FROM users WHERE tipo_id = 3', (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'DB error'
      });
    }
    res.json({
      count: results[0].count
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
