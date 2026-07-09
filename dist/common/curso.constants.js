"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECCIONES_TALLER_DEFAULT = exports.CURSOS_TALLER = void 0;
exports.etiquetaCurso = etiquetaCurso;
exports.CURSOS_TALLER = [
    { code: '1B', label: '1° Básico', orden: 1 },
    { code: '2B', label: '2° Básico', orden: 2 },
    { code: '3B', label: '3° Básico', orden: 3 },
    { code: '4B', label: '4° Básico', orden: 4 },
    { code: '5B', label: '5° Básico', orden: 5 },
    { code: '6B', label: '6° Básico', orden: 6 },
    { code: '7B', label: '7° Básico', orden: 7 },
    { code: '8B', label: '8° Básico', orden: 8 },
    { code: '1M', label: '1° Medio', orden: 9 },
    { code: '2M', label: '2° Medio', orden: 10 },
    { code: '3M', label: '3° Medio', orden: 11 },
    { code: '4M', label: '4° Medio', orden: 12 },
];
exports.SECCIONES_TALLER_DEFAULT = ['A', 'B', 'C', 'D'];
function etiquetaCurso(code) {
    if (!code)
        return '—';
    return exports.CURSOS_TALLER.find((c) => c.code === code)?.label ?? code;
}
//# sourceMappingURL=curso.constants.js.map