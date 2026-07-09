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
exports.AsistenciaController = void 0;
const common_1 = require("@nestjs/common");
const asistencia_service_1 = require("./asistencia.service");
const abrir_sesion_dto_1 = require("../dto/abrir-sesion.dto");
const actualizar_asistencia_dto_1 = require("../dto/actualizar-asistencia.dto");
const cerrar_sesion_dto_1 = require("../dto/cerrar-sesion.dto");
const gestionar_alerta_dto_1 = require("../dto/gestionar-alerta.dto");
const actualizar_umbral_dto_1 = require("../dto/actualizar-umbral.dto");
let AsistenciaController = class AsistenciaController {
    asistenciaService;
    constructor(asistenciaService) {
        this.asistenciaService = asistenciaService;
    }
    abrirSesion(dto) {
        return this.asistenciaService.abrirSesion(dto);
    }
    sesionActiva(tallerId) {
        return this.asistenciaService.sesionActiva(tallerId);
    }
    obtenerSesion(id) {
        return this.asistenciaService.obtenerSesion(id);
    }
    historial(tallerId) {
        return this.asistenciaService.historialSesiones(tallerId);
    }
    actualizarAsistencia(id, dto) {
        return this.asistenciaService.actualizarAsistencia(id, dto);
    }
    cerrarSesion(id, dto) {
        return this.asistenciaService.cerrarSesion(id, dto);
    }
    getReporte(tallerId) {
        return this.asistenciaService.getReporte(tallerId);
    }
    getAlertasGlobales() {
        return this.asistenciaService.getAlertasGlobales();
    }
    getAlertasGestion(tallerId) {
        const id = tallerId ? parseInt(tallerId, 10) : undefined;
        return this.asistenciaService.getAlertasGestion(id && !Number.isNaN(id) ? id : undefined);
    }
    contactarApoderado(id, dto) {
        return this.asistenciaService.contactarApoderado(id, dto);
    }
    resolverAlerta(id, dto) {
        return this.asistenciaService.resolverAlerta(id, dto);
    }
    actualizarUmbral(tallerId, dto) {
        const umbral = dto.umbralAusencias ?? dto.umbral;
        if (umbral == null) {
            throw new common_1.BadRequestException('Debe indicar el umbral de ausencias');
        }
        return this.asistenciaService.actualizarUmbral(tallerId, umbral);
    }
};
exports.AsistenciaController = AsistenciaController;
__decorate([
    (0, common_1.Post)('sesion/abrir'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [abrir_sesion_dto_1.AbrirSesionDto]),
    __metadata("design:returntype", void 0)
], AsistenciaController.prototype, "abrirSesion", null);
__decorate([
    (0, common_1.Get)('sesion/activa/:tallerId'),
    __param(0, (0, common_1.Param)('tallerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AsistenciaController.prototype, "sesionActiva", null);
__decorate([
    (0, common_1.Get)('sesion/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AsistenciaController.prototype, "obtenerSesion", null);
__decorate([
    (0, common_1.Get)('sesiones/:tallerId'),
    __param(0, (0, common_1.Param)('tallerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AsistenciaController.prototype, "historial", null);
__decorate([
    (0, common_1.Patch)('sesion/:id/registros'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, actualizar_asistencia_dto_1.ActualizarAsistenciaDto]),
    __metadata("design:returntype", void 0)
], AsistenciaController.prototype, "actualizarAsistencia", null);
__decorate([
    (0, common_1.Patch)('sesion/:id/cerrar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, cerrar_sesion_dto_1.CerrarSesionDto]),
    __metadata("design:returntype", void 0)
], AsistenciaController.prototype, "cerrarSesion", null);
__decorate([
    (0, common_1.Get)('reporte/:tallerId'),
    __param(0, (0, common_1.Param)('tallerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AsistenciaController.prototype, "getReporte", null);
__decorate([
    (0, common_1.Get)('alertas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AsistenciaController.prototype, "getAlertasGlobales", null);
__decorate([
    (0, common_1.Get)('alertas/gestion'),
    __param(0, (0, common_1.Query)('tallerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AsistenciaController.prototype, "getAlertasGestion", null);
__decorate([
    (0, common_1.Patch)('alertas/:id/contactar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, gestionar_alerta_dto_1.GestionarAlertaDto]),
    __metadata("design:returntype", void 0)
], AsistenciaController.prototype, "contactarApoderado", null);
__decorate([
    (0, common_1.Patch)('alertas/:id/resolver'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, gestionar_alerta_dto_1.GestionarAlertaDto]),
    __metadata("design:returntype", void 0)
], AsistenciaController.prototype, "resolverAlerta", null);
__decorate([
    (0, common_1.Patch)('umbral/:tallerId'),
    __param(0, (0, common_1.Param)('tallerId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, actualizar_umbral_dto_1.ActualizarUmbralDto]),
    __metadata("design:returntype", void 0)
], AsistenciaController.prototype, "actualizarUmbral", null);
exports.AsistenciaController = AsistenciaController = __decorate([
    (0, common_1.Controller)('asistencia'),
    __metadata("design:paramtypes", [asistencia_service_1.AsistenciaService])
], AsistenciaController);
//# sourceMappingURL=asistencia.controller.js.map