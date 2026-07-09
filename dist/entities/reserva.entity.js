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
exports.Reserva = void 0;
const typeorm_1 = require("typeorm");
const taller_entity_1 = require("./taller.entity");
const admin_entity_1 = require("./admin.entity");
const profesor_entity_1 = require("./profesor.entity");
let Reserva = class Reserva {
    id;
    espacio;
    fecha;
    horaInicio;
    horaFin;
    tallerId;
    taller;
    adminId;
    admin;
    profesorId;
    profesor;
};
exports.Reserva = Reserva;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Reserva.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Reserva.prototype, "espacio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Reserva.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', nullable: true, name: 'hora_inicio' }),
    __metadata("design:type", String)
], Reserva.prototype, "horaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', nullable: true, name: 'hora_fin' }),
    __metadata("design:type", String)
], Reserva.prototype, "horaFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taller_id' }),
    __metadata("design:type", Number)
], Reserva.prototype, "tallerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => taller_entity_1.Taller, (taller) => taller.reservas, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'taller_id' }),
    __metadata("design:type", taller_entity_1.Taller)
], Reserva.prototype, "taller", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'admin_id', nullable: true }),
    __metadata("design:type", Object)
], Reserva.prototype, "adminId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_entity_1.Admin, (admin) => admin.reservas, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'admin_id' }),
    __metadata("design:type", Object)
], Reserva.prototype, "admin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profesor_id', nullable: true }),
    __metadata("design:type", Object)
], Reserva.prototype, "profesorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profesor_entity_1.Profesor, (profesor) => profesor.reservas, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'profesor_id' }),
    __metadata("design:type", Object)
], Reserva.prototype, "profesor", void 0);
exports.Reserva = Reserva = __decorate([
    (0, typeorm_1.Entity)('reservas')
], Reserva);
//# sourceMappingURL=reserva.entity.js.map