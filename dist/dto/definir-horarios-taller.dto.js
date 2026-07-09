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
exports.DefinirHorariosTallerDto = exports.HorarioTallerItemDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class HorarioTallerItemDto {
    curso;
    seccion;
    diaSemana;
    horaInicio;
    horaFin;
}
exports.HorarioTallerItemDto = HorarioTallerItemDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HorarioTallerItemDto.prototype, "curso", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], HorarioTallerItemDto.prototype, "seccion", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(7),
    __metadata("design:type", Number)
], HorarioTallerItemDto.prototype, "diaSemana", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], HorarioTallerItemDto.prototype, "horaInicio", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], HorarioTallerItemDto.prototype, "horaFin", void 0);
class DefinirHorariosTallerDto {
    modo;
    horarios;
}
exports.DefinirHorariosTallerDto = DefinirHorariosTallerDto;
__decorate([
    (0, class_validator_1.IsIn)(['POR_CURSO', 'POR_SECCION']),
    __metadata("design:type", String)
], DefinirHorariosTallerDto.prototype, "modo", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => HorarioTallerItemDto),
    __metadata("design:type", Array)
], DefinirHorariosTallerDto.prototype, "horarios", void 0);
//# sourceMappingURL=definir-horarios-taller.dto.js.map