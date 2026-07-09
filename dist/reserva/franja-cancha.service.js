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
exports.FranjaCanchaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const franja_cancha_entity_1 = require("../entities/franja-cancha.entity");
const cancha_constants_1 = require("./cancha.constants");
let FranjaCanchaService = class FranjaCanchaService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async findAll(espacio = cancha_constants_1.CANCHA_ESPACIO_DEFAULT) {
        return this.repo.find({
            where: { espacio },
            order: { diaSemana: 'ASC', horaInicio: 'ASC' },
        });
    }
    async findActivasPorDia(diaSemana, espacio = cancha_constants_1.CANCHA_ESPACIO_DEFAULT) {
        return this.repo.find({
            where: { espacio, diaSemana, activa: true },
            order: { horaInicio: 'ASC' },
        });
    }
    async buscarFranja(espacio, diaSemana, horaInicio) {
        return ((await this.repo.findOne({
            where: { espacio, diaSemana, horaInicio: `${horaInicio}:00` },
        })) ??
            (await this.repo.findOne({
                where: { espacio, diaSemana, horaInicio },
            })));
    }
    async actualizar(dto) {
        const espacio = dto.espacio ?? cancha_constants_1.CANCHA_ESPACIO_DEFAULT;
        for (const item of dto.franjas) {
            const horaInicio = (0, cancha_constants_1.normalizarHora)(item.horaInicio);
            const duracion = item.duracionMinutos ?? cancha_constants_1.CANCHA_DURACION_SLOT_MIN;
            const horaFin = (0, cancha_constants_1.sumarMinutosAHora)(horaInicio, duracion);
            let franja = await this.buscarFranja(espacio, item.diaSemana, horaInicio);
            if (franja) {
                if (franja.paraTodos) {
                    franja.activa = true;
                }
                else {
                    franja.activa = item.activa;
                }
                franja.horaFin = `${horaFin}:00`;
                await this.repo.save(franja);
                if (duracion > cancha_constants_1.CANCHA_DURACION_SLOT_MIN && franja.activa) {
                    await this.ocultarFranjasCubiertas(espacio, item.diaSemana, horaInicio, duracion);
                }
            }
            else {
                const esParaTodos = (0, cancha_constants_1.esHorarioParaTodos)(horaInicio) && duracion === cancha_constants_1.CANCHA_DURACION_SLOT_MIN;
                await this.repo.save(this.repo.create({
                    espacio,
                    diaSemana: item.diaSemana,
                    horaInicio: `${horaInicio}:00`,
                    horaFin: `${horaFin}:00`,
                    activa: esParaTodos ? true : item.activa,
                    paraTodos: esParaTodos,
                }));
                if (duracion > cancha_constants_1.CANCHA_DURACION_SLOT_MIN && item.activa) {
                    await this.ocultarFranjasCubiertas(espacio, item.diaSemana, horaInicio, duracion);
                }
            }
        }
        return this.findAll(espacio);
    }
    async ocultarFranjasCubiertas(espacio, diaSemana, horaInicio, duracion) {
        const pasos = duracion / cancha_constants_1.CANCHA_DURACION_SLOT_MIN;
        for (let i = 1; i < pasos; i++) {
            const cubiertaInicio = (0, cancha_constants_1.sumarMinutosAHora)(horaInicio, i * cancha_constants_1.CANCHA_DURACION_SLOT_MIN);
            const cubierta = await this.buscarFranja(espacio, diaSemana, cubiertaInicio);
            if (cubierta && !cubierta.paraTodos) {
                cubierta.activa = false;
                cubierta.horaFin = `${(0, cancha_constants_1.sumarMinutosAHora)(cubiertaInicio, cancha_constants_1.CANCHA_DURACION_SLOT_MIN)}:00`;
                await this.repo.save(cubierta);
            }
        }
    }
    necesitaMigracionMediaHora(franjas) {
        if (franjas.length === 0)
            return false;
        return !franjas.some((f) => (0, cancha_constants_1.normalizarHora)(f.horaInicio).endsWith(':30'));
    }
    async migrarFranjasMediaHora(espacio, existentes) {
        const mapa = new Map();
        for (const f of existentes) {
            mapa.set(`${f.diaSemana}|${(0, cancha_constants_1.normalizarHora)(f.horaInicio)}`, f);
        }
        await this.repo.delete({ espacio });
        await this.crearFranjasBase30Min(espacio, mapa);
    }
    async crearFranjasBase30Min(espacio, mapaAnterior = new Map()) {
        const filas = [];
        for (let dia = 1; dia <= 7; dia++) {
            for (const horaInicio of (0, cancha_constants_1.iterarIniciosSlotCancha)()) {
                const anterior = mapaAnterior.get(`${dia}|${horaInicio}`);
                const horaPadre = `${horaInicio.split(':')[0]}:00`;
                const padre = mapaAnterior.get(`${dia}|${horaPadre}`);
                const paraTodos = (0, cancha_constants_1.esHorarioParaTodos)(horaInicio);
                const activa = paraTodos ? true : (anterior?.activa ?? padre?.activa ?? true);
                filas.push({
                    espacio,
                    diaSemana: dia,
                    horaInicio: `${horaInicio}:00`,
                    horaFin: `${(0, cancha_constants_1.sumarMinutosAHora)(horaInicio, cancha_constants_1.CANCHA_DURACION_SLOT_MIN)}:00`,
                    activa,
                    paraTodos,
                });
            }
        }
        await this.repo.save(filas.map((f) => this.repo.create(f)));
    }
    async asegurarFranjasBase(espacio = cancha_constants_1.CANCHA_ESPACIO_DEFAULT) {
        const existentes = await this.findAll(espacio);
        if (this.necesitaMigracionMediaHora(existentes)) {
            await this.migrarFranjasMediaHora(espacio, existentes);
            return;
        }
        if (existentes.length === 0) {
            await this.crearFranjasBase30Min(espacio);
            return;
        }
        await this.repo
            .createQueryBuilder()
            .update(franja_cancha_entity_1.FranjaCancha)
            .set({ activa: false })
            .where('espacio = :espacio', { espacio })
            .andWhere('(EXTRACT(HOUR FROM hora_inicio) * 60 + EXTRACT(MINUTE FROM hora_inicio) < :inicio OR EXTRACT(HOUR FROM hora_inicio) * 60 + EXTRACT(MINUTE FROM hora_inicio) >= :fin)', { inicio: cancha_constants_1.CANCHA_HORA_INICIO * 60, fin: cancha_constants_1.CANCHA_HORA_FIN * 60 })
            .execute();
        await this.repo
            .createQueryBuilder()
            .update(franja_cancha_entity_1.FranjaCancha)
            .set({ paraTodos: true, activa: true })
            .where('espacio = :espacio', { espacio })
            .andWhere('EXTRACT(HOUR FROM hora_inicio) * 60 + EXTRACT(MINUTE FROM hora_inicio) >= :ini AND EXTRACT(HOUR FROM hora_inicio) * 60 + EXTRACT(MINUTE FROM hora_inicio) < :fin', { ini: 13 * 60, fin: 14 * 60 })
            .execute();
    }
};
exports.FranjaCanchaService = FranjaCanchaService;
exports.FranjaCanchaService = FranjaCanchaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(franja_cancha_entity_1.FranjaCancha)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], FranjaCanchaService);
//# sourceMappingURL=franja-cancha.service.js.map