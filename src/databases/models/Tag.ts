export interface Tag {
  id: number
  name: string
  color?: string
  is_pinned: boolean // default
  priority: number // default
  tag_group_id?: number

  created_at: Date
  updated_at: Date
}
