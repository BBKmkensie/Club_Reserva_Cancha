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
exports.AlumnoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const alumno_entity_1 = require("../entities/alumno.entity");
const alumno_edad_constants_1 = require("../common/alumno-edad.constants");
const password_util_1 = require("../common/password.util");
let AlumnoService = class AlumnoService {
    alumnoRepository;
    constructor(alumnoRepository) {
        this.alumnoRepository = alumnoRepository;
    }
    async create(createAlumnoDto) {
        this.validarEdad(createAlumnoDto.edad);
        const alumnoData = {
            nombre: createAlumnoDto.nombre,
            rut: createAlumnoDto.rut,
            email: createAlumnoDto.email,
            telefono: createAlumnoDto.telefono,
            edad: createAlumnoDto.edad,
            tallerId: createAlumnoDto.tallerId ?? null,
        };
        if (createAlumnoDto.password) {
            const { hash, salt } = (0, password_util_1.hashPassword)(createAlumnoDto.password);
            alumnoData.passwordHash = hash;
            alumnoData.passwordSalt = salt;
        }
        else {
            const { hash, salt } = (0, password_util_1.hashPassword)((0, password_util_1.defaultPassword)());
            alumnoData.passwordHash = hash;
            alumnoData.passwordSalt = salt;
        }
        const alumno = this.alumnoRepository.create(alumnoData);
        const saved = await this.alumnoRepository.save(alumno);
        if (Array.isArray(saved)) {
            return saved[0];
        }
        return saved;
    }
    async findAll() {
        return await this.alumnoRepository.find({ relations: ['taller'] });
    }
    async findOne(id) {
        const alumno = await this.alumnoRepository.findOne({
            where: { id },
            relations: ['taller'],
        });
        if (!alumno) {
            throw new common_1.NotFoundException(`Alumno con ID ${id} no encontrado`);
        }
        return alumno;
    }
    async findByTaller(tallerId) {
        return await this.alumnoRepository.find({
            where: { tallerId },
            relations: ['taller'],
        });
    }
    async update(id, updateAlumnoDto) {
        if (updateAlumnoDto.edad !== undefined) {
            this.validarEdad(updateAlumnoDto.edad);
        }
        const alumno = await this.findOne(id);
        const { tallerId, ...rest } = updateAlumnoDto;
        Object.assign(alumno, rest);
        if (tallerId !== undefined)
            alumno.tallerId = tallerId ?? null;
        return await this.alumnoRepository.save(alumno);
    }
    async remove(id) {
        const alumno = await this.findOne(id);
        await this.alumnoRepository.remove(alumno);
    }
    validarEdad(edad) {
        if (edad == null)
            return;
        if (!(0, alumno_edad_constants_1.edadAlumnoValida)(edad)) {
            throw new common_1.BadRequestException(`La edad debe estar entre ${alumno_edad_constants_1.EDAD_ALUMNO_MIN} y ${alumno_edad_constants_1.EDAD_ALUMNO_MAX} años`);
        }
    }
};
exports.AlumnoService = AlumnoService;
exports.AlumnoService = AlumnoService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(alumno_entity_1.Alumno)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AlumnoService);
//# sourceMappingURL=alumno.service.js.map