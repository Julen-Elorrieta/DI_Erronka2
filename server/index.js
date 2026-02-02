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
    'SELECT id, email, username, password, nombre, apellidos, dni, direccion, telefono1, telefono2, tipo_id, argazkia_url FROM users WHERE username = ? AND password = ?',
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
            tipo_id: user.tipo_id,
          },
          SECRET_KEY,
          { expiresIn: '8h' },
        );

        console.log('Login exitoso para:', user.username);

        res.json({
          success: true,
          token: token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            nombre: user.nombre,
            apellidos: user.apellidos,
            dni: user.dni,
            direccion: user.direccion,
            telefono1: user.telefono1,
            telefono2: user.telefono2,
            tipo_id: user.tipo_id,
            argazkia_url: user.argazkia_url,
          },
        });
      } else {
        res.json({ success: false, error: 'Invalid credentials' });
      }
    },
  );
});

// ============================================
// VERIFICAR TOKEN - Endpoint para validar token
// ============================================
app.get('/verify-token', verifyToken, (req, res) => {
  connection.query(
    'SELECT id, email, username, nombre, apellidos, dni, direccion, telefono1, telefono2, tipo_id, argazkia_url FROM users WHERE id = ?',
    [req.userId],
    (err, results) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'DB error' });
      }

      if (results && results.length > 0) {
        const user = results[0];
        res.json({
          success: true,
          user: user,
        });
      } else {
        res.status(401).json({ success: false, error: 'User not found' });
      }
    },
  );
});

// ============================================
// RUTAS PROTEGIDAS (requieren token válido)
// ============================================

