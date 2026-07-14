/**
 * =============================================================================
 * entities/alumno.entity.ts — TABLA `alumnos`
 * =============================================================================
 * Estudiantes del establecimiento con credenciales y datos de su apoderado.
 * Relaciones clave:
 *   - ManyToOne → Taller (taller principal, legado; onDelete SET NULL).
 *   - OneToMany → InscripcionSalida, InscripcionTaller.
 * Campos importantes: rut (único), apoderadoRut (único), credenciales alumno/apoderado.
 * =============================================================================
 */

// ManyToOne / OneToMany / JoinColumn = relaciones FK de TypeORM
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Taller } from './taller.entity';
import { InscripcionSalida } from './inscripcion-salida.entity';
import { InscripcionTaller } from './inscripcion-taller.entity';

@Entity('alumnos')
export class Alumno {
  /** PK autoincremental del alumno. */
  @PrimaryGeneratedColumn()
  id: number;

  /** Nombre completo del estudiante. */
  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  /** RUT del alumno; identificador único en el sistema escolar. */
  @Column({ type: 'varchar', length: 12, unique: true })
  rut: string;

  /** Correo del alumno (opcional; usado para notificaciones). */
  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  /** Teléfono de contacto del alumno (opcional). */
  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string;

  /** Edad del alumno en años (opcional). */
  @Column({ type: 'int', nullable: true })
  edad: number;

  /** FK al taller principal (campo legado; la inscripción formal usa InscripcionTaller). */
  @Column({ name: 'taller_id', nullable: true })
  tallerId: number | null;

  /**
   * Taller principal asignado al alumno.
   * onDelete SET NULL: si se elimina el taller, el alumno permanece sin taller asignado.
   */
  @ManyToOne(() => Taller, (taller) => taller.alumnos, { onDelete: 'SET NULL' })
  /** Une la relación con la columna física `taller_id`. */
  @JoinColumn({ name: 'taller_id' })
  taller: Taller | null;

  /** Hash PBKDF2 de la contraseña del alumno. */
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'PasswordHash' })
  passwordHash: string;

  /** Salt de la contraseña del alumno. */
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'PasswordSalt' })
  passwordSalt: string;

  /** Nombre del apoderado (vive en la misma fila; no hay tabla apoderados). */
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'apoderado_nombre' })
  apoderadoNombre: string | null;

  /** Teléfono del apoderado para contacto. */
  @Column({ type: 'varchar', length: 20, nullable: true, name: 'apoderado_telefono' })
  apoderadoTelefono: string | null;

  /** Email del apoderado (correos de asistencia / propuestas). */
  @Column({ type: 'varchar', length: 100, nullable: true, name: 'apoderado_email' })
  apoderadoEmail: string | null;

  /** RUT del apoderado; único para vincular una cuenta de apoderado por familia. */
  @Column({ type: 'varchar', length: 12, nullable: true, unique: true, name: 'apoderado_rut' })
  apoderadoRut: string | null;

  /** Hash PBKDF2 de la contraseña del apoderado. */
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'apoderado_password_hash' })
  apoderadoPasswordHash: string | null;

  /** Salt de la contraseña del apoderado. */
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'apoderado_password_salt' })
  apoderadoPasswordSalt: string | null;

  /** Inscripciones del alumno a salidas pedagógicas. */
  @OneToMany(() => InscripcionSalida, (insc) => insc.alumno)
  inscripcionesSalida: InscripcionSalida[];

  /** Postulaciones del alumno a talleres extracurriculares. */
  @OneToMany(() => InscripcionTaller, (insc) => insc.alumno)
  inscripcionesTaller: InscripcionTaller[];
}
