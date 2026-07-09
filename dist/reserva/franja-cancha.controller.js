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
exports.FranjaCanchaController = void 0;
const common_1 = require("@nestjs/common");
const franja_cancha_service_1 = require("./franja-cancha.service");
const actualizar_franjas_cancha_dto_1 = require("../dto/actualizar-franjas-cancha.dto");
const cancha_constants_1 = require("./cancha.constants");
let FranjaCanchaController = class FranjaCanchaController {
    franjaService;
    constructor(franjaService) {
        this.franjaService = franjaService;
    }
    async findAll(espacio) {
        await this.franjaService.asegurarFranjasBase(espacio ?? cancha_constants_1.CANCHA_ESPACIO_DEFAULT);
        return this.franjaService.findAll(espacio ?? cancha_constants_1.CANCHA_ESPACIO_DEFAULT);
    }
    actualizar(dto) {
        return this.franjaService.actualizar(dto);
    }
};
exports.FranjaCanchaController = FranjaCanchaController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('espacio')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FranjaCanchaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [actualizar_franjas_cancha_dto_1.ActualizarFranjasCanchaDto]),
    __metadata("design:returntype", void 0)
], FranjaCanchaController.prototype, "actualizar", null);
exports.FranjaCanchaController = FranjaCanchaController = __decorate([
    (0, common_1.Controller)('franja-cancha'),
    __metadata("design:paramtypes", [franja_cancha_service_1.FranjaCanchaService])
], FranjaCanchaController);
//# sourceMappingURL=franja-cancha.controller.js.map