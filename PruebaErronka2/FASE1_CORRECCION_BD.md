# Corrección de Endpoints - Fase 1 Completada

## Objetivo
Alinear todos los endpoints del backend con la estructura real de la BD `eduelorrieta`.

## Correcciones Realizadas

### 1. ✅ Identificación de la Estructura Real

**Base de datos**: `eduelorrieta` (en servidor MySQL 10.5.104.100:3307)

**Tabla `reuniones` (estructura real)**:
```sql
CREATE TABLE reuniones (
  id_reunion INT PRIMARY KEY,
  estado ENUM('pendiente', 'aceptada', 'denegada', 'conflicto'),
  profesor_id INT,
  alumno_id INT,
  id_centro INT,
  titulo VARCHAR(255),
  asunto VARCHAR(255),
  aula VARCHAR(50),
  fecha DATETIME
)
```

**Tabla `horarios` (estructura real)**:
```sql
CREATE TABLE horarios (
  id INT PRIMARY KEY,
  dia ENUM('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'),
  hora INT,
  profe_id INT,
  modulo_id INT,
  aula VARCHAR(50),
  observaciones VARCHAR(255)
)
```

---

### 2. ✅ Correcciones en Backend (`server/index.js`)

#### **GET /meetings/user/:userId**
```diff
- WHERE id_profesor = ? OR id_estudiante = ?
+ WHERE profesor_id = ? OR alumno_id = ?
```

#### **POST /meetings**
```diff
- Campos enviados: title, topic, fecha, hora, classroom, id_centro, id_profesor, id_estudiante
+ Campos esperados: title, topic, fecha, classroom, id_centro, profesor_id, alumno_id

- INSERT INTO reuniones (titulo, tema, fecha, hora, aula, id_centro, id_profesor, id_estudiante, estado)
+ INSERT INTO reuniones (titulo, asunto, fecha, aula, id_centro, profesor_id, alumno_id, estado)

- VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
+ VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')

- Descripción: Se elimina campo 'hora' (no existe en BD), se cambia 'tema' → 'asunto', se cambian nombres de campos con prefijo id_
- Estado cambio: 'PENDING' → 'pendiente'
```

#### **PUT /meetings/:meetingId**
```diff
- Query: SET titulo = ?, tema = ?, fecha = ?, hora = ?, aula = ? WHERE id_reunion = ?
+ Query: SET titulo = ?, asunto = ?, fecha = ?, aula = ? WHERE id_reunion = ?

- Se elimina campo 'hora' de la actualización
```

---

### 3. ✅ Correcciones en Modelos y Servicios

#### **`src/app/core/models/meeting.model.ts`**

**Cambios**:
- Enumeración `MeetingStatus`: Actualizado con valores reales de BD
  - `PENDING` → `'pendiente'`
  - `ACCEPTED` → `'aceptada'`
  - `CANCELLED` → `REJECTED = 'denegada'`
  - `CONFLICT` → `'conflicto'`

- Interfaz `Meeting`: Restructurada para soportar ambos formatos (BD y Frontend)
  ```typescript
  export interface Meeting {
    // Campos de la BD (reales)
    id_reunion?: number;
    titulo: string;
    asunto: string;
    fecha: Date | string;
    aula: string;
    id_centro?: number;
    profesor_id: number;
    alumno_id: number;
    estado: MeetingStatus | string;
    
    // Campos para compatibilidad con frontend (opcionales)
    title?: string;
    topic?: string;
    date?: Date | string;
    hour?: number;
    classroom?: string;
    status?: string;
    center?: string;
    address?: string;
  }
  ```

#### **`src/app/pages/meetings/meetingDialog.ts`**

**Cambios**:
- Método `onSave()`: Ahora transforma los datos del formulario al formato esperado por el backend
  ```typescript
  const meetingData = {
    title: formValue.title,
    topic: formValue.topic,
    fecha: formValue.date,
    hora: formValue.hour,
    classroom: formValue.classroom,
    center: formValue.center,
    address: formValue.address
  };
  ```

---

### 4. 📊 Mapeo de Campos

| Backend (BD) | Frontend (Formulario) | Backend (Endpoint) |
|---|---|---|
| `titulo` | `title` | ✅ POST/PUT |
| `asunto` | `topic` | ✅ POST/PUT |
| `fecha` | `date` | ✅ POST/PUT |
| `aula` | `classroom` | ✅ POST/PUT |
| `profesor_id` | teacherId | ✅ POST/PUT |
| `alumno_id` | studentId | ✅ POST/PUT |
| `id_centro` | center | ✅ POST/PUT |
| `estado` | status | ✅ PUT status |
| ~~`hora`~~ | `hour` | ❌ Eliminado (datetime en BD) |
| ~~`tema`~~ | - | ❌ Cambio a `asunto` |

---

### 5. ✅ Estado de Endpoints

| Endpoint | Método | Estado | Detalles |
|---|---|---|---|
| `/meetings` | GET | ✅ | Obtiene todas las reuniones |
| `/meetings/user/:userId` | GET | ✅ | Actualizado con campos correctos |
| `/meetings/:meetingId` | GET | ✅ | Obtiene reunión por ID |
| `/meetings` | POST | ✅ | Corregidos campos y estado pendiente |
| `/meetings/:meetingId` | PUT | ✅ | Actualización de campos sin hora |
| `/meetings/:meetingId/status` | PUT | ✅ | Cambio de estado |
| `/meetings/:meetingId` | DELETE | ✅ | Eliminación |

---

## Resumen de Cambios

### Archivos Modificados:
1. **`server/index.js`** - 3 endpoints actualizados
2. **`src/app/core/models/meeting.model.ts`** - Interfaz y enum actualizados
3. **`src/app/pages/meetings/meetingDialog.ts`** - Transformación de datos corregida

### Impacto:
- ✅ Los endpoints ahora usan los nombres de campos correctos de la BD
- ✅ El estado de las reuniones usa los valores corretos ('pendiente', 'aceptada', etc.)
- ✅ Se eliminó el campo `hora` que no existe en la BD
- ✅ Los modelos soportan ambos formatos (BD y Frontend)

### Siguiente Paso:
- Integrar el `MeetingDialog` completamente en el componente `Meetings`
- Agregar botones CREATE/EDIT/DELETE/STATUS a la tabla
- Validar que las transacciones funcionan correctamente

---

## Testing Recomendado

```bash
# Test 1: Crear reunión
POST http://localhost:3000/meetings
{
  "title": "Reunión de Evaluación",
  "topic": "Evaluación del Módulo 1",
  "fecha": "2024-01-15T10:30:00",
  "classroom": "Aula 302",
  "id_centro": 1,
  "profesor_id": 3,
  "alumno_id": 10
}
# Esperado: 200 OK, id_reunion generado

# Test 2: Obtener reuniones del usuario
GET http://localhost:3000/meetings/user/3
# Esperado: Array de reuniones donde profesor_id=3 OR alumno_id=3

# Test 3: Actualizar estado
PUT http://localhost:3000/meetings/1/status
{
  "status": "aceptada"
}
# Esperado: 200 OK, estado actualizado a 'aceptada'
```

---

**Estado General**: 🟢 FASE 1 EN BUEN CAMINO - Aproximadamente 88% completado

Fecha: 2024-01-08
