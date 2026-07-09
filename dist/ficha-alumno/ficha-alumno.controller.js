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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FichaAlumnoController = void 0;
const common_1 = require("@nestjs/common");
const ficha_alumno_service_1 = require("./ficha-alumno.service");
const ficha_alumno_dto_1 = require("../dto/ficha-alumno.dto");
let FichaAlumnoController = class FichaAlumnoController {
    fichaService;
    constructor(fichaService) {
        this.fichaService = fichaService;
    }
    listarPorTaller(tallerId, soloInscritos, esCoordinacion, profesorId) {
        return this.fichaService.listarPorTaller(tallerId, {
            soloInscritos: soloInscritos === 'true',
            esCoordinacion: esCoordinacion === 'true',
            profesorId: profesorId ? parseInt(profesorId, 10) : undefined,
        });
    }
    obtener(alumnoId, tallerId) {
        return this.fichaService.obtener(alumnoId, tallerId);
    }
    guardar(alumnoId, tallerId, dto) {
        return this.fichaService.guardar(alumnoId, tallerId, dto);
    }
};
exports.FichaAlumnoController = FichaAlumnoController;
__decorate([
    (0, common_1.Get)('taller/:tallerId'),
    __param(0, (0, common_1.Param)('tallerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('soloInscritos')),
    __param(2, (0, common_1.Query)('esCoordinacion')),
    __param(3, (0, common_1.Query)('profesorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String]),
    __metadata("design:returntype", void 0)
], FichaAlumnoController.prototype, "listarPorTaller", null);
__decorate([
    (0, common_1.Get)(':alumnoId/:tallerId'),
    __param(0, (0, common_1.Param)('alumnoId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('tallerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], FichaAlumnoController.prototype, "obtener", null);
__decorate([
    (0, common_1.Put)(':alumnoId/:tallerId'),
    __param(0, (0, common_1.Param)('alumnoId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('tallerId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, ficha_alumno_dto_1.ActualizarFichaAlumnoDto]),
    __metadata("design:returntype", void 0)
], FichaAlumnoController.prototype, "guardar", null);
exports.FichaAlumnoController = FichaAlumnoController = __decorate([
    (0, common_1.Controller)('ficha-alumno'),
    __metadata("design:paramtypes", [ficha_alumno_service_1.FichaAlumnoService])
], FichaAlumnoController);
//# sourceMappingURL=ficha-alumno.controller.js.map