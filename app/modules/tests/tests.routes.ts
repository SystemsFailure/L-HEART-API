import router from '@adonisjs/core/services/router'
import TestsController from './tests.controller.js';


router.group(() => {
    router.post('/', [TestsController, 'testJwt']);      // Проверка JwtService
})
    .prefix('api/v1/tests');