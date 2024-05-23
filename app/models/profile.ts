import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Account from './account.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Profile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

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

  // @belongsTo(() => Interests)
  // declare interes: BelongsTo<typeof Interests>

  // @belongsTo(() => Sports)
  // declare sport: BelongsTo<typeof Sports>

  @manyToMany(() => Account, {
    pivotTable: 'users',
    pivotForeignKey: 'profile_id',
    pivotRelatedForeignKey: 'account_id'
  })
  declare accounts: ManyToMany<typeof Account>

  @manyToMany(() => User, {
    pivotTable: 'users',
    pivotForeignKey: 'profile_id',
    pivotRelatedForeignKey: 'user_id'
  })
  declare users: ManyToMany<typeof User>
}