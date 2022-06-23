/* eslint-disable import/named */

import {
  Kysely,
  Migration,
  Migrator,
} from 'kysely'
import { TauriSqliteDialect } from './libs/TauriSqliteDialect'
import { BuildinMigrationProvider } from './libs/BuildinMigrationProvider'

import { Report } from './models/Report'
import * as CreateInitTable from './migrations/20220623_create_init_table'

// tables
export interface Tables {
  reports: Report
}

// migrations
export const migrations: Record<string, Migration> = {
  '20220623_create_init_table': CreateInitTable,
}

// singleton connection
export class Database {
  static path = 'sqlite:./test.db'

  static #instance: Kysely<Tables>
  static #migrator: Migrator

  static getInstance () {
    if (!this.#instance) {
      const db = new Kysely<Tables>({
        dialect: new TauriSqliteDialect({
          path: this.path,
        })
      })

      const migrator = new Migrator({
        db,
        provider: new BuildinMigrationProvider()
      })

      this.#instance = db
      this.#migrator = migrator
    }

    return this.#instance
  }

  static getMigrator () {
    if (!this.#migrator) {
      this.getInstance()
    }

    return this.#migrator
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
    // 全テーブルの削除
    const tables = await db.introspection.getTables()
    for (const table of tables) {
      await db.schema.dropTable(table.name).execute()
    }
    await db.schema.dropTable('kysely_migration').execute()
    await db.schema.dropTable('kysely_migration_lock').execute()
  }
}

export const db = Database.getInstance()
export const migrator = Database.getMigrator()
