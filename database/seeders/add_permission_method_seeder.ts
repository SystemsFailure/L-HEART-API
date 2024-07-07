import HttpMethod from '#models/http_method'
import Permission from '#models/permission'
import PermissionMethod from '#models/permission_method'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class PermissionMethodSeeder extends BaseSeeder {
  public async run () {
    // Получаем список разрешений и HTTP методов (пример: первые два из базы данных)
    const permissions = await Permission.all()
    const httpMethods = await HttpMethod.all()

    // Создаем связи между разрешениями и HTTP методами
    await Promise.all(permissions.map(async (permission) => {
      await PermissionMethod.createMany(
        httpMethods.map((httpMethod) => ({
          permission_id: permission.id,
          method_id: httpMethod.id,
        }))
      )
    }))
  }
}