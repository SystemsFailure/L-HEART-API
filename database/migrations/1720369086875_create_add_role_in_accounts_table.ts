import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'accounts'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('role_id').unsigned().references('id').inTable('roles').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, table => {
      table.dropColumn('role_id')
    })
  }
}