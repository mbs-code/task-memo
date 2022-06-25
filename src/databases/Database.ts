/* eslint-disable import/named */

import {
  Kysely,
  Migration,
  Migrator,
} from 'kysely'
import { TauriSqliteDialect } from './libs/TauriSqliteDialect'
import { BuildinMigrationProvider } from './libs/BuildinMigrationProvider'

import * as CreateInitTable from './migrations/20220623_create_init_table'

import { Report } from '~~/src/databases/models/Report'
import { Tag } from '~~/src/databases/models/Tag'
import { ReportTag } from '~~/src/databases/models/ReportTag'
import { Bookmark } from '~~/src/databases/models/Bookmark'

export type Nullable<T, D extends keyof T> = Pick<T, Exclude<keyof T, D>> & Partial<Pick<T, D>>
export type SystemColumns = 'id' | 'created_at' | 'updated_at' | 'deleted_at'

// tables
export interface Tables {
  reports: Report
  tags: Tag
  report_tags: ReportTag

  bookmarks: Bookmark
}

// migrations
export const migrations: Record<string, Migration> = {
  '20220623_create_init_table': CreateInitTable,
}

// singleton connection
export class Database {
  static path = 'sqlite:./test.db'
  static debug = false

  static #instance: Kysely<Tables>
  static #migrator: Migrator

  static getInstance () {
    if (!this.#instance) {
      const db = new Kysely<Tables>({
        dialect: new TauriSqliteDialect({
          path: this.path,
          debug: this.debug,
        })
      })

      const migrator = new Migrator({
        db,
        provider: new BuildinMigrationProvider()
      })

      this.#instance = db
      this.#migrator = migrator
    }

    return {
      db: this.#instance,
      migrator: this.#migrator,
    }
  }

  static async destroy () {
    const db = this.#instance
    if (db) {
      await db.destroy()
      this.#instance = null
      this.#migrator = null
    }
  }

  static async dbWipe () {
    const db = this.#instance

    // 全テーブルの削除
    const tables = await db.introspection.getTables()
    for (const table of tables) {
      await db.schema.dropTable(table.name).execute()
    }
    await db.schema.dropTable('kysely_migration').execute()
    await db.schema.dropTable('kysely_migration_lock').execute()
  }
}
