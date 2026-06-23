import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('periodo_academico')
export class PeriodoAcademico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, default: 'Período actual' })
  nombre: string;

  @Column({ type: 'date', name: 'fecha_apertura' })
  fechaApertura: Date;

  @Column({ type: 'date', name: 'fecha_cierre' })
  fechaCierre: Date;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
