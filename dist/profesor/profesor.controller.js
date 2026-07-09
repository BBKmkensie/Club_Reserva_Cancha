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
exports.ProfesorController = void 0;
const common_1 = require("@nestjs/common");
const profesor_service_1 = require("./profesor.service");
const create_profesor_dto_1 = require("../dto/create-profesor.dto");
const login_profesor_dto_1 = require("../dto/login-profesor.dto");
let ProfesorController = class ProfesorController {
    profesorService;
    constructor(profesorService) {
        this.profesorService = profesorService;
    }
    login(dto) {
        return this.profesorService.login(dto.usuario, dto.password);
    }
    create(createProfesorDto) {
        return this.profesorService.create(createProfesorDto);
    }
    findAll(tallerId) {
        if (tallerId) {
            return this.profesorService.findByTaller(parseInt(tallerId, 10));
        }
        return this.profesorService.findAll();
    }
    findOne(id) {
        return this.profesorService.findOne(id);
    }
    update(id, updateProfesorDto) {
        return this.profesorService.update(id, updateProfesorDto);
    }
    remove(id) {
        return this.profesorService.remove(id);
    }
};
exports.ProfesorController = ProfesorController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_profesor_dto_1.LoginProfesorDto]),
    __metadata("design:returntype", void 0)
], ProfesorController.prototype, "login", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_profesor_dto_1.CreateProfesorDto]),
    __metadata("design:returntype", void 0)
], ProfesorController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tallerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProfesorController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProfesorController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ProfesorController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ProfesorController.prototype, "remove", null);
exports.ProfesorController = ProfesorController = __decorate([
    (0, common_1.Controller)('profesor'),
    __metadata("design:paramtypes", [profesor_service_1.ProfesorService])
], ProfesorController);
//# sourceMappingURL=profesor.controller.js.map