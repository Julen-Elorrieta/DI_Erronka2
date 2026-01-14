# 🚀 Guía Rápida - ElorAdmin

## ⚡ Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm start

# 3. Abrir navegador en:
http://localhost:4200
```

---

## 🔑 Credenciales de Prueba

### Super Administrador (GOD)
```
Usuario: god
Contraseña: god123
```
**Permisos**: Acceso total, gestión de usuarios, puede eliminar cualquier usuario excepto otros GOD

### Administrador (Secretaría)
```
Usuario: admin
Contraseña: admin123
```
**Permisos**: CRUD de usuarios, consulta de reuniones, estadísticas

### Profesor
```
Usuario: teacher
Contraseña: teacher123
```
**Permisos**: Ver horario, consultar alumnos, gestionar reuniones, ver perfil

### Alumno
```
Usuario: student
Contraseña: student123
```
**Permisos**: Ver perfil, horario, reuniones propias

---

## 🎯 Flujo de Navegación por Rol

### Como GOD o ADMIN
1. Login → Dashboard con estadísticas
2. Sidebar: Usuarios, Reuniones, Horarios, Perfil
3. **Dashboard muestra**:
   - Total de alumnos
   - Total de profesores
   - Reuniones de hoy

### Como TEACHER
1. Login → Dashboard con horario
2. Sidebar: Inicio, Reuniones, Horario, Alumnos, Perfil
3. Puede ver listado de alumnos
4. Puede crear/gestionar reuniones

### Como STUDENT
1. Login → Dashboard con datos personales
2. Sidebar: Inicio, Reuniones, Horario, Perfil
3. Vista limitada a sus propios datos

---

## 🌐 Cambiar Idioma

1. Click en icono de idioma (🌐) en la esquina superior derecha
2. Seleccionar:
   - 🇪🇸 **Castellano**
   - 🇪🇺 **Euskera**

La preferencia se guarda automáticamente.

---

## 🎨 Características Implementadas

### ✅ Seguridad
- [x] Login con cifrado RSA de contraseñas
- [x] Guards de autenticación en rutas
- [x] Control de acceso por roles
- [x] Tokens en localStorage
- [x] Interceptores HTTP automáticos

### ✅ Interfaz
- [x] Design responsive (móvil, tablet, desktop)
- [x] Angular Material components
- [x] Tema personalizado con colores de Elorrieta
- [x] Navegación lateral plegable
- [x] Selector de idioma en header

### ✅ Funcionalidades
- [x] Dashboard dinámico por roles
- [x] Sistema de autenticación robusto
- [x] Internacionalización completa (i18n)
- [x] Servicios REST preparados para backend
- [x] Gestión de sesión persistente

---

## 🔧 Testing Rápido

### Probar Diferentes Roles

```bash
# 1. Login como GOD
Usuario: god | Pass: god123
→ Verás estadísticas y acceso total

# 2. Logout y login como TEACHER
Usuario: teacher | Pass: teacher123  
→ Verás menú diferente, sin acceso a usuarios

# 3. Logout y login como STUDENT
Usuario: student | Pass: student123
→ Vista más limitada, solo tus datos
```

### Probar Guards

```bash
# 1. Sin estar logueado, intenta acceder a:
http://localhost:4200/dashboard
→ Redirige automáticamente a /login

# 2. Logueado, intenta acceder a:
http://localhost:4200/login
→ Redirige automáticamente a /dashboard
```

---

## 📊 Datos Mock Disponibles

La aplicación incluye datos de prueba:

- **7 usuarios** (1 GOD, 1 Admin, 2 Teachers, 3 Students)
- **3 reuniones** de ejemplo
- **Estadísticas** generadas dinámicamente

---

## 🐛 Solución de Problemas

### Puerto 4200 ocupado
```bash
# Usar otro puerto
ng serve --port 4300
```

### Errores de compilación
```bash
# Limpiar caché
rm -rf node_modules package-lock.json
npm install
npm start
```

### No se ven las traducciones
- Verificar que existan: `public/assets/i18n/es.json` y `eu.json`
- Refrescar el navegador con Ctrl+F5

---

## 📁 Archivos Importantes

```
📂 Configuración
├── src/app/app.config.ts         # Configuración global
├── src/app/app.routes.ts         # Definición de rutas
└── src/styles.css                # Estilos globales

📂 Seguridad  
├── core/guards/auth.guard.ts     # Guard de autenticación
├── core/guards/role.guard.ts     # Guard de roles
└── core/utils/crypto.util.ts     # Cifrado RSA

📂 Servicios
├── core/services/auth.service.ts       # Autenticación
├── core/services/users.service.ts      # Usuarios
└── core/services/meetings.service.ts   # Reuniones

📂 Componentes
├── features/auth/login.component.*     # Pantalla de login
├── features/dashboard/dashboard.*      # Dashboard
└── shared/components/layout.*          # Layout principal
```

---

## 🎓 Próximos Desarrollos

### Pendientes de Implementar

1. **Módulo de Usuarios Completo**
   - Tabla con paginación
   - Filtros avanzados
   - Formulario crear/editar
   - Subida de fotos

2. **Módulo de Reuniones**
   - Calendario visual
   - Mapa con Mapbox
   - Estados de reunión con colores
   - Notificaciones por email

3. **Módulo de Horarios**
   - Vista semanal 5x6
   - Colores por tipo de actividad
   - Integración con reuniones
   - Exportar a PDF

4. **Conexión Backend**
   - API REST real
   - WebSockets para tiempo real
   - Base de datos MySQL

---

## 💡 Tips de Desarrollo

### Hot Reload
Los cambios se reflejan automáticamente al guardar archivos.

### DevTools de Angular
Instalar extensión **Angular DevTools** en Chrome para debugging.

### Console Logs
La aplicación incluye logs informativos:
- 🔐 Seguridad
- ✅ Éxito
- ⚠️ Advertencias
- ❌ Errores

---

## 📞 Contacto Técnico

Para dudas sobre el proyecto:
- Revisar `README_ARQUITECTURA.md` (documentación técnica completa)
- Revisar código fuente (está bien comentado)
- Contactar con el equipo de desarrollo

---

**¡Listo para usar!** 🎉

La aplicación está completamente funcional para desarrollo y pruebas.
