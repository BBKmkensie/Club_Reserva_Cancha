import { Repository } from 'typeorm';
import { InscripcionTaller } from '../entities/inscripcion-taller.entity';
import { RegistroAsistencia } from '../entities/registro-asistencia.entity';
import { MailService } from '../mail/mail.service';
export interface NotifyApoderadosResult {
    inscripcionesEnviadas: number;
    asistenciasEnviadas: number;
    sinEmail: number;
    errores: number;
    detalle: Array<{
        tipo: 'inscripcion' | 'asistencia';
        alumno: string;
        email: string;
        taller: string;
    }>;
}
export declare class ApoderadoNotifyService {
    private inscripcionRepo;
    private registroRepo;
    private mailService;
    private readonly logger;
    private readonly delayMs;
    constructor(inscripcionRepo: Repository<InscripcionTaller>, registroRepo: Repository<RegistroAsistencia>, mailService: MailService);
    notifyInscripcionesYAsistencia(): Promise<NotifyApoderadosResult>;
    private formatHorario;
    private sleep;
}
