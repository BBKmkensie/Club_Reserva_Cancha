/**
 * Asistencia de alumnos inscritos en una salida pedagógica + imagen de evidencia.
 */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Salida } from '../entities/salida.entity';
import { RegistroAsistenciaSalida } from '../entities/registro-asistencia-salida.entity';
import { InscripcionSalida } from '../entities/inscripcion-salida.entity';
import { ActualizarAsistenciaDto } from '../dto/actualizar-asistencia.dto';
import { SubirImagenSalidaDto } from '../dto/subir-imagen-salida.dto';

@Injectable()
export class AsistenciaSalidaService implements OnModuleInit {
  private readonly uploadsDir = join(process.cwd(), 'uploads', 'salidas');

  constructor(
    @InjectRepository(Salida)
    private salidaRepo: Repository<Salida>,
    @InjectRepository(RegistroAsistenciaSalida)
    private registroRepo: Repository<RegistroAsistenciaSalida>,
    @InjectRepository(InscripcionSalida)
    private inscripcionRepo: Repository<InscripcionSalida>,
    private dataSource: DataSource,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!existsSync(this.uploadsDir)) {
      mkdirSync(this.uploadsDir, { recursive: true });
    }
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS registros_asistencia_salida (
        id SERIAL PRIMARY KEY,
        salida_id INTEGER NOT NULL REFERENCES salidas(id) ON DELETE CASCADE,
        alumno_id INTEGER NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
        estado VARCHAR(20) NOT NULL DEFAULT 'PRESENTE',
        observacion VARCHAR(255),
        UNIQUE (salida_id, alumno_id)
      );
    `);
    await this.dataSource.query(`
      ALTER TABLE salidas ADD COLUMN IF NOT EXISTS asistencia_lista_guardada BOOLEAN NOT NULL DEFAULT false;
    `);
    await this.dataSource.query(`
      ALTER TABLE salidas ADD COLUMN IF NOT EXISTS asistencia_observaciones TEXT;
    `);
    await this.dataSource.query(`
      ALTER TABLE salidas ADD COLUMN IF NOT EXISTS imagen_evidencia_path VARCHAR(500);
    `);
    await this.dataSource.query(`
      ALTER TABLE salidas ADD COLUMN IF NOT EXISTS asistencia_iniciada_at TIMESTAMP;
    `);
    await this.dataSource.query(`
      ALTER TABLE salidas ADD COLUMN IF NOT EXISTS asistencia_cerrada_at TIMESTAMP;
    `);
  }

  private async obtenerSalida(salidaId: number): Promise<Salida> {
    const salida = await this.salidaRepo.findOne({
      where: { id: salidaId },
      relations: ['taller', 'profesor'],
    });
    if (!salida) throw new NotFoundException('Salida no encontrada');
    return salida;
  }

  private assertProfesor(salida: Salida, profesorId: number): void {
    if (salida.profesorId !== profesorId) {
      throw new ForbiddenException('Solo el profesor responsable puede gestionar la asistencia');
    }
  }

  private estadosPermitidosAsistencia(): string[] {
    return ['PUBLICADA', 'EN_CURSO', 'CERRADA'];
  }

  /** Inicia la lista con los alumnos inscritos en la salida (todos PRESENTE por defecto). */
  async iniciar(salidaId: number, profesorId: number) {
    const salida = await this.obtenerSalida(salidaId);
    this.assertProfesor(salida, profesorId);
    if (!this.estadosPermitidosAsistencia().includes(salida.estado)) {
      throw new BadRequestException('La salida debe estar publicada, en curso o cerrada para pasar lista');
    }

    const inscritos = await this.inscripcionRepo.find({
      where: { salidaId },
      relations: ['alumno'],
    });
    if (inscritos.length === 0) {
      throw new BadRequestException('No hay alumnos inscritos en esta salida');
    }

    const existentes = await this.registroRepo.find({ where: { salidaId } });
    if (existentes.length === 0) {
      const registros = inscritos.map((insc) =>
        this.registroRepo.create({
          salidaId,
          alumnoId: insc.alumnoId,
          estado: 'PRESENTE',
        }),
      );
      await this.registroRepo.save(registros);
    }

    if (!salida.asistenciaIniciadaAt) {
      salida.asistenciaIniciadaAt = new Date();
      await this.salidaRepo.save(salida);
    }

    return this.obtenerDetalle(salidaId);
  }

  /** Detalle de asistencia + imagen para profesor o directiva. */
  async obtenerDetalle(salidaId: number) {
    const salida = await this.obtenerSalida(salidaId);
    const registros = await this.registroRepo.find({
      where: { salidaId },
      relations: ['alumno'],
      order: { id: 'ASC' },
    });

    const presentes = registros.filter((r) => r.estado === 'PRESENTE').length;
    const ausentes = registros.filter((r) => r.estado === 'AUSENTE').length;
    const inscritosCount = await this.inscripcionRepo.count({ where: { salidaId } });

    return {
      salida: {
        id: salida.id,
        destino: salida.destino,
        fecha: salida.fecha,
        hora: salida.hora,
        estado: salida.estado,
        taller: salida.taller ? { id: salida.taller.id, tipo: salida.taller.tipo } : null,
        profesor: salida.profesor ? { id: salida.profesor.id, nombre: salida.profesor.nombre } : null,
        asistenciaListaGuardada: salida.asistenciaListaGuardada,
        asistenciaObservaciones: salida.asistenciaObservaciones,
        imagenEvidenciaUrl: salida.imagenEvidenciaPath
          ? `/uploads/salidas/${salida.imagenEvidenciaPath}`
          : null,
        asistenciaIniciadaAt: salida.asistenciaIniciadaAt,
        asistenciaCerradaAt: salida.asistenciaCerradaAt,
      },
      resumen: {
        total: registros.length,
        presentes,
        ausentes,
        inscritos: inscritosCount,
      },
      registros: registros.map((r) => ({
        id: r.id,
        alumnoId: r.alumnoId,
        nombre: r.alumno?.nombre ?? 'Alumno',
        rut: r.alumno?.rut ?? '',
        estado: r.estado,
        observacion: r.observacion,
      })),
    };
  }

  async actualizarRegistros(salidaId: number, profesorId: number, dto: ActualizarAsistenciaDto) {
    const salida = await this.obtenerSalida(salidaId);
    this.assertProfesor(salida, profesorId);
    if (salida.asistenciaCerradaAt) {
      throw new BadRequestException('La asistencia de esta salida ya está cerrada');
    }

    const existentes = await this.registroRepo.count({ where: { salidaId } });
    if (existentes === 0) {
      throw new BadRequestException('Primero debe iniciar la lista de asistencia');
    }

    for (const item of dto.registros) {
      if (!['PRESENTE', 'AUSENTE'].includes(item.estado)) {
        throw new BadRequestException(`Estado inválido para alumno ${item.alumnoId}`);
      }
      const registro = await this.registroRepo.findOne({
        where: { salidaId, alumnoId: item.alumnoId },
      });
      if (!registro) {
        throw new BadRequestException(`El alumno ${item.alumnoId} no está inscrito en esta salida`);
      }
      registro.estado = item.estado;
      registro.observacion = item.observacion?.trim() || null;
      await this.registroRepo.save(registro);
    }

    salida.asistenciaListaGuardada = true;
    await this.salidaRepo.save(salida);

    return this.obtenerDetalle(salidaId);
  }

  async cerrar(salidaId: number, profesorId: number, observaciones?: string) {
    const salida = await this.obtenerSalida(salidaId);
    this.assertProfesor(salida, profesorId);
    if (!salida.asistenciaListaGuardada) {
      throw new BadRequestException('Debe guardar la lista antes de cerrar la asistencia');
    }
    if (salida.asistenciaCerradaAt) {
      throw new BadRequestException('La asistencia ya está cerrada');
    }

    salida.asistenciaObservaciones = observaciones?.trim() || null;
    salida.asistenciaCerradaAt = new Date();
    await this.salidaRepo.save(salida);

    return this.obtenerDetalle(salidaId);
  }

  async subirImagen(salidaId: number, profesorId: number, dto: SubirImagenSalidaDto) {
    const salida = await this.obtenerSalida(salidaId);
    this.assertProfesor(salida, profesorId);
    if (salida.asistenciaCerradaAt) {
      throw new BadRequestException('No se puede cambiar la imagen con la asistencia cerrada');
    }

    const base64 = dto.imagenBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length > 5 * 1024 * 1024) {
      throw new BadRequestException('La imagen no puede superar 5 MB');
    }

    const ext =
      dto.mimeType === 'image/png'
        ? 'png'
        : dto.mimeType === 'image/webp'
          ? 'webp'
          : 'jpg';
    const filename = `salida-${salidaId}.${ext}`;
    writeFileSync(join(this.uploadsDir, filename), buffer);

    salida.imagenEvidenciaPath = filename;
    await this.salidaRepo.save(salida);

    return this.obtenerDetalle(salidaId);
  }
}
