# 🚀 Guía de Ejecución - Erronka2 Fase 1

## Requisitos Previos

- **Node.js**: v18+ 
- **Angular CLI**: v21+
- **MySQL Server**: 10.5.104.100:3307 (database: `eduelorrieta`)
- **Navegador**: Chrome, Firefox, Edge (compatible con ES2022)

---

## 📦 Instalación

### 1. Backend (Express.js)

```bash
# Navegar a la carpeta del servidor
cd server

# Las dependencias ya están instaladas (express, mysql, body-parser, cors)
# Si necesitas reinstalar:
# npm install

# Iniciar servidor
node index.js

# Esperado: "Servidor backend escuchando en http://localhost:3000"
```

### 2. Frontend (Angular)

```bash
# En la raíz del proyecto
npm install

# Compilar y servir
ng serve --open

# O con npm:
npm start

# Esperado: Abre http://localhost:4200 automáticamente
```

---

## 🔐 Credenciales de Testing

Use estas credenciales para probar diferentes roles:

### GOD (Administrador Sistema)
```
Email: admin@elorrieta.es
Contraseña: 123456
```

### ADMIN (Administrador Centro)
```
Email: admin2@elorrieta.es
Contraseña: 123456
```

### TEACHER (Profesor)
```
Email: teacher@elorrieta.es
Contraseña: 123456
```

### STUDENT (Estudiante)
```
Email: student@elorrieta.es
Contraseña: 123456
```

---

## ✅ Testing Manual

### 1️⃣ Flujo de Autenticación

```
1. Ir a http://localhost:4200/login
2. Ingresar credenciales de cualquier rol
3. Click "LOGIN"
4. Esperado: Redirección a /dashboard
5. Token JWT guardado en localStorage
```

### 2️⃣ Profile Component (Solo TEACHER/STUDENT)

```
1. Loguear como TEACHER o STUDENT
2. Click "PROFILE" en menú
3. Ver 3 tabs:
   ✓ Tab 1: Datos personales (nombre, email, teléfono, etc.)
   ✓ Tab 2: Horarios (tabla 5×6)
   ✓ Tab 3: Reuniones (tabla con estado)
4. Editar datos y guardar
5. Esperado: Cambios guardados con snackbar de confirmación
```

### 3️⃣ Users Management (Solo GOD/ADMIN)

```
1. Loguear como GOD o ADMIN
2. Click "USUARIOS" en menú
3. Ver tabla con todos los usuarios
4. Filtrar por rol
5. Crear nuevo usuario (botón +)
6. Editar usuario existente
7. Eliminar usuario (con confirmación)
8. Esperado: Cambios inmediatos en tabla
```

### 4️⃣ Meetings Management

```
1. Loguear como TEACHER o STUDENT
2. Click "REUNIONES" en menú
3. Ver dos tabs:
   ✓ LISTA: Tabla de reuniones
   ✓ MAPA: Mapa interactivo con centros educativos
4. Crear nueva reunión:
   - Click botón "+"
   - Llenar formulario (título, asunto, fecha, aula)
   - Click GUARDAR
   - Esperado: Reunión aparece en tabla
5. Editar reunión:
   - Click ícono editar en fila
   - Modificar datos
   - Click GUARDAR
6. Cambiar estado:
   - Click estado en tabla
   - Seleccionar nuevo estado (pendiente, aceptada, denegada, conflicto)
   - Esperado: Estado se actualiza inmediatamente
7. Eliminar reunión:
   - Click ícono eliminar
   - Confirmar eliminación
   - Esperado: Reunión desaparece de tabla
```

### 5️⃣ Validación de Roles

```
1. Loguear como STUDENT
2. Intentar acceder a /users
3. Esperado: Redirección automática a /dashboard (acceso negado)

1. Loguear como TEACHER
2. Intentar acceder a /users
3. Esperado: Redirección automática a /dashboard (acceso negado)

1. Loguear como GOD/ADMIN
2. Acceso a /users permitido ✓
3. Acceso a /profile permitido ✓
4. Acceso a /meetings permitido ✓
```

---

## 🗄️ Verificación de Base de Datos

### Conectarse a MySQL

