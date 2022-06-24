import * as Kysely from 'kysely'

export interface Tag {
  id: Kysely.Generated<number>
  name: string
  color?: string
  is_pinned: boolean
  priority: number
  parent_tag_id?: number
  path?: string

  created_at: Date
  updated_at: Date
}
