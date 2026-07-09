import { Repository } from 'typeorm';
import { Reserva } from '../entities/reserva.entity';
import { FranjaCancha } from '../entities/franja-cancha.entity';
import { CreateReservaDto } from '../dto/create-reserva.dto';
import { FranjaCanchaService } from './franja-cancha.service';
export type EstadoSlotCancha = 'disponible' | 'ocupada' | 'no_habilitada';
export interface SlotDisponibilidadCancha {
    horaInicio: string;
    horaFin: string;
    espacio: string;
    estado: EstadoSlotCancha;
    duracionMinutos: number;
    paraTodos: boolean;
    reservaId?: number;
    tallerId?: number;
    tallerNombre?: string;
    profesorNombre?: string;
}
export declare class ReservaService {
    private reservaRepository;
    private franjaRepository;
    private franjaCanchaService;
    constructor(reservaRepository: Repository<Reserva>, franjaRepository: Repository<FranjaCancha>, franjaCanchaService: FranjaCanchaService);
    obtenerDisponibilidad(fecha: string, espacio?: string): Promise<SlotDisponibilidadCancha[]>;
    obtenerDisponibilidadSemana(fechaInicio?: string, espacio?: string): Promise<{
        fecha: string;
        diaSemana: number;
        slots: SlotDisponibilidadCancha[];
    }[]>;
    private validarReserva;
    create(createReservaDto: CreateReservaDto): Promise<Reserva>;
    findAll(): Promise<Reserva[]>;
    findOne(id: number): Promise<Reserva>;
    findByTaller(tallerId: number): Promise<Reserva[]>;
    findByFecha(fecha: string): Promise<Reserva[]>;
    update(id: number, updateReservaDto: Partial<CreateReservaDto>): Promise<Reserva>;
    remove(id: number): Promise<void>;
}
