"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_config_1 = __importDefault(require("./config/database.config"));
const jwt_config_1 = __importDefault(require("./config/jwt.config"));
const mail_config_1 = __importDefault(require("./config/mail.config"));
const admin_module_1 = require("./admin/admin.module");
const auth_module_1 = require("./auth/auth.module");
const taller_module_1 = require("./taller/taller.module");
const alumno_module_1 = require("./alumno/alumno.module");
const profesor_module_1 = require("./profesor/profesor.module");
const reserva_module_1 = require("./reserva/reserva.module");
const salida_module_1 = require("./salida/salida.module");
const inscripcion_salida_module_1 = require("./inscripcion-salida/inscripcion-salida.module");
const inscripcion_taller_module_1 = require("./inscripcion-taller/inscripcion-taller.module");
const periodo_module_1 = require("./periodo/periodo.module");
const asistencia_module_1 = require("./asistencia/asistencia.module");
const ficha_alumno_module_1 = require("./ficha-alumno/ficha-alumno.module");
const notificacion_module_1 = require("./notificacion/notificacion.module");
const apoderado_module_1 = require("./apoderado/apoderado.module");
const reportes_module_1 = require("./reportes/reportes.module");
const admin_entity_1 = require("./entities/admin.entity");
const taller_entity_1 = require("./entities/taller.entity");
const alumno_entity_1 = require("./entities/alumno.entity");
const profesor_entity_1 = require("./entities/profesor.entity");
const reserva_entity_1 = require("./entities/reserva.entity");
const salida_entity_1 = require("./entities/salida.entity");
const inscripcion_salida_entity_1 = require("./entities/inscripcion-salida.entity");
const inscripcion_taller_entity_1 = require("./entities/inscripcion-taller.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [database_config_1.default, jwt_config_1.default, mail_config_1.default],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const ssl = configService.get('database.ssl');
                    return {
                        type: 'postgres',
                        host: configService.get('database.host'),
                        port: configService.get('database.port'),
                        username: configService.get('database.username'),
                        password: configService.get('database.password'),
                        database: configService.get('database.database'),
                        ...(ssl
                            ? { ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' } }
                            : {}),
                        entities: [admin_entity_1.Admin, taller_entity_1.Taller, alumno_entity_1.Alumno, profesor_entity_1.Profesor, reserva_entity_1.Reserva, salida_entity_1.Salida, inscripcion_salida_entity_1.InscripcionSalida, inscripcion_taller_entity_1.InscripcionTaller],
                        synchronize: false,
                        autoLoadEntities: true,
                    };
                },
                inject: [config_1.ConfigService],
            }),
            periodo_module_1.PeriodoModule,
            auth_module_1.AuthModule,
            admin_module_1.AdminModule,
            taller_module_1.TallerModule,
            alumno_module_1.AlumnoModule,
            profesor_module_1.ProfesorModule,
            reserva_module_1.ReservaModule,
            salida_module_1.SalidaModule,
            inscripcion_salida_module_1.InscripcionSalidaModule,
            inscripcion_taller_module_1.InscripcionTallerModule,
            asistencia_module_1.AsistenciaModule,
            ficha_alumno_module_1.FichaAlumnoModule,
            notificacion_module_1.NotificacionModule,
            apoderado_module_1.ApoderadoModule,
            reportes_module_1.ReportesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map