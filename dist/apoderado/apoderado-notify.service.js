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
var ApoderadoNotifyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApoderadoNotifyService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inscripcion_taller_entity_1 = require("../entities/inscripcion-taller.entity");
const registro_asistencia_entity_1 = require("../entities/registro-asistencia.entity");
const mail_service_1 = require("../mail/mail.service");
let ApoderadoNotifyService = ApoderadoNotifyService_1 = class ApoderadoNotifyService {
    inscripcionRepo;
    registroRepo;
    mailService;
    logger = new common_1.Logger(ApoderadoNotifyService_1.name);
    delayMs = 3500;
    constructor(inscripcionRepo, registroRepo, mailService) {
        this.inscripcionRepo = inscripcionRepo;
        this.registroRepo = registroRepo;
        this.mailService = mailService;
    }
    async notifyInscripcionesYAsistencia() {
        const result = {
            inscripcionesEnviadas: 0,
            asistenciasEnviadas: 0,
            sinEmail: 0,
            errores: 0,
            detalle: [],
        };
        const inscripciones = await this.inscripcionRepo.find({
            where: { estado: 'ACEPTADO' },
            relations: ['alumno', 'taller'],
        });
        const enviadosInscripcion = new Set();
        for (const insc of inscripciones) {
            const alumno = insc.alumno;
            const email = alumno?.apoderadoEmail?.trim();
            if (!email) {
                result.sinEmail++;
                continue;
            }
            const key = `${insc.alumnoId}-${insc.tallerId}`;
            if (enviadosInscripcion.has(key))
                continue;
            enviadosInscripcion.add(key);
            const tallerNombre = insc.taller?.tipo ?? 'Taller';
            const ok = await this.mailService.inscripcionTallerApoderado(email, alumno.nombre, tallerNombre, alumno.apoderadoNombre, this.formatHorario(insc.taller));
            await this.sleep(this.delayMs);
            if (ok) {
                result.inscripcionesEnviadas++;
                result.detalle.push({
                    tipo: 'inscripcion',
                    alumno: alumno.nombre,
                    email,
                    taller: tallerNombre,
                });
            }
            else {
                result.errores++;
            }
        }
        const registros = await this.registroRepo.find({
            relations: ['alumno', 'sesion', 'sesion.taller'],
            order: { id: 'DESC' },
        });
        const ultimoPorAlumno = new Map();
        for (const reg of registros) {
            if (reg.sesion?.estado !== 'CERRADA')
                continue;
            if (!ultimoPorAlumno.has(reg.alumnoId)) {
                ultimoPorAlumno.set(reg.alumnoId, reg);
            }
        }
        for (const reg of ultimoPorAlumno.values()) {
            const alumno = reg.alumno;
            const email = alumno?.apoderadoEmail?.trim();
            if (!email) {
                result.sinEmail++;
                continue;
            }
            const tallerNombre = reg.sesion?.taller?.tipo ?? 'Taller';
            const ok = await this.mailService.asistenciaSesionApoderado(email, alumno.nombre, tallerNombre, reg.sesion.fecha, reg.estado, alumno.apoderadoNombre, reg.observacion);
            await this.sleep(this.delayMs);
            if (ok) {
                result.asistenciasEnviadas++;
                result.detalle.push({
                    tipo: 'asistencia',
                    alumno: alumno.nombre,
                    email,
                    taller: `${tallerNombre} (${reg.sesion.fecha})`,
                });
            }
            else {
                result.errores++;
            }
        }
        this.logger.log(`Correos apoderados: ${result.inscripcionesEnviadas} inscripción, ${result.asistenciasEnviadas} asistencia`);
        return result;
    }
    formatHorario(taller) {
        if (taller?.diaSemana == null || !taller.horaInicio || !taller.horaFin)
            return null;
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const hi = taller.horaInicio.slice(0, 5);
        const hf = taller.horaFin.slice(0, 5);
        return `${dias[taller.diaSemana]} ${hi} - ${hf}`;
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.ApoderadoNotifyService = ApoderadoNotifyService;
exports.ApoderadoNotifyService = ApoderadoNotifyService = ApoderadoNotifyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inscripcion_taller_entity_1.InscripcionTaller)),
    __param(1, (0, typeorm_1.InjectRepository)(registro_asistencia_entity_1.RegistroAsistencia)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        mail_service_1.MailService])
], ApoderadoNotifyService);
//# sourceMappingURL=apoderado-notify.service.js.map