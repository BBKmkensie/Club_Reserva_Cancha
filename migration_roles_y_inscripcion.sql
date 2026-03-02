-- --------------------------------------------------------
-- Migración: roles (super_admin), taller.imagen_url, reserva.profesor_id, inscripcion_salida
-- Ejecutar sobre la base de datos proyecto_taller ya creada
-- --------------------------------------------------------

USE `proyecto_taller`;

-- 1. Rol en admin (super_admin por defecto)
ALTER TABLE `admin`
  ADD COLUMN `rol` VARCHAR(20) NOT NULL DEFAULT 'super_admin';

-- 2. Foto/imagen en talleres
ALTER TABLE `talleres`
  ADD COLUMN `imagen_url` VARCHAR(500) DEFAULT NULL;

-- 3. Profesor en reservas (para que admin/profesores reserven cancha)
ALTER TABLE `reservas`
  ADD COLUMN `profesor_id` INT(11) DEFAULT NULL;
ALTER TABLE `reservas`
  ADD CONSTRAINT `fk_reservas_profesor` FOREIGN KEY (`profesor_id`) REFERENCES `profesores` (`id`) ON DELETE SET NULL;

-- 4. Tabla inscripcion_salida (alumnos se inscriben a salidas)
CREATE TABLE IF NOT EXISTS `inscripcion_salida` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `alumno_id` INT(11) NOT NULL,
  `salida_id` INT(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_alumno_salida` (`alumno_id`, `salida_id`),
  KEY `fk_insc_alumno` (`alumno_id`),
  KEY `fk_insc_salida` (`salida_id`),
  CONSTRAINT `fk_inscripcion_alumno` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inscripcion_salida` FOREIGN KEY (`salida_id`) REFERENCES `salidas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
