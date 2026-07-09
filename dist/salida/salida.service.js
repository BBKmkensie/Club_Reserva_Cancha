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
exports.SalidaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const salida_entity_1 = require("../entities/salida.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
const taller_entity_1 = require("../entities/taller.entity");
const alumno_entity_1 = require("../entities/alumno.entity");
const inscripcion_taller_entity_1 = require("../entities/inscripcion-taller.entity");
const salida_types_1 = require("./salida.types");
const cancha_constants_1 = require("../reserva/cancha.constants");
let SalidaService = class SalidaService {
    salidaRepository;
    profesorRepository;
    tallerRepository;
    alumnoRepository;
    inscripcionTallerRepository;
    constructor(salidaRepository, profesorRepository, tallerRepository, alumnoRepository, inscripcionTallerRepository) {
        this.salidaRepository = salidaRepository;
        this.profesorRepository = profesorRepository;
        this.tallerRepository = tallerRepository;
        this.alumnoRepository = alumnoRepository;
        this.inscripcionTallerRepository = inscripcionTallerRepository;
    }
    relaciones = ['taller', 'admin', 'profesor'];
    async validarTallerYProfesor(tallerId, profesorId) {
        const taller = await this.tallerRepository.findOne({ where: { id: tallerId } });
        if (!taller)
            throw new common_1.NotFoundException('Taller no encontrado');
        const profesor = await this.profesorRepository.findOne({ where: { id: profesorId } });
        if (!profesor)
            throw new common_1.NotFoundException('Profesor no encontrado');
    }
    async asignarDirectiva(dto) {
        await this.validarTallerYProfesor(dto.tallerId, dto.profesorId);
        const salida = this.salidaRepository.create({
            destino: dto.destino,
            fecha: (0, cancha_constants_1.fechaLocal)(dto.fecha),
            hora: dto.hora ?? undefined,
            descripcion: dto.descripcion ?? undefined,
            tallerId: dto.tallerId,
            profesorId: dto.profesorId,
            adminId: dto.adminId ?? undefined,
            origen: 'ASIGNACION_DIRECTIVA',
            estado: 'PENDIENTE_PROFESOR',
        });
        return this.salidaRepository.save(salida);
    }
    async proponerProfesor(dto) {
        await this.validarTallerYProfesor(dto.tallerId, dto.profesorId);
        const salida = this.salidaRepository.create({
            destino: dto.destino,
            fecha: (0, cancha_constants_1.fechaLocal)(dto.fecha),
            hora: dto.hora ?? undefined,
            descripcion: dto.descripcion ?? undefined,
            tallerId: dto.tallerId,
            profesorId: dto.profesorId,
            adminId: undefined,
            origen: 'PROPUESTA_PROFESOR',
            estado: 'PENDIENTE_DIRECTIVA',
        });
        return this.salidaRepository.save(salida);
    }
    async responder(id, dto, actor, actorId) {
        const salida = await this.findOne(id);
        if (salida.estado === 'PENDIENTE_PROFESOR') {
            if (actor !== 'profesor')
                throw new common_1.ForbiddenException('Solo el profesor asignado puede responder');
            if (actorId && salida.profesorId !== actorId) {
                throw new common_1.ForbiddenException('No eres el profesor asignado a esta salida');
            }
        }
        else if (salida.estado === 'PENDIENTE_DIRECTIVA') {
            if (actor !== 'directiva')
                throw new common_1.ForbiddenException('Solo la directiva puede responder esta propuesta');
        }
        else {
            throw new common_1.BadRequestException('Esta salida no está pendiente de aprobación');
        }
        if (dto.acepta) {
            salida.estado = 'PUBLICADA';
            salida.motivoRechazo = null;
        }
        else {
            salida.estado = 'RECHAZADA';
            salida.motivoRechazo = dto.motivo?.trim() || 'Rechazada';
        }
        salida.fechaRespuesta = new Date();
        return this.salidaRepository.save(salida);
    }
    async abrir(id, profesorId, dto) {
        const salida = await this.findOne(id);
        if (salida.profesorId !== profesorId) {
            throw new common_1.ForbiddenException('Solo el profesor responsable puede abrir esta salida');
        }
        if (salida.estado !== 'PUBLICADA') {
            throw new common_1.BadRequestException('Solo se pueden abrir salidas publicadas y aceptadas');
        }
        salida.estado = 'EN_CURSO';
        salida.comentarioApertura = dto.comentario?.trim() || null;
        salida.fechaApertura = new Date();
        return this.salidaRepository.save(salida);
    }
    async cerrar(id, profesorId, dto) {
        const salida = await this.findOne(id);
        if (salida.profesorId !== profesorId) {
            throw new common_1.ForbiddenException('Solo el profesor responsable puede cerrar esta salida');
        }
        if (salida.estado !== 'EN_CURSO') {
            throw new common_1.BadRequestException('Debe abrir la salida antes de cerrarla');
        }
        salida.estado = 'CERRADA';
        salida.resultado = dto.resultado;
        salida.comentarioCierre = dto.comentario.trim();
        salida.fechaCierre = new Date();
        return this.salidaRepository.save(salida);
    }
    async create(createSalidaDto) {
        const salida = this.salidaRepository.create({
            destino: createSalidaDto.destino,
            fecha: (0, cancha_constants_1.fechaLocal)(createSalidaDto.fecha),
            hora: createSalidaDto.hora ?? undefined,
            descripcion: createSalidaDto.descripcion ?? undefined,
            tallerId: createSalidaDto.tallerId,
            adminId: createSalidaDto.adminId ?? undefined,
            profesorId: createSalidaDto.profesorId ?? undefined,
            origen: createSalidaDto.adminId ? 'ASIGNACION_DIRECTIVA' : 'PROPUESTA_PROFESOR',
            estado: 'PUBLICADA',
        });
        return this.salidaRepository.save(salida);
    }
    async findAll() {
        return this.salidaRepository.find({
            relations: [...this.relaciones],
            order: { fecha: 'DESC', hora: 'ASC' },
        });
    }
    async findPublicadas(tallerId) {
        const where = { estado: (0, typeorm_2.In)(salida_types_1.ESTADOS_SALIDA_VISIBLES_ESTUDIANTE) };
        if (tallerId)
            where.tallerId = tallerId;
        return this.salidaRepository.find({
            where,
            relations: [...this.relaciones],
            order: { fecha: 'ASC', hora: 'ASC' },
        });
    }
    async findPublicadasParaAlumno(alumnoId) {
        const tallerIds = await this.talleresInscritosAlumno(alumnoId);
        if (!tallerIds.length)
            return [];
        return this.salidaRepository.find({
            where: {
                estado: (0, typeorm_2.In)(salida_types_1.ESTADOS_SALIDA_VISIBLES_ESTUDIANTE),
                tallerId: (0, typeorm_2.In)(tallerIds),
            },
            relations: [...this.relaciones],
            order: { fecha: 'ASC', hora: 'ASC' },
        });
    }
    async talleresInscritosAlumno(alumnoId) {
        const inscripciones = await this.inscripcionTallerRepository.find({
            where: { alumnoId, estado: 'ACEPTADO' },
        });
        const ids = new Set(inscripciones.map((i) => i.tallerId));
        const alumno = await this.alumnoRepository.findOne({ where: { id: alumnoId } });
        if (alumno?.tallerId)
            ids.add(alumno.tallerId);
        return [...ids];
    }
    async alumnoPuedeVerSalidas(alumnoId) {
        const ids = await this.talleresInscritosAlumno(alumnoId);
        return ids.length > 0;
    }
    async findPendientesProfesor(profesorId) {
        return this.salidaRepository.find({
            where: { profesorId, estado: 'PENDIENTE_PROFESOR' },
            relations: [...this.relaciones],
            order: { fecha: 'ASC' },
        });
    }
    async findPendientesDirectiva() {
        return this.salidaRepository.find({
            where: { estado: 'PENDIENTE_DIRECTIVA' },
            relations: [...this.relaciones],
            order: { fecha: 'ASC' },
        });
    }
    async findByProfesor(profesorId) {
        return this.salidaRepository.find({
            where: { profesorId },
            relations: [...this.relaciones],
            order: { fecha: 'DESC' },
        });
    }
    async findOne(id) {
        const salida = await this.salidaRepository.findOne({
            where: { id },
            relations: [...this.relaciones],
        });
        if (!salida)
            throw new common_1.NotFoundException(`Salida con ID ${id} no encontrada`);
        return salida;
    }
    async findByTaller(tallerId) {
        return this.salidaRepository.find({
            where: { tallerId },
            relations: [...this.relaciones],
            order: { fecha: 'DESC' },
        });
    }
    async update(id, updateSalidaDto) {
        const salida = await this.findOne(id);
        if (updateSalidaDto.fecha) {
            salida.fecha = (0, cancha_constants_1.fechaLocal)(updateSalidaDto.fecha);
        }
        Object.assign(salida, {
            destino: updateSalidaDto.destino ?? salida.destino,
            hora: updateSalidaDto.hora ?? salida.hora,
            descripcion: updateSalidaDto.descripcion ?? salida.descripcion,
            tallerId: updateSalidaDto.tallerId ?? salida.tallerId,
        });
        return this.salidaRepository.save(salida);
    }
    async remove(id) {
        const salida = await this.findOne(id);
        await this.salidaRepository.remove(salida);
    }
    etiquetaFlujo(s) {
        if (s.estado === 'RECHAZADA')
            return 'Rechazada';
        if (s.estado === 'PENDIENTE_PROFESOR') {
            return 'Asignada por directiva · pendiente de aceptación del profesor';
        }
        if (s.estado === 'PENDIENTE_DIRECTIVA') {
            return `Propuesta por ${s.profesor?.nombre ?? 'profesor'} · pendiente de directiva`;
        }
        if (s.origen === 'ASIGNACION_DIRECTIVA') {
            return `Asignada por directiva · aceptada por ${s.profesor?.nombre ?? 'profesor'}`;
        }
        return `Propuesta por ${s.profesor?.nombre ?? 'profesor'} · aceptada por directiva`;
    }
};
exports.SalidaService = SalidaService;
exports.SalidaService = SalidaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(salida_entity_1.Salida)),
    __param(1, (0, typeorm_1.InjectRepository)(profesor_entity_1.Profesor)),
    __param(2, (0, typeorm_1.InjectRepository)(taller_entity_1.Taller)),
    __param(3, (0, typeorm_1.InjectRepository)(alumno_entity_1.Alumno)),
    __param(4, (0, typeorm_1.InjectRepository)(inscripcion_taller_entity_1.InscripcionTaller)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SalidaService);
//# sourceMappingURL=salida.service.js.map