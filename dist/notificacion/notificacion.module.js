"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificacionModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notificacion_entity_1 = require("../entities/notificacion.entity");
const alumno_entity_1 = require("../entities/alumno.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
const admin_entity_1 = require("../entities/admin.entity");
const notificacion_service_1 = require("./notificacion.service");
const notificacion_controller_1 = require("./notificacion.controller");
const notificacion_stream_service_1 = require("./notificacion-stream.service");
const mail_module_1 = require("../mail/mail.module");
let NotificacionModule = class NotificacionModule {
};
exports.NotificacionModule = NotificacionModule;
exports.NotificacionModule = NotificacionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([notificacion_entity_1.Notificacion, alumno_entity_1.Alumno, profesor_entity_1.Profesor, admin_entity_1.Admin]),
            mail_module_1.MailModule,
        ],
        controllers: [notificacion_controller_1.NotificacionController],
        providers: [notificacion_service_1.NotificacionService, notificacion_stream_service_1.NotificacionStreamService],
        exports: [notificacion_service_1.NotificacionService, notificacion_stream_service_1.NotificacionStreamService],
    })
], NotificacionModule);
//# sourceMappingURL=notificacion.module.js.map