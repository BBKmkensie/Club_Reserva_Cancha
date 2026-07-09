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
exports.SalidaController = void 0;
const common_1 = require("@nestjs/common");
const salida_service_1 = require("./salida.service");
const create_salida_dto_1 = require("../dto/create-salida.dto");
const asignar_salida_dto_1 = require("../dto/asignar-salida.dto");
const proponer_salida_dto_1 = require("../dto/proponer-salida.dto");
const responder_salida_dto_1 = require("../dto/responder-salida.dto");
const abrir_salida_dto_1 = require("../dto/abrir-salida.dto");
const cerrar_salida_dto_1 = require("../dto/cerrar-salida.dto");
let SalidaController = class SalidaController {
    salidaService;
    constructor(salidaService) {
        this.salidaService = salidaService;
    }
    asignarDirectiva(dto) {
        return this.salidaService.asignarDirectiva(dto);
    }
    proponerProfesor(dto) {
        return this.salidaService.proponerProfesor(dto);
    }
    findPublicadas(tallerId, alumnoId) {
        if (alumnoId) {
            return this.salidaService.findPublicadasParaAlumno(parseInt(alumnoId, 10));
        }
        return this.salidaService.findPublicadas(tallerId ? parseInt(tallerId, 10) : undefined);
    }
    findPendientesProfesor(profesorId) {
        return this.salidaService.findPendientesProfesor(profesorId);
    }
    findPendientesDirectiva() {
        return this.salidaService.findPendientesDirectiva();
    }
    findByProfesor(profesorId) {
        return this.salidaService.findByProfesor(profesorId);
    }
    create(createSalidaDto) {
        return this.salidaService.create(createSalidaDto);
    }
    findAll(tallerId) {
        if (tallerId) {
            return this.salidaService.findByTaller(parseInt(tallerId, 10));
        }
        return this.salidaService.findAll();
    }
    findOne(id) {
        return this.salidaService.findOne(id);
    }
    responder(id, dto, actor, actorId) {
        return this.salidaService.responder(id, dto, actor, actorId ? parseInt(actorId, 10) : undefined);
    }
    abrir(id, profesorId, dto) {
        return this.salidaService.abrir(id, profesorId, dto);
    }
    cerrar(id, profesorId, dto) {
        return this.salidaService.cerrar(id, profesorId, dto);
    }
    update(id, updateSalidaDto) {
        return this.salidaService.update(id, updateSalidaDto);
    }
    remove(id) {
        return this.salidaService.remove(id);
    }
};
exports.SalidaController = SalidaController;
__decorate([
    (0, common_1.Post)('asignar'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [asignar_salida_dto_1.AsignarSalidaDto]),
    __metadata("design:returntype", void 0)
], SalidaController.prototype, "asignarDirectiva", null);
__decorate([
    (0, common_1.Post)('proponer'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [proponer_salida_dto_1.ProponerSalidaDto]),
    __metadata("design:returntype", void 0)
], SalidaController.prototype, "proponerProfesor", null);
__decorate([
    (0, common_1.Get)('publicadas'),
    __param(0, (0, common_1.Query)('tallerId')),
    __param(1, (0, common_1.Query)('alumnoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SalidaController.prototype, "findPublicadas", null);
__decorate([
    (0, common_1.Get)('pendientes/profesor/:profesorId'),
    __param(0, (0, common_1.Param)('profesorId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SalidaController.prototype, "findPendientesProfesor", null);
__decorate([
    (0, common_1.Get)('pendientes/directiva'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SalidaController.prototype, "findPendientesDirectiva", null);
__decorate([
    (0, common_1.Get)('por-profesor/:profesorId'),
    __param(0, (0, common_1.Param)('profesorId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SalidaController.prototype, "findByProfesor", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_salida_dto_1.CreateSalidaDto]),
    __metadata("design:returntype", void 0)
], SalidaController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tallerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalidaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SalidaController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/responder'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('actor')),
    __param(3, (0, common_1.Query)('actorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, responder_salida_dto_1.ResponderSalidaDto, String, String]),
    __metadata("design:returntype", void 0)
], SalidaController.prototype, "responder", null);
__decorate([
    (0, common_1.Patch)(':id/abrir'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('profesorId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, abrir_salida_dto_1.AbrirSalidaDto]),
    __metadata("design:returntype", void 0)
], SalidaController.prototype, "abrir", null);
__decorate([
    (0, common_1.Patch)(':id/cerrar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('profesorId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, cerrar_salida_dto_1.CerrarSalidaDto]),
    __metadata("design:returntype", void 0)
], SalidaController.prototype, "cerrar", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], SalidaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SalidaController.prototype, "remove", null);
exports.SalidaController = SalidaController = __decorate([
    (0, common_1.Controller)('salida'),
    __metadata("design:paramtypes", [salida_service_1.SalidaService])
], SalidaController);
//# sourceMappingURL=salida.controller.js.map