"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizarHora = normalizarHora;
exports.textoHorarioBloque = textoHorarioBloque;
exports.textoHorarioTaller = textoHorarioTaller;
exports.opcionesHorarioTaller = opcionesHorarioTaller;
exports.textoHorarioPorId = textoHorarioPorId;
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
function normalizarHora(hora) {
    return hora.length >= 5 ? hora.slice(0, 5) : hora;
}
function textoHorarioBloque(h) {
    const dia = DIAS[h.diaSemana] ?? `Día ${h.diaSemana}`;
    const base = `${dia} ${normalizarHora(h.horaInicio)} - ${normalizarHora(h.horaFin)}`;
    if (h.curso)
        return `${h.curso}: ${base}`;
    if (h.seccion && h.seccion !== 'General')
        return `Sección ${h.seccion}: ${base}`;
    return base;
}
function textoHorarioTaller(taller) {
    if (taller.horarios?.length) {
        return taller.horarios.map((h) => textoHorarioBloque(h)).join(' · ');
    }
    if (taller.diaSemana != null && taller.horaInicio && taller.horaFin) {
        return textoHorarioBloque({
            diaSemana: taller.diaSemana,
            horaInicio: taller.horaInicio,
            horaFin: taller.horaFin,
        });
    }
    return null;
}
function opcionesHorarioTaller(taller) {
    if (taller.horarios?.length) {
        return taller.horarios.map((h) => ({
            id: h.id,
            etiqueta: textoHorarioBloque(h),
        }));
    }
    const texto = textoHorarioTaller(taller);
    if (texto)
        return [{ id: null, etiqueta: texto }];
    return [];
}
function textoHorarioPorId(horario, fallback) {
    if (horario)
        return textoHorarioBloque(horario);
    return fallback ?? null;
}
//# sourceMappingURL=taller-horario.util.js.map