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
exports.FichaAlumnoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ficha_alumno_taller_entity_1 = require("../entities/ficha-alumno-taller.entity");
const alumno_entity_1 = require("../entities/alumno.entity");
const inscripcion_taller_entity_1 = require("../entities/inscripcion-taller.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
let FichaAlumnoService = class FichaAlumnoService {
    fichaRepo;
    alumnoRepo;
    inscripcionRepo;
    profesorRepo;
    constructor(fichaRepo, alumnoRepo, inscripcionRepo, profesorRepo) {
        this.fichaRepo = fichaRepo;
        this.alumnoRepo = alumnoRepo;
        this.inscripcionRepo = inscripcionRepo;
        this.profesorRepo = profesorRepo;
    }
    async listarPorTaller(tallerId, opts) {
        const { soloInscritos = false, esCoordinacion = false, profesorId } = opts;
        if (!esCoordinacion && profesorId) {
            const profesor = await this.profesorRepo.findOne({ where: { id: profesorId } });
            if (!profesor || profesor.tallerId !== tallerId) {
                throw new common_1.ForbiddenException('Solo puedes ver fichas de alumnos inscritos en tu taller');
            }
            return this.listarInscritosAceptados(tallerId);
        }
        if (soloInscritos) {
            return this.listarInscritosAceptados(tallerId);
        }
        return this.listarTodosAlumnosConFicha(tallerId);
    }
    async listarTodosAlumnosConFicha(tallerId) {
        const alumnos = await this.alumnoRepo.find({ order: { nombre: 'ASC' } });
        const fichas = await this.fichaRepo.find({ where: { tallerId }, relations: ['alumno'] });
        const inscripciones = await this.inscripcionRepo.find({ where: { tallerId } });
        const fichaMap = new Map(fichas.map((f) => [f.alumnoId, f]));
        const inscMap = new Map(inscripciones.map((i) => [i.alumnoId, i]));
        return alumnos.map((a) => {
            const f = fichaMap.get(a.id);
            const ins = inscMap.get(a.id);
            return this.toItem(a, tallerId, f, ins);
        });
    }
    async listarInscritosAceptados(tallerId) {
        const inscripciones = await this.inscripcionRepo.find({
            where: { tallerId, estado: 'ACEPTADO' },
            relations: ['alumno'],
            order: { createdAt: 'ASC' },
        });
        const fichas = await this.fichaRepo.find({ where: { tallerId } });
        const fichaMap = new Map(fichas.map((f) => [f.alumnoId, f]));
        return inscripciones
            .filter((i) => i.alumno)
            .map((ins) => {
            const f = fichaMap.get(ins.alumnoId);
            return this.toItem(ins.alumno, tallerId, f, ins);
        });
    }
    toItem(alumno, tallerId, ficha, inscripcion) {
        const inscrito = inscripcion?.estado === 'ACEPTADO';
        return {
            alumnoId: alumno.id,
            nombre: alumno.nombre,
            rut: alumno.rut,
            tallerId,
            inscrito,
            estadoInscripcion: inscripcion?.estado,
            altura: ficha?.altura ?? inscripcion?.altura ?? null,
            peso: ficha?.peso ?? inscripcion?.peso ?? null,
            porcentajeGrasa: ficha?.porcentajeGrasa ?? inscripcion?.porcentajeGrasa ?? null,
            sedentario: ficha?.sedentario ?? inscripcion?.sedentario ?? null,
        };
    }
    async obtener(alumnoId, tallerId) {
        const alumno = await this.alumnoRepo.findOne({ where: { id: alumnoId } });
        if (!alumno)
            throw new common_1.NotFoundException('Alumno no encontrado');
        const ficha = await this.fichaRepo.findOne({ where: { alumnoId, tallerId } });
        const inscripcion = await this.inscripcionRepo.findOne({ where: { alumnoId, tallerId } });
        return this.toItem(alumno, tallerId, ficha ?? undefined, inscripcion ?? undefined);
    }
    async guardar(alumnoId, tallerId, dto) {
        let ficha = await this.fichaRepo.findOne({ where: { alumnoId, tallerId } });
        if (!ficha) {
            ficha = this.fichaRepo.create({ alumnoId, tallerId });
        }
        if (dto.altura != null)
            ficha.altura = dto.altura;
        if (dto.peso != null)
            ficha.peso = dto.peso;
        if (dto.porcentajeGrasa != null)
            ficha.porcentajeGrasa = dto.porcentajeGrasa;
        if (dto.sedentario != null)
            ficha.sedentario = dto.sedentario;
        return this.fichaRepo.save(ficha);
    }
};
exports.FichaAlumnoService = FichaAlumnoService;
exports.FichaAlumnoService = FichaAlumnoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ficha_alumno_taller_entity_1.FichaAlumnoTaller)),
    __param(1, (0, typeorm_1.InjectRepository)(alumno_entity_1.Alumno)),
    __param(2, (0, typeorm_1.InjectRepository)(inscripcion_taller_entity_1.InscripcionTaller)),
    __param(3, (0, typeorm_1.InjectRepository)(profesor_entity_1.Profesor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FichaAlumnoService);
//# sourceMappingURL=ficha-alumno.service.js.map