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
exports.RegistroAsistencia = void 0;
const typeorm_1 = require("typeorm");
const sesion_asistencia_entity_1 = require("./sesion-asistencia.entity");
const alumno_entity_1 = require("./alumno.entity");
let RegistroAsistencia = class RegistroAsistencia {
    id;
    sesionId;
    sesion;
    alumnoId;
    alumno;
    estado;
    observacion;
};
exports.RegistroAsistencia = RegistroAsistencia;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RegistroAsistencia.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sesion_id' }),
    __metadata("design:type", Number)
], RegistroAsistencia.prototype, "sesionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sesion_asistencia_entity_1.SesionAsistencia, (s) => s.registros, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'sesion_id' }),
    __metadata("design:type", sesion_asistencia_entity_1.SesionAsistencia)
], RegistroAsistencia.prototype, "sesion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alumno_id' }),
    __metadata("design:type", Number)
], RegistroAsistencia.prototype, "alumnoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => alumno_entity_1.Alumno, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'alumno_id' }),
    __metadata("design:type", alumno_entity_1.Alumno)
], RegistroAsistencia.prototype, "alumno", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'PRESENTE' }),
    __metadata("design:type", String)
], RegistroAsistencia.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], RegistroAsistencia.prototype, "observacion", void 0);
exports.RegistroAsistencia = RegistroAsistencia = __decorate([
    (0, typeorm_1.Entity)('registros_asistencia'),
    (0, typeorm_1.Unique)(['sesionId', 'alumnoId'])
], RegistroAsistencia);
//# sourceMappingURL=registro-asistencia.entity.js.map