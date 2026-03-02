-- Script para eliminar y recrear las tablas
USE proyecto_taller;

-- Eliminar tablas en orden (respetando las claves foráneas)
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `salidas`;
DROP TABLE IF EXISTS `reservas`;
DROP TABLE IF EXISTS `alumnos`;
DROP TABLE IF EXISTS `profesores`;
DROP TABLE IF EXISTS `talleres`;
DROP TABLE IF EXISTS `admin`;

SET FOREIGN_KEY_CHECKS = 1;

-- Ahora ejecuta el script Proyecto_Taller.sql completo

