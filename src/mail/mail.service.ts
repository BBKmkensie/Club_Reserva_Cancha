import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private enabled = false;
  private from = '';

  constructor(private configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('mail.enabled') ?? false;
    this.from = this.configService.get<string>('mail.from') ?? 'Reservas Cancha <noreply@reservas.local>';

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
}
