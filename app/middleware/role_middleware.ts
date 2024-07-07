/**
  PS: Аккаунтом является любое физическое\юридическое лицо, 
  которое пользуется данным ПО, таже согласное с условиями и требованиями использования текущего ПО 
*/

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const account = (await ctx.auth.use('api').authenticate());

    /**
     * Middleware logic goes here (before the next call)
     */

    // Данные переменные будут использоваться для проверки разрешено ли текущему запросу, 
    // связанному с аккаунтом совершать текущий запрос по данному пути и совершать данный метод
    const routeName: string | undefined = ctx.request.ctx?.route?.name;
    const method: () => string = ctx.request.method;

    try {

      

    } catch (error) {
      console.error(error);
    }

    // Это нужно для логирования, позже необходимо будет обновить код
    console.log(
      `[CONTEXT]: ${ctx}`,
      '\n',
      `[ROUTE]: ${routeName}`,
      '\n',
      `[METHOD]: ${method}`,
      '\n',
      `[ACCOUNT]: ${account}`
    )

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}