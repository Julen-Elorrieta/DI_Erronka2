# ElorAdmin - Panel Administrativo Educativo

## 📋 Descripción
Sistema web de administración profesional para **CIFP Elorrieta-Errekamari LHII**, desarrollado con Angular 20+. Forma parte del ecosistema **ElorServ** para gestión integral del centro educativo.

---

## 🏗️ Arquitectura del Proyecto

### Estructura de Carpetas

```
src/app/
├── core/                          # Núcleo de la aplicación
│   ├── guards/                   # Guards de seguridad
│   │   ├── auth.guard.ts        # Protección de autenticación
│   │   └── role.guard.ts        # Control de acceso por roles
│   ├── interceptors/             # Interceptores HTTP
│   │   ├── auth.interceptor.ts  # Añade token a peticiones
│   │   ├── error.interceptor.ts # Manejo centralizado de errores
│   │   └── loading.interceptor.ts # Indicador de carga
│   ├── models/                   # Modelos de datos
│   │   ├── user.model.ts
│   │   ├── meeting.model.ts
│   │   └── schedule.model.ts
│   ├── services/                 # Servicios core
│   │   ├── auth.service.ts      # Autenticación y sesión
│   │   ├── language.service.ts  # Internacionalización
│   │   ├── users.service.ts     # Gestión de usuarios
│   │   └── meetings.service.ts  # Gestión de reuniones
│   └── utils/                    # Utilidades
│       └── crypto.util.ts       # Cifrado RSA
├── features/                     # Módulos funcionales
│   ├── auth/                    # Login y autenticación
│   ├── dashboard/               # Panel principal
│   ├── users/                   # (TODO) CRUD usuarios
│   ├── meetings/                # (TODO) Gestión reuniones
│   └── schedule/                # (TODO) Horarios
├── shared/                       # Componentes compartidos
│   └── components/
│       └── layout.component.*   # Layout principal con navegación
└── assets/
    └── i18n/                    # Traducciones
        ├── es.json             # Castellano
        └── eu.json             # Euskera
```

---

## 🔐 Sistema de Seguridad

### Roles de Usuario

| Rol | Código | Permisos |
|-----|--------|----------|
| **GOD** | `UserRole.GOD` | Acceso total. No puede ser eliminado |
| **ADMIN** | `UserRole.ADMIN` | CRUD usuarios, consulta reuniones |
| **TEACHER** | `UserRole.TEACHER` | Consultar alumnos, horarios, gestionar reuniones |
| **STUDENT** | `UserRole.STUDENT` | Consultar perfil, horario, reuniones propias |

### Usuarios de Prueba (Mock)

```typescript
// GOD
username: 'god'
password: 'god123'

// ADMIN
username: 'admin'
password: 'admin123'

// TEACHER
username: 'teacher'
password: 'teacher123'

// STUDENT
username: 'student'
password: 'student123'
```

### Guards Implementados

#### AuthGuard
Protege rutas que requieren autenticación:
```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard]  // ✅ Requiere login
}
```

#### NoAuthGuard
Previene acceso a login si ya está autenticado:
```typescript
{
  path: 'login',
  component: LoginComponent,
  canActivate: [noAuthGuard]  // ✅ Solo accesible si NO está logueado
}
```

#### RoleGuard
Control de acceso basado en roles:
```typescript
{
  path: 'users',
  component: UsersComponent,
  canActivate: [authGuard, roleGuard],
  data: { roles: [UserRole.GOD, UserRole.ADMIN] }  // ✅ Solo GOD y ADMIN
}
```

### Cifrado de Contraseñas

Las contraseñas NUNCA viajan en texto plano:

```typescript
// ❌ NUNCA HACER ESTO
login(username, password)  // Password en claro

// ✅ CORRECTO - Se cifra con RSA
const encrypted = await CryptoUtil.encryptWithPublicKey(publicKey, password);
```

**Flujo de autenticación:**
1. Cliente genera par de claves RSA (en producción, la pública viene del servidor)
2. Contraseña se cifra con clave pública
3. Solo el servidor (con clave privada) puede descifrarla
4. El servidor valida y devuelve token JWT

---

## 🌐 Internacionalización (i18n)

### Idiomas Soportados
- 🇪🇸 Castellano (por defecto)
- 🇪🇺 Euskera

### Uso en Componentes

```html
<!-- En templates -->
<h1>{{ 'APP.TITLE' | translate }}</h1>
<button>{{ 'COMMON.SAVE' | translate }}</button>

<!-- Con parámetros -->
<p>{{ 'WELCOME_MESSAGE' | translate: {name: userName} }}</p>
```

```typescript
// En TypeScript
constructor(private translate: TranslateService) {
  this.translate.instant('MENU.HOME');
}
```

### Cambiar Idioma

```typescript
languageService.setLanguage('eu');  // Euskera
languageService.setLanguage('es');  // Castellano
```

La preferencia se guarda en localStorage y persiste entre sesiones.

---

## 🎨 Sistema de Diseño

### Colores Corporativos Elorrieta

```css
--primary-color: #004d99;      /* Azul principal */
--primary-dark: #003366;       /* Azul oscuro */
--primary-light: #0073e6;      /* Azul claro */
--accent-color: #ff6600;       /* Naranja (acento) */
--success-color: #4caf50;      /* Verde */
--warning-color: #ff9800;      /* Naranja */
--error-color: #f44336;        /* Rojo */
```

### Framework UI
- **Angular Material 20** - Componentes UI profesionales
- **Responsive Design** - Mobile-first approach
- **Accesibilidad** - Cumple estándares WCAG

