import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Workspaces extends BaseSchema {
  protected tableName = 'workspaces'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table.string('name').notNullable()

      table.json('environment_variables').nullable()
      table.text('logo').nullable()
      table.string('color').nullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
