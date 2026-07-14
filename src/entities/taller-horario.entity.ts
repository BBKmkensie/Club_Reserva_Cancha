/**
 * =============================================================================
 * entities/taller-horario.entity.ts — TABLA `taller_horario`
 * =============================================================================
 * Bloques horarios semanales de un taller, organizados por curso o sección.
 * Relaciones clave:
 *   - ManyToOne → Taller (onDelete CASCADE).
 * Campos importantes: curso/seccion (según modoHorario del taller), diaSemana, horas.
 * =============================================================================
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Taller } from './taller.entity';

@Entity('taller_horario')
export class TallerHorario {
  /** PK autoincremental del bloque horario. */
  @PrimaryGeneratedColumn()
  id: number;

  /** FK al taller dueño de este bloque. */
  @Column({ name: 'taller_id' })
  tallerId: number;

  /**
   * Taller al que pertenece este bloque horario.
   * onDelete CASCADE: al eliminar el taller se borran todos sus horarios.
   */
  @ManyToOne(() => Taller, (taller) => taller.horarios, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `taller_id`. */
  @JoinColumn({ name: 'taller_id' })
  taller: Taller;

  /**
   * Código de curso escolar (ej. 1B–8B básico, 1M–4M medio).
   * Se usa cuando Taller.modoHorario = 'POR_CURSO'.
   */
  @Column({ type: 'varchar', length: 4, nullable: true })
  curso: string | null;

  /**
   * Sección dentro del curso (ej. 'A', 'B').
   * Se usa cuando Taller.modoHorario = 'POR_SECCION'.
   */
  @Column({ type: 'varchar', length: 10, nullable: true })
  seccion: string | null;

  /** Día de la semana: 1 = Lunes … 7 = Domingo. */
  @Column({ type: 'smallint', name: 'dia_semana' })
  diaSemana: number;

  /** Hora de inicio del bloque. */
  @Column({ type: 'time', name: 'hora_inicio' })
  horaInicio: string;

  /** Hora de fin del bloque. */
  @Column({ type: 'time', name: 'hora_fin' })
  horaFin: string;
}
