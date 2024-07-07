import Resource from '#models/resource'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class ResourceSeeder extends BaseSeeder {
  public async run() {
    // Создание ресурсов с различными параметрами
    await Resource.createMany([
      {
        name: 'Statistics',
        path: 'https://statistics',
        section: 'AUTH',
        params: 'type=overview',
        tag: 'analytics',
        protocol: 'https',
      },
      {
        name: 'Dashboard',
        path: 'https://dashboard',
        section: 'ADMIN',
        params: 'view=summary',
        tag: 'admin',
        protocol: 'https',
      },
      {
        name: 'Profile',
        path: 'https://profile',
        section: 'USER',
        params: 'id=123',
        tag: 'personal',
        protocol: 'https',
      },
    ])
  }
}