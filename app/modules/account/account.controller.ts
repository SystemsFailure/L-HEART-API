import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http'
import AccountService from './account.service.js';
import { createAccountValidator } from '#validators/create_account';
import Account from '#models/account';
import User from '#models/user';
import { AccessToken } from '@adonisjs/auth/access_tokens';


@inject()
export default class AccountController {
  constructor(private userService: AccountService) {}

  async index({  }: HttpContext) {

  }

  async show({  }: HttpContext) {

  }

  async create({ request, response }: HttpContext) {
    const name: string = request.input('name');
    const email: string = request.input('email');
    const password: string = request.input('password');

    const payload: {
        email: string;
        password: string;
    } = await createAccountValidator.validate({ email, password })

    const account: Account = new Account()
    account.fill({
        name,
        email: payload.email,
        password: payload.password,
    })
    
    const user: User = new User();
    user.account_id = account.id

    await account.save()
    await user.save()
    const token: AccessToken = await Account.accessTokens.create(account)

    return response.apiSuccess({
        account: account.serialize(),
        token: {
            type: 'bearer',
            value: token.value!.release(),
        }
    }, "Аккаунт успешно создан")
  }
}