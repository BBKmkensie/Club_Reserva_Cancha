-- Script para insertar los talleres básicos
USE proyecto_taller;

-- Insertar talleres
INSERT INTO `talleres` (`tipo`, `descripcion`, `capacidad`, `fecha_inicio`, `admin_id`) VALUES
('Futbol', 'Descripción del taller de fútbol, lo que hacen, sus objetivos, una pequeña descripción.', 20, NULL, NULL),
('Atletismo', 'Descripción del taller de atletismo, lo que hacen, sus objetivos, una pequeña descripción.', 20, NULL, NULL),
('Voley', 'Descripción del taller de voley, lo que hacen, sus objetivos, una pequeña descripción.', 20, NULL, NULL),
('Basquet', 'Descripción del taller de básquet, lo que hacen, sus objetivos, una pequeña descripción.', 20, NULL, NULL);

