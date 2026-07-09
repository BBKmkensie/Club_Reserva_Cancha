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
exports.ReservaController = void 0;
const common_1 = require("@nestjs/common");
const reserva_service_1 = require("./reserva.service");
const create_reserva_dto_1 = require("../dto/create-reserva.dto");
const cancha_constants_1 = require("./cancha.constants");
let ReservaController = class ReservaController {
    reservaService;
    constructor(reservaService) {
        this.reservaService = reservaService;
    }
    obtenerDisponibilidadSemana(fechaInicio, espacio) {
        return this.reservaService.obtenerDisponibilidadSemana(fechaInicio, espacio ?? cancha_constants_1.CANCHA_ESPACIO_DEFAULT);
    }
    obtenerDisponibilidad(fecha, espacio) {
        return this.reservaService.obtenerDisponibilidad(fecha, espacio ?? cancha_constants_1.CANCHA_ESPACIO_DEFAULT);
    }
    create(createReservaDto) {
        return this.reservaService.create(createReservaDto);
    }
    findAll(tallerId, fecha) {
        if (tallerId) {
            return this.reservaService.findByTaller(parseInt(tallerId, 10));
        }
        if (fecha) {
            return this.reservaService.findByFecha(fecha);
        }
        return this.reservaService.findAll();
    }
    findOne(id) {
        return this.reservaService.findOne(id);
    }
    update(id, updateReservaDto) {
        return this.reservaService.update(id, updateReservaDto);
    }
    remove(id) {
        return this.reservaService.remove(id);
    }
};
exports.ReservaController = ReservaController;
__decorate([
    (0, common_1.Get)('disponibilidad-semana'),
    __param(0, (0, common_1.Query)('fechaInicio')),
    __param(1, (0, common_1.Query)('espacio')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReservaController.prototype, "obtenerDisponibilidadSemana", null);
__decorate([
    (0, common_1.Get)('disponibilidad'),
    __param(0, (0, common_1.Query)('fecha')),
    __param(1, (0, common_1.Query)('espacio')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReservaController.prototype, "obtenerDisponibilidad", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reserva_dto_1.CreateReservaDto]),
    __metadata("design:returntype", void 0)
], ReservaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tallerId')),
    __param(1, (0, common_1.Query)('fecha')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ReservaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReservaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ReservaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReservaController.prototype, "remove", null);
exports.ReservaController = ReservaController = __decorate([
    (0, common_1.Controller)('reserva'),
    __metadata("design:paramtypes", [reserva_service_1.ReservaService])
], ReservaController);
//# sourceMappingURL=reserva.controller.js.map