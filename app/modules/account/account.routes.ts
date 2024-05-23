import router from '@adonisjs/core/services/router'
import AccountController from './account.controller.js'

router.group(() => {
    router.get('/', [AccountController, 'index'])
    router.get('/:id', [AccountController, 'show'])
    router.post('/', [AccountController, 'create'])
}).prefix('api/v1/accounts')