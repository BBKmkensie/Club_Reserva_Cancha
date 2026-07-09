"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TALLERES_RESERVA_CANCHA_SEMESTRE = void 0;
exports.horariosCanchaDeportesSemestre = horariosCanchaDeportesSemestre;
const horarios_oficiales_pool_1 = require("./horarios-oficiales.pool");
exports.TALLERES_RESERVA_CANCHA_SEMESTRE = ['Futbol', 'Voley'];
function horariosCanchaDeportesSemestre() {
    return horarios_oficiales_pool_1.HORARIOS_OFICIALES_TALLERES.filter((item) => exports.TALLERES_RESERVA_CANCHA_SEMESTRE.includes(item.tipo));
}
//# sourceMappingURL=reservas-cancha-deportes.pool.js.map