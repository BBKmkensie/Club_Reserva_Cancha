"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const reserva_service_1 = require("./reserva.service");
const reserva_controller_1 = require("./reserva.controller");
const franja_cancha_controller_1 = require("./franja-cancha.controller");
const franja_cancha_service_1 = require("./franja-cancha.service");
const reserva_entity_1 = require("../entities/reserva.entity");
const franja_cancha_entity_1 = require("../entities/franja-cancha.entity");
const taller_entity_1 = require("../entities/taller.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
const periodo_academico_entity_1 = require("../entities/periodo-academico.entity");
const reserva_cancha_seed_service_1 = require("./reserva-cancha-seed.service");
let ReservaModule = class ReservaModule {
};
exports.ReservaModule = ReservaModule;
exports.ReservaModule = ReservaModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([reserva_entity_1.Reserva, franja_cancha_entity_1.FranjaCancha, taller_entity_1.Taller, profesor_entity_1.Profesor, periodo_academico_entity_1.PeriodoAcademico])],
        controllers: [reserva_controller_1.ReservaController, franja_cancha_controller_1.FranjaCanchaController],
        providers: [reserva_service_1.ReservaService, franja_cancha_service_1.FranjaCanchaService, reserva_cancha_seed_service_1.ReservaCanchaSeedService],
        exports: [reserva_service_1.ReservaService, franja_cancha_service_1.FranjaCanchaService, reserva_cancha_seed_service_1.ReservaCanchaSeedService],
    })
], ReservaModule);
//# sourceMappingURL=reserva.module.js.map