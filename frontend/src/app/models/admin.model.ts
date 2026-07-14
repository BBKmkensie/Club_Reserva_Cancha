/**
 * =============================================================================
 * app/models/admin.model.ts — Tipos de administrador
 * =============================================================================
 * Interfaces TypeScript para cuentas de directiva y super administradores.
 * Usadas en admins.component y ApiService (getAdmins, createAdmin, etc.).
 * =============================================================================
 */

/** Administrador con credenciales y datos de contacto. */
export interface Admin {
  // Identificador único.
  id: number;
  // Nombre completo.
  nombre: string;
  // RUT (usuario de login en muchos flujos).
  rut: string;
  // Correo institucional.
  email: string;
  // Hash de la contraseña (solo si el backend lo expone; normalmente no).
  passwordHash?: string;
  // Salt del hash (solo si el backend lo expone; normalmente no).
  passwordSalt?: string;
}

/** Payload para registrar un nuevo administrador (POST /admin). */
export interface CreateAdminDto {
  // Nombre completo (obligatorio).
  nombre: string;
  // RUT (obligatorio).
  rut: string;
  // Correo (obligatorio).
  email: string;
  // Contraseña en texto plano; el backend la hashea.
  password: string;
}
