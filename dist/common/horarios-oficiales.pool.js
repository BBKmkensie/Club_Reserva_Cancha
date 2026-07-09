"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MENSAJE_SIN_HORARIO = exports.HORARIOS_OFICIALES_TALLERES = void 0;
exports.HORARIOS_OFICIALES_TALLERES = [
    {
        tipo: 'Musica',
        alias: ['Música'],
        bloques: [{ diaSemana: 1, horaInicio: '11:30', horaFin: '12:30', sala: 'Sala multiuso' }],
    },
    {
        tipo: 'Ludoteca',
        alias: ['Club ludoteca'],
        bloques: [
            { diaSemana: 1, horaInicio: '14:00', horaFin: '15:30', sala: 'Sala 201' },
            { diaSemana: 2, horaInicio: '14:00', horaFin: '15:30', sala: 'Sala 201' },
        ],
    },
    {
        tipo: 'Diseño',
        alias: ['Dibujo', 'Ilustración', 'Club de dibujo'],
        bloques: [
            { diaSemana: 1, horaInicio: '14:30', horaFin: '16:00', sala: 'Sala 209' },
            { diaSemana: 3, horaInicio: '13:30', horaFin: '15:00', sala: 'Sala 209' },
            { diaSemana: 5, horaInicio: '14:00', horaFin: '15:30', sala: 'Sala 209' },
        ],
    },
    {
        tipo: 'Futbol',
        alias: ['Futsal', 'Fútbol'],
        bloques: [
            { diaSemana: 1, horaInicio: '18:00', horaFin: '19:30', sala: 'Cancha / sala multiuso' },
        ],
    },
    {
        tipo: 'Musculacion',
        alias: ['Musculación'],
        bloques: [
            { diaSemana: 2, horaInicio: '13:00', horaFin: '15:30', sala: 'Sala multifuncional' },
            { diaSemana: 3, horaInicio: '13:00', horaFin: '15:30', sala: 'Sala multifuncional' },
            { diaSemana: 4, horaInicio: '13:00', horaFin: '15:30', sala: 'Sala multifuncional' },
            { diaSemana: 5, horaInicio: '13:00', horaFin: '15:30', sala: 'Sala multifuncional' },
        ],
    },
    {
        tipo: 'Defensa personal',
        bloques: [{ diaSemana: 2, horaInicio: '16:30', horaFin: '18:00', sala: 'Sala multiuso' }],
    },
    {
        tipo: 'Voley',
        alias: ['Voleibol', 'Vóley'],
        bloques: [{ diaSemana: 3, horaInicio: '17:30', horaFin: '19:00', sala: 'Multicancha' }],
    },
    {
        tipo: 'Teatro',
        bloques: [{ diaSemana: 4, horaInicio: '18:00', horaFin: '19:30', sala: 'Sala multifuncional' }],
    },
];
exports.MENSAJE_SIN_HORARIO = 'El horario de este taller aún no se ha agregado.';
//# sourceMappingURL=horarios-oficiales.pool.js.map