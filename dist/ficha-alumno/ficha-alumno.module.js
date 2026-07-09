"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FichaAlumnoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ficha_alumno_taller_entity_1 = require("../entities/ficha-alumno-taller.entity");
const alumno_entity_1 = require("../entities/alumno.entity");
const inscripcion_taller_entity_1 = require("../entities/inscripcion-taller.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
const ficha_alumno_service_1 = require("./ficha-alumno.service");
const ficha_alumno_controller_1 = require("./ficha-alumno.controller");
let FichaAlumnoModule = class FichaAlumnoModule {
};
exports.FichaAlumnoModule = FichaAlumnoModule;
exports.FichaAlumnoModule = FichaAlumnoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([ficha_alumno_taller_entity_1.FichaAlumnoTaller, alumno_entity_1.Alumno, inscripcion_taller_entity_1.InscripcionTaller, profesor_entity_1.Profesor])],
        controllers: [ficha_alumno_controller_1.FichaAlumnoController],
        providers: [ficha_alumno_service_1.FichaAlumnoService],
        exports: [ficha_alumno_service_1.FichaAlumnoService],
    })
], FichaAlumnoModule);
//# sourceMappingURL=ficha-alumno.module.js.map