app.get('/centers', verifyToken, (req, res) => {
  const type = req.query.type;

  if (type === 'filters') {
    axios
      .get('http://localhost:8080/elorserv/api/ikastetxeak')
      .then((response) => {
        const data = response.data.CENTROS;
        const titularidades = [...new Set(data.map((r) => r.DTITUC))];
        const territorios = [...new Set(data.map((r) => r.DTERRC))];
        res.json({ titularidades, territorios });
      })
      .catch(() => {
        res.status(500).json({ error: 'Error fetching data' });
      });
  } else if (type === 'municipios') {
    const territorio = req.query.territorio;
    axios
      .get('http://localhost:8080/elorserv/api/ikastetxeak')
      .then((response) => {
        const data = response.data.CENTROS;
        let municipios = data.map((r) => r.DMUNIC);
        if (territorio) {
          municipios = data.filter((r) => r.DTERRC === territorio).map((r) => r.DMUNIC);
        }
        res.json([...new Set(municipios)]);
      })
      .catch(() => {
        res.status(500).json({ error: 'Error fetching data' });
      });
  } else if (type === 'meetings') {
    // Bilerak filtratu erabiltzailearen arabera
    // GOD/ADMIN: Bilera guztiak ikus ditzake
    // IRAKASLEA/IKASLEA: Bere bilerak bakarrik (profesor_id edo alumno_id)
    let query = 'SELECT * FROM reuniones';
    let params = [];
    
    // Irakaslea edo ikaslea bada, bere bilerak bakarrik erakutsi
    if (req.tipoId === 3 || req.tipoId === 4) {
      query += ' WHERE profesor_id = ? OR alumno_id = ?';
      params = [req.userId, req.userId];
    }
    query += ' ORDER BY fecha DESC';

    connection.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching meetings:', err);
        return res.status(500).json({ success: false, error: 'DB error' });
      }

      // Mapear y validar resultados - asegurar que todos los campos existen
      const mappedResults = results.map((reunion) => ({
        id_reunion: reunion.id_reunion || null,
        titulo: reunion.titulo || null,
        asunto: reunion.asunto || null,
        fecha: reunion.fecha || null,
        aula: reunion.aula || null,
        id_centro: reunion.id_centro || null,
        profesor_id: reunion.profesor_id || null,
        alumno_id: reunion.alumno_id || null,
        estado: reunion.estado_eus || reunion.estado || 'pendiente',
      }));

      console.log(`📅 Devolviendo ${mappedResults.length} reuniones para usuario ${req.userId} (tipo: ${req.tipoId})`);

      res.json(mappedResults);
    });
  } else {
    axios
      .get('http://localhost:8080/elorserv/api/ikastetxeak')
      .then((response) => {
        let data = response.data.CENTROS;
        if (req.query.titularidad) data = data.filter((r) => r.DTITUC === req.query.titularidad);
        if (req.query.territorio) data = data.filter((r) => r.DTERRC === req.query.territorio);
        if (req.query.municipio) data = data.filter((r) => r.DMUNIC === req.query.municipio);
        res.json(data);
      })
      .catch(() => {
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

// ============================================
// ENDPOINTS DE SCHEDULE (HORARIOS)
// ============================================

app.get('/schedule/:userId', verifyToken, (req, res) => {
  const userId = req.params.userId;

  // Verificar permisos: solo puede ver su propio horario (excepto GOD/ADMIN)
  if (req.tipoId !== 1 && req.tipoId !== 2 && req.userId !== parseInt(userId)) {
    return res.status(403).json({ success: false, error: 'No tienes permisos' });
  }

  // Primero determinar el tipo de usuario
  connection.query('SELECT tipo_id FROM users WHERE id = ?', [userId], (err, userResults) => {
    if (err || !userResults.length) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }

    const userTipoId = userResults[0].tipo_id;
    let query;
    let params;

    if (userTipoId === 3) {
      // PROFESOR: obtener horarios donde es profesor
      query = `SELECT h.id, h.dia, h.hora, h.profe_id, h.modulo_id, h.aula, h.observaciones,
                      m.nombre as subject, m.nombre_eus, c.nombre as cycle
               FROM horarios h
               LEFT JOIN modulos m ON h.modulo_id = m.id
               LEFT JOIN ciclos c ON m.ciclo_id = c.id
               WHERE h.profe_id = ?
               ORDER BY CASE h.dia
                 WHEN 'LUNES' THEN 0 WHEN 'MARTES' THEN 1 WHEN 'MIERCOLES' THEN 2
                 WHEN 'JUEVES' THEN 3 WHEN 'VIERNES' THEN 4
               END, h.hora`;
      params = [userId];
    } else if (userTipoId === 4) {
      // ALUMNO: obtener horarios basados en su matrícula (ciclo/curso)
      query = `SELECT DISTINCT h.id, h.dia, h.hora, h.profe_id, h.modulo_id, h.aula, h.observaciones,
                      m.nombre as subject, m.nombre_eus, c.nombre as cycle,
                      u.nombre as profesor_nombre
               FROM horarios h
               INNER JOIN modulos m ON h.modulo_id = m.id
               INNER JOIN ciclos c ON m.ciclo_id = c.id
               INNER JOIN matriculaciones mat ON mat.ciclo_id = c.id
               LEFT JOIN users u ON h.profe_id = u.id
               WHERE mat.alum_id = ? AND m.curso = mat.curso
               ORDER BY CASE h.dia
                 WHEN 'LUNES' THEN 0 WHEN 'MARTES' THEN 1 WHEN 'MIERCOLES' THEN 2
                 WHEN 'JUEVES' THEN 3 WHEN 'VIERNES' THEN 4
               END, h.hora`;
      params = [userId];
    } else {
      // GOD/ADMIN: sin horario propio, devolver vacío
      return res.json({ userId: userId, slots: [] });
    }

    connection.query(query, params, (err, results) => {
      if (err) {
        console.error('Error fetching schedule:', err);
        return res.status(500).json({ success: false, error: 'DB error' });
      }

      // Transformar resultados al formato esperado
      const slots = results.map((row) => ({
        day: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'].indexOf(row.dia),
        hour: row.hora,
        type: row.observaciones
          ? row.observaciones.includes('Tutoria')
            ? 'TUTORIA'
            : row.observaciones.includes('Guardia')
              ? 'GUARDIA'
              : 'CLASS'
          : 'CLASS',
        subject: row.subject || row.modulo_nombre,
        cycle: row.cycle,
        classroom: row.aula,
        teacher: row.profesor_nombre,
      }));

      res.json({
        userId: userId,
        slots: slots,
      });
    });
  });
});

// ============================================
// ENDPOINTS DE MEETINGS
// ============================================

app.get('/meetings', verifyToken, (_req, res) => {
  connection.query('SELECT * FROM reuniones ORDER BY fecha DESC', (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json(results || []);
  });
});

app.get('/meetings/user/:userId', verifyToken, (req, res) => {
  const userId = req.params.userId;

  // Verificar permisos
  if (req.tipoId !== 1 && req.tipoId !== 2 && req.userId !== parseInt(userId)) {
    return res.status(403).json({ success: false, error: 'No tienes permisos' });
  }

  const query =
    'SELECT * FROM reuniones WHERE profesor_id = ? OR alumno_id = ? ORDER BY fecha DESC';
  connection.query(query, [userId, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json(results || []);
  });
});

app.get('/meetings/:meetingId', verifyToken, (req, res) => {
  const meetingId = req.params.meetingId;

  connection.query('SELECT * FROM reuniones WHERE id_reunion = ?', [meetingId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }

    if (results && results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ success: false, error: 'Meeting not found' });
    }
  });
});

