import { BaseSchema } from '@adonisjs/lucid/schema'

// 1. `id`: автоинкрементное поле для уникального идентификатора.
// 2. `interest_id`, `sport_id`: внешние ключи, ссылающиеся на соответствующие таблицы (`interests`, `sports`). Они включают каскадное удаление (`onDelete('CASCADE')`), что означает, что при удалении записи в родительской таблице соответствующая запись в таблице `profiles` также будет удалена.
// 3. `date_birth`: временная метка для даты рождения, с использованием часового пояса (`useTz: true`).
// 4. `sex`: строковое поле для пола.
// 5. `growth`: целочисленное поле для роста.
// 6. `weight`: целочисленное поле для веса.
// 7. `children`: строковое поле для информации о наличии детей.
// 8. `application_activity`: поле с плавающей точкой для активности в приложении.
// 9. `profession`, `education`, `religious`, `eye_color`: строковые поля для профессии, образования, религиозных убеждений и цвета глаз соответственно.
// 10. `description`: текстовое поле для описания.
// 11. `created_at` и `updated_at`: временные метки с использованием часовых поясов (`useTz: true`), по умолчанию текущая дата и время.

export default class extends BaseSchema {
  protected tableName = 'profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id') // Primary key
      table.integer('account_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE')
      // table.integer('interest_id').unsigned().references('id').inTable('interests').onDelete('CASCADE')
      // table.integer('sport_id').unsigned().references('id').inTable('sports').onDelete('CASCADE')
      table.timestamp('date_birth', { useTz: true })
      table.string('sex', 255)
      table.integer('growth')
      table.integer('weight')
      table.string('children', 255)
      table.float('application_activity')
      table.string('profession', 255)
      table.string('education', 255)
      table.string('religious', 255)
      table.string('eye_color', 255)
      table.text('description')

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}