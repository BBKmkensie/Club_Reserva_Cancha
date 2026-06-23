import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Taller } from './taller.entity';
import { Profesor } from './profesor.entity';
import { RegistroAsistencia } from './registro-asistencia.entity';

export type EstadoSesion = 'ABIERTA' | 'CERRADA';

@Entity('sesiones_asistencia')
export class SesionAsistencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'taller_id' })
  tallerId: number;

  @ManyToOne(() => Taller, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taller_id' })
  taller: Taller;

  @Column({ name: 'profesor_id' })
  profesorId: number;

  @ManyToOne(() => Profesor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profesor_id' })
  profesor: Profesor;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'varchar', length: 20, default: 'ABIERTA' })
  estado: EstadoSesion;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @Column({ type: 'boolean', default: false, name: 'lista_guardada' })
  listaGuardada: boolean;

  @CreateDateColumn({ name: 'opened_at' })
  openedAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'closed_at' })
  closedAt: Date | null;

  @OneToMany(() => RegistroAsistencia, (r) => r.sesion)
  registros: RegistroAsistencia[];
}
