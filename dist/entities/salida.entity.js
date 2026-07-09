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
exports.Salida = void 0;
const typeorm_1 = require("typeorm");
const taller_entity_1 = require("./taller.entity");
const admin_entity_1 = require("./admin.entity");
const profesor_entity_1 = require("./profesor.entity");
const inscripcion_salida_entity_1 = require("./inscripcion-salida.entity");
let Salida = class Salida {
    id;
    destino;
    fecha;
    hora;
    descripcion;
    tallerId;
    taller;
    adminId;
    admin;
    profesorId;
    profesor;
    origen;
    estado;
    resultado;
    comentarioCierre;
    comentarioApertura;
    motivoRechazo;
    fechaApertura;
    fechaCierre;
    fechaRespuesta;
    inscripciones;
};
exports.Salida = Salida;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Salida.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Salida.prototype, "destino", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Salida.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', nullable: true }),
    __metadata("design:type", String)
], Salida.prototype, "hora", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Salida.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taller_id' }),
    __metadata("design:type", Number)
], Salida.prototype, "tallerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => taller_entity_1.Taller, (taller) => taller.salidas, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'taller_id' }),
    __metadata("design:type", taller_entity_1.Taller)
], Salida.prototype, "taller", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'admin_id', nullable: true }),
    __metadata("design:type", Object)
], Salida.prototype, "adminId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_entity_1.Admin, (admin) => admin.salidas, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'admin_id' }),
    __metadata("design:type", Object)
], Salida.prototype, "admin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profesor_id', nullable: true }),
    __metadata("design:type", Object)
], Salida.prototype, "profesorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profesor_entity_1.Profesor, (profesor) => profesor.salidas, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'profesor_id' }),
    __metadata("design:type", Object)
], Salida.prototype, "profesor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, default: 'PROPUESTA_PROFESOR' }),
    __metadata("design:type", String)
], Salida.prototype, "origen", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, default: 'PUBLICADA' }),
    __metadata("design:type", String)
], Salida.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], Salida.prototype, "resultado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'comentario_cierre' }),
    __metadata("design:type", Object)
], Salida.prototype, "comentarioCierre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'comentario_apertura' }),
    __metadata("design:type", Object)
], Salida.prototype, "comentarioApertura", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'motivo_rechazo' }),
    __metadata("design:type", Object)
], Salida.prototype, "motivoRechazo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'fecha_apertura' }),
    __metadata("design:type", Object)
], Salida.prototype, "fechaApertura", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'fecha_cierre' }),
    __metadata("design:type", Object)
], Salida.prototype, "fechaCierre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'fecha_respuesta' }),
    __metadata("design:type", Object)
], Salida.prototype, "fechaRespuesta", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => inscripcion_salida_entity_1.InscripcionSalida, (insc) => insc.salida),
    __metadata("design:type", Array)
], Salida.prototype, "inscripciones", void 0);
exports.Salida = Salida = __decorate([
    (0, typeorm_1.Entity)('salidas')
], Salida);
//# sourceMappingURL=salida.entity.js.map