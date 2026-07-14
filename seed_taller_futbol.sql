-- ============================================================
-- Seed: Talleres Futbol, Atletismo, Voley, Basquet (PostgreSQL)
-- Ejecutar en la base de datos proyecto_taller
-- ============================================================

INSERT INTO admin (nombre, rut, email, "PasswordHash", "PasswordSalt")
SELECT 'Super Admin', '11111111-1', 'admin@reservas.local', 'hash', 'salt'
WHERE NOT EXISTS (SELECT 1 FROM admin LIMIT 1);

INSERT INTO talleres (tipo, descripcion, capacidad, fecha_inicio, admin_id)
SELECT 'Futbol', 'Taller de futbol: entrenamiento tecnico, partidos y preparacion fisica. Objetivos: mejorar el control del balon, trabajo en equipo y condicion fisica.', 20, NULL, (SELECT id FROM admin LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM talleres WHERE tipo = 'Futbol' LIMIT 1);

INSERT INTO talleres (tipo, descripcion, capacidad, fecha_inicio, admin_id)
SELECT 'Atletismo', 'Taller de atletismo: carreras, saltos y lanzamientos. Objetivos: desarrollar velocidad, resistencia y tecnica. Incluye pista y campo.', 20, NULL, (SELECT id FROM admin LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM talleres WHERE tipo = 'Atletismo' LIMIT 1);

INSERT INTO talleres (tipo, descripcion, capacidad, fecha_inicio, admin_id)
SELECT 'Voley', 'Taller de voleibol: fundamentos, saque, recepcion y remate. Objetivos: trabajo en equipo, coordinacion y tecnica de juego.', 20, NULL, (SELECT id FROM admin LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM talleres WHERE tipo = 'Voley' LIMIT 1);

INSERT INTO talleres (tipo, descripcion, capacidad, fecha_inicio, admin_id)
SELECT 'Basquet', 'Taller de basquetbol: dribling, pases y tiros. Objetivos: dominio del balon, estrategia de equipo y condicion fisica.', 20, NULL, (SELECT id FROM admin LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM talleres WHERE tipo = 'Basquet' LIMIT 1);

UPDATE talleres SET imagen_url = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800' WHERE tipo = 'Futbol';
UPDATE talleres SET imagen_url = 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800' WHERE tipo = 'Atletismo';
UPDATE talleres SET imagen_url = 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800' WHERE tipo = 'Voley';
UPDATE talleres SET imagen_url = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800' WHERE tipo = 'Basquet';

INSERT INTO profesores (nombre, rut, email, taller_id, "PasswordHash", "PasswordSalt")
SELECT 'Juan Perez', '12345678-9', 'juan.futbol@taller.local', (SELECT id FROM talleres WHERE tipo = 'Futbol' LIMIT 1), '', ''
WHERE NOT EXISTS (SELECT 1 FROM profesores WHERE rut = '12345678-9' LIMIT 1);

INSERT INTO alumnos (nombre, rut, taller_id) SELECT 'Constanza Ramos', '20948298-0', (SELECT id FROM talleres WHERE tipo = 'Futbol' LIMIT 1) WHERE NOT EXISTS (SELECT 1 FROM alumnos WHERE rut = '20948298-0' LIMIT 1);
INSERT INTO alumnos (nombre, rut, taller_id) SELECT 'Alejandro Villa', '19283381-1', (SELECT id FROM talleres WHERE tipo = 'Futbol' LIMIT 1) WHERE NOT EXISTS (SELECT 1 FROM alumnos WHERE rut = '19283381-1' LIMIT 1);
INSERT INTO alumnos (nombre, rut, taller_id) SELECT 'Angel Rizoo', '29183746-2', (SELECT id FROM talleres WHERE tipo = 'Futbol' LIMIT 1) WHERE NOT EXISTS (SELECT 1 FROM alumnos WHERE rut = '29183746-2' LIMIT 1);

