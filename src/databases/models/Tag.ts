export interface Tag {
  id: number
  name: string
  color?: string
  is_pinned: boolean
  priority: number
  parent_tag_id?: number
  path?: string // readonly

  created_at: Date
  updated_at: Date
}
