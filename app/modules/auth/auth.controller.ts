import Account from "#models/account";
import { AccessToken } from "@adonisjs/auth/access_tokens";
import { HttpContext } from "@adonisjs/core/http";
import hash from "@adonisjs/core/services/hash";


export default class AuthController {
    public async login({ request, response }: HttpContext) {
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

            const tokens: AccessToken[] = await Account.accessTokens.all(verifyAccount)
            tokens.forEach(async (token: AccessToken) => {
              token && await Account.accessTokens.delete(verifyAccount, token.identifier)
            });

            const token: AccessToken = await Account.accessTokens.create(verifyAccount);

            delete verifyAccount.serialize()!.password;

            return response.apiSuccess({
                account: Object.assign({}, { ...verifyAccount!.serialize() }, {
                    password: null,
                }),
                token: token
            })
        } catch (error) {
            response.apiError(error)
        }

    }

    private async findUserByEmailAndPassword(email: string, password: string) : Promise<Account | null> {
        // Найти пользователя по email
        const account: Account | null = await Account.query().where('email', email).first()
  
        if (!account) {
          return null // Пользователь не найден
        }
  
        // Проверить пароль
        const isPasswordValid: boolean = await hash.verify(account.password, password)
  
        if (!isPasswordValid) {
          return null // Неверный пароль
        }
  
        return account
      }
}