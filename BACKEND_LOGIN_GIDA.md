# Backend Login Inplementazio Gida

## 📋 Oinarrizko Informazioa

Zure Angular aplikazioak **http://10.5.104.100:3000/api** helbidean espero du backend-a.

Database: **elordb** PostgreSQL datu-basea.

---

## 🔐 Login Endpointa Sortu

### 1. POST /api/auth/login

**Eskaera (Request):**
```json
{
  "username": "god",
  "encryptedPassword": "base64_enkriptatutako_pasahitza..."
}
```

**Erantzuna arrakasta (Response 200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "god",
    "email": "god@elorrieta.com",
    "name": "Super",
    "surname": "Admin",
    "role": "GOD",
    "photo": "unknown.jpg"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Erantzuna errore (Response 401):**
```json
{
  "success": false,
  "message": "Erabiltzaile edo pasahitz okerra"
}
```

---

## 🛠️ Node.js/Express Inplementazio Adibidea

### Beharrezko Paketeak Instalatu

```bash
npm install express bcrypt jsonwebtoken crypto node-rsa cors
npm install --save-dev @types/express @types/jsonwebtoken @types/bcrypt
```

### Konfigurazio Fitxategiak

#### `.env` fitxategia
```env
PORT=3000
DB_HOST=10.5.104.100
DB_NAME=elordb
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Secret (256-bit aldatu behar duzu)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# RSA Gakoak
RSA_PRIVATE_KEY_PATH=./keys/private.pem
RSA_PUBLIC_KEY_PATH=./keys/public.pem
```

### RSA Gako Bikotea Sortu

**1. Gakoak sortzeko script-a** (`generate-keys.js`):

```javascript
const NodeRSA = require('node-rsa');
const fs = require('fs');

// RSA gako bikotea sortu (2048 bit)
const key = new NodeRSA({b: 2048});

// PEM formatuan gorde
const privateKey = key.exportKey('pkcs1-private-pem');
const publicKey = key.exportKey('pkcs8-public-pem');

// Direktorioa sortu
if (!fs.existsSync('./keys')) {
  fs.mkdirSync('./keys');
}

// Gakoak gorde
fs.writeFileSync('./keys/private.pem', privateKey);
fs.writeFileSync('./keys/public.pem', publicKey);

console.log('✅ RSA gakoak sortu dira:');
console.log('   - ./keys/private.pem (PRIVATU - ez partekatu!)');
console.log('   - ./keys/public.pem (PUBLIKO - frontend-ean erabili)');
```

**Exekutatu:**
```bash
node generate-keys.js
```

**2. Gako publikoa frontend-era kopiatu:**

`keys/public.pem` fitxategiaren edukia kopiatu eta `crypto.util.ts`-n jarri:

```typescript
// crypto.util.ts
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
... (zure gako publikoa hemen) ...
-----END PUBLIC KEY-----`;
```

---

## 📡 Backend Kodea

### 1. Database Konexioa (`db.js`)

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || '10.5.104.100',
  database: process.env.DB_NAME || 'elordb',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: 5432,
  ssl: false
});

module.exports = pool;
```

### 2. Auth Kontroladorea (`controllers/authController.js`)

```javascript
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const NodeRSA = require('node-rsa');
const fs = require('fs');
const pool = require('../db');

// RSA gako pribatua kargatu
const privateKey = new NodeRSA(
  fs.readFileSync(process.env.RSA_PRIVATE_KEY_PATH)
);

/**
 * Login endpointa
 */
async function login(req, res) {
  try {
    const { username, encryptedPassword } = req.body;

    // 1. Balidatu datuak
    if (!username || !encryptedPassword) {
      return res.status(400).json({
        success: false,
        message: 'Username eta encryptedPassword beharrezkoak dira'
      });
    }

    // 2. Pasahitza desenkriptatu
    let password;
    try {
      const decrypted = privateKey.decrypt(encryptedPassword, 'utf8');
      password = decrypted;
    } catch (error) {
      console.error('Errorea pasahitza desenkriptatzen:', error);
      return res.status(400).json({
        success: false,
        message: 'Pasahitz formatu okerra'
      });
    }

    // 3. Erabiltzailea bilatu datu-basean
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Erabiltzaile edo pasahitz okerra'
      });
    }

    const user = result.rows[0];

    // 4. Pasahitza egiaztatu
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Erabiltzaile edo pasahitz okerra'
      });
    }

    // 5. JWT Token sortu
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' } // 8 orduko iraupena
    );

    // 6. Erantzuna bidali (pasahitza ezkutatu)
    const { password_hash, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      user: {
        id: userWithoutPassword.id,
        username: userWithoutPassword.username,
        email: userWithoutPassword.email,
        name: userWithoutPassword.name,
        surname: userWithoutPassword.surname,
        role: userWithoutPassword.role,
        photo: userWithoutPassword.photo,
        // Ikaslearen eremuak (baditu)
        cycle: userWithoutPassword.cycle,
        course: userWithoutPassword.course,
        isDual: userWithoutPassword.is_dual,
        group: userWithoutPassword.group
      },
      token
    });

  } catch (error) {
    console.error('Login errorea:', error);
    return res.status(500).json({
      success: false,
      message: 'Zerbitzari errorea'
    });
  }
}

module.exports = { login };
```

### 3. Auth Routes (`routes/auth.js`)

```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;
```

### 4. Server Nagusia (`server.js`)

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // Produkzioan aldatu Angular app URL-ra
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // RSA enkriptatutako pasahitzak handiak dira

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server martxan dago' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Zerbitzari errorea'
  });
});

