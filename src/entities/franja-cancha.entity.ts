/**
 * =============================================================================
 * entities/franja-cancha.entity.ts — TABLA `franjas_cancha`
 * =============================================================================
 * Catálogo de franjas horarias disponibles para reservar canchas deportivas.
 * Sin relaciones FK; es una tabla de configuración independiente.
 * @Unique(['espacio', 'diaSemana', 'horaInicio']): evita bloques duplicados.
 * Campos importantes: activa (habilita/deshabilita), paraTodos (franja compartida).
 * =============================================================================
 */

// Unique = constraint compuesto a nivel de tabla
import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

/**
 * @Unique compuesto: no puede existir la misma combinación de espacio + día + hora inicio.
 * Garantiza que cada bloque horario semanal sea único por cancha.
 */
@Entity('franjas_cancha')
@Unique(['espacio', 'diaSemana', 'horaInicio'])
export class FranjaCancha {
  /** PK autoincremental de la franja. */
  @PrimaryGeneratedColumn()
  id: number;

  /** Nombre del espacio deportivo (ej. "Cancha Principal"). */
  @Column({ type: 'varchar', length: 50, default: 'Cancha Principal' })
  espacio: string;

  /** Día de la semana: 1 = Lunes … 7 = Domingo. */
  @Column({ name: 'dia_semana', type: 'smallint' })
  diaSemana: number;

  /** Hora de inicio del bloque semanal. */
  @Column({ type: 'time', name: 'hora_inicio' })
  horaInicio: string;

  /** Hora de fin del bloque semanal. */
  @Column({ type: 'time', name: 'hora_fin' })
  horaFin: string;

  /** Indica si la franja está disponible para nuevas reservas. */
  @Column({ type: 'boolean', default: true })
  activa: boolean;

  /**
   * Franja reservada para todos los talleres (ej. 13:00–14:00 almuerzo/recreo).
   * Cuando es true, ningún taller puede reservar ese bloque de forma exclusiva.
   */
  @Column({ type: 'boolean', default: false, name: 'para_todos' })
  paraTodos: boolean;
}
