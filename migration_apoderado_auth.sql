-- Apoderado: RUT y credenciales de acceso
ALTER TABLE alumnos
  ADD COLUMN IF NOT EXISTS apoderado_rut VARCHAR(12) UNIQUE,
  ADD COLUMN IF NOT EXISTS apoderado_password_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS apoderado_password_salt VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS idx_alumnos_apoderado_rut
  ON alumnos (apoderado_rut)
  WHERE apoderado_rut IS NOT NULL;
