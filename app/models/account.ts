import { DateTime } from 'luxon'
import Profile from './profile.js'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { 
  BaseModel,
  column,
  manyToMany,
  // belongsTo,
} from '@adonisjs/lucid/orm'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
// import type { BelongsTo } from '@adonisjs/lucid/types/relations'
// import Photo from './Photo'
// import Phone from './Phone'
// import Role from './Role'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class Account extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare photoId: number

  @column()
  declare phoneId: number

  @column()
  declare roleId: number

  @column()
  declare name: string

  @column()
  declare email: string

  @column()
  declare password: string

  @column()
  declare online: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  
  @manyToMany(() => Profile, {
    pivotTable: 'users',
    pivotForeignKey: 'account_id',
    pivotRelatedForeignKey: 'profile_id'
  })
  declare profiles: ManyToMany<typeof Profile>
  
  @manyToMany(() => User, {
    pivotTable: 'users',
    pivotForeignKey: 'account_id',
    pivotRelatedForeignKey: 'user_id'
  })
  declare users: ManyToMany<typeof User>

  // @belongsTo(() => Photo)
  // declare photo: BelongsTo<typeof Photo>

  // @belongsTo(() => Phone)
  // declare phone: BelongsTo<typeof Phone>

  // @belongsTo(() => Role)
  // declare role: BelongsTo<typeof Role>
  static accessTokens = DbAccessTokensProvider.forModel(Account)

}

