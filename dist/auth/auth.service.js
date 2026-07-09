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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const admin_entity_1 = require("../entities/admin.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
const alumno_entity_1 = require("../entities/alumno.entity");
const password_util_1 = require("../common/password.util");
const profesor_lookup_util_1 = require("../common/profesor-lookup.util");
let AuthService = class AuthService {
    adminRepo;
    profesorRepo;
    alumnoRepo;
    jwtService;
    constructor(adminRepo, profesorRepo, alumnoRepo, jwtService) {
        this.adminRepo = adminRepo;
        this.profesorRepo = profesorRepo;
        this.alumnoRepo = alumnoRepo;
        this.jwtService = jwtService;
    }
    async login(dto) {
        if (!dto.tipo) {
            return this.loginUnified(dto.usuario, dto.password);
        }
        switch (dto.tipo) {
            case 'admin':
                return this.loginAdmin(dto.usuario, dto.password, 'super_admin');
            case 'directiva':
                return this.loginAdmin(dto.usuario, dto.password, 'directiva');
            case 'profesor':
                return this.loginProfesor(dto.usuario, dto.password);
            case 'alumno':
                return this.loginAlumno(dto.usuario, dto.password);
            case 'apoderado': {
                const rut = dto.usuario.trim();
                const alumno = await this.alumnoRepo.findOne({ where: { apoderadoRut: rut } });
                if (!alumno)
                    throw new common_1.UnauthorizedException('RUT o contraseña incorrectos');
                return this.loginApoderado(alumno, dto.password);
            }
            default:
                throw new common_1.UnauthorizedException('Tipo de usuario no válido');
        }
    }
    async loginUnified(usuario, password) {
        const email = usuario.trim().toLowerCase();
        if (email.includes('@')) {
            const admin = await this.adminRepo.findOne({ where: { email } });
            if (admin) {
                return this.loginAdmin(usuario, password);
            }
        }
        try {
            return await this.loginProfesor(usuario, password);
        }
        catch {
        }
        const rut = usuario.trim();
        const apoderadoAlumno = await this.alumnoRepo.findOne({ where: { apoderadoRut: rut } });
        if (apoderadoAlumno) {
            return this.loginApoderado(apoderadoAlumno, password);
        }
        return this.loginAlumno(usuario, password);
    }
    async loginAdmin(usuario, password, expectedRol) {
        const email = usuario.trim().toLowerCase();
        const admin = await this.adminRepo.findOne({ where: { email } });
        if (!admin) {
            throw new common_1.UnauthorizedException('Usuario o contraseña incorrectos');
        }
        if (expectedRol === 'super_admin' && admin.rol !== 'super_admin') {
            throw new common_1.UnauthorizedException('Usuario o contraseña incorrectos');
        }
        if (expectedRol === 'directiva' && admin.rol !== 'directiva') {
            throw new common_1.UnauthorizedException('Usuario o contraseña incorrectos');
        }
        await this.ensurePassword(admin, password, (entity, hash, salt) => {
            entity.passwordHash = hash;
            entity.passwordSalt = salt;
        }, () => this.adminRepo.save(admin));
        const isSuper = admin.rol === 'super_admin';
        return this.buildResponse({
            sub: admin.id,
            role: isSuper ? 'super_admin' : 'admin',
            tipo: isSuper ? 'admin' : 'directiva',
            nombre: admin.nombre,
        });
    }
    async loginProfesor(usuario, password) {
        const profesor = await this.findProfesorByUsuario(usuario);
        if (!profesor) {
            throw new common_1.UnauthorizedException('Usuario o contraseña incorrectos');
        }
        await this.ensurePassword(profesor, password, (entity, hash, salt) => {
            entity.passwordHash = hash;
            entity.passwordSalt = salt;
        }, () => this.profesorRepo.save(profesor));
        return this.buildResponse({
            sub: profesor.id,
            role: 'admin',
            tipo: 'profesor',
            tallerId: profesor.tallerId,
            nombre: profesor.nombre,
        });
    }
    async loginAlumno(usuario, password) {
        const rut = usuario.trim();
        const alumno = await this.alumnoRepo.findOne({ where: { rut } });
        if (!alumno) {
            throw new common_1.UnauthorizedException('RUT o contraseña incorrectos');
        }
        await this.ensurePassword(alumno, password, (entity, hash, salt) => {
            entity.passwordHash = hash;
            entity.passwordSalt = salt;
        }, () => this.alumnoRepo.save(alumno));
        return this.buildResponse({
            sub: alumno.id,
            role: 'usuario',
            tipo: 'alumno',
            tallerId: alumno.tallerId ?? undefined,
            nombre: alumno.nombre,
        });
    }
    async loginApoderado(alumno, password) {
        await this.ensurePassword({
            passwordHash: alumno.apoderadoPasswordHash,
            passwordSalt: alumno.apoderadoPasswordSalt,
        }, password, (_, hash, salt) => {
            alumno.apoderadoPasswordHash = hash;
            alumno.apoderadoPasswordSalt = salt;
        }, () => this.alumnoRepo.save(alumno));
        return this.buildResponse({
            sub: alumno.id,
            role: 'usuario',
            tipo: 'apoderado',
            tallerId: alumno.tallerId ?? undefined,
            nombre: alumno.apoderadoNombre ?? `Apoderado de ${alumno.nombre}`,
        });
    }
    async ensurePassword(entity, password, assign, save) {
        if ((0, password_util_1.needsPasswordInit)(entity.passwordHash) && password === (0, password_util_1.defaultPassword)()) {
            const { hash, salt } = (0, password_util_1.hashPassword)(password);
            assign(entity, hash, salt);
            await save();
            return;
        }
        if (!(0, password_util_1.verifyPassword)(password, entity.passwordHash, entity.passwordSalt)) {
            throw new common_1.UnauthorizedException('Usuario o contraseña incorrectos');
        }
    }
    async findProfesorByUsuario(usuario) {
        return (0, profesor_lookup_util_1.buscarProfesorPorUsuario)(this.profesorRepo, usuario);
    }
    buildResponse(payload) {
        const accessToken = this.jwtService.sign(payload);
        const user = {
            id: payload.sub,
            nombre: payload.nombre,
            role: payload.role,
            tipo: payload.tipo,
            tallerId: payload.tallerId,
        };
        return { accessToken, user };
    }
    validatePayload(payload) {
        return payload;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(admin_entity_1.Admin)),
    __param(1, (0, typeorm_1.InjectRepository)(profesor_entity_1.Profesor)),
    __param(2, (0, typeorm_1.InjectRepository)(alumno_entity_1.Alumno)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map