INSERT INTO profesores (nombre, rut, email, taller_id, "PasswordHash", "PasswordSalt")
SELECT 'Maria Soto', '22222222-2', 'maria.atletismo@taller.local', (SELECT id FROM talleres WHERE tipo = 'Atletismo' LIMIT 1), '', ''
WHERE NOT EXISTS (SELECT 1 FROM profesores WHERE rut = '22222222-2' LIMIT 1);

INSERT INTO alumnos (nombre, rut, taller_id) SELECT 'Camila Diaz', '30948298-0', (SELECT id FROM talleres WHERE tipo = 'Atletismo' LIMIT 1) WHERE NOT EXISTS (SELECT 1 FROM alumnos WHERE rut = '30948298-0' LIMIT 1);
INSERT INTO alumnos (nombre, rut, taller_id) SELECT 'Felipe Mora', '30283381-1', (SELECT id FROM talleres WHERE tipo = 'Atletismo' LIMIT 1) WHERE NOT EXISTS (SELECT 1 FROM alumnos WHERE rut = '30283381-1' LIMIT 1);
INSERT INTO alumnos (nombre, rut, taller_id) SELECT 'Valentina Rojas', '30183746-2', (SELECT id FROM talleres WHERE tipo = 'Atletismo' LIMIT 1) WHERE NOT EXISTS (SELECT 1 FROM alumnos WHERE rut = '30183746-2' LIMIT 1);

INSERT INTO profesores (nombre, rut, email, taller_id, "PasswordHash", "PasswordSalt")
SELECT 'Carlos Lopez', '33333333-3', 'carlos.voley@taller.local', (SELECT id FROM talleres WHERE tipo = 'Voley' LIMIT 1), '', ''
WHERE NOT EXISTS (SELECT 1 FROM profesores WHERE rut = '33333333-3' LIMIT 1);

INSERT INTO alumnos (nombre, rut, taller_id) SELECT 'Javiera Fernandez', '40948298-0', (SELECT id FROM talleres WHERE tipo = 'Voley' LIMIT 1) WHERE NOT EXISTS (SELECT 1 FROM alumnos WHERE rut = '40948298-0' LIMIT 1);
INSERT INTO alumnos (nombre, rut, taller_id) SELECT 'Matias Silva', '40283381-1', (SELECT id FROM talleres WHERE tipo = 'Voley' LIMIT 1) WHERE NOT EXISTS (SELECT 1 FROM alumnos WHERE rut = '40283381-1' LIMIT 1);
INSERT INTO alumnos (nombre, rut, taller_id) SELECT 'Isidora Castro', '40183746-2', (SELECT id FROM talleres WHERE tipo = 'Voley' LIMIT 1) WHERE NOT EXISTS (SELECT 1 FROM alumnos WHERE rut = '40183746-2' LIMIT 1);

INSERT INTO profesores (nombre, rut, email, taller_id, "PasswordHash", "PasswordSalt")
SELECT 'Andrea Munoz', '44444444-4', 'andrea.basquet@taller.local', (SELECT id FROM talleres WHERE tipo = 'Basquet' LIMIT 1), '', ''
WHERE NOT EXISTS (SELECT 1 FROM profesores WHERE rut = '44444444-4' LIMIT 1);

INSERT INTO alumnos (nombre, rut, taller_id) SELECT 'Nicolas Reyes', '50948298-0', (SELECT id FROM talleres WHERE tipo = 'Basquet' LIMIT 1) WHERE NOT EXISTS (SELECT 1 FROM alumnos WHERE rut = '50948298-0' LIMIT 1);
INSERT INTO alumnos (nombre, rut, taller_id) SELECT 'Catalina Vargas', '50283381-1', (SELECT id FROM talleres WHERE tipo = 'Basquet' LIMIT 1) WHERE NOT EXISTS (SELECT 1 FROM alumnos WHERE rut = '50283381-1' LIMIT 1);
INSERT INTO alumnos (nombre, rut, taller_id) SELECT 'Sebastian Ortiz', '50183746-2', (SELECT id FROM talleres WHERE tipo = 'Basquet' LIMIT 1) WHERE NOT EXISTS (SELECT 1 FROM alumnos WHERE rut = '50183746-2' LIMIT 1);
