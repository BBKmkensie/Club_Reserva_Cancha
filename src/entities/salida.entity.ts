/**
 * =============================================================================
 * entities/salida.entity.ts — TABLA `salidas`
 * =============================================================================
 * Salidas pedagógicas o actividades fuera del establecimiento.
 * Relaciones clave:
 *   - ManyToOne → Taller (onDelete CASCADE).
 *   - ManyToOne → Admin, Profesor (opcionales; onDelete SET NULL).
 *   - OneToMany → InscripcionSalida.
 * Campos de estado: origen, estado (ciclo de vida), resultado (al cerrar).
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
import { Admin } from './admin.entity';
import { Profesor } from './profesor.entity';
import { InscripcionSalida } from './inscripcion-salida.entity';

@Entity('salidas')
export class Salida {
  /** PK autoincremental de la salida. */
  @PrimaryGeneratedColumn()
  id: number;

  /** Lugar o destino de la salida pedagógica. */
  @Column({ type: 'varchar', length: 100 })
  destino: string;

  /** Fecha de la salida. */
  @Column({ type: 'date' })
  fecha: Date;

  /** Hora programada (opcional). */
  @Column({ type: 'time', nullable: true })
  hora: string;

  /** Detalle o instrucciones de la actividad. */
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  /** FK al taller organizador (columna taller_id). */
  @Column({ name: 'taller_id' })
  tallerId: number;

  /**
   * Taller organizador de la salida.
   * onDelete CASCADE: eliminar el taller borra todas sus salidas.
   */
  @ManyToOne(() => Taller, (taller) => taller.salidas, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `taller_id`. */
  @JoinColumn({ name: 'taller_id' })
  taller: Taller;

  /** FK opcional al admin creador/aprobador. */
  @Column({ name: 'admin_id', nullable: true })
  adminId: number | null;

  /** Admin que creó o aprobó la salida. onDelete SET NULL preserva el registro. */
  @ManyToOne(() => Admin, (admin) => admin.salidas, { onDelete: 'SET NULL' })
  /** Une la relación con la columna física `admin_id`. */
  @JoinColumn({ name: 'admin_id' })
  admin: Admin | null;

  /** FK opcional al profesor proponente. */
  @Column({ name: 'profesor_id', nullable: true })
  profesorId: number | null;

  /** Profesor proponente o responsable. onDelete SET NULL anula solo la referencia. */
  @ManyToOne(() => Profesor, (profesor) => profesor.salidas, { onDelete: 'SET NULL' })
  /** Une la relación con la columna física `profesor_id`. */
  @JoinColumn({ name: 'profesor_id' })
  profesor: Profesor | null;

  /**
   * Origen de la salida en el flujo de aprobación.
   * Ej.: 'PROPUESTA_PROFESOR' (propuesta del docente) o creación administrativa directa.
   */
  @Column({ type: 'varchar', length: 30, default: 'PROPUESTA_PROFESOR' })
  origen: string;

  /**
   * Estado del ciclo de vida: PUBLICADA, CERRADA, RECHAZADA, etc.
   * Controla visibilidad, inscripciones y acciones permitidas.
   */
  @Column({ type: 'varchar', length: 30, default: 'PUBLICADA' })
  estado: string;

  /**
   * Resultado al cerrar la salida (ej. realizada, cancelada).
   * Se completa cuando estado pasa a CERRADA.
   */
  @Column({ type: 'varchar', length: 20, nullable: true })
  resultado: string | null;

  /** Comentario del profesor/admin al cerrar la salida. */
  @Column({ type: 'text', nullable: true, name: 'comentario_cierre' })
  comentarioCierre: string | null;

  /** Comentario al abrir/publicar la salida. */
  @Column({ type: 'text', nullable: true, name: 'comentario_apertura' })
  comentarioApertura: string | null;

  /** Motivo si la propuesta fue rechazada. */
  @Column({ type: 'text', nullable: true, name: 'motivo_rechazo' })
  motivoRechazo: string | null;

  /** Timestamp de apertura/publicación. */
  @Column({ type: 'timestamp', nullable: true, name: 'fecha_apertura' })
  fechaApertura: Date | null;

  /** Timestamp de cierre de la salida. */
  @Column({ type: 'timestamp', nullable: true, name: 'fecha_cierre' })
  fechaCierre: Date | null;

  /** Timestamp de respuesta (aprobación/rechazo) de la directiva. */
  @Column({ type: 'timestamp', nullable: true, name: 'fecha_respuesta' })
  fechaRespuesta: Date | null;

  /** true cuando el profesor guardó la lista de asistencia de la salida. */
  @Column({ type: 'boolean', default: false, name: 'asistencia_lista_guardada' })
  asistenciaListaGuardada: boolean;

  /** Observaciones generales al cerrar la asistencia de la salida. */
  @Column({ type: 'text', nullable: true, name: 'asistencia_observaciones' })
  asistenciaObservaciones: string | null;

  /** Ruta relativa de la imagen de evidencia (lista con nombres visibles). */
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'imagen_evidencia_path' })
  imagenEvidenciaPath: string | null;

  /** Timestamp de inicio de toma de lista en la salida. */
  @Column({ type: 'timestamp', nullable: true, name: 'asistencia_iniciada_at' })
  asistenciaIniciadaAt: Date | null;

  /** Timestamp de cierre de la asistencia de la salida. */
  @Column({ type: 'timestamp', nullable: true, name: 'asistencia_cerrada_at' })
  asistenciaCerradaAt: Date | null;

  /** Alumnos inscritos en esta salida (tabla intermedia InscripcionSalida). */
  @OneToMany(() => InscripcionSalida, (insc) => insc.salida)
  inscripciones: InscripcionSalida[];
}
