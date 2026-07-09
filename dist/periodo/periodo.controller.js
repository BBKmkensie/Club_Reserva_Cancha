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
exports.PeriodoController = void 0;
const common_1 = require("@nestjs/common");
const periodo_service_1 = require("./periodo.service");
const periodo_academico_dto_1 = require("../dto/periodo-academico.dto");
let PeriodoController = class PeriodoController {
    periodoService;
    constructor(periodoService) {
        this.periodoService = periodoService;
    }
    getActivo() {
        return this.periodoService.getActivo();
    }
    findAll() {
        return this.periodoService.findAll();
    }
    configurar(dto) {
        return this.periodoService.configurar(dto);
    }
};
exports.PeriodoController = PeriodoController;
__decorate([
    (0, common_1.Get)('activo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PeriodoController.prototype, "getActivo", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PeriodoController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [periodo_academico_dto_1.PeriodoAcademicoDto]),
    __metadata("design:returntype", void 0)
], PeriodoController.prototype, "configurar", null);
exports.PeriodoController = PeriodoController = __decorate([
    (0, common_1.Controller)('periodo'),
    __metadata("design:paramtypes", [periodo_service_1.PeriodoService])
], PeriodoController);
//# sourceMappingURL=periodo.controller.js.map