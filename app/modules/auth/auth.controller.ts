import Account from "#models/account";
// import ApiToken from "#models/tokens";
import { AccessToken } from "@adonisjs/auth/access_tokens";
import { HttpContext } from "@adonisjs/core/http";
import hash from "@adonisjs/core/services/hash";


export default class AuthController {
    public async login({ request, response, auth }: HttpContext) {
        const payload : {
            email: string,
            password: string,
        } = request.input('payload');

        if(!payload) {
            return response.apiError('Data for refresh access token is not found in body request');
        }

        try {
            const verifyAccount: Account | null = await this.findUserByEmailAndPassword(payload.email, payload.password);

            if(!verifyAccount) {
                return response.apiError('account for this crediteals not found, check your fields')
            }

            const account = await auth.use('api').authenticate()

            if(!account.currentAccessToken) {
                return response.apiError('AccessToken is not defined');
            }

            const token: AccessToken = account.currentAccessToken

            // await ApiToken.query()
            //     .where('tokenable_id', account.id)
            //     .whereNot('hash', token.hash)
            //     .delete()

            return response.apiSuccess({
                token: token.hash
            })

        } catch (error) {
            response.apiError(error)
        }

    }

    private async findUserByEmailAndPassword(email: string, password: string) : Promise<Account | null> {
        // Найти пользователя по email
        const account = await Account.query().where('email', email).first()
  
        if (!account) {
          return null // Пользователь не найден
        }
  
        // Проверить пароль
        const isPasswordValid = await hash.verify(account.password, password)
  
        if (!isPasswordValid) {
          return null // Неверный пароль
        }
  
        return account // Возвращает найденного пользователя
      }
}