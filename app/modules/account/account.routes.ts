import router from '@adonisjs/core/services/router'
import AccountController from './account.controller.js'
import { middleware } from '#start/kernel';

router.post('/', [AccountController, 'create']).prefix('api/v1/accounts');

router.group(() => {
    router.get('/', [AccountController, 'index'])
    router.get('/:id', [AccountController, 'show']);    
    router.delete('/:id', [AccountController, 'delete']);
    router.delete('/predelete/:id', [AccountController, 'preDelete'])
})
    .prefix('api/v1/accounts')
    .use([middleware.authenticate()])