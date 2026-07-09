"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TallerSeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const taller_entity_1 = require("../entities/taller.entity");
const profesor_entity_1 = require("../entities/profesor.entity");
const taller_horario_entity_1 = require("../entities/taller-horario.entity");
const catalogo_talleres_pool_1 = require("../common/catalogo-talleres.pool");
const horarios_oficiales_pool_1 = require("../common/horarios-oficiales.pool");
const password_util_1 = require("../common/password.util");
let TallerSeedService = class TallerSeedService {
    tallerRepo;
    profesorRepo;
    horarioRepo;
    constructor(tallerRepo, profesorRepo, horarioRepo) {
        this.tallerRepo = tallerRepo;
        this.profesorRepo = profesorRepo;
        this.horarioRepo = horarioRepo;
    }
    async seedCatalogoTalleres() {
        const existentes = await this.tallerRepo.find({ relations: ['profesores'] });
        const porNombre = new Map();
        for (const t of existentes) {
            porNombre.set((0, catalogo_talleres_pool_1.normalizarNombreTaller)(t.tipo), t);
            for (const alias of this.aliasDe(t.tipo)) {
                porNombre.set(alias, t);
            }
        }
        const profesoresLibres = await this.profesorRepo.find({
            where: {},
            order: { id: 'ASC' },
        });
        const sinTaller = profesoresLibres.filter((p) => p.tallerId == null);
        const result = {
            creados: 0,
            actualizados: 0,
            profesoresAsignados: 0,
            profesoresCreados: 0,
            detalle: [],
        };
        const { hash, salt } = (0, password_util_1.hashPassword)('12345');
        for (const item of catalogo_talleres_pool_1.CATALOGO_TALLERES_SEED) {
            const claves = [
                (0, catalogo_talleres_pool_1.normalizarNombreTaller)(item.tipo),
                ...(item.alias ?? []).map(catalogo_talleres_pool_1.normalizarNombreTaller),
            ];
            let taller = claves.map((k) => porNombre.get(k)).find(Boolean);
            if (!taller) {
                taller = this.tallerRepo.create({
                    tipo: item.tipo,
                    descripcion: item.descripcion,
                    imagenUrl: item.imagenUrl,
                    capacidad: 20,
                    estado: 'PUBLICADO',
                    adminId: 1,
                    publicadoAt: new Date(),
                });
                taller = await this.tallerRepo.save(taller);
                porNombre.set((0, catalogo_talleres_pool_1.normalizarNombreTaller)(taller.tipo), taller);
                result.creados++;
                result.detalle.push({ tipo: item.tipo, accion: 'creado' });
            }
            else {
                taller.descripcion = item.descripcion;
                taller.imagenUrl = item.imagenUrl;
                if (taller.estado === 'BORRADOR') {
                    taller.estado = 'PUBLICADO';
                    taller.publicadoAt = taller.publicadoAt ?? new Date();
                    taller.adminId = taller.adminId ?? 1;
                }
                await this.tallerRepo.save(taller);
                result.actualizados++;
                result.detalle.push({ tipo: item.tipo, accion: 'actualizado' });
            }
            if (!item.conProfesor)
                continue;
            const yaTieneProf = (taller.profesores?.length ?? 0) > 0;
            if (yaTieneProf) {
                const det = result.detalle.find((d) => d.tipo === item.tipo);
                if (det)
                    det.profesor = taller.profesores[0].nombre;
                continue;
            }
            const prof = await this.resolverProfesor(item, sinTaller, hash, salt);
            if (prof) {
                const esNuevo = !prof.id;
                prof.tallerId = taller.id;
                if (!prof.passwordHash) {
                    prof.passwordHash = hash;
                    prof.passwordSalt = salt;
                }
                await this.profesorRepo.save(prof);
                if (esNuevo)
                    result.profesoresCreados++;
                result.profesoresAsignados++;
                const det = result.detalle.find((d) => d.tipo === item.tipo);
                if (det)
                    det.profesor = prof.nombre;
            }
        }
        return result;
    }
    async seedHorariosOficiales() {
        const talleres = await this.tallerRepo.find();
        const porNombre = new Map();
        for (const t of talleres) {
            porNombre.set((0, catalogo_talleres_pool_1.normalizarNombreTaller)(t.tipo), t);
        }
        const result = {
            actualizados: [],
            bloquesCargados: 0,
            noEncontrados: [],
        };
        for (const item of horarios_oficiales_pool_1.HORARIOS_OFICIALES_TALLERES) {
            const claves = [
                (0, catalogo_talleres_pool_1.normalizarNombreTaller)(item.tipo),
                ...(item.alias ?? []).map(catalogo_talleres_pool_1.normalizarNombreTaller),
            ];
            const taller = claves.map((k) => porNombre.get(k)).find(Boolean);
            if (!taller) {
                result.noEncontrados.push(item.tipo);
                continue;
            }
            await this.horarioRepo.delete({ tallerId: taller.id });
            const entities = item.bloques.map((b) => this.horarioRepo.create({
                tallerId: taller.id,
                curso: null,
                seccion: `${b.diaSemana}|${b.horaInicio}`,
                diaSemana: b.diaSemana,
                horaInicio: `${b.horaInicio}:00`,
                horaFin: `${b.horaFin}:00`,
            }));
            await this.horarioRepo.save(entities);
            result.bloquesCargados += entities.length;
            const primero = item.bloques[0];
            taller.diaSemana = primero.diaSemana;
            taller.horaInicio = `${primero.horaInicio}:00`;
            taller.horaFin = `${primero.horaFin}:00`;
            taller.modoHorario = 'POR_SECCION';
            await this.tallerRepo.save(taller);
            result.actualizados.push(taller.tipo);
        }
        const idsConHorarioOficial = new Set(result.actualizados
            .map((tipo) => talleres.find((t) => t.tipo === tipo)?.id)
            .filter((id) => id != null));
        for (const taller of talleres) {
            if (idsConHorarioOficial.has(taller.id))
                continue;
            await this.horarioRepo.delete({ tallerId: taller.id });
            taller.diaSemana = null;
            taller.horaInicio = null;
            taller.horaFin = null;
            await this.tallerRepo.save(taller);
        }
        return result;
    }
    aliasDe(tipo) {
        return [(0, catalogo_talleres_pool_1.normalizarNombreTaller)(tipo)];
    }
    async resolverProfesor(item, sinTaller, hash, salt) {
        if (item.profesor) {
            const porEmail = await this.profesorRepo.findOne({
                where: { email: item.profesor.email },
            });
            if (porEmail)
                return porEmail;
            const todos = await this.profesorRepo.find();
            const rutNorm = item.profesor.rut.replace(/\./g, '').toUpperCase();
            const porRut = todos.find((p) => p.rut.replace(/\./g, '').toUpperCase() === rutNorm);
            if (porRut)
                return porRut;
            return this.profesorRepo.create({
                nombre: item.profesor.nombre,
                rut: item.profesor.rut,
                email: item.profesor.email,
                passwordHash: hash,
                passwordSalt: salt,
            });
        }
        return sinTaller.shift() ?? null;
    }
};
exports.TallerSeedService = TallerSeedService;
exports.TallerSeedService = TallerSeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(taller_entity_1.Taller)),
    __param(1, (0, typeorm_1.InjectRepository)(profesor_entity_1.Profesor)),
    __param(2, (0, typeorm_1.InjectRepository)(taller_horario_entity_1.TallerHorario)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TallerSeedService);
//# sourceMappingURL=taller-seed.service.js.map