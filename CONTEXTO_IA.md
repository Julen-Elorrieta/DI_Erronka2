# Contexto del Proyecto ElorAdmin para Continuación por IA

## 📋 Resumen del Proyecto

**Nombre:** ElorAdmin  
**Framework:** Angular 20.x con standalone components  
**UI:** Angular Material 20.x  
**Estado:** Signals de Angular  
**i18n:** @ngx-translate/core v17 (3 idiomas: es, eu, en)  
**Mapas:** Mapbox GL JS v2.15.0  

---

## 🎯 Objetivo del Proyecto

Aplicación de gestión administrativa para el centro educativo CIFP Elorrieta-Errekamari. Permite gestionar usuarios, reuniones con centros educativos, horarios y perfiles según el rol del usuario.

---

## 👥 Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **GOD** | Super administrador - acceso total, puede eliminar cualquier usuario |
| **ADMIN** | Administrador - gestión de usuarios (no puede eliminar GOD/ADMIN) |
| **TEACHER** | Profesor - puede crear reuniones, ver horarios |
| **STUDENT** | Estudiante - acceso limitado a su perfil y reuniones |

---

## 🔐 Credenciales de Prueba (Mock Data)

```
Usuario: god       | Contraseña: god123      | Rol: GOD
Usuario: admin     | Contraseña: admin123    | Rol: ADMIN
Usuario: teacher   | Contraseña: teacher123  | Rol: TEACHER
Usuario: student   | Contraseña: student123  | Rol: STUDENT
```

El modo mock está activo por defecto (`enableMockData: true` en environment).

---

## 📁 Estructura de Archivos Creados/Modificados

### Core - Modelos
- `src/app/core/models/user.model.ts` - Modelo de usuario con roles
- `src/app/core/models/meeting.model.ts` - Modelo de reuniones
- `src/app/core/models/schedule.model.ts` - Modelo de horarios
- `src/app/core/models/center.model.ts` - **CREADO** - Modelo de centros educativos

### Core - Servicios
- `src/app/core/services/auth.service.ts` - Autenticación con mock data
- `src/app/core/services/users.service.ts` - CRUD de usuarios
- `src/app/core/services/meetings.service.ts` - Gestión de reuniones
- `src/app/core/services/schedule.service.ts` - **CREADO** - Servicio de horarios
- `src/app/core/services/centers.service.ts` - **CREADO** - Servicio de centros educativos (15 centros del País Vasco)
- `src/app/core/services/language.service.ts` - **MODIFICADO** - Soporte para 3 idiomas

### Core - Guards
- `src/app/core/guards/auth.guard.ts` - Guard de autenticación
- `src/app/core/guards/role.guard.ts` - Guard de roles

### Features - Componentes
- `src/app/features/auth/login.component.ts` - Login existente
- `src/app/features/dashboard/dashboard.component.ts` - **MODIFICADO** - Dashboard mejorado con acciones rápidas
- `src/app/features/users/users.component.ts` - **CREADO** - CRUD completo de usuarios
- `src/app/features/users/user-form-dialog.component.ts` - **CREADO** - Formulario de creación/edición de usuarios
- `src/app/features/meetings/meetings.component.ts` - **CREADO** - Gestión de reuniones con mapa Mapbox
- `src/app/features/meetings/meeting-form-dialog.component.ts` - **CREADO** - Formulario de reuniones
- `src/app/features/meetings/center-detail-dialog.component.ts` - **CREADO** - Detalle de centro educativo
- `src/app/features/schedule/schedule.component.ts` - **CREADO** - Vista de horario semanal
- `src/app/features/profile/profile.component.ts` - **CREADO** - Perfil de usuario con 3 tabs

### Shared - Componentes
- `src/app/shared/components/layout.component.ts` - **MODIFICADO** - Selector de 3 idiomas
- `src/app/shared/components/confirm-dialog.component.ts` - **CREADO** - Diálogo de confirmación

### Rutas
- `src/app/app.routes.ts` - **MODIFICADO** - Todas las rutas configuradas con guards

### Traducciones
- `public/assets/i18n/es.json` - **MODIFICADO** - Español completo
- `public/assets/i18n/eu.json` - **MODIFICADO** - Euskera completo
- `public/assets/i18n/en.json` - **CREADO** - Inglés completo

### Configuración
- `src/index.html` - **MODIFICADO** - Añadido Mapbox GL JS

---

