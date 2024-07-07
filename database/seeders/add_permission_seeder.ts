import Permission from '#models/permission'
import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class PermissionSeeder extends BaseSeeder {
  public async run() {
    // Получаем идентификаторы ролей из базы данных
    const adminRole = await Role.findBy('role_name', 'admin')
    const managerRole = await Role.findBy('role_name', 'manager')
    const userRole = await Role.findBy('role_name', 'user')

    const roles = await Role.all()

    // Создаем разрешения для каждой роли
    await Permission.createMany([
      {
        role_id: adminRole?.id,
        resource_id: 1, // Замените на реальные идентификаторы ресурсов
      },
      {
        role_id: managerRole?.id,
        resource_id: 2, // Замените на реальные идентификаторы ресурсов
      },
      {
        role_id: userRole?.id,
        resource_id: 3, // Замените на реальные идентификаторы ресурсов
      },
    ])

    // Создаем разрешения для каждой роли
    await Promise.all(roles.map(async (role) => {
      await Permission.createMany([
        {
          role_id: role.id,
          resource_id: 1, // Замените на реальный идентификатор ресурса
        },
        {
          role_id: role.id,
          resource_id: 2, // Замените на реальный идентификатор ресурса
        },
        // Добавьте необходимое количество разрешений
      ])
    }))
  }
}