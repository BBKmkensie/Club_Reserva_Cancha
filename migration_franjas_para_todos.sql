-- Marca 13:00–14:00 como franja para todos y permite duración > 1 h en franjas
ALTER TABLE franjas_cancha
  ADD COLUMN IF NOT EXISTS para_todos BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE franjas_cancha
SET para_todos = TRUE, activa = TRUE
WHERE EXTRACT(HOUR FROM hora_inicio) = 13
  AND EXTRACT(HOUR FROM hora_fin) = 14;
