/**
 * =============================================================================
 * entities/reserva.entity.ts — TABLA `reservas`
 * =============================================================================
 * Reservas de espacios deportivos (canchas) vinculadas a un taller.
 * Relaciones clave:
 *   - ManyToOne → Taller (onDelete CASCADE).
 *   - ManyToOne → Admin, Profesor (opcionales; onDelete SET NULL).
 * Campos importantes: espacio, fecha, horaInicio/horaFin.
 * =============================================================================
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Taller } from './taller.entity';
import { Admin } from './admin.entity';
import { Profesor } from './profesor.entity';

/**
 * Evita dos reservas con el mismo inicio en el mismo espacio/fecha.
 * El solape de intervalos (bloques de distinta duración) se refuerza en BD
 * con EXCLUDE USING gist (ver ReservaService.onModuleInit).
 */
@Index('UQ_reservas_espacio_fecha_hora_inicio', ['espacio', 'fecha', 'horaInicio'], {
  unique: true,
})
@Entity('reservas')
export class Reserva {
  /** PK autoincremental de la reserva. */
  @PrimaryGeneratedColumn()
  id: number;

  /** Nombre del espacio reservado (ej. "Cancha Principal"). */
  @Column({ type: 'varchar', length: 50 })
  espacio: string;

  /** Día calendario de la reserva. */
  @Column({ type: 'date' })
  fecha: Date;

  /** Hora de inicio del bloque reservado. */
  @Column({ type: 'time', nullable: true, name: 'hora_inicio' })
  horaInicio: string;

  /** Hora de fin del bloque reservado. */
  @Column({ type: 'time', nullable: true, name: 'hora_fin' })
  horaFin: string;

  /** FK al taller que usa la cancha (columna taller_id). */
  @Column({ name: 'taller_id' })
  tallerId: number;

  /**
   * Taller que utiliza la cancha en este bloque.
   * onDelete CASCADE: si se elimina el taller, sus reservas también se borran.
   */
  @ManyToOne(() => Taller, (taller) => taller.reservas, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `taller_id`. */
  @JoinColumn({ name: 'taller_id' })
  taller: Taller;

  /** FK opcional al admin que registró la reserva. */
  @Column({ name: 'admin_id', nullable: true })
  adminId: number | null;

  /**
   * Administrador que registró la reserva (puede ser null si la hizo un profesor).
   * onDelete SET NULL: eliminar el admin no borra la reserva, solo anula la referencia.
   */
  @ManyToOne(() => Admin, (admin) => admin.reservas, { onDelete: 'SET NULL' })
  /** Une la relación con la columna física `admin_id`. */
  @JoinColumn({ name: 'admin_id' })
  admin: Admin | null;

  /** FK opcional al profesor responsable. */
  @Column({ name: 'profesor_id', nullable: true })
  profesorId: number | null;

  /**
   * Profesor responsable de la reserva de cancha.
   * onDelete SET NULL: la reserva persiste aunque se elimine el profesor.
   */
  @ManyToOne(() => Profesor, (profesor) => profesor.reservas, { onDelete: 'SET NULL' })
  /** Une la relación con la columna física `profesor_id`. */
  @JoinColumn({ name: 'profesor_id' })
  profesor: Profesor | null;
}
