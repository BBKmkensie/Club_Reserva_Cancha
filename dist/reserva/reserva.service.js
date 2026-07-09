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
exports.ReservaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reserva_entity_1 = require("../entities/reserva.entity");
const franja_cancha_entity_1 = require("../entities/franja-cancha.entity");
const franja_cancha_service_1 = require("./franja-cancha.service");
const cancha_constants_1 = require("./cancha.constants");
let ReservaService = class ReservaService {
    reservaRepository;
    franjaRepository;
    franjaCanchaService;
    constructor(reservaRepository, franjaRepository, franjaCanchaService) {
        this.reservaRepository = reservaRepository;
        this.franjaRepository = franjaRepository;
        this.franjaCanchaService = franjaCanchaService;
    }
    async obtenerDisponibilidad(fecha, espacio = cancha_constants_1.CANCHA_ESPACIO_DEFAULT) {
        await this.franjaCanchaService.asegurarFranjasBase(espacio);
        const diaSemana = (0, cancha_constants_1.diaSemanaDesdeFecha)(fecha);
        const franjas = await this.franjaRepository.find({
            where: { espacio, diaSemana },
            order: { horaInicio: 'ASC' },
        });
        const reservas = await this.reservaRepository.find({
            where: { espacio, fecha: (0, cancha_constants_1.fechaLocal)(fecha) },
            relations: ['taller', 'profesor'],
        });
        const franjasActivas = franjas.filter((f) => f.activa);
        const slots = [];
        for (const franja of franjasActivas) {
            const horaInicio = (0, cancha_constants_1.normalizarHora)(franja.horaInicio);
            const horaFin = (0, cancha_constants_1.normalizarHora)(franja.horaFin);
            const duracionMinutos = Math.max(cancha_constants_1.CANCHA_DURACION_SLOT_MIN, (0, cancha_constants_1.horaAMinutos)(horaFin) - (0, cancha_constants_1.horaAMinutos)(horaInicio));
            const reserva = reservas.find((r) => (0, cancha_constants_1.horariosSolapan)(horaInicio, horaFin, (0, cancha_constants_1.normalizarHora)(r.horaInicio), (0, cancha_constants_1.normalizarHora)(r.horaFin)));
            if (reserva) {
                slots.push({
                    horaInicio,
                    horaFin,
                    espacio,
                    estado: 'ocupada',
                    duracionMinutos,
                    paraTodos: franja.paraTodos,
                    reservaId: reserva.id,
                    tallerId: reserva.tallerId,
                    tallerNombre: reserva.taller?.tipo,
                    profesorNombre: reserva.profesor?.nombre,
                });
            }
            else {
                slots.push({
                    horaInicio,
                    horaFin,
                    espacio,
                    estado: 'disponible',
                    duracionMinutos,
                    paraTodos: franja.paraTodos,
                });
            }
        }
        return slots;
    }
    async obtenerDisponibilidadSemana(fechaInicio, espacio = cancha_constants_1.CANCHA_ESPACIO_DEFAULT) {
        const lunes = (0, cancha_constants_1.lunesDeSemana)(fechaInicio);
        const dias = [];
        for (let i = 0; i < 7; i++) {
            const fecha = (0, cancha_constants_1.sumarDias)(lunes, i);
            dias.push({
                fecha,
                diaSemana: (0, cancha_constants_1.diaSemanaDesdeFecha)(fecha),
                slots: await this.obtenerDisponibilidad(fecha, espacio),
            });
        }
        return dias;
    }
    async validarReserva(dto, excluirReservaId) {
        const espacio = dto.espacio || cancha_constants_1.CANCHA_ESPACIO_DEFAULT;
        const horaInicio = (0, cancha_constants_1.normalizarHora)(dto.horaInicio);
        const horaFin = (0, cancha_constants_1.normalizarHora)(dto.horaFin);
        if (!horaInicio || !horaFin) {
            throw new common_1.BadRequestException('Debe indicar hora de inicio y fin');
        }
        const inicioMin = (0, cancha_constants_1.horaAMinutos)(horaInicio);
        const finMin = (0, cancha_constants_1.horaAMinutos)(horaFin);
        const duracionReserva = finMin - inicioMin;
        if (duracionReserva < cancha_constants_1.CANCHA_DURACION_SLOT_MIN) {
            throw new common_1.BadRequestException('La hora de fin debe ser posterior a la de inicio');
        }
        if (duracionReserva % cancha_constants_1.CANCHA_DURACION_SLOT_MIN !== 0) {
            throw new common_1.BadRequestException(`Las reservas deben ser en bloques de ${cancha_constants_1.CANCHA_DURACION_SLOT_MIN} minutos`);
        }
        if (inicioMin < cancha_constants_1.CANCHA_HORA_INICIO * 60 || finMin > cancha_constants_1.CANCHA_HORA_FIN * 60) {
            throw new common_1.BadRequestException(`Horario fuera del rango permitido (${(0, cancha_constants_1.formatHoraSlot)(cancha_constants_1.CANCHA_HORA_INICIO)}–${(0, cancha_constants_1.formatHoraSlot)(cancha_constants_1.CANCHA_HORA_FIN)})`);
        }
        const fechaIso = (0, cancha_constants_1.parseFechaIso)(dto.fecha);
        const diaSemana = (0, cancha_constants_1.diaSemanaDesdeFecha)(fechaIso);
        const franja = (await this.franjaRepository.findOne({
            where: { espacio, diaSemana, horaInicio: `${horaInicio}:00` },
        })) ??
            (await this.franjaRepository.findOne({
                where: { espacio, diaSemana, horaInicio },
            }));
        if (!franja?.activa) {
            throw new common_1.BadRequestException('Este horario no está habilitado por la directiva para reservas');
        }
        const franjaFin = (0, cancha_constants_1.normalizarHora)(franja.horaFin);
        const franjaDuracion = (0, cancha_constants_1.horaAMinutos)(franjaFin) - (0, cancha_constants_1.horaAMinutos)((0, cancha_constants_1.normalizarHora)(franja.horaInicio));
        if (duracionReserva !== franjaDuracion) {
            const etiquetaDuracion = franjaDuracion % 60 === 0
                ? `${franjaDuracion / 60} h`
                : `${franjaDuracion} min`;
            throw new common_1.BadRequestException(`Esta franja es de ${etiquetaDuracion} (${(0, cancha_constants_1.normalizarHora)(franja.horaInicio)}–${franjaFin}). ` +
                (franjaDuracion === cancha_constants_1.CANCHA_DURACION_SLOT_MIN
                    ? `Las reservas son de ${cancha_constants_1.CANCHA_DURACION_SLOT_MIN} minutos; la directiva puede ampliar franjas específicas.`
                    : 'Debe reservar el bloque completo.'));
        }
        const solapadas = await this.reservaRepository
            .createQueryBuilder('r')
            .leftJoinAndSelect('r.taller', 'taller')
            .where('r.espacio = :espacio', { espacio })
            .andWhere('r.fecha = :fecha::date', { fecha: fechaIso })
            .andWhere('r.hora_inicio < :fin::time', { fin: `${horaFin}:00` })
            .andWhere('r.hora_fin > :inicio::time', { inicio: `${horaInicio}:00` })
            .getMany();
        const existente = solapadas.find((r) => r.id !== excluirReservaId);
        if (existente) {
            throw new common_1.ConflictException(`La cancha ya está ocupada de ${horaInicio} a ${horaFin}` +
                (existente.taller?.tipo ? ` (conflicto con "${existente.taller.tipo}")` : ''));
        }
    }
    async create(createReservaDto) {
        await this.validarReserva(createReservaDto);
        const horaInicio = (0, cancha_constants_1.normalizarHora)(createReservaDto.horaInicio);
        const horaFin = (0, cancha_constants_1.normalizarHora)(createReservaDto.horaFin);
        const reserva = this.reservaRepository.create({
            espacio: createReservaDto.espacio || cancha_constants_1.CANCHA_ESPACIO_DEFAULT,
            fecha: (0, cancha_constants_1.fechaLocal)(createReservaDto.fecha),
            horaInicio: `${horaInicio}:00`,
            horaFin: `${horaFin}:00`,
            tallerId: createReservaDto.tallerId,
            adminId: createReservaDto.adminId ?? null,
            profesorId: createReservaDto.profesorId ?? null,
        });
        try {
            return await this.reservaRepository.save(reserva);
        }
        catch (err) {
            if (err?.code === '23505') {
                throw new common_1.ConflictException(`La cancha ya está ocupada de ${horaInicio} a ${horaFin} en esa fecha`);
            }
            throw err;
        }
    }
    async findAll() {
        return await this.reservaRepository.find({
            relations: ['taller', 'admin', 'profesor'],
            order: { fecha: 'DESC', horaInicio: 'ASC' },
        });
    }
    async findOne(id) {
        const reserva = await this.reservaRepository.findOne({
            where: { id },
            relations: ['taller', 'admin', 'profesor'],
        });
        if (!reserva) {
            throw new common_1.NotFoundException(`Reserva con ID ${id} no encontrada`);
        }
        return reserva;
    }
    async findByTaller(tallerId) {
        return await this.reservaRepository.find({
            where: { tallerId },
            relations: ['taller', 'admin', 'profesor'],
            order: { fecha: 'DESC', horaInicio: 'ASC' },
        });
    }
    async findByFecha(fecha) {
        return await this.reservaRepository.find({
            where: { fecha: (0, cancha_constants_1.fechaLocal)(fecha) },
            relations: ['taller', 'admin', 'profesor'],
            order: { horaInicio: 'ASC' },
        });
    }
    async update(id, updateReservaDto) {
        const reserva = await this.findOne(id);
        const merged = {
            espacio: updateReservaDto.espacio ?? reserva.espacio,
            fecha: updateReservaDto.fecha ?? reserva.fecha,
            horaInicio: updateReservaDto.horaInicio ?? reserva.horaInicio,
            horaFin: updateReservaDto.horaFin ?? reserva.horaFin,
            tallerId: updateReservaDto.tallerId ?? reserva.tallerId,
            adminId: updateReservaDto.adminId ?? reserva.adminId ?? undefined,
            profesorId: updateReservaDto.profesorId ?? reserva.profesorId ?? undefined,
        };
        if (updateReservaDto.fecha) {
            merged.fecha = (0, cancha_constants_1.parseFechaIso)(updateReservaDto.fecha);
        }
        else if (reserva.fecha) {
            merged.fecha = (0, cancha_constants_1.parseFechaIso)(reserva.fecha);
        }
        await this.validarReserva(merged, id);
        Object.assign(reserva, {
            espacio: merged.espacio,
            fecha: (0, cancha_constants_1.fechaLocal)(merged.fecha),
            horaInicio: `${(0, cancha_constants_1.normalizarHora)(merged.horaInicio)}:00`,
            horaFin: `${(0, cancha_constants_1.normalizarHora)(merged.horaFin)}:00`,
            tallerId: merged.tallerId,
            adminId: merged.adminId ?? null,
            profesorId: merged.profesorId ?? null,
        });
        return await this.reservaRepository.save(reserva);
    }
    async remove(id) {
        const reserva = await this.findOne(id);
        await this.reservaRepository.remove(reserva);
    }
};
exports.ReservaService = ReservaService;
exports.ReservaService = ReservaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reserva_entity_1.Reserva)),
    __param(1, (0, typeorm_1.InjectRepository)(franja_cancha_entity_1.FranjaCancha)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        franja_cancha_service_1.FranjaCanchaService])
], ReservaService);
//# sourceMappingURL=reserva.service.js.map