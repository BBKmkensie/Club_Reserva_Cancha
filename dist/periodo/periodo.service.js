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
exports.PeriodoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const periodo_academico_entity_1 = require("../entities/periodo-academico.entity");
let PeriodoService = class PeriodoService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async getActivo() {
        return await this.repo.findOne({ where: { activo: true }, order: { id: 'DESC' } });
    }
    async findAll() {
        return await this.repo.find({ order: { id: 'DESC' } });
    }
    async configurar(dto) {
        if (dto.fechaApertura > dto.fechaCierre) {
            throw new common_1.BadRequestException('La fecha de apertura debe ser anterior a la de cierre');
        }
        await this.repo.update({ activo: true }, { activo: false });
        const periodo = this.repo.create({
            nombre: dto.nombre ?? 'Período actual',
            fechaApertura: new Date(dto.fechaApertura),
            fechaCierre: new Date(dto.fechaCierre),
            activo: true,
        });
        return await this.repo.save(periodo);
    }
    inscripcionesAbiertasEnPeriodo(periodo, hoy) {
        if (!periodo)
            return true;
        const apertura = new Date(periodo.fechaApertura).toISOString().split('T')[0];
        const cierre = new Date(periodo.fechaCierre).toISOString().split('T')[0];
        return hoy >= apertura && hoy <= cierre;
    }
    mensajePeriodoCerrado(periodo, hoy) {
        if (!periodo)
            return null;
        const apertura = new Date(periodo.fechaApertura).toISOString().split('T')[0];
        const cierre = new Date(periodo.fechaCierre).toISOString().split('T')[0];
        if (hoy < apertura)
            return `El período académico abre el ${apertura}`;
        if (hoy > cierre)
            return `El período académico cerró el ${cierre}`;
        return null;
    }
};
exports.PeriodoService = PeriodoService;
exports.PeriodoService = PeriodoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(periodo_academico_entity_1.PeriodoAcademico)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PeriodoService);
//# sourceMappingURL=periodo.service.js.map