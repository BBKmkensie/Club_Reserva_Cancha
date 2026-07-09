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
exports.Profesor = void 0;
const typeorm_1 = require("typeorm");
const taller_entity_1 = require("./taller.entity");
const salida_entity_1 = require("./salida.entity");
const reserva_entity_1 = require("./reserva.entity");
let Profesor = class Profesor {
    id;
    nombre;
    rut;
    email;
    telefono;
    fotoPath;
    tallerId;
    taller;
    passwordHash;
    passwordSalt;
    salidas;
    reservas;
};
exports.Profesor = Profesor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Profesor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Profesor.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 12, unique: true }),
    __metadata("design:type", String)
], Profesor.prototype, "rut", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true }),
    __metadata("design:type", String)
], Profesor.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], Profesor.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, name: 'foto_path' }),
    __metadata("design:type", Object)
], Profesor.prototype, "fotoPath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taller_id' }),
    __metadata("design:type", Number)
], Profesor.prototype, "tallerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => taller_entity_1.Taller, (taller) => taller.profesores, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'taller_id' }),
    __metadata("design:type", taller_entity_1.Taller)
], Profesor.prototype, "taller", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, name: 'PasswordHash' }),
    __metadata("design:type", String)
], Profesor.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, name: 'PasswordSalt' }),
    __metadata("design:type", String)
], Profesor.prototype, "passwordSalt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => salida_entity_1.Salida, (salida) => salida.profesor),
    __metadata("design:type", Array)
], Profesor.prototype, "salidas", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => reserva_entity_1.Reserva, (reserva) => reserva.profesor),
    __metadata("design:type", Array)
], Profesor.prototype, "reservas", void 0);
exports.Profesor = Profesor = __decorate([
    (0, typeorm_1.Entity)('profesores')
], Profesor);
//# sourceMappingURL=profesor.entity.js.map