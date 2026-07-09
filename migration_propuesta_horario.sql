-- Propuestas de inscripción apoderado → directiva (con horario)
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

ALTER TABLE propuestas_inscripcion_taller
  ADD COLUMN IF NOT EXISTS taller_horario_id INTEGER REFERENCES taller_horario(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS horario_propuesto_texto VARCHAR(200),
  ADD COLUMN IF NOT EXISTS horario_sugerido_id INTEGER REFERENCES taller_horario(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS mensaje_apoderado TEXT,
  ADD COLUMN IF NOT EXISTS mensaje_directiva TEXT;
