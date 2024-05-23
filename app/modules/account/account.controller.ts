import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http'
import AccountService from './account.service.js';
import { createAccountValidator } from '#validators/create_account';
import Account from '#models/account';
import User from '#models/user';
import { AccessToken } from '@adonisjs/auth/access_tokens';
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model';


@inject()
export default class AccountController {
  constructor(private userService: AccountService) {}

  async index({ request, response }: HttpContext) {
    try {
      // Получаем параметры запроса с помощью деструктуризации и задаем значения по умолчанию
      const { perPage = 20, currentPage = 1 } = request.only(['perPage', 'currentPage']);
      const { search, filter } = request.only(['search', 'filter'])

      // Создаем базовый запрос
      const query = Account.query()
        .select('id', 'email', 'name', 'created_at', 'updated_at')
        .preload('profiles');

      // Применяем фильтры и поиск, если они заданы
      if (search) {
        query.where('name', 'LIKE', `%${search}%`)
            .orWhere('email', 'LIKE', `%${search}%`);
      }

      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          query.where(key, String(value));
        });
      }

      // Пагинация
      const result: ModelPaginatorContract<Account> = await query.paginate(currentPage, perPage);
      return response.apiSuccess(result);
    } catch (error) {
      console.error(error)
    }
  }

  async show({ response, params }: HttpContext) {
    const result: Account | null = await Account.find(params.id)

    if(!result) {
      return response.apiError({}, `По данному Id=${params.id} аккаунт не найден`)
    }

    return response.apiSuccess(result)
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
    
    await account.save()

    const user: User = new User();
    user.account_id = account.id

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