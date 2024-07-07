import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Permission from './permission.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Account from './account.js'

export default class Role extends BaseModel {
  @column({ isPrimary: true }) // Идентификатор роли
  declare id: number

  @column() // Название роли, например: manager
  declare role_name: string

  @column() // Описание роли, необязательное поле
  declare description?: string

  @column.dateTime({ autoCreate: true }) // Дата и время создания записи
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true }) // Дата и время последнего обновления записи
  declare updatedAt: DateTime

  /**
   * Связи
   */
  @hasMany(() => Permission) // Отношение "имеет много разрешений"
  declare permissions: HasMany<typeof Permission>

  @hasMany(() => Account) // Отношение "имеет много аккаунтов"
  declare accounts: HasMany<typeof Account>
}
