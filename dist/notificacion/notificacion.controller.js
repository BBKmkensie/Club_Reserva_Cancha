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
exports.NotificacionController = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const notificacion_service_1 = require("./notificacion.service");
const notificacion_stream_service_1 = require("./notificacion-stream.service");
let NotificacionController = class NotificacionController {
    notificacionService;
    streamService;
    constructor(notificacionService, streamService) {
        this.notificacionService = notificacionService;
        this.streamService = streamService;
    }
    sseAlumno(alumnoId) {
        return this.streamService.streamAlumno(alumnoId);
    }
    sseProfesor(profesorId) {
        return this.streamService.streamProfesor(profesorId);
    }
    findByAlumno(alumnoId) {
        return this.notificacionService.findByAlumno(alumnoId);
    }
    contarNoLeidas(alumnoId) {
        return this.notificacionService.contarNoLeidas(alumnoId);
    }
    marcarLeida(id, alumnoId) {
        return this.notificacionService.marcarLeida(id, alumnoId);
    }
    marcarTodasLeidas(alumnoId) {
        return this.notificacionService.marcarTodasLeidas(alumnoId);
    }
    findByProfesor(profesorId) {
        return this.notificacionService.findByProfesor(profesorId);
    }
    contarNoLeidasProfesor(profesorId) {
        return this.notificacionService.contarNoLeidasProfesor(profesorId);
    }
    marcarLeidaProfesor(id, profesorId) {
        return this.notificacionService.marcarLeidaProfesor(id, profesorId);
    }
    marcarTodasLeidasProfesor(profesorId) {
        return this.notificacionService.marcarTodasLeidasProfesor(profesorId);
    }
    sseAdmin(adminId) {
        return this.streamService.streamAdmin(adminId);
    }
    findByAdmin(adminId) {
        return this.notificacionService.findByAdmin(adminId);
    }
    contarNoLeidasAdmin(adminId) {
        return this.notificacionService.contarNoLeidasAdmin(adminId);
    }
    marcarLeidaAdmin(id, adminId) {
        return this.notificacionService.marcarLeidaAdmin(id, adminId);
    }
    marcarTodasLeidasAdmin(adminId) {
        return this.notificacionService.marcarTodasLeidasAdmin(adminId);
    }
    eliminarAlumno(id, alumnoId) {
        return this.notificacionService.eliminarAlumno(id, alumnoId);
    }
    eliminarProfesor(id, profesorId) {
        return this.notificacionService.eliminarProfesor(id, profesorId);
    }
    eliminarAdmin(id, adminId) {
        return this.notificacionService.eliminarAdmin(id, adminId);
    }
};
exports.NotificacionController = NotificacionController;
__decorate([
    (0, common_1.Sse)('sse/alumno/:alumnoId'),
    __param(0, (0, common_1.Param)('alumnoId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", rxjs_1.Observable)
], NotificacionController.prototype, "sseAlumno", null);
__decorate([
    (0, common_1.Sse)('sse/profesor/:profesorId'),
    __param(0, (0, common_1.Param)('profesorId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", rxjs_1.Observable)
], NotificacionController.prototype, "sseProfesor", null);
__decorate([
    (0, common_1.Get)('por-alumno/:alumnoId'),
    __param(0, (0, common_1.Param)('alumnoId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "findByAlumno", null);
__decorate([
    (0, common_1.Get)('no-leidas/:alumnoId'),
    __param(0, (0, common_1.Param)('alumnoId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "contarNoLeidas", null);
__decorate([
    (0, common_1.Patch)(':id/leer/:alumnoId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('alumnoId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "marcarLeida", null);
__decorate([
    (0, common_1.Patch)('leer-todas/:alumnoId'),
    __param(0, (0, common_1.Param)('alumnoId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "marcarTodasLeidas", null);
__decorate([
    (0, common_1.Get)('por-profesor/:profesorId'),
    __param(0, (0, common_1.Param)('profesorId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "findByProfesor", null);
__decorate([
    (0, common_1.Get)('no-leidas-profesor/:profesorId'),
    __param(0, (0, common_1.Param)('profesorId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "contarNoLeidasProfesor", null);
__decorate([
    (0, common_1.Patch)(':id/leer-profesor/:profesorId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('profesorId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "marcarLeidaProfesor", null);
__decorate([
    (0, common_1.Patch)('leer-todas-profesor/:profesorId'),
    __param(0, (0, common_1.Param)('profesorId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "marcarTodasLeidasProfesor", null);
__decorate([
    (0, common_1.Sse)('sse/admin/:adminId'),
    __param(0, (0, common_1.Param)('adminId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", rxjs_1.Observable)
], NotificacionController.prototype, "sseAdmin", null);
__decorate([
    (0, common_1.Get)('por-admin/:adminId'),
    __param(0, (0, common_1.Param)('adminId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "findByAdmin", null);
__decorate([
    (0, common_1.Get)('no-leidas-admin/:adminId'),
    __param(0, (0, common_1.Param)('adminId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "contarNoLeidasAdmin", null);
__decorate([
    (0, common_1.Patch)(':id/leer-admin/:adminId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('adminId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "marcarLeidaAdmin", null);
__decorate([
    (0, common_1.Patch)('leer-todas-admin/:adminId'),
    __param(0, (0, common_1.Param)('adminId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "marcarTodasLeidasAdmin", null);
__decorate([
    (0, common_1.Delete)(':id/alumno/:alumnoId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('alumnoId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "eliminarAlumno", null);
__decorate([
    (0, common_1.Delete)(':id/profesor/:profesorId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('profesorId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "eliminarProfesor", null);
__decorate([
    (0, common_1.Delete)(':id/admin/:adminId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('adminId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], NotificacionController.prototype, "eliminarAdmin", null);
exports.NotificacionController = NotificacionController = __decorate([
    (0, common_1.Controller)('notificacion'),
    __metadata("design:paramtypes", [notificacion_service_1.NotificacionService,
        notificacion_stream_service_1.NotificacionStreamService])
], NotificacionController);
//# sourceMappingURL=notificacion.controller.js.map