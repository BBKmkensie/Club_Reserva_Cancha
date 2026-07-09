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
exports.InscripcionSalidaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inscripcion_salida_entity_1 = require("../entities/inscripcion-salida.entity");
const inscripcion_taller_entity_1 = require("../entities/inscripcion-taller.entity");
const alumno_entity_1 = require("../entities/alumno.entity");
const salida_entity_1 = require("../entities/salida.entity");
const salida_types_1 = require("../salida/salida.types");
let InscripcionSalidaService = class InscripcionSalidaService {
    inscripcionRepository;
    inscripcionTallerRepository;
    alumnoRepository;
    salidaRepository;
    constructor(inscripcionRepository, inscripcionTallerRepository, alumnoRepository, salidaRepository) {
        this.inscripcionRepository = inscripcionRepository;
        this.inscripcionTallerRepository = inscripcionTallerRepository;
        this.alumnoRepository = alumnoRepository;
        this.salidaRepository = salidaRepository;
    }
    async talleresInscritosAlumno(alumnoId) {
        const inscripciones = await this.inscripcionTallerRepository.find({
            where: { alumnoId, estado: 'ACEPTADO' },
        });
        const ids = new Set(inscripciones.map((i) => i.tallerId));
        const alumno = await this.alumnoRepository.findOne({ where: { id: alumnoId } });
        if (alumno?.tallerId)
            ids.add(alumno.tallerId);
        return ids;
    }
    async inscribir(dto) {
        const salida = await this.salidaRepository.findOne({ where: { id: dto.salidaId } });
        if (!salida)
            throw new common_1.NotFoundException('Salida no encontrada');
        if (!salida_types_1.ESTADOS_SALIDA_VISIBLES_ESTUDIANTE.includes(salida.estado)) {
            throw new common_1.ForbiddenException('Esta salida no está disponible para inscripción');
        }
        const talleresAlumno = await this.talleresInscritosAlumno(dto.alumnoId);
        if (!talleresAlumno.size) {
            throw new common_1.ForbiddenException('Debes estar inscrito en un taller para ver o inscribirte en salidas');
        }
        if (!talleresAlumno.has(salida.tallerId)) {
            throw new common_1.ForbiddenException('Solo puedes inscribirte en salidas del taller donde estás inscrito');
        }
        const existente = await this.inscripcionRepository.findOne({
            where: { alumnoId: dto.alumnoId, salidaId: dto.salidaId },
        });
        if (existente) {
            throw new common_1.ConflictException('El alumno ya está inscrito en esta salida');
        }
        const inscripcion = this.inscripcionRepository.create({
            alumnoId: dto.alumnoId,
            salidaId: dto.salidaId,
        });
        return await this.inscripcionRepository.save(inscripcion);
    }
    async findBySalida(salidaId) {
        return await this.inscripcionRepository.find({
            where: { salidaId },
            relations: ['alumno', 'salida'],
        });
    }
    async findByAlumno(alumnoId) {
        return await this.inscripcionRepository.find({
            where: { alumnoId },
            relations: ['alumno', 'salida', 'salida.taller'],
        });
    }
    async remove(alumnoId, salidaId) {
        const inscripcion = await this.inscripcionRepository.findOne({
            where: { alumnoId, salidaId },
        });
        if (!inscripcion) {
            throw new common_1.NotFoundException('Inscripción no encontrada');
        }
        await this.inscripcionRepository.remove(inscripcion);
    }
};
exports.InscripcionSalidaService = InscripcionSalidaService;
exports.InscripcionSalidaService = InscripcionSalidaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inscripcion_salida_entity_1.InscripcionSalida)),
    __param(1, (0, typeorm_1.InjectRepository)(inscripcion_taller_entity_1.InscripcionTaller)),
    __param(2, (0, typeorm_1.InjectRepository)(alumno_entity_1.Alumno)),
    __param(3, (0, typeorm_1.InjectRepository)(salida_entity_1.Salida)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], InscripcionSalidaService);
//# sourceMappingURL=inscripcion-salida.service.js.map