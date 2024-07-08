import router from '@adonisjs/core/services/router'
import TestsController from './tests.controller.js';


router.group(() => {
    router.post('/jwt', [TestsController, 'testJwt']);        // Проверка JwtService
    router.post('/logger', [TestsController, 'testLogger'])   // Проверка сервиса логирования
    router.get('/logs', [TestsController, 'testExtractLogs']) // Проверка извлечения логов из файлов логгирования
})
    .prefix('api/v1/tests');