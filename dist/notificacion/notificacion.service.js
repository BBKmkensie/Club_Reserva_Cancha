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
exports.NotificacionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notificacion_entity_1 = require("../entities/notificacion.entity");
const alumno_entity_1 = require("../entities/alumno.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
const admin_entity_1 = require("../entities/admin.entity");
const mail_service_1 = require("../mail/mail.service");
const notificacion_stream_service_1 = require("./notificacion-stream.service");
let NotificacionService = class NotificacionService {
    repo;
    alumnoRepo;
    profesorRepo;
    adminRepo;
    mailService;
    streamService;
    constructor(repo, alumnoRepo, profesorRepo, adminRepo, mailService, streamService) {
        this.repo = repo;
        this.alumnoRepo = alumnoRepo;
        this.profesorRepo = profesorRepo;
        this.adminRepo = adminRepo;
        this.mailService = mailService;
        this.streamService = streamService;
    }
    async crear(alumnoId, titulo, mensaje, tipo = 'inscripcion_taller') {
        const notificacion = this.repo.create({ alumnoId, titulo, mensaje, tipo });
        const guardada = await this.repo.save(notificacion);
        const alumno = await this.alumnoRepo.findOne({ where: { id: alumnoId } });
        if (alumno?.email) {
            await this.mailService.notificarAlumno(alumno.email, titulo, mensaje);
        }
        this.streamService.emitAlumno(alumnoId, guardada);
        return guardada;
    }
    async crearParaProfesor(profesorId, titulo, mensaje, tipo = 'ausencia_recurrente') {
        const notificacion = this.repo.create({ profesorId, titulo, mensaje, tipo });
        const guardada = await this.repo.save(notificacion);
        const profesor = await this.profesorRepo.findOne({ where: { id: profesorId } });
        if (profesor?.email) {
            await this.mailService.notificarProfesor(profesor.email, titulo, mensaje);
        }
        this.streamService.emitProfesor(profesorId, guardada);
        return guardada;
    }
    async crearParaAdmin(adminId, titulo, mensaje, tipo = 'ausencia_recurrente', refId, enviarCorreo = true) {
        const notificacion = this.repo.create({
            adminId,
            alumnoId: null,
            profesorId: null,
            titulo,
            mensaje,
            tipo,
            refId: refId ?? null,
        });
        const guardada = await this.repo.save(notificacion);
        const admin = await this.adminRepo.findOne({ where: { id: adminId } });
        if (enviarCorreo && admin?.email) {
            await this.mailService.notificarAdmin(admin.email, titulo, mensaje);
        }
        this.streamService.emitAdmin(adminId, guardada);
        return guardada;
    }
    async notificarCoordinadoresPropuestaApoderado(params) {
        const titulo = params.esActividadLibre
            ? 'Nueva propuesta de actividad (fuera de catálogo)'
            : 'Nueva propuesta de actividad';
        const horarioTxt = params.horarioPropuesto ? ` Horario: ${params.horarioPropuesto}.` : '';
        const tipoTxt = params.esActividadLibre ? ' una actividad nueva ' : ' ';
        const mensaje = `${params.apoderadoNombre} propuso${tipoTxt}"${params.tallerNombre}" para ${params.alumnoNombre}.${horarioTxt} Revisa la bandeja de propuestas.`;
        const coordinadores = await this.adminRepo.find({
            where: { rol: (0, typeorm_2.In)(['super_admin', 'directiva']) },
        });
        for (const admin of coordinadores) {
            await this.crearParaAdmin(admin.id, titulo, mensaje, 'propuesta_actividad', params.propuestaId, false);
            if (admin.email) {
                await this.mailService.nuevaPropuestaDirectiva(admin.email, admin.nombre, {
                    apoderadoNombre: params.apoderadoNombre,
                    alumnoNombre: params.alumnoNombre,
                    alumnoRut: params.alumnoRut,
                    tallerNombre: params.tallerNombre,
                    horarioPropuesto: params.horarioPropuesto,
                    mensajeApoderado: params.mensajeApoderado,
                    propuestaId: params.propuestaId,
                    actividadDescripcion: params.actividadDescripcion,
                    esActividadLibre: params.esActividadLibre,
                });
            }
        }
    }
    async notificarCoordinadoresAusencia(titulo, mensaje, tipo = 'ausencia_recurrente') {
        await this.notificarCoordinadores(titulo, mensaje, tipo);
    }
    async notificarCoordinadores(titulo, mensaje, tipo = 'sistema', refId) {
        const coordinadores = await this.adminRepo.find({
            where: { rol: (0, typeorm_2.In)(['super_admin', 'directiva']) },
        });
        for (const admin of coordinadores) {
            await this.crearParaAdmin(admin.id, titulo, mensaje, tipo, refId);
        }
    }
    async findByAlumno(alumnoId) {
        return await this.repo.find({
            where: { alumnoId },
            order: { createdAt: 'DESC' },
        });
    }
    async findByProfesor(profesorId) {
        return await this.repo.find({
            where: { profesorId },
            order: { createdAt: 'DESC' },
        });
    }
    async findByAdmin(adminId) {
        return await this.repo.find({
            where: { adminId },
            order: { createdAt: 'DESC' },
        });
    }
    async contarNoLeidas(alumnoId) {
        return await this.repo.count({ where: { alumnoId, leida: false } });
    }
    async contarNoLeidasProfesor(profesorId) {
        return await this.repo.count({ where: { profesorId, leida: false } });
    }
    async contarNoLeidasAdmin(adminId) {
        return await this.repo.count({ where: { adminId, leida: false } });
    }
    async marcarLeida(id, alumnoId) {
        const notificacion = await this.repo.findOne({ where: { id, alumnoId } });
        if (!notificacion) {
            throw new common_1.NotFoundException('Notificación no encontrada');
        }
        notificacion.leida = true;
        return await this.repo.save(notificacion);
    }
    async marcarTodasLeidas(alumnoId) {
        await this.repo.update({ alumnoId, leida: false }, { leida: true });
    }
    async marcarLeidaAdmin(id, adminId) {
        const notificacion = await this.repo.findOne({ where: { id, adminId } });
        if (!notificacion) {
            throw new common_1.NotFoundException('Notificación no encontrada');
        }
        notificacion.leida = true;
        return await this.repo.save(notificacion);
    }
    async marcarTodasLeidasAdmin(adminId) {
        await this.repo.update({ adminId, leida: false }, { leida: true });
    }
    async marcarLeidaProfesor(id, profesorId) {
        const notificacion = await this.repo.findOne({ where: { id, profesorId } });
        if (!notificacion) {
            throw new common_1.NotFoundException('Notificación no encontrada');
        }
        notificacion.leida = true;
        return await this.repo.save(notificacion);
    }
    async marcarTodasLeidasProfesor(profesorId) {
        await this.repo.update({ profesorId, leida: false }, { leida: true });
    }
    async eliminarAlumno(id, alumnoId) {
        const notificacion = await this.repo.findOne({ where: { id, alumnoId } });
        if (!notificacion)
            throw new common_1.NotFoundException('Notificación no encontrada');
        await this.repo.remove(notificacion);
    }
    async eliminarProfesor(id, profesorId) {
        const notificacion = await this.repo.findOne({ where: { id, profesorId } });
        if (!notificacion)
            throw new common_1.NotFoundException('Notificación no encontrada');
        await this.repo.remove(notificacion);
    }
    async eliminarAdmin(id, adminId) {
        const notificacion = await this.repo.findOne({ where: { id, adminId } });
        if (!notificacion)
            throw new common_1.NotFoundException('Notificación no encontrada');
        await this.repo.remove(notificacion);
    }
};
exports.NotificacionService = NotificacionService;
exports.NotificacionService = NotificacionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notificacion_entity_1.Notificacion)),
    __param(1, (0, typeorm_1.InjectRepository)(alumno_entity_1.Alumno)),
    __param(2, (0, typeorm_1.InjectRepository)(profesor_entity_1.Profesor)),
    __param(3, (0, typeorm_1.InjectRepository)(admin_entity_1.Admin)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        mail_service_1.MailService,
        notificacion_stream_service_1.NotificacionStreamService])
], NotificacionService);
//# sourceMappingURL=notificacion.service.js.map