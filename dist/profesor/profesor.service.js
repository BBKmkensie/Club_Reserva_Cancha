"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfesorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const profesor_entity_1 = require("../entities/profesor.entity");
const profesor_lookup_util_1 = require("../common/profesor-lookup.util");
const crypto = __importStar(require("crypto"));
let ProfesorService = class ProfesorService {
    profesorRepository;
    constructor(profesorRepository) {
        this.profesorRepository = profesorRepository;
    }
    async create(createProfesorDto) {
        const profesorData = {
            nombre: createProfesorDto.nombre,
            rut: createProfesorDto.rut,
            email: createProfesorDto.email,
            telefono: createProfesorDto.telefono,
            fotoPath: createProfesorDto.fotoPath,
            tallerId: createProfesorDto.tallerId,
        };
        if (createProfesorDto.password) {
            const salt = crypto.randomBytes(16).toString('hex');
            const hash = crypto
                .pbkdf2Sync(createProfesorDto.password, salt, 1000, 64, 'sha512')
                .toString('hex');
            profesorData.passwordHash = hash;
            profesorData.passwordSalt = salt;
        }
        const profesor = this.profesorRepository.create(profesorData);
        const saved = await this.profesorRepository.save(profesor);
        if (Array.isArray(saved)) {
            return saved[0];
        }
        return saved;
    }
    async findAll() {
        return await this.profesorRepository.find({ relations: ['taller'] });
    }
    async findOne(id) {
        const profesor = await this.profesorRepository.findOne({
            where: { id },
            relations: ['taller', 'salidas'],
        });
        if (!profesor) {
            throw new common_1.NotFoundException(`Profesor con ID ${id} no encontrado`);
        }
        return profesor;
    }
    async findByTaller(tallerId) {
        return await this.profesorRepository.find({
            where: { tallerId },
            relations: ['taller'],
        });
    }
    async update(id, updateProfesorDto) {
        const profesor = await this.findOne(id);
        Object.assign(profesor, updateProfesorDto);
        return await this.profesorRepository.save(profesor);
    }
    async remove(id) {
        const profesor = await this.findOne(id);
        await this.profesorRepository.remove(profesor);
    }
    async findByUsuario(usuario) {
        return (0, profesor_lookup_util_1.buscarProfesorPorUsuario)(this.profesorRepository, usuario);
    }
    verifyPassword(profesor, password) {
        if (!profesor.passwordHash || !profesor.passwordSalt) {
            return password === '12345';
        }
        const hash = crypto
            .pbkdf2Sync(password, profesor.passwordSalt, 1000, 64, 'sha512')
            .toString('hex');
        return hash === profesor.passwordHash;
    }
    async setPasswordToDefault(profesor) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto
            .pbkdf2Sync('12345', salt, 1000, 64, 'sha512')
            .toString('hex');
        profesor.passwordHash = hash;
        profesor.passwordSalt = salt;
        await this.profesorRepository.save(profesor);
    }
    async login(usuario, password) {
        const profesor = await this.findByUsuario(usuario);
        if (!profesor) {
            throw new common_1.UnauthorizedException('Usuario o contraseña incorrectos');
        }
        if (!profesor.passwordHash && password === '12345') {
            await this.setPasswordToDefault(profesor);
        }
        else if (!this.verifyPassword(profesor, password)) {
            throw new common_1.UnauthorizedException('Usuario o contraseña incorrectos');
        }
        const { passwordHash, passwordSalt, ...rest } = profesor;
        return rest;
    }
};
exports.ProfesorService = ProfesorService;
exports.ProfesorService = ProfesorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(profesor_entity_1.Profesor)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProfesorService);
//# sourceMappingURL=profesor.service.js.map