import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('franjas_cancha')
@Unique(['espacio', 'diaSemana', 'horaInicio'])
export class FranjaCancha {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, default: 'Cancha Principal' })
  espacio: string;

  /** 1 = Lunes … 7 = Domingo */
  @Column({ name: 'dia_semana', type: 'smallint' })
  diaSemana: number;

  @Column({ type: 'time', name: 'hora_inicio' })
  horaInicio: string;

  @Column({ type: 'time', name: 'hora_fin' })
  horaFin: string;

  @Column({ type: 'boolean', default: true })
  activa: boolean;

  /** 13:00–14:00 u otras franjas fijas para todos los talleres */
  @Column({ type: 'boolean', default: false, name: 'para_todos' })
  paraTodos: boolean;
}
