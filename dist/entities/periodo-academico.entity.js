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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodoAcademico = void 0;
const typeorm_1 = require("typeorm");
let PeriodoAcademico = class PeriodoAcademico {
    id;
    nombre;
    fechaApertura;
    fechaCierre;
    activo;
    createdAt;
};
exports.PeriodoAcademico = PeriodoAcademico;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PeriodoAcademico.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, default: 'Período actual' }),
    __metadata("design:type", String)
], PeriodoAcademico.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', name: 'fecha_apertura' }),
    __metadata("design:type", Date)
], PeriodoAcademico.prototype, "fechaApertura", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', name: 'fecha_cierre' }),
    __metadata("design:type", Date)
], PeriodoAcademico.prototype, "fechaCierre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PeriodoAcademico.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PeriodoAcademico.prototype, "createdAt", void 0);
exports.PeriodoAcademico = PeriodoAcademico = __decorate([
    (0, typeorm_1.Entity)('periodo_academico')
], PeriodoAcademico);
//# sourceMappingURL=periodo-academico.entity.js.map