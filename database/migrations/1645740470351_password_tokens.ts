import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class PasswordTokens extends BaseSchema {
  protected tableName = 'password_tokens'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('id')
        .primary()
        .defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      table
        .uuid('user_id')
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
        .notNullable()

      table.uuid('token').notNullable().index()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).notNullable()
      table
        .timestamp('expired_at', { useTz: true })
        .notNullable()
        .defaultTo(this.db.rawQuery('NOW() + INTERVAL \'10 minutes\'').knexQuery)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
