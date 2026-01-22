# ANÁLISIS COMPLETO DEL PROYECTO PRUEBA ERRONKA 2

## 📋 RESUMEN EJECUTIVO

Este es un proyecto **Angular 21** completo con un backend Express + MySQL. Se trata de una aplicación de gestión de centros educativos y reuniones con autenticación basada en **JWT (JSON Web Tokens)**.

**Stack tecnológico:**
- **Frontend**: Angular 21 (standalone components)
- **Backend**: Express.js + Node.js
- **Base de datos**: MySQL
- **Autenticación**: JWT (8 horas de expiración)
- **UI**: Angular Material 21 + Leaflet para mapas
- **Internacionalización**: ngx-translate (multiidioma)

---

## 🗂️ ESTRUCTURA DEL PROYECTO

```
PruebaErronka2/
├── server/
│   ├── index.js (Backend Express)
│   └── ikastetxeak.json (Datos de centros educativos)
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/ (Protección de rutas)
│   │   │   ├── interceptors/ (JWT en peticiones HTTP)
│   │   │   ├── models/ (Interfaces TypeScript)
│   │   │   ├── services/ (Lógica compartida)
│   │   │   └── utils/ (Funciones auxiliares)
│   │   ├── pages/ (Componentes principales)
│   │   └── utils/ (Utilidades generales)
│   ├── environments/ (Configuración por entorno)
│   ├── assets/ (Recursos estáticos)
│   └── styles.css (Estilos globales)
├── public/
│   ├── assets/
│   │   └── i18n/ (Archivos de traducción)
├── angular.json (Configuración de Angular)
├── tsconfig.json (Configuración de TypeScript)
└── package.json (Dependencias del proyecto)
```

---

## 🔐 AUTENTICACIÓN Y SEGURIDAD

### 1. **Flujo de autenticación JWT**

```
Usuario (Frontend) → /login (POST) → Backend Express
Backend verifica credenciales en MySQL → Genera JWT (8h)
JWT se guarda en localStorage (token + user)
Futuras peticiones incluyen: Authorization: Bearer <TOKEN>
```

### 2. **AuthService** (`src/app/core/services/auth.service.ts`)

**Funcionalidades:**
- `login()` - Autentica usuario contra el backend
- `verifyToken()` - Valida que el token siga siendo válido
- `isLoggedIn()` - Verifica si hay sesión activa
- `getToken()` - Obtiene el token del localStorage
- `logout()` - Cierra sesión y limpia datos

**Almacenamiento:**
- **localStorage['token']** - JWT token
- **localStorage['user']** - Datos del usuario autenticado

```typescript
// Ejemplo de estructura de usuario en localStorage
{
  "id": 1,
  "email": "admin@school.edu",
  "username": "admin",
  "tipo_id": 2,  // 1=GOD, 2=ADMIN, 3=TEACHER, 4=STUDENT
  "nombre": "Juan",
  "apellidos": "Pérez"
}
```

### 3. **Guards (Protección de rutas)**

#### **authGuard** (`auth.guard.ts`)
- ✅ Protege rutas autenticadas: `/dashboard`, `/users`, `/meetings`
- Verifica token localmente primero
- Luego valida contra el backend con `/verify-token`
- Si falla → redirige a `/login`

#### **loginGuard** (`login.guard.ts`)
- ✅ Protege la ruta `/login`
- Si usuario YA está autenticado → redirige a `/dashboard`
- Permite acceso al login solo si NO hay sesión válida

**Rutas protegidas:**
```typescript
{
  path: 'dashboard',
  component: Dashboard,
  canActivate: [authGuard]  // Solo usuarios logueados
}
```

### 4. **Interceptor de autenticación** (`auth.interceptor.ts`)

**¿Qué hace?**
- Intercepta TODAS las peticiones HTTP
- Añade `Authorization: Bearer <TOKEN>` en headers (excepto `/login`)
- Si respuesta = 401 (Unauthorized) → cierra sesión automáticamente

