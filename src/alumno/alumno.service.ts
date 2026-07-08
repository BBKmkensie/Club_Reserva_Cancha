import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alumno } from '../entities/alumno.entity';
import { CreateAlumnoDto } from '../dto/create-alumno.dto';
import { edadAlumnoValida, EDAD_ALUMNO_MIN, EDAD_ALUMNO_MAX } from '../common/alumno-edad.constants';
import { defaultPassword, hashPassword } from '../common/password.util';

@Injectable()
export class AlumnoService {
  constructor(
    @InjectRepository(Alumno)
    private alumnoRepository: Repository<Alumno>,
  ) {}

  async create(createAlumnoDto: CreateAlumnoDto): Promise<Alumno> {
    this.validarEdad(createAlumnoDto.edad);
    const alumnoData: any = {
      nombre: createAlumnoDto.nombre,
      rut: createAlumnoDto.rut,
      email: createAlumnoDto.email,
      telefono: createAlumnoDto.telefono,
      edad: createAlumnoDto.edad,
      tallerId: createAlumnoDto.tallerId ?? null,
    };

    if (createAlumnoDto.password) {
      const { hash, salt } = hashPassword(createAlumnoDto.password);
      alumnoData.passwordHash = hash;
      alumnoData.passwordSalt = salt;
    } else {
      const { hash, salt } = hashPassword(defaultPassword());
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
    if (updateAlumnoDto.edad !== undefined) {
      this.validarEdad(updateAlumnoDto.edad);
    }
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

  private validarEdad(edad?: number): void {
    if (edad == null) return;
    if (!edadAlumnoValida(edad)) {
      throw new BadRequestException(
        `La edad debe estar entre ${EDAD_ALUMNO_MIN} y ${EDAD_ALUMNO_MAX} años`,
      );
    }
  }
}

