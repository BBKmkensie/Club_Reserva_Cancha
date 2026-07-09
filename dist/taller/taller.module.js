"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TallerModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const taller_service_1 = require("./taller.service");
const taller_controller_1 = require("./taller.controller");
const taller_entity_1 = require("../entities/taller.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
const asignacion_docente_entity_1 = require("../entities/asignacion-docente.entity");
const inscripcion_taller_entity_1 = require("../entities/inscripcion-taller.entity");
const sesion_asistencia_entity_1 = require("../entities/sesion-asistencia.entity");
const taller_horario_entity_1 = require("../entities/taller-horario.entity");
const reserva_entity_1 = require("../entities/reserva.entity");
const notificacion_module_1 = require("../notificacion/notificacion.module");
const periodo_module_1 = require("../periodo/periodo.module");
const taller_seed_service_1 = require("./taller-seed.service");
let TallerModule = class TallerModule {
};
exports.TallerModule = TallerModule;
exports.TallerModule = TallerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                taller_entity_1.Taller,
                profesor_entity_1.Profesor,
                asignacion_docente_entity_1.AsignacionDocente,
                inscripcion_taller_entity_1.InscripcionTaller,
                sesion_asistencia_entity_1.SesionAsistencia,
                taller_horario_entity_1.TallerHorario,
                reserva_entity_1.Reserva,
            ]),
            notificacion_module_1.NotificacionModule,
            periodo_module_1.PeriodoModule,
        ],
        controllers: [taller_controller_1.TallerController],
        providers: [taller_service_1.TallerService, taller_seed_service_1.TallerSeedService],
        exports: [taller_service_1.TallerService, taller_seed_service_1.TallerSeedService],
    })
], TallerModule);
//# sourceMappingURL=taller.module.js.map