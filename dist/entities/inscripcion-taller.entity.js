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
exports.InscripcionTaller = void 0;
const typeorm_1 = require("typeorm");
const alumno_entity_1 = require("./alumno.entity");
const taller_entity_1 = require("./taller.entity");
let InscripcionTaller = class InscripcionTaller {
    id;
    alumnoId;
    alumno;
    tallerId;
    taller;
    estado;
    altura;
    peso;
    porcentajeGrasa;
    sedentario;
    createdAt;
};
exports.InscripcionTaller = InscripcionTaller;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InscripcionTaller.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alumno_id' }),
    __metadata("design:type", Number)
], InscripcionTaller.prototype, "alumnoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => alumno_entity_1.Alumno, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'alumno_id' }),
    __metadata("design:type", alumno_entity_1.Alumno)
], InscripcionTaller.prototype, "alumno", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taller_id' }),
    __metadata("design:type", Number)
], InscripcionTaller.prototype, "tallerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => taller_entity_1.Taller, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'taller_id' }),
    __metadata("design:type", taller_entity_1.Taller)
], InscripcionTaller.prototype, "taller", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'PENDIENTE' }),
    __metadata("design:type", String)
], InscripcionTaller.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], InscripcionTaller.prototype, "altura", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], InscripcionTaller.prototype, "peso", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'porcentaje_grasa' }),
    __metadata("design:type", Object)
], InscripcionTaller.prototype, "porcentajeGrasa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Object)
], InscripcionTaller.prototype, "sedentario", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], InscripcionTaller.prototype, "createdAt", void 0);
exports.InscripcionTaller = InscripcionTaller = __decorate([
    (0, typeorm_1.Entity)('inscripcion_taller'),
    (0, typeorm_1.Unique)(['alumnoId', 'tallerId'])
], InscripcionTaller);
//# sourceMappingURL=inscripcion-taller.entity.js.map