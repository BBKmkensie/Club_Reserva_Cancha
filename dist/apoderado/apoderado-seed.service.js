"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApoderadoSeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const alumno_entity_1 = require("../entities/alumno.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
const apoderado_ruts_pool_1 = require("../common/apoderado-ruts.pool");
const apoderado_nombres_pool_1 = require("../common/apoderado-nombres.pool");
const password_util_1 = require("../common/password.util");
let ApoderadoSeedService = class ApoderadoSeedService {
    alumnoRepo;
    profesorRepo;
    constructor(alumnoRepo, profesorRepo) {
        this.alumnoRepo = alumnoRepo;
        this.profesorRepo = profesorRepo;
    }
    async seedMissingApoderados() {
        const usados = new Set();
        const alumnos = await this.alumnoRepo.find();
        for (const a of alumnos) {
            if (a.rut)
                usados.add(a.rut);
            if (a.apoderadoRut)
                usados.add(a.apoderadoRut);
        }
        const profesores = await this.profesorRepo.find();
        for (const p of profesores) {
            if (p.rut)
                usados.add(p.rut);
        }
        const disponibles = apoderado_ruts_pool_1.APODERADO_RUT_POOL.filter((r) => !usados.has(r));
        let poolIdx = 0;
        let nombreIdx = 0;
        const emailsUsados = new Set();
        for (const a of alumnos) {
            if (a.apoderadoEmail?.trim() && !(0, apoderado_nombres_pool_1.esEmailApoderadoGenerico)(a.apoderadoEmail)) {
                emailsUsados.add(a.apoderadoEmail.trim().toLowerCase());
            }
        }
        const detalle = [];
        let actualizados = 0;
        let omitidos = 0;
        const { hash, salt } = (0, password_util_1.hashPassword)('12345');
        for (const alumno of alumnos) {
            const incompleto = !alumno.apoderadoNombre?.trim() ||
                !alumno.apoderadoEmail?.trim() ||
                !alumno.apoderadoRut?.trim();
            if (!incompleto) {
                omitidos++;
                continue;
            }
            if (poolIdx >= disponibles.length) {
                break;
            }
            const rut = disponibles[poolIdx++];
            usados.add(rut);
            if (!alumno.apoderadoNombre?.trim()) {
                alumno.apoderadoNombre = this.nextNombre(nombreIdx++);
            }
            if (!alumno.apoderadoEmail?.trim()) {
                alumno.apoderadoEmail = (0, apoderado_nombres_pool_1.emailDesdeNombreApoderado)(alumno.apoderadoNombre, emailsUsados);
            }
            if (!alumno.apoderadoRut?.trim()) {
                alumno.apoderadoRut = rut;
            }
            if (!alumno.apoderadoPasswordHash || !alumno.apoderadoPasswordSalt) {
                alumno.apoderadoPasswordHash = hash;
                alumno.apoderadoPasswordSalt = salt;
            }
            await this.alumnoRepo.save(alumno);
            actualizados++;
            detalle.push({
                alumnoId: alumno.id,
                nombre: alumno.nombre,
                apoderadoNombre: alumno.apoderadoNombre,
                apoderadoRut: alumno.apoderadoRut,
                apoderadoEmail: alumno.apoderadoEmail,
            });
        }
        return {
            actualizados,
            omitidos,
            rutPoolAgotado: poolIdx >= disponibles.length && alumnos.some((a) => !a.apoderadoNombre?.trim() ||
                !a.apoderadoEmail?.trim() ||
                !a.apoderadoRut?.trim()),
            detalle,
        };
    }
    async actualizarNombresApoderados() {
        const alumnos = await this.alumnoRepo.find({ order: { id: 'ASC' } });
        const emailsUsados = new Set();
        for (const a of alumnos) {
            if (a.apoderadoEmail?.trim() && !(0, apoderado_nombres_pool_1.esEmailApoderadoGenerico)(a.apoderadoEmail)) {
                emailsUsados.add(a.apoderadoEmail.trim().toLowerCase());
            }
        }
        let nombreIdx = 0;
        const detalle = [];
        let actualizados = 0;
        let omitidos = 0;
        for (const alumno of alumnos) {
            const nombreGenerico = (0, apoderado_nombres_pool_1.esNombreApoderadoGenerico)(alumno.apoderadoNombre);
            const emailGenerico = (0, apoderado_nombres_pool_1.esEmailApoderadoGenerico)(alumno.apoderadoEmail);
            if (!nombreGenerico && !emailGenerico) {
                omitidos++;
                continue;
            }
            if (nombreGenerico) {
                alumno.apoderadoNombre = this.nextNombre(nombreIdx++);
            }
            if (emailGenerico) {
                alumno.apoderadoEmail = (0, apoderado_nombres_pool_1.emailDesdeNombreApoderado)(alumno.apoderadoNombre, emailsUsados);
            }
            await this.alumnoRepo.save(alumno);
            actualizados++;
            detalle.push({
                alumnoId: alumno.id,
                nombre: alumno.nombre,
                apoderadoNombre: alumno.apoderadoNombre,
                apoderadoRut: alumno.apoderadoRut ?? '',
                apoderadoEmail: alumno.apoderadoEmail,
            });
        }
        return {
            actualizados,
            omitidos,
            rutPoolAgotado: false,
            detalle,
        };
    }
    nextNombre(index) {
        return apoderado_nombres_pool_1.APODERADO_NOMBRES_POOL[index % apoderado_nombres_pool_1.APODERADO_NOMBRES_POOL.length];
    }
    async migrarEmailsGmail() {
        const alumnos = await this.alumnoRepo.find({ order: { id: 'ASC' } });
        const emailsUsados = new Set();
        for (const a of alumnos) {
            const e = a.apoderadoEmail?.trim().toLowerCase();
            if (e && !/@email\.com$/i.test(e)) {
                emailsUsados.add(e);
            }
        }
        const detalle = [];
        let actualizados = 0;
        let omitidos = 0;
        for (const alumno of alumnos) {
            const email = alumno.apoderadoEmail?.trim();
            if (!email || !/@email\.com$/i.test(email)) {
                omitidos++;
                continue;
            }
            const local = email.replace(/@email\.com$/i, '');
            let nuevo = `${local}@gmail.com`.toLowerCase();
            let n = 2;
            while (emailsUsados.has(nuevo)) {
                nuevo = `${local}${n}@gmail.com`;
                n++;
            }
            emailsUsados.add(nuevo);
            alumno.apoderadoEmail = nuevo;
            await this.alumnoRepo.save(alumno);
            actualizados++;
            detalle.push({
                alumnoId: alumno.id,
                nombre: alumno.nombre,
                apoderadoNombre: alumno.apoderadoNombre ?? '',
                apoderadoRut: alumno.apoderadoRut ?? '',
                apoderadoEmail: nuevo,
            });
        }
        return { actualizados, omitidos, rutPoolAgotado: false, detalle };
    }
};
exports.ApoderadoSeedService = ApoderadoSeedService;
exports.ApoderadoSeedService = ApoderadoSeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(alumno_entity_1.Alumno)),
    __param(1, (0, typeorm_1.InjectRepository)(profesor_entity_1.Profesor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ApoderadoSeedService);
//# sourceMappingURL=apoderado-seed.service.js.map