---

## 🚀 Comandos Principales

```bash
# Instalar dependencias
npm install

# Desarrollo (http://localhost:4200)
npm start

# Build producción
npm run build

# Tests
npm test

# Linting
ng lint
```

---

## 📦 Dependencias Principales

```json
{
  "@angular/core": "^20.2.0",
  "@angular/material": "^20.0.0",
  "@angular/router": "^20.2.0",
  "@ngx-translate/core": "^15.0.0",
  "rxjs": "~7.8.0",
  "typescript": "~5.9.2"
}
```

---

## 🔄 Interceptores HTTP

### AuthInterceptor
Añade automáticamente el token a todas las peticiones:
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'X-User-Role': user.role
}
```

### ErrorInterceptor
Manejo centralizado de errores HTTP:
- **401** → Redirige a login
- **403** → Muestra mensaje de permisos
- **500** → Mensaje de error del servidor

### LoadingInterceptor
Controla el estado de carga global durante peticiones HTTP.

---

## 📊 Servicios de Datos

### UsersService

```typescript
// Obtener todos los usuarios
usersService.getUsers().subscribe(users => {...});

// Filtrar usuarios
usersService.getUsers({ role: UserRole.STUDENT, search: 'María' });

// Crear usuario
usersService.createUser(newUser).subscribe(...);

// Actualizar
usersService.updateUser(id, changes).subscribe(...);

// Eliminar (con validaciones de rol)
usersService.deleteUser(id).subscribe(...);

// Estadísticas
usersService.getStats().subscribe(stats => {
  console.log(stats.totalStudents);
  console.log(stats.totalTeachers);
});
```

### MeetingsService

```typescript
// Reuniones de un usuario
meetingsService.getUserMeetings(userId).subscribe(...);

// Reuniones de hoy
meetingsService.getTodayMeetings().subscribe(...);

// Crear reunión
meetingsService.createMeeting(meeting).subscribe(...);

// Cambiar estado
meetingsService.updateMeetingStatus(id, MeetingStatus.ACCEPTED);
```

---

## 🎯 Próximos Pasos (Roadmap)

### ✅ Completado
- [x] Arquitectura base Angular 20
- [x] Sistema de autenticación con cifrado RSA
- [x] Guards (Auth, NoAuth, Role)
- [x] Interceptores HTTP (Auth, Error, Loading)
- [x] Internacionalización (es/eu)
- [x] Layout responsive con Material
- [x] Servicios de usuarios y reuniones
- [x] Dashboard dinámico por roles

### 🚧 En Desarrollo
- [ ] Módulo completo de gestión de usuarios (CRUD)
- [ ] Módulo de gestión de reuniones con mapa
- [ ] Componente de visualización de horarios
- [ ] Integración con Mapbox para ubicaciones
- [ ] Notificaciones/Toasts
- [ ] Paginación y tablas avanzadas

### 📅 Planificado
- [ ] Integración con backend real (ElorServ)
- [ ] Tests unitarios y e2e
- [ ] Servicio de carga de fotos de usuarios
- [ ] Exportación de datos (PDF/Excel)
- [ ] PWA (Progressive Web App)
- [ ] Modo oscuro/claro
- [ ] Notificaciones push

---

## 🔧 Configuración de Entorno

### Development
```typescript
// src/environments/environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  mapboxToken: 'YOUR_MAPBOX_TOKEN'
};
```

### Production
```typescript
// src/environments/environment.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.elorrieta.com',
  mapboxToken: 'YOUR_MAPBOX_TOKEN'
};
```

---

## 📝 Convenciones de Código

### Nomenclatura
- **Componentes**: PascalCase → `UserListComponent`
- **Servicios**: PascalCase + Service → `UsersService`
- **Interfaces**: PascalCase → `User`, `Meeting`
- **Enums**: PascalCase → `UserRole`, `MeetingStatus`
- **Variables**: camelCase → `currentUser`, `totalStudents`

### Organización de Imports
```typescript
// 1. Angular core
import { Component, OnInit } from '@angular/core';

// 2. Angular adicionales
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// 3. Third-party
import { TranslateModule } from '@ngx-translate/core';

// 4. Aplicación (absolutos)
import { AuthService } from '@core/services/auth.service';
import { User } from '@core/models/user.model';
```

---

## 🐛 Debugging

### Logs de Desarrollo
La aplicación incluye logs informativos en consola:

```
🔐 Clave pública inicializada
✅ Login exitoso: god
✅ Sesión restaurada: admin
🔒 AuthGuard: Usuario no autenticado
⚠️ Login fallido: Usuario o contraseña incorrectos
❌ Error en login: Network error
```

### Herramientas Recomendadas
- **Angular DevTools** - Extensión de Chrome
- **Redux DevTools** - Para gestión de estado (futuro)
- **Augury** - Inspector de componentes Angular

---

## 📄 Licencia
Proyecto educativo - CIFP Elorrieta-Errekamari LHII

---

## 👥 Equipo de Desarrollo
- **Arquitectura**: Sistema ElorServ
- **Frontend**: ElorAdmin (Angular)
- **Backend**: ElorServ (Node.js/Express - en desarrollo)
- **Desktop**: ElorES (Sockets/TCP)
- **Mobile**: ElorMov (Ionic/React Native - en desarrollo)

---

## 📞 Soporte
Para cuestiones técnicas, contactar con el equipo de desarrollo del centro.

---

**Última actualización**: Enero 2026  
**Versión**: 1.0.0-alpha
