import HttpMethod from '#models/http_method'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class HttpMethodSeeder extends BaseSeeder {
  public async run () {
    // Создание HTTP методов с различными параметрами
    await HttpMethod.createMany([
      {
        name: 'GET',
        category: 'Чтение (GET)',
      },
      {
        name: 'POST',
        category: 'Создание (POST)',
      },
      {
        name: 'PUT',
        category: 'Обновление (PUT)',
      },
      {
        name: 'PATCH',
        category: 'Частичное обновление (PATCH)',
      },
      {
        name: 'DELETE',
        category: 'Удаление (DELETE)',
      },
    ])
  }
}