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
exports.AsignacionDocente = void 0;
const typeorm_1 = require("typeorm");
const taller_entity_1 = require("./taller.entity");
const profesor_entity_1 = require("./profesor.entity");
let AsignacionDocente = class AsignacionDocente {
    id;
    tallerId;
    taller;
    profesorId;
    profesor;
    estado;
    motivoRechazo;
    createdAt;
    respondedAt;
};
exports.AsignacionDocente = AsignacionDocente;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AsignacionDocente.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taller_id' }),
    __metadata("design:type", Number)
], AsignacionDocente.prototype, "tallerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => taller_entity_1.Taller, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'taller_id' }),
    __metadata("design:type", taller_entity_1.Taller)
], AsignacionDocente.prototype, "taller", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profesor_id' }),
    __metadata("design:type", Number)
], AsignacionDocente.prototype, "profesorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profesor_entity_1.Profesor, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'profesor_id' }),
    __metadata("design:type", profesor_entity_1.Profesor)
], AsignacionDocente.prototype, "profesor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'PENDIENTE' }),
    __metadata("design:type", String)
], AsignacionDocente.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'motivo_rechazo' }),
    __metadata("design:type", Object)
], AsignacionDocente.prototype, "motivoRechazo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AsignacionDocente.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'responded_at' }),
    __metadata("design:type", Object)
], AsignacionDocente.prototype, "respondedAt", void 0);
exports.AsignacionDocente = AsignacionDocente = __decorate([
    (0, typeorm_1.Entity)('asignaciones_docente')
], AsignacionDocente);
//# sourceMappingURL=asignacion-docente.entity.js.map