import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import Account from './account.js'
import Profile from './profile.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare account_id: number

  @column()
  declare profile_id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @manyToMany(() => Account, {
    pivotTable: 'users',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'account_id'
  })
  declare accounts: ManyToMany<typeof Account>

  @manyToMany(() => Profile, {
    pivotTable: 'users',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'profile_id'
  })
  declare profiles: ManyToMany<typeof Profile>

}