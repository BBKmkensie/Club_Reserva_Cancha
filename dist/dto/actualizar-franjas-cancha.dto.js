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
exports.ActualizarFranjasCanchaDto = exports.FranjaCanchaItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class FranjaCanchaItemDto {
    diaSemana;
    horaInicio;
    activa;
    duracionMinutos;
}
exports.FranjaCanchaItemDto = FranjaCanchaItemDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(7),
    __metadata("design:type", Number)
], FranjaCanchaItemDto.prototype, "diaSemana", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FranjaCanchaItemDto.prototype, "horaInicio", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FranjaCanchaItemDto.prototype, "activa", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(30),
    (0, class_validator_1.Max)(180),
    __metadata("design:type", Number)
], FranjaCanchaItemDto.prototype, "duracionMinutos", void 0);
class ActualizarFranjasCanchaDto {
    espacio;
    franjas;
}
exports.ActualizarFranjasCanchaDto = ActualizarFranjasCanchaDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActualizarFranjasCanchaDto.prototype, "espacio", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FranjaCanchaItemDto),
    __metadata("design:type", Array)
], ActualizarFranjasCanchaDto.prototype, "franjas", void 0);
//# sourceMappingURL=actualizar-franjas-cancha.dto.js.map