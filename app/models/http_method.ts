import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

// Модель для HTTP методов, используется для организации авторизации, ролей, доступа и тп
export default class HttpMethod extends BaseModel {
  @column({ isPrimary: true }) // Идентификатор HTTP метода
  declare id: number

  @column() // Наименование HTTP метода, например: GET, POST
  declare name: string

  @column() // Категория HTTP метода, например: Обновления (patch, put, update)
  declare category: string

  @column.dateTime({ autoCreate: true }) // Дата и время создания записи
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true }) // Дата и время последнего обновления записи
  declare updatedAt: DateTime
}
