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
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  destino: string;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'time', nullable: true })
  hora: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'taller_id' })
  tallerId: number;

  @ManyToOne(() => Taller, (taller) => taller.salidas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taller_id' })
  taller: Taller;

  @Column({ name: 'admin_id', nullable: true })
  adminId: number | null;

  @ManyToOne(() => Admin, (admin) => admin.salidas, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin | null;

  @Column({ name: 'profesor_id', nullable: true })
  profesorId: number | null;

  @ManyToOne(() => Profesor, (profesor) => profesor.salidas, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'profesor_id' })
  profesor: Profesor | null;

  @Column({ type: 'varchar', length: 30, default: 'PROPUESTA_PROFESOR' })
  origen: string;

  @Column({ type: 'varchar', length: 30, default: 'PUBLICADA' })
  estado: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  resultado: string | null;

  @Column({ type: 'text', nullable: true, name: 'comentario_cierre' })
  comentarioCierre: string | null;

  @Column({ type: 'text', nullable: true, name: 'comentario_apertura' })
  comentarioApertura: string | null;

  @Column({ type: 'text', nullable: true, name: 'motivo_rechazo' })
  motivoRechazo: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'fecha_apertura' })
  fechaApertura: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'fecha_cierre' })
  fechaCierre: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'fecha_respuesta' })
  fechaRespuesta: Date | null;

  @OneToMany(() => InscripcionSalida, (insc) => insc.salida)
  inscripciones: InscripcionSalida[];
}
