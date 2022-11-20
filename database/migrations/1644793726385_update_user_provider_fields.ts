import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class UpdateUserProviderFields extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('provider').nullable().alter()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('provider')
    })
  }
}
