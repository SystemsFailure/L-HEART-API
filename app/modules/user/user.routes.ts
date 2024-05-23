import router from '@adonisjs/core/services/router'
import UsersController from './user.controller.js'

router.group(() => {
    router.get('/', [UsersController, 'index'])
    router.get('/one/:id', [UsersController, 'show'])
}).prefix('api/v1/users')