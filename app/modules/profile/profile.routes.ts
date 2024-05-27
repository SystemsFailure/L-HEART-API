import router from '@adonisjs/core/services/router'
import ProfileController from './profile.controller.js'

router.group(() => {
    router.get('/', [ProfileController, 'index']);
    router.post('/', [ProfileController, 'create']);
}).prefix('api/v1/profiles')