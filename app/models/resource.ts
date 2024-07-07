import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

// Модель Ресурсов, это могут быть вьюшки, фрагменты, компоненты, представления, по сути просто view-ки на клиентах
export default class Resource extends BaseModel {
  @column({ isPrimary: true }) // Идентификатор ресурса
  declare id: number

  @column() // Название ресурса, например: "Statistics"
  declare name: string

  @column() // Путь к ресурсу, например: https://statistics
  declare path: string

  @column() // Секция, к которой принадлежит ресурс, например: AUTH (для авторизации и регистрации)
  declare section?: string

  @column() // Параметры запроса в URL ресурса
  declare params?: string

  @column() // Теги, связанные с ресурсом
  declare tag?: string

  @column() // Протокол, по которому доступен ресурс: http, https, socket и т.д.
  declare protocol?: string

  @column.dateTime({ autoCreate: true }) // Дата и время создания записи
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true }) // Дата и время последнего обновления записи
  declare updatedAt: DateTime
}
