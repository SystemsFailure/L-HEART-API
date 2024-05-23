import User from '#models/user'
import { inject } from '@adonisjs/core';
import type { HttpContext } from '@adonisjs/core/http'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model';
import UserService from './user.service.js';
import { Meta } from './user.types.js';


@inject()
export default class UsersController {
  constructor(private userService: UserService) {}

  async index({ request, response }: HttpContext) {
    const meta: Meta = request.input('meta');

    const result: ModelPaginatorContract<User> = await this.userService.findAll(meta)

    response.apiSuccess(
      result.serialize(),
      "Данные успешно получены"
    )
  }

  async show({ response, params }: HttpContext) {
    const result: User = await this.userService.findOne(params.id)
    response.apiSuccess(result.serialize(), "Запись пользователя успешно найдена")
  }
}