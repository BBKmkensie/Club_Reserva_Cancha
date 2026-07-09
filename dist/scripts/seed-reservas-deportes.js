"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const reserva_cancha_seed_service_1 = require("../reserva/reserva-cancha-seed.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    try {
        const seed = app.get(reserva_cancha_seed_service_1.ReservaCanchaSeedService);
        const result = await seed.seedReservasDeportesSemestre();
        console.log(JSON.stringify(result, null, 2));
    }
    finally {
        await app.close();
    }
}
bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=seed-reservas-deportes.js.map