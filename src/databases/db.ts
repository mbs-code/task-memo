import * as Kysely from 'kysely'
import { TauriSqliteDialect } from './libs/TauriSqliteDialect'
import { Person } from './models/Person'

// tables
interface Tables {
  person: Person
}

// singleton connection
class Database {
  private static instance: Kysely.Kysely<Tables>

  static getInstance () {
    if (!Database.instance) {
      const db = new Kysely.Kysely<Tables>({
        dialect: new TauriSqliteDialect({
          path: 'sqlite:./test.db',
        })
      })
      Database.instance = db
    }

    return Database.instance
  }
}

export default Database.getInstance()
