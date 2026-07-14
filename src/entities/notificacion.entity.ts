/**
 * =============================================================================
 * entities/notificacion.entity.ts — TABLA `notificaciones`
 * =============================================================================
 * Notificaciones in-app para alumnos, profesores y administradores.
 * Relaciones clave (destinatario exclusivo, uno de tres):
 *   - ManyToOne → Alumno | Profesor | Admin (nullable; onDelete CASCADE).
 * Campos importantes: tipo, refId (entidad relacionada), leida.
 * =============================================================================
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Alumno } from './alumno.entity';
import { Profesor } from './profesor.entity';
import { Admin } from './admin.entity';

@Entity('notificaciones')
export class Notificacion {
  /** PK autoincremental de la notificación. */
  @PrimaryGeneratedColumn()
  id: number;

  /** FK al alumno destinatario (null si va a profesor o admin). */
  @Column({ name: 'alumno_id', nullable: true })
  alumnoId: number | null;

  /**
   * Destinatario alumno (mutuamente excluyente con profesor/admin).
   * onDelete CASCADE: al eliminar el alumno se borran sus notificaciones.
   */
  @ManyToOne(() => Alumno, { onDelete: 'CASCADE', nullable: true })
  /** Une la relación con la columna física `alumno_id`. */
  @JoinColumn({ name: 'alumno_id' })
  alumno: Alumno | null;

  /** FK al profesor destinatario. */
  @Column({ name: 'profesor_id', nullable: true })
  profesorId: number | null;

  /** Destinatario profesor. onDelete CASCADE elimina notificaciones del docente. */
  @ManyToOne(() => Profesor, { onDelete: 'CASCADE', nullable: true })
  /** Une la relación con la columna física `profesor_id`. */
  @JoinColumn({ name: 'profesor_id' })
  profesor: Profesor | null;

  /** FK al admin destinatario. */
  @Column({ name: 'admin_id', nullable: true })
  adminId: number | null;

  /** Destinatario administrador. onDelete CASCADE borra notificaciones del admin. */
  @ManyToOne(() => Admin, { onDelete: 'CASCADE', nullable: true })
  /** Une la relación con la columna física `admin_id`. */
  @JoinColumn({ name: 'admin_id' })
  admin: Admin | null;

  /** Título corto mostrado en el panel de notificaciones. */
  @Column({ type: 'varchar', length: 100 })
  titulo: string;

  /** Cuerpo del mensaje de la notificación. */
  @Column({ type: 'text' })
  mensaje: string;

  /**
   * Categoría de la notificación (ej. 'inscripcion_taller', 'salida', 'asistencia').
   * Determina qué entidad referencia refId.
   */
  @Column({ type: 'varchar', length: 30, default: 'inscripcion_taller' })
  tipo: string;

  /**
   * ID de la entidad relacionada según tipo (ej. id de InscripcionTaller o Salida).
   * Permite navegar al detalle desde la notificación.
   */
  @Column({ name: 'ref_id', type: 'int', nullable: true })
  refId: number | null;

  /** false = no leída (badge activo); true = el usuario ya la vio. */
  @Column({ type: 'boolean', default: false })
  leida: boolean;

  /** Timestamp de creación de la notificación. */
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
