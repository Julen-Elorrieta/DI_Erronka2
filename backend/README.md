# ElorAdmin Backend API

Backend Java Spring Boot para ElorAdmin - Sistema de gestión educativa CIFP Elorrieta-Errekamari

## 🚀 Tecnologías

- **Java 17**
- **Spring Boot 3.2.1**
- **Spring Data JPA**
- **Spring Security + JWT**
- **MySQL 8.0**
- **Maven**
- **Lombok**

## 📋 Requisitos Previos

- Java 17 o superior
- Maven 3.8+
- MySQL 8.0
- Base de datos `elordb` en servidor MySQL (10.5.104.100:3306)

## ⚙️ Configuración

### 1. Base de Datos

Editar `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://10.5.104.100:3306/elordb
spring.datasource.username=TU_USUARIO
spring.datasource.password=TU_PASSWORD
```

### 2. Crear tablas en MySQL

El proyecto usa JPA con `ddl-auto=update`, así que las tablas se crearán automáticamente al iniciar.

### 3. Insertar usuario inicial (GOD)

```sql
USE elordb;

INSERT INTO users (username, password, name, surname, email, role, active, created_at, updated_at)
VALUES (
  'god',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- god123
  'Super',
  'Admin',
  'god@elorrieta.com',
  'GOD',
  1,
  NOW(),
  NOW()
);
```

Contraseña cifrada con BCrypt: `god123`

## 🏗️ Compilar el Proyecto

```bash
cd backend
mvn clean install
```

## ▶️ Ejecutar

### Modo Desarrollo

```bash
mvn spring-boot:run
```

### Modo Producción

```bash
java -jar target/eloradmin-api-1.0.0.jar
```

El servidor arrancará en: `http://localhost:3000/api`

## 📡 Endpoints

### Autenticación

- **POST** `/api/auth/login` - Login con JWT
  ```json
  {
    "username": "god",
    "encryptedPassword": "god123"
  }
  ```

### Usuarios (requiere token JWT)

- **GET** `/api/users` - Obtener todos los usuarios
- **GET** `/api/users/{id}` - Obtener usuario por ID
- **POST** `/api/users` - Crear usuario
- **PUT** `/api/users/{id}` - Actualizar usuario
- **DELETE** `/api/users/{id}` - Eliminar usuario (solo GOD)
- **GET** `/api/users/stats` - Estadísticas de usuarios

### Reuniones (requiere token JWT)

- **GET** `/api/meetings` - Obtener todas las reuniones
- **GET** `/api/meetings/today` - Reuniones de hoy
- **GET** `/api/meetings/{id}` - Obtener reunión por ID
- **POST** `/api/meetings` - Crear reunión
- **PATCH** `/api/meetings/{id}/status` - Actualizar estado
- **DELETE** `/api/meetings/{id}` - Eliminar reunión

## 🔐 Seguridad

- JWT con expiración de 24 horas
- Contraseñas cifradas con BCrypt
- CORS configurado para Angular (`http://localhost:4200`)
- Roles: GOD, ADMIN, TEACHER, STUDENT

## 📦 Desplegar en Servidor Linux

### 1. Copiar JAR al servidor

```bash
scp target/eloradmin-api-1.0.0.jar usuario@10.5.104.100:/opt/eloradmin/
```

### 2. Crear servicio systemd

```bash
sudo nano /etc/systemd/system/eloradmin.service
```

```ini
[Unit]
Description=ElorAdmin API
After=mysql.service

[Service]
Type=simple
User=elorapp
ExecStart=/usr/bin/java -jar /opt/eloradmin/eloradmin-api-1.0.0.jar
Restart=always

[Install]
WantedBy=multi-user.target
```

### 3. Iniciar servicio

```bash
sudo systemctl daemon-reload
sudo systemctl start eloradmin
sudo systemctl enable eloradmin
sudo systemctl status eloradmin
```

## 🧪 Probar API

### Con curl:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"god","encryptedPassword":"god123"}'

# Obtener usuarios (con token)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer TU_TOKEN_JWT"
```

## 📁 Estructura del Proyecto

```
backend/
├── src/main/java/com/elorrieta/eloradmin/
│   ├── config/          # Configuración (Security, CORS)
│   ├── controller/      # Controladores REST
│   ├── dto/             # Data Transfer Objects
│   ├── model/           # Entidades JPA
│   ├── repository/      # Repositorios Spring Data
│   ├── security/        # JWT, Filters, UserDetails
│   ├── service/         # Lógica de negocio
│   └── ElorAdminApplication.java
└── src/main/resources/
    └── application.properties
```

## 🐛 Troubleshooting

### Error de conexión a MySQL

Verificar:
- MySQL está corriendo: `sudo systemctl status mysql`
- Usuario y contraseña correctos en `application.properties`
- Firewall permite conexión al puerto 3306

### Puerto 3000 ya en uso

Cambiar puerto en `application.properties`:
```properties
server.port=8080
```

## 👨‍💻 Autor

CIFP Elorrieta-Errekamari - Proyecto ElorAdmin 2026
