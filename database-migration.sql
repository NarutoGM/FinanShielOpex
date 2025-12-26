-- Agregar columna DNI a la tabla users
-- Ejecuta este script en tu base de datos PostgreSQL

-- Opción 1: Si la tabla users ya existe, agregar la columna DNI
ALTER TABLE users ADD COLUMN IF NOT EXISTS dni VARCHAR(8) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Opción 2: Si la tabla no existe o quieres recrearla, ejecuta esto:
/*
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  dni VARCHAR(8) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);
*/
