import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http'
// import AccountService from './account.service.js';
import { createAccountValidator } from '#validators/create_account';
import Account from '#models/account';
import { AccessToken } from '@adonisjs/auth/access_tokens';
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model';
import db from '@adonisjs/lucid/services/db'
import Profile from '#models/profile';


@inject()
export default class AccountController {
  // constructor(private userService: AccountService) {}

  async index({ request, response }: HttpContext) {
    try {
      // Получаем параметры запроса с помощью деструктуризации и задаем значения по умолчанию
      const { perPage = 20, currentPage = 1 } = request.only(['perPage', 'currentPage']);
      const { search, filter } = request.only(['search', 'filter'])

      // Создаем базовый запрос
      const query = Account.query()
        .select('id', 'email', 'name', 'created_at', 'updated_at')
        .preload('profile');

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

    const token: AccessToken = await Account.accessTokens.create(account)

    return response.apiSuccess({
        account: account.serialize(),
        token: {
            type: 'bearer',
            value: token.value!.release(),
        }
    }, "Аккаунт успешно создан")
  }

  async delete({ params, response }: HttpContext) {
    const trx = await db.transaction(); // Начинаем транзакцию

    try {
      const accountId = params.id;

      // Находим аккаунт
      const account: Account | null = await Account
        .query({ client: trx })
        .where('id', accountId)
        .preload('profile')
        .first();

      if (!account) {
        await trx.rollback();
        return response.status(404).json({ error: `Account with ID=${accountId} not found` });
      }

      // Удаление всех связанных токенов, если такие имеются
      const tokens: AccessToken[] = await Account.accessTokens.all(account)
      tokens.forEach(async (token: AccessToken) => {
        token && await Account.accessTokens.delete(account, token.identifier)
      });

      // Удаляем аккаунт и профиль
      await account.profile.delete()
      await account.delete();

      await trx.commit(); // Подтверждаем транзакцию
      return response.apiSuccess({ message: 'Account and related users deleted successfully' });
    } catch (error) {
      try {
        await trx.rollback(); // Откатываем транзакцию в случае ошибки
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
      console.error('Error deleting account:', error);
      return response.status(500).json({ error: 'Unable to delete account and related users' });
    }
  }

  public async preDelete() {

  }
}