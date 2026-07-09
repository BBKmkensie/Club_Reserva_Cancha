"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApoderadoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const alumno_entity_1 = require("../entities/alumno.entity");
const inscripcion_taller_entity_1 = require("../entities/inscripcion-taller.entity");
const sesion_asistencia_entity_1 = require("../entities/sesion-asistencia.entity");
const apoderado_service_1 = require("./apoderado.service");
const apoderado_controller_1 = require("./apoderado.controller");
const apoderado_seed_service_1 = require("./apoderado-seed.service");
const apoderado_notify_service_1 = require("./apoderado-notify.service");
const registro_asistencia_entity_1 = require("../entities/registro-asistencia.entity");
const auth_module_1 = require("../auth/auth.module");
const profesor_entity_1 = require("../entities/profesor.entity");
const inscripcion_taller_module_1 = require("../inscripcion-taller/inscripcion-taller.module");
let ApoderadoModule = class ApoderadoModule {
};
exports.ApoderadoModule = ApoderadoModule;
exports.ApoderadoModule = ApoderadoModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([alumno_entity_1.Alumno, inscripcion_taller_entity_1.InscripcionTaller, sesion_asistencia_entity_1.SesionAsistencia, profesor_entity_1.Profesor, registro_asistencia_entity_1.RegistroAsistencia]),
            auth_module_1.AuthModule,
            (0, common_1.forwardRef)(() => inscripcion_taller_module_1.InscripcionTallerModule),
        ],
        controllers: [apoderado_controller_1.ApoderadoController],
        providers: [apoderado_service_1.ApoderadoService, apoderado_seed_service_1.ApoderadoSeedService, apoderado_notify_service_1.ApoderadoNotifyService],
        exports: [apoderado_service_1.ApoderadoService, apoderado_seed_service_1.ApoderadoSeedService, apoderado_notify_service_1.ApoderadoNotifyService],
    })
], ApoderadoModule);
//# sourceMappingURL=apoderado.module.js.map