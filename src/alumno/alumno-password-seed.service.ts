import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alumno } from '../entities/alumno.entity';
import { defaultPassword, hashPassword, needsPasswordInit } from '../common/password.util';

export interface SeedAlumnoPasswordsResult {
  actualizados: number;
  omitidos: number;
  detalle: Array<{ alumnoId: number; nombre: string; rut: string }>;
}

@Injectable()
export class AlumnoPasswordSeedService {
  constructor(
    @InjectRepository(Alumno)
    private alumnoRepo: Repository<Alumno>,
  ) {}

  async seedMissingPasswords(): Promise<SeedAlumnoPasswordsResult> {
    const alumnos = await this.alumnoRepo.find({ order: { id: 'ASC' } });
    const detalle: SeedAlumnoPasswordsResult['detalle'] = [];
    let actualizados = 0;
    let omitidos = 0;

    const password = defaultPassword();
    const { hash, salt } = hashPassword(password);

    for (const alumno of alumnos) {
      if (!needsPasswordInit(alumno.passwordHash) && alumno.passwordSalt?.trim()) {
        omitidos++;
        continue;
      }

      alumno.passwordHash = hash;
      alumno.passwordSalt = salt;
      await this.alumnoRepo.save(alumno);
      actualizados++;
      detalle.push({
        alumnoId: alumno.id,
        nombre: alumno.nombre,
        rut: alumno.rut,
      });
    }

    return { actualizados, omitidos, detalle };
  }
}
