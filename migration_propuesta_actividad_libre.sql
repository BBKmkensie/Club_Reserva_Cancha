-- Propuestas de actividades fuera del catálogo de talleres
ALTER TABLE propuestas_inscripcion_taller
  ALTER COLUMN taller_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS actividad_libre_nombre VARCHAR(100),
  ADD COLUMN IF NOT EXISTS actividad_libre_descripcion TEXT,
  ADD COLUMN IF NOT EXISTS horario_sugerido_texto VARCHAR(200);

ALTER TABLE propuestas_inscripcion_taller
  DROP CONSTRAINT IF EXISTS propuestas_inscripcion_taller_alumno_id_taller_id_key;
