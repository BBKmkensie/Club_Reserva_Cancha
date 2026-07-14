/**
 * =============================================================================
 * common/profesor-lookup.util.ts — BUSCAR PROFESOR POR CREDENCIAL DE LOGIN
 * =============================================================================
 * Intenta resolver un profesor a partir del texto que el usuario escribe:
 *   1) email (si contiene "@")
 *   2) RUT normalizado (tolerando puntos/guiones)
 *   3) nombre del profesor o tipo/nombre del taller (último recurso)
 *
 * Lo usan AuthService y ProfesorService para no duplicar la misma query.
 * =============================================================================
 */

// Repository = API de consultas TypeORM (aquí usamos QueryBuilder).
import { Repository } from 'typeorm';

// Profesor = entidad (= fila de `profesores`), con relación opcional a taller.
import { Profesor } from '../entities/profesor.entity';

// normalizarRut = quita puntos/guiones para comparar RUTs de forma uniforme.
import { normalizarRut } from './rut.util';

/**
 * buscarProfesorPorUsuario(repo, usuario):
 *   - repo = Repository<Profesor> inyectado desde el service
 *   - usuario = texto del login (email, RUT, nombre...)
 *
 * El orden de prioridad evita falsos positivos entre email, RUT y nombre.
 * Retorna el Profesor con su taller (leftJoinAndSelect) o null.
 */
export async function buscarProfesorPorUsuario(
  repo: Repository<Profesor>,
  usuario: string,
): Promise<Profesor | null> {
  // Quitamos espacios extremos; vacío → no hay nada que buscar
  const raw = usuario.trim();
  if (!raw) return null;

  const lower = raw.toLowerCase();

  // ---------- 1) ¿Parece un email? ----------
  if (lower.includes('@')) {
    const byEmail = await repo
      .createQueryBuilder('p') // alias 'p' = profesores
      .leftJoinAndSelect('p.taller', 't') // trae el taller asociado
      .where('LOWER(TRIM(p.email)) = :email', { email: lower })
      .getOne();
    if (byEmail) return byEmail;
  }

  // ---------- 2) ¿Coincide el RUT? ----------
  const rutNorm = normalizarRut(raw);
  if (rutNorm) {
    // Comparación en SQL para tolerar formatos distintos del mismo RUT
    // (quita puntos y guiones en la columna antes de comparar)
    const byRut = await repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.taller', 't')
      .where("REPLACE(REPLACE(UPPER(TRIM(p.rut)), '.', ''), '-', '') = :rut", {
        rut: rutNorm,
      })
      .getOne();
    if (byRut) return byRut;
  }

  // ---------- 3) Último recurso: nombre del profesor o tipo del taller ----------
  const list = await repo
    .createQueryBuilder('p')
    .leftJoinAndSelect('p.taller', 't')
    .where('LOWER(TRIM(p.nombre)) = :u', { u: lower })
    .orWhere('LOWER(TRIM(t.tipo)) = :u', { u: lower })
    .getMany();

  // Si hay varios, tomamos el primero; si ninguno, null
  return list.length > 0 ? list[0] : null;
}
