-- Franjas horarias de cancha (designadas por directiva)
-- Ejecutar: psql -U postgres -d proyecto_taller -f migration_franjas_cancha.sql

CREATE TABLE IF NOT EXISTS franjas_cancha (
  id SERIAL PRIMARY KEY,
  espacio VARCHAR(50) NOT NULL DEFAULT 'Cancha Principal',
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (espacio, dia_semana, hora_inicio)
);

-- Evitar doble reserva en el mismo espacio, fecha y hora
CREATE UNIQUE INDEX IF NOT EXISTS idx_reservas_espacio_fecha_hora
  ON reservas (espacio, fecha, hora_inicio);

-- Sembrar franjas 9:00–21:00 (bloques de 1 h) para todos los días
INSERT INTO franjas_cancha (espacio, dia_semana, hora_inicio, hora_fin, activa)
SELECT
  'Cancha Principal',
  d.dia,
  (h.hora || ':00')::time,
  ((h.hora + 1) || ':00')::time,
  TRUE
FROM generate_series(1, 7) AS d(dia)
CROSS JOIN generate_series(9, 20) AS h(hora)
ON CONFLICT (espacio, dia_semana, hora_inicio) DO NOTHING;
