import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profesor } from '../entities/profesor.entity';
import { CreateProfesorDto } from '../dto/create-profesor.dto';
import * as crypto from 'crypto';

@Injectable()
export class ProfesorService {
  constructor(
    @InjectRepository(Profesor)
    private profesorRepository: Repository<Profesor>,
  ) {}

  async create(createProfesorDto: CreateProfesorDto): Promise<Profesor> {
    const profesorData: any = {
      nombre: createProfesorDto.nombre,
      rut: createProfesorDto.rut,
      email: createProfesorDto.email,
      telefono: createProfesorDto.telefono,
      fotoPath: createProfesorDto.fotoPath,
      tallerId: createProfesorDto.tallerId,
    };

    if (createProfesorDto.password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto
        .pbkdf2Sync(createProfesorDto.password, salt, 1000, 64, 'sha512')
        .toString('hex');
      profesorData.passwordHash = hash;
      profesorData.passwordSalt = salt;
    }

    const profesor = this.profesorRepository.create(profesorData);
    const saved = await this.profesorRepository.save(profesor);
    if (Array.isArray(saved)) {
      return saved[0];
    }
    return saved;
  }

  async findAll(): Promise<Profesor[]> {
    return await this.profesorRepository.find({ relations: ['taller'] });
  }

  async findOne(id: number): Promise<Profesor> {
    const profesor = await this.profesorRepository.findOne({
      where: { id },
      relations: ['taller', 'salidas'],
    });
    if (!profesor) {
      throw new NotFoundException(`Profesor con ID ${id} no encontrado`);
    }
    return profesor;
  }

  async findByTaller(tallerId: number): Promise<Profesor[]> {
    return await this.profesorRepository.find({
      where: { tallerId },
      relations: ['taller'],
    });
  }

  async update(id: number, updateProfesorDto: Partial<CreateProfesorDto>): Promise<Profesor> {
    const profesor = await this.findOne(id);
    Object.assign(profesor, updateProfesorDto);
    return await this.profesorRepository.save(profesor);
  }

  async remove(id: number): Promise<void> {
    const profesor = await this.findOne(id);
    await this.profesorRepository.remove(profesor);
  }

  async findByUsuario(usuario: string): Promise<Profesor | null> {
    const u = usuario.trim().toLowerCase();
    if (!u) return null;
    const list = await this.profesorRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.taller', 't')
      .where('LOWER(TRIM(p.nombre)) = :u', { u })
      .orWhere('LOWER(TRIM(t.tipo)) = :u', { u })
      .getMany();
    return list.length > 0 ? list[0] : null;
  }

  private verifyPassword(profesor: Profesor, password: string): boolean {
    if (!profesor.passwordHash || !profesor.passwordSalt) {
      return password === '12345';
    }
    const hash = crypto
      .pbkdf2Sync(password, profesor.passwordSalt, 1000, 64, 'sha512')
      .toString('hex');
    return hash === profesor.passwordHash;
  }

  private async setPasswordToDefault(profesor: Profesor): Promise<void> {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync('12345', salt, 1000, 64, 'sha512')
      .toString('hex');
    profesor.passwordHash = hash;
    profesor.passwordSalt = salt;
    await this.profesorRepository.save(profesor);
  }

  async login(usuario: string, password: string): Promise<Omit<Profesor, 'passwordHash' | 'passwordSalt'>> {
    const profesor = await this.findByUsuario(usuario);
    if (!profesor) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    if (!profesor.passwordHash && password === '12345') {
      await this.setPasswordToDefault(profesor);
    } else if (!this.verifyPassword(profesor, password)) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    const { passwordHash, passwordSalt, ...rest } = profesor;
    return rest as Omit<Profesor, 'passwordHash' | 'passwordSalt'>;
  }
}

