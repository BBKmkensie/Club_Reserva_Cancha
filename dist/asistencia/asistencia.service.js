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
exports.AsistenciaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sesion_asistencia_entity_1 = require("../entities/sesion-asistencia.entity");
const registro_asistencia_entity_1 = require("../entities/registro-asistencia.entity");
const inscripcion_taller_entity_1 = require("../entities/inscripcion-taller.entity");
const taller_entity_1 = require("../entities/taller.entity");
const alumno_entity_1 = require("../entities/alumno.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
const alerta_ausencia_entity_1 = require("../entities/alerta-ausencia.entity");
const notificacion_service_1 = require("../notificacion/notificacion.service");
const mail_service_1 = require("../mail/mail.service");
let AsistenciaService = class AsistenciaService {
    sesionRepo;
    registroRepo;
    inscripcionRepo;
    tallerRepo;
    alumnoRepo;
    profesorRepo;
    alertaRepo;
    notificacionService;
    mailService;
    constructor(sesionRepo, registroRepo, inscripcionRepo, tallerRepo, alumnoRepo, profesorRepo, alertaRepo, notificacionService, mailService) {
        this.sesionRepo = sesionRepo;
        this.registroRepo = registroRepo;
        this.inscripcionRepo = inscripcionRepo;
        this.tallerRepo = tallerRepo;
        this.alumnoRepo = alumnoRepo;
        this.profesorRepo = profesorRepo;
        this.alertaRepo = alertaRepo;
        this.notificacionService = notificacionService;
        this.mailService = mailService;
    }
    async abrirSesion(dto) {
        const taller = await this.tallerRepo.findOne({ where: { id: dto.tallerId } });
        if (!taller)
            throw new common_1.NotFoundException('Taller no encontrado');
        const fecha = dto.fecha ?? new Date().toISOString().split('T')[0];
        const sesionAbierta = await this.sesionRepo.findOne({
            where: { tallerId: dto.tallerId, fecha, estado: 'ABIERTA' },
        });
        if (sesionAbierta) {
            throw new common_1.ConflictException('Ya hay una sesión abierta para este taller hoy');
        }
        const inscritos = await this.inscripcionRepo.find({
            where: { tallerId: dto.tallerId, estado: 'ACEPTADO' },
            relations: ['alumno'],
        });
        if (inscritos.length === 0) {
            throw new common_1.BadRequestException('No hay alumnos inscritos (aceptados) en este taller');
        }
        const sesion = this.sesionRepo.create({
            tallerId: dto.tallerId,
            profesorId: dto.profesorId,
            fecha,
            estado: 'ABIERTA',
            listaGuardada: false,
        });
        const guardada = await this.sesionRepo.save(sesion);
        const registros = inscritos.map((insc) => this.registroRepo.create({
            sesionId: guardada.id,
            alumnoId: insc.alumnoId,
            estado: 'PRESENTE',
        }));
        await this.registroRepo.save(registros);
        return await this.obtenerSesion(guardada.id);
    }
    async obtenerSesion(id) {
        const sesion = await this.sesionRepo.findOne({
            where: { id },
            relations: ['taller', 'profesor', 'registros', 'registros.alumno'],
        });
        if (!sesion)
            throw new common_1.NotFoundException('Sesión no encontrada');
        return sesion;
    }
    async sesionActiva(tallerId) {
        const fecha = new Date().toISOString().split('T')[0];
        return await this.sesionRepo.findOne({
            where: { tallerId, fecha, estado: 'ABIERTA' },
            relations: ['taller', 'profesor', 'registros', 'registros.alumno'],
        });
    }
    async historialSesiones(tallerId) {
        return await this.sesionRepo.find({
            where: { tallerId },
            relations: ['profesor', 'registros'],
            order: { fecha: 'DESC', openedAt: 'DESC' },
        });
    }
    async actualizarAsistencia(sesionId, dto) {
        const sesion = await this.sesionRepo.findOne({ where: { id: sesionId } });
        if (!sesion)
            throw new common_1.NotFoundException('Sesión no encontrada');
        if (sesion.estado !== 'ABIERTA') {
            throw new common_1.BadRequestException('La sesión está cerrada y no se puede editar');
        }
        const estadosValidos = ['PRESENTE', 'AUSENTE', 'TARDE'];
        for (const item of dto.registros) {
            if (!estadosValidos.includes(item.estado)) {
                throw new common_1.BadRequestException(`Estado inválido para alumno ${item.alumnoId}`);
            }
            const registro = await this.registroRepo.findOne({
                where: { sesionId, alumnoId: item.alumnoId },
            });
            if (!registro) {
                throw new common_1.BadRequestException(`El alumno ${item.alumnoId} no pertenece a esta sesión`);
            }
            registro.estado = item.estado;
            registro.observacion = item.observacion ?? null;
            await this.registroRepo.save(registro);
        }
        sesion.listaGuardada = true;
        await this.sesionRepo.save(sesion);
        return await this.obtenerSesion(sesionId);
    }
    async cerrarSesion(sesionId, dto) {
        const sesion = await this.sesionRepo.findOne({
            where: { id: sesionId },
            relations: ['taller', 'registros', 'registros.alumno'],
        });
        if (!sesion)
            throw new common_1.NotFoundException('Sesión no encontrada');
        if (sesion.estado !== 'ABIERTA') {
            throw new common_1.BadRequestException('La sesión ya está cerrada');
        }
        if (!sesion.listaGuardada) {
            throw new common_1.BadRequestException('Debes guardar la lista de asistencia antes de cerrar la sesión');
        }
        const registros = sesion.registros ?? [];
        if (registros.length === 0) {
            throw new common_1.BadRequestException('No hay alumnos registrados en esta sesión');
        }
        sesion.estado = 'CERRADA';
        sesion.observaciones = dto.observaciones ?? null;
        sesion.closedAt = new Date();
        await this.sesionRepo.save(sesion);
        await this.evaluarAusenciasRecurrentes(sesion.tallerId);
        await this.notificarApoderadosSesionCerrada(sesion);
        return await this.obtenerSesion(sesionId);
    }
    async notificarApoderadosSesionCerrada(sesion) {
        const tallerNombre = sesion.taller?.tipo ?? 'Taller';
        for (const reg of sesion.registros ?? []) {
            const alumno = reg.alumno;
            if (!alumno?.apoderadoEmail)
                continue;
            await this.mailService.asistenciaSesionApoderado(alumno.apoderadoEmail, alumno.nombre, tallerNombre, sesion.fecha, reg.estado, alumno.apoderadoNombre, reg.observacion);
        }
    }
    async evaluarAusenciasRecurrentes(tallerId) {
        const taller = await this.tallerRepo.findOne({ where: { id: tallerId } });
        if (!taller)
            return;
        const umbral = taller.umbralAusencias ?? 3;
        const sesionesCerradas = await this.sesionRepo.find({
            where: { tallerId, estado: 'CERRADA' },
            relations: ['registros'],
        });
        const ausenciasPorAlumno = new Map();
        for (const sesion of sesionesCerradas) {
            for (const reg of sesion.registros ?? []) {
                if (reg.estado === 'AUSENTE') {
                    ausenciasPorAlumno.set(reg.alumnoId, (ausenciasPorAlumno.get(reg.alumnoId) ?? 0) + 1);
                }
            }
        }
        const profesores = await this.profesorRepo.find({ where: { tallerId } });
        for (const [alumnoId, total] of ausenciasPorAlumno) {
            if (total < umbral)
                continue;
            const alumno = await this.alumnoRepo.findOne({ where: { id: alumnoId } });
            const alertaExistente = await this.alertaRepo.findOne({
                where: {
                    alumnoId,
                    tallerId,
                    estado: (0, typeorm_2.In)(['PENDIENTE', 'APODERADO_CONTACTADO']),
                },
            });
            if (!alertaExistente) {
                await this.alertaRepo.save({
                    alumnoId,
                    tallerId,
                    cantidadAusencias: total,
                    estado: 'PENDIENTE',
                });
                await this.notificacionService.crear(alumnoId, 'Alerta de ausencias', `Tienes ${total} ausencias en el taller "${taller.tipo}". Umbral: ${umbral}.`, 'ausencia_recurrente');
                const msgProfesor = `El alumno ${alumno?.nombre ?? alumnoId} acumuló ${total} ausencias en "${taller.tipo}".`;
                for (const prof of profesores) {
                    await this.notificacionService.crearParaProfesor(prof.id, 'Alerta de ausencias', msgProfesor, 'ausencia_recurrente');
                }
                await this.mailService.alertaApoderado(alumno?.apoderadoEmail, alumno?.nombre ?? `Alumno ${alumnoId}`, taller.tipo, total, umbral, alumno?.apoderadoNombre);
                const msgCoordinacion = `Alerta de ausencias: ${alumno?.nombre ?? alumnoId} acumuló ${total} ausencias en "${taller.tipo}" (umbral: ${umbral}).`;
                await this.notificacionService.notificarCoordinadoresAusencia('Alerta de ausencias recurrentes', msgCoordinacion, 'ausencia_recurrente');
            }
            else if (alertaExistente.cantidadAusencias < total) {
                alertaExistente.cantidadAusencias = total;
                await this.alertaRepo.save(alertaExistente);
            }
        }
    }
    async getAlertasGestion(tallerId) {
        const where = tallerId
            ? { tallerId, estado: (0, typeorm_2.In)(['PENDIENTE', 'APODERADO_CONTACTADO']) }
            : { estado: (0, typeorm_2.In)(['PENDIENTE', 'APODERADO_CONTACTADO']) };
        const alertas = await this.alertaRepo.find({
            where,
            relations: ['alumno', 'taller'],
            order: { createdAt: 'DESC' },
        });
        return alertas.map((a) => ({
            id: a.id,
            alumnoId: a.alumnoId,
            nombre: a.alumno?.nombre,
            rut: a.alumno?.rut,
            tallerId: a.tallerId,
            taller: a.taller?.tipo,
            cantidadAusencias: a.cantidadAusencias,
            estado: a.estado,
            notas: a.notas,
            createdAt: a.createdAt,
            apoderado: {
                nombre: a.alumno?.apoderadoNombre,
                telefono: a.alumno?.apoderadoTelefono,
                email: a.alumno?.apoderadoEmail,
            },
        }));
    }
    async contactarApoderado(id, dto) {
        const alerta = await this.alertaRepo.findOne({
            where: { id },
            relations: ['alumno', 'taller'],
        });
        if (!alerta)
            throw new common_1.NotFoundException('Alerta no encontrada');
        if (alerta.estado === 'RESUELTO') {
            throw new common_1.BadRequestException('La alerta ya fue resuelta');
        }
        alerta.estado = 'APODERADO_CONTACTADO';
        alerta.contactadoAt = new Date();
        alerta.notas = dto.notas ?? alerta.notas;
        const guardada = await this.alertaRepo.save(alerta);
        await this.mailService.contactoApoderado(alerta.alumno?.apoderadoEmail, alerta.alumno?.nombre ?? 'Alumno', alerta.taller?.tipo ?? 'Taller', alerta.cantidadAusencias, dto.notas, alerta.alumno?.apoderadoNombre);
        return guardada;
    }
    async resolverAlerta(id, dto) {
        const alerta = await this.alertaRepo.findOne({ where: { id } });
        if (!alerta)
            throw new common_1.NotFoundException('Alerta no encontrada');
        alerta.estado = 'RESUELTO';
        alerta.resueltoAt = new Date();
        if (dto.notas)
            alerta.notas = dto.notas;
        return await this.alertaRepo.save(alerta);
    }
    async actualizarUmbral(tallerId, umbralAusencias) {
        if (umbralAusencias == null || umbralAusencias < 1) {
            throw new common_1.BadRequestException('Debe indicar un umbral de ausencias válido');
        }
        const taller = await this.tallerRepo.findOne({ where: { id: tallerId } });
        if (!taller)
            throw new common_1.NotFoundException('Taller no encontrado');
        taller.umbralAusencias = umbralAusencias;
        return await this.tallerRepo.save(taller);
    }
    async getReporte(tallerId) {
        const taller = await this.tallerRepo.findOne({ where: { id: tallerId } });
        if (!taller)
            throw new common_1.NotFoundException('Taller no encontrado');
        const umbral = taller.umbralAusencias ?? 3;
        const sesiones = await this.sesionRepo.find({
            where: { tallerId, estado: 'CERRADA' },
            relations: ['registros', 'registros.alumno', 'profesor'],
            order: { fecha: 'DESC' },
        });
        const inscritos = await this.inscripcionRepo.find({
            where: { tallerId, estado: 'ACEPTADO' },
            relations: ['alumno'],
        });
        const estadisticasAlumnos = inscritos.map((insc) => {
            let presentes = 0;
            let ausentes = 0;
            let tardes = 0;
            for (const sesion of sesiones) {
                const reg = sesion.registros?.find((r) => r.alumnoId === insc.alumnoId);
                if (!reg)
                    continue;
                if (reg.estado === 'PRESENTE')
                    presentes++;
                else if (reg.estado === 'AUSENTE')
                    ausentes++;
                else if (reg.estado === 'TARDE')
                    tardes++;
            }
            const totalSesiones = sesiones.length;
            const porcentaje = totalSesiones > 0 ? Math.round((presentes / totalSesiones) * 100) : 0;
            return {
                alumnoId: insc.alumnoId,
                nombre: insc.alumno?.nombre,
                rut: insc.alumno?.rut,
                apoderadoNombre: insc.alumno?.apoderadoNombre,
                apoderadoTelefono: insc.alumno?.apoderadoTelefono,
                apoderadoEmail: insc.alumno?.apoderadoEmail,
                presentes,
                ausentes,
                tardes,
                totalSesiones,
                porcentajeAsistencia: porcentaje,
                alertaAusencia: ausentes >= umbral,
            };
        });
        const alertas = estadisticasAlumnos.filter((e) => e.alertaAusencia);
        const alertasGestion = await this.getAlertasGestion(tallerId);
        return {
            taller: {
                id: taller.id,
                tipo: taller.tipo,
                capacidad: taller.capacidad,
                umbralAusencias: umbral,
            },
            resumen: {
                totalSesiones: sesiones.length,
                totalAlumnos: inscritos.length,
                alertasAusencia: alertas.length,
                alertasPendientes: alertasGestion.length,
                umbralAusencias: umbral,
            },
            estadisticasAlumnos: estadisticasAlumnos.sort((a, b) => b.ausentes - a.ausentes),
            alertas,
            alertasGestion,
            sesiones: sesiones.map((s) => ({
                id: s.id,
                fecha: s.fecha,
                profesor: s.profesor?.nombre,
                presentes: s.registros?.filter((r) => r.estado === 'PRESENTE').length ?? 0,
                ausentes: s.registros?.filter((r) => r.estado === 'AUSENTE').length ?? 0,
                tardes: s.registros?.filter((r) => r.estado === 'TARDE').length ?? 0,
            })),
        };
    }
    async getAlertasGlobales() {
        return await this.getAlertasGestion();
    }
};
exports.AsistenciaService = AsistenciaService;
exports.AsistenciaService = AsistenciaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sesion_asistencia_entity_1.SesionAsistencia)),
    __param(1, (0, typeorm_1.InjectRepository)(registro_asistencia_entity_1.RegistroAsistencia)),
    __param(2, (0, typeorm_1.InjectRepository)(inscripcion_taller_entity_1.InscripcionTaller)),
    __param(3, (0, typeorm_1.InjectRepository)(taller_entity_1.Taller)),
    __param(4, (0, typeorm_1.InjectRepository)(alumno_entity_1.Alumno)),
    __param(5, (0, typeorm_1.InjectRepository)(profesor_entity_1.Profesor)),
    __param(6, (0, typeorm_1.InjectRepository)(alerta_ausencia_entity_1.AlertaAusencia)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notificacion_service_1.NotificacionService,
        mail_service_1.MailService])
], AsistenciaService);
//# sourceMappingURL=asistencia.service.js.map