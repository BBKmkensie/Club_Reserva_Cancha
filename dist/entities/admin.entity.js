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
exports.Admin = void 0;
const typeorm_1 = require("typeorm");
const taller_entity_1 = require("./taller.entity");
const reserva_entity_1 = require("./reserva.entity");
const salida_entity_1 = require("./salida.entity");
let Admin = class Admin {
    id;
    nombre;
    rut;
    email;
    passwordHash;
    passwordSalt;
    rol;
    talleres;
    reservas;
    salidas;
};
exports.Admin = Admin;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Admin.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Admin.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 12, unique: true }),
    __metadata("design:type", String)
], Admin.prototype, "rut", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true }),
    __metadata("design:type", String)
], Admin.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, name: 'PasswordHash' }),
    __metadata("design:type", String)
], Admin.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, name: 'PasswordSalt' }),
    __metadata("design:type", String)
], Admin.prototype, "passwordSalt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'super_admin' }),
    __metadata("design:type", String)
], Admin.prototype, "rol", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => taller_entity_1.Taller, (taller) => taller.admin),
    __metadata("design:type", Array)
], Admin.prototype, "talleres", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => reserva_entity_1.Reserva, (reserva) => reserva.admin),
    __metadata("design:type", Array)
], Admin.prototype, "reservas", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => salida_entity_1.Salida, (salida) => salida.admin),
    __metadata("design:type", Array)
], Admin.prototype, "salidas", void 0);
exports.Admin = Admin = __decorate([
    (0, typeorm_1.Entity)('admin')
], Admin);
//# sourceMappingURL=admin.entity.js.map