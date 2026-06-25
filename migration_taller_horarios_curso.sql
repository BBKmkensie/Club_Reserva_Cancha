-- Horarios de taller por curso (1°-8° básico, 1°-4° medio) o por sección

ALTER TABLE talleres
  ADD COLUMN IF NOT EXISTS modo_horario VARCHAR(20) DEFAULT 'POR_CURSO';

CREATE TABLE IF NOT EXISTS taller_horario (
  id SERIAL PRIMARY KEY,
  taller_id INTEGER NOT NULL,
  curso VARCHAR(4) DEFAULT NULL,
  seccion VARCHAR(10) DEFAULT NULL,
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 1 AND 7),
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  CONSTRAINT fk_taller_horario_taller FOREIGN KEY (taller_id) REFERENCES talleres (id) ON DELETE CASCADE,
  CONSTRAINT chk_taller_horario_grupo CHECK (curso IS NOT NULL OR seccion IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_taller_horario_curso
  ON taller_horario (taller_id, curso)
  WHERE curso IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_taller_horario_seccion
  ON taller_horario (taller_id, seccion)
  WHERE seccion IS NOT NULL;

-- Migrar horario único existente a filas por curso (mismo horario para todos)
INSERT INTO taller_horario (taller_id, curso, dia_semana, hora_inicio, hora_fin)
SELECT t.id, c.code, t.dia_semana, t.hora_inicio, t.hora_fin
FROM talleres t
CROSS JOIN (
  VALUES
    ('1B'), ('2B'), ('3B'), ('4B'), ('5B'), ('6B'), ('7B'), ('8B'),
    ('1M'), ('2M'), ('3M'), ('4M')
) AS c(code)
WHERE t.dia_semana IS NOT NULL
  AND t.hora_inicio IS NOT NULL
  AND t.hora_fin IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM taller_horario th WHERE th.taller_id = t.id);

UPDATE talleres SET modo_horario = 'POR_CURSO' WHERE modo_horario IS NULL;