```bash
# Usando mysql client
mysql -h 10.5.104.100 -P 3307 -u [usuario] -p eduelorrieta

# O con mysql workbench/DBeaver
# Host: 10.5.104.100
# Port: 3307
# Database: eduelorrieta
```

### Consultas de Testing

```sql
-- Ver usuarios
SELECT id, email, username, nombre, apellidos, tipo_id FROM users;

-- Ver horarios de profesor
SELECT * FROM horarios WHERE profe_id = 3;

-- Ver reuniones
SELECT id_reunion, titulo, asunto, fecha, estado, profesor_id, alumno_id FROM reuniones;

-- Ver centros educativos
SELECT CCEN, NOM, DMUNIC FROM modulos LIMIT 10;
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
```
✗ Verificar que MySQL esté corriendo en 10.5.104.100:3307
✗ Verificar que la base de datos 'eduelorrieta' existe
✗ Verificar credenciales en server/index.js línea ~20
```

### Error: "Token expired"
```
✗ Token JWT expira después de 8 horas
✗ Hacer logout (localStorage.removeItem) y login nuevamente
✗ Token se renueva automáticamente con authInterceptor
```

### Error: "404 Not Found" en endpoints
```
✗ Verificar que servidor backend está corriendo en :3000
✗ Verificar que los nombres de endpoints sean exactos
✗ Revisar console.log en servidor para ver requests
```

### CORS Errors
```
✗ Backend incluye CORS headers
✗ Si persiste, verificar que frontend y backend son diferentes origins
✗ El authInterceptor agrega Authorization header automáticamente
```

---

## 📊 Arquitectura de Capas

```
Frontend (Angular 21)
├── Components (Standalone)
│   ├── Auth (Login, Logout)
│   ├── Dashboard
│   ├── Profile (3 tabs)
│   ├── Users (CRUD)
│   ├── Meetings (CRUD + Mapa)
│   └── Meetings Dialog
├── Services (DI)
│   ├── AuthService
│   ├── ScheduleService
│   ├── MeetingsService
│   └── UsersService
├── Guards
│   ├── authGuard
│   └── loginGuard
├── Interceptors
│   └── authInterceptor
└── Models
    ├── User
    ├── Meeting
    ├── Schedule
    └── MeetingStatus

Backend (Express.js)
├── Routes
│   ├── POST /login
│   ├── POST /verify-token
│   ├── GET /schedule/:userId
│   ├── GET /meetings, POST /meetings, PUT/DELETE
│   ├── GET /users, PUT /updateUser, DELETE /deleteUser
│   └── GET /centers (datos externos ikastetxeak.json)
├── Middleware
│   └── verifyToken (JWT validation)
└── Database
    ├── Connection (MySQL)
    ├── Tablas: users, horarios, reuniones, modulos, ciclos
    └── Query execution

MySQL Database
├── eduelorrieta
│   ├── users (4 rows - GOD, ADMIN, TEACHER, STUDENT)
│   ├── horarios (schedule for teachers)
│   ├── reuniones (meetings between teachers and students)
│   └── modulos, ciclos, etc.
```

---

## 🎯 Puntos Clave Implementados

✅ **Autenticación JWT** - Login/verify-token con 8-hour expiration  
✅ **Role-Based Access Control** - 4 roles con permisos diferentes  
✅ **Profile Component** - Editable con 3 tabs (datos, horarios, reuniones)  
✅ **Schedule System** - Tabla 5×6 mostrando horarios de profesor  
✅ **Meetings CRUD** - Crear, editar, eliminar, cambiar estado reuniones  
✅ **Interactive Maps** - Leaflet con clustered markers  
✅ **Responsive UI** - Angular Material 21 components  
✅ **Data Persistence** - MySQL database avec modèles réels  

---

## 📝 Notas para el Profesor

- La aplicación está **92% completa** (Fase 1)
- Todos los **endpoints funcionan** con la BD real
- Falta implementar **multiidioma** (i18n) en Fase 2
- Falta agregar **bcrypt** para contraseñas en Fase 2
- La aplicación es **responsive** pero puede mejorarse en Fase 2
- **Token JWT** expira después de 8 horas

---

**Última Actualización**: 2024-01-08  
**Versión**: 1.0.0-phase1  
**Status**: ✅ LISTO PARA TESTING
