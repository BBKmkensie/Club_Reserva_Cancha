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
exports.PropuestaInscripcionTaller = void 0;
const typeorm_1 = require("typeorm");
const alumno_entity_1 = require("./alumno.entity");
const taller_entity_1 = require("./taller.entity");
const taller_horario_entity_1 = require("./taller-horario.entity");
let PropuestaInscripcionTaller = class PropuestaInscripcionTaller {
    id;
    alumnoId;
    alumno;
    tallerId;
    taller;
    actividadLibreNombre;
    actividadLibreDescripcion;
    estado;
    motivoRechazo;
    tallerHorarioId;
    tallerHorario;
    horarioPropuestoTexto;
    horarioSugeridoId;
    horarioSugerido;
    horarioSugeridoTexto;
    mensajeApoderado;
    mensajeDirectiva;
    createdAt;
    respondedAt;
};
exports.PropuestaInscripcionTaller = PropuestaInscripcionTaller;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PropuestaInscripcionTaller.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'alumno_id' }),
    __metadata("design:type", Number)
], PropuestaInscripcionTaller.prototype, "alumnoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => alumno_entity_1.Alumno, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'alumno_id' }),
    __metadata("design:type", alumno_entity_1.Alumno)
], PropuestaInscripcionTaller.prototype, "alumno", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taller_id', nullable: true }),
    __metadata("design:type", Object)
], PropuestaInscripcionTaller.prototype, "tallerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => taller_entity_1.Taller, { onDelete: 'CASCADE', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'taller_id' }),
    __metadata("design:type", Object)
], PropuestaInscripcionTaller.prototype, "taller", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true, name: 'actividad_libre_nombre' }),
    __metadata("design:type", Object)
], PropuestaInscripcionTaller.prototype, "actividadLibreNombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'actividad_libre_descripcion' }),
    __metadata("design:type", Object)
], PropuestaInscripcionTaller.prototype, "actividadLibreDescripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, default: 'PENDIENTE' }),
    __metadata("design:type", String)
], PropuestaInscripcionTaller.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'motivo_rechazo' }),
    __metadata("design:type", Object)
], PropuestaInscripcionTaller.prototype, "motivoRechazo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taller_horario_id', nullable: true }),
    __metadata("design:type", Object)
], PropuestaInscripcionTaller.prototype, "tallerHorarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => taller_horario_entity_1.TallerHorario, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'taller_horario_id' }),
    __metadata("design:type", Object)
], PropuestaInscripcionTaller.prototype, "tallerHorario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true, name: 'horario_propuesto_texto' }),
    __metadata("design:type", Object)
], PropuestaInscripcionTaller.prototype, "horarioPropuestoTexto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'horario_sugerido_id', nullable: true }),
    __metadata("design:type", Object)
], PropuestaInscripcionTaller.prototype, "horarioSugeridoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => taller_horario_entity_1.TallerHorario, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'horario_sugerido_id' }),
    __metadata("design:type", Object)
], PropuestaInscripcionTaller.prototype, "horarioSugerido", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true, name: 'horario_sugerido_texto' }),
    __metadata("design:type", Object)
], PropuestaInscripcionTaller.prototype, "horarioSugeridoTexto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'mensaje_apoderado' }),
    __metadata("design:type", Object)
], PropuestaInscripcionTaller.prototype, "mensajeApoderado", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'mensaje_directiva' }),
    __metadata("design:type", Object)
], PropuestaInscripcionTaller.prototype, "mensajeDirectiva", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PropuestaInscripcionTaller.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'responded_at' }),
    __metadata("design:type", Object)
], PropuestaInscripcionTaller.prototype, "respondedAt", void 0);
exports.PropuestaInscripcionTaller = PropuestaInscripcionTaller = __decorate([
    (0, typeorm_1.Entity)('propuestas_inscripcion_taller')
], PropuestaInscripcionTaller);
//# sourceMappingURL=propuesta-inscripcion-taller.entity.js.map