/* eslint-disable import/named */

import {
  Kysely,
  Migration,
  Migrator,
} from 'kysely'
import { TauriSqliteDialect } from './libs/TauriSqliteDialect'
import { BuildinMigrationProvider } from './libs/BuildinMigrationProvider'

import { Persons } from './models/Persons'
import * as CreatePersonsTable from './migrations/20220623_create_persons_table'

// tables
export interface Tables {
  persons: Persons
}

// migrations
export const migrations: Record<string, Migration> = {
  '20220623_create_persons_table': CreatePersonsTable,
}

// singleton connection
class Database {
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
}

export const db = Database.getInstance()
export const migrator = Database.getMigrator()
