"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarProfesorPorUsuario = buscarProfesorPorUsuario;
const rut_util_1 = require("./rut.util");
async function buscarProfesorPorUsuario(repo, usuario) {
    const raw = usuario.trim();
    if (!raw)
        return null;
    const lower = raw.toLowerCase();
    if (lower.includes('@')) {
        const byEmail = await repo
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.taller', 't')
            .where('LOWER(TRIM(p.email)) = :email', { email: lower })
            .getOne();
        if (byEmail)
            return byEmail;
    }
    const rutNorm = (0, rut_util_1.normalizarRut)(raw);
    if (rutNorm) {
        const byRut = await repo
            .createQueryBuilder('p')
            .leftJoinAndSelect('p.taller', 't')
            .where("REPLACE(REPLACE(UPPER(TRIM(p.rut)), '.', ''), '-', '') = :rut", { rut: rutNorm })
            .getOne();
        if (byRut)
            return byRut;
    }
    const list = await repo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.taller', 't')
        .where('LOWER(TRIM(p.nombre)) = :u', { u: lower })
        .orWhere('LOWER(TRIM(t.tipo)) = :u', { u: lower })
        .getMany();
    return list.length > 0 ? list[0] : null;
}
//# sourceMappingURL=profesor-lookup.util.js.map