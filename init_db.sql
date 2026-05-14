-- Создаём базу данных
CREATE DATABASE IF NOT EXISTS iot_system;
USE iot_system;

-- Таблица устройств
CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица состояний (история)
CREATE TABLE IF NOT EXISTS states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    mode VARCHAR(20) NOT NULL,
    cnt_verified INT DEFAULT 0,
    cnt_etalon INT DEFAULT 0,
    volume_verified FLOAT DEFAULT 0,
    volume_etalon FLOAT DEFAULT 0,
    error_percent FLOAT DEFAULT 0,
    temperature FLOAT DEFAULT 0,
    humidity FLOAT DEFAULT 0,
    valve TINYINT(1) DEFAULT 0,
    coeff_verified FLOAT DEFAULT 1.0,
    status VARCHAR(20) DEFAULT 'ok',
    timestamp INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица команд
CREATE TABLE IF NOT EXISTS commands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    command VARCHAR(50) NOT NULL,
    value VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавляем устройство
INSERT INTO devices (device_id, name) 
VALUES ('verifier_001', 'Умный поверитель счётчиков')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Индексы
CREATE INDEX idx_states_device_id ON states(device_id);
CREATE INDEX idx_states_timestamp ON states(timestamp);
CREATE INDEX idx_commands_device_id ON commands(device_id);