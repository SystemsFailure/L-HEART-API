import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('account_id').unsigned().references('id').inTable('accounts').onDelete('CASCADE')
      table.integer('profile_id').unsigned().references('id').inTable('profiles').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('account_id')
      table.dropColumn('profile_id')
    })
  }
}