```typescript
// Petición interceptada:
GET /api/users HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 🗄️ MODELOS DE DATOS

### 1. **User Model** (`user.model.ts`)

```typescript
interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  nombre: string;
  apellidos: string;
  dni: string;
  direccion: string;
  telefono1: string;
  telefono2: string;
  tipo_id: number;  // Determina el rol
  argazkia_url?: string;  // URL de foto de perfil
  created_at: string;
  updated_at: string;
}

// Enum de roles
enum UserRole {
  GOD = 'GOD',        // tipo_id = 1
  ADMIN = 'ADMIN',    // tipo_id = 2
  TEACHER = 'TEACHER', // tipo_id = 3
  STUDENT = 'STUDENT'  // tipo_id = 4
}
```

### 2. **EducationalCenter Model** (`center.model.ts`)

```typescript
interface EducationalCenter {
  id: string;
  code: string;         // Código único del centro
  name: string;         // Nombre del centro
  dtituc: string;       // Titularidad (Público/Privado)
  dterr: string;        // Territorio (Araba/Bizkaia/Gipuzkoa)
  dmunic: string;       // Municipio
  address: string;      // Dirección
  postalCode: string;   // Código postal
  phone?: string;
  email?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
```

### 3. **Meeting Model** (`meeting.model.ts`)

```typescript
enum MeetingStatus {
  PENDING = 'PENDING',      // Pendiente
  ACCEPTED = 'ACCEPTED',    // Aceptada
  CANCELLED = 'CANCELLED',  // Cancelada
  CONFLICT = 'CONFLICT'     // Conflicto horario
}

interface Meeting {
  id: number;
  title: string;        // Título de la reunión
  topic: string;        // Tema a tratar
  date: Date;           // Fecha
  hour: number;         // Hora (1-6, bloques de 50 min)
  classroom: string;    // Aula
  status: MeetingStatus;
  location: {
    center: string;     // Código del centro
    address: string;
    latitude?: number;
    longitude?: number;
  };
  participants: {
    teacherId: number;  // ID del profesor
    studentId: number;  // ID del estudiante
  };
}
```

### 4. **Schedule Model** (`schedule.model.ts`)

```typescript
interface ScheduleSlot {
  day: number;        // 0-4 (Lunes a Viernes)
  hour: number;       // 1-6 (Horas del día)
  type: 'CLASS' | 'TUTORIA' | 'GUARDIA' | 'MEETING' | 'EMPTY';
  subject?: string;   // Asignatura
  cycle?: string;     // Ciclo educativo
  course?: string;    // Curso
  meetingId?: number; // ID de reunión si es MEETING
}

interface Schedule {
  userId: number;
  slots: ScheduleSlot[];
}
```

---

## 📱 COMPONENTES FRONTEND

### 1. **App Component** (`app.ts`)

El componente raíz de la aplicación.

```typescript
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('PruebaErronka2');
}
```

**Template:**
```html
<router-outlet />  <!-- Aquí se cargan los componentes de las rutas -->
```

### 2. **Auth Component** (`pages/auth/auth.ts`)

**Propósito:** Página de login

**Funcionalidades:**
- Formulario reactivo con validación
- Campos: username, password
- Toggle para mostrar/ocultar contraseña
- Manejo de errores de autenticación

```typescript
// Estructura del formulario
loginForm = {
  username: '',     // Requerido
  password: ''      // Requerido
}

// En submit:
1. Valida el formulario
2. Llama a authService.login()
3. Si éxito → redirige a /dashboard
4. Si error → muestra mensaje de error
```

**Flujo:**
```
Usuario entra en /login
↓
loginGuard verifica si ya está logueado
   ├─ SÍ → redirige a /dashboard
   └─ NO → permite acceso a login
↓
Usuario completa formulario
↓
authService.login() envia credenciales
↓
Backend valida contra MySQL
   ├─ Credenciales OK → devuelve JWT
   ├─ Credenciales FAIL → devuelve error
   └─ Error BD → devuelve error
