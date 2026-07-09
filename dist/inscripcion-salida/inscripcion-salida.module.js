"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InscripcionSalidaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const inscripcion_salida_service_1 = require("./inscripcion-salida.service");
const inscripcion_salida_controller_1 = require("./inscripcion-salida.controller");
const inscripcion_salida_entity_1 = require("../entities/inscripcion-salida.entity");
const inscripcion_taller_entity_1 = require("../entities/inscripcion-taller.entity");
const alumno_entity_1 = require("../entities/alumno.entity");
const salida_entity_1 = require("../entities/salida.entity");
let InscripcionSalidaModule = class InscripcionSalidaModule {
};
exports.InscripcionSalidaModule = InscripcionSalidaModule;
exports.InscripcionSalidaModule = InscripcionSalidaModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([inscripcion_salida_entity_1.InscripcionSalida, inscripcion_taller_entity_1.InscripcionTaller, alumno_entity_1.Alumno, salida_entity_1.Salida])],
        controllers: [inscripcion_salida_controller_1.InscripcionSalidaController],
        providers: [inscripcion_salida_service_1.InscripcionSalidaService],
        exports: [inscripcion_salida_service_1.InscripcionSalidaService],
    })
], InscripcionSalidaModule);
//# sourceMappingURL=inscripcion-salida.module.js.map