export interface Tag {
  id: number
  name: string
  color?: string
  is_pinned: boolean // default
  priority: number // default
  parent_tag_id?: number
  path?: string // readonly

  created_at: Date
  updated_at: Date
}
