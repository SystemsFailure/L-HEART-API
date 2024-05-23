import { BaseSchema } from '@adonisjs/lucid/schema'

// 1. `id`: автоинкрементное поле для уникального идентификатора.
// 2. `photo_id`, `phone_id`, `role_id`: внешние ключи, ссылающиеся на соответствующие таблицы (`photos`, `phones`, `roles`). Они включают каскадное удаление (`onDelete('CASCADE')`), что означает, что при удалении записи в родительской таблице соответствующая запись в таблице `accounts` также будет удалена.
// 3. `name`: строковое поле для имени, обязательно для заполнения.
// 4. `email`: строковое поле для email, обязательно для заполнения и уникальное.
// 5. `password`: строковое поле для пароля, обязательно для заполнения.
// 6. `online`: булево поле, по умолчанию `false`.
// 7. `created_at` и `updated_at`: временные метки с использованием часовых поясов (`useTz: true`), по умолчанию текущая дата и время.

export default class extends BaseSchema {
  protected tableName = 'accounts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      // table.integer('photo_id').unsigned().references('id').inTable('photos').onDelete('CASCADE')
      // table.integer('phone_id').unsigned().references('id').inTable('phones').onDelete('CASCADE')
      // table.integer('role_id').unsigned().references('id').inTable('roles').onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table.boolean('online').defaultTo(false)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}