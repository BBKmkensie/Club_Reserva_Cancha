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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = __importStar(require("nodemailer"));
let MailService = MailService_1 = class MailService {
    configService;
    logger = new common_1.Logger(MailService_1.name);
    transporter = null;
    enabled = false;
    from = '';
    frontendUrl = 'http://localhost:4200';
    constructor(configService) {
        this.configService = configService;
        this.enabled = this.configService.get('mail.enabled') ?? false;
        this.from = this.configService.get('mail.from') ?? 'Reservas Cancha <noreply@reservas.local>';
        this.frontendUrl =
            this.configService.get('mail.frontendUrl') ?? 'http://localhost:4200';
        if (this.enabled) {
            const host = this.configService.get('mail.host');
            const port = this.configService.get('mail.port');
            const user = this.configService.get('mail.user');
            const pass = this.configService.get('mail.pass');
            this.transporter = nodemailer.createTransport({
                host,
                port,
                auth: user && pass ? { user, pass } : undefined,
            });
            this.logger.log(`Email habilitado (${host}:${port})`);
        }
        else {
            this.logger.warn('Email deshabilitado (MAIL_ENABLED=false). Los correos se registran en consola.');
        }
    }
    async enviar(to, asunto, texto) {
        if (!to?.trim())
            return false;
        if (!this.enabled || !this.transporter) {
            this.logger.log(`[EMAIL simulado] Para: ${to} | Asunto: ${asunto}\n${texto}`);
            return true;
        }
        try {
            await this.transporter.sendMail({
                from: this.from,
                to: to.trim(),
                subject: asunto,
                text: texto,
            });
            this.logger.log(`Email enviado a ${to}: ${asunto}`);
            return true;
        }
        catch (err) {
            this.logger.error(`Error enviando email a ${to}: ${err.message}`);
            return false;
        }
    }
    async notificarAlumno(email, titulo, mensaje) {
        if (!email)
            return;
        await this.enviar(email, `[Reservas Cancha] ${titulo}`, mensaje);
    }
    async notificarProfesor(email, titulo, mensaje) {
        await this.enviar(email, `[Reservas Cancha] ${titulo}`, mensaje);
    }
    async notificarAdmin(email, titulo, mensaje) {
        await this.enviar(email, `[Reservas Cancha] ${titulo}`, mensaje);
    }
    async alertaApoderado(email, alumnoNombre, tallerNombre, cantidadAusencias, umbral, apoderadoNombre) {
        if (!email)
            return;
        const saludo = apoderadoNombre?.trim()
            ? `Estimado/a ${apoderadoNombre.trim()}`
            : `Estimado/a apoderado/a de ${alumnoNombre}`;
        const texto = `${saludo},\n\n` +
            `Le informamos sobre la asistencia de su hijo/a **${alumnoNombre}** ` +
            `en el taller **"${tallerNombre}"**.\n\n` +
            `Taller inscrito: ${tallerNombre}\n` +
            `Ausencias acumuladas: ${cantidadAusencias}\n` +
            `Umbral de alerta: ${umbral}\n\n` +
            `Por favor, contacte al coordinador del taller para regularizar la situación.\n\n` +
            `— Sistema Reservas de Cancha`;
        await this.enviar(email, `[Alerta] Asistencia — ${tallerNombre}`, texto);
    }
    async contactoApoderado(email, alumnoNombre, tallerNombre, cantidadAusencias, notas, apoderadoNombre) {
        if (!email)
            return;
        const saludo = apoderadoNombre?.trim()
            ? `Estimado/a ${apoderadoNombre.trim()}`
            : `Estimado/a apoderado/a de ${alumnoNombre}`;
        const texto = `${saludo},\n\n` +
            `El coordinador del taller **"${tallerNombre}"** se ha puesto en contacto ` +
            `respecto a la asistencia de su hijo/a **${alumnoNombre}**.\n\n` +
            `Taller inscrito: ${tallerNombre}\n` +
            `Ausencias registradas: ${cantidadAusencias}\n\n` +
            (notas ? `Notas del coordinador:\n${notas}\n\n` : '') +
            `— Sistema Reservas de Cancha`;
        await this.enviar(email, `[Contacto] Asistencia — ${tallerNombre}`, texto);
    }
    async inscripcionTallerApoderado(email, alumnoNombre, tallerNombre, apoderadoNombre, horario) {
        if (!email)
            return false;
        const saludo = apoderadoNombre?.trim()
            ? `Estimado/a ${apoderadoNombre.trim()}`
            : `Estimado/a apoderado/a de ${alumnoNombre}`;
        const texto = `${saludo},\n\n` +
            `Le informamos que su hijo/a **${alumnoNombre}** fue **aceptado/a** en el taller:\n\n` +
            `Taller: ${tallerNombre}\n` +
            (horario ? `Horario: ${horario}\n` : '') +
            `\nRecibirá correos sobre la asistencia de su hijo/a en este taller.\n\n` +
            `— Sistema Reservas de Cancha`;
        return await this.enviar(email, `[Inscripción] Taller ${tallerNombre}`, texto);
    }
    async asistenciaSesionApoderado(email, alumnoNombre, tallerNombre, fecha, estado, apoderadoNombre, observacion) {
        if (!email)
            return false;
        const estadoLabel = estado === 'PRESENTE' ? 'Presente' : estado === 'AUSENTE' ? 'Ausente' : 'Tarde';
        const saludo = apoderadoNombre?.trim()
            ? `Estimado/a ${apoderadoNombre.trim()}`
            : `Estimado/a apoderado/a de ${alumnoNombre}`;
        const texto = `${saludo},\n\n` +
            `Registro de asistencia del ${fecha}:\n\n` +
            `Alumno/a: ${alumnoNombre}\n` +
            `Taller inscrito: ${tallerNombre}\n` +
            `Estado: ${estadoLabel}\n` +
            (observacion?.trim() ? `Observación: ${observacion.trim()}\n` : '') +
            `\n— Sistema Reservas de Cancha`;
        return await this.enviar(email, `[Asistencia] ${tallerNombre} — ${fecha}`, texto);
    }
    async respuestaPropuestaDirectivaApoderado(email, opts) {
        if (!email)
            return false;
        const saludo = opts.apoderadoNombre?.trim()
            ? `Estimado/a ${opts.apoderadoNombre.trim()}`
            : `Estimado/a apoderado/a de ${opts.alumnoNombre}`;
        const lineas = [`${saludo},\n`];
        if (opts.aceptada) {
            lineas.push(`La directiva **aceptó** su propuesta para su hijo/a **${opts.alumnoNombre}**:\n`, `Actividad: ${opts.tallerNombre}`);
            if (opts.horarioPropuesto)
                lineas.push(`Horario propuesto: ${opts.horarioPropuesto}`);
            if (opts.esActividadLibre) {
                lineas.push(`\nLa coordinación evaluará la creación de esta actividad y se pondrá en contacto con usted.`);
            }
            else {
                lineas.push(`\nLa solicitud quedó **pendiente de aprobación del profesor** del taller.`);
            }
            if (opts.mensajeDirectiva?.trim()) {
                lineas.push(`\nMensaje de la directiva:\n${opts.mensajeDirectiva.trim()}`);
            }
        }
        else {
            lineas.push(`La directiva **rechazó** su propuesta de inscripción para su hijo/a **${opts.alumnoNombre}**:\n`, `Actividad: ${opts.tallerNombre}`);
            if (opts.horarioPropuesto)
                lineas.push(`Horario que había propuesto: ${opts.horarioPropuesto}`);
            if (opts.motivoRechazo?.trim())
                lineas.push(`\nMotivo del rechazo:\n${opts.motivoRechazo.trim()}`);
            if (opts.horarioSugerido) {
                lineas.push(`\nHorario alternativo disponible sugerido por la directiva:\n${opts.horarioSugerido}`);
                lineas.push(`\nPuede enviar una nueva propuesta desde el portal del apoderado seleccionando ese horario.`);
            }
            if (opts.mensajeDirectiva?.trim()) {
                lineas.push(`\nMensaje de la directiva:\n${opts.mensajeDirectiva.trim()}`);
            }
        }
        lineas.push(`\n— Sistema Reservas de Cancha`);
        const asunto = opts.aceptada
            ? `[Propuesta aceptada] ${opts.tallerNombre}`
            : `[Propuesta rechazada] ${opts.tallerNombre}`;
        return await this.enviar(email, asunto, lineas.join('\n'));
    }
    async nuevaPropuestaDirectiva(email, directivaNombre, opts) {
        const enlace = `${this.frontendUrl}/propuestas-actividad?id=${opts.propuestaId}`;
        const tituloPropuesta = opts.esActividadLibre
            ? 'nueva actividad (fuera del catálogo)'
            : 'nueva propuesta de inscripción';
        const lineas = [
            `Estimado/a ${directivaNombre},\n`,
            `Un apoderado envió una **${tituloPropuesta}** que requiere su revisión:\n`,
            `Apoderado: ${opts.apoderadoNombre}`,
            `Estudiante: ${opts.alumnoNombre}`,
        ];
        if (opts.alumnoRut?.trim())
            lineas.push(`RUT estudiante: ${opts.alumnoRut.trim()}`);
        lineas.push(`Actividad: ${opts.tallerNombre}`);
        if (opts.actividadDescripcion?.trim()) {
            lineas.push(`Descripción: ${opts.actividadDescripcion.trim()}`);
        }
        if (opts.horarioPropuesto)
            lineas.push(`Horario propuesto: ${opts.horarioPropuesto}`);
        if (opts.mensajeApoderado?.trim()) {
            lineas.push(`\nComentario del apoderado:\n${opts.mensajeApoderado.trim()}`);
        }
        lineas.push(`\nRevise y responda en la bandeja de propuestas:\n${enlace}`, `\n— Sistema Reservas de Cancha`);
        return await this.enviar(email, `[Nueva propuesta] ${opts.tallerNombre} — ${opts.alumnoNombre}`, lineas.join('\n'));
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map