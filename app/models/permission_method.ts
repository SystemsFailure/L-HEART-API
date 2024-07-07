import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import Permission from './permission.js'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import HttpMethod from './http_method.js'

export default class PermissionMethod extends BaseModel {
  @column({ isPrimary: true }) // Идентификатор записи
  declare id: number

  @column() // Идентификатор разрешения, к которому относится данный метод
  declare permission_id: number

  @column() // Идентификатор HTTP метода, связанного с данным разрешением
  declare method_id: number

  @column.dateTime({ autoCreate: true }) // Дата и время создания записи
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true }) // Дата и время последнего обновления записи
  declare updatedAt: DateTime

  /**
   * Связи
   */
  @belongsTo(() => Permission) // Отношение "принадлежит к разрешению"
  declare permission: BelongsTo<typeof Permission>

  @manyToMany(() => HttpMethod) // Многие ко многим с HTTP методами через таблицу permission_methods
  declare httpMethods: ManyToMany<typeof HttpMethod>
}
