/**
 * Modelos de administrador del colegio.
 * Tipos para listado, creación y persistencia de cuentas de directiva.
 */

/** Administrador con credenciales y datos de contacto. */
export interface Admin {
  id: number;
  nombre: string;
  rut: string;
  email: string;
  passwordHash?: string;
  passwordSalt?: string;
}

/** Payload para registrar un nuevo administrador. */
export interface CreateAdminDto {
  nombre: string;
  rut: string;
  email: string;
  password: string;
}
