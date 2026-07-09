/**
 * Servicio de envío de correos electrónicos.
 * Usa nodemailer cuando está habilitado; en modo desarrollo registra los mensajes en consola.
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/** Envío centralizado de correos transaccionales del sistema. */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private enabled = false;
  private from = '';
  private frontendUrl = 'http://localhost:4200';

  constructor(private configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('mail.enabled') ?? false;
    this.from = this.configService.get<string>('mail.from') ?? 'Reservas Cancha <noreply@reservas.local>';
    this.frontendUrl =
      this.configService.get<string>('mail.frontendUrl') ?? 'http://localhost:4200';

    if (this.enabled) {
      const host = this.configService.get<string>('mail.host');
      const port = this.configService.get<number>('mail.port');
      const user = this.configService.get<string>('mail.user');
      const pass = this.configService.get<string>('mail.pass');

      this.transporter = nodemailer.createTransport({
        host,
        port,
        auth: user && pass ? { user, pass } : undefined,
      });
      this.logger.log(`Email habilitado (${host}:${port})`);
    } else {
      this.logger.warn('Email deshabilitado (MAIL_ENABLED=false). Los correos se registran en consola.');
    }
  }

  /** Envía un correo de texto plano; simula en consola si el mail está deshabilitado. */
  async enviar(to: string, asunto: string, texto: string): Promise<boolean> {
    if (!to?.trim()) return false;

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
    } catch (err) {
      this.logger.error(`Error enviando email a ${to}: ${(err as Error).message}`);
      return false;
    }
  }

  async notificarAlumno(email: string | null | undefined, titulo: string, mensaje: string) {
    if (!email) return;
    await this.enviar(email, `[Reservas Cancha] ${titulo}`, mensaje);
  }

  async notificarProfesor(email: string, titulo: string, mensaje: string) {
    await this.enviar(email, `[Reservas Cancha] ${titulo}`, mensaje);
  }

  async notificarAdmin(email: string, titulo: string, mensaje: string) {
    await this.enviar(email, `[Reservas Cancha] ${titulo}`, mensaje);
  }

  /** Notifica al apoderado cuando el alumno supera el umbral de ausencias. */
  async alertaApoderado(
    email: string | null | undefined,
    alumnoNombre: string,
    tallerNombre: string,
    cantidadAusencias: number,
    umbral: number,
    apoderadoNombre?: string | null,
  ) {
    if (!email) return;
    const saludo = apoderadoNombre?.trim()
      ? `Estimado/a ${apoderadoNombre.trim()}`
      : `Estimado/a apoderado/a de ${alumnoNombre}`;
    const texto =
      `${saludo},\n\n` +
      `Le informamos sobre la asistencia de su hijo/a **${alumnoNombre}** ` +
      `en el taller **"${tallerNombre}"**.\n\n` +
      `Taller inscrito: ${tallerNombre}\n` +
      `Ausencias acumuladas: ${cantidadAusencias}\n` +
      `Umbral de alerta: ${umbral}\n\n` +
      `Por favor, contacte al coordinador del taller para regularizar la situación.\n\n` +
      `— Sistema Reservas de Cancha`;
    await this.enviar(email, `[Alerta] Asistencia — ${tallerNombre}`, texto);
  }

  /** Informa al apoderado que el coordinador se puso en contacto por asistencia. */
  async contactoApoderado(
    email: string | null | undefined,
    alumnoNombre: string,
    tallerNombre: string,
    cantidadAusencias: number,
    notas?: string,
    apoderadoNombre?: string | null,
  ) {
    if (!email) return;
    const saludo = apoderadoNombre?.trim()
      ? `Estimado/a ${apoderadoNombre.trim()}`
      : `Estimado/a apoderado/a de ${alumnoNombre}`;
    const texto =
      `${saludo},\n\n` +
      `El coordinador del taller **"${tallerNombre}"** se ha puesto en contacto ` +
      `respecto a la asistencia de su hijo/a **${alumnoNombre}**.\n\n` +
      `Taller inscrito: ${tallerNombre}\n` +
      `Ausencias registradas: ${cantidadAusencias}\n\n` +
      (notas ? `Notas del coordinador:\n${notas}\n\n` : '') +
      `— Sistema Reservas de Cancha`;
    await this.enviar(email, `[Contacto] Asistencia — ${tallerNombre}`, texto);
  }

  /** Confirma al apoderado la inscripción aceptada de su hijo/a en un taller. */
  async inscripcionTallerApoderado(
    email: string | null | undefined,
    alumnoNombre: string,
    tallerNombre: string,
    apoderadoNombre?: string | null,
    horario?: string | null,
  ): Promise<boolean> {
    if (!email) return false;
    const saludo = apoderadoNombre?.trim()
      ? `Estimado/a ${apoderadoNombre.trim()}`
      : `Estimado/a apoderado/a de ${alumnoNombre}`;
    const texto =
      `${saludo},\n\n` +
      `Le informamos que su hijo/a **${alumnoNombre}** fue **aceptado/a** en el taller:\n\n` +
      `Taller: ${tallerNombre}\n` +
      (horario ? `Horario: ${horario}\n` : '') +
      `\nRecibirá correos sobre la asistencia de su hijo/a en este taller.\n\n` +
      `— Sistema Reservas de Cancha`;
    return await this.enviar(email, `[Inscripción] Taller ${tallerNombre}`, texto);
  }

  /** Envía al apoderado el registro de asistencia al cerrar una sesión. */
  async asistenciaSesionApoderado(
    email: string | null | undefined,
    alumnoNombre: string,
    tallerNombre: string,
    fecha: string,
    estado: string,
    apoderadoNombre?: string | null,
    observacion?: string | null,
  ): Promise<boolean> {
    if (!email) return false;
    const estadoLabel =
      estado === 'PRESENTE' ? 'Presente' : estado === 'AUSENTE' ? 'Ausente' : 'Tarde';
    const saludo = apoderadoNombre?.trim()
      ? `Estimado/a ${apoderadoNombre.trim()}`
      : `Estimado/a apoderado/a de ${alumnoNombre}`;
    const texto =
      `${saludo},\n\n` +
      `Registro de asistencia del ${fecha}:\n\n` +
      `Alumno/a: ${alumnoNombre}\n` +
      `Taller inscrito: ${tallerNombre}\n` +
      `Estado: ${estadoLabel}\n` +
      (observacion?.trim() ? `Observación: ${observacion.trim()}\n` : '') +
      `\n— Sistema Reservas de Cancha`;
    return await this.enviar(email, `[Asistencia] ${tallerNombre} — ${fecha}`, texto);
  }

  /** Informa al apoderado la respuesta de la directiva a su propuesta de inscripción. */
  async respuestaPropuestaDirectivaApoderado(
    email: string | null | undefined,
    opts: {
      apoderadoNombre?: string | null;
      alumnoNombre: string;
      tallerNombre: string;
      aceptada: boolean;
      horarioPropuesto?: string | null;
      motivoRechazo?: string | null;
      horarioSugerido?: string | null;
      mensajeDirectiva?: string | null;
    },
  ): Promise<boolean> {
    if (!email) return false;

    const saludo = opts.apoderadoNombre?.trim()
      ? `Estimado/a ${opts.apoderadoNombre.trim()}`
      : `Estimado/a apoderado/a de ${opts.alumnoNombre}`;

    const lineas: string[] = [`${saludo},\n`];

    if (opts.aceptada) {
      lineas.push(
        `La directiva **aceptó** su propuesta de inscripción para su hijo/a **${opts.alumnoNombre}**:\n`,
        `Actividad: ${opts.tallerNombre}`,
      );
      if (opts.horarioPropuesto) lineas.push(`Horario propuesto: ${opts.horarioPropuesto}`);
      lineas.push(
        `\nLa solicitud quedó **pendiente de aprobación del profesor** del taller.`,
      );
      if (opts.mensajeDirectiva?.trim()) {
        lineas.push(`\nMensaje de la directiva:\n${opts.mensajeDirectiva.trim()}`);
      }
    } else {
      lineas.push(
        `La directiva **rechazó** su propuesta de inscripción para su hijo/a **${opts.alumnoNombre}**:\n`,
        `Actividad: ${opts.tallerNombre}`,
      );
      if (opts.horarioPropuesto) lineas.push(`Horario que había propuesto: ${opts.horarioPropuesto}`);
      if (opts.motivoRechazo?.trim()) lineas.push(`\nMotivo del rechazo:\n${opts.motivoRechazo.trim()}`);
      if (opts.horarioSugerido) {
        lineas.push(
          `\nHorario alternativo disponible sugerido por la directiva:\n${opts.horarioSugerido}`,
        );
        lineas.push(
          `\nPuede enviar una nueva propuesta desde el portal del apoderado seleccionando ese horario.`,
        );
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

  /** Avisa a la directiva que un apoderado envió una nueva propuesta de inscripción. */
  async nuevaPropuestaDirectiva(
    email: string,
    directivaNombre: string,
    opts: {
      apoderadoNombre: string;
      alumnoNombre: string;
      alumnoRut?: string | null;
      tallerNombre: string;
      horarioPropuesto?: string | null;
      mensajeApoderado?: string | null;
      propuestaId: number;
    },
  ): Promise<boolean> {
    const enlace = `${this.frontendUrl}/propuestas-actividad?id=${opts.propuestaId}`;
    const lineas: string[] = [
      `Estimado/a ${directivaNombre},\n`,
      `Un apoderado envió una **nueva propuesta de inscripción** que requiere su revisión:\n`,
      `Apoderado: ${opts.apoderadoNombre}`,
      `Estudiante: ${opts.alumnoNombre}`,
    ];
    if (opts.alumnoRut?.trim()) lineas.push(`RUT estudiante: ${opts.alumnoRut.trim()}`);
    lineas.push(`Actividad: ${opts.tallerNombre}`);
    if (opts.horarioPropuesto) lineas.push(`Horario propuesto: ${opts.horarioPropuesto}`);
    if (opts.mensajeApoderado?.trim()) {
      lineas.push(`\nComentario del apoderado:\n${opts.mensajeApoderado.trim()}`);
    }
    lineas.push(
      `\nRevise y responda en la bandeja de propuestas:\n${enlace}`,
      `\n— Sistema Reservas de Cancha`,
    );

    return await this.enviar(
      email,
      `[Nueva propuesta] ${opts.tallerNombre} — ${opts.alumnoNombre}`,
      lineas.join('\n'),
    );
  }
}
