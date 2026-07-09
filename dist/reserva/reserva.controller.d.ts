import { ReservaService } from './reserva.service';
import { CreateReservaDto } from '../dto/create-reserva.dto';
export declare class ReservaController {
    private readonly reservaService;
    constructor(reservaService: ReservaService);
    obtenerDisponibilidadSemana(fechaInicio?: string, espacio?: string): Promise<{
        fecha: string;
        diaSemana: number;
        slots: import("./reserva.service").SlotDisponibilidadCancha[];
    }[]>;
    obtenerDisponibilidad(fecha: string, espacio?: string): Promise<import("./reserva.service").SlotDisponibilidadCancha[]>;
    create(createReservaDto: CreateReservaDto): Promise<import("../entities/reserva.entity").Reserva>;
    findAll(tallerId?: string, fecha?: string): Promise<import("../entities/reserva.entity").Reserva[]>;
    findOne(id: number): Promise<import("../entities/reserva.entity").Reserva>;
    update(id: number, updateReservaDto: Partial<CreateReservaDto>): Promise<import("../entities/reserva.entity").Reserva>;
    remove(id: number): Promise<void>;
}
