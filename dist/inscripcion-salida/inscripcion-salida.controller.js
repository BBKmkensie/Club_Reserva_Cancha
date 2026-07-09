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
exports.InscripcionSalidaController = void 0;
const common_1 = require("@nestjs/common");
const inscripcion_salida_service_1 = require("./inscripcion-salida.service");
const create_inscripcion_salida_dto_1 = require("../dto/create-inscripcion-salida.dto");
let InscripcionSalidaController = class InscripcionSalidaController {
    inscripcionSalidaService;
    constructor(inscripcionSalidaService) {
        this.inscripcionSalidaService = inscripcionSalidaService;
    }
    inscribir(dto) {
        return this.inscripcionSalidaService.inscribir(dto);
    }
    findBySalida(salidaId) {
        return this.inscripcionSalidaService.findBySalida(salidaId);
    }
    findByAlumno(alumnoId) {
        return this.inscripcionSalidaService.findByAlumno(alumnoId);
    }
    remove(alumnoId, salidaId) {
        return this.inscripcionSalidaService.remove(alumnoId, salidaId);
    }
};
exports.InscripcionSalidaController = InscripcionSalidaController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_inscripcion_salida_dto_1.CreateInscripcionSalidaDto]),
    __metadata("design:returntype", void 0)
], InscripcionSalidaController.prototype, "inscribir", null);
__decorate([
    (0, common_1.Get)('por-salida/:salidaId'),
    __param(0, (0, common_1.Param)('salidaId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InscripcionSalidaController.prototype, "findBySalida", null);
__decorate([
    (0, common_1.Get)('por-alumno/:alumnoId'),
    __param(0, (0, common_1.Param)('alumnoId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InscripcionSalidaController.prototype, "findByAlumno", null);
__decorate([
    (0, common_1.Delete)(),
    __param(0, (0, common_1.Query)('alumnoId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('salidaId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], InscripcionSalidaController.prototype, "remove", null);
exports.InscripcionSalidaController = InscripcionSalidaController = __decorate([
    (0, common_1.Controller)('inscripcion-salida'),
    __metadata("design:paramtypes", [inscripcion_salida_service_1.InscripcionSalidaService])
], InscripcionSalidaController);
//# sourceMappingURL=inscripcion-salida.controller.js.map