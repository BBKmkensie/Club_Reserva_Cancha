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
exports.ActualizarFichaAlumnoDto = exports.FichaAlumnoDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class FichaAlumnoDto {
    altura;
    peso;
    porcentajeGrasa;
    sedentario;
}
exports.FichaAlumnoDto = FichaAlumnoDto;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(50),
    (0, class_validator_1.Max)(250),
    __metadata("design:type", Number)
], FichaAlumnoDto.prototype, "altura", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(20),
    (0, class_validator_1.Max)(300),
    __metadata("design:type", Number)
], FichaAlumnoDto.prototype, "peso", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], FichaAlumnoDto.prototype, "porcentajeGrasa", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FichaAlumnoDto.prototype, "sedentario", void 0);
class ActualizarFichaAlumnoDto {
    altura;
    peso;
    porcentajeGrasa;
    sedentario;
}
exports.ActualizarFichaAlumnoDto = ActualizarFichaAlumnoDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(50),
    (0, class_validator_1.Max)(250),
    __metadata("design:type", Number)
], ActualizarFichaAlumnoDto.prototype, "altura", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(20),
    (0, class_validator_1.Max)(300),
    __metadata("design:type", Number)
], ActualizarFichaAlumnoDto.prototype, "peso", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(60),
    __metadata("design:type", Number)
], ActualizarFichaAlumnoDto.prototype, "porcentajeGrasa", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ActualizarFichaAlumnoDto.prototype, "sedentario", void 0);
//# sourceMappingURL=ficha-alumno.dto.js.map