↓
Frontend guarda token + user en localStorage
↓
Redirige a /dashboard
```

### 3. **Dashboard Component** (`pages/dashboard/dashboard.ts`)

**Propósito:** Panel principal con estadísticas

**Signals (estado reactivo):**
- `currentUser` - Usuario actual
- `totalStudents` - Contador de estudiantes
- `totalTeachers` - Contador de profesores
- `todayMeetings` - Reuniones de hoy

**Métodos:**
- `fetchMeetingsCount()` - GET `/countMeetings`
- `fetchUsersCount()` - GET `/countUsers`
- `fetchTeachersCount()` - GET `/countTeachers`
- `logout()` - Cierra sesión

**Componentes de UI:**
- Material Cards con estadísticas
- Botones de navegación rápida a `/users` y `/meetings`

### 4. **Users Component** (`pages/users/users.ts`)

**Propósito:** Gestión de usuarios

**Funcionalidades:**
- Lista de usuarios en tabla paginada
- Filtros por rol y búsqueda por texto
- Edición de usuarios (dialog)
- Eliminación de usuarios (con confirmación)

**Signals:**
- `users` - Lista completa de usuarios
- `filteredUsers` - Usuarios después de aplicar filtros
- `loading` - Estado de carga
- `searchTerm` - Término de búsqueda
- `selectedRole` - Rol seleccionado

**Métodos principales:**
```typescript
loadUsers()           // GET /users - carga todos los usuarios
getUsersByRole(role)  // GET /filterUserByRole?tipo_id=X
onSearch()            // Filtra usuarios en memoria
deleteUser(user)      // DELETE /deleteUser/{username}
openEditDialog(user)  // Abre dialog de edición
onPageChange(event)   // Maneja paginación
```

**Columnas de tabla:**
- Foto de perfil
- Username
- Nombre y apellidos
- Email
- DNI
- Teléfono
- Acciones (editar, eliminar)

### 5. **Meetings Component** (`pages/meetings/meetings.ts`)

**Propósito:** Gestión de reuniones y centros educativos

**Es el componente más complejo del proyecto.**

**Funcionalidades:**

1. **Pestaña 1: CENTERS (Centros educativos)**
   - Tabla de centros con paginación
   - Filtros en cascada: Titularidad → Territorio → Municipio
   - Búsqueda por nombre
   - Mapa interactivo con Leaflet
   - MarkerCluster para agrupar marcadores

2. **Pestaña 2: MEETINGS (Reuniones)**
   - Tabla de reuniones
   - Estados: PENDING, ACCEPTED, CANCELLED, CONFLICT

**Streams reactivos (RxJS):**
```typescript
filters$          // Observa cambios en filtros
processedData$    // Filtra + pagina datos en tiempo real
mapMarkersUpdate$ // Actualiza marcadores del mapa
```

**Optimizaciones:**
- Caché en localStorage (10 minutos)
- ChangeDetectionStrategy.OnPush (mejor rendimiento)
- RxJS operators: debounceTime, distinctUntilChanged
- MarkerCluster para optimizar renderizado de mapa

**Métodos principales:**
```typescript
loadInitialData()      // Carga datos iniciales (con caché)
fetchCentersFromAPI()  // GET /centers
loadMeetings()         // GET /centers?type=meetings
filterCenters()        // Filtra en memoria
initializeMap()        // Inicializa Leaflet
updateMapMarkers()     // Actualiza marcadores del mapa
```

### 6. **Profile Component** (`pages/profile/profile.ts`)

**Propósito:** Página de perfil de usuario

**Estado:**
- `user` - Datos del usuario
- `schedule` - Horario del usuario
- `meetings` - Reuniones del usuario
- `editing` - Modo edición activado

**Funcionalidades:**
- Mostrar datos del usuario
- Ver horario semanal (tabla 5 días × 6 horas)
- Ver reuniones asignadas
- Editar perfil (formulario reactivo)

**Nota:** Muchos métodos están comentados (TODO - implementar en el futuro)

---

## 🔧 SERVIDOR BACKEND (Express + MySQL)

### Ubicación: `server/index.js`

**Configuración:**
```javascript
const port = 3000;
const host = '10.5.104.100';  // BD MySQL
const database = 'elordb';
const SECRET_KEY = 'mi-clave-super-secreta-2024-cambiar-en-produccion';
```

### Endpoints

#### **Sin autenticación:**

```bash
POST /login
Body: { username, password }
Response: { 
  success: boolean, 
  token: JWT, 
  user: { id, username, tipo_id } 
}
```

#### **Con autenticación (requieren token JWT):**

```bash
GET /verify-token
Response: { success: boolean, user: { id, username, tipo_id } }

