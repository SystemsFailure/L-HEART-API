import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { 
  BaseModel,
  belongsTo,
  column,
} from '@adonisjs/lucid/orm'
import Account from './account.js'

export default class ApiToken extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare tokenable_id: number

    @column()
    declare name: string

    @column()
    declare type: string

    @column()
    declare hash: string

    @column.dateTime({ autoCreate: true })
    declare expiresAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare createdAt: DateTime

    /**
     * Связи
     */
    @belongsTo(() => Account)
    declare account: BelongsTo<typeof Account>
}

