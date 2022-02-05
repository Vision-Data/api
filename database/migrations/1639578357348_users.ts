import BaseSchema from "@ioc:Adonis/Lucid/Schema";

export default class Users extends BaseSchema {
  protected tableName = "users";

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid("id")
        .primary()
        .defaultTo(this.db.rawQuery("gen_random_uuid()").knexQuery);

      table.string("email").notNullable();
      table.string("password");
      table.string("full_name").notNullable();
      table.string("provider_id");
      table.string("provider").notNullable();

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp("created_at", { useTz: true });
      table.timestamp("updated_at", { useTz: true });
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