app.post('/meetings', verifyToken, (req, res) => {
  const { title, topic, fecha, classroom, id_centro, profesor_id, alumno_id } = req.body;

  const query = `INSERT INTO reuniones (titulo, asunto, fecha, aula, id_centro, profesor_id, alumno_id, estado)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')`;

  connection.query(
    query,
    [title, topic, fecha, classroom, id_centro, profesor_id, alumno_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'DB error', details: err.message });
      }
      res.json({ success: true, id: result.insertId });
    },
  );
});

app.put('/meetings/:meetingId', verifyToken, (req, res) => {
  const meetingId = req.params.meetingId;
  const { title, topic, fecha, classroom } = req.body;

  const query =
    'UPDATE reuniones SET titulo = ?, asunto = ?, fecha = ?, aula = ? WHERE id_reunion = ?';

  connection.query(query, [title, topic, fecha, classroom, meetingId], (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error', details: err.message });
    }
    res.json({ success: true });
  });
});

app.put('/meetings/:meetingId/status', verifyToken, (req, res) => {
  const meetingId = req.params.meetingId;
  const { status } = req.body;

  const query = 'UPDATE reuniones SET estado = ? WHERE id_reunion = ?';

  connection.query(query, [status, meetingId], (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error', details: err.message });
    }
    res.json({ success: true });
  });
});

app.delete('/meetings/:meetingId', verifyToken, (req, res) => {
  const meetingId = req.params.meetingId;

  connection.query('DELETE FROM reuniones WHERE id_reunion = ?', [meetingId], (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error', details: err.message });
    }
    res.json({ success: true });
  });
});

