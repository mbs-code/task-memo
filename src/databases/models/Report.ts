import * as Kysely from 'kysely'

export interface Report {
  id: Kysely.Generated<number>
  text: string
  created_at: Date
  updated_at: Date
}