// Server hasi
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server martxan http://10.5.104.100:${PORT} helbidean`);
});
```

---

## 🗄️ Database Egitura

### Users Taula Sortu

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('GOD', 'ADMIN', 'TEACHER', 'STUDENT')),
  photo VARCHAR(255) DEFAULT 'unknown.jpg',
  
  -- Ikaslearen eremuak
  cycle VARCHAR(10),
  course VARCHAR(10),
  is_dual BOOLEAN DEFAULT false,
  "group" VARCHAR(5),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index-ak
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Hasierako Erabiltzaileak Sortu

```sql
-- Pasahitzak: bcrypt hash-ak (originalak: god123, admin123, teacher123, student123)

INSERT INTO users (username, email, password_hash, name, surname, role) VALUES
('god', 'god@elorrieta.com', '$2b$10$YourBcryptHashHere', 'Super', 'Admin', 'GOD'),
('admin', 'admin@elorrieta.com', '$2b$10$YourBcryptHashHere', 'Admin', 'Idazkaritza', 'ADMIN'),
('teacher', 'teacher@elorrieta.com', '$2b$10$YourBcryptHashHere', 'Jon', 'Irakaslea', 'TEACHER'),
('student', 'student@elorrieta.com', '$2b$10$YourBcryptHashHere', 'Miren', 'Ikaslea', 'STUDENT', 
 'unknown.jpg', '2DAM', '2º', false, 'D');
```

### Pasahitz Hash-ak Sortzeko Script

```javascript
// hash-password.js
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}\n`);
}

// Pasahitz guztiak hash-eatu
hashPassword('god123');
hashPassword('admin123');
hashPassword('teacher123');
hashPassword('student123');
```

Exekutatu: `node hash-password.js` eta kopiatu hash-ak INSERT-era.

---

## 🔐 JWT Token Egiaztatzeko Middleware

### `middleware/authMiddleware.js`

```javascript
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token falta da'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token baliogabea'
      });
    }

    req.user = user; // { userId, username, role }
    next();
  });
}

// Rol egiaztapena
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autentifikatu behar duzu'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Ez duzu baimenik'
      });
    }

    next();
  };
}

module.exports = { authenticateToken, requireRole };
```

### Middleware erabilera adibidea

```javascript
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Erabiltzaile guztiak lortu (ADMIN edo GOD bakarrik)
router.get('/users', 
  authenticateToken, 
  requireRole('ADMIN', 'GOD'), 
  userController.getUsers
);
```

---

## 🔄 Frontend Aldaketak (Angular)

### 1. environment.development.ts Aldatu

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://10.5.104.100:3000/api',
  database: { host: '10.5.104.100', name: 'elordb' },
  mapbox: { accessToken: 'YOUR_MAPBOX_TOKEN_HERE' },
  enableMockData: false,  // ⚠️ FALSE jarri API erabili nahi baduzu
  enableDebugLogs: true
};
```

### 2. crypto.util.ts - Gako Publikoa Eguneratu

Backend-ean sortutako `keys/public.pem` edukia kopiatu:

```typescript
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA... (zure gakoa)
-----END PUBLIC KEY-----`;
```

### 3. auth.interceptor.ts - Token bidali

Interceptor-a dagoeneko prestatuta dago baina hobetu behar da:

```typescript
if (currentUser) {
  const token = localStorage.getItem('authToken'); // Token-a gorde login-ean
  
  const clonedRequest = req.clone({
    setHeaders: {
      'Authorization': `Bearer ${token}`,
      'X-User-Role': currentUser.role
    }
  });
  
  return next(clonedRequest);
}
```

### 4. auth.service.ts - Token gorde

