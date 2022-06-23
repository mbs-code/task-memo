import * as Kysely from 'kysely'

export interface Persons {
  id: Kysely.Generated<number>
  first_name: string
  last_name: string | null
}
