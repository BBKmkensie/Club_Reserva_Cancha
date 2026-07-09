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
exports.AlertaAusencia = void 0;
const typeorm_1 = require("typeorm");
const alumno_entity_1 = require("./alumno.entity");
const taller_entity_1 = require("./taller.entity");
let AlertaAusencia = class AlertaAusencia {
    id;
    alumnoId;
    alumno;
    tallerId;
    taller;
    cantidadAusencias;
    estado;
    notas;
    createdAt;
    contactadoAt;
    resueltoAt;
};
exports.AlertaAusencia = AlertaAusencia;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AlertaAusencia.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alumno_id' }),
    __metadata("design:type", Number)
], AlertaAusencia.prototype, "alumnoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => alumno_entity_1.Alumno, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'alumno_id' }),
    __metadata("design:type", alumno_entity_1.Alumno)
], AlertaAusencia.prototype, "alumno", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taller_id' }),
    __metadata("design:type", Number)
], AlertaAusencia.prototype, "tallerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => taller_entity_1.Taller, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'taller_id' }),
    __metadata("design:type", taller_entity_1.Taller)
], AlertaAusencia.prototype, "taller", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad_ausencias', type: 'int' }),
    __metadata("design:type", Number)
], AlertaAusencia.prototype, "cantidadAusencias", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, default: 'PENDIENTE' }),
    __metadata("design:type", String)
], AlertaAusencia.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], AlertaAusencia.prototype, "notas", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AlertaAusencia.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'contactado_at' }),
    __metadata("design:type", Object)
], AlertaAusencia.prototype, "contactadoAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'resuelto_at' }),
    __metadata("design:type", Object)
], AlertaAusencia.prototype, "resueltoAt", void 0);
exports.AlertaAusencia = AlertaAusencia = __decorate([
    (0, typeorm_1.Entity)('alertas_ausencia')
], AlertaAusencia);
//# sourceMappingURL=alerta-ausencia.entity.js.map