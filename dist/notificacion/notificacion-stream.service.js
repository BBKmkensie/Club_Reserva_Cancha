"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificacionStreamService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let NotificacionStreamService = class NotificacionStreamService {
    alumnoStreams = new Map();
    profesorStreams = new Map();
    adminStreams = new Map();
    streamAlumno(alumnoId) {
        const subject = this.getOrCreate(this.alumnoStreams, alumnoId);
        return this.buildStream(subject, () => this.cleanup(this.alumnoStreams, alumnoId, subject));
    }
    streamProfesor(profesorId) {
        const subject = this.getOrCreate(this.profesorStreams, profesorId);
        return this.buildStream(subject, () => this.cleanup(this.profesorStreams, profesorId, subject));
    }
    streamAdmin(adminId) {
        const subject = this.getOrCreate(this.adminStreams, adminId);
        return this.buildStream(subject, () => this.cleanup(this.adminStreams, adminId, subject));
    }
    emitAlumno(alumnoId, notificacion) {
        this.alumnoStreams.get(alumnoId)?.next(notificacion);
    }
    emitProfesor(profesorId, notificacion) {
        this.profesorStreams.get(profesorId)?.next(notificacion);
    }
    emitAdmin(adminId, notificacion) {
        this.adminStreams.get(adminId)?.next(notificacion);
    }
    getOrCreate(map, id) {
        let subject = map.get(id);
        if (!subject) {
            subject = new rxjs_1.Subject();
            map.set(id, subject);
        }
        return subject;
    }
    buildStream(subject, onCleanup) {
        const events = subject.asObservable().pipe((0, rxjs_1.map)((payload) => ({ data: payload })), (0, rxjs_1.finalize)(onCleanup));
        const heartbeat = (0, rxjs_1.interval)(30000).pipe((0, rxjs_1.map)(() => ({ data: { type: 'ping' } })));
        return (0, rxjs_1.merge)(events, heartbeat);
    }
    cleanup(map, id, subject) {
        if (!subject.observed) {
            map.delete(id);
            subject.complete();
        }
    }
};
exports.NotificacionStreamService = NotificacionStreamService;
exports.NotificacionStreamService = NotificacionStreamService = __decorate([
    (0, common_1.Injectable)()
], NotificacionStreamService);
//# sourceMappingURL=notificacion-stream.service.js.map