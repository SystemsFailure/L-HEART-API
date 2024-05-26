import router from '@adonisjs/core/services/router'


router.group(() => {
    router.get('/', 'ProfilesController.index')
}).prefix('api/v1/prifles')