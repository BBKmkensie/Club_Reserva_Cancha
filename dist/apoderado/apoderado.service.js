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
exports.ApoderadoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const alumno_entity_1 = require("../entities/alumno.entity");
const inscripcion_taller_entity_1 = require("../entities/inscripcion-taller.entity");
const sesion_asistencia_entity_1 = require("../entities/sesion-asistencia.entity");
let ApoderadoService = class ApoderadoService {
    alumnoRepo;
    inscripcionRepo;
    sesionRepo;
    constructor(alumnoRepo, inscripcionRepo, sesionRepo) {
        this.alumnoRepo = alumnoRepo;
        this.inscripcionRepo = inscripcionRepo;
        this.sesionRepo = sesionRepo;
    }
    assertApoderado(user) {
        if (user.tipo !== 'apoderado') {
            throw new common_1.ForbiddenException('Solo apoderados pueden acceder a este recurso');
        }
        return user.sub;
    }
    async getResumen(alumnoId) {
        const alumno = await this.alumnoRepo.findOne({
            where: { id: alumnoId },
            relations: ['taller'],
        });
        if (!alumno)
            throw new common_1.NotFoundException('Alumno no encontrado');
        const inscripciones = await this.inscripcionRepo.find({
            where: { alumnoId, estado: 'ACEPTADO' },
            relations: ['taller'],
            order: { id: 'DESC' },
        });
        const tallerActivo = inscripciones[0]?.taller ??
            (alumno.taller ? { id: alumno.taller.id, tipo: alumno.taller.tipo } : null);
        const tallerId = tallerActivo?.id ?? alumno.tallerId;
        let asistencia = null;
        if (tallerId) {
            asistencia = await this.getAsistenciaPorTaller(alumnoId, tallerId);
        }
        return {
            apoderado: {
                nombre: alumno.apoderadoNombre,
                rut: alumno.apoderadoRut,
                email: alumno.apoderadoEmail,
                telefono: alumno.apoderadoTelefono,
            },
            hijo: {
                id: alumno.id,
                nombre: alumno.nombre,
                rut: alumno.rut,
            },
            tallerInscrito: tallerActivo
                ? {
                    id: tallerActivo.id,
                    nombre: tallerActivo.tipo ?? 'Taller',
                    horario: this.formatHorarioTaller(tallerActivo),
                }
                : null,
            inscripciones: inscripciones.map((i) => ({
                tallerId: i.tallerId,
                taller: i.taller?.tipo,
                estado: i.estado,
            })),
            asistencia,
        };
    }
    async getAsistenciaPorTaller(alumnoId, tallerId) {
        const sesiones = await this.sesionRepo.find({
            where: { tallerId, estado: 'CERRADA' },
            relations: ['registros', 'taller'],
            order: { fecha: 'DESC' },
        });
        let presentes = 0;
        let ausentes = 0;
        let tardes = 0;
        const registros = sesiones.map((sesion) => {
            const reg = sesion.registros?.find((r) => r.alumnoId === alumnoId);
            const estado = reg?.estado ?? 'SIN_REGISTRO';
            if (estado === 'PRESENTE')
                presentes++;
            else if (estado === 'AUSENTE')
                ausentes++;
            else if (estado === 'TARDE')
                tardes++;
            return {
                fecha: sesion.fecha,
                estado,
                observacion: reg?.observacion ?? null,
                taller: sesion.taller?.tipo ?? null,
            };
        });
        const total = sesiones.length;
        const porcentaje = total > 0 ? Math.round((presentes / total) * 100) : 0;
        return {
            tallerId,
            resumen: { presentes, ausentes, tardes, totalSesiones: total, porcentaje },
            registros,
        };
    }
    formatHorarioTaller(taller) {
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        if (taller.diaSemana == null || !taller.horaInicio || !taller.horaFin)
            return null;
        const hi = taller.horaInicio.length >= 5 ? taller.horaInicio.slice(0, 5) : taller.horaInicio;
        const hf = taller.horaFin.length >= 5 ? taller.horaFin.slice(0, 5) : taller.horaFin;
        return `${dias[taller.diaSemana]} ${hi} - ${hf}`;
    }
};
exports.ApoderadoService = ApoderadoService;
exports.ApoderadoService = ApoderadoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(alumno_entity_1.Alumno)),
    __param(1, (0, typeorm_1.InjectRepository)(inscripcion_taller_entity_1.InscripcionTaller)),
    __param(2, (0, typeorm_1.InjectRepository)(sesion_asistencia_entity_1.SesionAsistencia)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ApoderadoService);
//# sourceMappingURL=apoderado.service.js.map