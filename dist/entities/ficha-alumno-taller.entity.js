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
exports.FichaAlumnoTaller = void 0;
const typeorm_1 = require("typeorm");
const alumno_entity_1 = require("./alumno.entity");
const taller_entity_1 = require("./taller.entity");
let FichaAlumnoTaller = class FichaAlumnoTaller {
    id;
    alumnoId;
    alumno;
    tallerId;
    taller;
    altura;
    peso;
    porcentajeGrasa;
    sedentario;
    createdAt;
    updatedAt;
};
exports.FichaAlumnoTaller = FichaAlumnoTaller;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FichaAlumnoTaller.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alumno_id' }),
    __metadata("design:type", Number)
], FichaAlumnoTaller.prototype, "alumnoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => alumno_entity_1.Alumno, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'alumno_id' }),
    __metadata("design:type", alumno_entity_1.Alumno)
], FichaAlumnoTaller.prototype, "alumno", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taller_id' }),
    __metadata("design:type", Number)
], FichaAlumnoTaller.prototype, "tallerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => taller_entity_1.Taller, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'taller_id' }),
    __metadata("design:type", taller_entity_1.Taller)
], FichaAlumnoTaller.prototype, "taller", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], FichaAlumnoTaller.prototype, "altura", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Object)
], FichaAlumnoTaller.prototype, "peso", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'porcentaje_grasa' }),
    __metadata("design:type", Object)
], FichaAlumnoTaller.prototype, "porcentajeGrasa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata("design:type", Object)
], FichaAlumnoTaller.prototype, "sedentario", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FichaAlumnoTaller.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], FichaAlumnoTaller.prototype, "updatedAt", void 0);
exports.FichaAlumnoTaller = FichaAlumnoTaller = __decorate([
    (0, typeorm_1.Entity)('ficha_alumno_taller'),
    (0, typeorm_1.Unique)(['alumnoId', 'tallerId'])
], FichaAlumnoTaller);
//# sourceMappingURL=ficha-alumno-taller.entity.js.map