app.put('/updateMeeting/:id', verifyToken, (req, res) => {
  const meetingId = req.params.id;
  const nuevoEstado = req.body.estado;

  console.log('=== UPDATE MEETING ===');
  console.log('ID recibido:', meetingId);
  console.log('Nuevo estado recibido:', nuevoEstado);

  const query = 'UPDATE reuniones SET estado = ? WHERE id_reunion = ?';

  connection.query(query, [nuevoEstado, meetingId], (err) => {
    if (err) {
      console.error('ERROR en UPDATE:', err);
      return res.status(500).json({
        success: false,
        error: 'Error en base de datos',
        details: err.message,
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

// ============================================
// ENDPOINTS DE CICLOS (Degree programs)
// ============================================

app.get('/ciclos', verifyToken, (_req, res) => {
  connection.query('SELECT * FROM ciclos', (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json(results);
  });
});

app.post('/ciclos', verifyToken, (req, res) => {
  // Solo ADMIN (tipo_id 2) y GOD (tipo_id 1)
  if (req.tipoId !== 1 && req.tipoId !== 2) {
    return res.status(403).json({ success: false, error: 'No tienes permisos' });
  }

  const { nombre } = req.body;
  const query = 'INSERT INTO ciclos (nombre) VALUES (?)';

  connection.query(query, [nombre], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error', details: err.message });
    }
    res.json({ success: true, id: result.insertId });
  });
});

app.put('/ciclos/:id', verifyToken, (req, res) => {
  if (req.tipoId !== 1 && req.tipoId !== 2) {
    return res.status(403).json({ success: false, error: 'No tienes permisos' });
  }

  const { nombre } = req.body;
  const query = 'UPDATE ciclos SET nombre = ? WHERE id = ?';

  connection.query(query, [nombre, req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json({ success: true });
  });
});

app.delete('/ciclos/:id', verifyToken, (req, res) => {
  if (req.tipoId !== 1 && req.tipoId !== 2) {
    return res.status(403).json({ success: false, error: 'No tienes permisos' });
  }

  connection.query('DELETE FROM ciclos WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json({ success: true });
  });
});

// ============================================
// ENDPOINTS DE MÓDULOS
// ============================================

app.get('/modulos', verifyToken, (_req, res) => {
  const query = `SELECT m.*, c.nombre as ciclo_nombre FROM modulos m 
                 LEFT JOIN ciclos c ON m.ciclo_id = c.id
                 ORDER BY m.ciclo_id, m.curso, m.nombre`;

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json(results);
  });
});

app.post('/modulos', verifyToken, (req, res) => {
  if (req.tipoId !== 1 && req.tipoId !== 2) {
    return res.status(403).json({ success: false, error: 'No tienes permisos' });
  }

  const { nombre, nombre_eus, horas, ciclo_id, curso } = req.body;
  const query =
    'INSERT INTO modulos (nombre, nombre_eus, horas, ciclo_id, curso) VALUES (?, ?, ?, ?, ?)';

  connection.query(query, [nombre, nombre_eus, horas, ciclo_id, curso], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error', details: err.message });
    }
    res.json({ success: true, id: result.insertId });
  });
});

app.put('/modulos/:id', verifyToken, (req, res) => {
  if (req.tipoId !== 1 && req.tipoId !== 2) {
    return res.status(403).json({ success: false, error: 'No tienes permisos' });
  }

  const { nombre, nombre_eus, horas, ciclo_id, curso } = req.body;
  const query =
    'UPDATE modulos SET nombre = ?, nombre_eus = ?, horas = ?, ciclo_id = ?, curso = ? WHERE id = ?';

  connection.query(query, [nombre, nombre_eus, horas, ciclo_id, curso, req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json({ success: true });
  });
});

app.delete('/modulos/:id', verifyToken, (req, res) => {
  if (req.tipoId !== 1 && req.tipoId !== 2) {
    return res.status(403).json({ success: false, error: 'No tienes permisos' });
  }

  connection.query('DELETE FROM modulos WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json({ success: true });
  });
});

// ============================================
// ENDPOINTS DE HORARIOS
// ============================================

app.get('/horarios', verifyToken, (req, res) => {
  let query = `SELECT h.*, u.nombre as profesor_nombre, u.apellidos, m.nombre as modulo_nombre
               FROM horarios h
               LEFT JOIN users u ON h.profe_id = u.id
               LEFT JOIN modulos m ON h.modulo_id = m.id`;

  // Si es profesor, solo puede ver sus propios horarios
  if (req.tipoId === 3) {
    query += ` WHERE h.profe_id = ${req.userId}`;
  }

  query += ` ORDER BY CASE h.dia
    WHEN 'LUNES' THEN 0 WHEN 'MARTES' THEN 1 WHEN 'MIERCOLES' THEN 2 
    WHEN 'JUEVES' THEN 3 WHEN 'VIERNES' THEN 4 END, h.hora`;

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json(results);
  });
});

app.post('/horarios', verifyToken, (req, res) => {
  if (req.tipoId !== 1 && req.tipoId !== 2) {
    return res.status(403).json({ success: false, error: 'No tienes permisos' });
  }

  const { dia, hora, profe_id, modulo_id, aula, observaciones } = req.body;
  const query =
    'INSERT INTO horarios (dia, hora, profe_id, modulo_id, aula, observaciones) VALUES (?, ?, ?, ?, ?, ?)';

  connection.query(query, [dia, hora, profe_id, modulo_id, aula, observaciones], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error', details: err.message });
    }
    res.json({ success: true, id: result.insertId });
  });
});

