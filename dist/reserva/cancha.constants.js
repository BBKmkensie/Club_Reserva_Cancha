"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CANCHA_HORA_PARA_TODOS = exports.CANCHA_DURACION_SLOT_MIN = exports.CANCHA_HORA_FIN = exports.CANCHA_HORA_INICIO = exports.CANCHA_ESPACIO_DEFAULT = void 0;
exports.formatMinutosDesdeMedianoche = formatMinutosDesdeMedianoche;
exports.formatHoraSlot = formatHoraSlot;
exports.sumarMinutosAHora = sumarMinutosAHora;
exports.iterarIniciosSlotCancha = iterarIniciosSlotCancha;
exports.esHorarioParaTodos = esHorarioParaTodos;
exports.normalizarHora = normalizarHora;
exports.horaAMinutos = horaAMinutos;
exports.horariosSolapan = horariosSolapan;
exports.lunesDeSemana = lunesDeSemana;
exports.sumarDias = sumarDias;
exports.diaSemanaDesdeFecha = diaSemanaDesdeFecha;
exports.parseFechaIso = parseFechaIso;
exports.fechaLocal = fechaLocal;
exports.CANCHA_ESPACIO_DEFAULT = 'Cancha Principal';
exports.CANCHA_HORA_INICIO = 9;
exports.CANCHA_HORA_FIN = 20;
exports.CANCHA_DURACION_SLOT_MIN = 30;
exports.CANCHA_HORA_PARA_TODOS = 13;
function formatMinutosDesdeMedianoche(totalMin) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
function formatHoraSlot(hora, minutos = 0) {
    return formatMinutosDesdeMedianoche(hora * 60 + minutos);
}
function sumarMinutosAHora(hora, minutos) {
    return formatMinutosDesdeMedianoche(horaAMinutos(hora) + minutos);
}
function iterarIniciosSlotCancha() {
    const slots = [];
    for (let m = exports.CANCHA_HORA_INICIO * 60; m < exports.CANCHA_HORA_FIN * 60; m += exports.CANCHA_DURACION_SLOT_MIN) {
        slots.push(formatMinutosDesdeMedianoche(m));
    }
    return slots;
}
function esHorarioParaTodos(horaInicio) {
    const ini = horaAMinutos(horaInicio);
    const bloqueIni = exports.CANCHA_HORA_PARA_TODOS * 60;
    return ini >= bloqueIni && ini < bloqueIni + 60;
}
function normalizarHora(hora) {
    if (!hora)
        return '';
    return hora.substring(0, 5);
}
function horaAMinutos(hora) {
    const [h, m] = normalizarHora(hora).split(':').map(Number);
    return h * 60 + (m || 0);
}
function horariosSolapan(inicioA, finA, inicioB, finB) {
    const a = horaAMinutos(inicioA);
    const b = horaAMinutos(finA);
    const c = horaAMinutos(inicioB);
    const d = horaAMinutos(finB);
    return a < d && c < b;
}
function lunesDeSemana(fecha) {
    const base = fecha
        ? new Date(`${parseFechaIso(fecha)}T12:00:00`)
        : new Date(new Date().toDateString() + 'T12:00:00');
    const js = base.getDay();
    const diff = js === 0 ? -6 : 1 - js;
    base.setDate(base.getDate() + diff);
    return parseFechaIso(base);
}
function sumarDias(fecha, dias) {
    const d = new Date(`${parseFechaIso(fecha)}T12:00:00`);
    d.setDate(d.getDate() + dias);
    return parseFechaIso(d);
}
function diaSemanaDesdeFecha(fecha) {
    const d = new Date(`${parseFechaIso(fecha)}T12:00:00`);
    const js = d.getDay();
    return js === 0 ? 7 : js;
}
function parseFechaIso(fecha) {
    if (!fecha)
        return '';
    if (fecha instanceof Date) {
        const y = fecha.getFullYear();
        const m = String(fecha.getMonth() + 1).padStart(2, '0');
        const d = String(fecha.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    return fecha.split('T')[0];
}
function fechaLocal(fecha) {
    return new Date(`${parseFechaIso(fecha)}T12:00:00`);
}
//# sourceMappingURL=cancha.constants.js.map