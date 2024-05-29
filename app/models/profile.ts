import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import Account from './account.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'


export default class Profile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare accountId: number

  @column.dateTime()
  declare dateBirth: DateTime

  @column()
  declare sex: string

  @column()
  declare growth: number

  @column()
  declare weight: number

  @column()
  declare children: string

  @column()
  declare applicationActivity: number

  @column()
  declare profession: string

  @column()
  declare education: string

  @column()
  declare religious: string

  @column()
  declare eyeColor: string

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Account)
  declare account: BelongsTo<typeof Account>
}