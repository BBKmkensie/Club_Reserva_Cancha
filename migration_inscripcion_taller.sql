-- Tabla de solicitudes de inscripción a taller (alumno solicita, profesor acepta/rechaza)
CREATE TABLE IF NOT EXISTS inscripcion_taller (
  id INT PRIMARY KEY AUTO_INCREMENT,
  alumno_id INT NOT NULL,
  taller_id INT NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_alumno_taller (alumno_id, taller_id),
  CONSTRAINT fk_insc_taller_alumno FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  CONSTRAINT fk_insc_taller_taller FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE
);
