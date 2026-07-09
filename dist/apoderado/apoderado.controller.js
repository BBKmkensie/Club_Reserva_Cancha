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
exports.ApoderadoController = void 0;
const common_1 = require("@nestjs/common");
const apoderado_service_1 = require("./apoderado.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const inscripcion_taller_service_1 = require("../inscripcion-taller/inscripcion-taller.service");
const proponer_inscripcion_apoderado_dto_1 = require("../dto/proponer-inscripcion-apoderado.dto");
const proponer_actividad_libre_dto_1 = require("../dto/proponer-actividad-libre.dto");
let ApoderadoController = class ApoderadoController {
    apoderadoService;
    inscripcionTallerService;
    constructor(apoderadoService, inscripcionTallerService) {
        this.apoderadoService = apoderadoService;
        this.inscripcionTallerService = inscripcionTallerService;
    }
    getResumen(req) {
        const alumnoId = this.apoderadoService.assertApoderado(req.user);
        return this.apoderadoService.getResumen(alumnoId);
    }
    proponerInscripcion(req, tallerId, body) {
        const alumnoId = this.apoderadoService.assertApoderado(req.user);
        return this.inscripcionTallerService.proponerDirectiva({
            alumnoId,
            tallerId,
            tallerHorarioId: body.tallerHorarioId,
            horarioPropuestoTexto: body.horarioPropuestoTexto,
            mensajeApoderado: body.mensajeApoderado,
        });
    }
    misPropuestas(req) {
        const alumnoId = this.apoderadoService.assertApoderado(req.user);
        return this.inscripcionTallerService.getPropuestasPorAlumno(alumnoId);
    }
    proponerActividadLibre(req, body) {
        const alumnoId = this.apoderadoService.assertApoderado(req.user);
        return this.inscripcionTallerService.proponerActividadLibre(alumnoId, body);
    }
};
exports.ApoderadoController = ApoderadoController;
__decorate([
    (0, common_1.Get)('resumen'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApoderadoController.prototype, "getResumen", null);
__decorate([
    (0, common_1.Post)('proponer-inscripcion/:tallerId'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('tallerId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, proponer_inscripcion_apoderado_dto_1.ProponerInscripcionApoderadoDto]),
    __metadata("design:returntype", void 0)
], ApoderadoController.prototype, "proponerInscripcion", null);
__decorate([
    (0, common_1.Get)('mis-propuestas'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ApoderadoController.prototype, "misPropuestas", null);
__decorate([
    (0, common_1.Post)('proponer-actividad-libre'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, proponer_actividad_libre_dto_1.ProponerActividadLibreDto]),
    __metadata("design:returntype", void 0)
], ApoderadoController.prototype, "proponerActividadLibre", null);
exports.ApoderadoController = ApoderadoController = __decorate([
    (0, common_1.Controller)('apoderado'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [apoderado_service_1.ApoderadoService,
        inscripcion_taller_service_1.InscripcionTallerService])
], ApoderadoController);
//# sourceMappingURL=apoderado.controller.js.map