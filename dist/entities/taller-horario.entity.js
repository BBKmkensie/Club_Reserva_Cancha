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
exports.TallerHorario = void 0;
const typeorm_1 = require("typeorm");
const taller_entity_1 = require("./taller.entity");
let TallerHorario = class TallerHorario {
    id;
    tallerId;
    taller;
    curso;
    seccion;
    diaSemana;
    horaInicio;
    horaFin;
};
exports.TallerHorario = TallerHorario;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TallerHorario.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taller_id' }),
    __metadata("design:type", Number)
], TallerHorario.prototype, "tallerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => taller_entity_1.Taller, (taller) => taller.horarios, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'taller_id' }),
    __metadata("design:type", taller_entity_1.Taller)
], TallerHorario.prototype, "taller", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 4, nullable: true }),
    __metadata("design:type", Object)
], TallerHorario.prototype, "curso", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", Object)
], TallerHorario.prototype, "seccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', name: 'dia_semana' }),
    __metadata("design:type", Number)
], TallerHorario.prototype, "diaSemana", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', name: 'hora_inicio' }),
    __metadata("design:type", String)
], TallerHorario.prototype, "horaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', name: 'hora_fin' }),
    __metadata("design:type", String)
], TallerHorario.prototype, "horaFin", void 0);
exports.TallerHorario = TallerHorario = __decorate([
    (0, typeorm_1.Entity)('taller_horario')
], TallerHorario);
//# sourceMappingURL=taller-horario.entity.js.map