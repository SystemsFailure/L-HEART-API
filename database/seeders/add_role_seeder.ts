import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class RoleSeeder extends BaseSeeder {
  public async run () {
    // Создание ролей с различными параметрами
    await Role.createMany([
      {
        role_name: 'admin',
        description: 'Администратор системы',
      },
      {
        role_name: 'manager',
        description: 'Менеджер',
      },
      {
        role_name: 'user',
        description: 'Обычный пользователь',
      },
    ])
  }
}