```typescript
async login(username: string, password: string): Promise<boolean> {
  try {
    const encryptedPassword = await CryptoUtil.encryptWithPublicKey(
      CryptoUtil.PUBLIC_KEY,
      password
    );

    const response = await firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, {
        username,
        encryptedPassword
      })
    );

    if (response.success && response.user) {
      this.currentUser.set(response.user);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('authToken', response.token); // ⭐ Token-a gorde
      console.log('[ONDO] Login arrakastatsua');
      return true;
    }

    return false;
  } catch (error) {
    console.error('[ERROREA] Login-ean:', error);
    return false;
  }
}
```

---

## 🚀 Zerbitzaria Abiarazi

### 1. Proiektu egitura

```
backend/
├── controllers/
│   └── authController.js
├── middleware/
│   └── authMiddleware.js
├── routes/
│   └── auth.js
├── keys/
│   ├── private.pem
│   └── public.pem
├── db.js
├── server.js
├── generate-keys.js
├── hash-password.js
├── .env
├── package.json
└── README.md
```

### 2. Package.json

```json
{
  "name": "eloradmin-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "node-rsa": "^1.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 3. Instalatu eta abiarazi

```bash
# Backend direktorioan
cd backend

# Paketeak instalatu
npm install

# RSA gakoak sortu
node generate-keys.js

# Pasahitz hash-ak sortu
node hash-password.js

# Zerbitzaria abiarazi
npm start

# edo garapen moduan (auto-reload)
npm run dev
```

---

## ✅ Probatzeko Pausoak

### 1. Zerbitzaria martxan dagoela egiaztatu

```bash
curl http://10.5.104.100:3000/api/health
```

Erantzuna: `{"status":"OK","message":"Server martxan dago"}`

### 2. Login proba Postman-ekin

**POST** `http://10.5.104.100:3000/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "username": "god",
  "encryptedPassword": "base64_enkriptatutako_pasahitza..."
}
```

⚠️ Pasahitza enkriptatzeko Angular-eko CryptoUtil erabili behar duzu edo Python/Node script bat sortu.

### 3. Angular aplikazioa proba

```bash
# Frontend direktorioan
cd DI_Erronka2

# environment.development.ts-en enableMockData = false egiaztatu

# Aplikazioa abiarazi
npm start
```

Nabigatu: http://localhost:4200/login

Login egin: `god` / `god123`

---

## 📊 Segurtasun Oharrak

### Produkziorako

1. **HTTPS erabili**: HTTP ez da segurua produkzioan
2. **JWT_SECRET aldatu**: 256-bit nahasketa bat erabili
3. **CORS konfiguratu**: `origin: '*'` ez erabili produkzioan
4. **Rate Limiting**: Login saiakerak mugatu
5. **Gako pribatuak babestu**: `.gitignore`-n sartu
6. **Environment aldagaiak**: Ez hardcode-atu pasahitzak
7. **SQL Injection**: Prepared statements erabili (dagoeneko eginda `$1`, `$2`...)
8. **Password Policy**: Gutxieneko baldintzak ezarri
9. **Session Management**: Token iraungitzea kudeatu
10. **Logging**: Segurtasun gertaerak logeatzen ditu

---

## 🐛 Debugging

### Backend log-ak

```javascript
// authController.js-en
console.log('1. Username jasoa:', username);
console.log('2. Pasahitza desenkriptatu:', password);
console.log('3. DB query emaitza:', result.rows);
console.log('4. Password match:', passwordMatch);
console.log('5. Token sortua:', token);
```

### Frontend log-ak

```typescript
// auth.service.ts-en
console.log('[INFO] Login hasiera:', username);
console.log('[INFO] Enkriptatutako pasahitza:', encryptedPassword.substring(0, 50) + '...');
console.log('[INFO] API URL:', `${environment.apiUrl}/auth/login`);
```

### Erroreen kudeaketa

- **400**: Datuak falta dira edo formatu okerra
- **401**: Erabiltzaile edo pasahitz okerra
- **403**: Baimenik ez (token baliogabea)
- **500**: Zerbitzari errorea (DB konexio, etab.)

---

## 📞 Laguntza Gehiago

Arazo bat baduzu, egiaztatu:

1. ✅ Zerbitzaria martxan dago (health endpoint-a)
2. ✅ Database konexioa funtzionatzen du
3. ✅ RSA gakoak sortuta daude
4. ✅ Erabiltzaileak datu-basean existitzen dira
5. ✅ Pasahitz hash-ak zuzenak dira
6. ✅ CORS aktibatuta dago
7. ✅ Angular-ek enableMockData = false dauka
8. ✅ Gako publikoa frontend-ean kopiatu da

---

**Arrakasta! Zure login sistema martxan jarriko da pausu hauek jarraituz.** 🚀
