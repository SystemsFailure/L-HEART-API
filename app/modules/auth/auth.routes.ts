import router from "@adonisjs/core/services/router";
import AuthController from "./auth.controller.js";

router.group(() => {
    router.post('/login', [AuthController, 'login'])
}).prefix('api/v1/auth')