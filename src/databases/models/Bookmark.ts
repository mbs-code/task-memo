import * as Kysely from 'kysely'

export interface Bookmark {
  id: Kysely.Generated<number>
  text: string
  color?: string
  priority: number

  created_at: Date
  updated_at: Date
}
