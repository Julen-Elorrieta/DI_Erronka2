// Backend Express con JWT para login con MySQL
const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// IMPORTANTE: Cambia esto por una clave secreta única y segura
const SECRET_KEY = 'mi-clave-super-secreta-2024-cambiar-en-produccion';

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

// ============================================
// MIDDLEWARE PARA VERIFICAR TOKEN JWT
// ============================================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
    req.userId = decoded.id;
    req.username = decoded.username;
    req.tipoId = decoded.tipo_id;
    next();
  });
};

// ============================================
// LOGIN - NO PROTEGIDO (genera el token)
// ============================================
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  connection.query(
    'SELECT id, username, tipo_id FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        console.error('Error en login:', err);
        return res.status(500).json({ success: false, error: 'DB error' });
      }
      
      if (results && results.length > 0) {
        const user = results[0];
        
        // Generar token JWT válido por 8 horas
        const token = jwt.sign(
          { 
            id: user.id, 
            username: user.username,
            tipo_id: user.tipo_id
          },
          SECRET_KEY,
          { expiresIn: '8h' }
        );
        
        console.log('Login exitoso para:', user.username);
        
        res.json({
          success: true,
          token: token,
          user: {
            id: user.id,
            username: user.username,
            tipo_id: user.tipo_id
          }
        });
      } else {
        res.json({ success: false, error: 'Invalid credentials' });
      }
    }
  );
});

// ============================================
// VERIFICAR TOKEN - Endpoint para validar token
// ============================================
app.get('/verify-token', verifyToken, (req, res) => {
  res.json({ 
    success: true, 
    user: { 
      id: req.userId, 
      username: req.username,
      tipo_id: req.tipoId
    } 
  });
});

// ============================================
// RUTAS PROTEGIDAS (requieren token válido)
// ============================================

app.get('/centers', verifyToken, (req, res) => {
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
    connection.query('SELECT * FROM reuniones ORDER BY fecha DESC', (err, results) => {
      if (err) {
        console.error('Error fetching meetings:', err);
        return res.status(500).json({ success: false, error: 'DB error' });
      }
      const mappedResults = results.map(reunion => ({
        ...reunion,
        estado: reunion.estado_eus || reunion.estado || 'pendiente'
      }));
      res.json(mappedResults);
    });
  } else {
    axios.get('http://10.5.104.100/ikastetxeak.json').then(response => {
      let data = response.data.CENTROS;
      if (req.query.titularidad) data = data.filter(r => r.DTITUC === req.query.titularidad);
      if (req.query.territorio) data = data.filter(r => r.DTERRC === req.query.territorio);
      if (req.query.municipio) data = data.filter(r => r.DMUNIC === req.query.municipio);
      res.json(data);
    }).catch(() => {
      res.status(500).json({ error: 'Error fetching data' });
    });
  }
});

app.get('/users', verifyToken, (_req, res) => {
  connection.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json(results);
  });
});

app.put('/updateUser/:id', verifyToken, (req, res) => {
  const userId = req.params.id;
  const userData = req.body;
  connection.query('UPDATE users SET ? WHERE id = ?', [userData, userId], (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json({ success: true });
  });
});

app.delete('/deleteUser/:username', verifyToken, (req, res) => {
  const username = req.params.username;
  connection.query('DELETE FROM users WHERE username = ?', [username], (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json({ success: true });
  });
});

app.get('/filterUserByRole', verifyToken, (req, res) => {
  const tipoId = req.query.tipo_id;
  let query = 'SELECT * FROM users';
  const params = [];
  if (tipoId) {
    query += ' WHERE tipo_id = ?';
    params.push(tipoId);
  }
  connection.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json(results);
  });
});

app.put('/updateMeeting/:id', verifyToken, (req, res) => {
  const meetingId = req.params.id;
  const nuevoEstado = req.body.estado;

  console.log('=== UPDATE MEETING ===');
  console.log('ID recibido:', meetingId);
  console.log('Nuevo estado recibido:', nuevoEstado);

  const query = 'UPDATE reuniones SET estado = ? WHERE id_reunion = ?';

  connection.query(query, [nuevoEstado, meetingId], (err, result) => {
    if (err) {
      console.error('ERROR en UPDATE:', err);
      return res.status(500).json({
        success: false,
        error: 'Error en base de datos',
        details: err.message
      });
    }
    res.json({ success: true });
  });
});

app.get('/countMeetings', verifyToken, (_req, res) => {
  connection.query('SELECT COUNT(*) AS count FROM reuniones', (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json({ count: results[0].count });
  });
});

app.get('/countUsers', verifyToken, (_req, res) => {
  connection.query('SELECT COUNT(*) AS count FROM users WHERE tipo_id = 4', (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json({ count: results[0].count });
  });
});

app.get('/countTeachers', verifyToken, (_req, res) => {
  connection.query('SELECT COUNT(*) AS count FROM users WHERE tipo_id = 3', (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json({ count: results[0].count });
  });
});

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});