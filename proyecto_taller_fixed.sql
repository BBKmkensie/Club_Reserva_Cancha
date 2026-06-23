-- --------------------------------------------------------
-- Esquema completo para proyecto_taller (PostgreSQL)
-- Ejecutar conectado a la base proyecto_taller:
--   psql -U postgres -d proyecto_taller -f proyecto_taller_fixed.sql
-- --------------------------------------------------------

DROP TABLE IF EXISTS inscripcion_taller CASCADE;
DROP TABLE IF EXISTS inscripcion_salida CASCADE;
DROP TABLE IF EXISTS salidas CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS franjas_cancha CASCADE;
DROP TABLE IF EXISTS alumnos CASCADE;
DROP TABLE IF EXISTS profesores CASCADE;
DROP TABLE IF EXISTS talleres CASCADE;
DROP TABLE IF EXISTS admin CASCADE;

CREATE TABLE admin (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  rut VARCHAR(12) NOT NULL,
  email VARCHAR(100) NOT NULL,
  "PasswordHash" VARCHAR(255) NOT NULL,
  "PasswordSalt" VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'super_admin',
  UNIQUE (email),
  UNIQUE (rut)
);

CREATE TABLE talleres (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  descripcion TEXT NOT NULL,
  capacidad INTEGER DEFAULT 20,
  imagen_url VARCHAR(500) DEFAULT NULL,
  fecha_inicio DATE DEFAULT NULL,
  admin_id INTEGER DEFAULT NULL,
  CONSTRAINT fk_talleres_admin FOREIGN KEY (admin_id) REFERENCES admin (id) ON DELETE CASCADE
);

CREATE TABLE alumnos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  rut VARCHAR(12) NOT NULL,
  email VARCHAR(100) DEFAULT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  edad INTEGER DEFAULT NULL,
  taller_id INTEGER DEFAULT NULL,
  "PasswordHash" VARCHAR(255) DEFAULT NULL,
  "PasswordSalt" VARCHAR(255) DEFAULT NULL,
  UNIQUE (rut),
  CONSTRAINT fk_alumnos_taller FOREIGN KEY (taller_id) REFERENCES talleres (id) ON DELETE SET NULL
);

CREATE TABLE profesores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  rut VARCHAR(12) NOT NULL,
  email VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  foto_path VARCHAR(255) DEFAULT NULL,
  taller_id INTEGER NOT NULL,
  "PasswordHash" VARCHAR(255) DEFAULT NULL,
  "PasswordSalt" VARCHAR(255) DEFAULT NULL,
  UNIQUE (email),
  UNIQUE (rut),
  CONSTRAINT fk_profesores_taller FOREIGN KEY (taller_id) REFERENCES talleres (id) ON DELETE CASCADE
);

CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  espacio VARCHAR(50) NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME DEFAULT NULL,
  hora_fin TIME DEFAULT NULL,
  taller_id INTEGER NOT NULL,
  admin_id INTEGER DEFAULT NULL,
  profesor_id INTEGER DEFAULT NULL,
  CONSTRAINT fk_reservas_taller FOREIGN KEY (taller_id) REFERENCES talleres (id) ON DELETE CASCADE,
  CONSTRAINT fk_reservas_admin FOREIGN KEY (admin_id) REFERENCES admin (id) ON DELETE SET NULL,
  CONSTRAINT fk_reservas_profesor FOREIGN KEY (profesor_id) REFERENCES profesores (id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_reservas_espacio_fecha_hora ON reservas (espacio, fecha, hora_inicio);

CREATE TABLE franjas_cancha (
  id SERIAL PRIMARY KEY,
  espacio VARCHAR(50) NOT NULL DEFAULT 'Cancha Principal',
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  para_todos BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (espacio, dia_semana, hora_inicio)
);

INSERT INTO franjas_cancha (espacio, dia_semana, hora_inicio, hora_fin, activa, para_todos)
SELECT 'Cancha Principal', d.dia, (h.hora || ':00')::time, ((h.hora + 1) || ':00')::time, TRUE, (h.hora = 13)
FROM generate_series(1, 7) AS d(dia)
CROSS JOIN generate_series(9, 20) AS h(hora);

CREATE TABLE salidas (
  id SERIAL PRIMARY KEY,
  destino VARCHAR(100) NOT NULL,
  fecha DATE NOT NULL,
  hora TIME DEFAULT NULL,
  descripcion TEXT DEFAULT NULL,
  taller_id INTEGER NOT NULL,
  admin_id INTEGER DEFAULT NULL,
  profesor_id INTEGER DEFAULT NULL,
  CONSTRAINT fk_salidas_taller FOREIGN KEY (taller_id) REFERENCES talleres (id) ON DELETE CASCADE,
  CONSTRAINT fk_salidas_admin FOREIGN KEY (admin_id) REFERENCES admin (id) ON DELETE SET NULL,
  CONSTRAINT fk_salidas_profesor FOREIGN KEY (profesor_id) REFERENCES profesores (id) ON DELETE SET NULL
);

CREATE TABLE inscripcion_salida (
  id SERIAL PRIMARY KEY,
  alumno_id INTEGER NOT NULL,
  salida_id INTEGER NOT NULL,
  UNIQUE (alumno_id, salida_id),
  CONSTRAINT fk_inscripcion_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos (id) ON DELETE CASCADE,
  CONSTRAINT fk_inscripcion_salida FOREIGN KEY (salida_id) REFERENCES salidas (id) ON DELETE CASCADE
);

CREATE TABLE inscripcion_taller (
  id SERIAL PRIMARY KEY,
  alumno_id INTEGER NOT NULL,
  taller_id INTEGER NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (alumno_id, taller_id),
  CONSTRAINT fk_insc_taller_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos (id) ON DELETE CASCADE,
  CONSTRAINT fk_insc_taller_taller FOREIGN KEY (taller_id) REFERENCES talleres (id) ON DELETE CASCADE
);
