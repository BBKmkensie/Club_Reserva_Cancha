-- Flujo de salidas/partidos: propuesta, asignación, aprobación, apertura y cierre
-- psql -U postgres -d proyecto_taller -f migration_salidas_flujo.sql

ALTER TABLE salidas ADD COLUMN IF NOT EXISTS origen VARCHAR(30) NOT NULL DEFAULT 'PROPUESTA_PROFESOR';
ALTER TABLE salidas ADD COLUMN IF NOT EXISTS estado VARCHAR(30) NOT NULL DEFAULT 'PUBLICADA';
ALTER TABLE salidas ADD COLUMN IF NOT EXISTS resultado VARCHAR(20);
ALTER TABLE salidas ADD COLUMN IF NOT EXISTS comentario_cierre TEXT;
ALTER TABLE salidas ADD COLUMN IF NOT EXISTS comentario_apertura TEXT;
ALTER TABLE salidas ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT;
ALTER TABLE salidas ADD COLUMN IF NOT EXISTS fecha_apertura TIMESTAMP;
ALTER TABLE salidas ADD COLUMN IF NOT EXISTS fecha_cierre TIMESTAMP;
ALTER TABLE salidas ADD COLUMN IF NOT EXISTS fecha_respuesta TIMESTAMP;

UPDATE salidas
SET origen = CASE WHEN admin_id IS NOT NULL THEN 'ASIGNACION_DIRECTIVA' ELSE 'PROPUESTA_PROFESOR' END,
    estado = 'PUBLICADA'
WHERE estado = 'PUBLICADA' OR estado IS NULL;
