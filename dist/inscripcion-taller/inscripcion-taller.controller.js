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
exports.InscripcionTallerController = void 0;
const common_1 = require("@nestjs/common");
const inscripcion_taller_service_1 = require("./inscripcion-taller.service");
const create_inscripcion_taller_dto_1 = require("../dto/create-inscripcion-taller.dto");
const responder_inscripcion_taller_dto_1 = require("../dto/responder-inscripcion-taller.dto");
const ficha_alumno_dto_1 = require("../dto/ficha-alumno.dto");
const proponer_inscripcion_directiva_dto_1 = require("../dto/proponer-inscripcion-directiva.dto");
const responder_propuesta_inscripcion_dto_1 = require("../dto/responder-propuesta-inscripcion.dto");
const retirar_inscripcion_taller_dto_1 = require("../dto/retirar-inscripcion-taller.dto");
let InscripcionTallerController = class InscripcionTallerController {
    inscripcionTallerService;
    constructor(inscripcionTallerService) {
        this.inscripcionTallerService = inscripcionTallerService;
    }
    solicitar(dto) {
        return this.inscripcionTallerService.solicitar(dto);
    }
    validar(alumnoId, tallerId, notificar) {
        return this.inscripcionTallerService.validar(alumnoId, tallerId, notificar === 'true');
    }
    resumen(tallerId) {
        return this.inscripcionTallerService.getResumen(tallerId);
    }
    findByTaller(tallerId) {
        return this.inscripcionTallerService.findByTaller(tallerId);
    }
    findByAlumno(alumnoId) {
        return this.inscripcionTallerService.findByAlumno(alumnoId);
    }
    responder(id, dto) {
        return this.inscripcionTallerService.responder(id, dto);
    }
    retirar(id, dto) {
        return this.inscripcionTallerService.retirarse(id, dto.alumnoId);
    }
    actualizarFicha(id, dto) {
        return this.inscripcionTallerService.actualizarFicha(id, dto);
    }
    proponerDirectiva(dto) {
        return this.inscripcionTallerService.proponerDirectiva(dto);
    }
    getPropuestasPendientes() {
        return this.inscripcionTallerService.getPropuestasPendientes();
    }
    responderPropuesta(id, dto) {
        return this.inscripcionTallerService.responderPropuesta(id, dto);
    }
};
exports.InscripcionTallerController = InscripcionTallerController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_inscripcion_taller_dto_1.CreateInscripcionTallerDto]),
    __metadata("design:returntype", void 0)
], InscripcionTallerController.prototype, "solicitar", null);
__decorate([
    (0, common_1.Get)('validar/:alumnoId/:tallerId'),
    __param(0, (0, common_1.Param)('alumnoId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('tallerId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('notificar')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", void 0)
], InscripcionTallerController.prototype, "validar", null);
__decorate([
    (0, common_1.Get)('resumen/:tallerId'),
    __param(0, (0, common_1.Param)('tallerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InscripcionTallerController.prototype, "resumen", null);
__decorate([
    (0, common_1.Get)('por-taller/:tallerId'),
    __param(0, (0, common_1.Param)('tallerId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InscripcionTallerController.prototype, "findByTaller", null);
__decorate([
    (0, common_1.Get)('por-alumno/:alumnoId'),
    __param(0, (0, common_1.Param)('alumnoId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InscripcionTallerController.prototype, "findByAlumno", null);
__decorate([
    (0, common_1.Patch)(':id/responder'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, responder_inscripcion_taller_dto_1.ResponderInscripcionTallerDto]),
    __metadata("design:returntype", void 0)
], InscripcionTallerController.prototype, "responder", null);
__decorate([
    (0, common_1.Patch)(':id/retirar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, retirar_inscripcion_taller_dto_1.RetirarInscripcionTallerDto]),
    __metadata("design:returntype", void 0)
], InscripcionTallerController.prototype, "retirar", null);
__decorate([
    (0, common_1.Patch)(':id/ficha'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, ficha_alumno_dto_1.ActualizarFichaAlumnoDto]),
    __metadata("design:returntype", void 0)
], InscripcionTallerController.prototype, "actualizarFicha", null);
__decorate([
    (0, common_1.Post)('proponer-directiva'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [proponer_inscripcion_directiva_dto_1.ProponerInscripcionDirectivaDto]),
    __metadata("design:returntype", void 0)
], InscripcionTallerController.prototype, "proponerDirectiva", null);
__decorate([
    (0, common_1.Get)('propuestas/pendientes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InscripcionTallerController.prototype, "getPropuestasPendientes", null);
__decorate([
    (0, common_1.Patch)('propuestas/:id/responder'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, responder_propuesta_inscripcion_dto_1.ResponderPropuestaInscripcionDto]),
    __metadata("design:returntype", void 0)
], InscripcionTallerController.prototype, "responderPropuesta", null);
exports.InscripcionTallerController = InscripcionTallerController = __decorate([
    (0, common_1.Controller)('inscripcion-taller'),
    __metadata("design:paramtypes", [inscripcion_taller_service_1.InscripcionTallerService])
], InscripcionTallerController);
//# sourceMappingURL=inscripcion-taller.controller.js.map