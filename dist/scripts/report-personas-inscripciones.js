"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const reportes_service_1 = require("../reportes/reportes.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    try {
        const reportes = app.get(reportes_service_1.ReportesService);
        const data = await reportes.getPersonasInscripciones();
        console.log(JSON.stringify(data, null, 2));
    }
    finally {
        await app.close();
    }
}
bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=report-personas-inscripciones.js.map