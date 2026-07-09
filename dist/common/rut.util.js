"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizarRut = normalizarRut;
exports.pareceRut = pareceRut;
function normalizarRut(rut) {
    return rut.trim().replace(/\./g, '').replace(/-/g, '').replace(/\s/g, '').toUpperCase();
}
function pareceRut(usuario) {
    const n = normalizarRut(usuario);
    return /^\d{7,8}-[\dkK]$/.test(n) || /^\d{7,8}[\dkK]$/.test(n);
}
//# sourceMappingURL=rut.util.js.map