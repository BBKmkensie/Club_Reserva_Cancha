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
exports.TallerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const taller_entity_1 = require("../entities/taller.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
const asignacion_docente_entity_1 = require("../entities/asignacion-docente.entity");
const inscripcion_taller_entity_1 = require("../entities/inscripcion-taller.entity");
const sesion_asistencia_entity_1 = require("../entities/sesion-asistencia.entity");
const reserva_entity_1 = require("../entities/reserva.entity");
const taller_horario_entity_1 = require("../entities/taller-horario.entity");
const curso_constants_1 = require("../common/curso.constants");
const notificacion_service_1 = require("../notificacion/notificacion.service");
const periodo_service_1 = require("../periodo/periodo.service");
let TallerService = class TallerService {
    tallerRepository;
    profesorRepository;
    asignacionRepository;
    inscripcionRepository;
    sesionAsistenciaRepository;
    reservaRepository;
    tallerHorarioRepository;
    notificacionService;
    periodoService;
    constructor(tallerRepository, profesorRepository, asignacionRepository, inscripcionRepository, sesionAsistenciaRepository, reservaRepository, tallerHorarioRepository, notificacionService, periodoService) {
        this.tallerRepository = tallerRepository;
        this.profesorRepository = profesorRepository;
        this.asignacionRepository = asignacionRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.sesionAsistenciaRepository = sesionAsistenciaRepository;
        this.reservaRepository = reservaRepository;
        this.tallerHorarioRepository = tallerHorarioRepository;
        this.notificacionService = notificacionService;
        this.periodoService = periodoService;
    }
    async create(createTallerDto) {
        const taller = this.tallerRepository.create({
            tipo: createTallerDto.tipo,
            descripcion: createTallerDto.descripcion,
            capacidad: createTallerDto.capacidad || 20,
            imagenUrl: createTallerDto.imagenUrl ?? null,
            fechaInicio: createTallerDto.fechaInicio
                ? new Date(createTallerDto.fechaInicio)
                : null,
            adminId: createTallerDto.adminId,
            estado: 'BORRADOR',
        });
        return await this.tallerRepository.save(taller);
    }
    async findAll() {
        return await this.tallerRepository.find({
            relations: ['profesores', 'horarios'],
            order: { id: 'DESC' },
        });
    }
    async findCatalogo() {
        const hoy = new Date().toISOString().split('T')[0];
        const talleres = await this.tallerRepository.find({
            where: { estado: 'PUBLICADO' },
            relations: ['horarios', 'profesores'],
            order: { tipo: 'ASC' },
        });
        return talleres.filter((t) => this.inscripcionesAbiertas(t, hoy));
    }
    async findOne(id) {
        const taller = await this.tallerRepository.findOne({
            where: { id },
            relations: ['admin', 'alumnos', 'profesores', 'reservas', 'salidas', 'horarios'],
        });
        if (!taller) {
            throw new common_1.NotFoundException(`Actividad con ID ${id} no encontrada`);
        }
        return taller;
    }
    async update(id, updateTallerDto) {
        const taller = await this.findOne(id);
        if (taller.estado === 'CERRADO') {
            throw new common_1.BadRequestException('No se puede editar una actividad cerrada');
        }
        Object.assign(taller, updateTallerDto);
        if (updateTallerDto.fechaInicio) {
            taller.fechaInicio = new Date(updateTallerDto.fechaInicio);
        }
        return await this.tallerRepository.save(taller);
    }
    async actualizarPresentacion(tallerId, dto, opts) {
        if (dto.descripcion == null && dto.fotoPath == null) {
            throw new common_1.BadRequestException('Debe indicar descripción y/o foto del profesor');
        }
        const taller = await this.findOne(tallerId);
        if (taller.estado === 'CERRADO') {
            throw new common_1.BadRequestException('No se puede editar una actividad cerrada');
        }
        const esDirectiva = opts.esDirectiva === true;
        let profesorActor = null;
        if (!esDirectiva) {
            if (!opts.profesorId) {
                throw new common_1.ForbiddenException('Solo el profesor del taller o la directiva pueden editar');
            }
            profesorActor = await this.profesorRepository.findOne({
                where: { id: opts.profesorId },
            });
            if (!profesorActor || profesorActor.tallerId !== tallerId) {
                throw new common_1.ForbiddenException('No tienes permiso para editar este taller');
            }
        }
        if (dto.descripcion != null) {
            taller.descripcion = dto.descripcion.trim();
            await this.tallerRepository.save(taller);
        }
        let profesorActualizado = null;
        if (dto.fotoPath != null) {
            const profesorId = dto.profesorId ?? opts.profesorId;
            if (!profesorId) {
                throw new common_1.BadRequestException('Debe indicar el profesor cuya foto se actualiza');
            }
            if (!esDirectiva && profesorId !== opts.profesorId) {
                throw new common_1.ForbiddenException('Solo puedes actualizar tu propia foto');
            }
            const profesor = await this.profesorRepository.findOne({ where: { id: profesorId } });
            if (!profesor || profesor.tallerId !== tallerId) {
                throw new common_1.NotFoundException('Profesor no encontrado en este taller');
            }
            profesor.fotoPath = dto.fotoPath.trim() || null;
            profesorActualizado = await this.profesorRepository.save(profesor);
        }
        return {
            taller: await this.findOne(tallerId),
            profesor: profesorActualizado ?? profesorActor,
        };
    }
    async remove(id) {
        const taller = await this.findOne(id);
        await this.tallerRepository.remove(taller);
    }
    async asignarDocente(tallerId, dto) {
        const taller = await this.findOne(tallerId);
        if (!['BORRADOR', 'ESPERA_DOCENTE'].includes(taller.estado)) {
            throw new common_1.BadRequestException('Solo se puede asignar docente en actividades en borrador o reasignación');
        }
        const profesor = await this.profesorRepository.findOne({
            where: { id: dto.profesorId },
            relations: ['taller'],
        });
        if (!profesor)
            throw new common_1.NotFoundException('Profesor no encontrado');
        const pendienteExistente = await this.asignacionRepository.findOne({
            where: { tallerId, estado: 'PENDIENTE' },
        });
        if (pendienteExistente) {
            throw new common_1.ConflictException('Ya hay una asignación pendiente para esta actividad');
        }
        await this.validarDisponibilidadDocente(dto.profesorId, taller);
        const asignacion = await this.asignacionRepository.save({
            tallerId,
            profesorId: dto.profesorId,
            estado: 'PENDIENTE',
        });
        taller.estado = 'ESPERA_DOCENTE';
        await this.tallerRepository.save(taller);
        await this.notificacionService.crearParaProfesor(dto.profesorId, 'Nueva asignación de actividad', `Fuiste asignado/a a la actividad "${taller.tipo}". Confirma tu disponibilidad en el panel de asignaciones.`, 'asignacion_actividad');
        return await this.asignacionRepository.findOne({
            where: { id: asignacion.id },
            relations: ['taller', 'profesor'],
        });
    }
    async responderAsignacion(asignacionId, profesorId, dto) {
        const asignacion = await this.asignacionRepository.findOne({
            where: { id: asignacionId },
            relations: ['taller', 'profesor'],
        });
        if (!asignacion)
            throw new common_1.NotFoundException('Asignación no encontrada');
        if (asignacion.profesorId !== profesorId) {
            throw new common_1.BadRequestException('No puedes responder esta asignación');
        }
        if (asignacion.estado !== 'PENDIENTE') {
            throw new common_1.BadRequestException('Esta asignación ya fue respondida');
        }
        asignacion.respondedAt = new Date();
        if (dto.acepta) {
            asignacion.estado = 'ACEPTADA';
            asignacion.taller.estado = 'ESPERA_HORARIO';
            asignacion.profesor.tallerId = asignacion.tallerId;
            await this.profesorRepository.save(asignacion.profesor);
            await this.tallerRepository.save(asignacion.taller);
            await this.notificacionService.crearParaProfesor(profesorId, 'Asignación confirmada', `Aceptaste la actividad "${asignacion.taller.tipo}". El coordinador definirá el horario y publicará el catálogo.`, 'asignacion_actividad');
        }
        else {
            asignacion.estado = 'RECHAZADA';
            asignacion.motivoRechazo = dto.motivoRechazo ?? null;
            asignacion.taller.estado = 'BORRADOR';
            await this.tallerRepository.save(asignacion.taller);
            const motivo = dto.motivoRechazo ? ` Motivo: ${dto.motivoRechazo}` : '';
            await this.notificacionService.notificarCoordinadores('Docente rechazó asignación', `El docente ${asignacion.profesor.nombre} rechazó la actividad "${asignacion.taller.tipo}".${motivo}`, 'asignacion_rechazada');
        }
        return await this.asignacionRepository.save(asignacion);
    }
    async definirHorario(tallerId, dto) {
        if ('horarios' in dto && Array.isArray(dto.horarios)) {
            return this.definirHorarios(tallerId, dto);
        }
        const simple = dto;
        return this.definirHorarios(tallerId, {
            modo: 'POR_CURSO',
            horarios: curso_constants_1.CURSOS_TALLER.map((c) => ({
                curso: c.code,
                diaSemana: simple.diaSemana,
                horaInicio: simple.horaInicio,
                horaFin: simple.horaFin,
            })),
        });
    }
    async definirHorarios(tallerId, dto) {
        const taller = await this.findOne(tallerId);
        if (taller.estado !== 'ESPERA_HORARIO') {
            throw new common_1.BadRequestException('La actividad debe tener docente confirmado antes de definir horario');
        }
        const asignacionAceptada = await this.asignacionRepository.findOne({
            where: { tallerId, estado: 'ACEPTADA' },
        });
        if (!asignacionAceptada) {
            throw new common_1.BadRequestException('No hay docente aceptado para esta actividad');
        }
        const filas = dto.horarios.filter((h) => h.diaSemana && h.horaInicio && h.horaFin);
        if (!filas.length) {
            throw new common_1.BadRequestException('Debes definir al menos un horario');
        }
        for (const h of filas) {
            if (h.horaInicio >= h.horaFin) {
                throw new common_1.BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
            }
            if (dto.modo === 'POR_CURSO' && !h.curso) {
                throw new common_1.BadRequestException('Cada horario por curso debe indicar el curso');
            }
            if (dto.modo === 'POR_SECCION' && !h.seccion?.trim()) {
                throw new common_1.BadRequestException('Cada horario por sección debe indicar la sección');
            }
            await this.validarConflictoHorarioDocente(asignacionAceptada.profesorId, h.diaSemana, h.horaInicio, h.horaFin, tallerId);
        }
        await this.tallerHorarioRepository.delete({ tallerId });
        const entities = filas.map((h) => this.tallerHorarioRepository.create({
            tallerId,
            curso: dto.modo === 'POR_CURSO' ? h.curso : null,
            seccion: dto.modo === 'POR_SECCION' ? h.seccion.trim().toUpperCase() : null,
            diaSemana: h.diaSemana,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin,
        }));
        await this.tallerHorarioRepository.save(entities);
        const primero = filas[0];
        taller.modoHorario = dto.modo;
        taller.diaSemana = primero.diaSemana;
        taller.horaInicio = primero.horaInicio;
        taller.horaFin = primero.horaFin;
        return await this.tallerRepository.save(taller);
    }
    async getHorarios(tallerId) {
        await this.findOne(tallerId);
        return this.tallerHorarioRepository.find({
            where: { tallerId },
            order: { curso: 'ASC', seccion: 'ASC', diaSemana: 'ASC' },
        });
    }
    tieneHorarioDefinido(taller) {
        if (taller.horarios?.length)
            return true;
        return taller.diaSemana != null && !!taller.horaInicio && !!taller.horaFin;
    }
    async publicar(tallerId, dto) {
        const taller = await this.findOne(tallerId);
        if (taller.estado !== 'ESPERA_HORARIO') {
            throw new common_1.BadRequestException('Solo se publican actividades con horario definido');
        }
        if (!this.tieneHorarioDefinido(taller)) {
            throw new common_1.BadRequestException('Debes definir el horario antes de publicar');
        }
        const asignacion = await this.asignacionRepository.findOne({
            where: { tallerId, estado: 'ACEPTADA' },
        });
        if (!asignacion) {
            throw new common_1.BadRequestException('Debe haber un docente que haya aceptado la actividad');
        }
        taller.estado = 'PUBLICADO';
        taller.publicadoAt = new Date();
        taller.fechaAperturaInscripcion = dto.fechaAperturaInscripcion
            ? new Date(dto.fechaAperturaInscripcion)
            : null;
        taller.fechaCierreInscripcion = dto.fechaCierreInscripcion
            ? new Date(dto.fechaCierreInscripcion)
            : null;
        return await this.tallerRepository.save(taller);
    }
    async cerrarPeriodo(tallerId) {
        const taller = await this.findOne(tallerId);
        if (taller.estado !== 'PUBLICADO') {
            throw new common_1.BadRequestException('Solo se puede cerrar una actividad publicada');
        }
        taller.estado = 'CERRADO';
        taller.cerradoAt = new Date();
        return await this.tallerRepository.save(taller);
    }
    async getAsignacionesPendientes(profesorId) {
        return await this.asignacionRepository.find({
            where: { profesorId, estado: 'PENDIENTE' },
            relations: ['taller'],
            order: { createdAt: 'DESC' },
        });
    }
    async getReporteActividad(tallerId) {
        const taller = await this.findOne(tallerId);
        const inscripciones = await this.inscripcionRepository.find({
            where: { tallerId },
            relations: ['alumno'],
        });
        const asignacion = await this.asignacionRepository.findOne({
            where: { tallerId, estado: 'ACEPTADA' },
            relations: ['profesor'],
        });
        const periodo = await this.periodoService.getActivo();
        const sesiones = await this.sesionAsistenciaRepository.find({
            where: { tallerId, estado: 'CERRADA' },
            relations: ['registros'],
            order: { fecha: 'ASC' },
        });
        const reservas = await this.reservaRepository.find({
            where: { tallerId },
            order: { fecha: 'ASC' },
        });
        let registrosPresentes = 0;
        let registrosAusentes = 0;
        let registrosTardes = 0;
        for (const sesion of sesiones) {
            for (const reg of sesion.registros ?? []) {
                if (reg.estado === 'PRESENTE')
                    registrosPresentes++;
                else if (reg.estado === 'AUSENTE')
                    registrosAusentes++;
                else if (reg.estado === 'TARDE')
                    registrosTardes++;
            }
        }
        const totalSesiones = sesiones.length;
        const umbral = taller.umbralAusencias ?? 3;
        const asistenciaPorAlumno = (alumnoId) => {
            let presentes = 0;
            let ausentes = 0;
            let tardes = 0;
            for (const sesion of sesiones) {
                const reg = sesion.registros?.find((r) => r.alumnoId === alumnoId);
                if (!reg)
                    continue;
                if (reg.estado === 'PRESENTE')
                    presentes++;
                else if (reg.estado === 'AUSENTE')
                    ausentes++;
                else if (reg.estado === 'TARDE')
                    tardes++;
            }
            const porcentajeAsistencia = totalSesiones > 0 ? Math.round((presentes / totalSesiones) * 100) : 0;
            return {
                presentes,
                ausentes,
                tardes,
                totalSesiones,
                porcentajeAsistencia,
                alertaAusencia: ausentes >= umbral,
            };
        };
        const porEspacio = new Map();
        let minutosReservados = 0;
        for (const reserva of reservas) {
            porEspacio.set(reserva.espacio, (porEspacio.get(reserva.espacio) ?? 0) + 1);
            if (reserva.horaInicio && reserva.horaFin) {
                minutosReservados += Math.max(0, this.minutosDesdeHora(reserva.horaFin) - this.minutosDesdeHora(reserva.horaInicio));
            }
        }
        const formatFecha = (f) => f instanceof Date ? f.toISOString().split('T')[0] : String(f).split('T')[0];
        return {
            actividad: {
                id: taller.id,
                tipo: taller.tipo,
                estado: taller.estado,
                capacidad: taller.capacidad,
                horario: {
                    diaSemana: taller.diaSemana,
                    horaInicio: taller.horaInicio,
                    horaFin: taller.horaFin,
                },
                publicadoAt: taller.publicadoAt,
                cerradoAt: taller.cerradoAt,
            },
            docente: asignacion?.profesor
                ? { id: asignacion.profesor.id, nombre: asignacion.profesor.nombre }
                : null,
            periodoAcademico: periodo
                ? {
                    nombre: periodo.nombre,
                    fechaApertura: formatFecha(periodo.fechaApertura),
                    fechaCierre: formatFecha(periodo.fechaCierre),
                }
                : null,
            inscripciones: {
                total: inscripciones.length,
                pendientes: inscripciones.filter((i) => i.estado === 'PENDIENTE').length,
                aceptados: inscripciones.filter((i) => i.estado === 'ACEPTADO').length,
                rechazados: inscripciones.filter((i) => i.estado === 'RECHAZADO').length,
            },
            asistencia: {
                sesionesRealizadas: totalSesiones,
                registrosPresentes,
                registrosAusentes,
                registrosTardes,
                umbralAusencias: umbral,
            },
            utilizacionEspacios: {
                totalReservas: reservas.length,
                horasReservadas: Math.round((minutosReservados / 60) * 10) / 10,
                porEspacio: [...porEspacio.entries()].map(([espacio, cantidad]) => ({
                    espacio,
                    cantidad,
                })),
            },
            alumnos: inscripciones.map((i) => {
                const stats = i.estado === 'ACEPTADO' ? asistenciaPorAlumno(i.alumnoId) : null;
                return {
                    nombre: i.alumno?.nombre,
                    rut: i.alumno?.rut,
                    estado: i.estado,
                    ...(stats ?? {}),
                };
            }),
        };
    }
    minutosDesdeHora(hora) {
        const normalizada = hora.length >= 5 ? hora.slice(0, 5) : hora;
        const [h, m] = normalizada.split(':').map(Number);
        return (h ?? 0) * 60 + (m ?? 0);
    }
    inscripcionesAbiertas(taller, hoy) {
        const apertura = taller.fechaAperturaInscripcion
            ? new Date(taller.fechaAperturaInscripcion).toISOString().split('T')[0]
            : null;
        const cierre = taller.fechaCierreInscripcion
            ? new Date(taller.fechaCierreInscripcion).toISOString().split('T')[0]
            : null;
        if (apertura && hoy < apertura)
            return false;
        if (cierre && hoy > cierre)
            return false;
        return true;
    }
    async validarDisponibilidadDocente(profesorId, taller) {
        const asignacionesActivas = await this.asignacionRepository.find({
            where: {
                profesorId,
                estado: (0, typeorm_2.In)(['PENDIENTE', 'ACEPTADA']),
                tallerId: (0, typeorm_2.Not)(taller.id),
            },
            relations: ['taller'],
        });
        for (const asig of asignacionesActivas) {
            const otro = asig.taller;
            if (!otro || otro.estado === 'CERRADO' || otro.estado === 'BORRADOR')
                continue;
            if (asig.estado === 'PENDIENTE') {
                throw new common_1.ConflictException(`El docente ya tiene una asignación pendiente en "${otro.tipo}"`);
            }
            if (taller.diaSemana != null &&
                taller.horaInicio &&
                taller.horaFin &&
                otro.diaSemana != null &&
                otro.horaInicio &&
                otro.horaFin &&
                this.horariosSeSolapan(taller, otro)) {
                throw new common_1.ConflictException(`El docente tiene conflicto de horario con la actividad "${otro.tipo}"`);
            }
        }
    }
    async validarConflictoHorarioDocente(profesorId, diaSemana, horaInicio, horaFin, excluirTallerId) {
        const asignaciones = await this.asignacionRepository.find({
            where: { profesorId, estado: 'ACEPTADA' },
            relations: ['taller'],
        });
        const candidato = {
            diaSemana,
            horaInicio,
            horaFin,
        };
        for (const asig of asignaciones) {
            const otro = asig.taller;
            if (!otro || otro.id === excluirTallerId || otro.estado === 'CERRADO')
                continue;
            if (otro.diaSemana != null &&
                otro.horaInicio &&
                otro.horaFin &&
                this.horariosSeSolapan(candidato, otro)) {
                throw new common_1.ConflictException(`Conflicto de horario con la actividad "${otro.tipo}" del mismo docente`);
            }
        }
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
    async getComparacionSemestre(periodoId, profesorId) {
        const periodos = await this.periodoService.findAll();
        let periodo = null;
        if (periodoId) {
            periodo = periodos.find((p) => p.id === periodoId) ?? null;
            if (!periodo) {
                throw new common_1.NotFoundException(`Período con ID ${periodoId} no encontrado`);
            }
        }
        else {
            periodo = periodos.find((p) => p.activo) ?? periodos[0] ?? null;
        }
        const apertura = periodo ? this.fechaIso(periodo.fechaApertura) : '1900-01-01';
        const cierre = periodo ? this.fechaIso(periodo.fechaCierre) : '2099-12-31';
        const idxPeriodo = periodo ? periodos.findIndex((p) => p.id === periodo.id) : -1;
        const periodoAnterior = idxPeriodo >= 0 && idxPeriodo < periodos.length - 1 ? periodos[idxPeriodo + 1] : null;
        let tallerIdProfesor = null;
        if (profesorId) {
            const profesor = await this.profesorRepository.findOne({ where: { id: profesorId } });
            tallerIdProfesor = profesor?.tallerId ?? null;
        }
        const inscripciones = await this.inscripcionRepository.find({ relations: ['taller'] });
        const inscPeriodo = this.filtrarInscripcionesPorFechas(inscripciones, apertura, cierre);
        const inscAnterior = periodoAnterior
            ? this.filtrarInscripcionesPorFechas(inscripciones, this.fechaIso(periodoAnterior.fechaApertura), this.fechaIso(periodoAnterior.fechaCierre))
            : [];
        const tallerIds = [...new Set(inscPeriodo.map((i) => i.tallerId))];
        const talleres = tallerIds.length > 0
            ? await this.tallerRepository.find({ where: { id: (0, typeorm_2.In)(tallerIds) } })
            : [];
        const mapaTaller = new Map(talleres.map((t) => [t.id, t]));
        const statsMap = new Map();
        for (const insc of inscPeriodo) {
            const taller = insc.taller ?? mapaTaller.get(insc.tallerId);
            if (!taller)
                continue;
            if (!statsMap.has(insc.tallerId)) {
                statsMap.set(insc.tallerId, {
                    tallerId: taller.id,
                    tipo: taller.tipo,
                    capacidad: taller.capacidad,
                    estado: taller.estado,
                    horario: {
                        diaSemana: taller.diaSemana,
                        horaInicio: taller.horaInicio,
                        horaFin: taller.horaFin,
                    },
                    total: 0,
                    pendientes: 0,
                    aceptados: 0,
                    rechazados: 0,
                    ocupacionPct: 0,
                    demandaPct: 0,
                });
            }
            const stat = statsMap.get(insc.tallerId);
            stat.total += 1;
            if (insc.estado === 'PENDIENTE')
                stat.pendientes += 1;
            else if (insc.estado === 'ACEPTADO')
                stat.aceptados += 1;
            else if (insc.estado === 'RECHAZADO')
                stat.rechazados += 1;
        }
        const talleresStats = [...statsMap.values()].map((s) => {
            const cap = Math.max(s.capacidad, 1);
            return {
                ...s,
                ocupacionPct: Math.round((s.aceptados / cap) * 100),
                demandaPct: Math.round(((s.aceptados + s.pendientes) / cap) * 100),
            };
        });
        talleresStats.sort((a, b) => b.aceptados - a.aceptados || b.total - a.total);
        const ranking = talleresStats.map((t, i) => ({ ...t, posicion: i + 1 }));
        const porTipoActual = this.agruparAceptadosPorTipo(inscPeriodo);
        const porTipoAnterior = this.agruparAceptadosPorTipo(inscAnterior);
        const tipos = new Set([...Object.keys(porTipoActual), ...Object.keys(porTipoAnterior)]);
        const comparacionPorTipo = [...tipos].map((tipo) => {
            const actual = porTipoActual[tipo] ?? 0;
            const anterior = porTipoAnterior[tipo] ?? 0;
            const variacion = actual - anterior;
            const variacionPct = anterior > 0 ? Math.round((variacion / anterior) * 100) : actual > 0 ? 100 : 0;
            return { tipo, periodoActual: actual, periodoAnterior: anterior, variacion, variacionPct };
        });
        comparacionPorTipo.sort((a, b) => b.periodoActual - a.periodoActual);
        const sugerencias = this.generarSugerenciasTalleres(ranking, comparacionPorTipo);
        const resumen = {
            totalTalleres: ranking.length,
            totalInscripciones: inscPeriodo.length,
            totalAceptados: inscPeriodo.filter((i) => i.estado === 'ACEPTADO').length,
            totalPendientes: inscPeriodo.filter((i) => i.estado === 'PENDIENTE').length,
            tallerMasOcupado: ranking[0]?.tipo ?? null,
            promedioOcupacion: ranking.length > 0
                ? Math.round(ranking.reduce((acc, t) => acc + t.ocupacionPct, 0) / ranking.length)
                : 0,
        };
        const miTaller = tallerIdProfesor != null
            ? ranking.find((t) => t.tallerId === tallerIdProfesor) ?? null
            : null;
        return {
            periodo: periodo
                ? {
                    id: periodo.id,
                    nombre: periodo.nombre,
                    fechaApertura: apertura,
                    fechaCierre: cierre,
                    activo: periodo.activo,
                }
                : null,
            periodoAnterior: periodoAnterior
                ? {
                    id: periodoAnterior.id,
                    nombre: periodoAnterior.nombre,
                    fechaApertura: this.fechaIso(periodoAnterior.fechaApertura),
                    fechaCierre: this.fechaIso(periodoAnterior.fechaCierre),
                }
                : null,
            resumen,
            ranking,
            comparacionPorTipo,
            sugerencias,
            miTaller,
            periodosDisponibles: periodos.map((p) => ({
                id: p.id,
                nombre: p.nombre,
                fechaApertura: this.fechaIso(p.fechaApertura),
                fechaCierre: this.fechaIso(p.fechaCierre),
                activo: p.activo,
            })),
        };
    }
    fechaIso(fecha) {
        return new Date(fecha).toISOString().split('T')[0];
    }
    filtrarInscripcionesPorFechas(inscripciones, apertura, cierre) {
        return inscripciones.filter((i) => {
            const d = this.fechaIso(i.createdAt);
            return d >= apertura && d <= cierre;
        });
    }
    agruparAceptadosPorTipo(inscripciones) {
        const map = {};
        for (const insc of inscripciones) {
            if (insc.estado !== 'ACEPTADO')
                continue;
            const tipo = insc.taller?.tipo ?? `Taller #${insc.tallerId}`;
            map[tipo] = (map[tipo] ?? 0) + 1;
        }
        return map;
    }
    generarSugerenciasTalleres(ranking, comparacionPorTipo) {
        const sugerencias = [];
        for (const t of ranking) {
            if (t.ocupacionPct >= 85 || t.demandaPct >= 100) {
                sugerencias.push({
                    tipo: 'ALTA_DEMANDA',
                    prioridad: 'alta',
                    mensaje: `"${t.tipo}" alcanzó ${t.ocupacionPct}% de ocupación (${t.aceptados}/${t.capacidad} cupos). Considera abrir otra sección o ampliar cupos.`,
                    tallerId: t.tallerId,
                    tallerTipo: t.tipo,
                });
            }
            else if (t.ocupacionPct < 35 && t.total >= 3) {
                sugerencias.push({
                    tipo: 'BAJA_OCUPACION',
                    prioridad: 'media',
                    mensaje: `"${t.tipo}" tiene baja ocupación (${t.ocupacionPct}%). Evalúa cambiar horario, promover la actividad o reemplazarla.`,
                    tallerId: t.tallerId,
                    tallerTipo: t.tipo,
                });
            }
        }
        const porTipo = new Map();
        for (const t of ranking) {
            const prev = porTipo.get(t.tipo) ?? { aceptados: 0, talleres: 0, ocupacionSum: 0 };
            prev.aceptados += t.aceptados;
            prev.talleres += 1;
            prev.ocupacionSum += t.ocupacionPct;
            porTipo.set(t.tipo, prev);
        }
        for (const [tipo, data] of porTipo) {
            const promedioOcup = Math.round(data.ocupacionSum / data.talleres);
            if (data.aceptados >= 20 || promedioOcup >= 80) {
                sugerencias.push({
                    tipo: 'NUEVO_TALLER',
                    prioridad: 'alta',
                    mensaje: `Alta demanda en "${tipo}" (${data.aceptados} alumnos aceptados). Sugerencia: ofrecer otro taller de ${tipo} el próximo semestre.`,
                    tallerTipo: tipo,
                });
            }
        }
        for (const c of comparacionPorTipo) {
            if (c.periodoActual >= 15 && c.variacion > 0) {
                sugerencias.push({
                    tipo: 'REPETIR_EXITOSO',
                    prioridad: 'media',
                    mensaje: `"${c.tipo}" mantiene buena convocatoria (${c.periodoActual} alumnos, +${c.variacion} vs período anterior). Conviene repetirlo.`,
                    tallerTipo: c.tipo,
                });
            }
        }
        const vistos = new Set();
        return sugerencias.filter((s) => {
            const key = `${s.tipo}-${s.tallerTipo ?? ''}-${s.tallerId ?? ''}`;
            if (vistos.has(key))
                return false;
            vistos.add(key);
            return true;
        });
    }
};
exports.TallerService = TallerService;
exports.TallerService = TallerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(taller_entity_1.Taller)),
    __param(1, (0, typeorm_1.InjectRepository)(profesor_entity_1.Profesor)),
    __param(2, (0, typeorm_1.InjectRepository)(asignacion_docente_entity_1.AsignacionDocente)),
    __param(3, (0, typeorm_1.InjectRepository)(inscripcion_taller_entity_1.InscripcionTaller)),
    __param(4, (0, typeorm_1.InjectRepository)(sesion_asistencia_entity_1.SesionAsistencia)),
    __param(5, (0, typeorm_1.InjectRepository)(reserva_entity_1.Reserva)),
    __param(6, (0, typeorm_1.InjectRepository)(taller_horario_entity_1.TallerHorario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notificacion_service_1.NotificacionService,
        periodo_service_1.PeriodoService])
], TallerService);
//# sourceMappingURL=taller.service.js.map