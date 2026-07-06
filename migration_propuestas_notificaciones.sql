-- Propuestas de inscripción (apoderado → directiva)
CREATE TABLE IF NOT EXISTS propuestas_inscripcion_taller (
  id SERIAL PRIMARY KEY,
  alumno_id INTEGER NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  taller_id INTEGER NOT NULL REFERENCES talleres(id) ON DELETE CASCADE,
  estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  motivo_rechazo TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMP,
  UNIQUE (alumno_id, taller_id)
);

-- Referencia opcional en notificaciones (navegación al hacer clic)
ALTER TABLE notificaciones
  ADD COLUMN IF NOT EXISTS ref_id INTEGER;
