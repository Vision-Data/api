import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Invitations extends BaseSchema {
  protected tableName = 'invitations'

  public async up() {
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

      table
        .uuid('workspace_id')
        .references('id')
        .inTable('workspaces')
        .onDelete('CASCADE')
        .notNullable()

      table.timestamp('created_at', { useTz: true })
      table
        .timestamp('expired_at', { useTz: true })
        .notNullable()
        .defaultTo(this.db.rawQuery("NOW() + INTERVAL '1 hour'").knexQuery)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
