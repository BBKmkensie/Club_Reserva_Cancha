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
exports.Notificacion = void 0;
const typeorm_1 = require("typeorm");
const alumno_entity_1 = require("./alumno.entity");
const profesor_entity_1 = require("./profesor.entity");
const admin_entity_1 = require("./admin.entity");
let Notificacion = class Notificacion {
    id;
    alumnoId;
    alumno;
    profesorId;
    profesor;
    adminId;
    admin;
    titulo;
    mensaje;
    tipo;
    refId;
    leida;
    createdAt;
};
exports.Notificacion = Notificacion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Notificacion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alumno_id', nullable: true }),
    __metadata("design:type", Object)
], Notificacion.prototype, "alumnoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => alumno_entity_1.Alumno, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'alumno_id' }),
    __metadata("design:type", Object)
], Notificacion.prototype, "alumno", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profesor_id', nullable: true }),
    __metadata("design:type", Object)
], Notificacion.prototype, "profesorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profesor_entity_1.Profesor, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'profesor_id' }),
    __metadata("design:type", Object)
], Notificacion.prototype, "profesor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'admin_id', nullable: true }),
    __metadata("design:type", Object)
], Notificacion.prototype, "adminId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_entity_1.Admin, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'admin_id' }),
    __metadata("design:type", Object)
], Notificacion.prototype, "admin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Notificacion.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Notificacion.prototype, "mensaje", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, default: 'inscripcion_taller' }),
    __metadata("design:type", String)
], Notificacion.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ref_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Notificacion.prototype, "refId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Notificacion.prototype, "leida", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Notificacion.prototype, "createdAt", void 0);
exports.Notificacion = Notificacion = __decorate([
    (0, typeorm_1.Entity)('notificaciones')
], Notificacion);
//# sourceMappingURL=notificacion.entity.js.map