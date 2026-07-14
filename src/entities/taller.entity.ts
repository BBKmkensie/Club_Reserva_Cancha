/**
 * =============================================================================
 * entities/taller.entity.ts — TABLA `talleres`
 * =============================================================================
 * Talleres y actividades extracurriculares con ciclo de publicación e inscripción.
 * Relaciones clave:
 *   - ManyToOne → Admin (creador; onDelete CASCADE).
 *   - OneToMany → Alumno, Profesor, Reserva, Salida, InscripcionTaller, TallerHorario.
 * Campos importantes: estado (ciclo de vida), modoHorario, capacidad, umbralAusencias.
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
import { Admin } from './admin.entity';
import { Alumno } from './alumno.entity';
import { Profesor } from './profesor.entity';
import { Reserva } from './reserva.entity';
import { Salida } from './salida.entity';
import { InscripcionTaller } from './inscripcion-taller.entity';
import { TallerHorario } from './taller-horario.entity';

/** Define si los bloques horarios se organizan por curso escolar o por sección. */
export type ModoHorarioTaller = 'POR_CURSO' | 'POR_SECCION';

/**
 * Ciclo de vida del taller desde borrador hasta cierre:
 * BORRADOR → ESPERA_DOCENTE → ESPERA_HORARIO → PUBLICADO → CERRADO
 */
export type EstadoTaller =
  | 'BORRADOR'
  | 'ESPERA_DOCENTE'
  | 'ESPERA_HORARIO'
  | 'PUBLICADO'
  | 'CERRADO';

@Entity('talleres')
export class Taller {
  /** PK autoincremental del taller. */
  @PrimaryGeneratedColumn()
  id: number;

  /** Nombre/tipo del taller (ej. "Fútbol", "Basquetbol"). */
  @Column({ type: 'varchar', length: 50 })
  tipo: string;

  /** Descripción larga de la actividad. */
  @Column({ type: 'text' })
  descripcion: string;

  /** Cupos máximos de alumnos aceptados. */
  @Column({ type: 'int', default: 20 })
  capacidad: number;

  /** Cantidad de ausencias antes de generar una AlertaAusencia. */
  @Column({ type: 'int', default: 3, name: 'umbral_ausencias' })
  umbralAusencias: number;

  /** URL o ruta de la imagen de portada del taller. */
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'imagen_url' })
  imagenUrl: string | null;

  /** Fecha de inicio de actividades del taller. */
  @Column({ type: 'date', nullable: true, name: 'fecha_inicio' })
  fechaInicio: Date | null;

  /** Día de la semana del horario principal (1 = Lunes … 7 = Domingo). */
  @Column({ type: 'smallint', nullable: true, name: 'dia_semana' })
  diaSemana: number | null;

  /** Hora de inicio del bloque principal (legado; preferir TallerHorario). */
  @Column({ type: 'time', nullable: true, name: 'hora_inicio' })
  horaInicio: string | null;

  /** Hora de fin del bloque principal (legado; preferir TallerHorario). */
  @Column({ type: 'time', nullable: true, name: 'hora_fin' })
  horaFin: string | null;

  /**
   * Estado del ciclo de configuración y visibilidad del taller.
   * Controla qué acciones están permitidas (editar, publicar, inscribir, cerrar).
   */
  @Column({ type: 'varchar', length: 30, default: 'BORRADOR' })
  estado: EstadoTaller;

  /**
   * Modo de organización de horarios: por curso escolar o por sección.
   * Afecta cómo se crean y muestran los registros en TallerHorario.
   */
  @Column({ type: 'varchar', length: 20, default: 'POR_CURSO', name: 'modo_horario' })
  modoHorario: ModoHorarioTaller;

  /** Fecha desde la cual se aceptan postulaciones. */
  @Column({ type: 'date', nullable: true, name: 'fecha_apertura_inscripcion' })
  fechaAperturaInscripcion: Date | null;

  /** Fecha hasta la cual se aceptan postulaciones. */
  @Column({ type: 'date', nullable: true, name: 'fecha_cierre_inscripcion' })
  fechaCierreInscripcion: Date | null;

  /** Momento en que el taller pasó a estado PUBLICADO. */
  @Column({ type: 'timestamp', nullable: true, name: 'publicado_at' })
  publicadoAt: Date | null;

  /** Momento en que el taller pasó a estado CERRADO. */
  @Column({ type: 'timestamp', nullable: true, name: 'cerrado_at' })
  cerradoAt: Date | null;

  /** FK al administrador creador (columna admin_id). */
  @Column({ name: 'admin_id', nullable: true })
  adminId: number;

  /**
   * Administrador que creó o gestiona este taller.
   * onDelete CASCADE: al eliminar el admin se eliminan sus talleres.
   */
  @ManyToOne(() => Admin, (admin) => admin.talleres, { onDelete: 'CASCADE' })
  /** Une la relación con la columna física `admin_id`. */
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;

  /** Alumnos con taller principal asignado (relación legada). */
  @OneToMany(() => Alumno, (alumno) => alumno.taller)
  alumnos: Alumno[];

  /** Docentes vinculados a este taller. */
  @OneToMany(() => Profesor, (profesor) => profesor.taller)
  profesores: Profesor[];

  /** Reservas de cancha asociadas al taller. */
  @OneToMany(() => Reserva, (reserva) => reserva.taller)
  reservas: Reserva[];

  /** Salidas pedagógicas del taller. */
  @OneToMany(() => Salida, (salida) => salida.taller)
  salidas: Salida[];

  /** Postulaciones de alumnos a este taller. */
  @OneToMany(() => InscripcionTaller, (insc) => insc.taller)
  inscripciones: InscripcionTaller[];

  /** Bloques horarios semanales (por curso o sección). */
  @OneToMany(() => TallerHorario, (h) => h.taller)
  horarios: TallerHorario[];
}
