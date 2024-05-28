import router from '@adonisjs/core/services/router'
import ProfileController from './profile.controller.js'

router.group(() => {
    router.get('/', [ProfileController, 'index']);
    router.post('/', [ProfileController, 'create']);
    router.put('/:id', [ProfileController, 'update']);
    // router.delete('/:id', [ProfileController, 'delete']);
}).prefix('api/v1/profiles')