/**
 * =============================================================================
 * entities/admin.entity.ts — TABLA `admin`
 * =============================================================================
 * Usuarios administradores del sistema con credenciales y rol de acceso.
 * Relaciones clave:
 *   - OneToMany → Taller, Reserva, Salida (entidades creadas/gestionadas por el admin).
 * Campos importantes: rut y email (únicos), passwordHash/passwordSalt, rol.
 * =============================================================================
 */

// Decoradores TypeORM: Entity = tabla; Column = campo; OneToMany = relación 1→N
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
// Taller, Reserva y Salida: entidades hijas que un admin puede gestionar
import { Taller } from './taller.entity';
import { Reserva } from './reserva.entity';
import { Salida } from './salida.entity';

@Entity('admin')
export class Admin {
  /** PK autoincremental de la tabla admin. */
  @PrimaryGeneratedColumn()
  id: number;

  /** Nombre completo del administrador. */
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  /** Identificador único del administrador; no puede repetirse en la tabla. */
  @Column({ type: 'varchar', length: 12, unique: true })
  rut: string;

  /** Correo de acceso; constraint unique evita cuentas duplicadas. */
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  /** Hash PBKDF2 de la contraseña (columna física PasswordHash). */
  @Column({ type: 'varchar', length: 255, name: 'PasswordHash' })
  passwordHash: string;

  /** Salt usado junto al hash para verificar la contraseña. */
  @Column({ type: 'varchar', length: 255, name: 'PasswordSalt' })
  passwordSalt: string;

  /**
   * Rol del administrador. Valor por defecto: 'super_admin'.
   * Otros valores: 'directiva'. Define permisos globales del sistema.
   */
  @Column({ type: 'varchar', length: 20, default: 'super_admin' })
  rol: string;

  /** Un admin puede crear/gestionar muchos talleres (lado inverso de Taller.admin). */
  @OneToMany(() => Taller, (taller) => taller.admin)
  talleres: Taller[];

  /** Reservas de cancha registradas por este administrador. */
  @OneToMany(() => Reserva, (reserva) => reserva.admin)
  reservas: Reserva[];

  /** Salidas pedagógicas creadas o aprobadas por este administrador. */
  @OneToMany(() => Salida, (salida) => salida.admin)
  salidas: Salida[];
}
