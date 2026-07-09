import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private configService;
    private readonly logger;
    private transporter;
    private enabled;
    private from;
    private frontendUrl;
    constructor(configService: ConfigService);
    enviar(to: string, asunto: string, texto: string): Promise<boolean>;
    notificarAlumno(email: string | null | undefined, titulo: string, mensaje: string): Promise<void>;
    notificarProfesor(email: string, titulo: string, mensaje: string): Promise<void>;
    notificarAdmin(email: string, titulo: string, mensaje: string): Promise<void>;
    alertaApoderado(email: string | null | undefined, alumnoNombre: string, tallerNombre: string, cantidadAusencias: number, umbral: number, apoderadoNombre?: string | null): Promise<void>;
    contactoApoderado(email: string | null | undefined, alumnoNombre: string, tallerNombre: string, cantidadAusencias: number, notas?: string, apoderadoNombre?: string | null): Promise<void>;
    inscripcionTallerApoderado(email: string | null | undefined, alumnoNombre: string, tallerNombre: string, apoderadoNombre?: string | null, horario?: string | null): Promise<boolean>;
    asistenciaSesionApoderado(email: string | null | undefined, alumnoNombre: string, tallerNombre: string, fecha: string, estado: string, apoderadoNombre?: string | null, observacion?: string | null): Promise<boolean>;
    respuestaPropuestaDirectivaApoderado(email: string | null | undefined, opts: {
        apoderadoNombre?: string | null;
        alumnoNombre: string;
        tallerNombre: string;
        aceptada: boolean;
        horarioPropuesto?: string | null;
        motivoRechazo?: string | null;
        horarioSugerido?: string | null;
        mensajeDirectiva?: string | null;
        esActividadLibre?: boolean;
    }): Promise<boolean>;
    nuevaPropuestaDirectiva(email: string, directivaNombre: string, opts: {
        apoderadoNombre: string;
        alumnoNombre: string;
        alumnoRut?: string | null;
        tallerNombre: string;
        horarioPropuesto?: string | null;
        mensajeApoderado?: string | null;
        propuestaId: number;
        actividadDescripcion?: string | null;
        esActividadLibre?: boolean;
    }): Promise<boolean>;
}
