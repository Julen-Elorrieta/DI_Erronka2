# Quick Start Guide - Admin Panel Features

## How to Access the New Admin Features

### 1. Login as Admin
- Username: admin
- Role: tipo_id = 2 (ADMIN) or 1 (GOD)

### 2. Navigate to Dashboard
- After login, you'll see the main dashboard
- Look for the new action buttons in the "ACTIONS" section:
  - **Ciclos** - Manage degree programs
  - **Modulos** - Manage subjects
  - **Horarios** - Manage schedules
  - **Matriculaciones** - Manage student enrollments

### 3. Using Each Feature

#### **Ciclos (Degree Programs)**
**URL:** `/ciclos`
- **View:** Displays all degree programs in a table
- **Add:** Click the "Add" button to create a new program
  - Input: Nombre (Name)
- **Edit:** Click the edit icon on any row
- **Delete:** Click the delete icon to remove a program

#### **Modulos (Subjects)**
**URL:** `/modulos`
- **View:** Displays all modules with their associated degree program
- **Add:** Create new subject
  - Inputs: Nombre, Nombre Euskera, Horas, Ciclo, Curso
- **Edit:** Modify existing module details
- **Delete:** Remove a module

#### **Horarios (Schedules)**
**URL:** `/horarios`
- **View:** Shows schedule entries for all users (Teachers see only theirs)
- **Add:** Create new schedule entry
  - Inputs: Día, Hora, Profesor, Módulo, Aula, Observaciones
- **Edit:** Modify schedule entry
- **Delete:** Remove a schedule

#### **Matriculaciones (Enrollments)**
**URL:** `/matriculaciones`
- **View:** Lists all student enrollments (Students see only theirs)
- **Add:** Create new enrollment
  - Inputs: Alumno, Ciclo, Curso, Fecha
- **Edit:** Modify enrollment details
- **Delete:** Remove an enrollment

---

## Role-Based Access

### GOD (tipo_id = 1)
- ✅ Full access to all features
- ✅ Can create, read, update, delete all resources

### ADMIN (tipo_id = 2)
- ✅ Full access to all admin features
- ✅ Same permissions as GOD

### PROFESOR (tipo_id = 3)
- ❌ Cannot access admin panel
- ✅ Can view own schedule at `/horarios`
- Note: Schedule viewing is read-only

### ALUMNO (tipo_id = 4)
- ❌ Cannot access admin panel
- ✅ Can view own enrollments at `/matriculaciones`
- Note: Enrollment viewing is read-only

---

## API Endpoints Reference

### Base URL
```
http://localhost:3000
```

### Authentication
All endpoints require Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Ciclos Endpoints
```
GET    /ciclos              - List all degree programs
POST   /ciclos              - Create new (Admin only)
PUT    /ciclos/:id          - Update (Admin only)
DELETE /ciclos/:id          - Delete (Admin only)
```

### Modulos Endpoints
```
GET    /modulos             - List all modules
POST   /modulos             - Create new (Admin only)
PUT    /modulos/:id         - Update (Admin only)
DELETE /modulos/:id         - Delete (Admin only)
```

### Horarios Endpoints
```
GET    /horarios            - List schedules (Teachers see own)
POST   /horarios            - Create new (Admin only)
PUT    /horarios/:id        - Update (Admin only)
DELETE /horarios/:id        - Delete (Admin only)
```

### Matriculaciones Endpoints
```
GET    /matriculaciones     - List enrollments (Students see own)
POST   /matriculaciones     - Create new (Admin only)
PUT    /matriculaciones/:id - Update (Admin only)
DELETE /matriculaciones/:id - Delete (Admin only)
```

---

## Example API Calls

### Create a Ciclo
```bash
curl -X POST http://localhost:3000/ciclos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Administración de Sistemas"}'
```

### Create a Modulo
```bash
curl -X POST http://localhost:3000/modulos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre":"Programación Java",
    "nombre_eus":"Java Programazioa",
    "horas":120,
    "ciclo_id":1,
    "curso":1
  }'
```

### Create a Horario
```bash
curl -X POST http://localhost:3000/horarios \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dia":"LUNES",
    "hora":1,
    "profe_id":5,
    "modulo_id":3,
    "aula":"A101",
    "observaciones":"Clase teórica"
  }'
```

### Create a Matriculacion
```bash
curl -X POST http://localhost:3000/matriculaciones \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alum_id":10,
    "ciclo_id":1,
    "curso":1,
    "fecha":"2024-01-15"
  }'
```

---

## Troubleshooting

### "403 No tienes permisos" (No permissions)
- You're not logged in as Admin (tipo_id 1 or 2)
- Check your user role in the database
- Make sure you're passing a valid JWT token

### "DB error"
- Backend database connection issue
- Check if MySQL is running
- Verify database credentials in server/index.js

### Component not loading
- Clear browser cache (Ctrl+Shift+Del)
- Check if Angular dev server is running
- Verify routes in app.routes.ts

### Dropdown options not showing
- Related data not loading from backend
- Check browser console for HTTP errors
- Verify backend endpoints are returning data

---

## Features Included

✅ Full CRUD operations for all 4 admin resources
✅ Material Design UI with professional styling
✅ SweetAlert2 modal dialogs for forms
✅ Real-time data loading with signals
✅ Error notifications with snackbar
✅ Role-based access control
✅ Internationalization (English translations)
✅ Responsive design
✅ Type-safe TypeScript implementation

---

## Database Tables Used

- **ciclos** - Degree programs (id, nombre)
- **modulos** - Subjects (id, nombre, nombre_eus, horas, ciclo_id, curso)
- **horarios** - Schedules (id, dia, hora, profe_id, modulo_id, aula, observaciones)
- **matriculaciones** - Enrollments (id, alum_id, ciclo_id, curso, fecha)
- **users** - Users (id, nombre, apellidos, tipo_id, etc.)

---

## Additional Help

For more information:
- Check the [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for detailed documentation
- Review component source code: `src/app/pages/{feature}/{feature}.ts`
- Review service code: `src/app/core/services/{feature}.service.ts`
- Backend code: `server/index.js`

---

Last Updated: 2024
Version: 1.0
