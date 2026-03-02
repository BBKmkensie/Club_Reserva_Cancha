-- Permitir que un alumno exista sin taller (el taller lo elige al inscribirse)
ALTER TABLE alumnos MODIFY COLUMN taller_id INT NULL;
-- Opcional: si había FK con ON DELETE CASCADE, cambiarla a SET NULL para no borrar alumnos al borrar taller
-- ALTER TABLE alumnos DROP FOREIGN KEY fk_taller;
-- ALTER TABLE alumnos ADD CONSTRAINT fk_alumnos_taller FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE SET NULL;
