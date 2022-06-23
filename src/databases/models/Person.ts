import * as Kysely from 'kysely'

export interface Person {
  id: Kysely.Generated<number>
  first_name: string
  last_name: string | null
}
