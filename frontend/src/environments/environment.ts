/**
 * =============================================================================
 * environments/environment.ts — Configuración de desarrollo
 * =============================================================================
 * Angular usa este archivo cuando ejecutas `ng serve` o un build de desarrollo.
 * En producción se reemplaza por environment.prod.ts (fileReplacements en angular.json).
 *
 * ApiService lee environment.apiUrl como base de todas las URLs HTTP.
 * =============================================================================
 */
export const environment = {
  // false = modo desarrollo: más logs, sin minificar, source maps completos.
  production: false,

  // URL base del backend NestJS local (puerto 3000).
  // Ejemplo: GET http://localhost:3000/taller
  apiUrl: 'http://localhost:3000',
};
