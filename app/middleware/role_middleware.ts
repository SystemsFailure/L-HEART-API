/**
 * PS: Аккаунтом является любое физическое\юридическое лицо,
 * которое пользуется данным ПО, таже согласное с условиями и требованиями использования текущего ПО
*/

import Permission from '#models/permission'
import Role from '#models/role'
import { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { AccountType } from './@types.js'
// import Logger from './logger' // Подключение сервиса логгера

export default class RoleMiddleware {
  // private logger = new Logger('RoleMiddleware') // Инициализация логгера

  async handle(ctx: HttpContext, next: NextFn) {
    try {
      const account: AccountType = await ctx.auth.use('api').authenticate()

      const routeName: string | undefined = ctx.request.ctx?.route?.name
      const method: string = ctx.request.method().toLowerCase()

      // Получаем роль аккаунта
      const accountRole: Role = await this.getAccountRole(account.id)

      // Получаем разрешения для данной роли
      const permissions: Permission[] = await this.getPermissionsForRole(accountRole.id)

      // Проверяем разрешения
      const hasPermission: boolean = this.hasPermission(permissions, routeName, method)

      if (!hasPermission) {
        return ctx.response.forbidden({ error: 'Unauthorized access' })
      }

      // Логируем информацию
      // this.logger.logRequest(ctx, routeName, method, account)
      console.debug(ctx, routeName, method, account);


    } catch (error) {
      // this.logger.error(error)
      console.debug(error);
      return ctx.response.internalServerError({ error: 'Internal Server Error' })
    }

    // Вызываем следующий метод в цепочке middleware
    const output = await next()
    return output
  }

  private async getAccountRole(accountId: number): Promise<Role> {
    return Role.query()
      .whereHas('accounts', (builder) => {
        builder.where('id', accountId)
      })
      .firstOrFail()
  }

  private async getPermissionsForRole(roleId: number): Promise<Permission[]> {
    return Permission.query()
      .where('role_id', roleId)
      .preload('permissionMethods')
      .preload('resource')
      .preload('role')
  }

  private hasPermission(permissions: Permission[], routeName: string | undefined, method: string): boolean {
    return permissions.some((permission: Permission) => {
      return permission.resource.path === routeName &&
        permission.permissionMethods.some((pm) =>
          pm.httpMethods.some((httpMethod) => httpMethod.name.toLowerCase() === method)
        )
    })
  }
}