import { Kysely } from 'kysely'

export async function up (db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('tag_groups')
    .addColumn('id', 'integer', col => col.primaryKey())
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('color', 'text')
    .addColumn('priority', 'integer', col => col.notNull().defaultTo(0))
    .addColumn('tag_group_id', 'integer') // 親ID
    .addColumn('created_at', 'datetime', col => col.notNull())
    .addColumn('updated_at', 'datetime', col => col.notNull())
    .execute()

  await db.schema
    .createTable('tags')
    .addColumn('id', 'integer', col => col.primaryKey())
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('color', 'text')
    .addColumn('is_pinned', 'boolean', col => col.notNull().defaultTo(false))
    .addColumn('priority', 'integer', col => col.notNull().defaultTo(0))
    .addColumn('tag_group_id', 'integer')
    .addColumn('created_at', 'datetime', col => col.notNull())
    .addColumn('updated_at', 'datetime', col => col.notNull())
    .execute()

  await db.schema
    .createTable('reports')
    .addColumn('id', 'integer', col => col.primaryKey())
    .addColumn('text', 'text', col => col.notNull())
    .addColumn('created_at', 'datetime', col => col.notNull())
    .addColumn('updated_at', 'datetime', col => col.notNull())
    .addColumn('deleted_at', 'datetime')
    .execute()

  await db.schema
    .createTable('report_tags')
    .addColumn('id', 'integer', col => col.primaryKey())
    .addColumn('report_id', 'integer', col => col.notNull())
    .addColumn('tag_id', 'integer', col => col.notNull())
    .addColumn('created_at', 'datetime', col => col.notNull())
    .addColumn('updated_at', 'datetime', col => col.notNull())
    .execute()

  await db.schema
    .createTable('bookmarks')
    .addColumn('id', 'integer', col => col.primaryKey())
    .addColumn('name', 'text', col => col.notNull())
    .addColumn('json', 'text', col => col.notNull())
    .addColumn('color', 'text')
    .addColumn('priority', 'integer', col => col.notNull().defaultTo(0))
    .addColumn('created_at', 'datetime', col => col.notNull())
    .addColumn('updated_at', 'datetime', col => col.notNull())
    .execute()
}

export async function down (db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('bookmarks').ifExists().execute()

  await db.schema.dropTable('report_tags').ifExists().execute()
  await db.schema.dropTable('tags').ifExists().execute()
  await db.schema.dropTable('reports').ifExists().execute()
}
