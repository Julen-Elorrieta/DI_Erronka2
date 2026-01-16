-- =====================================================
-- SCRIPT SQL PARA ELORDB - Base de Datos ElorAdmin
-- =====================================================

USE elordb;

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    photo VARCHAR(500),
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Crear tabla de reuniones
CREATE TABLE IF NOT EXISTS meetings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    date DATETIME NOT NULL,
    location VARCHAR(100),
    reason VARCHAR(500),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_teacher (teacher_id),
    INDEX idx_student (student_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Crear tabla de horarios
CREATE TABLE IF NOT EXISTS schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject VARCHAR(100),
    classroom VARCHAR(50),
    `group` VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_day (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar usuario GOD inicial
-- Password: god123 (cifrado con BCrypt)
INSERT INTO users (username, password, name, surname, email, role, active, created_at, updated_at)
VALUES (
    'god',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Super',
    'Admin',
    'god@elorrieta.com',
    'GOD',
    TRUE,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE id=id;

-- Insertar usuarios de prueba
INSERT INTO users (username, password, name, surname, email, phone, role, active, created_at, updated_at)
VALUES 
    ('admin', '$2a$10$8YdKhZ2xNZu9K7VJ8p1Oeu4xH3JZ8H3Xz9Jd8cT8Ry8Lx7Ky9Zx7K', 'Admin', 'User', 'admin@elorrieta.com', '944123456', 'ADMIN', TRUE, NOW(), NOW()),
    ('profesor1', '$2a$10$8YdKhZ2xNZu9K7VJ8p1Oeu4xH3JZ8H3Xz9Jd8cT8Ry8Lx7Ky9Zx7K', 'Juan', 'García', 'juan.garcia@elorrieta.com', '944111222', 'TEACHER', TRUE, NOW(), NOW()),
    ('profesor2', '$2a$10$8YdKhZ2xNZu9K7VJ8p1Oeu4xH3JZ8H3Xz9Jd8cT8Ry8Lx7Ky9Zx7K', 'María', 'López', 'maria.lopez@elorrieta.com', '944111333', 'TEACHER', TRUE, NOW(), NOW()),
    ('alumno1', '$2a$10$8YdKhZ2xNZu9K7VJ8p1Oeu4xH3JZ8H3Xz9Jd8cT8Ry8Lx7Ky9Zx7K', 'Pedro', 'Martínez', 'pedro.martinez@elorrieta.com', '644111444', 'STUDENT', TRUE, NOW(), NOW()),
    ('alumno2', '$2a$10$8YdKhZ2xNZu9K7VJ8p1Oeu4xH3JZ8H3Xz9Jd8cT8Ry8Lx7Ky9Zx7K', 'Ana', 'Fernández', 'ana.fernandez@elorrieta.com', '644111555', 'STUDENT', TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE id=id;

-- Insertar reuniones de ejemplo
INSERT INTO meetings (teacher_id, student_id, date, location, reason, status, created_at, updated_at)
VALUES
    (3, 5, '2026-01-20 10:00:00', 'Despacho 201', 'Revisión de proyecto final', 'PENDING', NOW(), NOW()),
    (4, 6, '2026-01-21 11:30:00', 'Aula 305', 'Tutoría académica', 'CONFIRMED', NOW(), NOW())
ON DUPLICATE KEY UPDATE id=id;

-- Insertar horarios de ejemplo
INSERT INTO schedules (user_id, day_of_week, start_time, end_time, subject, classroom, `group`)
VALUES
    (3, 'MONDAY', '08:00:00', '10:00:00', 'Programación', 'Aula 101', '2DAM-D'),
    (3, 'TUESDAY', '10:00:00', '12:00:00', 'Bases de Datos', 'Aula 102', '2DAM-D'),
    (4, 'WEDNESDAY', '08:00:00', '10:00:00', 'Desarrollo Web', 'Aula 201', '2DAM-A'),
    (5, 'MONDAY', '08:00:00', '10:00:00', 'Programación', 'Aula 101', '2DAM-D'),
    (6, 'WEDNESDAY', '08:00:00', '10:00:00', 'Desarrollo Web', 'Aula 201', '2DAM-A')
ON DUPLICATE KEY UPDATE id=id;

-- Verificar datos insertados
SELECT 'Usuarios creados:' as Info;
SELECT id, username, name, surname, role FROM users;

SELECT 'Reuniones creadas:' as Info;
SELECT id, teacher_id, student_id, date, status FROM meetings;

SELECT 'Horarios creados:' as Info;
SELECT id, user_id, day_of_week, start_time, end_time, subject FROM schedules;
