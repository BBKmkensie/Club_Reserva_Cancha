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
exports.SesionAsistencia = void 0;
const typeorm_1 = require("typeorm");
const taller_entity_1 = require("./taller.entity");
const profesor_entity_1 = require("./profesor.entity");
const registro_asistencia_entity_1 = require("./registro-asistencia.entity");
let SesionAsistencia = class SesionAsistencia {
    id;
    tallerId;
    taller;
    profesorId;
    profesor;
    fecha;
    estado;
    observaciones;
    listaGuardada;
    openedAt;
    closedAt;
    registros;
};
exports.SesionAsistencia = SesionAsistencia;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SesionAsistencia.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taller_id' }),
    __metadata("design:type", Number)
], SesionAsistencia.prototype, "tallerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => taller_entity_1.Taller, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'taller_id' }),
    __metadata("design:type", taller_entity_1.Taller)
], SesionAsistencia.prototype, "taller", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'profesor_id' }),
    __metadata("design:type", Number)
], SesionAsistencia.prototype, "profesorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => profesor_entity_1.Profesor, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'profesor_id' }),
    __metadata("design:type", profesor_entity_1.Profesor)
], SesionAsistencia.prototype, "profesor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", String)
], SesionAsistencia.prototype, "fecha", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'ABIERTA' }),
    __metadata("design:type", String)
], SesionAsistencia.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], SesionAsistencia.prototype, "observaciones", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false, name: 'lista_guardada' }),
    __metadata("design:type", Boolean)
], SesionAsistencia.prototype, "listaGuardada", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'opened_at' }),
    __metadata("design:type", Date)
], SesionAsistencia.prototype, "openedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'closed_at' }),
    __metadata("design:type", Object)
], SesionAsistencia.prototype, "closedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => registro_asistencia_entity_1.RegistroAsistencia, (r) => r.sesion),
    __metadata("design:type", Array)
], SesionAsistencia.prototype, "registros", void 0);
exports.SesionAsistencia = SesionAsistencia = __decorate([
    (0, typeorm_1.Entity)('sesiones_asistencia')
], SesionAsistencia);
//# sourceMappingURL=sesion-asistencia.entity.js.map