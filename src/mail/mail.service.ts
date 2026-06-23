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
  ) {
    if (!email) return;
    const texto =
      `Estimado/a apoderado/a de ${alumnoNombre},\n\n` +
      `Le informamos que su pupilo/a ha acumulado ${cantidadAusencias} ausencia(s) ` +
      `en el taller "${tallerNombre}" (umbral de alerta: ${umbral}).\n\n` +
      `Por favor, contacte al coordinador del taller para regularizar la situación.\n\n` +
      `— Sistema Reservas de Cancha`;
    await this.enviar(email, `[Alerta] Ausencias en taller ${tallerNombre}`, texto);
  }

  async contactoApoderado(
    email: string | null | undefined,
    alumnoNombre: string,
    tallerNombre: string,
    cantidadAusencias: number,
    notas?: string,
  ) {
    if (!email) return;
    const texto =
      `Estimado/a apoderado/a de ${alumnoNombre},\n\n` +
      `El coordinador del taller "${tallerNombre}" se ha puesto en contacto ` +
      `respecto a las ${cantidadAusencias} ausencia(s) registradas.\n\n` +
      (notas ? `Notas del coordinador:\n${notas}\n\n` : '') +
      `— Sistema Reservas de Cancha`;
    await this.enviar(email, `[Contacto] Seguimiento de asistencia — ${tallerNombre}`, texto);
  }
}
