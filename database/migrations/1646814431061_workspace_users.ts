import { RoleEnum } from './../../app/Enums/RoleEnum'
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class WorkspaceUsers extends BaseSchema {
  protected tableName = 'workspace_users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
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

      table.primary(['user_id', 'workspace_id'])

      table
        .enum('role', Object.values(RoleEnum))
        .defaultTo(RoleEnum.MEMBER)
        .notNullable()

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