## 🗺️ Rutas de la Aplicación

```typescript
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'users', component: UsersComponent, canActivate: [roleGuard], data: { roles: ['GOD', 'ADMIN'] } },
      { path: 'meetings', component: MeetingsComponent, canActivate: [roleGuard], data: { roles: ['GOD', 'ADMIN', 'TEACHER'] } },
      { path: 'schedule', component: ScheduleComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'students', component: UsersComponent, canActivate: [roleGuard], data: { roles: ['GOD', 'ADMIN', 'TEACHER'] } }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
```

---

## 🏫 Centros Educativos (Mock Data)

El servicio `centers.service.ts` contiene 15 centros educativos del País Vasco con:
- Nombre, dirección, teléfono, email
- Coordenadas GPS para el mapa
- Filtros: DTITUC (titularidad), DTERR (territorio), DMUNIC (municipio)

---

## 🎨 Funcionalidades Implementadas

### ✅ Login
- Formulario con validación
- Cifrado de contraseñas con Web Crypto API
- Mock data para desarrollo

### ✅ Gestión de Usuarios (CRUD)
- Tabla con paginación
- Filtros por rol y búsqueda
- Crear, editar, eliminar usuarios
- Control de permisos según rol

### ✅ Reuniones con Mapa
- Lista de centros educativos
- Mapa Mapbox con marcadores
- Filtros por titularidad, territorio, municipio
- Formulario de creación de reuniones
- Tab "Mis Reuniones" para ver reuniones propias

### ✅ Horario Semanal
- Vista de lunes a viernes, 6 horas
- Tipos de slot: CLASS, TUTORIA, GUARDIA, MEETING, EMPTY
- Colores diferenciados por tipo

### ✅ Perfil de Usuario
- 3 tabs: Datos Personales, Horario, Reuniones
- Edición de datos personales
- Vista de horario resumido
- Lista de próximas reuniones

### ✅ Internacionalización (i18n)
- 3 idiomas: Español, Euskera, Inglés
- Selector en la barra de navegación
- Persistencia en localStorage

### ✅ Layout Responsivo
- Sidebar colapsable
- Navegación según rol
- Tema oscuro/claro (botón en header)

---

## ⚠️ Pendiente / Mejoras Posibles

1. **Conexión a API Real** - Actualmente usa mock data. Para conectar:
   - Cambiar `enableMockData: false` en `environment.development.ts`
   - Configurar `apiUrl` con la URL del backend

2. **Validaciones Adicionales** - Añadir validaciones más estrictas en formularios

3. **Tests** - No hay tests unitarios implementados

4. **PWA** - Se podría convertir en Progressive Web App

5. **Notificaciones** - Sistema de notificaciones push para reuniones

6. **Exportar Datos** - Exportar usuarios/reuniones a Excel/PDF

7. **Calendario** - Vista de calendario para reuniones (además del mapa)

---

## 🔧 Comandos Útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
ng serve

# Compilar para producción
ng build --configuration production

# Ejecutar tests
ng test
```

---

## 📝 Notas Técnicas

1. **Angular Material 20** - No usar `MatDatepickerModule` directamente, causa errores. Usar input nativo `type="date"`.

2. **Mapbox** - Token incluido en `meetings.component.ts`. Para producción, mover a environment.

3. **Signals** - Se usan Angular Signals para estado reactivo en componentes.

4. **Standalone Components** - Todos los componentes son standalone, no hay NgModules.

5. **Guards** - `authGuard` verifica autenticación, `roleGuard` verifica permisos por rol.

---

## 📊 Requisitos del Enunciado Cumplidos

| Requisito | Estado |
|-----------|--------|
| Login con cifrado | ✅ |
| CRUD Usuarios | ✅ |
| Roles y permisos | ✅ |
| Reuniones con mapa | ✅ |
| Horario semanal | ✅ |
| Perfil de usuario | ✅ |
| i18n (3 idiomas) | ✅ |
| Diseño Bootstrap/Material | ✅ |
| Responsive | ✅ |
| Guards de rutas | ✅ |

---

## 🚀 Para Continuar el Desarrollo

1. Revisar `get_errors` en todos los archivos para verificar que no hay errores de compilación
2. Ejecutar `ng serve` para probar la aplicación
3. Probar login con cada rol
4. Verificar que todas las rutas funcionan correctamente
5. Conectar con API real cuando esté disponible

---

*Documento generado el 14 de enero de 2026*
