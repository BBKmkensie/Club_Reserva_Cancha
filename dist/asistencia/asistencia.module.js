"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsistenciaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const sesion_asistencia_entity_1 = require("../entities/sesion-asistencia.entity");
const registro_asistencia_entity_1 = require("../entities/registro-asistencia.entity");
const inscripcion_taller_entity_1 = require("../entities/inscripcion-taller.entity");
const taller_entity_1 = require("../entities/taller.entity");
const alumno_entity_1 = require("../entities/alumno.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
const alerta_ausencia_entity_1 = require("../entities/alerta-ausencia.entity");
const asistencia_service_1 = require("./asistencia.service");
const asistencia_controller_1 = require("./asistencia.controller");
const notificacion_module_1 = require("../notificacion/notificacion.module");
let AsistenciaModule = class AsistenciaModule {
};
exports.AsistenciaModule = AsistenciaModule;
exports.AsistenciaModule = AsistenciaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                sesion_asistencia_entity_1.SesionAsistencia,
                registro_asistencia_entity_1.RegistroAsistencia,
                inscripcion_taller_entity_1.InscripcionTaller,
                taller_entity_1.Taller,
                alumno_entity_1.Alumno,
                profesor_entity_1.Profesor,
                alerta_ausencia_entity_1.AlertaAusencia,
            ]),
            notificacion_module_1.NotificacionModule,
        ],
        controllers: [asistencia_controller_1.AsistenciaController],
        providers: [asistencia_service_1.AsistenciaService],
        exports: [asistencia_service_1.AsistenciaService],
    })
], AsistenciaModule);
//# sourceMappingURL=asistencia.module.js.map