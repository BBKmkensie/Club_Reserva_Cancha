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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Taller = void 0;
const typeorm_1 = require("typeorm");
const admin_entity_1 = require("./admin.entity");
const alumno_entity_1 = require("./alumno.entity");
const profesor_entity_1 = require("./profesor.entity");
const reserva_entity_1 = require("./reserva.entity");
const salida_entity_1 = require("./salida.entity");
const inscripcion_taller_entity_1 = require("./inscripcion-taller.entity");
const taller_horario_entity_1 = require("./taller-horario.entity");
let Taller = class Taller {
    id;
    tipo;
    descripcion;
    capacidad;
    umbralAusencias;
    imagenUrl;
    fechaInicio;
    diaSemana;
    horaInicio;
    horaFin;
    estado;
    modoHorario;
    fechaAperturaInscripcion;
    fechaCierreInscripcion;
    publicadoAt;
    cerradoAt;
    adminId;
    admin;
    alumnos;
    profesores;
    reservas;
    salidas;
    inscripciones;
    horarios;
};
exports.Taller = Taller;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Taller.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Taller.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Taller.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 20 }),
    __metadata("design:type", Number)
], Taller.prototype, "capacidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 3, name: 'umbral_ausencias' }),
    __metadata("design:type", Number)
], Taller.prototype, "umbralAusencias", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true, name: 'imagen_url' }),
    __metadata("design:type", Object)
], Taller.prototype, "imagenUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true, name: 'fecha_inicio' }),
    __metadata("design:type", Object)
], Taller.prototype, "fechaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'smallint', nullable: true, name: 'dia_semana' }),
    __metadata("design:type", Object)
], Taller.prototype, "diaSemana", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', nullable: true, name: 'hora_inicio' }),
    __metadata("design:type", Object)
], Taller.prototype, "horaInicio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time', nullable: true, name: 'hora_fin' }),
    __metadata("design:type", Object)
], Taller.prototype, "horaFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, default: 'BORRADOR' }),
    __metadata("design:type", String)
], Taller.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'POR_CURSO', name: 'modo_horario' }),
    __metadata("design:type", String)
], Taller.prototype, "modoHorario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true, name: 'fecha_apertura_inscripcion' }),
    __metadata("design:type", Object)
], Taller.prototype, "fechaAperturaInscripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true, name: 'fecha_cierre_inscripcion' }),
    __metadata("design:type", Object)
], Taller.prototype, "fechaCierreInscripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'publicado_at' }),
    __metadata("design:type", Object)
], Taller.prototype, "publicadoAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'cerrado_at' }),
    __metadata("design:type", Object)
], Taller.prototype, "cerradoAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'admin_id', nullable: true }),
    __metadata("design:type", Number)
], Taller.prototype, "adminId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => admin_entity_1.Admin, (admin) => admin.talleres, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'admin_id' }),
    __metadata("design:type", admin_entity_1.Admin)
], Taller.prototype, "admin", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => alumno_entity_1.Alumno, (alumno) => alumno.taller),
    __metadata("design:type", Array)
], Taller.prototype, "alumnos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => profesor_entity_1.Profesor, (profesor) => profesor.taller),
    __metadata("design:type", Array)
], Taller.prototype, "profesores", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => reserva_entity_1.Reserva, (reserva) => reserva.taller),
    __metadata("design:type", Array)
], Taller.prototype, "reservas", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => salida_entity_1.Salida, (salida) => salida.taller),
    __metadata("design:type", Array)
], Taller.prototype, "salidas", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => inscripcion_taller_entity_1.InscripcionTaller, (insc) => insc.taller),
    __metadata("design:type", Array)
], Taller.prototype, "inscripciones", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => taller_horario_entity_1.TallerHorario, (h) => h.taller),
    __metadata("design:type", Array)
], Taller.prototype, "horarios", void 0);
exports.Taller = Taller = __decorate([
    (0, typeorm_1.Entity)('talleres')
], Taller);
//# sourceMappingURL=taller.entity.js.map