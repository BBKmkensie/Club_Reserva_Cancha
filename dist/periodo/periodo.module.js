"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const periodo_academico_entity_1 = require("../entities/periodo-academico.entity");
const periodo_service_1 = require("./periodo.service");
const periodo_controller_1 = require("./periodo.controller");
let PeriodoModule = class PeriodoModule {
};
exports.PeriodoModule = PeriodoModule;
exports.PeriodoModule = PeriodoModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([periodo_academico_entity_1.PeriodoAcademico])],
        controllers: [periodo_controller_1.PeriodoController],
        providers: [periodo_service_1.PeriodoService],
        exports: [periodo_service_1.PeriodoService],
    })
], PeriodoModule);
//# sourceMappingURL=periodo.module.js.map