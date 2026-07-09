"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InscripcionTallerModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const inscripcion_taller_entity_1 = require("../entities/inscripcion-taller.entity");
const taller_entity_1 = require("../entities/taller.entity");
const alumno_entity_1 = require("../entities/alumno.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
const propuesta_inscripcion_taller_entity_1 = require("../entities/propuesta-inscripcion-taller.entity");
const taller_horario_entity_1 = require("../entities/taller-horario.entity");
const inscripcion_taller_service_1 = require("./inscripcion-taller.service");
const inscripcion_taller_controller_1 = require("./inscripcion-taller.controller");
const notificacion_module_1 = require("../notificacion/notificacion.module");
const mail_module_1 = require("../mail/mail.module");
let InscripcionTallerModule = class InscripcionTallerModule {
};
exports.InscripcionTallerModule = InscripcionTallerModule;
exports.InscripcionTallerModule = InscripcionTallerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                inscripcion_taller_entity_1.InscripcionTaller,
                taller_entity_1.Taller,
                alumno_entity_1.Alumno,
                profesor_entity_1.Profesor,
                propuesta_inscripcion_taller_entity_1.PropuestaInscripcionTaller,
                taller_horario_entity_1.TallerHorario,
            ]),
            notificacion_module_1.NotificacionModule,
            mail_module_1.MailModule,
        ],
        controllers: [inscripcion_taller_controller_1.InscripcionTallerController],
        providers: [inscripcion_taller_service_1.InscripcionTallerService],
        exports: [inscripcion_taller_service_1.InscripcionTallerService],
    })
], InscripcionTallerModule);
//# sourceMappingURL=inscripcion-taller.module.js.map