"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const apoderado_notify_service_1 = require("../apoderado/apoderado-notify.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    try {
        const notify = app.get(apoderado_notify_service_1.ApoderadoNotifyService);
        const result = await notify.notifyInscripcionesYAsistencia();
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
//# sourceMappingURL=notify-apoderados.js.map