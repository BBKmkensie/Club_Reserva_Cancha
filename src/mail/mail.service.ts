/**
 * =============================================================================
 * mail/mail.service.ts — ENVÍO CENTRALIZADO DE CORREOS
 * =============================================================================
 * Usa nodemailer cuando MAIL_ENABLED=true.
 * Si está deshabilitado, “simula” el envío logueando en consola (útil en dev).
 *
 * Métodos de alto nivel (plantillas de texto):
 *   alertaApoderado / contactoApoderado / asistenciaSesionApoderado
 *   inscripcionTallerApoderado / respuestaPropuestaDirectivaApoderado
 *   nuevaPropuestaDirectiva
 *
 * El método base es enviar(to, asunto, texto).
 * =============================================================================
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// ConfigService = lee namespace 'mail' (MAIL_ENABLED, host, port, from...)
import { ConfigService } from '@nestjs/config';
// nodemailer = cliente SMTP; Transporter = conexión reutilizable
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/** Envío centralizado de correos transaccionales del sistema. */
@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  /** Transporter de nodemailer; null si el mail está deshabilitado. */
  private transporter: Transporter | null = null;
  private enabled = false;
  private from = '';
  private frontendUrl = 'http://localhost:4200';

  constructor(private configService: ConfigService) {
    // Lee namespace 'mail' de ConfigModule (ver config/mail.config.ts)
    this.enabled = this.configService.get<boolean>('mail.enabled') ?? false;
    this.from = this.configService.get<string>('mail.from') ?? 'Reservas Cancha <noreply@reservas.local>';
    this.frontendUrl =
      this.configService.get<string>('mail.frontendUrl') ?? 'http://localhost:4200';

    if (this.enabled) {
      const host = this.configService.get<string>('mail.host');
      const port = this.configService.get<number>('mail.port') ?? 587;
      const user = this.configService.get<string>('mail.user');
      const pass = this.configService.get<string>('mail.pass');

      if (!host?.trim() || !user?.trim() || !pass?.trim()) {
        this.logger.error(
          'MAIL_ENABLED=true pero faltan SMTP_HOST, SMTP_USER o SMTP_PASS. Los correos NO se enviarán.',
        );
        this.enabled = false;
        this.transporter = null;
      } else {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          requireTLS: port === 587,
          auth: { user, pass },
        });
        this.logger.log(`Email habilitado (${host}:${port})`);
      }
    } else {
      this.logger.warn('Email deshabilitado (MAIL_ENABLED=false). Los correos se registran en consola.');
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.enabled || !this.transporter) return;
    try {
      await this.transporter.verify();
      this.logger.log('Conexión SMTP verificada correctamente');
    } catch (err) {
      this.logger.error(
        `No se pudo conectar al SMTP (${(err as Error).message}). Revisa SMTP_HOST, puerto y credenciales en Azure.`,
      );
    }
  }

  /**
   * Envía un correo de texto plano.
   * Si mail deshabilitado → log en consola y return true (no rompe el flujo).
   */
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

  /** Atajo: notifica al email del alumno. */
  async notificarAlumno(email: string | null | undefined, titulo: string, mensaje: string) {
    if (!email) return;
    await this.enviar(email, `[Reservas Cancha] ${titulo}`, mensaje);
  }

  /** Atajo: notifica al email del profesor. */
  async notificarProfesor(email: string, titulo: string, mensaje: string) {
    await this.enviar(email, `[Reservas Cancha] ${titulo}`, mensaje);
  }

  /** Atajo: notifica al email del administrador. */
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
      esActividadLibre?: boolean;
    },
  ): Promise<boolean> {
    if (!email) return false;

    const saludo = opts.apoderadoNombre?.trim()
      ? `Estimado/a ${opts.apoderadoNombre.trim()}`
      : `Estimado/a apoderado/a de ${opts.alumnoNombre}`;

    const lineas: string[] = [`${saludo},\n`];

    if (opts.aceptada) {
      lineas.push(
        `La directiva **aceptó** su propuesta para su hijo/a **${opts.alumnoNombre}**:\n`,
        `Actividad: ${opts.tallerNombre}`,
      );
      if (opts.horarioPropuesto) lineas.push(`Horario propuesto: ${opts.horarioPropuesto}`);
      if (opts.esActividadLibre) {
        lineas.push(
          `\nLa coordinación evaluará la creación de esta actividad y se pondrá en contacto con usted.`,
        );
      } else {
        lineas.push(`\nLa solicitud quedó **pendiente de aprobación del profesor** del taller.`);
      }
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

  /**
   * Avisa a la directiva que un apoderado o alumno envió una nueva propuesta.
   * Incluye enlace al frontend: /propuestas-actividad?id=...
   */
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
      actividadDescripcion?: string | null;
      esActividadLibre?: boolean;
      origen?: 'APODERADO' | 'ALUMNO';
    },
  ): Promise<boolean> {
    const enlace = `${this.frontendUrl}/propuestas-actividad?id=${opts.propuestaId}`;
    const tituloPropuesta = opts.esActividadLibre
      ? 'nueva actividad (fuera del catálogo)'
      : 'nueva propuesta de inscripción';
    const esAlumno = opts.origen === 'ALUMNO';
    const lineas: string[] = [
      `Estimado/a ${directivaNombre},\n`,
      esAlumno
        ? `Un alumno envió una **${tituloPropuesta}** que requiere su revisión:\n`
        : `Un apoderado envió una **${tituloPropuesta}** que requiere su revisión:\n`,
    ];
    if (esAlumno) {
      lineas.push(`Propuesto por (alumno): ${opts.alumnoNombre}`);
    } else {
      lineas.push(`Apoderado: ${opts.apoderadoNombre}`);
      lineas.push(`Estudiante: ${opts.alumnoNombre}`);
    }
    if (opts.alumnoRut?.trim()) lineas.push(`RUT estudiante: ${opts.alumnoRut.trim()}`);
    lineas.push(`Actividad: ${opts.tallerNombre}`);
    if (opts.actividadDescripcion?.trim()) {
      lineas.push(`Descripción: ${opts.actividadDescripcion.trim()}`);
    }
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
