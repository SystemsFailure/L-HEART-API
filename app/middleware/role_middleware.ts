/**
 * PS: Аккаунтом является любое физическое\юридическое лицо,
 * которое пользуется данным ПО, таже согласное с условиями и требованиями использования текущего ПО
*/

import Permission from '#models/permission'
import Role from '#models/role'
import { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class RoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    try {
      // Аутентификация текущего пользователя
      const account = await ctx.auth.use('api').authenticate()

      // Get route name and HTTP method
      const routeName: string | undefined = ctx.request.ctx?.route?.name
      const method: string = ctx.request.method().toLowerCase()

      // Получаем ассоциируемую роль текущего аккаунта
      const accountRole = await Role.query()
        .whereHas('accounts', (builder) => {
          builder.where('id', account.id)
        })
        .firstOrFail()

      // Получение всех разрешений текущего аккаунта
      const permissions = await Permission.query()
        .where('role_id', accountRole.id)
        .preload('permissionMethods')
        .preload('resource')
        .preload('role')

      // Проверка, имеет ли разрешения текущий аккаунт делать запросы по данному пути и методу
      const hasPermission = permissions.some((permission: Permission) => {
        return permission.resource.path === routeName &&
          permission.permissionMethods.some((pm) =>
            pm.httpMethods.some((httpMethod) => httpMethod.name.toLowerCase() === method)
          )
      })

      if (!hasPermission) {
        // If no permission, обработка перенаправления (т.е, return 403 Forbidden)
        return ctx.response.forbidden({ error: 'Unauthorized access' })
      }

      // Logging context information
      console.log(
        `[CONTEXT]: ${ctx}`,
        '\n',
        `[ROUTE]: ${routeName}`,
        '\n',
        `[METHOD]: ${method}`,
        '\n',
        `[ACCOUNT]: ${account}`
      )

    } catch (error) {
      console.error(error)
      return ctx.response.internalServerError({ error: 'Internal Server Error' })
    }

    // Call next method in the pipeline and return its output
    const output = await next()
    return output
  }
}
