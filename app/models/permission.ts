import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import Role from './role.js'
import PermissionMethod from './permission_method.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

export default class Permission extends BaseModel {
  @column({ isPrimary: true }) // Идентификатор разрешения
  declare id: number

  @column() // Идентификатор роли, к которой привязано данное разрешение
  declare role_id: number

  @column() // Идентификатор ресурса, для которого установлено данное разрешение
  declare resource_id: number

  @column.dateTime({ autoCreate: true }) // Дата и время создания записи
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true }) // Дата и время последнего обновления записи
  declare updatedAt: DateTime

  /**
   * Связи
   */
  @belongsTo(() => Role) // Отношение "принадлежит роли"
  declare role: BelongsTo<typeof Role>

  @hasMany(() => PermissionMethod) // Отношение "имеет много методов разрешений"
  declare permissionMethods: HasMany<typeof PermissionMethod>
}
