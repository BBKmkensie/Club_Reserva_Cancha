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
var ReservaCanchaSeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservaCanchaSeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const taller_entity_1 = require("../entities/taller.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
const reserva_entity_1 = require("../entities/reserva.entity");
const periodo_academico_entity_1 = require("../entities/periodo-academico.entity");
const catalogo_talleres_pool_1 = require("../common/catalogo-talleres.pool");
const reservas_cancha_deportes_pool_1 = require("../common/reservas-cancha-deportes.pool");
const franja_cancha_service_1 = require("./franja-cancha.service");
const cancha_constants_1 = require("./cancha.constants");
let ReservaCanchaSeedService = ReservaCanchaSeedService_1 = class ReservaCanchaSeedService {
    tallerRepo;
    profesorRepo;
    reservaRepo;
    periodoRepo;
    franjaCanchaService;
    logger = new common_1.Logger(ReservaCanchaSeedService_1.name);
    constructor(tallerRepo, profesorRepo, reservaRepo, periodoRepo, franjaCanchaService) {
        this.tallerRepo = tallerRepo;
        this.profesorRepo = profesorRepo;
        this.reservaRepo = reservaRepo;
        this.periodoRepo = periodoRepo;
        this.franjaCanchaService = franjaCanchaService;
    }
    async seedReservasDeportesSemestre(espacio = cancha_constants_1.CANCHA_ESPACIO_DEFAULT) {
        await this.franjaCanchaService.asegurarFranjasBase(espacio);
        const periodo = await this.resolverPeriodo();
        const inicio = (0, cancha_constants_1.parseFechaIso)(periodo.fechaApertura);
        const fin = (0, cancha_constants_1.parseFechaIso)(periodo.fechaCierre);
        const talleresDb = await this.tallerRepo.find({ relations: ['profesores'] });
        const porNombre = new Map();
        for (const t of talleresDb) {
            porNombre.set((0, catalogo_talleres_pool_1.normalizarNombreTaller)(t.tipo), t);
            for (const alias of this.aliasDe(t.tipo)) {
                porNombre.set(alias, t);
            }
        }
        const result = {
            periodo: {
                inicio,
                fin,
                nombre: periodo.nombre,
            },
            talleres: [],
            totalCreadas: 0,
            totalOmitidas: 0,
        };
        for (const item of (0, reservas_cancha_deportes_pool_1.horariosCanchaDeportesSemestre)()) {
            const claves = [
                (0, catalogo_talleres_pool_1.normalizarNombreTaller)(item.tipo),
                ...(item.alias ?? []).map(catalogo_talleres_pool_1.normalizarNombreTaller),
            ];
            const taller = claves.map((k) => porNombre.get(k)).find(Boolean);
            if (!taller) {
                this.logger.warn(`Taller no encontrado para reservas de cancha: ${item.tipo}`);
                continue;
            }
            const profesor = taller.profesores?.[0] ??
                (await this.profesorRepo.findOne({ where: { tallerId: taller.id } }));
            for (const bloque of item.bloques) {
                const slots = this.slotsDesdeBloque(bloque.horaInicio, bloque.horaFin);
                let creadas = 0;
                let omitidas = 0;
                for (const fecha of this.iterarFechas(inicio, fin)) {
                    if ((0, cancha_constants_1.diaSemanaDesdeFecha)(fecha) !== bloque.diaSemana)
                        continue;
                    for (const slot of slots) {
                        const existe = await this.reservaRepo.findOne({
                            where: {
                                espacio,
                                fecha: (0, cancha_constants_1.fechaLocal)(fecha),
                                horaInicio: `${slot.inicio}:00`,
                            },
                        });
                        if (existe) {
                            omitidas++;
                            continue;
                        }
                        await this.reservaRepo.save(this.reservaRepo.create({
                            espacio,
                            fecha: (0, cancha_constants_1.fechaLocal)(fecha),
                            horaInicio: `${slot.inicio}:00`,
                            horaFin: `${slot.fin}:00`,
                            tallerId: taller.id,
                            profesorId: profesor?.id ?? null,
                            adminId: null,
                        }));
                        creadas++;
                    }
                }
                result.talleres.push({
                    tipo: taller.tipo,
                    diaSemana: bloque.diaSemana,
                    horario: `${bloque.horaInicio}–${bloque.horaFin}`,
                    reservasCreadas: creadas,
                    reservasOmitidas: omitidas,
                });
                result.totalCreadas += creadas;
                result.totalOmitidas += omitidas;
            }
        }
        return result;
    }
    async resolverPeriodo() {
        const activo = await this.periodoRepo.findOne({
            where: { activo: true },
            order: { id: 'DESC' },
        });
        if (activo)
            return activo;
        const year = new Date().getFullYear();
        return this.periodoRepo.create({
            nombre: `Semestre ${year} (automático)`,
            fechaApertura: new Date(`${year}-03-01T12:00:00`),
            fechaCierre: new Date(`${year}-12-20T12:00:00`),
            activo: false,
        });
    }
    iterarFechas(inicio, fin) {
        const fechas = [];
        let cur = inicio;
        while (cur <= fin) {
            fechas.push(cur);
            cur = (0, cancha_constants_1.sumarDias)(cur, 1);
        }
        return fechas;
    }
    slotsDesdeBloque(horaInicio, horaFin) {
        const slots = [];
        let cur = (0, cancha_constants_1.normalizarHora)(horaInicio);
        const finMin = (0, cancha_constants_1.horaAMinutos)(horaFin);
        while ((0, cancha_constants_1.horaAMinutos)(cur) < finMin) {
            const slotFin = (0, cancha_constants_1.sumarMinutosAHora)(cur, cancha_constants_1.CANCHA_DURACION_SLOT_MIN);
            if ((0, cancha_constants_1.horaAMinutos)(slotFin) > finMin)
                break;
            slots.push({ inicio: cur, fin: slotFin });
            cur = slotFin;
        }
        return slots;
    }
    aliasDe(tipo) {
        const n = (0, catalogo_talleres_pool_1.normalizarNombreTaller)(tipo);
        const map = {
            futbol: ['futsal'],
            voley: ['voleibol'],
        };
        return map[n] ?? [];
    }
};
exports.ReservaCanchaSeedService = ReservaCanchaSeedService;
exports.ReservaCanchaSeedService = ReservaCanchaSeedService = ReservaCanchaSeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(taller_entity_1.Taller)),
    __param(1, (0, typeorm_1.InjectRepository)(profesor_entity_1.Profesor)),
    __param(2, (0, typeorm_1.InjectRepository)(reserva_entity_1.Reserva)),
    __param(3, (0, typeorm_1.InjectRepository)(periodo_academico_entity_1.PeriodoAcademico)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        franja_cancha_service_1.FranjaCanchaService])
], ReservaCanchaSeedService);
//# sourceMappingURL=reserva-cancha-seed.service.js.map