GET /centers
Query params:
  ?type=filters       → Devuelve titularidades y territorios
  ?type=municipios&territorio=X  → Municipios de un territorio
  ?type=meetings      → Todas las reuniones de la BD
  ?titularidad=X&territorio=Y&municipio=Z  → Centros filtrados
Response: Center[] o filters data

GET /users
Response: User[]

GET /filterUserByRole?tipo_id=X
Response: User[] filtrados por rol

PUT /updateUser/:id
Body: userData
Response: { success: boolean }

DELETE /deleteUser/:username
Response: { success: boolean }

PUT /updateMeeting/:id
Body: { estado: 'ACCEPTED'|'CANCELLED'|etc }
Response: { success: boolean }

GET /countMeetings
Response: { count: number }

GET /countUsers
Response: { count: number }

GET /countTeachers
Response: { count: number }
```

### Middleware de verificación JWT

```typescript
const verifyToken = (req, res, next) => {
  // Extrae token del header: Authorization: Bearer <TOKEN>
  // Verifica con SECRET_KEY
  // Si válido → agrega a req: userId, username, tipoId
  // Si inválido → responde 401
}
```

---

## 🛠️ CONFIGURACIÓN Y DEPLOYMENT

### `package.json` - Scripts disponibles

```bash
npm start          # ng serve (desarrollo en puerto 4200)
npm run server     # Inicia backend Express (puerto 3000)
npm run build      # ng build (producción)
npm run watch      # ng build --watch (modo observación)
npm test           # ng test
```

### `tsconfig.json` - Configuración TypeScript

```json
{
  "strict": true,                    // Modo estricto activado
  "experimentalDecorators": true,    // Soporta decoradores Angular
  "target": "ES2022",                // Versión de JavaScript
  "module": "preserve"               // Módulos preservados
}
```

### `app.config.ts` - Configuración de Angular

```typescript
providers: [
  provideBrowserGlobalErrorListeners(),
  provideZoneChangeDetection({ eventCoalescing: true }),
  provideRouter(routes),
  provideHttpClient(
    withInterceptors([authInterceptor])  // Añade interceptor JWT
  ),
  TranslateModule.forRoot({
    fallbackLang: 'en'                   // Idioma por defecto
  })
]
```

### `app.routes.ts` - Definición de rutas

```typescript
[
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Auth, canActivate: [loginGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'users', component: Users, canActivate: [authGuard] },
  { path: 'meetings', component: Meetings, canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' }
]
```

---

## 🌐 INTERNACIONALIZACIÓN (i18n)

**Sistema:** ngx-translate

**Archivo de traducción:** `public/assets/i18n/en.json`

```json
{
  "APP": { "TITLE": "Elorrieta-Errekamari", ... },
  "LOGIN": { "USERNAME": "Username", ... },
  "USER": { "LIST": "User List", ... },
  "ROLE": { "ADMIN": "Administrator", ... }
}
```

**Uso en templates:**
```html
{{ 'LOGIN.USERNAME' | translate }}
```

---

## 📊 FLUJO DE DATOS GENERAL

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Angular)                      │
├─────────────────────────────────────────────────────────────┤
│
│  App (router-outlet)
│    ├─ Auth (LOGIN PAGE)
│    │   └─ loginGuard: ¿Ya logueado? → redirige a dashboard
│    │
│    ├─ Dashboard (protected by authGuard)
│    │   └─ Obtiene stats: /countUsers, /countTeachers, /countMeetings
│    │
│    ├─ Users (protected by authGuard)
│    │   ├─ GET /users → Lista todos
│    │   ├─ GET /filterUserByRole → Filtra por rol
│    │   ├─ PUT /updateUser/:id → Edita usuario
│    │   └─ DELETE /deleteUser/:username → Elimina usuario
│    │
│    ├─ Meetings (protected by authGuard)
│    │   ├─ GET /centers → Centros educativos
│    │   ├─ GET /centers?type=meetings → Reuniones
│    │   └─ Mapa Leaflet con marcadores
│    │
│    └─ Profile (TODO)
│
│  Interceptor de HTTP
│  └─ Añade Authorization: Bearer <TOKEN> a todas las peticiones
│
└─────────────────────────────────────────────────────────────┘
                            ↓↑
                      (HTTP Requests)
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (Express.js)                         │
├─────────────────────────────────────────────────────────────┤
│
│  POST /login
│  └─ Valida credenciales en MySQL
│     └─ Genera JWT (8 horas)
│
│  verifyToken (Middleware)
│  └─ Valida JWT en header Authorization
│     └─ Si OK → next() | Si FAIL → 401
│
│  GET /centers, /users, /meetings, etc
│  └─ Protegidas por verifyToken
│     └─ Conecta a MySQL o axios (ikastetxeak.json)
│
└─────────────────────────────────────────────────────────────┘
                            ↓↑
                      (SQL Queries)
┌─────────────────────────────────────────────────────────────┐
│              MySQL Database (elordb)                         │
├─────────────────────────────────────────────────────────────┤
│
│  Tablas:
│  ├─ users (id, username, password, tipo_id, ...)
│  └─ reuniones (id_reunion, fecha, hora, estado, ...)
│
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 SEGURIDAD

### Puntos clave implementados:

1. **JWT Authentication**
   - Token de 8 horas
   - Se envía en header `Authorization: Bearer <TOKEN>`
   - Se valida en cada petición al backend

2. **Guards**
   - `authGuard` protege rutas autenticadas
   - `loginGuard` previene acceso al login si ya estás logueado

3. **Interceptor**
   - Automáticamente añade token a peticiones
   - Maneja 401 (token inválido) → logout automático

4. **Password storage**
   - ⚠️ **Actualmente en texto plano en BD**
   - **TODO:** Implementar bcrypt en backend

5. **CORS**
   - Habilitado en Express
   - Permite peticiones desde el frontend

### Mejoras de seguridad recomendadas:

- ❌ Cambiar `SECRET_KEY` a algo más seguro
- ❌ Encriptar contraseñas con bcrypt
- ❌ Implementar refresh tokens
- ❌ Usar HTTPS en producción
- ❌ Implementar rate limiting
- ❌ Validación más robusta en backend

---

## 📦 DEPENDENCIAS PRINCIPALES

### Frontend (package.json)

```json
{
  "@angular/core": "^21.1.0",
  "@angular/material": "^21.1.0",
  "@angular/forms": "^21.1.0",
  "@angular/router": "^21.1.0",
  "@ngx-translate/core": "^17.0.0",
  "leaflet": "^1.9.4",
  "leaflet.markercluster": "^1.5.3",
  "sweetalert2": "^11.26.17",
  "axios": "^1.13.2",
  "rxjs": "~7.8.0"
}
```

### Backend (package.json)

```json
{
  "express": "^5.2.1",
  "mysql": "^2.18.1",
  "jsonwebtoken": "^9.0.3",
  "cors": "^2.8.5",
  "body-parser": "^2.2.2",
  "axios": "^1.13.2"
}
```

---

## 🎨 COMPONENTES DE UI

### Material Design Components usados:

- **MatCardModule** - Tarjetas
- **MatTableModule** - Tablas con paginación
- **MatFormFieldModule** - Campos de formulario
- **MatInputModule** - Inputs
- **MatButtonModule** - Botones
- **MatIconModule** - Iconos
- **MatDialogModule** - Diálogos modales
- **MatTabsModule** - Pestañas
- **MatMenuModule** - Menús desplegables
- **MatSelectModule** - Selectores
- **MatPaginatorModule** - Paginación
- **MatProgressSpinnerModule** - Spinner de carga
- **MatTooltipModule** - Tooltips
- **MatSnackBarModule** - Notificaciones (snack bars)

---

## 🔄 CICLO DE VIDA DE UNA PETICIÓN PROTEGIDA

### Ejemplo: GET /users

```
1. User component hace: http.get('/users')
   ↓
2. authInterceptor intercepta
   └─ Añade: Authorization: Bearer eyJhbGc...
   ↓
3. Request llega a backend Express
   ↓
4. verifyToken middleware
   ├─ Extrae token del header
   ├─ Valida con SECRET_KEY
   ├─ Si válido → req.userId = decoded.id, next()
   └─ Si inválido → responde 401
   ↓
5. Si 401 → authInterceptor (frontend) logout()
   ├─ Limpia localStorage
   ├─ Redirige a /login
   └─ Muestra error
   ↓
6. Si válido → endpoint procesa
   ├─ Conecta a MySQL
   ├─ SELECT * FROM users
   └─ Responde con User[]
   ↓
7. User component recibe datos
   ├─ Actualiza signal filteredUsers
   └─ Template se renderiza con async pipe
```

---

## 📱 USO DE SIGNALS (Angular 21)

Angular 21 usa Signals para reactividad más fina:

```typescript
// Definición
const users = signal<User[]>([]);

// Lectura
const userCount = computed(() => users().length);

// Actualización
users.set(newUsers);
users.update(prev => [...prev, newUser]);

// En template con @
{{ users().length }}
```

**Ventajas vs RxJS Observables:**
- Sintaxis más simple
- Mejor rendimiento
- Change detection automático

---

## 🚀 PRÓXIMAS MEJORAS A IMPLEMENTAR

Según el código comentado:

1. **Profile Component**
   - Implementar carga de horario
   - Implementar carga de reuniones del usuario
   - Guardar cambios de perfil

2. **Crypto Utility**
   - Implementar encriptación RSA de contraseñas

3. **Backend**
   - Mejorar validaciones
   - Implementar bcrypt
   - Manejo de errores más robusto

4. **Frontend**
   - Dialog para crear usuarios
   - Más validaciones de formularios
   - Manejo de errores mejorado

---

## 📝 RESUMEN POR COMPONENTE

| Componente | Ruta | Protegido | Funcionalidad |
|-----------|------|-----------|--------------|
| Auth | `/login` | loginGuard | Formulario de login |
| Dashboard | `/dashboard` | authGuard | Panel principal con estadísticas |
| Users | `/users` | authGuard | Gestión de usuarios (CRUD) |
| Meetings | `/meetings` | authGuard | Centros educativos y reuniones (mapa + tabla) |
| Profile | `/profile` | authGuard | Perfil de usuario (TODO) |

---

## 🎯 CONCLUSIÓN

Este es un **proyecto bien estructurado** con:
- ✅ Autenticación JWT robusta
- ✅ Guards de rutas efectivos
- ✅ Arquitectura limpia (core, pages, utils)
- ✅ UI profesional con Material Design
- ✅ Componentes reactivos con Signals
- ✅ Backend Express simplificado pero funcional

**Puntos clave a recordar:**
1. JWT se guarda en localStorage (key: 'token')
2. Todas las peticiones protegidas llevan token en header
3. Si token expira (401) → logout automático
4. Guards previenen acceso no autorizado a rutas
5. MySQL en 10.5.104.100:3307 (cambiar en producción)

---

*Análisis completado: 22/01/2026*
