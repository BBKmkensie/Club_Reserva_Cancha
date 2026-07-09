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
exports.ReportesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const alumno_entity_1 = require("../entities/alumno.entity");
const admin_entity_1 = require("../entities/admin.entity");
const inscripcion_taller_entity_1 = require("../entities/inscripcion-taller.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
let ReportesService = class ReportesService {
    alumnoRepo;
    adminRepo;
    inscripcionRepo;
    profesorRepo;
    constructor(alumnoRepo, adminRepo, inscripcionRepo, profesorRepo) {
        this.alumnoRepo = alumnoRepo;
        this.adminRepo = adminRepo;
        this.inscripcionRepo = inscripcionRepo;
        this.profesorRepo = profesorRepo;
    }
    async getPersonasInscripciones() {
        const alumnos = await this.alumnoRepo.find({ order: { nombre: 'ASC' } });
        const inscripciones = await this.inscripcionRepo.find({
            where: { estado: (0, typeorm_2.In)(['PENDIENTE', 'ACEPTADO']) },
            relations: ['alumno', 'taller'],
            order: { id: 'ASC' },
        });
        const admins = await this.adminRepo.find({ order: { nombre: 'ASC' } });
        const profesores = await this.profesorRepo.find({
            relations: ['taller'],
            order: { nombre: 'ASC' },
        });
        const idsConInscripcionActiva = new Set(inscripciones.map((i) => i.alumnoId));
        const alumnosSinTaller = alumnos
            .filter((a) => !idsConInscripcionActiva.has(a.id))
            .map((a) => ({
            id: a.id,
            nombre: a.nombre,
            rut: a.rut,
            edad: a.edad ?? null,
        }));
        const alumnosInscritos = inscripciones.map((i) => ({
            id: i.alumnoId,
            nombre: i.alumno?.nombre ?? `Alumno #${i.alumnoId}`,
            rut: i.alumno?.rut ?? '',
            taller: i.taller?.tipo ?? `Taller #${i.tallerId}`,
            tallerId: i.tallerId,
            estado: i.estado,
        }));
        const apoderados = alumnos
            .filter((a) => a.apoderadoNombre?.trim())
            .map((a) => ({
            nombre: a.apoderadoNombre.trim(),
            rut: a.apoderadoRut,
            email: a.apoderadoEmail,
            telefono: a.apoderadoTelefono,
            alumno: a.nombre,
            alumnoRut: a.rut,
        }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
        const directiva = admins
            .filter((a) => a.rol === 'directiva')
            .map((a) => ({ id: a.id, nombre: a.nombre, rut: a.rut, email: a.email }));
        const superAdmins = admins
            .filter((a) => a.rol === 'super_admin')
            .map((a) => ({ id: a.id, nombre: a.nombre, rut: a.rut, email: a.email, rol: a.rol }));
        const listaProfesores = profesores.map((p) => ({
            id: p.id,
            nombre: p.nombre,
            rut: p.rut,
            email: p.email,
            telefono: p.telefono ?? null,
            taller: p.taller?.tipo ?? `Taller #${p.tallerId}`,
            tallerId: p.tallerId,
        }));
        return {
            alumnosSinTaller,
            alumnosInscritos,
            apoderados,
            directiva,
            admins: superAdmins,
            profesores: listaProfesores,
        };
    }
};
exports.ReportesService = ReportesService;
exports.ReportesService = ReportesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(alumno_entity_1.Alumno)),
    __param(1, (0, typeorm_1.InjectRepository)(admin_entity_1.Admin)),
    __param(2, (0, typeorm_1.InjectRepository)(inscripcion_taller_entity_1.InscripcionTaller)),
    __param(3, (0, typeorm_1.InjectRepository)(profesor_entity_1.Profesor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportesService);
//# sourceMappingURL=reportes.service.js.map