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
exports.TallerController = void 0;
const common_1 = require("@nestjs/common");
const taller_service_1 = require("./taller.service");
const create_taller_dto_1 = require("../dto/create-taller.dto");
const asignar_docente_dto_1 = require("../dto/asignar-docente.dto");
const responder_asignacion_dto_1 = require("../dto/responder-asignacion.dto");
const publicar_actividad_dto_1 = require("../dto/publicar-actividad.dto");
const actualizar_presentacion_taller_dto_1 = require("../dto/actualizar-presentacion-taller.dto");
let TallerController = class TallerController {
    tallerService;
    constructor(tallerService) {
        this.tallerService = tallerService;
    }
    findCatalogo() {
        return this.tallerService.findCatalogo();
    }
    getAsignacionesPendientes(profesorId) {
        return this.tallerService.getAsignacionesPendientes(profesorId);
    }
    getComparacionSemestre(periodoId, profesorId) {
        const periodo = periodoId ? parseInt(periodoId, 10) : undefined;
        const profesor = profesorId ? parseInt(profesorId, 10) : undefined;
        return this.tallerService.getComparacionSemestre(periodo, profesor);
    }
    create(createTallerDto) {
        return this.tallerService.create(createTallerDto);
    }
    findAll() {
        return this.tallerService.findAll();
    }
    asignarDocente(id, dto) {
        return this.tallerService.asignarDocente(id, dto);
    }
    responderAsignacion(id, profesorId, dto) {
        return this.tallerService.responderAsignacion(id, profesorId, dto);
    }
    definirHorario(id, dto) {
        return this.tallerService.definirHorario(id, dto);
    }
    getHorarios(id) {
        return this.tallerService.getHorarios(id);
    }
    publicar(id, dto) {
        return this.tallerService.publicar(id, dto);
    }
    actualizarPresentacion(id, dto, esDirectiva, profesorId) {
        return this.tallerService.actualizarPresentacion(id, dto, {
            esDirectiva: esDirectiva === 'true',
            profesorId: profesorId ? parseInt(profesorId, 10) : undefined,
        });
    }
    cerrarPeriodo(id) {
        return this.tallerService.cerrarPeriodo(id);
    }
    getReporte(id) {
        return this.tallerService.getReporteActividad(id);
    }
    findOne(id) {
        return this.tallerService.findOne(id);
    }
    update(id, updateTallerDto) {
        return this.tallerService.update(id, updateTallerDto);
    }
    remove(id) {
        return this.tallerService.remove(id);
    }
};
exports.TallerController = TallerController;
__decorate([
    (0, common_1.Get)('catalogo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TallerController.prototype, "findCatalogo", null);
__decorate([
    (0, common_1.Get)('asignaciones/pendientes'),
    __param(0, (0, common_1.Query)('profesorId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TallerController.prototype, "getAsignacionesPendientes", null);
__decorate([
    (0, common_1.Get)('estadisticas/semestre'),
    __param(0, (0, common_1.Query)('periodoId')),
    __param(1, (0, common_1.Query)('profesorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TallerController.prototype, "getComparacionSemestre", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_taller_dto_1.CreateTallerDto]),
    __metadata("design:returntype", void 0)
], TallerController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TallerController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(':id/asignar-docente'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, asignar_docente_dto_1.AsignarDocenteDto]),
    __metadata("design:returntype", void 0)
], TallerController.prototype, "asignarDocente", null);
__decorate([
    (0, common_1.Patch)('asignacion/:id/responder'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('profesorId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, responder_asignacion_dto_1.ResponderAsignacionDto]),
    __metadata("design:returntype", void 0)
], TallerController.prototype, "responderAsignacion", null);
__decorate([
    (0, common_1.Patch)(':id/horario'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], TallerController.prototype, "definirHorario", null);
__decorate([
    (0, common_1.Get)(':id/horarios'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TallerController.prototype, "getHorarios", null);
__decorate([
    (0, common_1.Patch)(':id/publicar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, publicar_actividad_dto_1.PublicarActividadDto]),
    __metadata("design:returntype", void 0)
], TallerController.prototype, "publicar", null);
__decorate([
    (0, common_1.Patch)(':id/presentacion'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('esDirectiva')),
    __param(3, (0, common_1.Query)('profesorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, actualizar_presentacion_taller_dto_1.ActualizarPresentacionTallerDto, String, String]),
    __metadata("design:returntype", void 0)
], TallerController.prototype, "actualizarPresentacion", null);
__decorate([
    (0, common_1.Patch)(':id/cerrar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TallerController.prototype, "cerrarPeriodo", null);
__decorate([
    (0, common_1.Get)(':id/reporte'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TallerController.prototype, "getReporte", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TallerController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], TallerController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], TallerController.prototype, "remove", null);
exports.TallerController = TallerController = __decorate([
    (0, common_1.Controller)('taller'),
    __metadata("design:paramtypes", [taller_service_1.TallerService])
], TallerController);
//# sourceMappingURL=taller.controller.js.map