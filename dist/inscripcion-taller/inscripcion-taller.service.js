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
exports.InscripcionTallerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inscripcion_taller_entity_1 = require("../entities/inscripcion-taller.entity");
const taller_entity_1 = require("../entities/taller.entity");
const alumno_entity_1 = require("../entities/alumno.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
const propuesta_inscripcion_taller_entity_1 = require("../entities/propuesta-inscripcion-taller.entity");
const taller_horario_entity_1 = require("../entities/taller-horario.entity");
const notificacion_service_1 = require("../notificacion/notificacion.service");
const periodo_service_1 = require("../periodo/periodo.service");
const mail_service_1 = require("../mail/mail.service");
const taller_horario_util_1 = require("../common/taller-horario.util");
let InscripcionTallerService = class InscripcionTallerService {
    repo;
    tallerRepo;
    alumnoRepo;
    profesorRepo;
    propuestaRepo;
    tallerHorarioRepo;
    notificacionService;
    periodoService;
    mailService;
    dataSource;
    constructor(repo, tallerRepo, alumnoRepo, profesorRepo, propuestaRepo, tallerHorarioRepo, notificacionService, periodoService, mailService, dataSource) {
        this.repo = repo;
        this.tallerRepo = tallerRepo;
        this.alumnoRepo = alumnoRepo;
        this.profesorRepo = profesorRepo;
        this.propuestaRepo = propuestaRepo;
        this.tallerHorarioRepo = tallerHorarioRepo;
        this.notificacionService = notificacionService;
        this.periodoService = periodoService;
        this.mailService = mailService;
        this.dataSource = dataSource;
    }
    async validar(alumnoId, tallerId, notificar = false) {
        const taller = await this.tallerRepo.findOne({
            where: { id: tallerId },
            relations: ['profesores'],
        });
        if (!taller) {
            throw new common_1.NotFoundException('Taller no encontrado');
        }
        if (taller.estado !== 'PUBLICADO') {
            return this.conAdvertencias({
                puedeInscribirse: false,
                cuposOcupados: 0,
                cuposDisponibles: 0,
                capacidad: taller.capacidad,
                conflictoHorario: false,
                motivo: 'Esta actividad aún no está publicada en el catálogo',
            }, alumnoId, tallerId, taller);
        }
        const hoy = new Date().toISOString().split('T')[0];
        const periodo = await this.periodoService.getActivo();
        const msgPeriodo = this.periodoService.mensajePeriodoCerrado(periodo, hoy);
        if (msgPeriodo) {
            return this.conAdvertencias({
                puedeInscribirse: false,
                cuposOcupados: 0,
                cuposDisponibles: 0,
                capacidad: taller.capacidad,
                conflictoHorario: false,
                motivo: msgPeriodo,
            }, alumnoId, tallerId, taller);
        }
        const apertura = taller.fechaAperturaInscripcion
            ? new Date(taller.fechaAperturaInscripcion).toISOString().split('T')[0]
            : null;
        const cierre = taller.fechaCierreInscripcion
            ? new Date(taller.fechaCierreInscripcion).toISOString().split('T')[0]
            : null;
        if (apertura && hoy < apertura) {
            return this.conAdvertencias({
                puedeInscribirse: false,
                cuposOcupados: 0,
                cuposDisponibles: 0,
                capacidad: taller.capacidad,
                conflictoHorario: false,
                motivo: 'El período de inscripción aún no ha abierto',
            }, alumnoId, tallerId, taller);
        }
        if (cierre && hoy > cierre) {
            return this.conAdvertencias({
                puedeInscribirse: false,
                cuposOcupados: 0,
                cuposDisponibles: 0,
                capacidad: taller.capacidad,
                conflictoHorario: false,
                motivo: 'El período de inscripción ya cerró',
            }, alumnoId, tallerId, taller);
        }
        const existente = await this.repo.findOne({
            where: { alumnoId, tallerId },
        });
        if (existente?.estado === 'PENDIENTE') {
            return this.conAdvertencias({
                puedeInscribirse: false,
                cuposOcupados: 0,
                cuposDisponibles: 0,
                capacidad: taller.capacidad,
                conflictoHorario: false,
                motivo: 'Ya tienes una solicitud pendiente para este taller',
            }, alumnoId, tallerId, taller);
        }
        if (existente?.estado === 'ACEPTADO') {
            return this.conAdvertencias({
                puedeInscribirse: false,
                cuposOcupados: 0,
                cuposDisponibles: 0,
                capacidad: taller.capacidad,
                conflictoHorario: false,
                motivo: 'Ya estás inscrito en este taller',
            }, alumnoId, tallerId, taller);
        }
        const cuposOcupados = await this.contarCuposOcupados(tallerId);
        const cuposDisponibles = Math.max(0, taller.capacidad - cuposOcupados);
        const conflicto = await this.buscarConflictoHorario(alumnoId, taller);
        if (conflicto) {
            const resultado = {
                puedeInscribirse: false,
                cuposOcupados,
                cuposDisponibles,
                capacidad: taller.capacidad,
                conflictoHorario: true,
                tallerConflicto: conflicto.tipo,
                motivo: `Conflicto de horario con el taller "${conflicto.tipo}"`,
            };
            if (notificar)
                await this.notificarBloqueoInscripcion(alumnoId, resultado, taller.tipo);
            return this.conAdvertencias(resultado, alumnoId, tallerId, taller);
        }
        if (cuposDisponibles <= 0) {
            const resultado = {
                puedeInscribirse: false,
                cuposOcupados,
                cuposDisponibles: 0,
                capacidad: taller.capacidad,
                conflictoHorario: false,
                sinCupo: true,
                motivo: 'No hay cupos disponibles en este taller',
            };
            if (notificar)
                await this.notificarBloqueoInscripcion(alumnoId, resultado, taller.tipo);
            return this.conAdvertencias(resultado, alumnoId, tallerId, taller);
        }
        return this.conAdvertencias({
            puedeInscribirse: true,
            cuposOcupados,
            cuposDisponibles,
            capacidad: taller.capacidad,
            conflictoHorario: false,
        }, alumnoId, tallerId, taller);
    }
    async conAdvertencias(base, alumnoId, tallerId, taller) {
        const meta = await this.obtenerMetaAdvertencias(alumnoId, tallerId, taller);
        return {
            ...base,
            advertencias: meta.advertencias,
            tieneProfesor: meta.tieneProfesor,
            cantidadOtrasInscripciones: meta.cantidadOtrasInscripciones,
        };
    }
    async obtenerMetaAdvertencias(alumnoId, tallerId, taller) {
        const advertencias = [];
        const otrasInscripciones = await this.repo.find({
            where: { alumnoId, estado: (0, typeorm_2.In)(['PENDIENTE', 'ACEPTADO']) },
            relations: ['taller'],
        });
        const otras = otrasInscripciones.filter((i) => i.tallerId !== tallerId);
        if (otras.length > 0) {
            const nombres = otras
                .map((i) => `"${i.taller?.tipo ?? 'otro taller'}"`)
                .join(', ');
            advertencias.push(`Ya tienes solicitud o inscripción activa en ${nombres}. Si te inscribes en más de un taller, debes cumplir con tus deberes de estudiante: asistencia, evaluaciones y responsabilidades en el aula.`);
        }
        const tieneProfesor = (taller.profesores?.length ?? 0) > 0;
        if (!tieneProfesor) {
            advertencias.push('Este taller aún no tiene profesor asignado. Tu solicitud podrá quedar en espera hasta que la directiva confirme un docente.');
        }
        return {
            advertencias,
            tieneProfesor,
            cantidadOtrasInscripciones: otras.length,
        };
    }
    async notificarBloqueoInscripcion(alumnoId, validacion, tallerNombre) {
        if (validacion.conflictoHorario) {
            await this.notificacionService.crear(alumnoId, 'Conflicto de horario', `No puedes inscribirte en "${tallerNombre}" porque coincide con el horario del taller "${validacion.tallerConflicto}".`, 'inscripcion_conflicto');
            return;
        }
        if (validacion.sinCupo) {
            await this.notificacionService.crear(alumnoId, 'Sin cupos disponibles', `No hay cupos disponibles en el taller "${tallerNombre}". Puedes intentar con otra actividad.`, 'inscripcion_sin_cupo');
        }
    }
    async solicitar(dto) {
        const alumno = await this.alumnoRepo.findOne({ where: { id: dto.alumnoId } });
        if (!alumno) {
            throw new common_1.NotFoundException('Alumno no encontrado');
        }
        const validacion = await this.validar(dto.alumnoId, dto.tallerId);
        const taller = await this.tallerRepo.findOne({ where: { id: dto.tallerId } });
        if (!validacion.puedeInscribirse) {
            await this.notificarBloqueoInscripcion(dto.alumnoId, validacion, taller?.tipo ?? 'taller');
            throw new common_1.ConflictException(validacion.motivo ?? 'No puedes inscribirte en este taller');
        }
        const existente = await this.repo.findOne({
            where: { alumnoId: dto.alumnoId, tallerId: dto.tallerId },
        });
        let guardada;
        const datosFicha = {
            altura: dto.ficha.altura,
            peso: dto.ficha.peso,
            porcentajeGrasa: dto.ficha.porcentajeGrasa,
            sedentario: dto.ficha.sedentario,
        };
        if (existente?.estado === 'RECHAZADO') {
            existente.estado = 'PENDIENTE';
            Object.assign(existente, datosFicha);
            guardada = await this.repo.save(existente);
        }
        else {
            const inscripcion = this.repo.create({
                alumnoId: dto.alumnoId,
                tallerId: dto.tallerId,
                estado: 'PENDIENTE',
                ...datosFicha,
            });
            guardada = await this.repo.save(inscripcion);
        }
        await this.notificacionService.crear(dto.alumnoId, 'Solicitud enviada', `Tu solicitud al taller "${taller?.tipo ?? 'taller'}" fue registrada. El profesor la revisará pronto.`);
        return guardada;
    }
    async findByTaller(tallerId) {
        return await this.repo.find({
            where: { tallerId },
            relations: ['alumno', 'taller'],
            order: { createdAt: 'DESC' },
        });
    }
    async getResumen(tallerId) {
        const taller = await this.tallerRepo.findOne({ where: { id: tallerId } });
        if (!taller) {
            throw new common_1.NotFoundException('Taller no encontrado');
        }
        const inscripciones = await this.findByTaller(tallerId);
        const pendientes = inscripciones.filter((i) => i.estado === 'PENDIENTE');
        const aceptados = inscripciones.filter((i) => i.estado === 'ACEPTADO');
        const rechazados = inscripciones.filter((i) => i.estado === 'RECHAZADO');
        const cuposOcupados = pendientes.length + aceptados.length;
        return {
            taller: {
                id: taller.id,
                tipo: taller.tipo,
                descripcion: taller.descripcion,
                capacidad: taller.capacidad,
                diaSemana: taller.diaSemana,
                horaInicio: taller.horaInicio,
                horaFin: taller.horaFin,
            },
            resumen: {
                total: inscripciones.length,
                pendientes: pendientes.length,
                aceptados: aceptados.length,
                rechazados: rechazados.length,
                cuposOcupados,
                cuposDisponibles: Math.max(0, taller.capacidad - cuposOcupados),
            },
            inscripciones,
        };
    }
    async findByAlumno(alumnoId) {
        return await this.repo.find({
            where: { alumnoId },
            relations: ['taller', 'alumno'],
            order: { createdAt: 'DESC' },
        });
    }
    async actualizarFicha(id, dto) {
        const inscripcion = await this.repo.findOne({
            where: { id },
            relations: ['alumno', 'taller'],
        });
        if (!inscripcion) {
            throw new common_1.NotFoundException('Inscripción no encontrada');
        }
        if (dto.altura != null)
            inscripcion.altura = dto.altura;
        if (dto.peso != null)
            inscripcion.peso = dto.peso;
        if (dto.porcentajeGrasa != null)
            inscripcion.porcentajeGrasa = dto.porcentajeGrasa;
        if (dto.sedentario != null)
            inscripcion.sedentario = dto.sedentario;
        return await this.repo.save(inscripcion);
    }
    async responder(id, dto) {
        if (dto.estado === 'RECHAZADO') {
            return this.responderRechazo(id);
        }
        return this.responderAceptacionTransaccional(id);
    }
    async responderRechazo(id) {
        const inscripcion = await this.repo.findOne({
            where: { id },
            relations: ['alumno', 'taller'],
        });
        if (!inscripcion)
            throw new common_1.NotFoundException('Solicitud no encontrada');
        if (inscripcion.estado !== 'PENDIENTE') {
            throw new common_1.BadRequestException('Esta solicitud ya fue respondida');
        }
        inscripcion.estado = 'RECHAZADO';
        const guardada = await this.repo.save(inscripcion);
        const nombreTaller = inscripcion.taller?.tipo ?? 'taller';
        await this.notificacionService.crear(inscripcion.alumnoId, 'Inscripción rechazada', `Tu solicitud al taller "${nombreTaller}" fue rechazada. Puedes intentar con otro taller.`);
        return guardada;
    }
    async responderAceptacionTransaccional(id) {
        const guardada = await this.dataSource.transaction(async (manager) => {
            const inscripcion = await manager.findOne(inscripcion_taller_entity_1.InscripcionTaller, {
                where: { id },
                relations: ['alumno', 'taller'],
            });
            if (!inscripcion)
                throw new common_1.NotFoundException('Solicitud no encontrada');
            if (inscripcion.estado !== 'PENDIENTE') {
                throw new common_1.BadRequestException('Esta solicitud ya fue respondida');
            }
            const taller = await manager.findOne(taller_entity_1.Taller, {
                where: { id: inscripcion.tallerId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!taller)
                throw new common_1.NotFoundException('Taller no encontrado');
            const aceptados = await manager.count(inscripcion_taller_entity_1.InscripcionTaller, {
                where: { tallerId: inscripcion.tallerId, estado: 'ACEPTADO' },
            });
            if (aceptados >= taller.capacidad) {
                throw new common_1.ConflictException('No hay cupos disponibles para aceptar esta solicitud');
            }
            const conflicto = await this.buscarConflictoHorario(inscripcion.alumnoId, inscripcion.taller, inscripcion.tallerId, manager);
            if (conflicto) {
                throw new common_1.ConflictException(`El alumno tiene conflicto de horario con el taller "${conflicto.tipo}"`);
            }
            inscripcion.estado = 'ACEPTADO';
            inscripcion.alumno.tallerId = inscripcion.tallerId;
            await manager.save(inscripcion.alumno);
            return manager.save(inscripcion);
        });
        const nombreTaller = guardada.taller?.tipo ?? 'taller';
        await this.notificacionService.crear(guardada.alumnoId, 'Inscripción aceptada', `¡Felicitaciones! Fuiste aceptado en el taller "${nombreTaller}".`);
        await this.mailService.inscripcionTallerApoderado(guardada.alumno?.apoderadoEmail, guardada.alumno?.nombre ?? 'Alumno', nombreTaller, guardada.alumno?.apoderadoNombre, guardada.taller ? this.formatHorarioTaller(guardada.taller) : null);
        return guardada;
    }
    async retirarse(inscripcionId, alumnoId) {
        const inscripcion = await this.repo.findOne({
            where: { id: inscripcionId },
            relations: ['alumno', 'taller', 'taller.profesores'],
        });
        if (!inscripcion)
            throw new common_1.NotFoundException('Inscripción no encontrada');
        if (inscripcion.alumnoId !== alumnoId) {
            throw new common_1.BadRequestException('No puedes retirar una inscripción de otro alumno');
        }
        if (inscripcion.estado === 'RECHAZADO') {
            throw new common_1.BadRequestException('No tienes una inscripción activa en este taller');
        }
        const nombreAlumno = inscripcion.alumno?.nombre ?? 'Un alumno';
        const nombreTaller = inscripcion.taller?.tipo ?? 'taller';
        const tallerId = inscripcion.tallerId;
        const eraAceptado = inscripcion.estado === 'ACEPTADO';
        await this.dataSource.transaction(async (manager) => {
            const ins = await manager.findOne(inscripcion_taller_entity_1.InscripcionTaller, {
                where: { id: inscripcionId },
                relations: ['alumno'],
            });
            if (!ins)
                throw new common_1.NotFoundException('Inscripción no encontrada');
            if (ins.alumnoId !== alumnoId) {
                throw new common_1.BadRequestException('No puedes retirar una inscripción de otro alumno');
            }
            if (ins.estado === 'RECHAZADO') {
                throw new common_1.BadRequestException('No tienes una inscripción activa en este taller');
            }
            if (ins.estado === 'ACEPTADO') {
                const alumno = await manager.findOne(alumno_entity_1.Alumno, { where: { id: alumnoId } });
                if (alumno?.tallerId === ins.tallerId) {
                    alumno.tallerId = null;
                    await manager.save(alumno);
                }
            }
            await manager.remove(ins);
        });
        const profesores = inscripcion.taller?.profesores?.length
            ? inscripcion.taller.profesores
            : await this.profesorRepo.find({ where: { tallerId } });
        const mensajeProfesor = `${nombreAlumno} se ha retirado del taller "${nombreTaller}".`;
        for (const profesor of profesores) {
            await this.notificacionService.crearParaProfesor(profesor.id, 'Alumno se retiró del taller', mensajeProfesor, 'retiro_taller');
        }
        const mensajeAlumno = eraAceptado
            ? `Te has retirado del taller "${nombreTaller}". Ya no estás inscrito.`
            : `Has cancelado tu solicitud al taller "${nombreTaller}".`;
        await this.notificacionService.crear(alumnoId, 'Retiro confirmado', mensajeAlumno, 'retiro_taller');
        return { ok: true };
    }
    async contarCuposOcupados(tallerId) {
        return await this.repo.count({
            where: {
                tallerId,
                estado: (0, typeorm_2.In)(['PENDIENTE', 'ACEPTADO']),
            },
        });
    }
    async buscarConflictoHorario(alumnoId, tallerDestino, excluirTallerId, manager) {
        if (tallerDestino.diaSemana == null ||
            !tallerDestino.horaInicio ||
            !tallerDestino.horaFin) {
            return null;
        }
        const inscripciones = manager
            ? await manager.find(inscripcion_taller_entity_1.InscripcionTaller, {
                where: { alumnoId, estado: (0, typeorm_2.In)(['PENDIENTE', 'ACEPTADO']) },
                relations: ['taller'],
            })
            : await this.repo.find({
                where: { alumnoId, estado: (0, typeorm_2.In)(['PENDIENTE', 'ACEPTADO']) },
                relations: ['taller'],
            });
        for (const insc of inscripciones) {
            if (excluirTallerId && insc.tallerId === excluirTallerId)
                continue;
            const otro = insc.taller;
            if (otro?.diaSemana == null ||
                !otro.horaInicio ||
                !otro.horaFin) {
                continue;
            }
            if (this.horariosSeSolapan(tallerDestino, otro)) {
                return otro;
            }
        }
        return null;
    }
    horariosSeSolapan(a, b) {
        if (a.diaSemana !== b.diaSemana)
            return false;
        const inicioA = this.normalizarHora(a.horaInicio);
        const finA = this.normalizarHora(a.horaFin);
        const inicioB = this.normalizarHora(b.horaInicio);
        const finB = this.normalizarHora(b.horaFin);
        return inicioA < finB && inicioB < finA;
    }
    normalizarHora(hora) {
        return hora.length >= 5 ? hora.slice(0, 5) : hora;
    }
    formatHorarioTaller(taller) {
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        if (taller.diaSemana == null || !taller.horaInicio || !taller.horaFin)
            return null;
        return `${dias[taller.diaSemana]} ${this.normalizarHora(taller.horaInicio)} - ${this.normalizarHora(taller.horaFin)}`;
    }
    async proponerDirectiva(dto) {
        const alumno = await this.alumnoRepo.findOne({ where: { id: dto.alumnoId } });
        if (!alumno)
            throw new common_1.NotFoundException('Alumno no encontrado');
        const taller = await this.tallerRepo.findOne({
            where: { id: dto.tallerId },
            relations: ['horarios'],
        });
        if (!taller)
            throw new common_1.NotFoundException('Taller no encontrado');
        if (taller.estado !== 'PUBLICADO') {
            throw new common_1.BadRequestException('Solo se pueden proponer actividades publicadas en el catálogo');
        }
        const validacion = await this.validar(dto.alumnoId, dto.tallerId);
        if (!validacion.puedeInscribirse) {
            throw new common_1.ConflictException(validacion.motivo ?? 'No se puede proponer esta inscripción');
        }
        const { tallerHorarioId, horarioPropuestoTexto } = await this.resolverHorarioPropuesta(taller, dto.tallerHorarioId, dto.horarioPropuestoTexto);
        const existente = await this.propuestaRepo.findOne({
            where: { alumnoId: dto.alumnoId, tallerId: dto.tallerId },
        });
        if (existente?.estado === 'PENDIENTE') {
            throw new common_1.ConflictException('Ya existe una propuesta pendiente para este taller');
        }
        const propuesta = existente
            ? Object.assign(existente, {
                estado: 'PENDIENTE',
                motivoRechazo: null,
                mensajeDirectiva: null,
                horarioSugeridoId: null,
                respondedAt: null,
                tallerHorarioId,
                horarioPropuestoTexto,
                mensajeApoderado: dto.mensajeApoderado?.trim() || null,
            })
            : this.propuestaRepo.create({
                alumnoId: dto.alumnoId,
                tallerId: dto.tallerId,
                estado: 'PENDIENTE',
                tallerHorarioId,
                horarioPropuestoTexto,
                mensajeApoderado: dto.mensajeApoderado?.trim() || null,
            });
        const guardada = await this.propuestaRepo.save(propuesta);
        const apoderadoNombre = alumno.apoderadoNombre ?? 'Apoderado';
        await this.notificacionService.notificarCoordinadoresPropuestaApoderado({
            propuestaId: guardada.id,
            apoderadoNombre,
            alumnoNombre: alumno.nombre,
            alumnoRut: alumno.rut,
            tallerNombre: taller.tipo,
            horarioPropuesto: horarioPropuestoTexto,
            mensajeApoderado: dto.mensajeApoderado?.trim() || null,
        });
        return guardada;
    }
    async proponerActividadLibre(alumnoId, dto) {
        const alumno = await this.alumnoRepo.findOne({ where: { id: alumnoId } });
        if (!alumno)
            throw new common_1.NotFoundException('Alumno no encontrado');
        const nombre = dto.actividadNombre.trim();
        const horario = dto.horarioPropuestoTexto.trim();
        const descripcion = dto.actividadDescripcion?.trim() || null;
        const pendiente = await this.propuestaRepo.findOne({
            where: { alumnoId, actividadLibreNombre: nombre, estado: 'PENDIENTE' },
        });
        if (pendiente) {
            throw new common_1.ConflictException('Ya existe una propuesta pendiente para esta actividad');
        }
        const propuesta = await this.propuestaRepo.save(this.propuestaRepo.create({
            alumnoId,
            tallerId: null,
            actividadLibreNombre: nombre,
            actividadLibreDescripcion: descripcion,
            estado: 'PENDIENTE',
            horarioPropuestoTexto: horario,
            mensajeApoderado: dto.mensajeApoderado?.trim() || null,
        }));
        const apoderadoNombre = alumno.apoderadoNombre ?? 'Apoderado';
        await this.notificacionService.notificarCoordinadoresPropuestaApoderado({
            propuestaId: propuesta.id,
            apoderadoNombre,
            alumnoNombre: alumno.nombre,
            alumnoRut: alumno.rut,
            tallerNombre: nombre,
            horarioPropuesto: horario,
            mensajeApoderado: dto.mensajeApoderado?.trim() || null,
            actividadDescripcion: descripcion,
            esActividadLibre: true,
        });
        return propuesta;
    }
    nombreActividadPropuesta(propuesta) {
        return propuesta.actividadLibreNombre ?? propuesta.taller?.tipo ?? 'Actividad';
    }
    async resolverHorarioPropuesta(taller, tallerHorarioId, horarioLibre) {
        const horarioTexto = horarioLibre?.trim() || null;
        if (horarioTexto) {
            let horarioId = null;
            if (tallerHorarioId) {
                const horario = await this.tallerHorarioRepo.findOne({
                    where: { id: tallerHorarioId, tallerId: taller.id },
                });
                if (horario)
                    horarioId = horario.id;
            }
            return { tallerHorarioId: horarioId, horarioPropuestoTexto: horarioTexto };
        }
        const opciones = (0, taller_horario_util_1.opcionesHorarioTaller)(taller);
        if (opciones.length === 0) {
            throw new common_1.BadRequestException('Debe indicar el horario propuesto (día y hora)');
        }
        if (opciones.length === 1 && opciones[0].id == null) {
            return { tallerHorarioId: null, horarioPropuestoTexto: opciones[0].etiqueta };
        }
        if (!tallerHorarioId) {
            throw new common_1.BadRequestException('Debe indicar el horario propuesto');
        }
        const horario = await this.tallerHorarioRepo.findOne({
            where: { id: tallerHorarioId, tallerId: taller.id },
        });
        if (!horario) {
            throw new common_1.BadRequestException('El horario seleccionado no pertenece a esta actividad');
        }
        return {
            tallerHorarioId: horario.id,
            horarioPropuestoTexto: (0, taller_horario_util_1.textoHorarioBloque)(horario),
        };
    }
    async getPropuestasPendientes() {
        const propuestas = await this.propuestaRepo.find({
            where: { estado: 'PENDIENTE' },
            relations: ['alumno', 'taller', 'taller.horarios', 'tallerHorario'],
            order: { createdAt: 'DESC' },
        });
        return propuestas.map((p) => ({
            id: p.id,
            alumnoId: p.alumnoId,
            alumnoNombre: p.alumno?.nombre,
            alumnoRut: p.alumno?.rut,
            tallerId: p.tallerId,
            tallerNombre: this.nombreActividadPropuesta(p),
            esActividadLibre: !p.tallerId,
            actividadDescripcion: p.actividadLibreDescripcion,
            apoderadoNombre: p.alumno?.apoderadoNombre,
            apoderadoEmail: p.alumno?.apoderadoEmail,
            horarioPropuesto: p.horarioPropuestoTexto ??
                (0, taller_horario_util_1.textoHorarioPorId)(p.tallerHorario) ??
                (p.taller ? (0, taller_horario_util_1.textoHorarioTaller)(p.taller) : null),
            mensajeApoderado: p.mensajeApoderado,
            tallerHorarioId: p.tallerHorarioId,
            horariosDisponibles: p.taller ? (0, taller_horario_util_1.opcionesHorarioTaller)(p.taller) : [],
            createdAt: p.createdAt,
        }));
    }
    async getPropuestasPorAlumno(alumnoId) {
        const propuestas = await this.propuestaRepo.find({
            where: { alumnoId },
            relations: ['taller', 'tallerHorario', 'horarioSugerido'],
            order: { createdAt: 'DESC' },
        });
        return propuestas.map((p) => ({
            id: p.id,
            tallerId: p.tallerId,
            tallerNombre: this.nombreActividadPropuesta(p),
            esActividadLibre: !p.tallerId,
            actividadDescripcion: p.actividadLibreDescripcion,
            estado: p.estado,
            horarioPropuesto: p.horarioPropuestoTexto ?? (0, taller_horario_util_1.textoHorarioPorId)(p.tallerHorario),
            horarioSugerido: (0, taller_horario_util_1.textoHorarioPorId)(p.horarioSugerido) ?? p.horarioSugeridoTexto,
            motivoRechazo: p.motivoRechazo,
            mensajeApoderado: p.mensajeApoderado,
            mensajeDirectiva: p.mensajeDirectiva,
            createdAt: p.createdAt,
            respondedAt: p.respondedAt,
        }));
    }
    async responderPropuesta(id, dto) {
        const propuesta = await this.propuestaRepo.findOne({
            where: { id },
            relations: ['alumno', 'taller', 'tallerHorario'],
        });
        if (!propuesta)
            throw new common_1.NotFoundException('Propuesta no encontrada');
        if (propuesta.estado !== 'PENDIENTE') {
            throw new common_1.BadRequestException('Esta propuesta ya fue respondida');
        }
        propuesta.respondedAt = new Date();
        const horarioPropuesto = propuesta.horarioPropuestoTexto ?? (0, taller_horario_util_1.textoHorarioPorId)(propuesta.tallerHorario);
        const horarioTxt = horarioPropuesto ? ` Horario propuesto: ${horarioPropuesto}.` : '';
        const nombreActividad = this.nombreActividadPropuesta(propuesta);
        const esLibre = !propuesta.tallerId;
        if (dto.acepta) {
            propuesta.estado = 'ACEPTADA';
            propuesta.mensajeDirectiva = dto.mensajeDirectiva?.trim() || null;
            propuesta.horarioSugeridoId = null;
            await this.propuestaRepo.save(propuesta);
            if (!esLibre && propuesta.tallerId) {
                const inscripcionExistente = await this.repo.findOne({
                    where: { alumnoId: propuesta.alumnoId, tallerId: propuesta.tallerId },
                });
                if (!inscripcionExistente) {
                    await this.repo.save(this.repo.create({
                        alumnoId: propuesta.alumnoId,
                        tallerId: propuesta.tallerId,
                        estado: 'PENDIENTE',
                    }));
                }
                else if (inscripcionExistente.estado === 'RECHAZADO') {
                    inscripcionExistente.estado = 'PENDIENTE';
                    await this.repo.save(inscripcionExistente);
                }
            }
            const extra = dto.mensajeDirectiva?.trim() ? ` ${dto.mensajeDirectiva.trim()}` : '';
            const msgAceptacion = esLibre
                ? `La directiva aceptó tu propuesta de la actividad "${nombreActividad}".${horarioTxt} La coordinación gestionará la creación de la actividad.${extra}`
                : `La directiva aceptó tu propuesta al taller "${nombreActividad}".${horarioTxt} Tu solicitud quedó pendiente de aprobación del profesor.${extra}`;
            await this.notificacionService.crear(propuesta.alumnoId, 'Propuesta aceptada por directiva', msgAceptacion, 'propuesta_aceptada');
            await this.mailService.respuestaPropuestaDirectivaApoderado(propuesta.alumno?.apoderadoEmail, {
                apoderadoNombre: propuesta.alumno?.apoderadoNombre,
                alumnoNombre: propuesta.alumno?.nombre ?? 'Estudiante',
                tallerNombre: nombreActividad,
                aceptada: true,
                horarioPropuesto,
                mensajeDirectiva: dto.mensajeDirectiva?.trim() || null,
                esActividadLibre: esLibre,
            });
        }
        else {
            let horarioSugeridoTexto = null;
            if (dto.horarioSugeridoId && propuesta.tallerId) {
                const horario = await this.tallerHorarioRepo.findOne({
                    where: { id: dto.horarioSugeridoId, tallerId: propuesta.tallerId },
                });
                if (!horario) {
                    throw new common_1.BadRequestException('El horario sugerido no pertenece a esta actividad');
                }
                propuesta.horarioSugeridoId = horario.id;
                horarioSugeridoTexto = (0, taller_horario_util_1.textoHorarioBloque)(horario);
            }
            else if (dto.horarioSugeridoTexto?.trim()) {
                propuesta.horarioSugeridoId = null;
                propuesta.horarioSugeridoTexto = dto.horarioSugeridoTexto.trim();
                horarioSugeridoTexto = propuesta.horarioSugeridoTexto;
            }
            else {
                propuesta.horarioSugeridoId = null;
                propuesta.horarioSugeridoTexto = null;
            }
            propuesta.estado = 'RECHAZADA';
            propuesta.motivoRechazo = dto.motivoRechazo?.trim() || null;
            propuesta.mensajeDirectiva = dto.mensajeDirectiva?.trim() || null;
            await this.propuestaRepo.save(propuesta);
            const partes = [
                `La directiva rechazó la propuesta${esLibre ? ' de la actividad' : ' al taller'} "${nombreActividad}".${horarioTxt}`,
            ];
            if (dto.motivoRechazo?.trim())
                partes.push(`Motivo: ${dto.motivoRechazo.trim()}.`);
            if (horarioSugeridoTexto) {
                partes.push(`Horario alternativo disponible: ${horarioSugeridoTexto}.`);
            }
            if (dto.mensajeDirectiva?.trim())
                partes.push(dto.mensajeDirectiva.trim());
            await this.notificacionService.crear(propuesta.alumnoId, 'Propuesta rechazada', partes.join(' '), 'propuesta_rechazada');
            await this.mailService.respuestaPropuestaDirectivaApoderado(propuesta.alumno?.apoderadoEmail, {
                apoderadoNombre: propuesta.alumno?.apoderadoNombre,
                alumnoNombre: propuesta.alumno?.nombre ?? 'Estudiante',
                tallerNombre: nombreActividad,
                aceptada: false,
                horarioPropuesto,
                motivoRechazo: dto.motivoRechazo?.trim() || null,
                horarioSugerido: horarioSugeridoTexto,
                mensajeDirectiva: dto.mensajeDirectiva?.trim() || null,
                esActividadLibre: esLibre,
            });
        }
        return propuesta;
    }
};
exports.InscripcionTallerService = InscripcionTallerService;
exports.InscripcionTallerService = InscripcionTallerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inscripcion_taller_entity_1.InscripcionTaller)),
    __param(1, (0, typeorm_1.InjectRepository)(taller_entity_1.Taller)),
    __param(2, (0, typeorm_1.InjectRepository)(alumno_entity_1.Alumno)),
    __param(3, (0, typeorm_1.InjectRepository)(profesor_entity_1.Profesor)),
    __param(4, (0, typeorm_1.InjectRepository)(propuesta_inscripcion_taller_entity_1.PropuestaInscripcionTaller)),
    __param(5, (0, typeorm_1.InjectRepository)(taller_horario_entity_1.TallerHorario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notificacion_service_1.NotificacionService,
        periodo_service_1.PeriodoService,
        mail_service_1.MailService,
        typeorm_2.DataSource])
], InscripcionTallerService);
//# sourceMappingURL=inscripcion-taller.service.js.map