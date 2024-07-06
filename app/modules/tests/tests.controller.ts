import { HttpContext } from "@adonisjs/core/http";
import { JwtService } from "#services/jwt/jwt.service";

export default class TestsController {
    public async testJwt({request, response}: HttpContext) {
        try {
            const rawData = request.all();
            console.log(rawData);
            const jwt = JwtService.getInstance();                           // создание экземпляра сервиса
            console.log('createToken')
            const readyToken: string = jwt.createToken({                    // формирование нового токена
                login: rawData.login                                        // запись строки login в качестве payload jwt
            }, { 
                expiresIn: '30d',                                           // жизненный цикл токена
                algorithm: 'HS256',                                         // алгоритм шифрования
                subject: rawData.id,                                        // уникальное значение идентифицирующее токен
                subjectStrict: true                                         // строгий режим субъектирования
            });
            console.log('displayTokens');
            jwt.displayTokens();                                            // вывод хранилища токенов
            console.log('isTokenStored', jwt.isTokenStored(readyToken));    // записан ли токен в хранилище токенов
            console.log('verifyToken',  jwt.verifyToken(readyToken));       // верификация токена
            console.log('deleteToken', jwt.deleteToken(readyToken));        // удаление токена
            console.log('displayTokens');                                   // вывод хранилища токенов
            jwt.displayTokens();
            response.send({ data: readyToken });
        } catch (err) {
            console.error('TestsController.testJwt: ', err);
            response.abort({ data: 'error when generate jwt-token' }, 500);
            throw err;
        }
    }
}