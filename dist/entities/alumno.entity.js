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
exports.Alumno = void 0;
const typeorm_1 = require("typeorm");
const taller_entity_1 = require("./taller.entity");
const inscripcion_salida_entity_1 = require("./inscripcion-salida.entity");
const inscripcion_taller_entity_1 = require("./inscripcion-taller.entity");
let Alumno = class Alumno {
    id;
    nombre;
    rut;
    email;
    telefono;
    edad;
    tallerId;
    taller;
    passwordHash;
    passwordSalt;
    apoderadoNombre;
    apoderadoTelefono;
    apoderadoEmail;
    apoderadoRut;
    apoderadoPasswordHash;
    apoderadoPasswordSalt;
    inscripcionesSalida;
    inscripcionesTaller;
};
exports.Alumno = Alumno;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Alumno.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Alumno.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 12, unique: true }),
    __metadata("design:type", String)
], Alumno.prototype, "rut", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Alumno.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], Alumno.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Alumno.prototype, "edad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taller_id', nullable: true }),
    __metadata("design:type", Object)
], Alumno.prototype, "tallerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => taller_entity_1.Taller, (taller) => taller.alumnos, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'taller_id' }),
    __metadata("design:type", Object)
], Alumno.prototype, "taller", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, name: 'PasswordHash' }),
    __metadata("design:type", String)
], Alumno.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, name: 'PasswordSalt' }),
    __metadata("design:type", String)
], Alumno.prototype, "passwordSalt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true, name: 'apoderado_nombre' }),
    __metadata("design:type", Object)
], Alumno.prototype, "apoderadoNombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true, name: 'apoderado_telefono' }),
    __metadata("design:type", Object)
], Alumno.prototype, "apoderadoTelefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true, name: 'apoderado_email' }),
    __metadata("design:type", Object)
], Alumno.prototype, "apoderadoEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 12, nullable: true, unique: true, name: 'apoderado_rut' }),
    __metadata("design:type", Object)
], Alumno.prototype, "apoderadoRut", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, name: 'apoderado_password_hash' }),
    __metadata("design:type", Object)
], Alumno.prototype, "apoderadoPasswordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, name: 'apoderado_password_salt' }),
    __metadata("design:type", Object)
], Alumno.prototype, "apoderadoPasswordSalt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => inscripcion_salida_entity_1.InscripcionSalida, (insc) => insc.alumno),
    __metadata("design:type", Array)
], Alumno.prototype, "inscripcionesSalida", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => inscripcion_taller_entity_1.InscripcionTaller, (insc) => insc.alumno),
    __metadata("design:type", Array)
], Alumno.prototype, "inscripcionesTaller", void 0);
exports.Alumno = Alumno = __decorate([
    (0, typeorm_1.Entity)('alumnos')
], Alumno);
//# sourceMappingURL=alumno.entity.js.map