app.put('/horarios/:id', verifyToken, (req, res) => {
  if (req.tipoId !== 1 && req.tipoId !== 2) {
    return res.status(403).json({ success: false, error: 'No tienes permisos' });
  }

  const { dia, hora, profe_id, modulo_id, aula, observaciones } = req.body;
  const query =
    'UPDATE horarios SET dia = ?, hora = ?, profe_id = ?, modulo_id = ?, aula = ?, observaciones = ? WHERE id = ?';

  connection.query(
    query,
    [dia, hora, profe_id, modulo_id, aula, observaciones, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'DB error' });
      }
      res.json({ success: true });
    },
  );
});

app.delete('/horarios/:id', verifyToken, (req, res) => {
  if (req.tipoId !== 1 && req.tipoId !== 2) {
    return res.status(403).json({ success: false, error: 'No tienes permisos' });
  }

  connection.query('DELETE FROM horarios WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json({ success: true });
  });
});

// ============================================
// ENDPOINTS DE MATRICULACIONES
// ============================================

app.get('/matriculaciones', verifyToken, (req, res) => {
  let query = `SELECT m.*, u.nombre as alumno_nombre, u.apellidos, c.nombre as ciclo_nombre
               FROM matriculaciones m
               LEFT JOIN users u ON m.alum_id = u.id
               LEFT JOIN ciclos c ON m.ciclo_id = c.id`;

  // Si es alumno, solo puede ver sus matriculaciones
  if (req.tipoId === 4) {
    query += ` WHERE m.alum_id = ${req.userId}`;
  }

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json(results);
  });
});

app.post('/matriculaciones', verifyToken, (req, res) => {
  if (req.tipoId !== 1 && req.tipoId !== 2) {
    return res.status(403).json({ success: false, error: 'No tienes permisos' });
  }

  const { alum_id, ciclo_id, curso, fecha } = req.body;
  const query = 'INSERT INTO matriculaciones (alum_id, ciclo_id, curso, fecha) VALUES (?, ?, ?, ?)';

  connection.query(query, [alum_id, ciclo_id, curso, fecha], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error', details: err.message });
    }
    res.json({ success: true, id: result.insertId });
  });
});

app.put('/matriculaciones/:id', verifyToken, (req, res) => {
  if (req.tipoId !== 1 && req.tipoId !== 2) {
    return res.status(403).json({ success: false, error: 'No tienes permisos' });
  }

  const { alum_id, ciclo_id, curso, fecha } = req.body;
  const query =
    'UPDATE matriculaciones SET alum_id = ?, ciclo_id = ?, curso = ?, fecha = ? WHERE id = ?';

  connection.query(query, [alum_id, ciclo_id, curso, fecha, req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json({ success: true });
  });
});

app.delete('/matriculaciones/:id', verifyToken, (req, res) => {
  if (req.tipoId !== 1 && req.tipoId !== 2) {
    return res.status(403).json({ success: false, error: 'No tienes permisos' });
  }

  connection.query('DELETE FROM matriculaciones WHERE id = ?', [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    res.json({ success: true });
  });
});

// ============================================
// ENDPOINTS DE USUARIO (CRUD adicional)
// ============================================

app.post('/users', verifyToken, (req, res) => {
  if (req.tipoId !== 1 && req.tipoId !== 2) {
    return res.status(403).json({ success: false, error: 'No tienes permisos' });
  }

  const {
    email,
    username,
    password,
    nombre,
    apellidos,
    dni,
    direccion,
    telefono1,
    telefono2,
    tipo_id,
  } = req.body;
  const query = `INSERT INTO users (email, username, password, nombre, apellidos, dni, direccion, telefono1, telefono2, tipo_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.query(
    query,
    [email, username, password, nombre, apellidos, dni, direccion, telefono1, telefono2, tipo_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'DB error', details: err.message });
      }
      res.json({ success: true, id: result.insertId });
    },
  );
});

app.get('/users/:id', verifyToken, (req, res) => {
  // Verificar permisos: solo GOD/ADMIN o el mismo usuario
  if (req.tipoId !== 1 && req.tipoId !== 2 && req.userId !== parseInt(req.params.id)) {
    return res.status(403).json({ success: false, error: 'No tienes permisos' });
  }

  connection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'DB error' });
    }
    if (results && results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${port}`);
});
