import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddAvatarUrlUsers extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('avatar_url')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('avatar_url')
    })
  }
}
