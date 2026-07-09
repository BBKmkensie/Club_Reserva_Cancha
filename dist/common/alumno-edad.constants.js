"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EDAD_ALUMNO_MAX = exports.EDAD_ALUMNO_MIN = void 0;
exports.edadAlumnoValida = edadAlumnoValida;
exports.edadSugeridaParaAlumno = edadSugeridaParaAlumno;
exports.EDAD_ALUMNO_MIN = 18;
exports.EDAD_ALUMNO_MAX = 60;
function edadAlumnoValida(edad) {
    return edad != null && edad >= exports.EDAD_ALUMNO_MIN && edad <= exports.EDAD_ALUMNO_MAX;
}
function edadSugeridaParaAlumno(alumnoId) {
    return (alumnoId % (exports.EDAD_ALUMNO_MAX - exports.EDAD_ALUMNO_MIN + 1)) + exports.EDAD_ALUMNO_MIN;
}
//# sourceMappingURL=alumno-edad.constants.js.map