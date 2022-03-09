import { RoleEnum } from './../../app/Enums/RoleEnum'
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class WorkspaceUsers extends BaseSchema {
  protected tableName = 'workspace_users'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('user_id')
        .primary()
        .unsigned()
        .references('users.id')
        .onDelete('NULL')
        .notNullable()

      table
        .uuid('workspace_id')
        .primary()
        .unsigned()
        .references('workspaces.id')
        .onDelete('CASCADE')
        .notNullable()

      table
        .enum('role', Object.values(RoleEnum))
        .defaultTo(RoleEnum.MEMBER)
        .notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('joined_at', { useTz: true }).notNullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
