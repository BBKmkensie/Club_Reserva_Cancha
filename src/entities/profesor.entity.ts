/**
 * =============================================================================
 * entities/profesor.entity.ts — TABLA `profesores`
 * =============================================================================
 * Docentes del establecimiento vinculados a un taller y con credenciales propias.
 * Relaciones clave:
 *   - ManyToOne → Taller (onDelete CASCADE: al borrar el taller se elimina el vínculo).
 *   - OneToMany → Salida, Reserva (actividades y reservas del profesor).
 * Campos importantes: rut y email (únicos), tallerId (obligatorio), fotoPath.
 * =============================================================================
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Taller } from './taller.entity';
import { Salida } from './salida.entity';
import { Reserva } from './reserva.entity';

@Entity('profesores')
export class Profesor {
  /** PK autoincremental del profesor. */
  @PrimaryGeneratedColumn()
  id: number;

  /** Nombre completo del docente. */
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  /** RUT único del profesor (también sirve como usuario de login). */
  @Column({ type: 'varchar', length: 12, unique: true })
  rut: string;

  /** Correo único de acceso y notificaciones. */
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  /** Teléfono de contacto (opcional). */
  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  /** Ruta relativa de la foto de perfil del profesor. */
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'foto_path' })
  fotoPath: string | null;

  /** FK obligatoria al taller asignado (columna taller_id). */
  @Column({ name: 'taller_id' })
  tallerId: number;

  /**
   * Taller al que pertenece el profesor.
   * onDelete CASCADE: eliminar el taller borra también los registros de profesores asociados.
   */
  @ManyToOne(() => Taller, (taller) => taller.profesores, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `taller_id`. */
  @JoinColumn({ name: 'taller_id' })
  taller: Taller;

  /** Hash PBKDF2 de la contraseña del profesor. */
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'PasswordHash' })
  passwordHash: string;

  /** Salt de la contraseña del profesor. */
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'PasswordSalt' })
  passwordSalt: string;

  /** Salidas pedagógicas propuestas o gestionadas por este profesor. */
  @OneToMany(() => Salida, (salida) => salida.profesor)
  salidas: Salida[];

  /** Reservas de cancha realizadas por este profesor. */
  @OneToMany(() => Reserva, (reserva) => reserva.profesor)
  reservas: Reserva[];
}
