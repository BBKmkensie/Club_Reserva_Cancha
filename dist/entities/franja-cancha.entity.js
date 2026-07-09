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
exports.FranjaCancha = void 0;
const typeorm_1 = require("typeorm");
let FranjaCancha = class FranjaCancha {
    id;
    espacio;
    diaSemana;
    horaInicio;
    horaFin;
    activa;
    paraTodos;
};
exports.FranjaCancha = FranjaCancha;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FranjaCancha.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'Cancha Principal' }),
    __metadata("design:type", String)
], FranjaCancha.prototype, "espacio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dia_semana', type: 'smallint' }),
    __metadata("design:type", Number)
], FranjaCancha.prototype, "diaSemana", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', name: 'hora_inicio' }),
    __metadata("design:type", String)
], FranjaCancha.prototype, "horaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', name: 'hora_fin' }),
    __metadata("design:type", String)
], FranjaCancha.prototype, "horaFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], FranjaCancha.prototype, "activa", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false, name: 'para_todos' }),
    __metadata("design:type", Boolean)
], FranjaCancha.prototype, "paraTodos", void 0);
exports.FranjaCancha = FranjaCancha = __decorate([
    (0, typeorm_1.Entity)('franjas_cancha'),
    (0, typeorm_1.Unique)(['espacio', 'diaSemana', 'horaInicio'])
], FranjaCancha);
//# sourceMappingURL=franja-cancha.entity.js.map