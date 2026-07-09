"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const apoderado_seed_service_1 = require("../apoderado/apoderado-seed.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    try {
        const seed = app.get(apoderado_seed_service_1.ApoderadoSeedService);
        const result = await seed.migrarEmailsGmail();
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
//# sourceMappingURL=fix-apoderado-emails.js.map