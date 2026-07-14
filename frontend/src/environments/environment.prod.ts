/**
 * =============================================================================
 * environments/environment.prod.ts — Configuración de producción
 * =============================================================================
 * Se usa al ejecutar `ng build --configuration production`.
 * Angular sustituye environment.ts por este archivo en el build final.
 *
 * apiUrl vacío = la API se sirve en el MISMO origen que el frontend
 * (mismo dominio / reverse proxy), así las peticiones van a /taller, /auth, etc.
 * =============================================================================
 */
export const environment = {
  // true = build de producción: AOT, tree-shaking, sin asserts de desarrollo.
  production: true,

  // '' = mismo origen (ej. https://midominio.cl/taller → el proxy llega al NestJS).
  apiUrl: '',
};
