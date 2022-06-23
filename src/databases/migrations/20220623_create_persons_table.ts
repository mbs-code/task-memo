import { Kysely } from 'kysely'

export async function up (db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('persons')
    .addColumn('id', 'integer', col => col.primaryKey())
    .addColumn('first_name', 'text', col => col.notNull())
    .addColumn('last_name', 'text')
    .execute()
}

export async function down (db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('persons').execute()
}
