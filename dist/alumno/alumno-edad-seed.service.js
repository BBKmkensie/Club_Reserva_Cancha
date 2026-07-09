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
exports.EDAD_ALUMNO_MAX = exports.EDAD_ALUMNO_MIN = exports.AlumnoEdadSeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const alumno_entity_1 = require("../entities/alumno.entity");
const alumno_edad_constants_1 = require("../common/alumno-edad.constants");
Object.defineProperty(exports, "EDAD_ALUMNO_MAX", { enumerable: true, get: function () { return alumno_edad_constants_1.EDAD_ALUMNO_MAX; } });
Object.defineProperty(exports, "EDAD_ALUMNO_MIN", { enumerable: true, get: function () { return alumno_edad_constants_1.EDAD_ALUMNO_MIN; } });
let AlumnoEdadSeedService = class AlumnoEdadSeedService {
    alumnoRepo;
    constructor(alumnoRepo) {
        this.alumnoRepo = alumnoRepo;
    }
    async seedMissingEdades() {
        const alumnos = await this.alumnoRepo.find({ order: { id: 'ASC' } });
        const detalle = [];
        let actualizados = 0;
        let omitidos = 0;
        for (const alumno of alumnos) {
            if ((0, alumno_edad_constants_1.edadAlumnoValida)(alumno.edad)) {
                omitidos++;
                continue;
            }
            const edadAnterior = alumno.edad ?? null;
            alumno.edad = (0, alumno_edad_constants_1.edadSugeridaParaAlumno)(alumno.id);
            await this.alumnoRepo.save(alumno);
            actualizados++;
            detalle.push({
                alumnoId: alumno.id,
                nombre: alumno.nombre,
                edadAnterior,
                edadNueva: alumno.edad,
            });
        }
        return { actualizados, omitidos, detalle };
    }
};
exports.AlumnoEdadSeedService = AlumnoEdadSeedService;
exports.AlumnoEdadSeedService = AlumnoEdadSeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(alumno_entity_1.Alumno)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AlumnoEdadSeedService);
//# sourceMappingURL=alumno-edad-seed.service.js.map