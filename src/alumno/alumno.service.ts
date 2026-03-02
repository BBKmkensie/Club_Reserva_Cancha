import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alumno } from '../entities/alumno.entity';
import { CreateAlumnoDto } from '../dto/create-alumno.dto';
import * as crypto from 'crypto';

@Injectable()
export class AlumnoService {
  constructor(
    @InjectRepository(Alumno)
    private alumnoRepository: Repository<Alumno>,
  ) {}

  async create(createAlumnoDto: CreateAlumnoDto): Promise<Alumno> {
    const alumnoData: any = {
      nombre: createAlumnoDto.nombre,
      rut: createAlumnoDto.rut,
      email: createAlumnoDto.email,
      telefono: createAlumnoDto.telefono,
      edad: createAlumnoDto.edad,
      tallerId: createAlumnoDto.tallerId ?? null,
    };

    if (createAlumnoDto.password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto
        .pbkdf2Sync(createAlumnoDto.password, salt, 1000, 64, 'sha512')
        .toString('hex');
      alumnoData.passwordHash = hash;
      alumnoData.passwordSalt = salt;
    }

    const alumno = this.alumnoRepository.create(alumnoData);
    const saved = await this.alumnoRepository.save(alumno);
    if (Array.isArray(saved)) {
      return saved[0];
    }
    return saved;
  }

  async findAll(): Promise<Alumno[]> {
    return await this.alumnoRepository.find({ relations: ['taller'] });
  }

  async findOne(id: number): Promise<Alumno> {
    const alumno = await this.alumnoRepository.findOne({
      where: { id },
      relations: ['taller'],
    });
    if (!alumno) {
      throw new NotFoundException(`Alumno con ID ${id} no encontrado`);
    }
    return alumno;
  }

  async findByTaller(tallerId: number): Promise<Alumno[]> {
    return await this.alumnoRepository.find({
      where: { tallerId },
      relations: ['taller'],
    });
  }

  async update(id: number, updateAlumnoDto: Partial<CreateAlumnoDto>): Promise<Alumno> {
    const alumno = await this.findOne(id);
    const { tallerId, ...rest } = updateAlumnoDto;
    Object.assign(alumno, rest);
    if (tallerId !== undefined) alumno.tallerId = tallerId ?? null;
    return await this.alumnoRepository.save(alumno);
  }

  async remove(id: number): Promise<void> {
    const alumno = await this.findOne(id);
    await this.alumnoRepository.remove(alumno);
  }
}

